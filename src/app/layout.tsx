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
	metadataBase: new URL("https://printinghouseujjain.vercel.app"),

	title: {
		default: "Printing House Ujjain | You think...We Create...",
		template: "%s | Printing House Ujjain",
	},

	description:
		"Shop personalized gifts, custom t-shirts, photo frames, mugs, cushions and unique custom products from Printing House Ujjain. We also offer professional printing services and bulk orders.",

	keywords: [
		"Printing House Ujjain",
		"personalized gifts Ujjain",
		"custom gifts Ujjain",
		"personalized gifts",
		"custom printing Ujjain",
		"printing services Ujjain",
		"custom t-shirts Ujjain",
		"photo frames Ujjain",
		"personalized mugs",
		"photo gifts",
		"corporate gifts Ujjain",
		"bulk printing Ujjain",
	],

	authors: [
		{
			name: "Printing House Ujjain",
		},
	],

	creator: "Printing House Ujjain",

	applicationName: "Printing House Ujjain",

	robots: {
		index: true,
		follow: true,
	},

	openGraph: {
		type: "website",

		url: "https://printinghouseujjain.vercel.app",

		title: "Printing House Ujjain | You think...We Create...",

		description:
			"Discover personalized gifts, custom products and professional printing services from Printing House Ujjain.",

		siteName: "Printing House Ujjain",

		locale: "en_IN",

		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Printing House Ujjain - You think...We Create...",
			},
		],
	},

	twitter: {
		card: "summary_large_image",

		title: "Printing House Ujjain | You think...We Create...",

		description:
			"Personalized gifts, custom products and professional printing services from Printing House Ujjain.",

		images: ["/og-image.jpg"],
	},

	icons: {
		icon: "/favicon.ico",
	},
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
