// dashboard_project.js
// Chelsea FC Scores Tracker — Front-End Logic
// Consumes live Express API endpoints: GET /api/items, POST /api/items

// ─── State ────────────────────────────────────────────────────
let formVisible = false;

// ─── On Page Load ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

// ─── Load & Render All Matches ────────────────────────────────
async function loadMatches() {
  showLoader(true);
  hideError();

  try {
    const response = await fetch("/api/items");

    // Handle HTTP-level errors
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    // Update team name from environment variable (via API response)
    document.getElementById("team-name").textContent = data.teamName;

    renderStats(data.summary);
    renderMatches(data.matches);
  } catch (err) {
    console.error("Failed to load matches:", err);
    showError();
  } finally {
    showLoader(false);
  }
}

// ─── Render Stats Bar ─────────────────────────────────────────
function renderStats(summary) {
  const fields = {
    "stat-played": summary.played,
    "stat-wins":   summary.wins,
    "stat-draws":  summary.draws,
    "stat-losses": summary.losses,
    "stat-gf":     summary.goalsFor,
    "stat-ga":     summary.goalsAgainst,
  };

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) {
      const numEl = el.querySelector(".stat-num");
      if (numEl) {
        // Animate count-up
        animateNumber(numEl, value);
      }
    }
  }
}

// ─── Count-up Animation ───────────────────────────────────────
function animateNumber(el, target) {
  let current = 0;
  const step = Math.ceil(target / 20);
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 40);
}

// ─── Render Match Cards ───────────────────────────────────────
function renderMatches(matches) {
  const container = document.getElementById("matchesContainer");
  container.innerHTML = "";

  if (!matches || matches.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:40px 0;">No matches logged yet. Add one above!</p>`;
    return;
  }

  matches.forEach((match, index) => {
    const card = createMatchCard(match, index);
    container.appendChild(card);
  });
}

// ─── Build a Single Match Card ────────────────────────────────
function createMatchCard(match, index) {
  const card = document.createElement("article");
  card.className = "match-card";
  card.style.animationDelay = `${index * 0.05}s`;

  // Format date nicely
  const dateObj = new Date(match.date + "T12:00:00"); // avoid timezone shift
  const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  card.innerHTML = `
    <div class="result-badge ${match.result}" title="${resultLabel(match.result)}">${match.result}</div>
    <div class="match-info">
      <div class="match-opponent">${escapeHtml(match.opponent)}</div>
      <div class="match-meta">
        <span class="tag">${escapeHtml(match.competition)}</span>
        <span>${escapeHtml(match.homeAway)}</span>
        <span>${dateStr}</span>
      </div>
      ${match.scorer && match.scorer !== "—"
        ? `<div class="scorers">⚽ ${escapeHtml(match.scorer)}</div>`
        : ""}
    </div>
    <div class="scoreline">
      <div class="score-nums">${match.chelseaScore}–${match.opponentScore}</div>
      <div class="score-vs">Chelsea vs Opp</div>
    </div>
  `;
  return card;
}

// ─── Submit New Match (POST /api/items) ───────────────────────
async function submitMatch() {
  const errorEl = document.getElementById("formError");
  errorEl.textContent = "";

  const opponent      = document.getElementById("f-opponent").value.trim();
  const date          = document.getElementById("f-date").value;
  const homeAway      = document.getElementById("f-homeaway").value;
  const competition   = document.getElementById("f-competition").value.trim() || "Premier League";
  const chelseaScore  = document.getElementById("f-chelsea").value;
  const opponentScore = document.getElementById("f-opponent-score").value;
  const scorer        = document.getElementById("f-scorers").value.trim();

  // Client-side validation
  if (!opponent) { errorEl.textContent = "Please enter the opponent name."; return; }
  if (!date)     { errorEl.textContent = "Please select a match date."; return; }
  if (chelseaScore === "") { errorEl.textContent = "Please enter Chelsea's score."; return; }
  if (opponentScore === "") { errorEl.textContent = "Please enter the opponent's score."; return; }

  const payload = {
    opponent,
    date,
    homeAway,
    competition,
    chelseaScore: Number(chelseaScore),
    opponentScore: Number(opponentScore),
    scorer: scorer || "—",
  };

  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Server error");
    }

    // Success: reset form, reload data
    resetForm();
    toggleForm();
    await loadMatches();
  } catch (err) {
    errorEl.textContent = `Error: ${err.message}`;
  }
}

// ─── Toggle Add-Match Form ────────────────────────────────────
function toggleForm() {
  formVisible = !formVisible;
  const form = document.getElementById("addForm");
  const btn  = document.getElementById("toggleFormBtn");

  if (formVisible) {
    form.style.display = "block";
    btn.textContent = "✕ Close";
    // Set today as default date
    document.getElementById("f-date").value = new Date().toISOString().split("T")[0];
  } else {
    form.style.display = "none";
    btn.textContent = "+ Add Match Result";
  }
}

// ─── Reset Form Fields ────────────────────────────────────────
function resetForm() {
  ["f-opponent", "f-date", "f-competition", "f-chelsea", "f-opponent-score", "f-scorers"]
    .forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("f-homeaway").value = "Home";
  document.getElementById("formError").textContent = "";
}

// ─── UI Helpers ───────────────────────────────────────────────
function showLoader(visible) {
  document.getElementById("loader").style.display = visible ? "flex" : "none";
}
function showError() {
  document.getElementById("errorBanner").style.display = "block";
}
function hideError() {
  document.getElementById("errorBanner").style.display = "none";
}

function resultLabel(r) {
  return r === "W" ? "Win" : r === "D" ? "Draw" : "Loss";
}

// Prevent XSS when inserting user-supplied data into innerHTML
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
