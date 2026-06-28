import type { InputFieldProps } from "@/lib/schemas/input-field";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "field"
  );
}

export function InputField({
  label,
  placeholder,
  type = "text",
  required = false,
  helperText,
  error,
}: InputFieldProps) {
  const hasError = !!error;
  const fieldId = `input-${slugify(label)}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = hasError ? errorId : helperText ? helperId : undefined;

  return (
    <div style={{ fontFamily: "var(--sandy-font-family)", color: "var(--sandy-color-foreground)" }}>
      <label htmlFor={fieldId} className="block text-sm mb-1.5" style={{ fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        readOnly
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className="block w-full text-sm px-3 py-2 outline-none"
        style={{
          backgroundColor: "var(--sandy-color-background)",
          border: `1px solid ${hasError ? "#ef4444" : "var(--sandy-color-border)"}`,
          borderRadius: "var(--sandy-radius-sm)",
          color: "var(--sandy-color-foreground)",
        }}
      />
      {error && (
        <p id={errorId} className="text-xs mt-1 m-0" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs mt-1 m-0" style={{ color: "var(--sandy-color-muted)" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
