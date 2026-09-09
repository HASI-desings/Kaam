import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";

// Placeholder question bank — real content should be authored per category
// before Phase 11 ships; structure is what matters here.
const QUESTIONS = [
  { q: "You commit to a deadline you can't realistically meet. What should you do?", options: ["Say nothing and hope", "Ask for a postponement early"], correct: 1 },
  { q: "A client asks for work outside the agreed acceptance criteria. What's correct?", options: ["Do it for free to keep them happy", "Treat it as a mid-job scope-change request"], correct: 1 },
  { q: "How should you handle a disagreement over quality?", options: ["Argue in chat only", "Reference the acceptance criteria checklist"], correct: 1 },
];
const PASS_THRESHOLD = 0.7;

export default function SkillQuiz() {
  const { categoryId } = useParams();
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);

  async function handleSubmit() {
    const correct = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
    const score = Math.round((correct / QUESTIONS.length) * 100);
    const didPass = correct / QUESTIONS.length >= PASS_THRESHOLD;
    setPassed(didPass);
    setSubmitted(true);
    if (session && categoryId) {
      await supabase.from("skill_verifications").upsert({
        user_id: session.user.id,
        category_id: categoryId,
        passed: didPass,
        score,
      });
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {passed ? "You passed! 🎉" : "Not quite there yet"}
        </h1>
        <p className="text-text-light-secondary dark:text-text-dark-secondary">
          {passed ? "You can now list this skill as verified." : "You can retake the quiz any time."}
        </p>
        <button onClick={() => navigate(-1)} className="rounded-xl bg-teal text-white px-6 py-3 font-medium">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Skill verification quiz</h1>
      {QUESTIONS.map((q, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-sm font-medium text-text-light dark:text-text-dark">{q.q}</p>
          {q.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
              className={`block w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                answers[qi] === oi ? "border-teal bg-teal/10 text-teal" : "border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={answers.includes(-1)}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        Submit
      </button>
    </div>
  );
}
