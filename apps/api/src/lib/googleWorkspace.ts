import { google } from "googleapis";

export class GoogleWorkspaceClient {
  private auth: any;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this.auth = oauth2Client;
  }

  async getDriveFiles(folderId?: string) {
    const drive = google.drive({ version: "v3", auth: this.auth });
    let q = "trashed = false";
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }
    
    const res = await drive.files.list({
      q,
      fields: "files(id, name, mimeType, modifiedTime, webViewLink, size)",
      orderBy: "modifiedTime desc",
      pageSize: 50,
    });
    
    return res.data.files || [];
  }

  async createDriveFolder(name: string) {
    const drive = google.drive({ version: "v3", auth: this.auth });
    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    return res.data.id;
  }

  async getUpcomingEvents(calendarId: string = "primary") {
    const calendar = google.calendar({ version: "v3", auth: this.auth });
    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items || [];
  }

  async getRecentEmails(query: string = "") {
    const gmail = google.gmail({ version: "v1", auth: this.auth });
    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 10,
    });
    
    const messages = res.data.messages || [];
    const threads = [];
    
    for (const msg of messages) {
      if (msg.id) {
        const fullMsg = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date", "To"],
        });
        threads.push(fullMsg.data);
      }
    }
    
    return threads;
  }
}
