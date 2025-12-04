"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  BookOpen,
  Video,
  FileQuestion,
  ClipboardList,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { courseService } from "@/services/course.service";
import toast from "react-hot-toast";

export default function EditCoursePage() {
  const router = useRouter();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState(0);
  const [expandedModule, setExpandedModule] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Development",
    level: "Beginner",
    thumbnail: "",
    batch: "",
    startDate: "",
    milestones: [],
  });

  // Fetch course data on mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseService.getCourseById(courseId);
        const course = response.data;

        setForm({
          title: course.title || "",
          description: course.description || "",
          price: course.price || "",
          category: course.category || "Development",
          level: course.level || "Beginner",
          thumbnail: course.thumbnail || "",
          batch: course.batch || "",
          startDate: course.startDate
            ? new Date(course.startDate).toISOString().split("T")[0]
            : "",
          milestones: course.milestones || [],
        });
      } catch (error) {
        toast.error("Failed to load course");
        router.push("/admin/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router]);

  // ============ MILESTONE HANDLERS ============
  const addMilestone = () => {
    setForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: "",
          description: "",
          order: prev.milestones.length + 1,
          modules: [],
          assignment: {
            title: "",
            description: "",
            instructions: "",
            deadline: 7,
            maxScore: 100,
          },
        },
      ],
    }));
    setExpandedMilestone(form.milestones.length);
  };

  const updateMilestone = (index, field, value) => {
    const newMilestones = [...form.milestones];
    newMilestones[index][field] = value;
    setForm({ ...form, milestones: newMilestones });
  };

  const removeMilestone = (index) => {
    const newMilestones = form.milestones.filter((_, i) => i !== index);
    newMilestones.forEach((m, i) => (m.order = i + 1));
    setForm({ ...form, milestones: newMilestones });
  };

  // ============ MODULE HANDLERS ============
  const addModule = (milestoneIndex) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules.push({
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      isFree: false,
      quiz: {
        title: "Module Quiz",
        questions: [],
        passingScore: 70,
      },
    });
    setForm({ ...form, milestones: newMilestones });
  };

  const updateModule = (milestoneIndex, moduleIndex, field, value) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules[moduleIndex][field] = value;
    setForm({ ...form, milestones: newMilestones });
  };

  const removeModule = (milestoneIndex, moduleIndex) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules = newMilestones[
      milestoneIndex
    ].modules.filter((_, i) => i !== moduleIndex);
    setForm({ ...form, milestones: newMilestones });
  };

  // ============ QUIZ HANDLERS ============
  const addQuizQuestion = (milestoneIndex, moduleIndex) => {
    const newMilestones = [...form.milestones];
    if (!newMilestones[milestoneIndex].modules[moduleIndex].quiz) {
      newMilestones[milestoneIndex].modules[moduleIndex].quiz = {
        title: "Module Quiz",
        questions: [],
        passingScore: 70,
      };
    }
    newMilestones[milestoneIndex].modules[moduleIndex].quiz.questions.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setForm({ ...form, milestones: newMilestones });
  };

  const updateQuizQuestion = (
    milestoneIndex,
    moduleIndex,
    questionIndex,
    field,
    value
  ) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules[moduleIndex].quiz.questions[
      questionIndex
    ][field] = value;
    setForm({ ...form, milestones: newMilestones });
  };

  const updateQuizOption = (
    milestoneIndex,
    moduleIndex,
    questionIndex,
    optionIndex,
    value
  ) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules[moduleIndex].quiz.questions[
      questionIndex
    ].options[optionIndex] = value;
    setForm({ ...form, milestones: newMilestones });
  };

  const removeQuizQuestion = (milestoneIndex, moduleIndex, questionIndex) => {
    const newMilestones = [...form.milestones];
    newMilestones[milestoneIndex].modules[moduleIndex].quiz.questions =
      newMilestones[milestoneIndex].modules[
        moduleIndex
      ].quiz.questions.filter((_, i) => i !== questionIndex);
    setForm({ ...form, milestones: newMilestones });
  };

  // ============ ASSIGNMENT HANDLERS ============
  const updateAssignment = (milestoneIndex, field, value) => {
    const newMilestones = [...form.milestones];
    if (!newMilestones[milestoneIndex].assignment) {
      newMilestones[milestoneIndex].assignment = {
        title: "",
        description: "",
        instructions: "",
        deadline: 7,
        maxScore: 100,
      };
    }
    newMilestones[milestoneIndex].assignment[field] = value;
    setForm({ ...form, milestones: newMilestones });
  };

  // ============ FORM SUBMISSION ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await courseService.updateCourse(courseId, form);
      toast.success("Course Updated Successfully!");
      router.push("/admin/courses");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>
        <p className="text-slate-500">
          Update your course content, milestones, and assignments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ============ BASIC INFO SECTION ============ */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            Course Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Course Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Complete Web Development Bootcamp"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe what students will learn..."
                required
              />
            </div>

            <Input
              label="Batch Name"
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
              placeholder="e.g., Batch 1 - January 2024"
              required
            />

            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />

            <Input
              label="Price ($)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="99"
              required
            />

            <div>
              <label className="text-sm font-medium text-slate-700">
                Level
              </label>
              <select
                className="w-full h-10 mt-1 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                className="w-full h-10 mt-1 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Development</option>
                <option>Design</option>
                <option>Business</option>
                <option>Marketing</option>
                <option>Data Science</option>
              </select>
            </div>

            <Input
              label="Thumbnail URL"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* ============ MILESTONES SECTION ============ */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Course Syllabus
            </h2>
            <Button type="button" variant="outline" onClick={addMilestone}>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          {form.milestones.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <p className="text-slate-500">No milestones yet</p>
              <p className="text-sm text-slate-400 mb-4">
                Add milestones to structure your course
              </p>
              <Button type="button" variant="outline" onClick={addMilestone}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {form.milestones.map((milestone, mIndex) => (
                <div
                  key={mIndex}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  {/* Milestone Header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      expandedMilestone === mIndex
                        ? "bg-primary-50 border-b border-primary-100"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                    onClick={() =>
                      setExpandedMilestone(
                        expandedMilestone === mIndex ? -1 : mIndex
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                        {mIndex + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {milestone.title || `Milestone ${mIndex + 1}`}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {milestone.modules?.length || 0} modules •{" "}
                          {milestone.assignment?.title
                            ? "1 assignment"
                            : "No assignment"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMilestone(mIndex);
                        }}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedMilestone === mIndex ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Milestone Content */}
                  {expandedMilestone === mIndex && (
                    <div className="p-4 space-y-6 bg-white">
                      {/* Milestone Info */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Milestone Title"
                          value={milestone.title}
                          onChange={(e) =>
                            updateMilestone(mIndex, "title", e.target.value)
                          }
                          placeholder="e.g., Introduction to JavaScript"
                          required
                        />
                        <Input
                          label="Description"
                          value={milestone.description || ""}
                          onChange={(e) =>
                            updateMilestone(
                              mIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Brief description of this milestone"
                        />
                      </div>

                      {/* Modules Section */}
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            Modules
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addModule(mIndex)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Module
                          </Button>
                        </div>

                        {(!milestone.modules ||
                          milestone.modules.length === 0) ? (
                          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p className="text-sm text-slate-500">
                              No modules yet. Add modules with video lessons.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {milestone.modules.map((module, modIndex) => (
                              <div
                                key={modIndex}
                                className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
                              >
                                {/* Module Header */}
                                <div
                                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100"
                                  onClick={() =>
                                    setExpandedModule(
                                      expandedModule?.milestone === mIndex &&
                                        expandedModule?.module === modIndex
                                        ? null
                                        : { milestone: mIndex, module: modIndex }
                                    )
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600">
                                      {modIndex + 1}.
                                    </span>
                                    <span className="text-sm font-medium text-slate-800">
                                      {module.title || `Module ${modIndex + 1}`}
                                    </span>
                                    {module.quiz?.questions?.length > 0 && (
                                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                        {module.quiz.questions.length} quiz
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeModule(mIndex, modIndex);
                                      }}
                                      className="text-rose-600 hover:bg-rose-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    {expandedModule?.milestone === mIndex &&
                                    expandedModule?.module === modIndex ? (
                                      <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                </div>

                                {/* Module Content */}
                                {expandedModule?.milestone === mIndex &&
                                  expandedModule?.module === modIndex && (
                                    <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <Input
                                          label="Module Title"
                                          value={module.title}
                                          onChange={(e) =>
                                            updateModule(
                                              mIndex,
                                              modIndex,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          placeholder="e.g., Variables and Data Types"
                                          required
                                        />
                                        <Input
                                          label="Video URL (YouTube)"
                                          value={module.videoUrl}
                                          onChange={(e) =>
                                            updateModule(
                                              mIndex,
                                              modIndex,
                                              "videoUrl",
                                              e.target.value
                                            )
                                          }
                                          placeholder="https://youtube.com/watch?v=..."
                                          required
                                        />
                                        <Input
                                          label="Duration (minutes)"
                                          type="number"
                                          value={module.duration || 0}
                                          onChange={(e) =>
                                            updateModule(
                                              mIndex,
                                              modIndex,
                                              "duration",
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                        />
                                        <div className="flex items-center gap-2 pt-6">
                                          <input
                                            type="checkbox"
                                            id={`free-${mIndex}-${modIndex}`}
                                            checked={module.isFree || false}
                                            onChange={(e) =>
                                              updateModule(
                                                mIndex,
                                                modIndex,
                                                "isFree",
                                                e.target.checked
                                              )
                                            }
                                            className="w-4 h-4 rounded border-slate-300"
                                          />
                                          <label
                                            htmlFor={`free-${mIndex}-${modIndex}`}
                                            className="text-sm text-slate-700"
                                          >
                                            Free Preview
                                          </label>
                                        </div>
                                      </div>

                                      {/* Quiz Section */}
                                      <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h5 className="font-medium text-slate-700 flex items-center gap-2">
                                            <FileQuestion className="w-4 h-4 text-purple-600" />
                                            Module Quiz
                                          </h5>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              addQuizQuestion(mIndex, modIndex)
                                            }
                                          >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Question
                                          </Button>
                                        </div>

                                        {(!module.quiz?.questions ||
                                          module.quiz.questions.length ===
                                            0) ? (
                                          <p className="text-sm text-slate-400 text-center py-3">
                                            No quiz questions yet
                                          </p>
                                        ) : (
                                          <div className="space-y-4">
                                            {module.quiz.questions.map(
                                              (q, qIndex) => (
                                                <div
                                                  key={qIndex}
                                                  className="bg-purple-50 p-4 rounded-lg border border-purple-100"
                                                >
                                                  <div className="flex items-start justify-between mb-3">
                                                    <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                                      Question {qIndex + 1}
                                                    </span>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() =>
                                                        removeQuizQuestion(
                                                          mIndex,
                                                          modIndex,
                                                          qIndex
                                                        )
                                                      }
                                                      className="text-rose-600 hover:bg-rose-50"
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                  </div>

                                                  <Input
                                                    label="Question"
                                                    value={q.question}
                                                    onChange={(e) =>
                                                      updateQuizQuestion(
                                                        mIndex,
                                                        modIndex,
                                                        qIndex,
                                                        "question",
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="Enter your question..."
                                                  />

                                                  <div className="grid grid-cols-2 gap-2 mt-3">
                                                    {q.options.map(
                                                      (opt, optIndex) => (
                                                        <div
                                                          key={optIndex}
                                                          className="flex items-center gap-2"
                                                        >
                                                          <input
                                                            type="radio"
                                                            name={`correct-${mIndex}-${modIndex}-${qIndex}`}
                                                            checked={
                                                              q.correctAnswer ===
                                                              optIndex
                                                            }
                                                            onChange={() =>
                                                              updateQuizQuestion(
                                                                mIndex,
                                                                modIndex,
                                                                qIndex,
                                                                "correctAnswer",
                                                                optIndex
                                                              )
                                                            }
                                                            className="w-4 h-4"
                                                          />
                                                          <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) =>
                                                              updateQuizOption(
                                                                mIndex,
                                                                modIndex,
                                                                qIndex,
                                                                optIndex,
                                                                e.target.value
                                                              )
                                                            }
                                                            placeholder={`Option ${
                                                              optIndex + 1
                                                            }`}
                                                            className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded"
                                                          />
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                  <p className="text-xs text-slate-500 mt-2">
                                                    Select the radio for correct
                                                    answer
                                                  </p>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Assignment Section */}
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                          <ClipboardList className="w-4 h-4 text-amber-600" />
                          Milestone Assignment
                        </h4>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              label="Assignment Title"
                              value={milestone.assignment?.title || ""}
                              onChange={(e) =>
                                updateAssignment(
                                  mIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Build a Todo App"
                              required
                            />
                            <Input
                              label="Max Score"
                              type="number"
                              value={milestone.assignment?.maxScore || 100}
                              onChange={(e) =>
                                updateAssignment(
                                  mIndex,
                                  "maxScore",
                                  parseInt(e.target.value) || 100
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-700">
                              Description
                            </label>
                            <textarea
                              className="w-full mt-1 p-2 text-sm border border-slate-300 rounded-lg"
                              rows={2}
                              value={milestone.assignment?.description || ""}
                              onChange={(e) =>
                                updateAssignment(
                                  mIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Describe what students need to do..."
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-700">
                              Instructions
                            </label>
                            <textarea
                              className="w-full mt-1 p-2 text-sm border border-slate-300 rounded-lg"
                              rows={3}
                              value={milestone.assignment?.instructions || ""}
                              onChange={(e) =>
                                updateAssignment(
                                  mIndex,
                                  "instructions",
                                  e.target.value
                                )
                              }
                              placeholder="Step-by-step instructions..."
                            />
                          </div>

                          <Input
                            label="Deadline (days after milestone start)"
                            type="number"
                            value={milestone.assignment?.deadline || 7}
                            onChange={(e) =>
                              updateAssignment(
                                mIndex,
                                "deadline",
                                parseInt(e.target.value) || 7
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
