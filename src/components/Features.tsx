"use client";

import React from "react";
import { motion } from "framer-motion";
import {
	Palette,
	Gem,
	BadgeIndianRupee,
	PackageCheck,
	Truck,
	Headset,
} from "lucide-react";

const FEATURES = [
	{
		title: "Custom Designs",
		description: "Personalize your gifts exactly the way you want.",
		icon: Palette,
	},
	{
		title: "Premium Materials",
		description: "Quality materials carefully selected for every product.",
		icon: Gem,
	},
	{
		title: "Affordable Pricing",
		description: "Thoughtful gifts without stretching your budget.",
		icon: BadgeIndianRupee,
	},
	{
		title: "Bulk Orders",
		description: "Special solutions and pricing for larger orders.",
		icon: PackageCheck,
	},
	{
		title: "Fast Delivery",
		description: "Get your personalized products delivered on time.",
		icon: Truck,
	},
	{
		title: "Dedicated Support",
		description: "We're here to help from design to delivery.",
		icon: Headset,
	},
];

export default function Features() {
	return (
		<section className="my-10 bg-[#F8F5F2] py-14 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
				{/* Header */}

				<div className="mb-10 text-center">
					<p
						className="
              mb-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#85161B]/70
            "
					>
						Why Giftify
					</p>

					<h2
						className="
              text-3xl
              font-bold
              tracking-tight
              text-[#2E2E2E]

              sm:text-4xl
            "
					>
						Why Choose Us?
					</h2>

					<p
						className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-[#2E2E2E]/60

              sm:text-base
            "
					>
						Everything you need to turn an ordinary gift into something
						memorable.
					</p>
				</div>

				{/* Features */}

				<div
					className="
            grid
            grid-cols-1
            gap-px
            overflow-hidden
            rounded-2xl
            border
            border-[#E8DED7]
            bg-[#E8DED7]

            sm:grid-cols-2

            lg:grid-cols-3
          "
				>
					{FEATURES.map((feature, index) => {
						const Icon = feature.icon;

						return (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 15 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{
									duration: 0.4,
									delay: index * 0.06,
								}}
								whileHover={{ backgroundColor: "#ffffff" }}
								className="
                  group
                  relative
                  bg-[#F8F5F2]
                  p-6
                  transition-colors
                  duration-300

                  sm:p-7

                  lg:p-8
                "
							>
								<div className="flex items-start gap-4">
									{/* Icon */}

									<div
										className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#F7D6BF]
                      text-[#85161B]
                      transition-all
                      duration-300

                      group-hover:scale-105
                      group-hover:bg-[#85161B]
                      group-hover:text-white
                    "
									>
										<Icon size={22} strokeWidth={1.8} />
									</div>

									{/* Text */}

									<div>
										<h3
											className="
                        text-base
                        font-semibold
                        text-[#2E2E2E]

                        sm:text-lg
                      "
										>
											{feature.title}
										</h3>

										<p
											className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-[#2E2E2E]/55

                        sm:text-sm
                      "
										>
											{feature.description}
										</p>
									</div>
								</div>

								{/* Small decorative number */}

								<span
									className="
                    absolute
                    bottom-3
                    right-4
                    text-[10px]
                    font-semibold
                    text-[#85161B]/15
                  "
								>
									0{index + 1}
								</span>
							</motion.div>
						);
					})}
				</div>

				{/* Bottom trust line */}

				<div className="mt-8 flex items-center justify-center gap-3">
					<div className="h-px w-12 bg-[#DCCBC0]" />

					<span
						className="
              text-xs
              font-medium
              text-[#2E2E2E]/45
            "
					>
						Made with care, delivered with love
					</span>

					<div className="h-px w-12 bg-[#DCCBC0]" />
				</div>
			</div>
		</section>
	);
}
