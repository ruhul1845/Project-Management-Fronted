"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@tanstack/react-form";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import type { User } from "@/lib/task-management-types";
import { Brand, Spinner } from "./ui";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
const registerSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters").max(80),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[0-9]/, "Add a number"),
});
function errorsOf(errors: readonly unknown[]) {
  return errors
    .map((item) =>
      typeof item === "object" && item !== null && "message" in item
        ? String(item.message)
        : String(item),
    )
    .join(", ");
}
async function submitAuth(path: string, body: unknown): Promise<User> {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.message ?? "Sign in failed");
  return result.data.user as User;
}
export function AuthFrame({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col px-5 py-7 sm:px-10 lg:px-16">
        <Brand />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          {children}
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Task Management ·{" "}
          {mode === "login" ? "Welcome back" : "A clearer way to work"}
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-[#f4f7ff] p-16 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -right-30 -top-30 size-96 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="relative mx-auto w-full max-w-lg">
          <span className="eyebrow">Thoughtful work, together</span>
          <h2 className="mt-5 text-5xl font-semibold leading-[1.13] tracking-tight text-slate-950">
            Give every good idea room to become great work.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-slate-600">
            Bring your projects, tasks, and people into one beautiful, focused
            workspace.
          </p>
          <div className="soft-shadow mt-12 rounded-3xl border border-white bg-white p-7">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-semibold">Plan with confidence</p>
                <p className="text-sm text-slate-500">
                  Clear steps. Shared progress. Better outcomes.
                </p>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-slate-100">
              <div className="h-full w-[72%] rounded-full bg-blue-600" />
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-500">
              <span>Project momentum</span>
              <span className="font-semibold text-blue-600">
                Moving forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demos, setDemos] = useState<Record<string, boolean>>({});
  useEffect(() => {
    fetch("/api/auth/demos")
      .then((r) => r.json())
      .then((r) => setDemos(r.data ?? {}))
      .catch(() => {});
  }, []);
  function finish(user: User) {
    toast.add({
      title: "Welcome back",
      description: `Signed in as ${user.name}`,
      type: "success",
    });
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(
      next?.startsWith("/") && !next.startsWith("//")
        ? next
        : user.role === "ADMIN"
          ? "/admin"
          : "/workspace",
    );
    router.refresh();
  }
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        finish(await submitAuth("login", value));
      } catch (error) {
        toast.add({
          title: "Could not sign in",
          description: error instanceof Error ? error.message : "Try again",
          type: "error",
        });
      } finally {
        setPending(false);
      }
    },
  });
  async function demo(role: string) {
    setPending(true);
    try {
      finish(await submitAuth("demo", { role }));
    } catch (error) {
      toast.add({
        title: "Demo login unavailable",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      });
    } finally {
      setPending(false);
    }
  }
  async function google(idToken?: string) {
    if (!idToken) return;
    setPending(true);
    try {
      finish(await submitAuth("google", { idToken }));
    } catch (error) {
      toast.add({
        title: "Google sign in failed",
        description: error instanceof Error ? error.message : "Try again",
        type: "error",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Sign in to your workspace
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Enter your details to pick up where you left off.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => (
            <div>
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="field"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errorsOf(field.state.meta.errors)}
                  </p>
                )}
            </div>
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="field pr-12"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errorsOf(field.state.meta.errors)}
                  </p>
                )}
            </div>
          )}
        </form.Field>
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? (
            <Spinner />
          ) : (
            <>
              Sign in <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
      <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Or continue with
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credential) => google(credential.credential)}
            onError={() =>
              toast.add({ title: "Google sign in failed", type: "error" })
            }
            theme="outline"
            shape="rectangular"
            width="320"
          />
        </div>
      )}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Quick demo login</h2>
          <span className="text-xs text-slate-400">Explore by role</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { role: "OWNER", icon: LockKeyhole, label: "Owner" },
            { role: "MANAGER", icon: Users, label: "Manager" },
            { role: "MEMBER", icon: UserRound, label: "Member" },
          ].map(({ role, icon: Icon, label }) => (
            <button
              key={role}
              type="button"
              disabled={!demos[role] || pending}
              onClick={() => demo(role)}
              title={
                !demos[role]
                  ? "Demo account is not configured"
                  : `Sign in as ${label}`
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
        {!Object.values(demos).some(Boolean) && (
          <p className="mt-2 text-xs text-slate-400">
            Demo accounts can be enabled with dedicated credentials in the
            frontend environment.
          </p>
        )}
      </div>
      <p className="mt-8 text-center text-sm text-slate-500">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      setPending(true);
      try {
        await submitAuth("register", value);
        toast.add({
          title: "Account created",
          description: "Welcome to Task Management",
          type: "success",
        });
        router.push("/workspace");
        router.refresh();
      } catch (error) {
        toast.add({
          title: "Could not create account",
          description: error instanceof Error ? error.message : "Try again",
          type: "error",
        });
      } finally {
        setPending(false);
      }
    },
  });
  return (
    <>
      <p className="eyebrow">Get started</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        A clear workspace is just a few steps away.
      </p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        {(["name", "email", "password"] as const).map((name) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <div>
                <label className="field-label" htmlFor={name}>
                  {name === "name"
                    ? "Full name"
                    : name === "email"
                      ? "Email address"
                      : "Password"}
                </label>
                <input
                  id={name}
                  type={
                    name === "password"
                      ? "password"
                      : name === "email"
                        ? "email"
                        : "text"
                  }
                  autoComplete={
                    name === "name"
                      ? "name"
                      : name === "email"
                        ? "email"
                        : "new-password"
                  }
                  className="field"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="mt-1.5 text-xs text-rose-600">
                      {errorsOf(field.state.meta.errors)}
                    </p>
                  )}
              </div>
            )}
          </form.Field>
        ))}
        <p className="text-xs leading-5 text-slate-500">
          Use 8+ characters with an uppercase letter, lowercase letter, and
          number.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? (
            <Spinner />
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
