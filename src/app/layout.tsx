import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Γραφείο AI",
  description: "AI-powered office workspace for Greek professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
