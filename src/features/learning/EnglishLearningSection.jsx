import React from "react";
import DictionaryPanel from "../dictionary/DictionaryPanel.jsx";
import PronunciationPanel from "../pronunciation/PronunciationPanel.jsx";

function EnglishLearningSection({
  practicePhrase,
  onPracticePhraseChange,
  onPronunciationScored,
  onSpeak,
}) {
  return (
    <section className="learning-section" aria-labelledby="learning-title">
      <div className="learning-section-heading">
        <div className="eyebrow"><span /> XÂY DỰNG VỐN TỪ VÀ SỰ TỰ TIN</div>
        <h2 id="learning-title">Góc học tiếng Anh</h2>
        <p>Tra từ mới, nghe cách đọc và luyện nói với phản hồi tức thì.</p>
      </div>
      <div className="learning-grid">
        <DictionaryPanel onPractice={onPracticePhraseChange} />
        <PronunciationPanel
          phrase={practicePhrase}
          onPhraseChange={onPracticePhraseChange}
          onScored={onPronunciationScored}
          onSpeak={onSpeak}
        />
      </div>
    </section>
  );
}

export default EnglishLearningSection;
