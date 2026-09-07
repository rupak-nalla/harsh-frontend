"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import {
	assetUrl,
	fetchSiteConfig,
} from "./siteConfig";

export default function OfferPopup() {
	const [isOpen, setIsOpen] =
		useState(false);

	const [enabled, setEnabled] =
		useState(false);

	const [image, setImage] =
		useState("");

	useEffect(() => {
		let mounted = true;

		fetchSiteConfig()
			.then((config) => {
				if (!mounted) {
					return;
				}

				const popupEnabled =
					config.popup?.enabled ===
					true;

				const popupImage =
					assetUrl(
						config.popup?.image,
					);

				setEnabled(
					popupEnabled,
				);

				setImage(
					popupImage,
				);

				setIsOpen(
					popupEnabled &&
						Boolean(
							popupImage,
						),
				);
			})
			.catch((error) => {
				console.error(
					"Failed to load popup config:",
					error,
				);
			});

		return () => {
			mounted = false;
		};
	}, []);

	if (
		!enabled ||
		!image ||
		!isOpen
	) {
		return null;
	}

	return (
		<div
			className="
				fixed
				inset-0
				z-[9999]
				flex
				items-center
				justify-center
				bg-black/55
				px-4
				backdrop-blur-[2px]
			"
		>
			<div className="relative w-full max-w-lg">
				<button
					type="button"
					onClick={() =>
						setIsOpen(false)
					}
					aria-label="Close offer"
					className="
						absolute
						-right-2
						-top-2
						z-20
						flex
						h-10
						w-10
						items-center
						justify-center
						rounded-full
						bg-white
						text-[#333]
						shadow-[0_4px_16px_rgba(0,0,0,0.25)]
						transition-all
						duration-200
						hover:scale-110
						hover:text-[#85161B]
						hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]
						active:scale-95
						sm:-right-3
						sm:-top-3
					"
				>
					<X
						size={20}
						strokeWidth={2.2}
					/>
				</button>

				<div className="overflow-visible">
					<img
						src={image}
						alt="Special Offer"
						className="
							block
							h-auto
							w-full
							object-contain
							drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]
						"
					/>
				</div>
			</div>
		</div>
	);
}