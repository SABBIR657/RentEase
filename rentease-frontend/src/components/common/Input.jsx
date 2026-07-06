export default function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  register,
  error,
  required = false,
  className = "",
  hint = "",
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        {...rest}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
          ${className}`}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
