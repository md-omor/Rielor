import { performAnalysisFlow } from "@/lib/analysis-flow";
import { parseFileFromFormData } from "@/lib/file-parser";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_USER_ID = "demo-user1";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const jobDescription = formData.get("jobDescription") as string;
    const userIdFromForm = formData.get("userId") as string;

    // 1. Validate Input
    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: "Missing file or jobDescription" },
        { status: 400 }
      );
    }

    const targetUserId = userIdFromForm || DEFAULT_USER_ID;

    // 2. Extract Text from File
    let resumeText: string;
    try {
      const parseResult = await parseFileFromFormData(file);
      resumeText = parseResult.text;
    } catch (error: any) {
      console.error("File Parsing Error:", error);
      return NextResponse.json(
        { error: "INVALID_INPUT", details: error.message || "Failed to parse file" },
        { status: 400 }
      );
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: "File contains no extractable text" },
        { status: 400 }
      );
    }

    // 3. Perform Analysis Flow
    const result = await performAnalysisFlow(targetUserId, resumeText, jobDescription);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error("File Analysis Endpoint Error:", error);
    return NextResponse.json(
      { error: "ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
