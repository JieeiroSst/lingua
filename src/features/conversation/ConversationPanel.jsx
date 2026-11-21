import React from "react";
import { useLiveTranslation } from "./hooks/useLiveTranslation.js";
import { LockIcon, MicrophoneIcon, SpeakerIcon } from "../../shared/components/Icons.jsx";

const VIETNAMESE_TO_ENGLISH = {
  key: "vi-en",
  sourceLanguage: "vi",
  targetLanguage: "en",
  recognitionLanguage: "vi-VN",
  targetLocale: "en-US",
  sourceFlag: "🇻🇳",
  sourceLabel: "TIẾNG VIỆT",
  targetFlag: "🇬🇧",
  targetLabel: "ENGLISH",
  sourcePlaceholder: "Hãy nói tiếng Việt…",
  targetPlaceholder: "Bản dịch tiếng Anh sẽ xuất hiện tại đây…",
  recordLabel: "Tôi nói tiếng Việt",
};

const ENGLISH_TO_VIETNAMESE = {
  key: "en-vi",
  sourceLanguage: "en",
  targetLanguage: "vi",
  recognitionLanguage: "en-US",
  targetLocale: "vi-VN",
  sourceFlag: "🇬🇧",
  sourceLabel: "ENGLISH",
  targetFlag: "🇻🇳",
  targetLabel: "TIẾNG VIỆT",
  sourcePlaceholder: "Người nói tiếng Anh hãy nói…",
  targetPlaceholder: "Bản dịch tiếng Việt sẽ xuất hiện tại đây…",
  recordLabel: "Người kia nói tiếng Anh",
};

function ConversationDirection({ config, state, isBlocked, onSpeak }) {
  const {
    alternatives,
    awaitingConfirmation,
    chooseAlternative,
    confirmTranslation,
    discardTurn,
    error,
    interimText,
    isListening,
    sourceText,
    status,
    toggleListening,
    translateDraft,
    translation,
    translationNote,
    updateDraft,
    updateTranslation,
  } = state;

  return (
    <article className="direction-panel">
      <div className="direction-heading">
        <div>
          <span className="learning-kicker">LƯỢT HỘI THOẠI</span>
          <h3>
            <span>{config.sourceFlag}</span> {config.recordLabel}
          </h3>
        </div>
        <span
          className={`live-badge${status === "listening" ? " is-listening" : ""}${status === "error" ? " is-error" : ""}`}
        >
          <span className="live-dot" aria-hidden="true" />
          {status === "listening"
            ? "Đang nghe"
            : status === "translating"
              ? "Đang dịch"
              : status === "review"
                ? "Kiểm tra"
                : status === "confirm"
                  ? "Chờ xác nhận"
                : status === "error"
                  ? "Có lỗi"
                  : "Sẵn sàng"}
        </span>
      </div>

      <div className="translation-grid">
        <article className="language-card source-card">
          <div className="card-topline">
            <span className="language-label">
              <span className="flag">{config.sourceFlag}</span> {config.sourceLabel}
            </span>
            <span className="card-hint">Đầu vào</span>
          </div>
          <div className="transcript-area" aria-live="polite">
            {!sourceText && !interimText && (
              <p className="placeholder">{config.sourcePlaceholder}</p>
            )}
            {sourceText && (
              <textarea
                className="transcript-editor"
                aria-label={`Bản chép lời ${config.sourceLabel} — kiểm tra và chỉnh sửa`}
                disabled={isListening}
                maxLength={10000}
                rows={3}
                value={sourceText}
                onChange={(event) => updateDraft(event.target.value)}
              />
            )}
            {interimText && <p className="interim-transcript">{interimText}</p>}
            {!isListening && alternatives.length > 0 && (
              <div className="recognition-alternatives">
                <span>Phương án nhận diện khác</span>
                {alternatives.map((alternative, index) => (
                  <button
                    className="alternative-button"
                    key={`${alternative.transcript}-${index}`}
                    type="button"
                    onClick={() => chooseAlternative(alternative.transcript)}
                  >
                    {alternative.transcript}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="source-footer">
            <span className={`microphone-indicator${isListening ? " is-active" : ""}`} aria-hidden="true">
              <span />
            </span>
            <span>
              {isListening
                ? "Nói rõ từng câu, tránh nơi ồn"
                : sourceText
                  ? "Kiểm tra nội dung trước khi dịch"
                  : "Bấm micro để bắt đầu lượt nói"}
            </span>
          </div>
        </article>

        <div className="direction-arrow" aria-hidden="true">→</div>

        <article className="language-card result-card">
          <div className="card-topline">
            <span className="language-label">
              <span className="flag">{config.targetFlag}</span> {config.targetLabel}
            </span>
            <span className="card-hint">Bản dịch</span>
          </div>
          <div className="transcript-area" aria-live="polite">
            {!translation && <p className="placeholder">{config.targetPlaceholder}</p>}
            {translation && awaitingConfirmation ? (
              <textarea
                className="translation-editor"
                aria-label={`Bản dịch ${config.targetLabel} — kiểm tra và chỉnh sửa`}
                maxLength={20000}
                rows={3}
                value={translation}
                onChange={(event) => updateTranslation(event.target.value)}
              />
            ) : (
              translation && <p className="translation-text">{translation}</p>
            )}
          </div>
          <div className="result-footer">
            <span className="service-note">{translationNote}</span>
            <button
              className="icon-button"
              type="button"
              aria-label={`Nghe bản dịch ${config.targetLabel}`}
              title="Nghe lại bản dịch"
              disabled={!translation || awaitingConfirmation}
              onClick={() => onSpeak(translation, config.targetLocale)}
            >
              <SpeakerIcon />
            </button>
          </div>
        </article>
      </div>

      <div className="direction-controls">
        <button
          className={`record-button${isListening ? " is-recording" : ""}`}
          type="button"
          disabled={isBlocked || status === "translating" || awaitingConfirmation}
          onClick={toggleListening}
        >
          <span className="record-icon" aria-hidden="true"><MicrophoneIcon /></span>
          <span>{isListening ? "Dừng lượt nói" : config.recordLabel}</span>
        </button>
        {sourceText && !isListening && (!translation || awaitingConfirmation) && (
          <button
            className="translate-button"
            type="button"
            disabled={
              !sourceText.trim() ||
              (awaitingConfirmation && !translation.trim()) ||
              isBlocked ||
              status === "translating"
            }
            onClick={awaitingConfirmation ? confirmTranslation : translateDraft}
          >
            {status === "translating"
              ? "Đang dịch…"
              : awaitingConfirmation
                ? "Xác nhận và phát"
                : "Dịch và kiểm tra"}
          </button>
        )}
        {awaitingConfirmation && (
          <button className="discard-turn-button" type="button" onClick={discardTurn}>
            Hủy lượt
          </button>
        )}
        {isBlocked && <span className="practice-listening">Micro đang được dùng ở lượt kia.</span>}
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
    </article>
  );
}

function ConversationPanel({ onTranslated, onSpeak, sharedError, isSpeaking }) {
  const vietnameseToEnglish = useLiveTranslation({
    onTranslated,
    onSpeak,
    recognitionLanguage: VIETNAMESE_TO_ENGLISH.recognitionLanguage,
    sourceLanguage: VIETNAMESE_TO_ENGLISH.sourceLanguage,
    targetLanguage: VIETNAMESE_TO_ENGLISH.targetLanguage,
    targetLocale: VIETNAMESE_TO_ENGLISH.targetLocale,
  });
  const englishToVietnamese = useLiveTranslation({
    onTranslated,
    onSpeak,
    recognitionLanguage: ENGLISH_TO_VIETNAMESE.recognitionLanguage,
    sourceLanguage: ENGLISH_TO_VIETNAMESE.sourceLanguage,
    targetLanguage: ENGLISH_TO_VIETNAMESE.targetLanguage,
    targetLocale: ENGLISH_TO_VIETNAMESE.targetLocale,
  });

  return (
    <section className="bidirectional-conversation" aria-labelledby="conversation-title">
      <div className="conversation-heading">
        <div>
          <h2 id="conversation-title">Hội thoại hai chiều</h2>
          <p>
            Kiểm tra câu gốc và bản dịch trước khi xác nhận. Dịch máy không đảm bảo đúng tuyệt đối.
          </p>
        </div>
        <span className="conversation-direction-label">VI <span>↔</span> EN</span>
      </div>

      {sharedError && <p className="error-message" role="alert">{sharedError}</p>}

      <div className="direction-panels">
        <ConversationDirection
          config={VIETNAMESE_TO_ENGLISH}
          state={vietnameseToEnglish}
          isBlocked={englishToVietnamese.isListening || isSpeaking}
          onSpeak={onSpeak}
        />
        <ConversationDirection
          config={ENGLISH_TO_VIETNAMESE}
          state={englishToVietnamese}
          isBlocked={vietnameseToEnglish.isListening || isSpeaking}
          onSpeak={onSpeak}
        />
      </div>
      <p className="privacy-note conversation-privacy-note">
        <LockIcon />
        Nói luân phiên: mỗi lần chỉ một micro hoạt động. Bản dịch không được phát trước khi xác nhận.
      </p>
    </section>
  );
}

export default ConversationPanel;
