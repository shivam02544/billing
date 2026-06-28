import { NextResponse } from "next/server";
import {
  getOrCreateAdminUploadsFolder,
  listAdminFiles,
  uploadFileToDrive,
  deleteFileFromDrive,
  makeFilePublic,
} from "@/helper/googleDrive";

export const dynamic = "force-dynamic";

/* ── GET /api/admin-files?category=General ─────────────────── */
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "General";

    const files = await listAdminFiles(category);
    return NextResponse.json({ statusCode: 200, data: files });
  } catch (error) {
    console.error("[admin-files GET]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Failed to list files: " + error.message },
      { status: 500 }
    );
  }
};

/* ── POST /api/admin-files (multipart/form-data)
   Fields: category, file ─────────────────────────────────── */
export const POST = async (request) => {
  try {
    const formData = await request.formData();
    const category = formData.get("category") || "General";
    const file     = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { statusCode: 400, message: "file is required" },
        { status: 400 }
      );
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const folderId = await getOrCreateAdminUploadsFolder(category);
    const uploaded = await uploadFileToDrive(folderId, buffer, file.name, file.type || "application/octet-stream");

    await makeFilePublic(uploaded.id);

    return NextResponse.json({ statusCode: 200, data: uploaded });
  } catch (error) {
    console.error("[admin-files POST]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
};

/* ── DELETE /api/admin-files?fileId=XXX ───────────────────── */
export const DELETE = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { statusCode: 400, message: "fileId is required" },
        { status: 400 }
      );
    }

    await deleteFileFromDrive(fileId);
    return NextResponse.json({ statusCode: 200, message: "File deleted" });
  } catch (error) {
    console.error("[admin-files DELETE]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Delete failed: " + error.message },
      { status: 500 }
    );
  }
};
