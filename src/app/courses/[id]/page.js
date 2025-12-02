'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data.course);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/enrollments/enroll/${id}`);
      alert('Successfully enrolled!');
      router.push('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src={course.thumbnail ? `/assets/${course.thumbnail}` : '/assets/logo.png'}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-700 mb-6">{course. description}</p>

            <div className="flex items-center justify-between mb-8">
              <span className="text-3xl font-bold text-blue-600">${course.price}</span>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Syllabus</h2>
              {course.syllabus && course.syllabus.length > 0 ? (
                <div className="space-y-3">
                  {course.syllabus.map((lesson, index) => (
                    <div
                      key={lesson._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          Lesson {index + 1}: {lesson.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{lesson.duration} min</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No syllabus available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
