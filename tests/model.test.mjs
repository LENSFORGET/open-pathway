import assert from "node:assert/strict";
import test from "node:test";
import {
  makePlan,
  sanitizeAnswers,
  resumeStep,
  readinessResult,
  readSession,
  writeSession,
  SESSION_KEY,
} from "../src/model.js";

const answers = {
  goal: "career",
  stage: "start",
  focus: "portfolio",
  pace: "gentle",
  support: "journal",
};
test("changing direction invalidates the old branch answer", () => {
  const changed = sanitizeAnswers({ ...answers, goal: "creative" });
  assert.equal(changed.focus, undefined);
  assert.equal(makePlan(changed), null);
  assert.equal(resumeStep(changed), 2);
  assert.ok(makePlan({ ...changed, focus: "idea" }));
});
test("incomplete and invalid answers cannot produce a report", () => {
  assert.equal(makePlan({}), null);
  assert.equal(makePlan({ ...answers, pace: "invalid" }), null);
  assert.equal(makePlan(answers).version, "planning-demo-1.0");
});
test("readiness uses the documented endpoints and identifies gaps", () => {
  assert.deepEqual(readinessResult(Array(8).fill(2)), {
    dimensions: [100, 100, 100, 100, 100],
    score: 100,
    gaps: [],
  });
  assert.equal(readinessResult(Array(8).fill(0)).score, 0);
  assert.equal(readinessResult(Array(8).fill(1)).score, 50);
  assert.deepEqual(readinessResult([0, 2, 2, 2, 2, 2, 2, 2]).gaps, [0]);
  for (const bad of [null, [], Array(8).fill("2"), Array(8).fill(3)])
    assert.equal(readinessResult(bad), null);
});
test("storage drops arbitrary personal fields and restores only valid preset choices", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(
    writeSession(storage, {
      draft: { ...answers, privateNote: "do-not-save" },
      savedPlan: { answers, contact: "do-not-save" },
      privateNote: "do-not-save",
      status: "invalid",
    }),
    true,
  );
  assert.ok(!values.get(SESSION_KEY).includes("do-not-save"));
  assert.deepEqual(readSession(storage).draft, answers);
  assert.equal(readSession(storage).status, "new");
  assert.ok(readSession(storage).savedPlan);
  values.set(
    SESSION_KEY,
    '{"draft":{"goal":"unknown"},"readiness":[99],"savedPlan":{"answers":{}}}',
  );
  assert.deepEqual(readSession(storage).draft, {});
  assert.equal(readSession(storage).savedPlan, null);
  assert.equal(readSession(storage).readiness, null);
});
test("corrupt or blocked storage does not crash the experience", () => {
  assert.deepEqual(readSession({ getItem: () => "{invalid" }).draft, {});
  assert.deepEqual(readSession(null).draft, {});
  assert.equal(writeSession(null, { draft: answers }), false);
});
