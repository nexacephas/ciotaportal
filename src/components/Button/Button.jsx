import { forwardRef } from "react";
import "./Button.css";

const Button = forwardRef(function Button({ variant = "primary", size = "md", type = "button", className = "", children, ...props }, ref) {
  return <button ref={ref} type={type} className={`ui-button ui-button-${variant} ui-button-${size} ${className}`.trim()} {...props}>{children}</button>;
});

export default Button;
