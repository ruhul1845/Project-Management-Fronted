import type { Metadata } from "next";
import { AuthFrame, RegisterForm } from "@/components/workline/auth";
export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Workline account.",
};
export default function RegisterPage() {
  return (
    <AuthFrame mode="register">
      <RegisterForm />
    </AuthFrame>
  );
}
