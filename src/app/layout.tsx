import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NEXUS-3D — ULPIN & Vertical Property Mapping",
  description:
    "NEXUS-3D that connects 2D land parcels to 3D buildings, floors and units using ULPIN identifiers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${mono.variable} antialiased text-slate-100`}>
        <NavBar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
