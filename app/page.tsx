import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1>Home page (Coming soon)</h1>
      <Link href="/login">Go to login</Link>
    </div>
  );
}
