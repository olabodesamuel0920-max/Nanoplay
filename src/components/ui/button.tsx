// src/components/ui/button.tsx
import React from "react";
import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "premium" | "glass" | "danger";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "premium",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const buttonClassName = [
    styles.btn,
    styles[variant],
    loading ? styles.loading : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner}></span>
      ) : (
        children
      )}
    </button>
  );
}
