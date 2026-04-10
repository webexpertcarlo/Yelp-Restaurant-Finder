# Yelp City Restaurants

Simple app to get nearby restaurant details.
Enter a city and get restaurant results from Yelp.

What you see:
- Name
- Rating
- Address
- Coordinates
- Copy address button

## Run locally
1. Clone repo to your local 
2. Install packages:
   - `npm install`
3. Create a `.env` file in the project root
4. Add your key in `.env`:
   - `YELP_API_KEY=your_yelp_api_key`
5. Start app:
   - `npm start`
6. Open in browser:
   - `http://localhost:5412`

If the key is missing, the app shows an error.

Example Result : 

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/78d3423c-323b-4a1a-95f7-254f83509be2" />

Important:
- `.env` is ignored by git (key stays private)
- Push `.env.example` only
- Other users must add their own Yelp key in `.env`
