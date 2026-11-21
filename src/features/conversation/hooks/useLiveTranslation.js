import { useEffect, useRef, useState } from "react";
import { translateText } from "../../../shared/services/translationService.js";

const SpeechRecognition =
  typeof window === "undefined"
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

const RECOGNITION_ERRORS = {
  "not-allowed": "Micro bị chặn. Hãy cấp quyền sử dụng micro trong cài đặt trình duyệt.",
  "service-not-allowed": "Trình duyệt không cho phép nhận diện giọng nói.",
  "no-speech": "Chưa nghe thấy giọng nói. Hãy thử nói lại gần micro hơn.",
  "audio-capture": "Không tìm thấy micro. Hãy kiểm tra thiết bị âm thanh.",
  network: "Nhận diện giọng nói cần kết nối mạng. Hãy kiểm tra kết nối rồi thử lại.",
};

function joinSegments(segments) {
  return segments.map((segment) => segment.transcript).filter(Boolean).join(" ");
}

export function useLiveTranslation({
  onTranslated,
  onSpeak,
  recognitionLanguage,
  sourceLanguage,
  targetLanguage,
  targetLocale,
}) {
  const [status, setStatus] = useState("ready");
  const [isListening, setIsListening] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [alternatives, setAlternatives] = useState([]);
  const [translation, setTranslation] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [translationNote, setTranslationNote] = useState(
    "Hãy kiểm tra bản dịch trước khi phát",
  );
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const listeningRef = useRef(false);
  const translatingRef = useRef(false);
  const awaitingConfirmationRef = useRef(false);
  const errorRef = useRef(false);
  const finalizedSegmentsRef = useRef([]);
  const currentSessionSegmentsRef = useRef([]);
  const onTranslatedRef = useRef(onTranslated);
  const onSpeakRef = useRef(onSpeak);

  useEffect(() => {
    onTranslatedRef.current = onTranslated;
  }, [onTranslated]);

  useEffect(() => {
    onSpeakRef.current = onSpeak;
  }, [onSpeak]);

  useEffect(
    () => () => {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
    },
    [],
  );

  function clearError() {
    errorRef.current = false;
    setError("");
  }

  function showError(message) {
    errorRef.current = true;
    setError(message);
    setStatus("error");
  }

  function setListening(listening) {
    listeningRef.current = listening;
    setIsListening(listening);
    if (listening) setStatus("listening");
    else if (!translatingRef.current && !errorRef.current) setStatus("ready");
  }

  function updateRecognizedText() {
    const segments = [
      ...finalizedSegmentsRef.current,
      ...currentSessionSegmentsRef.current,
    ];
    setSourceText(joinSegments(segments));
  }

  function commitRecognitionSession() {
    finalizedSegmentsRef.current = [
      ...finalizedSegmentsRef.current,
      ...currentSessionSegmentsRef.current,
    ];
    currentSessionSegmentsRef.current = [];
    setInterimText("");
    updateRecognizedText();
  }

  async function translateDraft() {
    const phrase = sourceText.trim();
    if (
      !phrase ||
      listeningRef.current ||
      translatingRef.current ||
      awaitingConfirmationRef.current
    ) {
      return;
    }

    clearError();
    setTranslation("");
    setTranslationNote("Đang dịch…");
    translatingRef.current = true;
    setStatus("translating");

    try {
      const translated = await translateText(phrase, sourceLanguage, targetLanguage);
      setTranslation(translated);
      awaitingConfirmationRef.current = true;
      setAwaitingConfirmation(true);
      setTranslationNote("Kiểm tra cả câu gốc và bản dịch trước khi xác nhận");
      setStatus("confirm");
    } catch (translationError) {
      console.error("Translation failed.", translationError);
      setTranslation("");
      setAwaitingConfirmation(false);
      awaitingConfirmationRef.current = false;
      setTranslationNote("Dịch không thành công");
      showError("Không thể dịch lúc này. Hãy kiểm tra kết nối mạng rồi thử lại.");
    } finally {
      translatingRef.current = false;
      if (!errorRef.current && !awaitingConfirmationRef.current) setStatus("ready");
    }
  }

  function confirmTranslation() {
    const phrase = sourceText.trim();
    const translated = translation.trim();
    if (!phrase || !translated || !awaitingConfirmationRef.current) return;

    clearError();
    awaitingConfirmationRef.current = false;
    setAwaitingConfirmation(false);
    setTranslationNote("Đã xác nhận — có thể phát lại bằng nút loa");
    setStatus("ready");
    onTranslatedRef.current({
        kind: "translation",
        sourceLanguage,
        targetLanguage,
        targetLocale,
        source: phrase,
        translation: translated,
      });
    onSpeakRef.current(translated, targetLocale);
  }

  function updateTranslation(text) {
    setTranslation(text);
    setTranslationNote("Bản dịch đã chỉnh sửa — kiểm tra rồi xác nhận để phát");
  }

  function discardTurn() {
    if (listeningRef.current || translatingRef.current) return;
    finalizedSegmentsRef.current = [];
    currentSessionSegmentsRef.current = [];
    setSourceText("");
    setInterimText("");
    setAlternatives([]);
    setTranslation("");
    setAwaitingConfirmation(false);
    awaitingConfirmationRef.current = false;
    setTranslationNote("Hãy kiểm tra bản dịch trước khi phát");
    clearError();
    setStatus("ready");
  }

  function updateDraft(text) {
    setSourceText(text);
    setTranslation("");
    setAwaitingConfirmation(false);
    awaitingConfirmationRef.current = false;
    setTranslationNote("Hãy kiểm tra nội dung rồi bấm Dịch");
    setStatus(text.trim() ? "review" : "ready");
  }

  function chooseAlternative(text) {
    setSourceText(text);
    setInterimText("");
    setTranslation("");
    setAwaitingConfirmation(false);
    awaitingConfirmationRef.current = false;
    setTranslationNote("Đã chọn phương án nhận diện — hãy kiểm tra rồi dịch");
    setStatus("review");
  }

  function createRecognition() {
    const instance = new SpeechRecognition();
    instance.lang = recognitionLanguage;
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 3;
    instance.onstart = () => {
      clearError();
      setListening(true);
    };
    instance.onresult = (event) => {
      const sessionSegments = [];
      let pendingText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          const options = Array.from({ length: result.length }, (_, optionIndex) => ({
            transcript: result[optionIndex].transcript.trim(),
          })).filter((option) => option.transcript);
          if (options.length) {
            sessionSegments.push({ transcript: options[0].transcript, options });
          }
        } else {
          pendingText += `${result[0].transcript.trim()} `;
        }
      }

      currentSessionSegmentsRef.current = sessionSegments;
      updateRecognizedText();
      setInterimText(pendingText.trim());

      const lastSegment = sessionSegments.at(-1);
      if (lastSegment && lastSegment.options.length > 1) {
        const prefix = joinSegments([
          ...finalizedSegmentsRef.current,
          ...sessionSegments.slice(0, -1),
        ]);
        setAlternatives(
          lastSegment.options.slice(1).map((option) => ({
            transcript: [prefix, option.transcript].filter(Boolean).join(" "),
            confidence: option.confidence,
          })),
        );
      } else if (sessionSegments.length) {
        setAlternatives([]);
      }
    };
    instance.onerror = (event) => {
      if (event.error === "aborted") return;
      shouldListenRef.current = false;
      setListening(false);
      showError(
        RECOGNITION_ERRORS[event.error] ||
          "Đã xảy ra lỗi khi nhận diện giọng nói. Hãy thử lại.",
      );
    };
    instance.onend = () => {
      commitRecognitionSession();
      setListening(false);
      if (shouldListenRef.current) {
        try {
          instance.start();
        } catch (recognitionError) {
          console.error("Could not restart speech recognition.", recognitionError);
          shouldListenRef.current = false;
          showError("Không thể tiếp tục nghe. Hãy nhấn nút để bắt đầu lại.");
        }
      } else if (!errorRef.current && finalizedSegmentsRef.current.length) {
        setStatus("review");
      }
    };
    return instance;
  }

  function toggleListening() {
    clearError();
    if (!SpeechRecognition) {
      showError("Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome hoặc Edge.");
      return;
    }

    if (shouldListenRef.current || listeningRef.current) {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      return;
    }

    finalizedSegmentsRef.current = [];
    currentSessionSegmentsRef.current = [];
    setSourceText("");
    setInterimText("");
    setAlternatives([]);
    setTranslation("");
    setAwaitingConfirmation(false);
    awaitingConfirmationRef.current = false;
    setTranslationNote("Hãy kiểm tra bản dịch trước khi phát");
    setStatus("ready");

    const recognition = createRecognition();
    recognitionRef.current = recognition;
    shouldListenRef.current = true;
    setListening(true);
    try {
      recognition.start();
    } catch (recognitionError) {
      console.error("Could not start speech recognition.", recognitionError);
      shouldListenRef.current = false;
      setListening(false);
      showError("Không thể bật micro. Hãy thử tải lại trang hoặc kiểm tra quyền truy cập.");
    }
  }

  return {
    alternatives,
    chooseAlternative,
    error,
    awaitingConfirmation,
    interimText,
    isListening,
    sourceText,
    status,
    toggleListening,
    confirmTranslation,
    discardTurn,
    translateDraft,
    translation,
    translationNote,
    updateDraft,
    updateTranslation,
  };
}
