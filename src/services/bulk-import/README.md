# services/bulk-import/

Industrial bulk text import with persistent queue and duplicate detection.

## Flow

```text
Folder → readImportFolder → ImportQueue.createJob
  → claimNextPendingItem → processBulkItem
  → importRussianText (existing pipeline)
  → progress report
```

## Files

| File | Role |
|------|------|
| `bulk-import-service.ts` | Orchestrator |
| `import-queue.ts` | Persistent Prisma queue |
| `duplicate-detection.ts` | contentHash check |
| `read-import-files.ts` | Folder reader |
| `process-bulk-item.ts` | Single file through import |
