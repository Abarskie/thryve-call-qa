import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thryve Call QA - Call Quality Assurance & Coaching",
  description: "AI-powered Call Quality Assurance and Coaching platform for sales teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0b1320] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
