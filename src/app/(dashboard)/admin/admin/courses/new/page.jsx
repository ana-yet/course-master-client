"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { courseService } from "@/services/course.service";
import toast from "react-hot-toast";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Development",
    level: "Beginner",
    thumbnail: "https://placehold.co/600x400",
    syllabus: [], // Array of { title, videoUrl }
  });

  // Handle Syllabus Array
  const addLesson = () => {
    setForm((prev) => ({
      ...prev,
      syllabus: [...prev.syllabus, { title: "", videoUrl: "", isFree: false }],
    }));
  };

  const updateLesson = (index, field, value) => {
    const newSyllabus = [...form.syllabus];
    newSyllabus[index][field] = value;
    setForm({ ...form, syllabus: newSyllabus });
  };

  const removeLesson = (index) => {
    const newSyllabus = form.syllabus.filter((_, i) => i !== index);
    setForm({ ...form, syllabus: newSyllabus });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseService.createCourse(form);
      toast.success("Course Created Successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Course Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <div>
            <label className="text-sm font-medium">Level</label>
            <select
              className="w-full h-10 mt-1 px-3 border border-slate-300 rounded-lg bg-white"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        {/* Dynamic Syllabus Form */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Syllabus / Modules</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addLesson}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Lesson
            </Button>
          </div>

          <div className="space-y-4">
            {form.syllabus.map((lesson, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Lesson Title"
                    value={lesson.title}
                    onChange={(e) => updateLesson(idx, "title", e.target.value)}
                  />
                  <Input
                    placeholder="YouTube Link"
                    value={lesson.videoUrl}
                    onChange={(e) =>
                      updateLesson(idx, "videoUrl", e.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeLesson(idx)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          Publish Course
        </Button>
      </form>
    </div>
  );
}
