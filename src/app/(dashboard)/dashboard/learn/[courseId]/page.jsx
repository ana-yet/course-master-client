"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import api from "@/lib/axios";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ClipboardList,
  Loader2,
  AlertCircle,
  Trophy,
  Send,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LearnPage() {
  const { courseId } = useParams();
  const router = useRouter();

  // State
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active content state
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [activeModule, setActiveModule] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState([0]);

  // View mode: 'video', 'quiz', 'assignment'
  const [viewMode, setViewMode] = useState("video");

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Assignment state
  const [assignmentUrl, setAssignmentUrl] = useState("");
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course and enrollment in parallel
      const [courseRes, enrollRes] = await Promise.all([
        courseService.getCourseById(courseId),
        api.get(`/enrollments/details/${courseId}`),
      ]);

      setCourse(courseRes.data);
      setEnrollment(enrollRes.data.data);

      // Set initial module
      if (courseRes.data.milestones?.length > 0) {
        const firstMilestone = courseRes.data.milestones[0];
        if (firstMilestone.modules?.length > 0) {
          setActiveModule({
            milestone: 0,
            module: 0,
            data: firstMilestone.modules[0],
          });
        }
      }
    } catch (err) {
      console.error("Failed to load course:", err);
      setError(err.response?.data?.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle milestone expansion
  const toggleMilestone = (index) => {
    setExpandedMilestones((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Select a module
  const selectModule = (milestoneIndex, moduleIndex) => {
    const module = course.milestones[milestoneIndex].modules[moduleIndex];
    setActiveModule({
      milestone: milestoneIndex,
      module: moduleIndex,
      data: module,
    });
    setActiveMilestone(milestoneIndex);
    setViewMode("video");
    setQuizResult(null);
    setQuizAnswers({});
  };

  // Check if module is completed
  const isModuleCompleted = (moduleId) => {
    return enrollment?.completedModules?.includes(moduleId);
  };

  // Check if quiz passed
  const isQuizPassed = (moduleId) => {
    return enrollment?.quizAttempts?.some(
      (a) => a.moduleId === moduleId && a.passed
    );
  };

  // Get assignment submission status
  const getAssignmentSubmission = (milestoneId) => {
    return enrollment?.assignmentSubmissions?.find(
      (s) => s.milestoneId === milestoneId
    );
  };

  // Mark module as complete
  const handleMarkComplete = async () => {
    if (!activeModule) return;

    try {
      const res = await api.post("/enrollments/progress", {
        courseId,
        moduleId: activeModule.data._id,
      });

      setEnrollment(res.data.data);
      toast.success("Module Completed!");

      // Auto-advance to next module
      const currentMilestone = course.milestones[activeModule.milestone];
      if (activeModule.module < currentMilestone.modules.length - 1) {
        selectModule(activeModule.milestone, activeModule.module + 1);
      } else if (activeModule.milestone < course.milestones.length - 1) {
        // Move to next milestone's first module
        const nextMilestone = course.milestones[activeModule.milestone + 1];
        if (nextMilestone.modules?.length > 0) {
          setExpandedMilestones((prev) => [...prev, activeModule.milestone + 1]);
          selectModule(activeModule.milestone + 1, 0);
        }
      }
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!activeModule?.data?.quiz?.questions?.length) return;

    const questions = activeModule.data.quiz.questions;
    if (Object.keys(quizAnswers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setQuizSubmitting(true);
    try {
      const answers = questions.map((_, i) => quizAnswers[i]);
      const res = await api.post("/enrollments/quiz", {
        courseId,
        moduleId: activeModule.data._id,
        answers,
      });

      setQuizResult(res.data.data);
      setEnrollment((prev) => ({
        ...prev,
        quizAttempts: [
          ...(prev.quizAttempts || []),
          {
            moduleId: activeModule.data._id,
            score: res.data.data.score,
            passed: res.data.data.passed,
          },
        ],
      }));

      if (res.data.data.passed) {
        toast.success("🎉 Quiz Passed!");
      } else {
        toast.error("Keep trying! You can retake the quiz.");
      }
    } catch (err) {
      toast.error("Failed to submit quiz");
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Submit assignment
  const handleAssignmentSubmit = async () => {
    if (!assignmentUrl.trim()) {
      toast.error("Please enter your submission URL");
      return;
    }

    const currentMilestone = course.milestones[activeMilestone];
    if (!currentMilestone?.assignment) return;

    setAssignmentSubmitting(true);
    try {
      const res = await api.post("/enrollments/assignment", {
        courseId,
        milestoneId: currentMilestone._id,
        submissionUrl: assignmentUrl,
      });

      setEnrollment(res.data.data);
      toast.success("Assignment submitted successfully!");
      setAssignmentUrl("");
    } catch (err) {
      toast.error("Failed to submit assignment");
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Failed to Load Course
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={loadData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const currentMilestone = course.milestones?.[activeMilestone];
  const moduleQuiz = activeModule?.data?.quiz;
  const moduleHasQuiz = moduleQuiz?.questions?.length > 0;
  const milestoneAssignment = currentMilestone?.assignment;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-4 overflow-hidden">
      {/* Left: Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player / Quiz / Assignment */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "video" && (
            <div className="space-y-4">
              {/* Video */}
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
                {activeModule?.data?.videoUrl ? (
                  <iframe
                    src={getYouTubeEmbedUrl(activeModule.data.videoUrl)}
                    title={activeModule.data.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <p>Select a module to start learning</p>
                  </div>
                )}
              </div>

              {/* Module Info & Actions */}
              {activeModule && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {activeModule.data.title}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Milestone {activeMilestone + 1} • Module{" "}
                        {activeModule.module + 1}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {moduleHasQuiz && (
                        <Button
                          variant={
                            isQuizPassed(activeModule.data._id)
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setViewMode("quiz")}
                        >
                          <FileQuestion className="w-4 h-4 mr-2" />
                          {isQuizPassed(activeModule.data._id)
                            ? "Quiz Passed"
                            : "Take Quiz"}
                        </Button>
                      )}

                      <Button
                        onClick={handleMarkComplete}
                        disabled={isModuleCompleted(activeModule.data._id)}
                        variant={
                          isModuleCompleted(activeModule.data._id)
                            ? "secondary"
                            : "primary"
                        }
                        size="sm"
                      >
                        {isModuleCompleted(activeModule.data._id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            Mark Complete
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {activeModule.data.description && (
                    <p className="mt-4 text-slate-600 text-sm">
                      {activeModule.data.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {viewMode === "quiz" && moduleHasQuiz && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {moduleQuiz.title || "Module Quiz"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {moduleQuiz.questions.length} questions • Passing score:{" "}
                    {moduleQuiz.passingScore}%
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setViewMode("video")}>
                  Back to Video
                </Button>
              </div>

              {quizResult ? (
                <div
                  className={`text-center py-8 rounded-xl ${
                    quizResult.passed ? "bg-emerald-50" : "bg-amber-50"
                  }`}
                >
                  <Trophy
                    className={`w-16 h-16 mx-auto mb-4 ${
                      quizResult.passed ? "text-emerald-500" : "text-amber-500"
                    }`}
                  />
                  <h3 className="text-2xl font-bold">
                    {quizResult.passed ? "Congratulations! 🎉" : "Keep Going!"}
                  </h3>
                  <p className="text-lg mt-2">
                    You scored {quizResult.score}% ({quizResult.correctCount}/
                    {quizResult.totalQuestions})
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Passing score: {quizResult.passingScore}%
                  </p>
                  {!quizResult.passed && (
                    <Button
                      className="mt-6"
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                    >
                      Retake Quiz
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {moduleQuiz.questions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="font-medium text-slate-900 mb-3">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIndex) => (
                          <label
                            key={optIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                              quizAnswers[qIndex] === optIndex
                                ? "border-primary-500 bg-primary-50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={quizAnswers[qIndex] === optIndex}
                              onChange={() =>
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [qIndex]: optIndex,
                                }))
                              }
                              className="w-4 h-4 text-primary-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    className="w-full"
                    onClick={handleQuizSubmit}
                    isLoading={quizSubmitting}
                  >
                    Submit Answers
                  </Button>
                </div>
              )}
            </div>
          )}

          {viewMode === "assignment" && milestoneAssignment && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {milestoneAssignment.title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Milestone {activeMilestone + 1} Assignment • Max Score:{" "}
                    {milestoneAssignment.maxScore}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setViewMode("video")}>
                  Back to Modules
                </Button>
              </div>

              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-600">
                  {milestoneAssignment.description}
                </p>
                {milestoneAssignment.instructions && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">
                      Instructions:
                    </h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line">
                      {milestoneAssignment.instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Submission form or status */}
              {(() => {
                const submission = getAssignmentSubmission(currentMilestone._id);
                if (submission) {
                  return (
                    <div
                      className={`p-4 rounded-lg ${
                        submission.status === "approved"
                          ? "bg-emerald-50 border border-emerald-200"
                          : submission.status === "rejected"
                          ? "bg-rose-50 border border-rose-200"
                          : "bg-amber-50 border border-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {submission.status === "approved" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : submission.status === "rejected" ? (
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="font-medium capitalize">
                          {submission.status}
                        </span>
                        {submission.score && (
                          <span className="ml-auto font-bold">
                            Score: {submission.score}/{milestoneAssignment.maxScore}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Submitted:{" "}
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <a
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        View Submission
                      </a>
                      {submission.feedback && (
                        <p className="mt-2 text-sm bg-white p-2 rounded">
                          <strong>Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Submission URL (GitHub, CodePen, etc.)
                      </label>
                      <input
                        type="url"
                        value={assignmentUrl}
                        onChange={(e) => setAssignmentUrl(e.target.value)}
                        placeholder="https://github.com/your-username/project"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <Button
                      onClick={handleAssignmentSubmit}
                      isLoading={assignmentSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Right: Sidebar - Course Content */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Progress Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900">Course Content</h3>
            <span className="text-sm font-medium text-primary-600">
              {enrollment?.progress || 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${enrollment?.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Milestones List */}
        <div className="flex-1 overflow-y-auto">
          {course.milestones?.map((milestone, mIndex) => (
            <div key={mIndex} className="border-b border-slate-100 last:border-b-0">
              {/* Milestone Header */}
              <button
                onClick={() => toggleMilestone(mIndex)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                  activeMilestone === mIndex
                    ? "bg-primary-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      activeMilestone === mIndex
                        ? "bg-primary-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {mIndex + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {milestone.modules?.length || 0} modules
                    </p>
                  </div>
                </div>
                {expandedMilestones.includes(mIndex) ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Modules List */}
              {expandedMilestones.includes(mIndex) && (
                <div className="bg-white">
                  {milestone.modules?.map((module, modIndex) => {
                    const isActive =
                      activeModule?.milestone === mIndex &&
                      activeModule?.module === modIndex;
                    const completed = isModuleCompleted(module._id);
                    const quizPassed = isQuizPassed(module._id);

                    return (
                      <button
                        key={modIndex}
                        onClick={() => selectModule(mIndex, modIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors ${
                          isActive
                            ? "border-l-primary-600 bg-primary-50"
                            : "border-l-transparent hover:bg-slate-50"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : isActive ? (
                          <PlayCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              completed
                                ? "text-slate-500"
                                : "text-slate-800"
                            }`}
                          >
                            {module.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{module.duration || 10} min</span>
                            {module.quiz?.questions?.length > 0 && (
                              <span
                                className={`flex items-center gap-0.5 ${
                                  quizPassed
                                    ? "text-emerald-500"
                                    : "text-purple-500"
                                }`}
                              >
                                <FileQuestion className="w-3 h-3" />
                                {quizPassed ? "✓" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Assignment Button */}
                  {milestone.assignment?.title && (
                    <button
                      onClick={() => {
                        setActiveMilestone(mIndex);
                        setViewMode("assignment");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left bg-amber-50 border-l-2 ${
                        viewMode === "assignment" && activeMilestone === mIndex
                          ? "border-l-amber-500"
                          : "border-l-transparent"
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">
                          Assignment
                        </p>
                        <p className="text-xs text-amber-700 truncate">
                          {milestone.assignment.title}
                        </p>
                      </div>
                      {getAssignmentSubmission(milestone._id) && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
