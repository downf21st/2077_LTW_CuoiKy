import "./FormField.css";

export default function FormField({ id, label, required, hint, error, children, className = "" }) {
  return (
    <div className={["form-field", className].filter(Boolean).join(" ")}>
      <label id={`${id}-label`} className="form-field__label" htmlFor={id}>
        {label}
        {required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="form-field__error">{error}</p>}
      {hint && <p id={`${id}-hint`} className="form-field__hint">{hint}</p>}
    </div>
  );
}
