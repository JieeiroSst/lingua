import React from "react";
import { HistoryIcon } from "../../shared/components/Icons.jsx";

function HistoryEntry({ item, onSpeak }) {
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(item.createdAt);

  return (
    <article className="history-entry">
      <div className="history-entry-meta">
        <span className="history-entry-type">
          {item.kind === "pronunciation"
            ? "CHẤM PHÁT ÂM"
            : item.kind === "practice"
              ? "LUYỆN PHÁT ÂM"
              : item.sourceLanguage === "en"
                ? "ENGLISH → TIẾNG VIỆT"
                : "TIẾNG VIỆT → ENGLISH"}
        </span>
        <time dateTime={new Date(item.createdAt).toISOString()}>{time}</time>
      </div>
      <p>{item.source}</p>
      {item.kind !== "practice" && item.translation && (
        <p className="history-translation">
          {item.kind === "pronunciation" ? `Bạn đã nói: ${item.translation}` : item.translation}
        </p>
      )}
      {item.kind === "pronunciation" && (
        <p className="history-score">Điểm so khớp: {item.score}/100</p>
      )}
      <button
        className="history-play"
        type="button"
        onClick={() =>
          onSpeak(item.kind === "pronunciation" || item.kind === "practice"
            ? item.source
            : item.translation,
          item.targetLocale || "en-US")
        }
      >
        ▶ Nghe tiếng Anh
      </button>
    </article>
  );
}

function HistoryPanel({ entries, onClear, onSpeak }) {
  return (
    <aside className="history-panel" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <div className="history-title-row">
            <h2 id="history-title">Lịch sử</h2>
            <span className="history-count">{entries.length}</span>
          </div>
          <p>Các câu trong phiên của bạn</p>
        </div>
        <button className="clear-button" type="button" disabled={entries.length === 0} onClick={onClear}>
          Xóa
        </button>
      </div>
      <div className="history-list" aria-live="polite">
        {entries.length === 0 ? (
          <div className="history-empty">
            <span className="empty-icon" aria-hidden="true"><HistoryIcon /></span>
            <strong>Chưa có hội thoại</strong>
            <span>Bản dịch và câu đã luyện sẽ được lưu tại đây.</span>
          </div>
        ) : (
          entries.map((item) => <HistoryEntry key={item.id} item={item} onSpeak={onSpeak} />)
        )}
      </div>
      <div className="history-footer">
        <span className="history-save-icon" aria-hidden="true">↳</span>
        Lịch sử được lưu trên thiết bị này
      </div>
    </aside>
  );
}

export default HistoryPanel;
