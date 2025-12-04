"use client";

import { useState, useEffect } from "react";
import { courseService } from "@/services/course.service";
import CourseCard from "@/components/shared/CourseCard";
import CourseFilters from "@/components/features/CourseFilters";
import Button from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
    page: 1,
    limit: 8,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Fetch Logic
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getAllCourses(filters);
      setCourses(response.data.courses);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Effect: Wait 500ms after user stops typing search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]); // Re-run whenever filters change

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Unlock Your Potential
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          Discover expert-led courses to build the skills you need for your
          career.
        </p>
      </div>

      {/* Filter Bar */}
      <CourseFilters filters={filters} setFilters={setFilters} />

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
          <p className="text-lg font-medium text-slate-600">No courses found</p>
          <p className="text-sm text-slate-500">
            Try adjusting your search or filters.
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() =>
              setFilters({
                search: "",
                category: "",
                sort: "newest",
                page: 1,
                limit: 8,
              })
            }
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination (Simple Next/Prev) */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-medium text-slate-700">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
