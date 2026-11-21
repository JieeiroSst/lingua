import React, { useRef, useState } from "react";
import { translateText } from "../../shared/services/translationService.js";
import { lookupEnglishWord } from "./dictionaryService.js";

function DictionaryPanel({ onPractice }) {
  const [query, setQuery] = useState("");
  const [entry, setEntry] = useState(null);
  const [vietnameseMeaning, setVietnameseMeaning] = useState("");
  const [loading, setLoading] = useState(false);
  const [meaningLoading, setMeaningLoading] = useState(false);
  const [error, setError] = useState("");
  const [meaningError, setMeaningError] = useState("");
  const [audioError, setAudioError] = useState("");
  const requestIdRef = useRef(0);

  async function handleSearch(event) {
    event.preventDefault();
    const word = query.trim();
    if (!word) {
      setError("Nhập một từ tiếng Anh để tra cứu.");
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setMeaningLoading(false);
    setEntry(null);
    setVietnameseMeaning("");
    setError("");
    setMeaningError("");
    setAudioError("");

    try {
      const result = await lookupEnglishWord(word);
      if (requestId !== requestIdRef.current) return;
      setEntry(result);
      setMeaningLoading(true);

      try {
        const meaning = await translateText(result.word, "en", "vi");
        if (requestId === requestIdRef.current) setVietnameseMeaning(meaning);
      } catch (translationError) {
        console.error("Could not translate dictionary word.", translationError);
        if (requestId === requestIdRef.current) {
          setMeaningError("Không thể tải nghĩa tiếng Việt. Các định nghĩa tiếng Anh vẫn có thể xem.");
        }
      } finally {
        if (requestId === requestIdRef.current) setMeaningLoading(false);
      }
    } catch (lookupError) {
      if (requestId === requestIdRef.current) {
        console.error("Dictionary lookup failed.", lookupError);
        setError(lookupError.message || "Tra từ thất bại. Hãy thử lại.");
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  async function playPronunciation() {
    if (!entry?.audioUrl) return;
    setAudioError("");
    try {
      await new Audio(entry.audioUrl).play();
    } catch (playError) {
      console.error("Could not play dictionary audio.", playError);
      setAudioError("Không thể phát âm thanh mẫu trên thiết bị này.");
    }
  }

  return (
    <article className="learning-card dictionary-card">
      <div className="learning-card-heading">
        <div>
          <span className="learning-kicker">TRA CỨU</span>
          <h3>Từ điển Anh – Việt</h3>
          <p>Tra nghĩa, phiên âm và nghe phát âm mẫu.</p>
        </div>
        <span className="learning-card-icon" aria-hidden="true">Aa</span>
      </div>

      <form className="dictionary-search" onSubmit={handleSearch}>
        <label className="visually-hidden" htmlFor="dictionary-word">Từ tiếng Anh cần tra</label>
        <input
          id="dictionary-word"
          type="text"
          maxLength="60"
          placeholder="Ví dụ: beautiful"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="read-button" type="submit" disabled={loading}>
          {loading ? "Đang tra…" : "Tra từ"}
        </button>
      </form>

      {error && <p className="learning-error" role="alert">{error}</p>}

      {entry && (
        <div className="dictionary-result" aria-live="polite">
          <div className="dictionary-word-heading">
            <div>
              <h4>{entry.word}</h4>
              {entry.phonetic && <span className="phonetic-text">{entry.phonetic}</span>}
            </div>
            <div className="dictionary-actions">
              {entry.audioUrl && (
                <button className="icon-button" type="button" aria-label="Nghe phát âm mẫu" onClick={playPronunciation}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  </svg>
                </button>
              )}
              <button
                className="dictionary-practice-button"
                type="button"
                onClick={() => onPractice(entry.word)}
              >
                Luyện từ này
              </button>
            </div>
          </div>

          <p className="vietnamese-meaning">
            <strong>Nghĩa tiếng Việt:</strong>{" "}
            {meaningLoading ? "Đang tải…" : vietnameseMeaning || "Chưa có bản dịch"}
          </p>
          {meaningError && <p className="learning-warning" role="status">{meaningError}</p>}
          {audioError && <p className="learning-warning" role="status">{audioError}</p>}

          <div className="definition-list">
            {entry.meanings.map((meaning, index) => (
              <div className="definition-item" key={`${meaning.partOfSpeech}-${index}`}>
                {meaning.partOfSpeech && <span className="part-of-speech">{meaning.partOfSpeech}</span>}
                {meaning.definitions.map((definition, definitionIndex) => (
                  <div key={`${definition.definition}-${definitionIndex}`}>
                    <p>{definition.definition}</p>
                    {definition.example && <p className="definition-example">“{definition.example}”</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default DictionaryPanel;
