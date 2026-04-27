import type { Metadata } from "next";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { AuthProvider } from "./lib/AuthProvider";

export const metadata: Metadata = {
  title: "POE3D - Localization Management",
  description: "Manage your localization projects with style - 3D Cartoon Neobrutalism design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
