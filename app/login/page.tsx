import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

export default function page() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      {/* Form */}
      <div className="h-[65%] w-[600px] bg-black flex flex-col justify-between shadow-gray-700 border-2 border-[#525252] rounded-md p-7">
        <div className="flex items-center gap-x-3">
          <div className="size-6 relative">
            <Image src="/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <h1 className="font-semibold">Collab</h1>
        </div>
        <div className="flex flex-col self-center gap-y-5 w-[70%] h-full justify-center">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-semibold">Login into Collab</h1>
            <p className="text-sm">
              Sign in now to access your collaboration space
            </p>
          </div>
          <div className="flex flex-col gap-y-3">
            <Button
              className="flex gap-x-3 items-center"
              variant="outline"
              style={{
                height: 45,
              }}
            >
              <Icon icon="devicon:google" />
              <p>Log in with Google</p>
            </Button>
            <Button
              className="flex gap-x-3 items-center"
              variant="outline"
              style={{
                height: 45,
              }}
            >
              <Icon icon="ic:outline-apple" />
              <p>Log in with Apple</p>
            </Button>
          </div>
          <hr />
          <Input
            placeholder="Enter your email address"
            className="placeholder:text-white"
            style={{
              height: 45,
            }}
          />
          <Button
            style={{
              height: 45,
            }}
            asChild
          >
            <Link href="/dashboard">Continue</Link>
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
        </div>
      </div>
    </div>
  );
}
