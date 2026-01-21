import { DECISION_THRESHOLDS, SCORING_WEIGHTS } from "@/config/constants";
import { AnalysisBreakdown, Decision } from "@/types/analysis";

/**
 * Calculates the total weighted score strictly following the user's rules.
 * 
 * Rules:
 * 1. Each category score = round(match% * weight)
 * 2. Final Score = sum(category scores)
 * 3. If isHardCapped, finalScore = min(finalScore, 49)
 */
export function calculateFinalScore(breakdown: AnalysisBreakdown): number {
  let totalPoints = 0;

  // 1. Required Skills (30)
  totalPoints += Math.round((breakdown.requiredSkills / 100) * SCORING_WEIGHTS.REQUIRED_SKILLS);

  // 2. Preferred Skills (10)
  totalPoints += Math.round((breakdown.preferredSkills / 100) * SCORING_WEIGHTS.PREFERRED_SKILLS);

  // 3. Tools (10)
  totalPoints += Math.round((breakdown.tools / 100) * SCORING_WEIGHTS.TOOLS);

  // 4. Experience (25)
  totalPoints += Math.round(((breakdown.experience || 0) / 100) * SCORING_WEIGHTS.EXPERIENCE);

  // 5. Education (15)
  totalPoints += Math.round(((breakdown.education?.score || 0) / 100) * SCORING_WEIGHTS.EDUCATION);

  // 6. Eligibility (10)
  totalPoints += Math.round(((breakdown.eligibility?.score || 0) / 100) * SCORING_WEIGHTS.ELIGIBILITY);

  // Apply Hard Cap
  if (breakdown.isHardCapped) {
    totalPoints = Math.min(totalPoints, 49);
  }
  
  return totalPoints;
}

export function getDecision(score: number): Decision {
  if (score >= DECISION_THRESHOLDS.PASS) return "PASS";
  if (score >= DECISION_THRESHOLDS.IMPROVE) return "IMPROVE";
  return "REJECT";
}
