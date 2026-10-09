import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import Providers from "@/providers";

export const metadata: Metadata = {
  title: {
    default: "Task Management — Work in focus",
    template: "%s | Task Management",
  },
  description:
    "A calm workspace for projects, teams, and the work that moves them forward.",
  openGraph: {
    title: "Task Management",
    description: "Make space for your best work.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-950 antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
