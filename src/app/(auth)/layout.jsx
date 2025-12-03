export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-600">
            CourseMaster
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Build skills for your future.
          </p>
        </div>

        {/* The Login/Register page will be injected here */}
        {children}
      </div>
    </div>
  );
}
