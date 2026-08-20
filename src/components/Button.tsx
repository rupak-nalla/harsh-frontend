"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
};

export default function Button({ variant = "primary", children, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
  const styles =
    variant === "primary"
      ? "bg-sky-600 text-white hover:bg-sky-700"
      : "bg-transparent text-sky-600 hover:underline";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}
