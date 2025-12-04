"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import {
  Users,
  Search,
  ArrowLeft,
  Loader2,
  Mail,
  Calendar,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CourseEnrollmentsPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, [courseId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/courses/${courseId}/enrollments`);
      setEnrollments(res.data.data);
    } catch (error) {
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-slate-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Enrolled Students
          </h1>
          <p className="text-slate-500">
            {enrollments.length} students enrolled in this course
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No students found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Enrolled Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Progress
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnrollments.map((enrollment) => (
                <tr
                  key={enrollment._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {enrollment.student?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {enrollment.student?.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          {enrollment.student?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[100px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">
                          {Math.round(
                            (enrollment.completedModules?.length || 0) / 1 // TODO: Get total modules
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (enrollment.completedModules?.length || 0) * 5 // Rough estimate for now
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {enrollment.completedModules?.length || 0} modules done
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
