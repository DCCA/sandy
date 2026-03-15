import type { InputFieldProps } from "@/lib/schemas/input-field";

export function InputField({
  label,
  placeholder,
  type = "text",
  required = false,
  helperText,
  error,
}: InputFieldProps) {
  const hasError = !!error;

  return (
    <div style={{ fontFamily: "var(--sandy-font-family)", color: "var(--sandy-color-foreground)" }}>
      <label className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        readOnly
        className="block w-full text-sm px-3 py-2 outline-none"
        style={{
          backgroundColor: "var(--sandy-color-background)",
          border: `1px solid ${hasError ? "#ef4444" : "var(--sandy-color-border)"}`,
          borderRadius: "var(--sandy-radius-sm)",
          color: "var(--sandy-color-foreground)",
        }}
      />
      {error && (
        <p className="text-xs mt-1 m-0" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs mt-1 m-0" style={{ color: "var(--sandy-color-muted)" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
