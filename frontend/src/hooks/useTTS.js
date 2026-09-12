import { useState, useEffect, useCallback, useRef } from "react";
import speechService from "../services/voice/speechService";
import { useDashboard } from "../context/DashboardContext";

export function useTTS() {
  const { lang, isVoiceOn } = useDashboard();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceTextRef = useRef("");

  const stop = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
    currentUtteranceTextRef.current = "";
  }, []);

  const speak = useCallback(
    (text, targetLang = lang, onDone) => {
      if (!text) return;
      currentUtteranceTextRef.current = text;
      setIsSpeaking(true);

      speechService.speak(text, {
        lang: targetLang || lang || "hi",
        rate: 0.92,
        pitch: 1.0,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          currentUtteranceTextRef.current = "";
          onDone?.();
        },
        onError: () => {
          setIsSpeaking(false);
          currentUtteranceTextRef.current = "";
        },
      });
    },
    [lang]
  );

  const toggleSpeak = useCallback(
    (text, targetLang = lang) => {
      if (isSpeaking && currentUtteranceTextRef.current === text) {
        stop();
      } else {
        speak(text, targetLang);
      }
    },
    [isSpeaking, speak, stop, lang]
  );

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  return {
    speak,
    stop,
    toggleSpeak,
    isSpeaking,
    isVoiceOn,
    lang,
    isSupported: speechService.isSupported(),
  };
}

export default useTTS;
