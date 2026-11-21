import React, { useState } from "react";
import ConversationPanel from "../features/conversation/ConversationPanel.jsx";
import EnglishLearningSection from "../features/learning/EnglishLearningSection.jsx";
import HistoryPanel from "../features/history/HistoryPanel.jsx";
import { useConversationHistory } from "../features/history/useConversationHistory.js";
import EnglishPracticeForm from "../features/practice/EnglishPracticeForm.jsx";
import { useSpeechSynthesis } from "../shared/hooks/useSpeechSynthesis.js";

function App() {
  const { entries, error: historyError, addEntry, clearHistory } = useConversationHistory();
  const { speak, error: speechError, isSpeaking } = useSpeechSynthesis();
  const [practicePhrase, setPracticePhrase] = useState("I would like to order a cup of coffee.");
  const sharedError = historyError || speechError;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Lingua trang chủ">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span>lingua<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-note">
          <span className="topbar-note-dot" aria-hidden="true" />
          Trợ lý ngôn ngữ cá nhân
        </div>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow"><span /> NÓI TỰ NHIÊN, HIỂU TỨC THÌ</div>
          <h1 id="page-title">Một cuộc trò chuyện.<br /><span>Hai ngôn ngữ.</span></h1>
          <p>
            Dịch hội thoại luân phiên giữa tiếng Việt và tiếng Anh, kèm từ điển và công cụ luyện nói.
          </p>
        </section>

        <section className="workspace" aria-label="Công cụ dịch và luyện nói">
          <div className="conversation-panel">
            <ConversationPanel
              onTranslated={addEntry}
              onSpeak={speak}
              sharedError={sharedError}
              isSpeaking={isSpeaking}
            />
            <EnglishPracticeForm onSpeak={speak} onSave={addEntry} />
          </div>
          <HistoryPanel entries={entries} onClear={clearHistory} onSpeak={speak} />
        </section>

        <EnglishLearningSection
          practicePhrase={practicePhrase}
          onPracticePhraseChange={setPracticePhrase}
          onPronunciationScored={addEntry}
          onSpeak={speak}
        />

        <footer className="page-footer">
          <span>LINGUA <span className="footer-divider">/</span> HỌC NGÔN NGỮ THEO CÁCH CỦA BẠN</span>
          <span>Được thiết kế cho những cuộc trò chuyện không biên giới.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
