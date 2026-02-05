import { AnalysisResponse, normalizeSkill } from "@/types/analysis";
import crypto from "crypto";
import { understandSkillsWithGemini } from "./ai-skill-understanding";
import { extractCandidateData, extractJobRequirements } from "./extract";
import { matchJobWithCandidate } from "./match";
import { calculateFinalScore, getDecision } from "./scoring";

// Create deterministic hash of inputs for consistency checking
function hashInputs(resumeText: string, jobDescriptionText: string): string {
  return crypto
    .createHash("sha256")
    .update(resumeText + "|" + jobDescriptionText)
    .digest("hex")
    .substring(0, 16);
}

function shouldSuppressMissingSkill(
  missingLabel: string,
  likelyKeys: Set<string>,
): boolean {
  const missingKey = normalizeSkill(missingLabel).key;
  if (!missingKey) return false;
  if (likelyKeys.has(missingKey)) return true;
  for (const lk of likelyKeys) {
    if (!lk) continue;
    if (
      missingKey.length >= 4 &&
      lk.length >= 4 &&
      (missingKey.includes(lk) || lk.includes(missingKey))
    ) {
      return true;
    }
  }
  return false;
}

export async function runAnalysis(
  resumeText: string,
  jobDescriptionText: string,
  userId: string | null,
): Promise<AnalysisResponse> {
  try {
    // Generate hash for consistency tracking
    const inputHash = hashInputs(resumeText, jobDescriptionText);
    console.log(`[Analysis] Starting analysis with hash: ${inputHash}`);
    console.log(`[Analysis] Resume length: ${resumeText.length} chars`);
    console.log(`[Analysis] JD length: ${jobDescriptionText.length} chars`);

    // 1. Extract Data (single run with deterministic parameters)
    const [candidateProfile, jobRequirements, skillUnderstanding] =
      await Promise.all([
        extractCandidateData(resumeText),
        extractJobRequirements(jobDescriptionText),
        understandSkillsWithGemini({ resumeText, jobDescriptionText }).catch(
          () => null,
        ),
      ]);

    // Log extraction results for debugging non-determinism
    console.log(
      `[Analysis ${inputHash}] Candidate skills extracted:`,
      candidateProfile.skills.primary.length,
    );
    console.log(
      `[Analysis ${inputHash}] Candidate primary skills:`,
      candidateProfile.skills.primary,
    );
    console.log(
      `[Analysis ${inputHash}] Candidate secondary skills:`,
      candidateProfile.skills.secondary,
    );
    console.log(
      `[Analysis ${inputHash}] Candidate tools:`,
      candidateProfile.skills.tools,
    );
    console.log(
      `[Analysis ${inputHash}] Job required skills:`,
      jobRequirements.requirements.requiredSkills.length,
    );
    console.log(
      `[Analysis ${inputHash}] Job required skills list:`,
      jobRequirements.requirements.requiredSkills,
    );
    console.log(
      `[Analysis ${inputHash}] Job preferred skills:`,
      jobRequirements.requirements.preferredSkills.length,
    );
    console.log(
      `[Analysis ${inputHash}] Job preferred skills list:`,
      jobRequirements.requirements.preferredSkills,
    );
    console.log(
      `[Analysis ${inputHash}] Job tools:`,
      jobRequirements.requirements.tools,
    );

    const likelyKeys = new Set<string>();
    if (
      skillUnderstanding?.likelySkills &&
      Array.isArray(skillUnderstanding.likelySkills)
    ) {
      for (const s of skillUnderstanding.likelySkills) {
        if (typeof s !== "string") continue;
        const k = normalizeSkill(s.replace(/-/g, " ")).key;
        if (k) likelyKeys.add(k);
      }
    }

    // 2. Match Logic
    const likelySkills = Array.isArray(skillUnderstanding?.likelySkills)
      ? skillUnderstanding.likelySkills
      : [];
    console.log(
      `[Analysis ${inputHash}] Likely skills from AI:`,
      likelySkills.length,
    );

    const { breakdown, missingSkills, impliedSkills, notes } =
      matchJobWithCandidate(
        jobRequirements,
        candidateProfile,
        likelySkills,
        resumeText,
      );

    console.log(
      `[Analysis ${inputHash}] Initial missing skills:`,
      missingSkills.length,
    );
    console.log(
      `[Analysis ${inputHash}] Implied skills:`,
      impliedSkills.length,
    );

    // 2.5. AI Baseline Skill Normalization (New Step)
    // Remove "baseline covered" skills from missingSkills list (but do not change score)
    if (missingSkills.length > 0) {
      const { normalizeBaselineSkills } =
        await import("./ai-baseline-skill-normalizer");
      const { baselineCoveredSkills, remainingMissingSkills } =
        await normalizeBaselineSkills(
          candidateProfile.skills.primary,
          impliedSkills,
          missingSkills,
        );

      // Update missingSkills to only show truly missing ones
      missingSkills.length = 0; // Clear array
      missingSkills.push(...remainingMissingSkills);

      // Keep notes aligned with the updated missing skills list
      const missingNoteRegex = /^Missing \d+ required skill/;
      for (let i = notes.length - 1; i >= 0; i--) {
        if (missingNoteRegex.test(notes[i])) {
          notes.splice(i, 1);
        }
      }
      if (remainingMissingSkills.length > 0) {
        notes.push(
          `Missing ${remainingMissingSkills.length} required skill${
            remainingMissingSkills.length > 1 ? "s" : ""
          }`,
        );
      }

      // Add baseline covered skills to impliedSkills for visibility (optional)
      baselineCoveredSkills.forEach((s) => {
        if (!impliedSkills.includes(s)) {
          impliedSkills.push(s);
        }
      });

      if (baselineCoveredSkills.length > 0) {
        notes.push(
          `Baseline Skills: ${baselineCoveredSkills.length} prerequisite skill${baselineCoveredSkills.length > 1 ? "s" : ""} assumed covered (not listed as missing).`,
        );
      }
    }

    // 3. Calculate Final Score
    const finalScore = calculateFinalScore(breakdown);
    console.log(`[Analysis ${inputHash}] Final score: ${finalScore}`);
    console.log(`[Analysis ${inputHash}] Breakdown:`, {
      requiredSkills: breakdown.requiredSkills,
      experience: breakdown.experience,
      education: breakdown.education.score,
      tools: breakdown.tools,
      eligibility: breakdown.eligibility.score,
    });

    // 4. Normalize & Decide
    const decision = getDecision(finalScore);
    console.log(`[Analysis ${inputHash}] Decision: ${decision}`);

    // 5. Construct Response satisfying the user requested schema
    const explanations = {
      eligibility:
        breakdown.eligibility.status === "NOT_EVALUATED"
          ? "Eligibility checks whether the job has any strict requirements that would automatically disqualify you (visa, location, age, mandatory certification). For this job, eligibility was not evaluated; the eligibility score is a placeholder and does not affect your final score."
          : "Eligibility checks whether the job has any strict requirements that would automatically disqualify you (visa, location, age, mandatory certification).",
      jobReality: breakdown.isHardCapped
        ? "Job Reality measures how closely your background matches the core focus of this role (role alignment, not personal ability). A significant mismatch in core requirements was detected, so the final score is capped to reflect alignment to this role, not your overall potential."
        : "Job Reality measures how closely your background matches the core focus of this role (role alignment, not personal ability). Lower values usually mean the job’s main requirements don’t strongly overlap with what is shown in the resume.",
      requiredSkills:
        "Missing skills lists required skills that were not explicitly found in the resume text. Required skills reflects coverage of the job’s required skills based on what is explicitly present in the resume.",
      impliedSkills:
        "Implied skills are high-confidence inferred skills shown for context only. They do not affect scoring, missing skills, or any caps (and this list may be empty even for strong candidates).",
      competition:
        "Competition analysis is not available for this role yet. A value of 0 means it was not evaluated (not that there are no competitors).",
      scoringNote:
        "Scores represent alignment with this specific role, not your overall ability or potential. Lower scores indicate weaker alignment to this job’s requirements, not poor performance.",
    };

    return {
      finalScore,
      decision,
      isHardCapped: breakdown.isHardCapped,
      breakdown,
      missingSkills,
      impliedSkills,
      notes,
      explanations,
      meta: {
        analysisVersion: "v1",
        inputHash: inputHash, // Include hash in response for debugging
      },
    };
  } catch (error) {
    console.error("runAnalysis Error:", error);
    throw new Error("ANALYSIS_FAILED");
  }
}
