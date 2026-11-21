const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const ENGLISH_WORD_PATTERN = /^[a-z]+(?:['-][a-z]+)*$/i;

function getPronunciationAudio(phonetics) {
  const audio = phonetics.find((item) => typeof item.audio === "string" && item.audio)?.audio;
  if (!audio) return "";

  try {
    const url = new URL(audio, "https://api.dictionaryapi.dev");
    return url.protocol === "https:" && url.hostname === "api.dictionaryapi.dev"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

export async function lookupEnglishWord(input) {
  const word = input.trim();
  if (!ENGLISH_WORD_PATTERN.test(word) || word.length > 60) {
    throw new TypeError("Hãy nhập một từ tiếng Anh, không phải cả câu.");
  }

  const response = await fetch(
    `${DICTIONARY_URL}${encodeURIComponent(word.toLowerCase())}`,
    { signal: AbortSignal.timeout(12000) },
  );
  if (response.status === 404) throw new Error("Chưa tìm thấy từ này trong từ điển.");
  if (!response.ok) throw new Error("Không thể tra từ lúc này. Hãy thử lại sau.");

  const entries = await response.json();
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("Từ điển trả về dữ liệu không hợp lệ.");
  }

  const entry = entries[0];
  const phonetics = entries.flatMap((item) =>
    Array.isArray(item.phonetics) ? item.phonetics : [],
  );
  const meanings = entries
    .flatMap((item) =>
      (item.meanings || []).map((meaning) => ({
        partOfSpeech: meaning.partOfSpeech || "",
        definitions: (meaning.definitions || [])
          .slice(0, 2)
          .map((definition) => ({
            definition: definition.definition || "",
            example: definition.example || "",
          }))
          .filter((definition) => definition.definition),
      })),
    )
    .filter((meaning) => meaning.definitions.length > 0)
    .slice(0, 4);

  if (meanings.length === 0) throw new Error("Từ điển không có định nghĩa cho từ này.");

  return {
    word: entry.word || word,
    phonetic:
      entries.find((item) => item.phonetic)?.phonetic ||
      phonetics.find((item) => item.text)?.text ||
      "",
    audioUrl: getPronunciationAudio(phonetics),
    meanings,
  };
}
