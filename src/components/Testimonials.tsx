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
	{
		id: 4,
		name: "Arjun Verma",
		text: "The photo frame looked even better than I expected. The print quality and finishing were excellent.",
		rating: 5,
	},
	{
		id: 5,
		name: "Sneha Reddy",
		text: "Loved the personalized gifts. Everything was packed beautifully and delivered on time.",
		rating: 5,
	},
	{
		id: 6,
		name: "Karan Malhotra",
		text: "We ordered customized merchandise for our team and the quality was fantastic. Great experience overall.",
		rating: 5,
	},
	{
		id: 7,
		name: "Meera Iyer",
		text: "The customization process was simple and the final product was beautiful. Definitely ordering again!",
		rating: 5,
	},
	{
		id: 8,
		name: "Aditya Nair",
		text: "Very impressed with the printing quality. Colors were accurate and the delivery was quick.",
		rating: 5,
	},
];

/*
|--------------------------------------------------------------------------
| TESTIMONIAL CARD
|--------------------------------------------------------------------------
*/

function TestimonialCard({
	testimonial,
}: {
	testimonial: (typeof TESTIMONIALS)[number];
}) {
	return (
		<article
			className="
				group
				relative
				flex
				h-[280px]
				w-[300px]
				shrink-0
				flex-col
				justify-between
				overflow-hidden
				rounded-2xl
				bg-white
				p-6
				shadow-sm
				transition-all
				duration-300
				hover:-translate-y-1
				hover:shadow-lg

				sm:h-[290px]
				sm:w-[340px]
				sm:p-7

				lg:h-[300px]
				lg:w-[360px]
			"
		>
			{/* Decorative quote */}

			<div
				className="
					pointer-events-none
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

			{/* Content */}

			<div className="relative z-10">
				{/* Rating */}

				<div className="mb-5 flex items-center gap-1">
					{Array.from({
						length: testimonial.rating,
					}).map((_, starIndex) => (
						<span key={starIndex} className="text-sm text-[#D89A3D]">
							★
						</span>
					))}
				</div>

				{/* Review */}

				<p
					className="
						line-clamp-4
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

				<div className="min-w-0">
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
						<span className="truncate">{testimonial.name}</span>

						<BadgeCheck
							size={15}
							className="shrink-0 text-[#85161B]"
							fill="#F7D6BF"
						/>
					</div>

					<div className="mt-0.5 text-xs text-[#2E2E2E]/50">
						Verified customer
					</div>
				</div>
			</div>
		</article>
	);
}

/*
|--------------------------------------------------------------------------
| TESTIMONIALS
|--------------------------------------------------------------------------
*/

export default function Testimonials() {
	/*
	 * Duplicate the array so the second set follows the first
	 * seamlessly when the animation loops.
	 */
	const marqueeTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

	return (
		<section
			className="
				my-10
				overflow-hidden
				bg-[#F7D6BF]/25
				py-12

				sm:py-14

				lg:py-16
			"
		>
			<div className="mx-auto w-full">
				{/* =====================================================
				    HEADER
				===================================================== */}

				<div
					className="
						mb-9
						px-5
						text-center

						sm:px-6

						lg:px-8
					"
				>
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

				{/* =====================================================
				    AUTO SCROLL
				===================================================== */}

				<div className="relative w-full overflow-hidden">
					{/* Left fade */}

					<div
						className="
							pointer-events-none
							absolute
							left-0
							top-0
							z-10
							h-full
							w-10
							bg-gradient-to-r
							from-[#F9E9E0]/90
							to-transparent

							sm:w-20
						"
					/>

					{/* Right fade */}

					<div
						className="
							pointer-events-none
							absolute
							right-0
							top-0
							z-10
							h-full
							w-10
							bg-gradient-to-l
							from-[#F9E9E0]/90
							to-transparent

							sm:w-20
						"
					/>

					<motion.div
						className="
							flex
							w-max
							gap-5
							px-5

							sm:gap-6
							sm:px-6
						"
						animate={{
							x: ["0%", "-50%"],
						}}
						transition={{
							x: {
								duration: 28,
								ease: "linear",
								repeat: Infinity,
								repeatType: "loop",
							},
						}}
					>
						{marqueeTestimonials.map((testimonial, index) => (
							<TestimonialCard
								key={`${testimonial.id}-${index}`}
								testimonial={testimonial}
							/>
						))}
					</motion.div>
				</div>

				{/* =====================================================
				    BOTTOM TRUST MESSAGE
				===================================================== */}

				<div className="mt-8 px-5 text-center">
					<p className="text-sm text-[#2E2E2E]/55">
						Loved by customers across India
					</p>
				</div>
			</div>
		</section>
	);
}
