import { NextResponse } from "next/server";
import {
  getOrCreateStudentFolder,
  listFilesInStudentFolder,
  uploadFileToDrive,
  deleteFileFromDrive,
  makeFilePublic,
} from "@/helper/googleDrive";

export const dynamic = "force-dynamic";

/* ── GET /api/student-files?pageId=XXX&studentName=YYY&sectionKey=student|admin */
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const pageId      = searchParams.get("pageId");
    const studentName = searchParams.get("studentName");
    const sectionKey  = searchParams.get("sectionKey") || "student";

    if (!pageId || !studentName) {
      return NextResponse.json(
        { statusCode: 400, message: "pageId and studentName are required" },
        { status: 400 }
      );
    }

    const files = await listFilesInStudentFolder(pageId, studentName, sectionKey);
    return NextResponse.json({ statusCode: 200, data: files });
  } catch (error) {
    console.error("[student-files GET]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Failed to list files: " + error.message },
      { status: 500 }
    );
  }
};

/* ── POST /api/student-files  (multipart/form-data)
   Fields: pageId, studentName, sectionKey, file ────────────────── */
export const POST = async (request) => {
  try {
    const formData    = await request.formData();
    const pageId      = formData.get("pageId");
    const studentName = formData.get("studentName");
    const sectionKey  = formData.get("sectionKey") || "student";
    const file        = formData.get("file");

    if (!pageId || !studentName || !file) {
      return NextResponse.json(
        { statusCode: 400, message: "pageId, studentName and file are required" },
        { status: 400 }
      );
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const folderId = await getOrCreateStudentFolder(pageId, studentName, sectionKey);
    const uploaded = await uploadFileToDrive(folderId, buffer, file.name, file.type || "application/octet-stream");

    await makeFilePublic(uploaded.id);

    return NextResponse.json({ statusCode: 200, data: uploaded });
  } catch (error) {
    console.error("[student-files POST]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
};

/* ── DELETE /api/student-files?fileId=XXX ──────────────────────── */
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
    return NextResponse.json({ statusCode: 200, message: "File deleted successfully" });
  } catch (error) {
    console.error("[student-files DELETE]", error.message);
    return NextResponse.json(
      { statusCode: 500, message: "Delete failed: " + error.message },
      { status: 500 }
    );
  }
};
