"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Gift,
	Pencil,
	Eye,
	ShoppingBag,
	ArrowRight,
	Sparkles,
} from "lucide-react";

/*
 * ============================================================
 * HOW IT WORKS STEPS
 * ============================================================
 *
 * These are static UI steps, so they do not need to come
 * from the backend.
 *
 * If these steps become configurable from the admin/backend
 * in the future, this array can be replaced with API data.
 */

const STEPS = [
	{
		id: "choose-product",
		title: "Choose Product",
		description: "Pick a gift that fits the occasion.",
		icon: Gift,
	},
	{
		id: "personalize",
		title: "Personalize",
		description: "Add names, photos or your message.",
		icon: Pencil,
	},
	{
		id: "preview",
		title: "Preview",
		description: "See exactly how your gift will look.",
		icon: Eye,
	},
	{
		id: "order",
		title: "Order",
		description: "Place your order and leave the rest to us.",
		icon: ShoppingBag,
	},
];

export default function HowItWorks() {
	return (
		<section className="my-10 py-14 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

				{/* =====================================================
				    HEADER
				===================================================== */}

				<div className="mx-auto mb-12 max-w-2xl text-center">

					{/* Eyebrow */}

					<div className="mb-3 flex items-center justify-center gap-2">
						<Sparkles
							size={16}
							className="text-[#85161B]"
							aria-hidden="true"
						/>

						<span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]/70">
							Simple & Personal
						</span>

						<Sparkles
							size={16}
							className="text-[#85161B]"
							aria-hidden="true"
						/>
					</div>

					{/* Heading */}

					<h2 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl lg:text-[42px]">
						Make It Yours
					</h2>

					{/* Description */}

					<p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#2E2E2E]/60 sm:text-base">
						Add names, photos, quotes, or your own designs and create
						something truly special.
					</p>

					{/* CTA */}

					<Link
						href="/shop"
						className="
							mt-6
							inline-flex
							items-center
							gap-2
							rounded-xl
							bg-[#85161B]
							px-6
							py-3
							text-sm
							font-semibold
							text-white
							shadow-sm
							transition-all
							duration-200
							hover:-translate-y-0.5
							hover:bg-[#721318]
							hover:shadow-md
							active:translate-y-0
						"
					>
						Start Shopping

						<ArrowRight
							size={16}
							aria-hidden="true"
							className="transition-transform duration-200 group-hover:translate-x-1"
						/>
					</Link>
				</div>

				{/* =====================================================
				    STEPS
				===================================================== */}

				<div
					className="
						relative
						grid
						grid-cols-1
						gap-4

						sm:grid-cols-2
						sm:gap-5

						lg:grid-cols-4
						lg:gap-0
					"
				>

					{/* Desktop connector line */}

					<div
						aria-hidden="true"
						className="
							absolute
							left-[12.5%]
							right-[12.5%]
							top-[46px]
							hidden
							h-px
							bg-[#E7D5C8]
							lg:block
						"
					/>

					{STEPS.map((step, index) => {
						const Icon = step.icon;
						const isLastStep = index === STEPS.length - 1;

						return (
							<motion.div
								key={step.id}
								initial={{
									opacity: 0,
									y: 20,
								}}
								whileInView={{
									opacity: 1,
									y: 0,
								}}
								viewport={{
									once: true,
									amount: 0.2,
								}}
								transition={{
									duration: 0.4,
									delay: index * 0.1,
								}}
								className="
									group
									relative
									z-10
									flex
									flex-col
									items-center
									text-center
								"
							>

								{/* =================================================
								    ICON
								================================================= */}

								<div className="relative">

									<motion.div
										whileHover={{
											scale: 1.08,
										}}
										transition={{
											duration: 0.2,
										}}
										className="
											flex
											h-[76px]
											w-[76px]
											items-center
											justify-center
											rounded-full
											border
											border-[#E7D5C8]
											bg-white
											text-[#85161B]
											shadow-sm
											transition-all
											duration-300
											group-hover:border-[#85161B]/30
											group-hover:shadow-md
										"
									>
										<Icon
											size={27}
											strokeWidth={1.7}
											aria-hidden="true"
										/>
									</motion.div>

									{/* Step number */}

									<div
										className="
											absolute
											-right-1
											-top-1
											flex
											h-6
											w-6
											items-center
											justify-center
											rounded-full
											bg-[#85161B]
											text-[10px]
											font-bold
											text-white
											ring-4
											ring-white
										"
									>
										{index + 1}
									</div>
								</div>

								{/* =================================================
								    STEP CONTENT
								================================================= */}

								<div className="mt-5 max-w-[190px]">
									<h3 className="text-base font-semibold text-[#2E2E2E] sm:text-lg">
										{step.title}
									</h3>

									<p className="mt-1.5 text-xs leading-5 text-[#2E2E2E]/55 sm:text-sm">
										{step.description}
									</p>
								</div>

								{/* =================================================
								    MOBILE CONNECTOR
								================================================= */}

								{!isLastStep && (
									<div
										aria-hidden="true"
										className="
											absolute
											-bottom-5
											left-1/2
											-translate-x-1/2
											text-[#CFAE9A]
											sm:hidden
										"
									>
										<ArrowRight
											size={18}
											className="rotate-90"
										/>
									</div>
								)}
							</motion.div>
						);
					})}
				</div>

				{/* =====================================================
				    BOTTOM MESSAGE
				===================================================== */}

				<div
					className="
						mx-auto
						mt-12
						flex
						max-w-xl
						items-center
						justify-center
						gap-2
						text-center
					"
				>
					<div
						aria-hidden="true"
						className="h-px flex-1 bg-[#E7D5C8]"
					/>

					<span className="px-3 text-xs font-medium text-[#2E2E2E]/45">
						From idea to doorstep
					</span>

					<div
						aria-hidden="true"
						className="h-px flex-1 bg-[#E7D5C8]"
					/>
				</div>
			</div>
		</section>
	);
}