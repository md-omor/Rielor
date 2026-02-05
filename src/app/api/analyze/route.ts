import { performAnalysisFlow } from "@/lib/analysis-flow";
import { resolveJobDescriptionInput } from "@/lib/analyze-input";
import { getOrCreateUser } from "@/lib/credits";
import { extractJDFromURLWithMeta } from "@/lib/extract-jd";
import { AnalysisRequest } from "@/types/analysis";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json();
    const { jobDescriptionText, jobUrl, resumeText, userId: bodyUserId } = body as AnalysisRequest & {
      userId?: string;
    };

    const requestedUserId = typeof bodyUserId === "string" ? bodyUserId.trim() : "";
    let resolvedUserId = requestedUserId;
    let email: string | undefined;

    if (!resolvedUserId) {
      const { userId } = await auth();
      resolvedUserId = userId ?? "demo";

      if (userId) {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          const primary = user.emailAddresses?.find(
            (e: { id: string }) => e.id === user.primaryEmailAddressId,
          );
          email = primary?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
        } catch {
          // ignore
        }
      }
    }

    if (!resolvedUserId) {
      resolvedUserId = "demo";
    }

    await getOrCreateUser(resolvedUserId, email);

    const resumeValue = resumeText ?? "";
    const resumeTrimmed = resumeValue.trim();

    // 1. Validate Input
    if (!resumeTrimmed) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          details: "Missing resumeText",
        },
        { status: 400 },
      );
    }

    const jobInput = resolveJobDescriptionInput({ jobDescriptionText, jobUrl });

    if (jobInput.mode === "empty") {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          details: "Missing jobDescriptionText or jobUrl",
        },
        { status: 400 },
      );
    }

    let finalJobDescription = "";
    let extractedJobDescription = "";
    let extractionStatus: string | undefined;
    let extractionFinalUrl: string | undefined;

    if (jobInput.mode === "text") {
      finalJobDescription = jobInput.text;
      extractedJobDescription = jobInput.text;
    }

    if (jobInput.mode === "extract") {
      const extraction = await extractJDFromURLWithMeta(jobInput.url);
      extractionStatus = extraction.status;
      extractionFinalUrl = extraction.finalUrl;
      extractedJobDescription = extraction.text;

      if (extraction.status !== "SUCCESS" || !extraction.text.trim()) {
        return NextResponse.json(
          {
            ok: false,
            error: "JD_EXTRACTION_FAILED",
            message: extraction.message,
            extractedJobDescription: "",
            status: extraction.status,
            finalUrl: extraction.finalUrl,
          },
          { status: 422 },
        );
      }

      finalJobDescription = extraction.text;
    }

    // 2. Perform Analysis Flow
    const result = await performAnalysisFlow(
      resolvedUserId,
      resumeValue,
      finalJobDescription,
    );

    if (!result.success) {
      if (result.error === "INSUFFICIENT_CREDITS") {
        const creditsRemaining = result.creditsRemaining ?? 0;
        return NextResponse.json(
          {
            ok: false,
            error: "INSUFFICIENT_CREDITS",
            message: `You have ${creditsRemaining} credits left.`,
            creditsRemaining,
          },
          { status: result.status },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: result.error,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      ok: true,
      creditsRemaining: result.creditsRemaining,
      analysis: result.data,
      ...result.data,
      message: "",
      extractedJobDescription,
      extractionStatus,
      finalUrl: extractionFinalUrl,
    });

  } catch (error) {
    console.error("Endpoint Error:", error);
    return NextResponse.json(
      { error: "ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
