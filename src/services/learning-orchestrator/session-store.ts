import type {
  OrchestratorSessionState,
  PedagogicalAction,
  PedagogicalDecision,
} from "@/types/learning-orchestrator";
import { ORCHESTRATOR_LIMITS } from "@/types/learning-orchestrator";

const STORAGE_KEY = "rossiyani:learningOrchestratorSession";

function emptySession(): OrchestratorSessionState {
  const sessionId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `session-${Date.now()}`;
  return {
    sessionId,
    startedAt: Date.now(),
    insightsDelivered: 0,
    comprehensionsDelivered: 0,
    patternsIntroducedThisSession: [],
    lastIntroducedPatternId: null,
    lastIntroducedAt: null,
  };
}

function normalizeSession(parsed: Partial<OrchestratorSessionState>): OrchestratorSessionState {
  const fresh = emptySession();
  if (!parsed?.sessionId || !parsed.startedAt) {
    return fresh;
  }
  return {
    sessionId: parsed.sessionId,
    startedAt: parsed.startedAt,
    insightsDelivered: parsed.insightsDelivered ?? 0,
    comprehensionsDelivered: parsed.comprehensionsDelivered ?? 0,
    patternsIntroducedThisSession: Array.isArray(parsed.patternsIntroducedThisSession)
      ? parsed.patternsIntroducedThisSession
      : [],
    lastIntroducedPatternId: parsed.lastIntroducedPatternId ?? null,
    lastIntroducedAt: parsed.lastIntroducedAt ?? null,
  };
}

function readSession(): OrchestratorSessionState {
  if (typeof localStorage === "undefined") {
    return emptySession();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptySession();
    }
    const parsed = JSON.parse(raw) as Partial<OrchestratorSessionState>;
    return normalizeSession(parsed);
  } catch {
    return emptySession();
  }
}

function writeSession(session: OrchestratorSessionState): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getOrchestratorSession(): OrchestratorSessionState {
  const session = readSession();
  const elapsed = Date.now() - session.startedAt;
  if (elapsed > 2 * 60 * 60 * 1000) {
    const fresh = emptySession();
    writeSession(fresh);
    return fresh;
  }
  return session;
}

export function resetOrchestratorSession(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

export function isShortSession(session: OrchestratorSessionState): boolean {
  return Date.now() - session.startedAt < ORCHESTRATOR_LIMITS.shortSessionMs;
}

export function isSessionInsightSaturated(session: OrchestratorSessionState): boolean {
  return session.insightsDelivered >= ORCHESTRATOR_LIMITS.maxInsightsPerSession;
}

export function isSessionComprehensionSaturated(session: OrchestratorSessionState): boolean {
  return session.comprehensionsDelivered >= ORCHESTRATOR_LIMITS.maxComprehensionsPerSession;
}

export function isNoveltyBlockedForPattern(
  session: OrchestratorSessionState,
  patternId: string,
): boolean {
  if (session.patternsIntroducedThisSession.includes(patternId)) {
    return false;
  }
  if (session.patternsIntroducedThisSession.length >= ORCHESTRATOR_LIMITS.maxNewPatternsPerSession) {
    return true;
  }
  if (
    session.lastIntroducedPatternId &&
    session.lastIntroducedPatternId !== patternId &&
    session.lastIntroducedAt &&
    Date.now() - session.lastIntroducedAt < 3 * 60 * 1000
  ) {
    return true;
  }
  return false;
}

export function recordOrchestratorOutcome(
  decision: PedagogicalDecision,
  patternId: string,
): OrchestratorSessionState {
  const session = getOrchestratorSession();

  if (decision.action === "INSIGHT") {
    session.insightsDelivered += 1;
    if (decision.depthLevels.includes("L3")) {
      session.comprehensionsDelivered += 1;
    }
  }

  if (decision.action === "OBSERVATION" || decision.action === "REMINDER") {
    if (!session.patternsIntroducedThisSession.includes(patternId)) {
      session.patternsIntroducedThisSession.push(patternId);
      session.lastIntroducedPatternId = patternId;
      session.lastIntroducedAt = Date.now();
    }
  }

  writeSession(session);
  return session;
}

export function actionConsumesNoveltyBudget(action: PedagogicalAction): boolean {
  return action === "OBSERVATION" || action === "REMINDER" || action === "INSIGHT";
}