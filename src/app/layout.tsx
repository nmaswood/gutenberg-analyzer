import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Gutenberg Ebook Analyzer ",
  description: "download books and analyze them in few clicks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
