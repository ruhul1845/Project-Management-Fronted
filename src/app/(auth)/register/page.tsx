import type { Metadata } from "next";
import { AuthFrame, RegisterForm } from "@/components/task-management/auth";
export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Task Management account.",
};
export default function RegisterPage() {
  return (
    <AuthFrame mode="register">
      <RegisterForm />
    </AuthFrame>
  );
}
