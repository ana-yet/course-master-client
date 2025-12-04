"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { courseService } from "@/services/course.service";
import { enrollmentService } from "@/services/enrollment.service";
import api from "@/lib/axios"; // Direct axios for progress update
import { CheckCircle, Circle, PlayCircle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LearnPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); // The lesson currently playing
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          courseService.getCourseById(courseId),
          api.get(`/enrollments/check/${courseId}`), // full enrollment object
        ]);

        setCourse(courseRes.data);

        // Fetch full enrollment details
        const fullEnrollmentRes = await api.get("/enrollments/my-courses");
        const myEnrollment = fullEnrollmentRes.data.find(
          (e) => e.course._id === courseId
        );
        setEnrollment(myEnrollment);

        // Set initial lesson (first one)
        if (courseRes.data.syllabus.length > 0) {
          setActiveLesson(courseRes.data.syllabus[0]);
        }
      } catch (error) {
        toast.error("Failed to load course content");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  // Handle "Mark as Complete"
  const handleMarkComplete = async () => {
    if (!activeLesson) return;

    try {
      const res = await api.post("/enrollments/progress", {
        courseId,
        lectureId: activeLesson._id,
      });

      setEnrollment(res.data.data); // Update local state with new progress
      toast.success("Lesson Completed!");

      // Auto-advance logic
      const currentIndex = course.syllabus.findIndex(
        (l) => l._id === activeLesson._id
      );
      if (currentIndex < course.syllabus.length - 1) {
        setActiveLesson(course.syllabus[currentIndex + 1]);
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  if (loading) return <div className="p-10">Loading Player...</div>;
  if (!course) return <div className="p-10">Course not found</div>;

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  return (
    <div className="grid h-[calc(100vh-100px)] gap-6 lg:grid-cols-3">
      {/* --- LEFT: Video Player --- */}
      <div className="flex flex-col lg:col-span-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
          {activeLesson ? (
            <iframe
              src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
              title={activeLesson.title}
              className="h-full w-full"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              Select a lesson
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeLesson?.title}
            </h2>
            <p className="text-sm text-slate-500">
              Module{" "}
              {course.syllabus.findIndex((l) => l._id === activeLesson?._id) +
                1}
            </p>
          </div>

          <Button
            onClick={handleMarkComplete}
            disabled={isLessonCompleted(activeLesson?._id)}
            variant={
              isLessonCompleted(activeLesson?._id) ? "secondary" : "primary"
            }
          >
            {isLessonCompleted(activeLesson?._id) ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Completed
              </>
            ) : (
              "Mark as Completed"
            )}
          </Button>
        </div>
      </div>

      {/* --- RIGHT: Playlist / Syllabus --- */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-full">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-900">Course Content</h3>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-secondary-500 transition-all duration-300"
              style={{ width: `${enrollment?.progress || 0}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {enrollment?.progress || 0}% Completed
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
          {course.syllabus.map((lesson, index) => {
            const isActive = activeLesson?._id === lesson._id;
            const isCompleted = isLessonCompleted(lesson._id);

            return (
              <button
                key={lesson._id}
                onClick={() => setActiveLesson(lesson)}
                className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-secondary-500" />
                  ) : isActive ? (
                    <PlayCircle className="h-5 w-5 text-primary-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isCompleted && "text-slate-500 line-through"
                    }`}
                  >
                    {index + 1}. {lesson.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lesson.duration || "10"} mins
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
