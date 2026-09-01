"use client";

import { usePathname } from "next/navigation";

import AnnouncementStrip from "@/components/AnnouncementStrip";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SupportBubble from "@/components/SupportBubble";

export default function StoreLayout() {
	const pathname = usePathname();

	/*
	 * Don't render the customer website chrome
	 * anywhere under /admin.
	 */
	if (pathname.startsWith("/admin")) {
		return null;
	}

	return (
		<>
			<SiteHeader />

			<AnnouncementStrip />

			<SupportBubble />

			<SiteFooter />
		</>
	);
}
