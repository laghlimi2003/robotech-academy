import { useState } from "react";
import type { LocalizedQuiz } from "../data/labs";
import type { T } from "../hooks/useLang";

interface QuizProps {
  questions: LocalizedQuiz[];
  accentColor: string;
  t: T;
  onPass: (score: number) => void;
  onClose: () => void;
}

const PASS_THRESHOLD = 70;

export default function Quiz({ questions, accentColor, t, onPass, onClose }: QuizProps) {
  const isRTL = t.dir === "rtl";
  const nextArrowIcon = isRTL ? "fa-arrow-left" : "fa-arrow-right";
  const [idx, setIdx]             = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [answers, setAnswers]     = useState<number[]>([]);
  const [finished, setFinished]   = useState(false);

  const total = questions.length;
  const q     = questions[idx];

  const choose = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    setAnswers(a => [...a, i]);
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const retry = () => {
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const correctCount = answers.filter((a, i) => a === questions[i].correct).length;
    const percent      = Math.round((correctCount / total) * 100);
    const passed       = percent >= PASS_THRESHOLD;

    return (
      <div className="quiz-panel quiz-result" role="status" aria-live="polite">
        <div className={`quiz-result-icon ${passed ? "pass" : "fail"}`}>
          <i className={`fas ${passed ? "fa-trophy" : "fa-rotate-right"}`} />
        </div>
        <h3 className="quiz-result-title">
          {passed ? t.quizPassedTitle : t.quizFailedTitle}
        </h3>
        <div className="quiz-result-score" style={{ color: passed ? "#43e97b" : "#f5576c" }}>
          {correctCount} / {total} <span className="quiz-result-percent">({percent}%)</span>
        </div>
        <p className="quiz-result-msg">
          {passed ? t.quizPassedMsg : t.quizFailedMsg.replace("{p}", String(PASS_THRESHOLD))}
        </p>
        <div className="quiz-result-actions">
          {passed ? (
            <button
              className="quiz-btn primary"
              style={{ background: accentColor }}
              onClick={() => onPass(percent)}
            >
              <i className="fas fa-check" /> {t.quizContinue}
            </button>
          ) : (
            <>
              <button className="quiz-btn primary" style={{ background: accentColor }} onClick={retry}>
                <i className="fas fa-rotate-right" /> {t.quizRetry}
              </button>
              <button className="quiz-btn ghost" onClick={onClose}>
                {t.quizClose}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${((idx) / total) * 100}%`, background: accentColor }} />
      </div>
      <div className="quiz-meta">
        <span><i className="fas fa-circle-question" /> {t.quizQuestion} {idx + 1}/{total}</span>
        <button className="quiz-close" onClick={onClose} aria-label={t.quizClose}>
          <i className="fas fa-xmark" />
        </button>
      </div>

      <h4 className="quiz-q">{q.q}</h4>

      <ul className="quiz-options">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isPicked  = i === selected;
          let cls = "quiz-opt";
          if (revealed) {
            if (isCorrect)        cls += " correct";
            else if (isPicked)    cls += " wrong";
          } else if (isPicked) {
            cls += " picked";
          }
          return (
            <li key={i}>
              <button className={cls} onClick={() => choose(i)} disabled={revealed}>
                <span className="quiz-opt-mark">
                  {revealed && isCorrect && <i className="fas fa-check" />}
                  {revealed && isPicked && !isCorrect && <i className="fas fa-xmark" />}
                  {!revealed && <span className="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>}
                </span>
                <span className="quiz-opt-text">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && q.explain && (
        <div className="quiz-explain">
          <i className="fas fa-lightbulb" /> {q.explain}
        </div>
      )}

      {revealed && (
        <button
          className="quiz-btn primary quiz-next"
          style={{ background: accentColor }}
          onClick={next}
        >
          {idx + 1 < total ? <>{t.quizNext} <i className={`fas ${nextArrowIcon}`} /></> : <>{t.quizShowResult} <i className="fas fa-flag-checkered" /></>}
        </button>
      )}
    </div>
  );
}
