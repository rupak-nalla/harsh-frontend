import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AnnouncementStrip from "@/components/AnnouncementStrip";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrintingHouseUjjain — Personalized Gifts",
  description:
    "Custom personalized gifts, t-shirts, photo frames, and printing services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} antialiased`}
		>
			<body className="min-h-screen bg-[#FFF9F4]">
				
				<SiteHeader />

				<AnnouncementStrip />

				{children}

				<SiteFooter />
			</body>
		</html>
	);
}