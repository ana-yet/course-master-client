'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={course.thumbnail ? `/assets/${course.thumbnail}` : '/assets/logo.png'}
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-blue-600 font-bold text-xl">${course.price}</span>
            <span className="text-sm text-gray-500">
              {course.syllabus?.length || 0} lessons
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
