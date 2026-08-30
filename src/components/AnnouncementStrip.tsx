"use client";

import React from "react";

const announcements = [
	"One of ujjain's first dedicated online store for personalized gifts and custom printing",
	"📦 Free delivery on orders above ₹1000",
	"🖨️ Want bulk orders ? Contact us 8827882713",
	"🎁 Custom gifts for birthdays, weddings & corporate events",
	"📸 Photo Books, Mugs, Cushions & more — Order Now!",
];

export default function AnnouncementStrip() {
	const repeatedAnnouncements = [
		...announcements,
		...announcements,
		...announcements,
	];

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
				{repeatedAnnouncements.map((announcement, index) => (
					<span
						key={`${announcement}-${index}`}
						className="
								flex
								items-center
								gap-6
								pr-6
							"
					>
						<span>{announcement}</span>

						<span className="opacity-40">|</span>
					</span>
				))}
			</div>
		</div>
	);
}
