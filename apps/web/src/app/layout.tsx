import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalBackground } from "@/components/ui/conditional-background";
import { AppSidebar } from "@/components/ui/app-sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Learning OS",
  description: "Autonomous Study System Powered by Notion MCP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-white text-gray-900 font-inter antialiased`}>
        <ConditionalBackground />
        <AppSidebar>{children}</AppSidebar>
      </body>
    </html>
  );
}
