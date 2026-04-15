import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve("src/config/google-credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1KqmywG0dc3ERJ-KMhVOuiglNuE0Raydih8OZzGWJf_U";

export async function appendToSheet(lead) {
  try {
    const values = [[
      lead.name || "",
      lead.email || "",
      lead.business || "",
      lead.intent || "",
      lead.problem || "",
      lead.websiteStatus || "",
      lead.finalAction || "",
      lead.createdAt || ""
    ]];

    console.log("Appending to Google Sheet:", values);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:H", // change this if your tab name is different
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values
      }
    });

    console.log("Google Sheets append success:", response.status);
    return response.data;
  } catch (error) {
    console.error("appendToSheet error:", error.message);
    if (error.response?.data) {
      console.error("Google API details:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}