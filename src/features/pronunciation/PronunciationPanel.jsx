import React, { useEffect } from "react";
import { usePronunciationPractice } from "./usePronunciationPractice.js";
import { SpeakerIcon } from "../../shared/components/Icons.jsx";

function PronunciationPanel({ phrase, onPhraseChange, onScored, onSpeak }) {
  const { error, resetResult, score, startPractice, status, stopPractice, transcript } =
    usePronunciationPractice(onScored);
  const isListening = status === "listening";

  useEffect(() => {
    resetResult();
  }, [phrase, resetResult]);

  return (
    <article className="learning-card pronunciation-card">
      <div className="learning-card-heading">
        <div>
          <span className="learning-kicker">LUYỆN NÓI</span>
          <h3>Luyện phát âm</h3>
          <p>Đọc câu mẫu bằng tiếng Anh để nhận điểm so khớp.</p>
        </div>
        <span className="learning-card-icon" aria-hidden="true">Aa</span>
      </div>

      <label className="practice-label" htmlFor="practice-phrase">Câu tiếng Anh mẫu</label>
      <textarea
        id="practice-phrase"
        className="practice-phrase"
        maxLength={500}
        rows={3}
        disabled={isListening}
        value={phrase}
        onChange={(event) => onPhraseChange(event.target.value)}
      />
      <div className="pronunciation-controls">
        <button
          className="icon-button"
          type="button"
          aria-label="Nghe câu mẫu"
          title="Nghe câu mẫu"
          disabled={!phrase.trim()}
          onClick={() => onSpeak(phrase)}
        >
          <SpeakerIcon />
        </button>
        {isListening ? (
          <button className="record-button is-recording" type="button" onClick={stopPractice}>
            Dừng ghi âm
          </button>
        ) : (
          <button
            className="record-button"
            type="button"
            disabled={!phrase.trim()}
            onClick={() => startPractice(phrase)}
          >
            Bắt đầu luyện
          </button>
        )}
        {isListening && <span className="practice-listening">Đang nghe tiếng Anh…</span>}
      </div>

      {error && <p className="learning-error" role="alert">{error}</p>}

      {score && (
        <div className="score-result" aria-live="polite">
          <div className="score-circle" aria-label={`Điểm so khớp ${score.score} trên 100`}>
            <strong>{score.score}</strong>
            <span>/ 100</span>
          </div>
          <div className="score-copy">
            <strong>
              {score.score >= 90 ? "Rất tốt!" : score.score >= 70 ? "Khá tốt!" : "Thử lại nhé"}
            </strong>
            <p>
              {score.wordErrors === 0
                ? "Nhận diện khớp toàn bộ từ trong câu mẫu."
                : `Có ${score.wordErrors} từ khác hoặc chưa được nhận diện.`}
            </p>
          </div>
          <div className="score-transcripts">
            <p><span>Câu mẫu</span>{phrase}</p>
            <p><span>Bạn đã nói</span>{transcript}</p>
          </div>
        </div>
      )}

      <p className="score-disclaimer">
        Điểm là độ khớp văn bản nhận diện với câu mẫu, không đánh giá chính xác âm vị hay giọng chuẩn.
      </p>
    </article>
  );
}

export default PronunciationPanel;
