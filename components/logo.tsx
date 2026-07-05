import type React from "react"

export function LogoIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 10V6a2 2 0 0 1 2-2h4M22 4h4a2 2 0 0 1 2 2v4M28 22v4a2 2 0 0 1-2 2h-4M10 28H6a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="m8 16 8-6 8 6-8 6-8-6Z"
        fill="currentColor"
        opacity=".16"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M11 16h10M16 12.5v7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
