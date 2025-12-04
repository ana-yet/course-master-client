"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/services/course.service";
import { enrollmentService } from "@/services/enrollment.service";
import Button from "@/components/ui/Button";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Course Details
        const courseRes = await courseService.getCourseById(id);
        setCourse(courseRes.data);

        // If logged in, check if already enrolled
        if (user) {
          const statusRes = await enrollmentService.checkEnrollmentStatus(id);
          setIsEnrolled(statusRes.data.enrolled);
        }
      } catch (error) {
        toast.error("Failed to load course details");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, user, router]);

  // 2. Handle Enroll Action
  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }

    setEnrollLoading(true);
    try {
      await enrollmentService.enrollInCourse(id);
      toast.success("Enrolled Successfully! 🎉");
      setIsEnrolled(true);
      router.push("/dashboard"); // Redirect to student dashboard
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* --- Header Section --- */}
      <div className="bg-slate-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-2 text-sm text-primary-300 font-medium">
              <span>{course.category}</span>
              <span>•</span>
              <span>{course.level}</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-5xl leading-tight">
              {course.title}
            </h1>
            <p className="mb-6 text-lg text-slate-300 max-w-2xl">
              {course.description.substring(0, 150)}...
            </p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                  {course.instructor?.name?.charAt(0)}
                </div>
                <span>
                  Created by{" "}
                  <span className="text-primary-200 underline">
                    {course.instructor?.name}
                  </span>
                </span>
              </div>
              <span className="text-slate-400">
                Last updated {new Date(course.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* --- LEFT COLUMN: Main Content --- */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="mb-4 text-2xl font-bold text-slate-900">
                About this course
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Syllabus */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="mb-6 text-2xl font-bold text-slate-900">
                Course Content
              </h3>
              <div className="space-y-3">
                {course.syllabus?.length > 0 ? (
                  course.syllabus.map((lesson, index) => (
                    <div
                      key={lesson._id || index}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-500 shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <PlayCircle className="w-3 h-3" />
                            <span>Video Lecture</span>
                          </div>
                        </div>
                      </div>
                      {/* Show Lock or Unlock icon based on enrollment */}
                      {isEnrolled || lesson.isFree ? (
                        <PlayCircle className="h-5 w-5 text-secondary-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 italic">
                    <AlertCircle className="w-4 h-4" /> No lessons uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Sticky Sidebar --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
              {/* Video Preview / Thumbnail */}
              <div className="mb-6 overflow-hidden rounded-xl bg-slate-100 aspect-video relative group">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white opacity-90 drop-shadow-md" />
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  ${course.price}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <Button
                    className="w-full text-lg h-12"
                    variant="secondary"
                    onClick={() =>
                      router.push(`/dashboard/learn/${course._id}`)
                    }
                  >
                    Go to Course
                  </Button>
                ) : (
                  <Button
                    className="w-full text-lg h-12 font-bold shadow-md shadow-primary-500/20"
                    isLoading={enrollLoading}
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                )}

                <p className="text-center text-xs text-slate-500 mt-4">
                  30-Day Money-Back Guarantee
                </p>
              </div>

              {/* Course Features List */}
              <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>{course.syllabus?.length || 0} Lessons</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                  <span>Full Lifetime Access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
