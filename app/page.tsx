import { redirect } from "next/navigation";

/** No marketing page yet: go to the app (the route guard sends signed-out users to login). */
export default function Home() {
  redirect("/dashboard");
}
