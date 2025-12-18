import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; //
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap", //
});

export const metadata: Metadata = {
  title: "Halfline",
  description: "Halftone Line Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the font class here */}
      <body className={jetbrainsMono.className}>{children}</body>
    </html>
  );
}
