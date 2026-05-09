/**
 * ============================================================
 * DOM'S PANCIT – Google Apps Script Middleman (Code.gs)
 * ============================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and open your existing project.
 * 2. Paste this entire file into the Code.gs editor.
 * 3. Deploy → Manage Deployments → Edit (pencil icon) → New Version → Deploy
 *    - It will ask for permissions to access Google Sheets. Click "Review Permissions" and "Allow".
 * 
 * Note: The first time it runs, it will create a new Google Sheet named
 * "Dom's Pancit POS Database" in your Google Drive automatically.
 */

// Whitelisted emails → roles
const OWNER_EMAILS = [
  "jm.domspancit@gmail.com",
  "cecilhicbansevilla@gmail.com"
];

// ── DATABASE HELPERS ─────────────────────────────────────────

function getDatabaseSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty("SPREADSHEET_ID");
  let ss;
  
  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch(e) {
      ss = null; // Maybe deleted
    }
  }
  
  if (!ss) {
    // Create new spreadsheet
    ss = SpreadsheetApp.create("Dom's Pancit POS Database");
    props.setProperty("SPREADSHEET_ID", ss.getId());
    
    // Setup Entries Sheet
    let entriesSheet = ss.getActiveSheet();
    entriesSheet.setName("Entries");
    entriesSheet.appendRow(["ID", "Date", "Branch", "Author", "Gross Sales", "Net PRF", "Full JSON Data"]);
    entriesSheet.setFrozenRows(1);
    
    // Setup StaffAccounts Sheet
    let staffSheet = ss.insertSheet("StaffAccounts");
    staffSheet.appendRow(["Email", "Username", "Branch", "Full JSON Data"]);
    staffSheet.setFrozenRows(1);
  }
  
  return ss;
}

function readAllData() {
  const ss = getDatabaseSheet();
  const entriesSheet = ss.getSheetByName("Entries");
  const staffSheet = ss.getSheetByName("StaffAccounts");
  
  let data = { entries: [], staffAccounts: [] };
  
  if (entriesSheet) {
    const rows = entriesSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][6]) {
        try { data.entries.push(JSON.parse(rows[i][6])); } catch(e) {}
      }
    }
  }
  
  if (staffSheet) {
    const rows = staffSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][3]) {
        try { data.staffAccounts.push(JSON.parse(rows[i][3])); } catch(e) {}
      }
    }
  }
  
  return data;
}

// Write the entire entries list back to the sheet
function writeEntries(entries) {
  const ss = getDatabaseSheet();
  let sheet = ss.getSheetByName("Entries");
  if (!sheet) sheet = ss.insertSheet("Entries");
  
  // Clear existing
  sheet.clear();
  sheet.appendRow(["ID", "Date", "Branch", "Author", "Gross Sales", "Net PRF", "Full JSON Data"]);
  sheet.setFrozenRows(1);
  
  if (entries && entries.length > 0) {
    const rows = entries.map(e => [
      e.id || "",
      e.date || "",
      e.branch || e.store || "",
      e.submittedBy || e.author || "",
      e.gross || 0,
      e.netPrf || 0,
      JSON.stringify(e)
    ]);
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }
}

// Append a single entry (more efficient than rewriting everything)
function appendEntry(entry) {
  const ss = getDatabaseSheet();
  let sheet = ss.getSheetByName("Entries");
  if (!sheet) sheet = ss.insertSheet("Entries");
  
  sheet.appendRow([
    entry.id || "",
    entry.date || "",
    entry.branch || entry.store || "",
    entry.submittedBy || entry.author || "",
    entry.gross || 0,
    entry.netPrf || 0,
    JSON.stringify(entry)
  ]);
}

// Write the staff list back to the sheet
function writeStaffAccounts(staffAccounts) {
  const ss = getDatabaseSheet();
  let sheet = ss.getSheetByName("StaffAccounts");
  if (!sheet) sheet = ss.insertSheet("StaffAccounts");
  
  sheet.clear();
  sheet.appendRow(["Email", "Username", "Branch", "Full JSON Data"]);
  sheet.setFrozenRows(1);
  
  if (staffAccounts && staffAccounts.length > 0) {
    const rows = staffAccounts.map(s => [
      s.email || "",
      s.username || "",
      s.branch || "",
      JSON.stringify(s)
    ]);
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
}

// ── HELPERS ─────────────────────────────────────────────────

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
 */
function checkAuthorization(email, data) {
  const emailLower = (email || "").toLowerCase();

  // Check if owner
  if (OWNER_EMAILS.map(e => e.toLowerCase()).includes(emailLower)) {
    return { authorized: true, role: "owner", branch: null, name: null };
  }

  // Check if staff
  const staffAccounts = data.staffAccounts || [];
  const staff = staffAccounts.find(s => (s.email || "").toLowerCase() === emailLower);
  if (staff) {
    return { authorized: true, role: "staff", branch: staff.branch, name: staff.username };
  }

  return { authorized: false };
}

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
    if (!user) return createJsonResponse({ ok: false, error: "Invalid token" });

    // Read current data
    const data = readAllData();

    // Check authorization
    const auth = checkAuthorization(user.email, data);
    if (!auth.authorized) return createJsonResponse({ ok: false, error: "Unauthorized email: " + user.email });

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
      if (!entry || !entry.date || !entry.branch) return createJsonResponse({ ok: false, error: "Missing entry data" });

      // Duplicate check: 1 entry per store per day
      const existing = (data.entries || []).find(e => e.date === entry.date && e.branch === entry.branch);
      if (existing) {
        return createJsonResponse({ ok: false, error: "An entry for " + entry.branch + " on " + entry.date + " already exists." });
      }

      entry.submittedBy = user.email;
      appendEntry(entry);
      return createJsonResponse({ ok: true, error: null });
    }

    // ─── UPDATE ENTRY ───────────────
    if (action === "updateEntry") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Only owners can edit entries" });
      const { id, patch } = body;
      data.entries = (data.entries || []).map(e => e.id === id ? Object.assign({}, e, patch) : e);
      writeEntries(data.entries);
      return createJsonResponse({ ok: true, entries: data.entries });
    }

    // ─── DELETE ENTRY ───────────────
    if (action === "deleteEntry") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Only owners can delete entries" });
      const id = body.id;
      data.entries = (data.entries || []).filter(e => e.id !== id);
      writeEntries(data.entries);
      return createJsonResponse({ ok: true, entries: data.entries });
    }

    // ─── SAVE STAFF ACCOUNTS ────────
    if (action === "saveStaffAccounts") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Only owners can manage staff" });
      writeStaffAccounts(body.staffAccounts || []);
      return createJsonResponse({ ok: true });
    }

    // ─── GET FULL DATA (owner only) ─
    if (action === "getFullData") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Owner access required" });
      return createJsonResponse({ ok: true, data: data });
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action });

  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  if (!e.parameter || !e.parameter.payload) {
    return createJsonResponse({ ok: true, message: "Dom's Pancit API is running securely via Google Sheets." });
  }

  // Parse payload sent via URL parameter (workaround for POST→GET redirect)
  try {
    const body = JSON.parse(e.parameter.payload);
    const action = body.action;
    const idToken = body.idToken;

    // Verify token
    const user = verifyIdToken(idToken);
    if (!user) return createJsonResponse({ ok: false, error: "Invalid token" });

    // Read current data
    const data = readAllData();

    // Check authorization
    const auth = checkAuthorization(user.email, data);
    if (!auth.authorized) return createJsonResponse({ ok: false, error: "Unauthorized email: " + user.email });

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
      
      const branchName = entry.branch || entry.store;
      const existingIdx = (data.entries || []).findIndex(
        e => (e.branch === branchName || e.store === branchName) && e.date === entry.date
      );
      
      if (existingIdx >= 0) {
        data.entries[existingIdx] = entry;
        writeEntries(data.entries);
      } else {
        appendEntry(entry);
      }
      return createJsonResponse({ ok: true });
    }

    // ─── DELETE ENTRY ───────────────
    if (action === "deleteEntry") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Owner access required" });
      const store = body.store;
      const date = body.date;
      data.entries = (data.entries || []).filter(
        e => !((e.branch === store || e.store === store) && e.date === date)
      );
      writeEntries(data.entries);
      return createJsonResponse({ ok: true });
    }

    // ─── SAVE STAFF ACCOUNTS ────────
    if (action === "saveStaffAccounts") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Owner access required" });
      writeStaffAccounts(body.staffAccounts || []);
      return createJsonResponse({ ok: true });
    }

    // ─── GET FULL DATA (owner only) ─
    if (action === "getFullData") {
      if (auth.role !== "owner") return createJsonResponse({ ok: false, error: "Owner access required" });
      return createJsonResponse({ ok: true, data: data });
    }

    return createJsonResponse({ ok: false, error: "Unknown action: " + action });

  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}
