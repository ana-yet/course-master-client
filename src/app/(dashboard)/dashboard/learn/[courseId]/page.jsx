"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/course.service";
import api from "@/lib/axios";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ClipboardList,
  Loader2,
  AlertCircle,
  Trophy,
  Send,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  X,
  Menu,
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

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      const [courseRes, enrollRes] = await Promise.all([
        courseService.getCourseById(courseId),
        api.get(`/enrollments/details/${courseId}`),
      ]);

      setCourse(courseRes.data);
      setEnrollment(enrollRes.data.data);

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
    setSidebarOpen(false);
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
      toast.success("Module Completed! 🎉");

      // Auto-advance to next module
      const currentMilestone = course.milestones[activeModule.milestone];
      if (activeModule.module < currentMilestone.modules.length - 1) {
        selectModule(activeModule.milestone, activeModule.module + 1);
      } else if (activeModule.milestone < course.milestones.length - 1) {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
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

  // Calculate stats
  const totalModules = course.milestones?.reduce(
    (acc, m) => acc + (m.modules?.length || 0),
    0
  );
  const completedCount = enrollment?.completedModules?.length || 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-900 truncate max-w-[300px]">
                {course.title}
              </h1>
              <p className="text-xs text-slate-500">
                {completedCount}/{totalModules} modules completed
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-slate-700">
                {enrollment?.progress || 0}% Complete
              </span>
            </div>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${enrollment?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{course.title}</span>
            <span>{enrollment?.progress || 0}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all"
              style={{ width: `${enrollment?.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-[73px] right-0 lg:right-auto h-full lg:h-[calc(100vh-73px)] w-80 bg-white border-l lg:border-l-0 lg:border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
            <h3 className="font-bold text-slate-900">Course Content</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden lg:block p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              Course Content
            </h3>
          </div>

          {/* Milestones */}
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {course.milestones?.map((milestone, mIndex) => (
              <div key={mIndex} className="border-b border-slate-100">
                {/* Milestone Header */}
                <button
                  onClick={() => toggleMilestone(mIndex)}
                  className={`w-full flex items-center justify-between p-4 text-left transition ${
                    activeMilestone === mIndex
                      ? "bg-primary-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        activeMilestone === mIndex
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {mIndex + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        {milestone.modules?.length || 0} lessons
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
                  <div className="bg-slate-50/50">
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
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left border-l-3 transition ${
                            isActive
                              ? "border-l-primary-600 bg-white shadow-sm"
                              : "border-l-transparent hover:bg-white"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {completed ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              </div>
                            ) : isActive ? (
                              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                <PlayCircle className="w-4 h-4 text-primary-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                <Circle className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                completed
                                  ? "text-slate-500"
                                  : isActive
                                  ? "text-primary-700 font-medium"
                                  : "text-slate-700"
                              }`}
                            >
                              {module.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{module.duration || 10} min</span>
                              {module.quiz?.questions?.length > 0 && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    quizPassed
                                      ? "text-emerald-500"
                                      : "text-purple-500"
                                  }`}
                                >
                                  <FileQuestion className="w-3 h-3" />
                                  Quiz {quizPassed && "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Assignment */}
                    {milestone.assignment?.title && (
                      <button
                        onClick={() => {
                          setActiveMilestone(mIndex);
                          setViewMode("assignment");
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left bg-gradient-to-r from-amber-50 to-orange-50 border-l-3 ${
                          viewMode === "assignment" && activeMilestone === mIndex
                            ? "border-l-amber-500"
                            : "border-l-transparent"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <ClipboardList className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-900">
                            📝 Assignment
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto">
            {/* Video Mode */}
            {viewMode === "video" && (
              <div className="space-y-4">
                {/* Video Player */}
                <div className="aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  {activeModule?.data?.videoUrl ? (
                    <iframe
                      src={getYouTubeEmbedUrl(activeModule.data.videoUrl)}
                      title={activeModule.data.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <PlayCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>Select a lesson to start</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Module Info Card */}
                {activeModule && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">
                            Milestone {activeMilestone + 1} • Lesson{" "}
                            {activeModule.module + 1}
                          </p>
                          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                            {activeModule.data.title}
                          </h2>
                          {activeModule.data.description && (
                            <p className="mt-2 text-slate-600 text-sm md:text-base">
                              {activeModule.data.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-slate-100">
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
                              ? "Quiz Passed ✓"
                              : "Take Quiz"}
                          </Button>
                        )}

                        <Button
                          onClick={handleMarkComplete}
                          disabled={isModuleCompleted(activeModule.data._id)}
                          className={
                            isModuleCompleted(activeModule.data._id)
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
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
                  </div>
                )}
              </div>
            )}

            {/* Quiz Mode */}
            {viewMode === "quiz" && moduleHasQuiz && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        📝 {moduleQuiz.title || "Module Quiz"}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {moduleQuiz.questions.length} questions • Pass mark:{" "}
                        {moduleQuiz.passingScore}%
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("video")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  {quizResult ? (
                    <div
                      className={`text-center py-10 px-6 rounded-2xl ${
                        quizResult.passed
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50"
                          : "bg-gradient-to-br from-amber-50 to-orange-50"
                      }`}
                    >
                      <Trophy
                        className={`w-20 h-20 mx-auto mb-4 ${
                          quizResult.passed
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }`}
                      />
                      <h3 className="text-3xl font-bold text-slate-900">
                        {quizResult.passed ? "Excellent! 🎉" : "Almost There!"}
                      </h3>
                      <p className="text-xl mt-3 text-slate-700">
                        You scored{" "}
                        <span className="font-bold">{quizResult.score}%</span>
                      </p>
                      <p className="text-slate-500 mt-1">
                        {quizResult.correctCount}/{quizResult.totalQuestions}{" "}
                        correct answers
                      </p>
                      {!quizResult.passed && (
                        <Button
                          className="mt-6"
                          onClick={() => {
                            setQuizResult(null);
                            setQuizAnswers({});
                          }}
                        >
                          Try Again
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {moduleQuiz.questions.map((q, qIndex) => (
                        <div
                          key={qIndex}
                          className="p-5 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <p className="font-semibold text-slate-900 mb-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm mr-2">
                              {qIndex + 1}
                            </span>
                            {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                              <label
                                key={optIndex}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  quizAnswers[qIndex] === optIndex
                                    ? "border-primary-500 bg-primary-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300"
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
                                <span className="text-slate-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <Button
                        className="w-full py-3"
                        size="lg"
                        onClick={handleQuizSubmit}
                        isLoading={quizSubmitting}
                      >
                        Submit Answers
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignment Mode */}
            {viewMode === "assignment" && milestoneAssignment && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        📋 {milestoneAssignment.title}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Milestone {activeMilestone + 1} Assignment • Max Score:{" "}
                        {milestoneAssignment.maxScore}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("video")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  {milestoneAssignment.description && (
                    <p className="text-slate-600 mb-4">
                      {milestoneAssignment.description}
                    </p>
                  )}

                  {milestoneAssignment.instructions && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        📝 Instructions
                      </h4>
                      <p className="text-sm text-slate-600 whitespace-pre-line">
                        {milestoneAssignment.instructions}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const submission = getAssignmentSubmission(
                      currentMilestone._id
                    );
                    if (submission) {
                      return (
                        <div
                          className={`p-5 rounded-xl border-2 ${
                            submission.status === "approved"
                              ? "bg-emerald-50 border-emerald-200"
                              : submission.status === "rejected"
                              ? "bg-rose-50 border-rose-200"
                              : "bg-amber-50 border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {submission.status === "approved" ? (
                              <CheckCircle className="w-6 h-6 text-emerald-600" />
                            ) : submission.status === "rejected" ? (
                              <AlertCircle className="w-6 h-6 text-rose-600" />
                            ) : (
                              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                            )}
                            <div>
                              <span className="font-semibold capitalize text-lg">
                                {submission.status}
                              </span>
                              {submission.score !== null && (
                                <span className="ml-3 text-slate-600">
                                  Score: {submission.score}/
                                  {milestoneAssignment.maxScore}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">
                            Submitted:{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                          <a
                            href={submission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                          >
                            View your submission →
                          </a>
                          {submission.feedback && (
                            <div className="mt-3 p-3 bg-white rounded-lg">
                              <p className="text-sm">
                                <strong>Feedback:</strong> {submission.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Submission URL
                          </label>
                          <input
                            type="url"
                            value={assignmentUrl}
                            onChange={(e) => setAssignmentUrl(e.target.value)}
                            placeholder="https://github.com/username/project"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            GitHub, CodePen, Google Drive, or any public URL
                          </p>
                        </div>
                        <Button
                          onClick={handleAssignmentSubmit}
                          isLoading={assignmentSubmitting}
                          className="w-full"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Assignment
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
