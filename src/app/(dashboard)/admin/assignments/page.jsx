"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import {
  ClipboardCheck,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  User,
  BookOpen,
  MessageSquare,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AssignmentReviewPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: "approved",
    score: 100,
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/assignments");
      setAssignments(res.data.data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesFilter = filter === "all" || a.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      a.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle review submission
  const handleReview = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      await api.put(
        `/admin/assignments/${selectedAssignment.enrollmentId}/${selectedAssignment._id}`,
        reviewForm
      );
      toast.success(`Assignment ${reviewForm.status}!`);

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === selectedAssignment._id
            ? { ...a, ...reviewForm }
            : a
        )
      );
      setSelectedAssignment(null);
      setReviewForm({ status: "approved", score: 100, feedback: "" });
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assignment Reviews
          </h1>
          <p className="text-slate-500">
            Review and grade student assignment submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            {assignments.filter((a) => a.status === "pending").length} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, course, or assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">
            No Assignments Found
          </h3>
          <p className="text-slate-500">
            {filter === "all"
              ? "No assignment submissions yet"
              : `No ${filter} assignments`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Course / Assignment
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Submitted
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Score
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((assignment) => (
                  <tr
                    key={assignment._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {assignment.student?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {assignment.student?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course / Assignment */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {assignment.course?.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {assignment.milestoneTitle} • {assignment.assignmentTitle}
                      </p>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        {formatDate(assignment.submittedAt)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4">
                      {assignment.score !== null ? (
                        <span className="font-medium text-slate-900">
                          {assignment.score}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={assignment.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View Submission"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Button
                          size="sm"
                          variant={
                            assignment.status === "pending"
                              ? "primary"
                              : "outline"
                          }
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setReviewForm({
                              status:
                                assignment.status === "pending"
                                  ? "approved"
                                  : assignment.status,
                              score: assignment.score || 100,
                              feedback: assignment.feedback || "",
                            });
                          }}
                        >
                          {assignment.status === "pending" ? "Review" : "Edit"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Review Assignment
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {selectedAssignment.student?.name} •{" "}
                {selectedAssignment.assignmentTitle}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Submission Link */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Submission URL
                </label>
                <a
                  href={selectedAssignment.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-2 text-primary-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {selectedAssignment.submissionUrl}
                </a>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() =>
                      setReviewForm({ ...reviewForm, status: "approved" })
                    }
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      reviewForm.status === "approved"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${
                        reviewForm.status === "approved"
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="text-sm font-medium">Approve</span>
                  </button>

                  <button
                    onClick={() =>
                      setReviewForm({ ...reviewForm, status: "reviewed" })
                    }
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      reviewForm.status === "reviewed"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <MessageSquare
                      className={`w-5 h-5 ${
                        reviewForm.status === "reviewed"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="text-sm font-medium">Reviewed</span>
                  </button>

                  <button
                    onClick={() =>
                      setReviewForm({ ...reviewForm, status: "rejected" })
                    }
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                      reviewForm.status === "rejected"
                        ? "border-rose-500 bg-rose-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <XCircle
                      className={`w-5 h-5 ${
                        reviewForm.status === "rejected"
                          ? "text-rose-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="text-sm font-medium">Reject</span>
                  </button>
                </div>
              </div>

              {/* Score */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Score (0-100)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={reviewForm.score}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        score: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewForm.score}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        score: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Feedback (Optional)
                </label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, feedback: e.target.value })
                  }
                  placeholder="Provide constructive feedback to the student..."
                  rows={4}
                  className="w-full mt-2 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAssignment(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleReview} isLoading={submitting}>
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
