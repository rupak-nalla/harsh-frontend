"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function OfferPopup() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
			<div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
				{/* Close Button */}
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					aria-label="Close popup"
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
						text-gray-700
						shadow-md
						transition
						hover:bg-white
						hover:scale-105
					"
				>
					<X size={20} />
				</button>

				{/* Offer Image */}
				<Image
					src="/Images/offer-popup.jpg"
					alt="Special offer"
					width={800}
					height={800}
					className="h-auto w-full object-contain"
					priority
				/>
			</div>
		</div>
	);
}
