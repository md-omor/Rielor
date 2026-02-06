import {
  ExtractionAccessError,
  ExtractionContentError,
  extractJDFromURLWithMeta
} from "@/lib/extract-jd";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";  
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let url: string | undefined;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    url = body?.url;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Extract JD with metadata
    const result = await extractJDFromURLWithMeta(url);

    // Handle non-success cases
    if (result.status !== 'SUCCESS') {
      console.warn(`[Extract JD API] ${result.status}: ${result.message} | url=${url}`);
      
      return NextResponse.json(
        {
          error: result.message,
          status: result.status,
          finalUrl: result.finalUrl,
        },
        { status: 422 }
      );
    }

    // Success case
    return NextResponse.json({
      success: true,
      text: result.text,
      finalUrl: result.finalUrl,
    });

  } catch (error: any) {
    const isHandledExtractionIssue =
      error instanceof ExtractionAccessError ||
      error instanceof ExtractionContentError;

    if (isHandledExtractionIssue) {
      console.warn(`[Extract JD API] Handled extraction error: ${error.message}`);
      return NextResponse.json(
        {
          error: error.message,
          status: 'EMPTY_OR_ERROR',
        },
        { status: 422 },
      );
    }

    console.error("[Extract JD API] Unexpected error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "This link can't be accessed automatically. Please paste the job description text manually.",
        status: 'EMPTY_OR_ERROR',
      },
      { status: 500 },
    );
  }
}
