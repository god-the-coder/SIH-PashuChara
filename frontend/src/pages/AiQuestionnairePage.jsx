import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import { MicIcon, MicOffIcon, CheckIcon, SparklesIcon, SendIcon, ClipboardIcon, SpeakerIcon } from "../components/common/Icons";
import { getActiveBatch } from "../utils/batchStore";
import { useTTS } from "../hooks/useTTS";

const getQuestions = (t) => [
  {
    id: "q_color",
    type: "mcq",
    question: t.aiQ1 || "What color does the fodder appear?",
    hint: t.aiQ1Hint || "Normal color is dark green or yellow-brown.",
    options: [
      t.aiQ1Opt1 || "Dark green (normal)",
      t.aiQ1Opt2 || "Yellow or brown",
      t.aiQ1Opt3 || "Black or patchy",
      t.aiQ1Opt4 || "White mould visible",
    ],
  },
  {
    id: "q_texture",
    type: "mcq",
    question: t.aiQ2 || "How does the fodder feel (texture)?",
    hint: t.aiQ2Hint || "Check by touching with your hand.",
    options: [
      t.aiQ2Opt1 || "Fibrous and fresh (normal)",
      t.aiQ2Opt2 || "Slightly wet and sticky",
      t.aiQ2Opt3 || "Very wet or slimy",
      t.aiQ2Opt4 || "Dry and hard",
    ],
  },
  {
    id: "q_weather",
    type: "mcq",
    question: t.aiQ3 || "How was the weather in the last 3 days?",
    hint: t.aiQ3Hint || "Humid weather increases mould risk.",
    options: [
      t.aiQ3Opt1 || "Clear and sunny",
      t.aiQ3Opt2 || "Partly cloudy",
      t.aiQ3Opt3 || "Rain or high humidity",
      t.aiQ3Opt4 || "Foggy or very cold",
    ],
  },
  {
    id: "q_animals",
    type: "mcq",
    question: t.aiQ4 || "Did the animals show interest in eating this fodder?",
    hint: t.aiQ4Hint || "Animal behaviour is a key quality indicator.",
    options: [
      t.aiQ4Opt1 || "Yes, ate fully (excellent)",
      t.aiQ4Opt2 || "Some hesitation",
      t.aiQ4Opt3 || "Left half uneaten",
      t.aiQ4Opt4 || "Refused completely (serious)",
    ],
  },
  {
    id: "q_observation",
    type: "text",
    question: t.aiQ5 || "Any other special observation you noticed?",
    hint: t.aiQ5Hint || "E.g. insects, unusual heat, leakage, etc. Or write 'None'.",
    placeholder: t.aiQ5Placeholder || "Type here or speak using mic...",
  },
];

function useVoice(onResult) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const start = (lang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { return; }
    const r = new SR();
    r.lang = lang || "hi-IN";
    r.continuous = false;
    r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => { onResult(e.results[0][0].transcript); };
    recognitionRef.current = r;
    r.start();
  };

  const stop = () => { recognitionRef.current?.stop(); setListening(false); };
  return { listening, start, stop };
}

export default function AiQuestionnairePage() {
  const navigate = useNavigate();
  const { t, lang, isVoiceOn, showToast } = useDashboard();
  const { speak, stop: stopTTS, toggleSpeak, isSpeaking } = useTTS();
  const activeBatch = getActiveBatch();
  const questions   = getQuestions(t);

  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState({});
  const [textDraft, setTextDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentQ = questions[step];
  const isLast   = step === questions.length - 1;

  const langTag = useMemo(() => {
    const map = { hi: "hi-IN", en: "en-IN", mr: "mr-IN", ta: "ta-IN", gu: "gu-IN", kn: "kn-IN" };
    return map[lang] || "hi-IN";
  }, [lang]);

  const { listening, start, stop } = useVoice((text) => {
    if (currentQ.type === "text") {
      setTextDraft((prev) => prev ? prev + " " + text : text);
    } else {
      const match = currentQ.options.find(
        (opt) => opt.toLowerCase().includes(text.toLowerCase().slice(0, 5))
      );
      if (match) { setAnswers((prev) => ({ ...prev, [currentQ.id]: match })); showToast("Option selected: " + match); }
      else showToast("Heard: " + text + " - please tap an option");
    }
  });

  useEffect(() => {
    setTextDraft("");
    if (currentQ?.question) {
      const timer = setTimeout(() => {
        speak(currentQ.question, lang, () => {
          // Open audio automatically after screen reading ends
          start(langTag);
        });
      }, 350);
      return () => {
        clearTimeout(timer);
        stopTTS();
        stop();
      };
    }
    return () => {
      stopTTS();
      stop();
    };
  }, [step, currentQ?.question, lang, langTag, speak, stopTTS, start, stop]);

  const handleNext = () => {
    stopTTS();
    if (currentQ.type === "text") {
      if (!textDraft.trim()) { showToast("Please write or speak your answer"); return; }
      setAnswers((prev) => ({ ...prev, [currentQ.id]: textDraft.trim() }));
    } else if (!answers[currentQ.id]) {
      showToast("Please select an option"); return;
    }
    if (isLast) doSubmit();
    else setStep((s) => s + 1);
  };

  const doSubmit = () => {
    const final = currentQ.type === "text"
      ? { ...answers, [currentQ.id]: textDraft.trim() }
      : answers;
    setSubmitting(true);
    try {
      const ex = JSON.parse(sessionStorage.getItem("pashuchaara_temp_answers") || "{}");
      sessionStorage.setItem("pashuchaara_temp_answers", JSON.stringify({ ...ex, aiAnswers: final }));
    } catch (_) {}
    const batchId = activeBatch?.id || "PC-9482";
    setTimeout(() => { setSubmitting(false); navigate("/results/" + batchId); }, 1400);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0f1110] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col shadow-xl bg-[#FAF7F0] dark:bg-[#0f1110]">

        <SubPageHeader
          title={t.aiQPageTitle || "AI Questionnaire"}
          subtitle={t.aiQPageSub || "Answer for accurate analysis"}
          backTo={-1}
          actionBtn={
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-[11px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
              {step + 1}/{questions.length}
            </span>
          }
        />

        <div className="w-full h-1 bg-[#ded5c2] dark:bg-[#1e271e]">
          <div
            className="h-full bg-[#2D5A3D] transition-all duration-500 ease-out"
            style={{ width: ((step + 1) / questions.length * 100) + "%" }}
          />
        </div>

        {activeBatch && (
          <div className="mx-4 mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              {activeBatch.customLabel || activeBatch.typeLabel || activeBatch.typeKey} · {activeBatch.id}
            </p>
          </div>
        )}

        {submitting && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center mb-3">
              <SparklesIcon className="w-7 h-7 text-emerald-300 animate-pulse" />
            </div>
            <h3 className="text-base font-black">{t.aiAnalyzingTitle || "AI Analysis in progress..."}</h3>
            <p className="text-xs text-gray-300 mt-1.5 max-w-xs leading-relaxed">
              {t.aiAnalyzingSub || "Generating fodder quality report based on all your answers."}
            </p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white dark:bg-[#1a1f1a] rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-sm p-4 space-y-4">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 flex-1">
                <div className="w-8 h-8 rounded-xl bg-[#2D5A3D] flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#064d2c] dark:text-white leading-snug">{currentQ.question}</h2>
                  {currentQ.hint && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{currentQ.hint}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                id="listen-ai-q-btn"
                onClick={() => toggleSpeak(`${currentQ.question}. ${currentQ.hint || ""}`, lang)}
                aria-label="प्रश्न सुनें"
                className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isSpeaking
                    ? "bg-emerald-700 text-white border-emerald-700 animate-pulse ring-2 ring-emerald-400"
                    : "bg-[#faf7f0] dark:bg-[#141814] text-emerald-800 dark:text-emerald-300 border-[#ded5c2] dark:border-[#242824] hover:bg-emerald-50"
                }`}
                title={lang === "en" ? "Listen to question" : "प्रश्न सुनें"}
              >
                <SpeakerIcon className="w-4 h-4" />
              </button>
            </div>

            {currentQ.type === "mcq" && (
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const sel = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                      className={"w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-left " + (sel ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs" : "bg-[#faf7f0] dark:bg-[#0f1110] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]")}
                    >
                      <span>{opt}</span>
                      {sel && <CheckIcon className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => listening ? stop() : start(langTag)}
                  className={"w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer " + (listening ? "bg-red-600 text-white border-red-600 animate-pulse" : "bg-[#faf7f0] dark:bg-[#0f1110] text-gray-500 dark:text-gray-400 border-[#ded5c2] dark:border-[#242824]")}
                >
                  {listening ? <MicOffIcon className="w-3.5 h-3.5" /> : <MicIcon className="w-3.5 h-3.5" />}
                  <span>{listening ? (t.voiceListening || "Listening...") : (t.voiceMCQHint || "Or speak to select an option")}</span>
                </button>
              </div>
            )}

            {currentQ.type === "text" && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="w-full px-3.5 py-3 rounded-2xl border border-[#ded5c2] dark:border-[#242824] text-xs font-semibold bg-[#faf7f0] dark:bg-[#0f1110] text-gray-800 dark:text-white outline-none resize-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => listening ? stop() : start(langTag)}
                  className={"w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer " + (listening ? "bg-red-600 text-white border-red-600 animate-pulse" : "bg-emerald-50 dark:bg-[#0f1a12] text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50")}
                >
                  {listening ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                  <span>{listening ? (t.voiceStopBtn || "Stop listening...") : (t.voiceStartBtn || "Speak your answer with mic")}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-3 rounded-2xl text-xs font-bold border border-[#ded5c2] dark:border-[#242824] text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t.prevBtn || "Previous"}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              {isLast ? (
                <><span>{t.submitForAnalysis || "Start AI Analysis"}</span><SparklesIcon className="w-4 h-4 text-emerald-200" /></>
              ) : (
                <><span>{t.nextBtn || "Next Question"}</span><SendIcon className="w-4 h-4 text-emerald-200" /></>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pb-4">
            {questions.map((_, i) => (
              <div
                key={i}
                className={"rounded-full transition-all duration-300 " + (i === step ? "w-5 h-2 bg-[#2D5A3D]" : i < step ? "w-2 h-2 bg-emerald-400 dark:bg-emerald-600" : "w-2 h-2 bg-[#ded5c2] dark:bg-[#2a322a]")}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}