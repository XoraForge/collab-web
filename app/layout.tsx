import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import DialogLayout from "@/components/dialog/DialogLayout";
import DialogContextProvider from "@/lib/DialogContext";

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
        <DialogContextProvider>
          {children}
          <DialogLayout />
        </DialogContextProvider>
      </body>
    </html>
  );
}
