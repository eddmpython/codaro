import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/browserLearningArchiveStore.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const state = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const lessonRef = "30days/day01_헬로월드";
const archiveA = archive("sha256-archive-a");
const archiveB = archive("sha256-archive-b");
const archiveC = archive("sha256-archive-c");
const committedA = {
  archive: archiveA,
  lessonRef,
  revision: 1,
  savedAt: "2026-07-23T00:00:00.000Z",
};

const staged = state.stageBrowserLearningArchiveImportRecord(
  committedA,
  lessonRef,
  archiveC,
  "2026-07-23T00:01:00.000Z",
);
assert.ok(staged);
assert.equal(staged.revision, 2);
assert.equal(state.storedBrowserLearningArchiveState(staged.record).archive, archiveA);
assert.equal(state.storedBrowserLearningArchiveState(staged.record).pendingImport.archive, archiveC);
assert.equal(state.reserveBrowserLearningArchiveWriteRecord(staged.record, lessonRef), null);
assert.equal(state.stageBrowserLearningArchiveImportRecord(
  staged.record,
  lessonRef,
  archiveB,
  "2026-07-23T00:02:00.000Z",
), null);

const committedC = state.commitBrowserLearningArchiveImportRecord(
  staged.record,
  lessonRef,
  staged.revision,
  archiveC.manifest.rootHash,
  "2026-07-23T00:03:00.000Z",
);
assert.ok(committedC);
assert.equal(committedC.archive, archiveC);
assert.equal(committedC.pendingImport, undefined);
assert.ok(state.commitBrowserLearningArchiveImportRecord(
  committedC,
  lessonRef,
  staged.revision,
  archiveC.manifest.rootHash,
  "2026-07-23T00:04:00.000Z",
));

const rolledBack = state.rollbackBrowserLearningArchiveImportRecord(
  staged.record,
  lessonRef,
  staged.revision,
);
assert.ok(rolledBack);
assert.equal(rolledBack.archive, archiveA);
assert.equal(rolledBack.pendingImport, undefined);

const newerCommitted = {
  archive: archiveB,
  lessonRef,
  revision: staged.revision + 1,
  savedAt: "2026-07-23T00:05:00.000Z",
};
assert.equal(state.rollbackBrowserLearningArchiveImportRecord(
  newerCommitted,
  lessonRef,
  staged.revision,
), null);
assert.equal(newerCommitted.archive, archiveB);

const reservation = state.reserveBrowserLearningArchiveWriteRecord(newerCommitted, lessonRef);
assert.ok(reservation);
assert.equal(reservation.reservation.archive, archiveB);
assert.equal(reservation.reservation.revision, newerCommitted.revision + 1);
assert.equal(state.writeBrowserLearningArchiveRecord(
  reservation.record,
  lessonRef,
  archiveC,
  reservation.reservation.revision - 1,
  "2026-07-23T00:06:00.000Z",
), null);
const saved = state.writeBrowserLearningArchiveRecord(
  reservation.record,
  lessonRef,
  archiveC,
  reservation.reservation.revision,
  "2026-07-23T00:07:00.000Z",
);
assert.ok(saved);
assert.equal(saved.archive, archiveC);

console.log("ok: browser learning archive pending, commit, rollback, and revision transitions verified");

function archive(rootHash) {
  return { manifest: { rootHash } };
}
