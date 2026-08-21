"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
	MessageCircle,
	Phone,
	Palette,
	Package,
	X,
	ChevronRight,
} from "lucide-react";

const WHATSAPP_NUMBER = "918827882713";
const PHONE_NUMBER = "+91 918827882713";

export default function SupportBubble() {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	/*
	|--------------------------------------------------------------------------
	| CLOSE WHEN CLICKING OUTSIDE
	|--------------------------------------------------------------------------
	*/

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	/*
	|--------------------------------------------------------------------------
	| WHATSAPP
	|--------------------------------------------------------------------------
	*/

	const openWhatsApp = () => {
		const message = encodeURIComponent(
			"Hi! I need some help with my order/product.",
		);

		window.open(
			`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
			"_blank",
			"noopener,noreferrer",
		);
	};

	/*
	|--------------------------------------------------------------------------
	| CALL
	|--------------------------------------------------------------------------
	*/

	const callUs = () => {
		window.location.href = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;
	};

	/*
	|--------------------------------------------------------------------------
	| SUPPORT OPTIONS
	|--------------------------------------------------------------------------
	*/

	const supportOptions = [
		{
			id: "whatsapp",
			icon: MessageCircle,
			title: "Chat on WhatsApp",
			subtitle: "Quick help & enquiries",
			onClick: openWhatsApp,
		},
		{
			id: "call",
			icon: Phone,
			title: "Call Us",
			subtitle: "Talk to our team",
			onClick: callUs,
		},
		{
			id: "custom",
			icon: Palette,
			title: "Custom Printing",
			subtitle: "Need help with your design?",
			onClick: openWhatsApp,
		},
		{
			id: "order",
			icon: Package,
			title: "Order Support",
			subtitle: "Questions about your order?",
			onClick: openWhatsApp,
		},
	];

	return (
		<div
			ref={containerRef}
			className="
				fixed
				bottom-5
				right-5
				z-[100]
				sm:bottom-6
				sm:right-6
			"
		>
			{/* =========================================================
			    SUPPORT PANEL
			========================================================= */}

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{
							opacity: 0,
							y: 15,
							scale: 0.95,
						}}
						animate={{
							opacity: 1,
							y: 0,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							y: 15,
							scale: 0.95,
						}}
						transition={{
							duration: 0.2,
							ease: "easeOut",
						}}
						className="
							absolute
							bottom-[70px]
							right-0
							w-[calc(100vw-40px)]
							max-w-[340px]
							overflow-hidden
							rounded-2xl
							border
							border-[#2E2E2E]/10
							bg-[#FBF9F7]
							shadow-2xl
							sm:bottom-[76px]
						"
					>
						{/* =================================================
						    HEADER
						================================================= */}

						<div
							className="
								bg-[#85161B]
								px-5
								py-4
								text-white
							"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-base font-semibold">Need some help? 👋</p>

									<p className="mt-1 text-xs text-white/75">
										We're here to help you.
									</p>
								</div>

								<div
									className="
										flex
										h-9
										w-9
										items-center
										justify-center
										rounded-full
										bg-white/10
									"
								>
									<MessageCircle size={19} strokeWidth={1.8} />
								</div>
							</div>
						</div>

						{/* =================================================
						    OPTIONS
						================================================= */}

						<div className="p-2">
							{supportOptions.map((item) => {
								const Icon = item.icon;

								return (
									<button
										key={item.id}
										type="button"
										onClick={item.onClick}
										className="
											group
											flex
											w-full
											items-center
											gap-3
											rounded-xl
											p-3
											text-left
											transition-colors
											duration-200
											hover:bg-[#F7D6BF]/30
										"
									>
										<div
											className="
												flex
												h-10
												w-10
												shrink-0
												items-center
												justify-center
												rounded-full
												bg-[#F7D6BF]/50
												text-[#85161B]
											"
										>
											<Icon size={18} strokeWidth={1.8} />
										</div>

										<div className="min-w-0 flex-1">
											<p
												className="
													text-sm
													font-semibold
													text-[#2E2E2E]
												"
											>
												{item.title}
											</p>

											<p
												className="
													mt-0.5
													text-[11px]
													text-[#2E2E2E]/50
												"
											>
												{item.subtitle}
											</p>
										</div>

										<ChevronRight
											size={16}
											className="
												text-[#2E2E2E]/30
												transition-transform
												duration-200
												group-hover:translate-x-0.5
												group-hover:text-[#85161B]
											"
										/>
									</button>
								);
							})}
						</div>

						{/* =================================================
						    FOOTER
						================================================= */}

						<div
							className="
								border-t
								border-[#2E2E2E]/10
								px-4
								py-3
								text-center
							"
						>
							<p className="text-[10px] text-[#2E2E2E]/40">
								Usually replies within a few minutes
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* =========================================================
			    TOOLTIP
			========================================================= */}

			<AnimatePresence>
				{!open && (
					<motion.div
						initial={{
							opacity: 0,
							x: 8,
						}}
						animate={{
							opacity: 1,
							x: 0,
						}}
						exit={{
							opacity: 0,
							x: 8,
						}}
						transition={{
							delay: 1,
							duration: 0.25,
						}}
						className="
							pointer-events-none
							absolute
							bottom-2
							right-[64px]
							whitespace-nowrap
							rounded-lg
							bg-[#2E2E2E]
							px-3
							py-2
							text-xs
							font-medium
							text-white
							shadow-lg
							sm:right-[70px]
						"
					>
						Need help? 👋
					</motion.div>
				)}
			</AnimatePresence>

			{/* =========================================================
			    FLOATING BUTTON
			========================================================= */}

			<motion.button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-label={open ? "Close support menu" : "Open support menu"}
				aria-expanded={open}
				whileHover={{
					scale: 1.05,
				}}
				whileTap={{
					scale: 0.94,
				}}
				className="
					relative
					flex
					h-14
					w-14
					items-center
					justify-center
					rounded-full
					bg-[#85161B]
					text-white
					shadow-xl
					shadow-[#85161B]/25
					transition-colors
					duration-200
					hover:bg-[#701218]
					sm:h-16
					sm:w-16
				"
			>
				{/* Notification dot */}

				{!open && (
					<span
						className="
							absolute
							right-0
							top-0
							h-3
							w-3
							rounded-full
							border-2
							border-[#FBF9F7]
							bg-[#25D366]
						"
					/>
				)}

				<AnimatePresence mode="wait" initial={false}>
					{open ? (
						<motion.div
							key="close"
							initial={{
								rotate: -45,
								opacity: 0,
							}}
							animate={{
								rotate: 0,
								opacity: 1,
							}}
							exit={{
								rotate: 45,
								opacity: 0,
							}}
						>
							<X size={24} strokeWidth={2} />
						</motion.div>
					) : (
						<motion.div
							key="chat"
							initial={{
								scale: 0.8,
								opacity: 0,
							}}
							animate={{
								scale: 1,
								opacity: 1,
							}}
							exit={{
								scale: 0.8,
								opacity: 0,
							}}
						>
							<MessageCircle size={25} strokeWidth={1.8} />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>
		</div>
	);
}
