import { google } from "googleapis";

let sheetsClient;

function getClient() {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

// Appends one row to the "Logs" sheet: timestamp | event | chatId | detail.
// Never throws — a logging failure must not break the bot itself.
export async function logEvent(event, detail = "", chatId = "") {
  try {
    const sheets = getClient();
    const timestamp = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Jakarta",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Logs!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, event, String(chatId ?? ""), detail]],
      },
    });
  } catch (err) {
    console.error("Sheet log failed:", err.message);
  }
}
