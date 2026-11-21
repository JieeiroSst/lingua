function tokenize(text) {
  return text
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function wordEditDistance(expected, actual) {
  let previousRow = Array.from({ length: actual.length + 1 }, (_, index) => index);

  for (let expectedIndex = 1; expectedIndex <= expected.length; expectedIndex += 1) {
    const currentRow = [expectedIndex];
    for (let actualIndex = 1; actualIndex <= actual.length; actualIndex += 1) {
      const substitutionCost =
        expected[expectedIndex - 1] === actual[actualIndex - 1] ? 0 : 1;
      currentRow[actualIndex] = Math.min(
        currentRow[actualIndex - 1] + 1,
        previousRow[actualIndex] + 1,
        previousRow[actualIndex - 1] + substitutionCost,
      );
    }
    previousRow = currentRow;
  }

  return previousRow[actual.length];
}

export function scorePronunciation(expectedText, recognizedText) {
  const expected = tokenize(expectedText);
  const actual = tokenize(recognizedText);
  if (expected.length === 0) throw new TypeError("Expected phrase must contain words.");

  const wordErrors = wordEditDistance(expected, actual);
  const denominator = Math.max(expected.length, actual.length, 1);
  return {
    score: Math.round(Math.max(0, 1 - wordErrors / denominator) * 100),
    wordErrors,
    expectedWords: expected.length,
    recognizedWords: actual.length,
  };
}
