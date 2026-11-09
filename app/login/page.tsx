"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { checkEmail, login, signUp } from "@/lib/api/Auth";
import { ApiError } from "@/lib/api/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

type Step = "email" | "password" | "signup";

const HEADINGS: Record<Step, { title: string; subtitle: string }> = {
  email: {
    title: "Login into Collab",
    subtitle: "Sign in now to access your collaboration space",
  },
  password: { title: "Welcome back", subtitle: "Enter your password for" },
  signup: { title: "Create your account", subtitle: "Set up Collab for" },
};

const INPUT_STYLE = { height: 45 };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo = next?.startsWith("/") ? next : "/dashboard";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  function goToStep(nextStep: Step) {
    setStep(nextStep);
    setPassword("");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsBusy(true);

    try {
      if (step === "email") {
        if (!email.trim()) {
          setError("Enter your email address.");
          return;
        }
        const exists = await checkEmail(email.trim());
        goToStep(exists ? "password" : "signup");
        return;
      }

      if (step === "password") await login(email.trim(), password);
      else await signUp(name.trim(), email.trim(), password);

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsBusy(false);
    }
  }

  const heading = HEADINGS[step];
  const busyLabel = { email: "Checking…", password: "Logging in…", signup: "Creating account…" }[step];
  const submitLabel = { email: "Continue", password: "Log in", signup: "Create account" }[step];

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4">
      {/* Form */}
      <div className="min-h-[65vh] w-[600px] max-w-full bg-black flex flex-col justify-between shadow-gray-700 border-2 border-[#525252] rounded-md p-7">
        <div className="flex items-center gap-x-3">
          <div className="size-6 relative">
            <Image src="/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <h1 className="font-semibold">Collab</h1>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col self-center gap-y-5 w-full sm:w-[70%] h-full justify-center py-8"
        >
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-semibold">{heading.title}</h1>
            <p className="text-sm">
              {heading.subtitle}
              {step !== "email" && (
                <>
                  {" "}
                  <span className="font-semibold">{email.trim()}</span>
                  {" · "}
                  <button
                    type="button"
                    className="underline opacity-80 hover:opacity-100"
                    onClick={() => goToStep("email")}
                  >
                    Change
                  </button>
                </>
              )}
            </p>
          </div>

          {step === "email" && (
            <>
              <div className="flex flex-col gap-y-3">
                <Button
                  type="button"
                  className="flex gap-x-3 items-center"
                  variant="outline"
                  style={INPUT_STYLE}
                  onClick={() => setNotice("Google sign-in is coming soon. Use your email for now.")}
                >
                  <Icon icon="devicon:google" />
                  <p>Log in with Google</p>
                </Button>
                <Button
                  type="button"
                  className="flex gap-x-3 items-center"
                  variant="outline"
                  style={INPUT_STYLE}
                  onClick={() => setNotice("Apple sign-in is coming soon. Use your email for now.")}
                >
                  <Icon icon="ic:outline-apple" />
                  <p>Log in with Apple</p>
                </Button>
                {notice && <p className="text-xs opacity-80">{notice}</p>}
              </div>
              <hr />
              <Input
                type="email"
                autoComplete="email"
                autoFocus
                aria-label="Email address"
                placeholder="Enter your email address"
                className="placeholder:text-white"
                style={INPUT_STYLE}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {step === "signup" && (
            <Input
              autoComplete="name"
              autoFocus
              aria-label="Your name"
              placeholder="Your name"
              className="placeholder:text-white"
              style={INPUT_STYLE}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {step !== "email" && (
            <Input
              type="password"
              autoComplete={step === "signup" ? "new-password" : "current-password"}
              autoFocus={step === "password"}
              aria-label="Password"
              placeholder={step === "signup" ? "Create a password (8+ characters)" : "Password"}
              className="placeholder:text-white"
              style={INPUT_STYLE}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400 -mt-2">
              {error}
            </p>
          )}

          <Button type="submit" style={INPUT_STYLE} disabled={isBusy}>
            {isBusy ? busyLabel : submitLabel}
          </Button>

          <p className="text-xs">
            By continuing, you acknowledge that you understand and agree to the{" "}
            <Link href="/terms-and-conditions" className="underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
