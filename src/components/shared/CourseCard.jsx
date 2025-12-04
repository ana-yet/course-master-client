import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";

export default function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <Image
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={600}
          height={400}
        />
        {/* Category Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-primary-600 shadow-sm backdrop-blur-sm">
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 line-clamp-2">
          {course.title}
        </h3>

        {/* Metadata */}
        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.level}</span>
          </div>
          {/* duration data */}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Self-paced</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
              {/* Instructor Avatar if available */}
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-xs font-bold text-primary-600">
                {course.instructor?.name?.charAt(0) || "I"}
              </div>
            </div>
            <span className="text-sm font-medium text-slate-700">
              {course.instructor?.name || "Instructor"}
            </span>
          </div>

          <span className="text-lg font-bold text-primary-600">
            ${course.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
