"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, BadgeCheck } from "lucide-react";

const TESTIMONIALS = [
	{
		id: 1,
		name: "Anaya Sharma",
		text: "The customized rakhi and gift bundle was beyond beautiful. Fast delivery and lovely packaging!",
		rating: 5,
	},
	{
		id: 2,
		name: "Rohan Mehta",
		text: "Excellent print quality on our corporate flyers. Highly recommend for bulk orders.",
		rating: 5,
	},
	{
		id: 3,
		name: "Priya Kapoor",
		text: "Customer support helped fine-tune our designs. The final products looked premium.",
		rating: 5,
	},
];

export default function Testimonials() {
	return (
		<section className="my-10 bg-[#F7D6BF]/25 py-12 sm:py-14 lg:py-16">
			<div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
				{/* ─────────────────────────────
            HEADER
        ───────────────────────────── */}

				<div className="mb-9 text-center">
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
						Customer love
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
						What our customers say
					</h2>

					<p
						className="
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-relaxed
              text-[#2E2E2E]/60

              sm:text-base
            "
					>
						Real experiences from people who made their moments a little more
						special with us.
					</p>
				</div>

				{/* ─────────────────────────────
            TESTIMONIALS
        ───────────────────────────── */}

				<div
					className="
            grid
            grid-cols-1
            gap-5

            md:grid-cols-2

            xl:grid-cols-3
          "
				>
					{TESTIMONIALS.map((testimonial, index) => (
						<motion.article
							key={testimonial.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{
								duration: 0.45,
								delay: index * 0.1,
							}}
							whileHover={{ y: -5 }}
							className="
                group
                relative
                flex
                min-h-[260px]
                flex-col
                justify-between
                overflow-hidden
                rounded-2xl
                bg-white
                p-6
                shadow-sm
                transition-shadow
                duration-300
                hover:shadow-lg

                sm:p-7
              "
						>
							{/* Decorative quote */}

							<div
								className="
                  absolute
                  right-5
                  top-3
                  text-[#F7D6BF]
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
							>
								<Quote size={54} strokeWidth={1.5} fill="currentColor" />
							</div>

							{/* Rating */}

							<div className="relative z-10">
								<div className="mb-5 flex items-center gap-1">
									{Array.from({ length: testimonial.rating }).map(
										(_, starIndex) => (
											<span key={starIndex} className="text-sm text-[#D89A3D]">
												★
											</span>
										),
									)}
								</div>

								{/* Review */}

								<p
									className="
                    max-w-[90%]
                    text-[15px]
                    leading-7
                    text-[#2E2E2E]/75

                    sm:text-base
                  "
								>
									“{testimonial.text}”
								</p>
							</div>

							{/* Customer */}

							<div
								className="
                  mt-7
                  flex
                  items-center
                  gap-3
                  border-t
                  border-[#2E2E2E]/10
                  pt-5
                "
							>
								{/* Avatar */}

								<div
									className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F7D6BF]
                    text-sm
                    font-bold
                    text-[#85161B]
                  "
								>
									{testimonial.name
										.split(" ")
										.map((name) => name[0])
										.join("")}
								</div>

								<div>
									<div
										className="
                      flex
                      items-center
                      gap-1.5
                      text-sm
                      font-semibold
                      text-[#2E2E2E]
                    "
									>
										{testimonial.name}

										<BadgeCheck
											size={15}
											className="text-[#85161B]"
											fill="#F7D6BF"
										/>
									</div>

									<div className="mt-0.5 text-xs text-[#2E2E2E]/50">
										Verified customer
									</div>
								</div>
							</div>
						</motion.article>
					))}
				</div>

				{/* ─────────────────────────────
            BOTTOM TRUST MESSAGE
        ───────────────────────────── */}

				<div className="mt-8 text-center">
					<p className="text-sm text-[#2E2E2E]/55">
						Loved by customers across India
					</p>
				</div>
			</div>
		</section>
	);
}
