export {
  computeLearningState,
  applyLearningEvent,
  recordToInput,
} from "./compute-learning-state";
export { computeDimensions, buildEvidence } from "./compute-dimensions";
export { deriveLifecycle, maxDepthForLifecycle } from "./derive-lifecycle";
export { learningStateRecordFromEncounter } from "./adapters/from-encounter";
export {
  toOrchestratorEncounterSignals,
  maxDepthFromLearningState,
} from "./adapters/to-orchestrator";
export {
  loadLearningStateRecord,
  persistLearningStateRecord,
  loadLearningPatternState,
} from "./persist/user-learning-state";

export type {
  LearningPatternState,
  LearningStateDimensions,
  LearningStateInput,
  LearningStateRecord,
  LearningStateEvidence,
  PatternLearningEvent,
  PatternLifecycleState,
} from "@/types/learning-state";

export { emptyLearningStateRecord } from "@/types/learning-state";
