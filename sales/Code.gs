/**
 * ============================================================
 * DOM'S PANCIT – Google Apps Script Middleman (Code.gs)
 * ============================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project.
 * 2. Paste this entire file into the Code.gs editor.
 * 3. Go to Project Settings → Script Properties → Add:
 *    - Property: GITHUB_PAT    Value: (your GitHub Personal Access Token)
 * 4. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL → paste into index.html APPS_SCRIPT_URL
 *
 * NOTE: The GITHUB_PAT is NEVER exposed to the client.
 */

// ── CONFIG ──────────────────────────────────────────────────
const REPO_OWNER = "domspancit";
const REPO_NAME  = "domspancit.github.io";
const FILE_PATH  = "sales/data.json";
const BRANCH     = "main";

// Whitelisted emails → roles
// Owners can manage staff from the dashboard.
// Staff entries are stored in data.json under "staffAccounts"
const OWNER_EMAILS = [
  "jm.domspancit@gmail.com",
  "cecilhicbansevilla@gmail.com"
];

// ── HELPERS ─────────────────────────────────────────────────

function getGitHubPAT() {
  return PropertiesService.getScriptProperties().getProperty("GITHUB_PAT");
}

/**
 * Verify a Google ID token and return the user info.
 */
function verifyIdToken(idToken) {
  try {
    const url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    const payload = JSON.parse(resp.getContentText());
    return {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || ""
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if the user is authorized (owner or staff).
 * Returns { authorized, role, branch, name, email, picture }
 */
function checkAuthorization(email, data) {
  const emailLower = (email || "").toLowerCase();

  // Check if owner
  if (OWNER_EMAILS.map(e => e.toLowerCase()).includes(emailLower)) {
    return { authorized: true, role: "owner", branch: null, name: null };
  }

  // Check if staff (from data.json staffAccounts)
  const staffAccounts = data.staffAccounts || [];
  const staff = staffAccounts.find(s => (s.email || "").toLowerCase() === emailLower);
  if (staff) {
    return { authorized: true, role: "staff", branch: staff.branch, name: staff.username };
  }

  return { authorized: false };
}

// ── GITHUB API ──────────────────────────────────────────────

function ghGet() {
  const pat = getGitHubPAT();
  const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + FILE_PATH + "?ref=" + BRANCH;
  const resp = UrlFetchApp.fetch(url, {
    headers: {
      "Authorization": "Bearer " + pat,
      "Accept": "application/vnd.github.v3+json"
    },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) {
    return { data: { entries: [], staffAccounts: [] }, sha: null };
  }
  const json = JSON.parse(resp.getContentText());
  const content = Utilities.newBlob(Utilities.base64Decode(json.content)).getDataAsString();
  return { data: JSON.parse(content), sha: json.sha };
}

function ghSave(data, sha) {
  const pat = getGitHubPAT();
  const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + FILE_PATH;
  const content = Utilities.base64Encode(JSON.stringify(data, null, 2));
  const payload = {
    message: "POS update via Apps Script",
    content: content,
    branch: BRANCH
  };
  if (sha) payload.sha = sha;

  const resp = UrlFetchApp.fetch(url, {
    method: "put",
    headers: {
      "Authorization": "Bearer " + pat,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  return resp.getResponseCode() === 200 || resp.getResponseCode() === 201;
}

// ── CORS RESPONSE ───────────────────────────────────────────

function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── MAIN HANDLERS ───────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const idToken = body.idToken;

    // Verify token
    const user = verifyIdToken(idToken);
    if (!user) {
      return createJsonResponse({ ok: false, error: "Invalid token" });
    }

    // Get current data for auth check
    const gh = ghGet();
    const data = gh.data || { entries: [], staffAccounts: [] };

    // Check authorization
    const auth = checkAuthorization(user.email, data);
    if (!auth.authorized) {
      return createJsonResponse({ ok: false, error: "Unauthorized email: " + user.email });
    }

    // ─── AUTHENTICATE ───────────────
    if (action === "authenticate") {
      return createJsonResponse({
        ok: true,
        role: auth.role,
        branch: auth.branch,
        email: user.email,
        name: user.name || auth.name || user.email,
        picture: user.picture
      });
    }

    // ─── GET ENTRIES ────────────────
    if (action === "getEntries") {
      return createJsonResponse({
        ok: true,
        entries: data.entries || [],
        staffAccounts: auth.role === "owner" ? (data.staffAccounts || []) : undefined
      });
    }

    // ─── SAVE ENTRY ─────────────────
    if (action === "saveEntry") {
      const entry = body.entry;
      if (!entry || !entry.date || !entry.branch) {
        return createJsonResponse({ ok: false, error: "Missing entry data" });
      }

      // Duplicate check: 1 entry per store per day
      const existing = (data.entries || []).find(
        e => e.date === entry.date && e.branch === entry.branch
      );
      if (existing) {
        return createJsonResponse({
          ok: false,
          error: "An entry for " + entry.branch + " on " + entry.date + " already exists."
        });
      }

      entry.submittedBy = user.email;
      data.entries = data.entries || [];
      data.entries.push(entry);

      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved, error: saved ? null : "GitHub save failed" });
    }

    // ─── UPDATE ENTRY ───────────────
    if (action === "updateEntry") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Only owners can edit entries" });
      }
      const { id, patch } = body;
      data.entries = (data.entries || []).map(e => e.id === id ? Object.assign({}, e, patch) : e);
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved, entries: data.entries });
    }

    // ─── DELETE ENTRY ───────────────
    if (action === "deleteEntry") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Only owners can delete entries" });
      }
      const id = body.id;
      data.entries = (data.entries || []).filter(e => e.id !== id);
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved, entries: data.entries });
    }

    // ─── SAVE STAFF ACCOUNTS ────────
    if (action === "saveStaffAccounts") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Only owners can manage staff" });
      }
      data.staffAccounts = body.staffAccounts || [];
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved });
    }

    // ─── GET FULL DATA (owner only) ─
    if (action === "getFullData") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Owner access required" });
      }
      return createJsonResponse({ ok: true, data: data });
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action });

  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  // If no payload parameter, return API status
  if (!e.parameter || !e.parameter.payload) {
    return createJsonResponse({ ok: true, message: "Dom's Pancit API is running." });
  }

  // Parse payload sent via URL parameter (workaround for POST→GET redirect)
  try {
    const body = JSON.parse(e.parameter.payload);
    const action = body.action;
    const idToken = body.idToken;

    // Verify token
    const user = verifyIdToken(idToken);
    if (!user) {
      return createJsonResponse({ ok: false, error: "Invalid token" });
    }

    // Get current data for auth check
    const gh = ghGet();
    const data = gh.data || { entries: [], staffAccounts: [] };

    // Check authorization
    const auth = checkAuthorization(user.email, data);
    if (!auth.authorized) {
      return createJsonResponse({ ok: false, error: "Unauthorized email: " + user.email });
    }

    // ─── AUTHENTICATE ───────────────
    if (action === "authenticate") {
      return createJsonResponse({
        ok: true,
        role: auth.role,
        branch: auth.branch || null,
        name: auth.name || user.name,
        email: user.email,
        picture: user.picture,
        staff: auth.role === "owner" ? (data.staffAccounts || []) : null
      });
    }

    // ─── GET ENTRIES ────────────────
    if (action === "getEntries") {
      return createJsonResponse({ ok: true, entries: data.entries || [] });
    }

    // ─── SAVE ENTRY ─────────────────
    if (action === "saveEntry") {
      const entry = body.entry;
      if (!entry) return createJsonResponse({ ok: false, error: "No entry data" });

      entry.author = user.email;
      const existingIdx = (data.entries || []).findIndex(
        e => e.store === entry.store && e.date === entry.date
      );
      if (existingIdx >= 0) {
        data.entries[existingIdx] = entry;
      } else {
        data.entries = data.entries || [];
        data.entries.push(entry);
      }
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved });
    }

    // ─── DELETE ENTRY ───────────────
    if (action === "deleteEntry") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Owner access required" });
      }
      const store = body.store;
      const date = body.date;
      data.entries = (data.entries || []).filter(
        e => !(e.store === store && e.date === date)
      );
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved });
    }

    // ─── SAVE STAFF ACCOUNTS ────────
    if (action === "saveStaffAccounts") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Owner access required" });
      }
      data.staffAccounts = body.staffAccounts || [];
      const saved = ghSave(data, gh.sha);
      return createJsonResponse({ ok: saved });
    }

    // ─── GET FULL DATA (owner only) ─
    if (action === "getFullData") {
      if (auth.role !== "owner") {
        return createJsonResponse({ ok: false, error: "Owner access required" });
      }
      return createJsonResponse({ ok: true, data: data });
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action });

  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}
