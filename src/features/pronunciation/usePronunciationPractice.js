import { useCallback, useEffect, useRef, useState } from "react";
import { scorePronunciation } from "./pronunciationScoring.js";

const SpeechRecognition =
  typeof window === "undefined"
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function usePronunciationPractice(onScored) {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const finishedRef = useRef(false);
  const errorRef = useRef(false);
  const listeningRef = useRef(false);
  const onScoredRef = useRef(onScored);

  useEffect(() => {
    onScoredRef.current = onScored;
  }, [onScored]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
    },
    [],
  );

  function startPractice(targetPhrase) {
    const expected = targetPhrase.trim();
    if (!expected) {
      setError("Nhập câu mẫu trước khi luyện phát âm.");
      setStatus("error");
      return;
    }
    if (!SpeechRecognition) {
      setError("Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome hoặc Edge.");
      setStatus("error");
      return;
    }

    setError("");
    errorRef.current = false;
    finishedRef.current = false;
    setTranscript("");
    setScore(null);
    setStatus("listening");
    listeningRef.current = true;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(" ");
      if (!spokenText) return;

      const result = scorePronunciation(expected, spokenText);
      finishedRef.current = true;
      listeningRef.current = false;
      setTranscript(spokenText);
      setScore(result);
      setStatus("scored");
      onScoredRef.current({
        kind: "pronunciation",
        source: expected,
        translation: spokenText,
        score: result.score,
      });
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      listeningRef.current = false;
      errorRef.current = true;
      setStatus("error");
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Cần cấp quyền micro để luyện phát âm.");
      } else if (event.error === "no-speech") {
        setError("Chưa nhận được giọng nói. Hãy thử lại và nói gần micro hơn.");
      } else {
        setError("Không thể nhận diện câu vừa đọc. Hãy kiểm tra micro/kết nối rồi thử lại.");
      }
    };
    recognition.onend = () => {
      listeningRef.current = false;
      if (!finishedRef.current && !errorRef.current) setStatus("idle");
    };

    try {
      recognition.start();
    } catch (startError) {
      console.error("Could not start pronunciation recognition.", startError);
      errorRef.current = true;
      listeningRef.current = false;
      setStatus("error");
      setError("Không thể bật micro. Hãy kiểm tra quyền truy cập rồi thử lại.");
    }
  }

  function stopPractice() {
    recognitionRef.current?.stop();
  }

  const resetResult = useCallback(() => {
    if (listeningRef.current) {
      recognitionRef.current?.abort();
      listeningRef.current = false;
    }
    setError("");
    setScore(null);
    setTranscript("");
    setStatus("idle");
  }, []);

  return { error, resetResult, score, startPractice, status, stopPractice, transcript };
}
