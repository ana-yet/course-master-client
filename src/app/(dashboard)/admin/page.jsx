"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import Link from "next/link";
import { Users, BookOpen, TrendingUp, ClipboardCheck, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <div>Loading Admin Panel...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Enrollments"
          value={stats.totalEnrollments}
          color="emerald"
        />
        <Link href="/admin/assignments" className="group">
          <StatCard
            icon={ClipboardCheck}
            label="Pending Assignments"
            value={stats.pendingAssignments || 0}
            color="amber"
            hasArrow
          />
        </Link>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Enrollments (Last 7 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <XAxis dataKey="_id" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/admin/courses/new"
          title="Create New Course"
          description="Add a new course with milestones & modules"
        />
        <QuickLink
          href="/admin/courses"
          title="Manage Courses"
          description="Edit or delete existing courses"
        />
        <QuickLink
          href="/admin/assignments"
          title="Review Assignments"
          description="Grade student assignment submissions"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, hasArrow }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group-hover:border-primary-300 group-hover:shadow-md transition-all">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      {hasArrow && (
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
      )}
    </div>
  );
}

function QuickLink({ href, title, description }) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all group"
    >
      <h4 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
        {title}
      </h4>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </Link>
  );
}
