import { cn } from "@/lib/utils";

export default function Input({
  label,
  error,
  className,
  id,
  type = "text",
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
