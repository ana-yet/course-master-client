import api from "@/lib/axios";

export const enrollmentService = {
  // Buy a course
  async enrollInCourse(courseId) {
    const response = await api.post(`/enrollments/${courseId}`);
    return response.data;
  },

  // Check if I already own this course
  async checkEnrollmentStatus(courseId) {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data; // Returns { enrolled: true/false }
  },

  // Get My Dashboard Courses
  async getMyCourses() {
    const response = await api.get("/enrollments/my-courses");
    return response.data;
  },
};
