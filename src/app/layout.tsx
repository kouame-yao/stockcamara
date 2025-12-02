import AuthContextProvider from "@/propre-elements/contexts/AuthContextProvider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "App stock",
  description: "Application de stock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${poppins.className}  antialiased `}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
