import React from "react";

// Simple utility function to replace @/lib/utils
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
