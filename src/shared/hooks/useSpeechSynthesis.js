import { useEffect, useRef, useState } from "react";

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState([]);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  useEffect(
    () => () => {
      activeUtteranceRef.current = null;
      window.speechSynthesis?.cancel();
    },
    [],
  );

  function speak(text, language = "en-US") {
    const phrase = text.trim();
    if (!phrase) return;
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setError("Trình duyệt này chưa hỗ trợ đọc văn bản thành tiếng.");
      return;
    }

    setError("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = language;
    const voice =
      voices.find((item) => item.lang.toLowerCase() === language.toLowerCase()) ||
      voices.find((item) =>
        item.lang.toLowerCase().startsWith(language.split("-")[0].toLowerCase()),
      );
    if (voices.length > 0 && !voice) {
      setError(`Thiết bị chưa có giọng đọc ${language}. Hãy cài giọng này hoặc chọn giọng khác.`);
      return;
    }
    if (voice) utterance.voice = voice;
    activeUtteranceRef.current = utterance;
    setIsSpeaking(true);
    const finishUtterance = () => {
      if (activeUtteranceRef.current === utterance) {
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
      }
    };
    utterance.onend = finishUtterance;
    utterance.onerror = (event) => {
      finishUtterance();
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setError("Không thể phát giọng đọc trên thiết bị này.");
      }
    };
    try {
      window.speechSynthesis.speak(utterance);
    } catch (speechError) {
      finishUtterance();
      console.error("Could not start speech synthesis.", speechError);
      setError("Không thể phát giọng đọc trên thiết bị này.");
    }
  }

  return { speak, error, isSpeaking };
}
