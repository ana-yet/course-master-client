'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminCourseForm from '@/components/AdminCourseForm';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function EditCoursePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      } else {
        fetchCourse();
      }
    }
  }, [user, authLoading]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.data.course);
    } catch (error) {
      console.error('Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Course</h1>
        {course && <AdminCourseForm initialData={course} isEditing={true} />}
      </div>
    </div>
  );
}
