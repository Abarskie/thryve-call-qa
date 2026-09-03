import { LoaderCircle } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-[#0b1320] text-blue-400"
    >
      <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading Callsy QA</span>
    </div>
  );
}
