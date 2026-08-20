import React from "react";

const announcements = [
	"One of ujjain's first dedicated online store for personalized gifts and custom printing",
	"📦 Free delivery on orders above ₹1000 within Ujjain",
	"🖨️ Want bulk orders ? Contact us 8827882713",
	"🎁 Custom gifts for birthdays, weddings & corporate events",
	// "💳 PVC Cards starting at just ₹5/piece — Bulk orders welcome",
	"📸 Photo Books, Mugs, Cushions & more — Order Now!",
	// "🏷️ Flex Banners from ₹20/sq.ft — Premium quality guaranteed",
];

export default function AnnouncementStrip() {
	return (
		<div className="announcement-strip w-full h-10 overflow-hidden bg-[#85161b] text-white my-3 flex items-center">
			<div className="announcement-strip__track flex h-full w-max items-center gap-6 whitespace-nowrap px-4 text-xs sm:text-sm font-medium">
				{[...announcements, ...announcements].map((announcement, index) => (
					<span
						key={`${announcement}-${index}`}
						className="flex items-center gap-6"
					>
						<span>{announcement}</span>
						<span className="opacity-35">|</span>
					</span>
				))}
			</div>
		</div>
	);
}
