import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaQuest Control Hub | Executive Administration",
  description: "Unified Content Management & Cohort Control System for MetaQuest Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#070A12] text-gray-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
