import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Catherine of Victory",
  description: "Catherine of Victory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-black">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
