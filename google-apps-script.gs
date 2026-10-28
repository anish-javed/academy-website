/**
 * Zenith Academy - Google Apps Script (receives the website forms)
 *
 * How it works:
 *  - The website sends each form to this script's web address (a "POST" request).
 *  - doPost() reads the answers and writes ONE new row in the right tab of your sheet:
 *      admissions -> tab "Admissions"
 *      enquiries  -> tab "Enquiries"
 *  - Every row gets a timestamp in Pakistan time.
 *  - If a tab is empty, the header row is created automatically.
 *  - After the row is saved, an email alert is sent to the script owner (your own
 *    Google account, found automatically - no email address is written in this file).
 *
 * Steps to install are in SETUP-GOOGLE-SHEET.md.
 * IMPORTANT: create this script from INSIDE your Google Sheet:
 *            Extensions > Apps Script.
 */

var TIME_ZONE = 'Asia/Karachi';   // Pakistan time

// Which tab and which columns each form uses.
// "field" must match the names the website sends.
var FORMS = {
  admission: {
    tab: 'Admissions',
    columns: [
      { header: 'Timestamp (Pakistan time)', field: '_timestamp' },
      { header: 'Student Name',              field: 'studentName' },
      { header: 'Father/Guardian Name',      field: 'guardianName' },
      { header: 'Date of Birth',             field: 'dob' },
      { header: 'Class Applying For',        field: 'classApplying' },
      { header: 'Program',                   field: 'program' },
      { header: 'Previous School',           field: 'previousSchool' },
      { header: 'Last Exam %',               field: 'lastPercentage' },
      { header: 'Preferred Shift',           field: 'shift' },
      { header: 'Phone',                     field: 'phone' },
      { header: 'Email',                     field: 'email' },
      { header: 'Area of Lahore',            field: 'area' },
      { header: 'Heard About Us',            field: 'heardAbout' },
      { header: 'Consent to Contact',        field: 'consent' }
    ]
  },
  enquiry: {
    tab: 'Enquiries',
    columns: [
      { header: 'Timestamp (Pakistan time)', field: '_timestamp' },
      { header: 'Name',                      field: 'name' },
      { header: 'I am a',                    field: 'iam' },
      { header: 'Phone',                     field: 'phone' },
      { header: 'Email',                     field: 'email' },
      { header: 'Topic',                     field: 'topic' },
      { header: 'Message',                   field: 'message' }
    ]
  }
};

var MAX_LENGTH = 1500;   // longest text we accept in one cell

/** Receives the form data sent by the website. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // If two people press Send at the same moment, wait in line (no mixed-up rows).
    lock.waitLock(20000);

    var p = (e && e.parameter) ? e.parameter : {};

    // Spam robots fill the hidden "company_website" field. Pretend all is well, save nothing.
    if (p.company_website) return reply({ result: 'success' });

    var form = FORMS[p.formType];
    if (!form) return reply({ result: 'error', message: 'Unknown form type.' });

    // Very small safety check: the important fields must exist.
    var nameField = (p.formType === 'admission') ? 'studentName' : 'name';
    if (!p[nameField] || !p.phone) return reply({ result: 'error', message: 'Missing name or phone.' });

    var sheet = getSheet(form);
    var timestamp = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');

    var row = form.columns.map(function (col) {
      if (col.field === '_timestamp') return timestamp;
      return clean(p[col.field]);
    });
    sheet.appendRow(row);

    // The row is already saved. If the email fails, we still tell the website "success".
    try { sendAlert(p, form, timestamp); } catch (mailErr) { console.error('Email alert failed: ' + mailErr); }

    return reply({ result: 'success' });
  } catch (err) {
    return reply({ result: 'error', message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

/** Lets you test the web address by opening it in a browser. */
function doGet() {
  return reply({ result: 'ok', message: 'Zenith Academy form receiver is working.' });
}

/**
 * OPTIONAL: run this once from the editor (select "setupSheets" > Run).
 * It creates both tabs with their header rows and asks you to allow access.
 */
function setupSheets() {
  Object.keys(FORMS).forEach(function (key) { getSheet(FORMS[key]); });
}

/* ------------------------------------------------------------------ */

/** Emails the script owner a summary of the new form. */
function sendAlert(p, form, timestamp) {
  var owner = Session.getEffectiveUser().getEmail();   // the account that owns the script
  if (!owner) return;

  var isAdmission = (p.formType === 'admission');
  var subject = isAdmission
    ? 'New admission: ' + oneLine(p.studentName) + ' - ' + oneLine(p.program)
    : 'New enquiry: ' + oneLine(p.name) + ' - ' + oneLine(p.topic);

  // One line per detail. The timestamp is skipped here because it is shown at the top.
  var lines = [];
  form.columns.forEach(function (col) {
    if (col.field === '_timestamp') return;
    var value = String(p[col.field] === undefined || p[col.field] === null ? '' : p[col.field]).trim().substring(0, MAX_LENGTH);
    lines.push('- ' + col.header + ': ' + (value || '(not given)'));
  });

  var body = (isAdmission ? 'A new admission form was sent.' : 'A new enquiry was sent.') + '\n\n' +
    'Time (Pakistan): ' + timestamp + '\n\n' +
    lines.join('\n') + '\n\n' +
    'Open the Google Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  MailApp.sendEmail(owner, subject, body);
}

/** Makes a value safe for an email subject: one line, trimmed, not too long. */
function oneLine(value) {
  return String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim().substring(0, 80);
}

/** Finds the tab (creates it if missing) and adds the header row if the tab is empty. */
function getSheet(form) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(form.tab) || ss.insertSheet(form.tab);
  if (sheet.getLastRow() === 0) {
    var headers = form.columns.map(function (c) { return c.header; });
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0B1F4B').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Makes a value safe to store: text only, trimmed, not too long, no spreadsheet formulas. */
function clean(value) {
  if (value === undefined || value === null) return '';
  var text = String(value).trim().substring(0, MAX_LENGTH);
  // A cell that starts with = + - @ could run as a formula. Add a ' so it stays plain text.
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

/** Sends a small JSON answer back to the website. */
function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
