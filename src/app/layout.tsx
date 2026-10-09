import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import Providers from "@/providers";

export const metadata: Metadata = {
  title: {
    default: "Project Management — Work in focus",
    template: "%s | Project Management",
  },
  description:
    "A calm workspace for projects, teams, and the work that moves them forward.",
  openGraph: {
    title: "Project Management",
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
