import { performAnalysisFlow } from "@/lib/analysis-flow";
import { AnalysisRequest } from "@/types/analysis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_USER_ID = "demo-user1";

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json();
    const { jobDescriptionText, resumeText, userId } = body;

    // 1. Validate Input
    if (!jobDescriptionText || !resumeText) {
      return NextResponse.json(
        { 
          error: "INVALID_INPUT", 
          details: "Missing jobDescriptionText or resumeText" 
        },
        { status: 400 }
      );
    }

    const targetUserId = userId || DEFAULT_USER_ID;

    // 2. Perform Analysis Flow
    const result = await performAnalysisFlow(targetUserId, resumeText, jobDescriptionText);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error("Endpoint Error:", error);
    return NextResponse.json(
      { error: "ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
