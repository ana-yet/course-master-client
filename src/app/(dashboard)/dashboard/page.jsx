"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { enrollmentService } from "@/services/enrollment.service";
import { PlayCircle, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await enrollmentService.getMyCourses();
        setEnrollments(response.data);
      } catch (error) {
        console.error("Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading your courses...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Learning</h1>
        <p className="text-slate-500">
          Welcome back! Continue where you left off.
        </p>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="mb-4 rounded-full bg-primary-50 p-4">
            <Award className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No courses yet</h3>
          <p className="mb-6 max-w-sm text-sm text-slate-500">
            You haven&#39;t enrolled in any courses yet. Explore our catalog to
            get started.
          </p>
          <Link href="/">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;

          return (
            <div
              key={enrollment._id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 line-clamp-2 text-base font-bold text-slate-900">
                  {course.title}
                </h3>

                <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                  <span>{course.instructor?.name}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">
                      {enrollment.progress}% Complete
                    </span>
                    {enrollment.progress === 100 && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-primary-600 transition-all duration-500"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>

                  <Link
                    href={`/dashboard/learn/${course._id}`}
                    className="block mt-4"
                  >
                    <Button
                      variant={
                        enrollment.progress === 0 ? "primary" : "outline"
                      }
                      className="w-full mt-3"
                      size="sm"
                    >
                      {enrollment.progress === 0
                        ? "Start Learning"
                        : "Continue"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
