"use client";

import {
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	fetchSiteConfig,
} from "./siteConfig";

const FALLBACK_ANNOUNCEMENTS = [
	"✨ One of Ujjain's First Dedicated Online Stores for Custom Gifts & Printing",
	"📦 Free delivery on orders above ₹1000",
	"🖨️ Need bulk orders? Contact us: 8827882713",
	"🎁 Personalized gifts for every occasion",
	"📸 Photo Books, Mugs, Cushions & More — Order Now!",
];

export default function AnnouncementStrip() {
	const [announcements, setAnnouncements] =
		useState<string[]>(
			FALLBACK_ANNOUNCEMENTS,
		);

	useEffect(() => {
		let mounted = true;

		fetchSiteConfig()
			.then((config) => {
				if (
					mounted &&
					Array.isArray(
						config.strip,
					) &&
					config.strip.length > 0
				) {
					setAnnouncements(
						config.strip,
					);
				}
			})
			.catch((error) => {
				console.error(
					"Failed to load announcement config:",
					error,
				);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const repeatedAnnouncements =
		useMemo(
			() => [
				...announcements,
				...announcements,
				...announcements,
			],
			[announcements],
		);

	return (
		<div
			className="
				fixed
				left-0
				right-0
				top-16
				z-[90]
				h-10
				w-full
				overflow-hidden
				bg-[#85161b]
				text-white
				sm:top-[72px]
			"
		>
			<div
				className="
					announcement-strip__track
					flex
					h-full
					w-max
					items-center
					whitespace-nowrap
					px-4
					text-xs
					font-medium
					sm:text-sm
				"
			>
				{repeatedAnnouncements.map(
					(
						announcement,
						index,
					) => (
						<span
							key={`${announcement}-${index}`}
							className="
								flex
								items-center
								gap-6
								pr-6
							"
						>
							<span>
								{
									announcement
								}
							</span>

							<span className="opacity-40">
								|
							</span>
						</span>
					),
				)}
			</div>
		</div>
	);
}