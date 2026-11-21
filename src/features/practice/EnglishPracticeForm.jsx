import React, { useState } from "react";
import { SpeakerIcon } from "../../shared/components/Icons.jsx";

function EnglishPracticeForm({ onSpeak, onSave }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const phrase = text.trim();
    if (!phrase) return;

    onSpeak(phrase);
    onSave({ kind: "practice", source: phrase, translation: "" });
    setText("");
  }

  return (
    <>
      <div className="divider"><span>HOẶC LUYỆN NÓI</span></div>
      <form className="text-to-speech" onSubmit={handleSubmit}>
        <label htmlFor="english-input">Nhập văn bản tiếng Anh</label>
        <div className="input-row">
          <input
            id="english-input"
            name="english"
            type="text"
            maxLength="1000"
            placeholder="Type something in English…"
            autoComplete="off"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <button className="read-button" type="submit">
            <SpeakerIcon />
            <span>Nghe phát âm</span>
          </button>
        </div>
        <p className="input-helper">Dùng giọng đọc tiếng Anh có sẵn trên thiết bị của bạn.</p>
      </form>
    </>
  );
}

export default EnglishPracticeForm;
