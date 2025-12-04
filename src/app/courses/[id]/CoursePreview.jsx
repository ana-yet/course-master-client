"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { enrollmentService } from "@/services/enrollment.service";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import {
  CheckCircle,
  PlayCircle,
  Lock,
  BookOpen,
  Clock,
  Award,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  FileQuestion,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CoursePreview({ course }) {
  const router = useRouter();
  const { user } = useAuth();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState([0]);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Check enrollment status
  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        try {
          const statusRes = await enrollmentService.checkEnrollmentStatus(
            course._id
          );
          setIsEnrolled(statusRes.data.enrolled);
        } catch (error) {
          // Not enrolled
        }
      }
      setCheckingEnrollment(false);
    };
    checkStatus();
  }, [user, course._id]);

  // Toggle milestone expansion
  const toggleMilestone = (index) => {
    setExpandedMilestones((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle payment with Stripe
  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      router.push(`/login?redirect=/courses/${course._id}`);
      return;
    }

    setEnrollLoading(true);
    try {
      // Create Stripe checkout session
      const response = await api.post("/payments/create-checkout-session", {
        courseId: course._id,
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start checkout");
      setEnrollLoading(false);
    }
  };

  // Calculate course stats
  const getTotalModules = () => {
    return (
      course.milestones?.reduce(
        (acc, m) => acc + (m.modules?.length || 0),
        0
      ) || 0
    );
  };

  const getTotalDuration = () => {
    let total = 0;
    course.milestones?.forEach((m) => {
      m.modules?.forEach((mod) => {
        total += mod.duration || 0;
      });
    });
    return total;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    // Handle various YouTube URL formats
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(previewVideo.videoUrl)}
                title={previewVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <p className="text-white text-center mt-4 font-medium">
              {previewVideo.title}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left: Course Info */}
            <div className="text-white order-2 lg:order-1">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 font-medium">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  {course.level}
                </span>
                {course.batch && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                    {course.batch}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl leading-tight">
                {course.title}
              </h1>

              <p className="mb-6 text-lg text-slate-300 leading-relaxed">
                {course.description?.substring(0, 200)}...
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 text-sm text-slate-300 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{getTotalModules()} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{getTotalDuration()} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{course.milestones?.length || 0} Milestones</span>
                </div>
                {course.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Starts{" "}
                      {new Date(course.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white">
                  {course.instructor?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created by</p>
                  <p className="font-medium">{course.instructor?.name}</p>
                </div>
              </div>
            </div>

            {/* Right: Video/Thumbnail + CTA */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Thumbnail/Preview */}
                <div className="relative aspect-video bg-slate-100 group cursor-pointer">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-4xl font-bold text-slate-900">
                        ${course.price}
                      </span>
                      {course.price > 0 && (
                        <span className="ml-2 text-slate-400 line-through">
                          ${Math.round(course.price * 1.5)}
                        </span>
                      )}
                    </div>
                    {course.price > 0 && (
                      <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
                        33% OFF
                      </span>
                    )}
                  </div>

                  {checkingEnrollment ? (
                    <Button className="w-full h-12" disabled>
                      Checking...
                    </Button>
                  ) : isEnrolled ? (
                    <Button
                      className="w-full h-12 text-lg font-bold"
                      variant="secondary"
                      onClick={() =>
                        router.push(`/dashboard/learn/${course._id}`)
                      }
                    >
                      Go to Course
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary-500/30"
                      isLoading={enrollLoading}
                      onClick={handleEnroll}
                    >
                      {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                    </Button>
                  )}

                  <p className="text-center text-xs text-slate-500 mt-3">
                    30-Day Money-Back Guarantee
                  </p>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Full Lifetime Access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Certificate of Completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Quizzes & Assignments</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>Access on Mobile & Desktop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                About this course
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Syllabus */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Course Syllabus
                </h2>
                <span className="text-sm text-slate-500">
                  {course.milestones?.length || 0} Milestones •{" "}
                  {getTotalModules()} Modules
                </span>
              </div>

              {/* Milestones Accordion */}
              <div className="space-y-4">
                {course.milestones?.length > 0 ? (
                  course.milestones.map((milestone, mIndex) => (
                    <div
                      key={mIndex}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      {/* Milestone Header */}
                      <button
                        onClick={() => toggleMilestone(mIndex)}
                        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                          expandedMilestones.includes(mIndex)
                            ? "bg-primary-50"
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                            {mIndex + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {milestone.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {milestone.modules?.length || 0} modules
                              {milestone.assignment?.title &&
                                " • 1 assignment"}
                            </p>
                          </div>
                        </div>
                        {expandedMilestones.includes(mIndex) ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {/* Milestone Content */}
                      {expandedMilestones.includes(mIndex) && (
                        <div className="border-t border-slate-200">
                          {/* Modules */}
                          {milestone.modules?.map((module, modIndex) => (
                            <div
                              key={modIndex}
                              className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                            >
                              <div className="flex items-center gap-3">
                                {isEnrolled || module.isFree ? (
                                  <PlayCircle className="w-5 h-5 text-primary-600" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-400" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {modIndex + 1}. {module.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{module.duration || 10} mins</span>
                                    {module.quiz?.questions?.length > 0 && (
                                      <span className="flex items-center gap-1 text-purple-600">
                                        <FileQuestion className="w-3 h-3" />
                                        Quiz
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Preview button for free modules */}
                              {module.isFree && !isEnrolled && (
                                <button
                                  onClick={() => setPreviewVideo(module)}
                                  className="text-xs px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition"
                                >
                                  Preview
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Assignment */}
                          {milestone.assignment?.title && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border-t border-amber-100">
                              <ClipboardList className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="font-medium text-amber-900">
                                  Assignment: {milestone.assignment.title}
                                </p>
                                <p className="text-xs text-amber-700">
                                  {milestone.assignment.description?.substring(
                                    0,
                                    100
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p>No content available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sticky Sidebar (Mobile hidden) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* What you'll learn */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  What you'll learn
                </h3>
                <ul className="space-y-3">
                  {course.milestones?.slice(0, 5).map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{m.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Requirements</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Basic understanding of computers</li>
                  <li>• Internet connection</li>
                  <li>• Willingness to learn</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
