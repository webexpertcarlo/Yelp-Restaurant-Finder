const path = require("path");
const express = require("express");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5412;
const YELP_KEY = process.env.YELP_API_KEY;

if (typeof fetch !== "function") {
  console.error("Need Node 18+ (built-in fetch).");
  process.exit(1);
}

const FIVE_MILES_M = 8047;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/restaurants", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) {
    return res.status(400).json({ error: "Enter a city." });
  }
  if (!YELP_KEY) {
    return res.status(500).json({
      error: "Missing YELP_API_KEY. Set it and restart the server.",
    });
  }

  const baseParams = {
    term: "restaurants",
    location: city,
    limit: "50",
    sort_by: "rating",
  };

  try {
    let params = new URLSearchParams({
      ...baseParams,
      radius: String(FIVE_MILES_M),
    });

    let r = await yelpSearch(params);
    let body = await readJsonBody(r);

    if (!r.ok && r.status === 400 && params.has("radius")) {
      params = new URLSearchParams(baseParams);
      r = await yelpSearch(params);
      body = await readJsonBody(r);
    }

    if (!r.ok) {
      const msg = yelpErrorText(body) || r.statusText || "Yelp request failed";
      return res.status(r.status >= 400 ? r.status : 502).json({ error: msg });
    }

    const businesses = Array.isArray(body.businesses) ? body.businesses : [];
    const list = businesses.map((b) => ({
      name: b.name,
      rating: b.rating,
      review_count: b.review_count,
      address: formatAddress(b.location),
      lat: b.coordinates?.latitude ?? null,
      lng: b.coordinates?.longitude ?? null,
      url: b.url,
    }));

    res.json({ total: body.total ?? list.length, businesses: list });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "Could not reach Yelp." });
  }
});

async function yelpSearch(params) {
  return fetch(
    "https://api.yelp.com/v3/businesses/search?" + params.toString(),
    {
      headers: {
        Authorization: "Bearer " + YELP_KEY,
        Accept: "application/json",
      },
    }
  );
}

async function readJsonBody(r) {
  const text = await r.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { _raw: text };
  }
}

function yelpErrorText(body) {
  if (!body || typeof body !== "object") return "";
  const e = body.error;
  if (typeof e === "string") return e;
  if (e && typeof e.description === "string") return e.description;
  if (e && typeof e.code === "string") return e.code;
  return "";
}

function formatAddress(loc) {
  if (!loc) return "";
  const parts = [loc.address1, loc.address2, loc.address3].filter(Boolean);
  const line = parts.join(", ");
  const cityLine = [loc.city, loc.state, loc.zip_code].filter(Boolean).join(" ");
  if (line && cityLine) return line + ", " + cityLine;
  return line || cityLine || "";
}

app.listen(PORT, () => {
  console.log("Open http://localhost:" + PORT);
  if (!YELP_KEY) {
    console.warn(
      "Warning: YELP_API_KEY is not set. Add it to .env or the environment, then restart."
    );
  }
});
