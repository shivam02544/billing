import { google } from "googleapis";

/*
 * Google Drive helper — OAuth 2.0 (personal Gmail)
 *
 * Files are uploaded as the authenticated Gmail user so storage
 * is charged to their 15 GB quota, not a quota-less service account.
 *
 * Required .env.local keys:
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   GOOGLE_OAUTH_REFRESH_TOKEN
 *   GOOGLE_DRIVE_PARENT_FOLDER_ID
 */

let _driveClient = null;

function getDriveClient() {
  if (_driveClient) return _driveClient;

  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth credentials. " +
      "Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, " +
      "and GOOGLE_OAUTH_REFRESH_TOKEN in .env.local."
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, "urn:ietf:wg:oauth:2.0:oob");
  oauth2.setCredentials({ refresh_token: refreshToken });

  _driveClient = google.drive({ version: "v3", auth: oauth2 });
  return _driveClient;
}

/* ── Get-or-create per-student subfolder ─────────────────────── */
export async function getOrCreateStudentFolder(pageId, studentName, sectionKey = "student") {
  const drive    = getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!parentId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID is not set in .env.local");
  }

  // Admin files live in a separate subfolder prefixed with "ADMIN - "
  const base       = `${pageId} - ${studentName}`.toUpperCase().trim();
  const folderName = sectionKey === "admin" ? `ADMIN - ${base}` : base;

  const searchRes = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });

  if (searchRes.data.files?.length > 0) {
    return searchRes.data.files[0].id;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return createRes.data.id;
}

/* ── List all files in a student's folder ────────────────────── */
export async function listFilesInStudentFolder(pageId, studentName, sectionKey = "student") {
  const drive    = getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const base       = `${pageId} - ${studentName}`.toUpperCase().trim();
  const folderName = sectionKey === "admin" ? `ADMIN - ${base}` : base;

  const folderRes = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });

  if (!folderRes.data.files?.length) return [];

  const folderId = folderRes.data.files[0].id;

  const filesRes = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, size, createdTime, webViewLink, webContentLink)",
    orderBy: "createdTime desc",
    spaces: "drive",
  });

  return (filesRes.data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? Number(f.size) : 0,
    createdTime: f.createdTime,
    viewUrl: f.webViewLink,
    downloadUrl: f.webContentLink,
    previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
  }));
}

/* ── Upload a file buffer to the student folder ──────────────── */
export async function uploadFileToDrive(folderId, buffer, fileName, mimeType) {
  const drive = getDriveClient();

  if (!folderId) throw new Error("uploadFileToDrive: folderId is missing");
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new Error("uploadFileToDrive: buffer is empty or invalid");

  const { Readable } = await import("stream");

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id, name, mimeType, size, createdTime, webViewLink, webContentLink",
  });

  const f = res.data;
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? Number(f.size) : 0,
    createdTime: f.createdTime,
    viewUrl: f.webViewLink,
    downloadUrl: f.webContentLink,
    previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
  };
}

/* ── Delete a file by ID ─────────────────────────────────────── */
export async function deleteFileFromDrive(fileId) {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

/* ── Make a file publicly readable (for iframe preview) ─────── */
export async function makeFilePublic(fileId) {
  const drive = getDriveClient();
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
  } catch {
    // Non-fatal — preview may still work via direct Drive link
  }
}

/* ─────────────────────────────────────────────────────────────
   Admin Uploads — a general folder for admin-only files
   (not tied to any specific student)
   Folder structure: PARENT / ADMIN-UPLOADS / <category>/
   ───────────────────────────────────────────────────────────── */

/** Get or create the root "ADMIN-UPLOADS" folder under the parent */
export async function getOrCreateAdminUploadsFolder(category = "General") {
  const drive    = getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  if (!parentId) throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID is not set in .env.local");

  // 1. Ensure the root admin folder exists
  const rootName   = "ADMIN-UPLOADS";
  const rootSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${rootName}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });

  let rootId;
  if (rootSearch.data.files?.length > 0) {
    rootId = rootSearch.data.files[0].id;
  } else {
    const r = await drive.files.create({
      requestBody: { name: rootName, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
      fields: "id",
    });
    rootId = r.data.id;
  }

  // 2. Ensure the category subfolder exists
  const catName   = category.toUpperCase().trim() || "GENERAL";
  const catSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${catName}' and '${rootId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });

  if (catSearch.data.files?.length > 0) return catSearch.data.files[0].id;

  const c = await drive.files.create({
    requestBody: { name: catName, mimeType: "application/vnd.google-apps.folder", parents: [rootId] },
    fields: "id",
  });
  return c.data.id;
}

/** List files from an admin category folder */
export async function listAdminFiles(category = "General") {
  const drive    = getDriveClient();
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const rootName = "ADMIN-UPLOADS";
  const catName  = category.toUpperCase().trim() || "GENERAL";

  // Find root
  const rootSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${rootName}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  if (!rootSearch.data.files?.length) return [];

  const rootId = rootSearch.data.files[0].id;

  // Find category
  const catSearch = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${catName}' and '${rootId}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  if (!catSearch.data.files?.length) return [];

  const catId   = catSearch.data.files[0].id;
  const filesRes = await drive.files.list({
    q: `'${catId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, size, createdTime, webViewLink, webContentLink)",
    orderBy: "createdTime desc",
    spaces: "drive",
  });

  return (filesRes.data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? Number(f.size) : 0,
    createdTime: f.createdTime,
    viewUrl: f.webViewLink,
    downloadUrl: f.webContentLink,
    previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
  }));
}

