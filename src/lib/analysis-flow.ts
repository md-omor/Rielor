import { AnalysisResponse } from "@/types/analysis";
import { AnalysisRecord } from "@/types/db";
import crypto from "crypto";
import { deductCredit, getOrCreateUser, refundCredit } from "./credits";
import clientPromise from "./mongodb";
import { runAnalysis } from "./runAnalysis";

// Create deterministic hash of inputs for caching
function hashInputs(resumeText: string, jobDescription: string): string {
  return crypto
    .createHash("sha256")
    .update(resumeText + "|" + jobDescription)
    .digest("hex");
}

export async function performAnalysisFlow(
  userId: string,
  resumeText: string,
  jobDescription: string,
): Promise<
  | { success: true; data: AnalysisResponse; creditsRemaining: number }
  | {
      success: false;
      error: string;
      status: number;
      creditsRemaining?: number;
    }
> {
  // 1. Ensure user exists and has enough credits
  const user = await getOrCreateUser(userId);
  const deduction = await deductCredit(userId);

  if (!deduction.success) {
    const refreshedUser = await getOrCreateUser(userId);
    console.info("INSUFFICIENT_CREDITS", {
      userId,
      creditsRemaining: refreshedUser.creditsRemaining,
    });
    return {
      success: false,
      error: deduction.error ?? "INSUFFICIENT_CREDITS",
      status: 403,
      creditsRemaining: refreshedUser.creditsRemaining,
    };
  }

  const creditsRemaining =
    deduction.creditsRemaining ?? Math.max(user.creditsRemaining - 1, 0);

  try {
    // 3. Check cache first for deterministic results
    const inputHash = hashInputs(resumeText, jobDescription);
    console.log(`[Analysis Flow] Input hash: ${inputHash}`);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rielor");
    const cacheCollection = db.collection("analysis_cache");

    // Ensure index exists for efficient cache lookups
    try {
      await cacheCollection.createIndex(
        { inputHash: 1 },
        { unique: true, background: true },
      );
      await cacheCollection.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 30 * 24 * 60 * 60, background: true },
      );
    } catch (indexError) {
      // Index might already exist, ignore error
    }

    // Look for cached result (valid for 30 days)
    const cachedResult = await cacheCollection.findOne({
      inputHash,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    let analysisResult: AnalysisResponse;

    if (cachedResult) {
      console.log(
        `[Analysis Flow] Cache HIT - Using cached result for hash ${inputHash}`,
      );
      analysisResult = cachedResult.result;
    } else {
      console.log(
        `[Analysis Flow] Cache MISS - Running new analysis for hash ${inputHash}`,
      );
      // 3a. Call runAnalysis
      analysisResult = await runAnalysis(resumeText, jobDescription, userId);

      // 3b. Store result in cache
      await cacheCollection.updateOne(
        { inputHash },
        {
          $set: {
            inputHash,
            result: analysisResult,
            createdAt: new Date(),
            resumeLength: resumeText.length,
            jdLength: jobDescription.length,
          },
        },
        { upsert: true },
      );
      console.log(`[Analysis Flow] Cached result for hash ${inputHash}`);
    }

    // 4. Save Analysis Result to DB
    const records = db.collection<AnalysisRecord>("analysis_records");

    const record: AnalysisRecord = {
      userId,
      finalScore: analysisResult.finalScore,
      decision: analysisResult.decision,
      scoreBreakdown: analysisResult.breakdown,
      missingSkills: analysisResult.missingSkills,
      notes: analysisResult.notes,
      createdAt: new Date(),
    };

    await records.insertOne(record);

    return { success: true, data: analysisResult, creditsRemaining };
  } catch (error: any) {
    try {
      await refundCredit(userId);
    } catch (refundError) {
      console.error("Credit Refund Error:", refundError);
    }
    console.error("Analysis Execution Error:", error);
    return {
      success: false,
      error: "ANALYSIS_FAILED",
      status: 500,
      creditsRemaining,
    };
  }
}
