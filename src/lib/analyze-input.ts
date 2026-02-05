export type JobDescriptionInputDecision =
  | { mode: "text"; text: string }
  | { mode: "extract"; url: string }
  | { mode: "empty" };

export function resolveJobDescriptionInput(params: {
  jobDescriptionText?: string;
  jobUrl?: string;
}): JobDescriptionInputDecision {
  const text = (params.jobDescriptionText ?? "").trim();
  if (text) {
    return { mode: "text", text };
  }

  const urlOrText = (params.jobUrl ?? "").trim();
  if (!urlOrText) {
    return { mode: "empty" };
  }

  if (isValidUrl(urlOrText)) {
    return { mode: "extract", url: urlOrText };
  }

  return { mode: "text", text: urlOrText };
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
