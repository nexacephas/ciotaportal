import { cloneElement, isValidElement, useId } from "react";
import "./FormField.css";

export default function FormField({ label, error, hint, className = "", children, as = "input", ...props }) {
  const id = useId();
  const fieldProps = { ...props, id: props.id ?? id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined };
  const field = isValidElement(children) ? cloneElement(children, fieldProps) : as === "textarea" ? <textarea className="form-control" {...fieldProps} /> : <input className="form-control" {...fieldProps} />;
  return <div className={`field-group ${className}`.trim()}><label htmlFor={fieldProps.id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>{field}{error && <span id={`${id}-error`} className="field-error" role="alert">{error}</span>}{hint && !error && <span id={`${id}-hint`} className="field-hint">{hint}</span>}</div>;
}
