import type { Metadata } from "next";
import { AuthFrame, LoginForm } from "@/components/workline/auth";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Workline workspace.",
};
export default function LoginPage() {
  return (
    <AuthFrame mode="login">
      <LoginForm />
    </AuthFrame>
  );
}
