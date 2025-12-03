import api from "@/lib/axios";

export const courseService = {
  // Get All Courses with filters
  // params: { search, category, sort, page, limit }
  async getAllCourses(params) {
    // Axios automatically serializes the params object into ?key=value
    const response = await api.get("/courses", { params });
    return response.data;
  },

  // Get Single Course
  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create Course (Admin)
  async createCourse(courseData) {
    const response = await api.post("/courses", courseData);
    return response.data;
  },
};
