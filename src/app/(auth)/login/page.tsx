import type { Metadata } from "next";
import { AuthFrame, LoginForm } from "@/components/task-management/auth";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Task Management workspace.",
};
export default function LoginPage() {
  return (
    <AuthFrame mode="login">
      <LoginForm />
    </AuthFrame>
  );
}
