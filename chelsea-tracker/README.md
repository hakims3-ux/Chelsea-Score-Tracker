# Chelsea FC Scores Tracker 🔵

A full-stack web app to log and view Chelsea FC match results, built with **Express.js** (back-end) and vanilla HTML/CSS/JS (front-end), deployed on **Render**.

---

## Features

- **Live API** — Express serves `GET /api/items` and `POST /api/items`
- **Match Tracker** — Log opponent, score, date, competition, and goalscorers
- **Stats Bar** — Auto-calculated wins, draws, losses, goals for/against
- **Add Match Form** — POST new results directly to the API
- **Loading Indicator** — Spinner shown while fetching data
- **Error Handling** — User-friendly error banner with retry button
- **Responsive Design** — Works on mobile and desktop
- **Environment Variable** — Team name driven by `TEAM_NAME` env var

---

## Project Structure

```
chelsea-tracker/
├── server.js            # Express back-end
├── package.json
├── README.md
└── public/
    ├── index.html       # Front-end HTML
    ├── dashboard_project.js  # Front-end JS (fetch logic)
    └── style.css        # Styles
```

---

## Running Locally

```bash
# Install dependencies
npm install

# (Optional) Set environment variable
export TEAM_NAME="Chelsea FC"

# Start server
npm start
# → http://localhost:3000
```

---

## Environment Variable Setup

| Variable    | Description                              | Default       |
|-------------|------------------------------------------|---------------|
| `TEAM_NAME` | Displayed team name in the UI header     | `Chelsea FC`  |
| `PORT`      | Port the server listens on               | `3000`        |

### Setting variables on Render

1. Go to your service on [render.com](https://render.com)
2. Click **Environment** in the left sidebar
3. Add key `TEAM_NAME` with value `Chelsea FC` (or your preferred name)
4. Click **Save Changes** — Render redeploys automatically

---

## Deployment Steps (Render)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Chelsea tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chelsea-tracker.git
git push -u origin main
```

> **Important:** Add `node_modules/` to `.gitignore` first:
> ```
> echo "node_modules/" >> .gitignore
> ```

### 2. Create a Render Web Service

1. Go to [render.com](https://render.com) and sign in (free account works)
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure the service:
   - **Name:** `chelsea-tracker`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3. Add Environment Variables

In the Render dashboard → **Environment**:
```
TEAM_NAME = Chelsea FC
```

### 4. Deploy

Click **Create Web Service**. Render will:
- Pull your code from GitHub
- Run `npm install`
- Start the server with `npm start`

Your app will be live at:
```
https://chelsea-tracker.onrender.com
```
(URL will vary — check your Render dashboard)

### 5. Verify

- Visit your live URL — you should see the Chelsea tracker dashboard
- Add a match using the form and confirm it appears
- Check that the team name matches your `TEAM_NAME` environment variable

---

## API Reference

### `GET /api/items`

Returns all matches and a summary.

**Response:**
```json
{
  "teamName": "Chelsea FC",
  "summary": {
    "played": 5,
    "wins": 3,
    "draws": 1,
    "losses": 1,
    "goalsFor": 10,
    "goalsAgainst": 5
  },
  "matches": [
    {
      "id": 1,
      "opponent": "Arsenal",
      "date": "2025-04-20",
      "homeAway": "Home",
      "chelseaScore": 3,
      "opponentScore": 1,
      "competition": "Premier League",
      "scorer": "Cole Palmer (2), Nicolas Jackson",
      "result": "W"
    }
  ]
}
```

### `POST /api/items`

Add a new match result.

**Request body:**
```json
{
  "opponent": "Wolves",
  "date": "2025-05-01",
  "homeAway": "Away",
  "chelseaScore": 2,
  "opponentScore": 0,
  "competition": "Premier League",
  "scorer": "Palmer, Madueke"
}
```

**Response:** `201 Created` with the new match object including `result` field.

---

## Screenshots

> Add your own screenshots here after deployment:
> - `screenshots/dashboard.png` — Live app in the browser
> - `screenshots/render-deploy.png` — Render deployment panel
