import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Gérant",
  description: "Application pour gérer la boutique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}