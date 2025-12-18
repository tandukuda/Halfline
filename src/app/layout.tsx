import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; // Import the font
import "./globals.css";

// Configure JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains", // Define a CSS variable
});

export const metadata: Metadata = {
  title: "Halftone Lines - Rose Pine Moon",
  description: "Vertical line halftone generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the variable to the body */}
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
