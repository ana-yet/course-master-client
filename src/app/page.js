export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      {/* Uses --font-sans from theme */}
      <h1 className="text-4xl font-bold text-primary-600">CourseMaster (v4)</h1>

      <div className="flex gap-4">
        {/* Uses --color-primary-600 */}
        <button className="rounded-lg bg-primary-600 px-6 py-3 text-white shadow-md hover:bg-primary-700 transition">
          Primary Action
        </button>

        {/* Uses --color-secondary-500 */}
        <button className="rounded-lg bg-secondary-500 px-6 py-3 text-white shadow-md hover:bg-secondary-600 transition">
          Enroll Now
        </button>
      </div>
    </div>
  );
}
