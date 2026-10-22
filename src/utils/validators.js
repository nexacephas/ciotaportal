export const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
export const validatePhone = (value) => String(value ?? "").replace(/\D/g, "").length >= 10;
export const required = (value, label = "This field") => String(value ?? "").trim() ? "" : `${label} is required.`;

export function validateApplication(values) {
  const errors = {};
  for (const key of ["fullName", "email", "phone", "category", "occupation", "organization", "state", "highestQualification"]) {
    if (!String(values[key] ?? "").trim()) errors[key] = `${key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} is required.`;
  }
  if (values.email && !validateEmail(values.email)) errors.email = "Enter a valid email address.";
  if (values.phone && !validatePhone(values.phone)) errors.phone = "Enter a valid phone number.";
  return errors;
}

export function validateRegistration(values) {
  const errors = {};
  if (String(values.fullName ?? "").trim().length < 2) errors.fullName = "Enter your full name.";
  if (!validateEmail(values.email)) errors.email = "Enter a valid email address.";
  if (!validatePhone(values.phone)) errors.phone = "Enter a valid phone number.";
  if (!values.terms) errors.terms = "Accept the demo terms to continue.";
  return errors;
}
