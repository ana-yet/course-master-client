"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function QuizModal({ courseId, lesson, onComplete }) {
  // TODO:  fetch from DB
  const questions = [
    {
      q: "What is the capital of React?",
      options: ["Components", "Classes", "HTML"],
      a: "Components",
    },
    { q: "Is Next.js a framework?", options: ["Yes", "No"], a: "Yes" },
  ];

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.a) correct++;
    });

    const finalScore = (correct / questions.length) * 100;
    setScore(finalScore);

    // Save to Backend
    await api.post("/submissions", {
      courseId,
      lessonId: lesson._id,
      type: "quiz",
      score: finalScore,
    });

    if (finalScore >= 50) {
      toast.success(`Passed! Score: ${finalScore}%`);
      onComplete(); // Mark lesson as done
    } else {
      toast.error(`Failed. Score: ${finalScore}%. Try again.`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200">
      <h3 className="text-xl font-bold mb-4">Quiz: {lesson.title}</h3>
      {score === null ? (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i}>
              <p className="font-medium mb-2">
                {i + 1}. {q.q}
              </p>
              <div className="flex gap-4">
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      onChange={() => setAnswers({ ...answers, [i]: opt })}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={handleSubmit} className="w-full mt-4">
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-4xl font-bold text-primary-600 mb-2">{score}%</p>
          <p className="text-slate-500">Your Score</p>
        </div>
      )}
    </div>
  );
}
