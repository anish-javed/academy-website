# How to connect the website to your Google Sheet

This guide is very simple. Take your time. It needs about 10 minutes.
You only do this **one time**.

**What happens in the end:** when someone sends a form on the website, a new row appears in your Google Sheet.

---

## Before you start

You need:
- A Google account (Gmail)
- The website folder `academy-website` on your computer

---

## Step 1: Make a new Google Sheet

1. Open your browser and go to **https://sheets.google.com**
2. Click the big **+ (Blank spreadsheet)** button.
3. At the top left, click the name "Untitled spreadsheet" and change it to **Zenith Academy Forms**.

You do not need to make any tabs or headings. The script will do that for you.

---

## Step 2: Open the Apps Script editor

1. In your new sheet, click the menu **Extensions**.
2. Click **Apps Script**.
3. A new tab opens. It shows a file named `Code.gs` with a little bit of code.

> Important: you must open Apps Script **from inside the sheet** (like above). Do not go to script.google.com directly.

---

## Step 3: Paste the script

1. On your computer, open the file **`google-apps-script.gs`** (in the website folder). You can open it with Notepad.
2. Press **Ctrl + A** (select all), then **Ctrl + C** (copy).
3. Go back to the Apps Script tab. Click inside the code box.
4. Press **Ctrl + A** (this selects the old code), then **Ctrl + V** (this replaces it with ours).
5. Click the **Save** button (the little disk icon) or press **Ctrl + S**.
6. (Optional) At the top left, click "Untitled project" and name it **Zenith Forms**.

---

## Step 4: Give permission (run it once)

1. At the top, find the drop-down list that shows a function name. Choose **setupSheets**.
2. Click **Run**.
3. A box says **"Authorization required"**. Click **Review permissions**.
4. Choose your Google account.
5. You may see a warning: **"Google hasn't verified this app"**. This is normal, because you made the script yourself.
   - Click **Advanced**.
   - Click **Go to Zenith Forms (unsafe)**.
   - Click **Allow**.
6. Go back to your Google Sheet. You should now see two tabs at the bottom: **Admissions** and **Enquiries**, each with a heading row. 

---

## Step 5: Make it a web app (the "post box")

1. In the Apps Script tab, click the blue **Deploy** button (top right).
2. Click **New deployment**.
3. Click the little **gear icon** next to "Select type" and choose **Web app**.
4. Fill in like this:
   - **Description:** `Zenith forms` (anything you like)
   - **Execute as:** **Me** (your email)
   - **Who has access:** **Anyone**
5. Click **Deploy**.
6. You will see **Web app URL**. It looks like this:
   `https://script.google.com/macros/s/AKfycb.........../exec`
7. Click **Copy** to copy the URL.

> Why "Anyone"? Visitors of your website are not logged in to Google. "Anyone" only lets them **send** a form. They can **not** see or open your sheet. Your sheet stays private.

---

## Step 6: Put the URL in the website

1. In the website folder, open **`js/config.js`** with Notepad (or VS Code).
2. You will see this line:

   ```js
   const SHEET_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
   ```

3. Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the URL you copied. **Keep the quote marks.** It should look like:

   ```js
   const SHEET_URL = "https://script.google.com/macros/s/AKfycb.........../exec";
   ```

4. Save the file.

---

## Step 7: Test it

1. **Quick test of the address:** paste the URL in your browser. You should see:
   `{"result":"ok","message":"Zenith Academy form receiver is working."}`
2. Open `index.html` from the website folder in your browser (double-click it).
3. Go to **Enquiry**, fill the form, and press **Send enquiry**.
4. You should see the paper plane fly away and a thank-you message.
5. Look at your Google Sheet, tab **Enquiries**. A new row is there, with the time in Pakistan time.
6. Now try the **Admission** form the same way. Its row goes into the **Admissions** tab.

Everything works. 

---

## If you change the script later

If you edit the code in Apps Script, the live web app does **not** change by itself. You must publish a new version:

1. Click **Deploy** > **Manage deployments**.
2. Click the **pencil (edit)** icon.
3. Under **Version**, choose **New version**.
4. Click **Deploy**.

The URL stays the same.

---

## Problems? Try this

| What you see | What to do |
|---|---|
| The form says **"The form is not connected yet"** | `SHEET_URL` in `js/config.js` is still the placeholder, or it is not a full `https://script.google.com/.../exec` address. Check Step 6. |
| The form says **"Sorry, we could not send your form"** | Check your internet. Then check that **Who has access** is **Anyone** (Step 5). If you changed the script, make a **New version** (see above). |
| Browser shows a Google sign-in page for the URL | **Who has access** is not "Anyone". Edit the deployment and fix it. |
| Plane flies but no row in the sheet | The URL may belong to an old deployment. Copy the URL again from **Deploy > Manage deployments**. |
| Row appears but a cell starts with `'` | This is on purpose. It keeps text that starts with `=`, `+`, `-` or `@` from becoming a formula. |

To see details of an error: in your browser press **F12**, open the **Console** tab, and send the form again.

---

## Good to know

- The **timestamp** uses Pakistan time (Asia/Karachi).
- You can add colours, filters or charts to the sheet. Just do not rename the two tabs (**Admissions** and **Enquiries**) and do not delete the first heading row.
- You can share the sheet with your team in the normal way (Share button). It is separate from the web app.
- Spam robots are caught by a hidden field, so they do not create rows.
