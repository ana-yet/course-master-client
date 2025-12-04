import CoursePreview from "./CoursePreview";

// Server-side data fetching
async function getCourseData(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const course = await getCourseData(params.id);

  if (!course) {
    return {
      title: "Course Not Found | CourseMaster",
    };
  }

  return {
    title: `${course.title} | CourseMaster`,
    description: course.description?.substring(0, 160),
    openGraph: {
      title: course.title,
      description: course.description?.substring(0, 160),
      images: [course.thumbnail],
    },
  };
}

export default async function CourseDetailsPage({ params }) {
  const course = await getCourseData(params.id);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Course Not Found
          </h1>
          <p className="text-slate-500 mt-2">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <CoursePreview course={course} />;
}
