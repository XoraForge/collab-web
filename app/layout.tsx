import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import "@/lib/dayjs";
import DialogContextProvider from "@/lib/DialogContext";
import ProjectContextProvider from "@/lib/CurrentProjectContext";
import SidebarProvider from "@/lib/SidebarContext";
import NavTabsContextProvider from "@/lib/NavTabsContext";
import ToastProvider from "@/lib/ToastContext";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collab - Collaborate in one single app",
  description:
    "Collab combines group chat, scheduling, notes, task tracking, and simple document tools into one collaborative workspace so teams can get more done without switching apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} min-h-screen max-w-svw antialiased dark relative`}
      >
        <NavTabsContextProvider>
          <SidebarProvider>
            <ProjectContextProvider>
              <DialogContextProvider>
                <ToastProvider>{children}</ToastProvider>
              </DialogContextProvider>
            </ProjectContextProvider>
          </SidebarProvider>
        </NavTabsContextProvider>
      </body>
    </html>
  );
}
