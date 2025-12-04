import api from "@/lib/axios";

export const enrollmentService = {
  // Create Stripe checkout session
  async createCheckoutSession(courseId) {
    const response = await api.post("/payments/create-checkout-session", {
      courseId,
    });
    return response.data;
  },

  // Buy a course (for free courses)
  async enrollInCourse(courseId) {
    const response = await api.post(`/enrollments/${courseId}`);
    return response.data;
  },

  // Check if I already own this course
  async checkEnrollmentStatus(courseId) {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data;
  },

  // Get My Dashboard Courses
  async getMyCourses() {
    const response = await api.get("/enrollments/my-courses");
    return response.data;
  },

  // Get full enrollment details for learning page
  async getEnrollmentDetails(courseId) {
    const response = await api.get(`/enrollments/details/${courseId}`);
    return response.data;
  },

  // Update progress
  async updateProgress(courseId, moduleId) {
    const response = await api.post("/enrollments/progress", {
      courseId,
      moduleId,
    });
    return response.data;
  },

  // Submit quiz
  async submitQuiz(courseId, moduleId, answers) {
    const response = await api.post("/enrollments/quiz", {
      courseId,
      moduleId,
      answers,
    });
    return response.data;
  },

  // Submit assignment
  async submitAssignment(courseId, milestoneId, submissionUrl) {
    const response = await api.post("/enrollments/assignment", {
      courseId,
      milestoneId,
      submissionUrl,
    });
    return response.data;
  },
};
