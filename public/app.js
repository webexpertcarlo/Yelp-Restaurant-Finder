const form = document.getElementById("form");
const cityInput = document.getElementById("city");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    statusEl.textContent = "Enter a city first.";
    return;
  }

  statusEl.textContent = "Loading…";
  listEl.innerHTML = "";

  try {
    const url =
      "/api/restaurants?city=" + encodeURIComponent(city);
    const res = await fetch(url);
    const raw = await res.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      statusEl.textContent = "Bad response from server.";
      return;
    }

    if (!res.ok) {
      statusEl.textContent = data.error || "Something went wrong.";
      return;
    }

    const items = data.businesses || [];
    if (items.length === 0) {
      statusEl.textContent = "No restaurants found. Try another spelling or add the state.";
      return;
    }

    statusEl.textContent =
      "Showing " +
      items.length +
      (data.total > items.length ? " of " + data.total : "") +
      " (within ~5 mi of Yelp’s location point).";

    for (const b of items) {
      const li = document.createElement("li");
      li.className = "card";

      const title = document.createElement("div");
      title.className = "name";
      title.textContent = b.name;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent =
        "Rating: " + (b.rating != null ? b.rating + " ★" : "—") +
        (b.review_count != null ? " (" + b.review_count + " reviews)" : "");

      const addr = document.createElement("div");
      addr.className = "addr";
      addr.textContent = b.address || "Address not listed";

      const coords = document.createElement("div");
      coords.className = "coords";
      if (b.lat != null && b.lng != null) {
        coords.textContent = "Lat " + b.lat + ", Lng " + b.lng;
      } else {
        coords.textContent = "Coordinates unavailable";
      }

      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(addr);
      li.appendChild(coords);

      if (b.address) {
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Copy address";
        copyBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(b.address);
            copyBtn.textContent = "Copied";
            setTimeout(() => {
              copyBtn.textContent = "Copy address";
            }, 1200);
          } catch {
            copyBtn.textContent = "Copy failed";
            setTimeout(() => {
              copyBtn.textContent = "Copy address";
            }, 1200);
          }
        });
        li.appendChild(copyBtn);
      }

      if (b.url) {
        const a = document.createElement("a");
        a.href = b.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = "link";
        a.textContent = "Yelp page";
        li.appendChild(a);
      }

      listEl.appendChild(li);
    }
  } catch (err) {
    statusEl.textContent = "Network error. Is the server running?";
  }
});
