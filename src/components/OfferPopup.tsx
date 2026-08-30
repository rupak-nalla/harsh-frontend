"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function OfferPopup() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
			<div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
				{/* Close Button */}
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					aria-label="Close offer"
					className="
						absolute
						right-3
						top-3
						z-10
						flex
						h-9
						w-9
						items-center
						justify-center
						rounded-full
						bg-white/90
						text-[#444]
						shadow-md
						backdrop-blur-sm
						transition-all
						duration-200
						hover:bg-white
						hover:text-[#85161B]
						hover:scale-105
						active:scale-95
					"
				>
					<X size={20} strokeWidth={2} />
				</button>

				{/* Offer Image */}
				<img
					src="/Images/offerpop.jpeg"
					alt="Special Offer"
					className="block h-auto w-full object-contain"
				/>
			</div>
		</div>
	);
}
