import type { Metadata } from "next";
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
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

