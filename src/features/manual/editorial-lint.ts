import {
  MANUAL_FORBIDDEN_PATTERNS,
  MANUAL_STORYTELLING_PATTERNS,
} from "./constants";

export type EditorialValidationResult = {
  valid: boolean;
  violations: string[];
};

export function validateEditorialStyle(content: string): EditorialValidationResult {
  const violations: string[] = [];

  for (const pattern of MANUAL_FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Forbidden phrasing matching ${pattern.source}`);
    }
  }

  for (const pattern of MANUAL_STORYTELLING_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`Storytelling or legacy section format matching ${pattern.source}`);
    }
  }

  if (!/\p{Script=Cyrillic}/u.test(content)) {
    violations.push("Missing Cyrillic Russian examples");
  }

  if (!/❌/.test(content) || !/✅/.test(content)) {
    violations.push("Missing ❌ / ✅ error correction markers in Erreur fréquente box");
  }

  if (/\bTODO\b|\bTBD\b|\[\.\.\.\]|\bplaceholder\b/i.test(content)) {
    violations.push("Placeholder or TODO content detected");
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
