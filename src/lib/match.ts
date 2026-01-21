import { AnalysisBreakdown, CandidateProfile, JobRequirements, ScoreWithStatus, normalizeSkill } from "@/types/analysis";

// Education Level Ranks for comparison
const EDUCATION_RANKS: Record<string, number> = {
  "phd": 5,
  "master": 4,
  "bachelor": 3,
  "associate": 2,
  "highschool": 1,
  "none": 0,
  "unknown": 0
};

function getTrigrams(s: string): Set<string> {
  const out = new Set<string>();
  if (s.length < 3) return out;
  for (let i = 0; i <= s.length - 3; i++) {
    out.add(s.slice(i, i + 3));
  }
  return out;
}

function trigramSimilarity(a: string, b: string): number {
  const A = getTrigrams(a);
  const B = getTrigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter++;
  }
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cb = b.charCodeAt(j - 1);
      const cost = ca === cb ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function fuzzyKeyMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;

  const minLen = Math.min(a.length, b.length);
  if (minLen >= 4 && (a.includes(b) || b.includes(a))) return true;

  if (minLen >= 5) {
    const dist = levenshteinDistance(a, b);
    const ratio = 1 - dist / Math.max(a.length, b.length);
    if (ratio >= 0.85) return true;
  }

  if (minLen >= 8) {
    const tri = trigramSimilarity(a, b);
    if (tri >= 0.35) return true;
  }

  return false;
}

function hasSkillKey(candKeys: string[], targetKey: string): boolean {
  if (!targetKey) return false;
  for (const ck of candKeys) {
    if (fuzzyKeyMatch(targetKey, ck)) return true;
  }
  return false;
}

function getEducationRank(level: string | null): number {
  if (!level) return 0;
  const l = level.toLowerCase();
  if (l.includes("phd") || l.includes("doctorate")) return EDUCATION_RANKS.phd;
  if (l.includes("master")) return EDUCATION_RANKS.master;
  if (l.includes("bachelor")) return EDUCATION_RANKS.bachelor;
  if (l.includes("associate")) return EDUCATION_RANKS.associate;
  if (l.includes("high school")) return EDUCATION_RANKS.highschool;
  return 0;
}

export function matchJobWithCandidate(
  job: JobRequirements,
  candidate: CandidateProfile
): { breakdown: AnalysisBreakdown; missingSkills: string[]; notes: string[] } {
  const missingSkills: string[] = [];
  const notes: string[] = [];

  // 1. Mandatory Normalization
  const safeCandidateSkills = [
    ...(Array.isArray(candidate.skills?.primary) ? candidate.skills.primary : []),
    ...(Array.isArray(candidate.skills?.secondary) ? candidate.skills.secondary : []),
    ...(Array.isArray(candidate.skills?.tools) ? candidate.skills.tools : []),
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  const candSkillKeys = new Set(safeCandidateSkills.map((s) => normalizeSkill(s).key));
  const candKeyList = Array.from(candSkillKeys);

  // 4. REQUIRED SKILLS MATCHING
  let requiredSkillsScore = 100; // Default if none required
  let isHardCapped = false;
  let jobRealityScore = 100;
  
  const reqSkillsWithMeta = (Array.isArray(job.requirements?.requiredSkills) ? job.requirements.requiredSkills : [])
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map(normalizeSkill);
  
  if (reqSkillsWithMeta.length > 0) {
    const matched = reqSkillsWithMeta.filter(s => candSkillKeys.has(s.key) || hasSkillKey(candKeyList, s.key));
    const matchRatio = matched.length / reqSkillsWithMeta.length;
    
    requiredSkillsScore = Math.round(matchRatio * 100);
    
    if (matchRatio < 0.5) {
      isHardCapped = true;
      notes.push("Job Reality: Missing more than 50% of required skills. Final score capped at 49.");
    }

    jobRealityScore = Math.round(matchRatio * 100);

    reqSkillsWithMeta.forEach(skill => {
      if (!(candSkillKeys.has(skill.key) || hasSkillKey(candKeyList, skill.key))) {
        missingSkills.push(skill.label);
      }
    });

    if (missingSkills.length > 0) {
      notes.push(`Missing ${missingSkills.length} required skill${missingSkills.length > 1 ? 's' : ''}`);
    }
  }

  // 5. PREFERRED SKILLS MATCHING
  let preferredSkillsScore = 100;
  const prefSkillsWithMeta = (Array.isArray(job.requirements?.preferredSkills) ? job.requirements.preferredSkills : [])
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map(normalizeSkill);
  if (prefSkillsWithMeta.length > 0) {
      const matched = prefSkillsWithMeta.filter(s => candSkillKeys.has(s.key) || hasSkillKey(candKeyList, s.key));
      preferredSkillsScore = Math.round((matched.length / prefSkillsWithMeta.length) * 100);
  }

  // 6. TOOLS MATCHING
  let toolsScore = 100;
  const targetToolsWithMeta = (Array.isArray(job.requirements?.tools) ? job.requirements.tools : [])
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map(normalizeSkill);
  if (targetToolsWithMeta.length > 0) {
      const matched = targetToolsWithMeta.filter(s => candSkillKeys.has(s.key) || hasSkillKey(candKeyList, s.key));
      toolsScore = Math.round((matched.length / targetToolsWithMeta.length) * 100);
  }

  // 7. EXPERIENCE SCORING
  let experienceScore = 100;
  const candidateYears = candidate.experience.totalYears;
  const minYears = job.requirements.minimumExperienceYears || 0;
  
  if (minYears > 0) {
    if (candidateYears >= minYears) {
      experienceScore = 100;
    } else {
      const ratio = candidateYears / minYears;
      experienceScore = Math.round(ratio * 100);
      notes.push(`Experience Gap: Candidate has ${candidateYears} years, but ${minYears} required.`);
    }
  }

  // Keep breakdown logically consistent: if job is hard-capped due to missing required skills,
  // and there is an experience gap, do not allow experience to remain higher than job reality.
  if (isHardCapped && experienceScore < 100 && experienceScore > requiredSkillsScore) {
    experienceScore = requiredSkillsScore;
    notes.push("Hard Cap: Experience score dampened due to missing required skills.");
  }

  // 8. EDUCATION SCORING (NO NULLS RULE)
  let education: ScoreWithStatus = { score: 100, status: "NOT_REQUIRED" };
  const jobEduRank = getEducationRank(job.requirements.educationLevel);
  const candEduRank = getEducationRank(candidate.education.highestLevel);

  if (jobEduRank > 0) {
    if (candEduRank >= jobEduRank) {
      education = { score: 100, status: "MATCHED" };
    } else if (candEduRank > 0) {
      const eduRatio = candEduRank / jobEduRank;
      education = { score: Math.round(eduRatio * 100), status: "PARTIAL" };
      notes.push(`Education Gap: Level (${candidate.education.highestLevel}) is lower than required.`);
    } else {
      education = { score: 0, status: "MISSING" };
    }
  }

  // 9. ELIGIBILITY SCORING (NO NULLS RULE)
  let eligibility: ScoreWithStatus = { score: 100, status: "NOT_REQUIRED" };
  if (job.meta.visaRequired && !job.meta.remoteAllowed) {
    eligibility = { score: 50, status: "PARTIAL" };
    notes.push("Eligibility Note: Job requires visa and is not remote.");
  } else if (job.meta.visaRequired || job.meta.remoteAllowed) {
    eligibility = { score: 100, status: "MATCHED" };
  }

  return {
    breakdown: {
      requiredSkills: requiredSkillsScore,
      preferredSkills: preferredSkillsScore,
      tools: toolsScore,
      experience: experienceScore,
      education,
      eligibility,
      jobReality: jobRealityScore,
      competition: 0,
      isHardCapped
    },
    missingSkills,
    notes,
  };
}
