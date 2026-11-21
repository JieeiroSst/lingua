import assert from "node:assert/strict";
import test from "node:test";
import { scorePronunciation } from "./pronunciationScoring.js";

test("scores a perfect transcript as 100", () => {
  assert.deepEqual(scorePronunciation("I like coffee", "I like coffee"), {
    score: 100,
    wordErrors: 0,
    expectedWords: 3,
    recognizedWords: 3,
  });
});

test("ignores case and punctuation differences", () => {
  assert.equal(scorePronunciation("Hello, WORLD!", "hello world").score, 100);
});

test("penalizes substituted and omitted words", () => {
  assert.equal(scorePronunciation("I like coffee", "I enjoy tea").score, 33);
  assert.equal(scorePronunciation("I like coffee", "I coffee").score, 67);
});
