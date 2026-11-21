const MAX_TRANSLATION_LENGTH = 450;
const MAX_INPUT_LENGTH = 10000;
const TRANSLATION_URL = "https://api.mymemory.translated.net/get";
const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);

function splitForTranslation(text) {
  const chunks = [];
  let remaining = text.trim();

  while (remaining.length > MAX_TRANSLATION_LENGTH) {
    let splitAt = remaining.lastIndexOf(" ", MAX_TRANSLATION_LENGTH);
    if (splitAt < MAX_TRANSLATION_LENGTH * 0.6) splitAt = MAX_TRANSLATION_LENGTH;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

async function translateChunk(text, sourceLanguage, targetLanguage) {
  const url = new URL(TRANSLATION_URL);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Translation service returned ${response.status}`);

  const result = await response.json();
  if (result.responseStatus !== 200 || typeof result.responseData?.translatedText !== "string") {
    throw new Error(result.responseDetails || "Translation service returned an invalid response");
  }
  return result.responseData.translatedText;
}

export async function translateText(text, sourceLanguage, targetLanguage) {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError("Translation input must be a non-empty string.");
  }
  if (text.length > MAX_INPUT_LENGTH) {
    throw new RangeError("Translation input exceeds the maximum length.");
  }
  if (!SUPPORTED_LANGUAGES.has(sourceLanguage) || !SUPPORTED_LANGUAGES.has(targetLanguage)) {
    throw new TypeError("Unsupported translation language.");
  }

  const translations = [];
  for (const chunk of splitForTranslation(text)) {
    translations.push(await translateChunk(chunk, sourceLanguage, targetLanguage));
  }
  return translations.join(" ");
}
