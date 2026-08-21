"use client";

import { useState } from "react";
import { X, Wrench, ShoppingBag } from "lucide-react";

export default function OfferPopup() {
	const [isOpen, setIsOpen] = useState(true);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
			<div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
				{/* =====================================================
				    CLOSE BUTTON
				===================================================== */}

				<button
					type="button"
					onClick={() => setIsOpen(false)}
					aria-label="Close maintenance notice"
					className="
						absolute
						right-4
						top-4
						z-10
						flex
						h-10
						w-10
						items-center
						justify-center
						rounded-full
						bg-[#F3F3F3]
						text-[#444]
						transition-all
						duration-200
						hover:bg-[#EAEAEA]
						hover:text-[#85161B]
						hover:scale-105
						active:scale-95
					"
				>
					<X size={20} strokeWidth={2} />
				</button>

				{/* =====================================================
				    CONTENT
				===================================================== */}

				<div className="px-6 pb-8 pt-12 text-center sm:px-10 sm:pb-10 sm:pt-12">
					{/* =================================================
					    MAINTENANCE ICON
					================================================= */}

					<div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#85161B]/10">
						<Wrench size={34} strokeWidth={1.9} className="text-[#85161B]" />
					</div>

					{/* =================================================
					    HEADING
					================================================= */}

					<h2
						className="
							mt-6
							text-[26px]
							font-bold
							leading-tight
							tracking-[-0.02em]
							text-[#252525]
							sm:text-3xl
						"
					>
						We’re Under Maintenance
					</h2>

					{/* =================================================
					    DESCRIPTION
					================================================= */}

					<p
						className="
							mx-auto
							mt-4
							max-w-md
							text-sm
							font-medium
							leading-6
							text-[#555]
							sm:text-base
							sm:leading-7
						"
					>
						We’re currently making a few improvements to our website to give you
						a better experience.
					</p>

					{/* =================================================
					    WARNING BOX
					================================================= */}

					<div
						className="
							mt-7
							rounded-2xl
							border
							border-[#D9CCC5]
							bg-[#FAF7F5]
							p-4
							text-left
							sm:p-5
						"
					>
						<div className="flex items-start gap-3.5">
							{/* Icon */}

							<div
								className="
									mt-0.5
									flex
									h-10
									w-10
									shrink-0
									items-center
									justify-center
									rounded-full
									bg-[#85161B]/10
								"
							>
								<ShoppingBag
									size={19}
									strokeWidth={2}
									className="text-[#85161B]"
								/>
							</div>

							{/* Text */}

							<div className="min-w-0">
								<p
									className="
										text-sm
										font-bold
										leading-5
										text-[#252525]
										sm:text-[15px]
									"
								>
									Some features are temporarily unavailable
								</p>

								<p
									className="
										mt-1.5
										text-sm
										font-medium
										leading-5
										text-[#555]
									"
								>
									Product purchases and checkout are currently unavailable
									during this maintenance period.
								</p>
							</div>
						</div>
					</div>

					{/* =================================================
					    WHATSAPP MESSAGE
					================================================= */}

					<p
						className="
							mt-7
							text-sm
							font-medium
							leading-6
							text-[#555]
							sm:text-base
						"
					>
						For enquiries or assistance, feel free to contact us on WhatsApp.
					</p>

					{/* =================================================
					    WHATSAPP BUTTON
					================================================= */}

					<a
						href="https://wa.me/918827882713?text=Hi%2C%20I%20have%20an%20enquiry%20about%20your%20products."
						target="_blank"
						rel="noopener noreferrer"
						className="
							mt-5
							inline-flex
							items-center
							justify-center
							gap-2
							rounded-full
							bg-[#25D366]
							px-7
							py-3
							text-sm
							font-bold
							text-white
							shadow-sm
							transition-all
							duration-200
							hover:scale-[1.02]
							hover:opacity-90
							active:scale-95
						"
					>
						<span className="text-base">💬</span>
						<span>Chat with us on WhatsApp</span>
					</a>

					{/* =================================================
					    CONTINUE BROWSING
					================================================= */}

					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="
							mt-3
							rounded-full
							px-5
							py-2
							text-sm
							font-semibold
							text-[#555]
							transition-all
							duration-200
							hover:bg-[#F7F3F1]
							hover:text-[#85161B]
						"
					>
						Continue browsing
					</button>
				</div>
			</div>
		</div>
	);
}
