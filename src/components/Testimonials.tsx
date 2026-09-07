"use client";

import {
	useEffect,
	useMemo,
	useState,
} from "react";

import Image from "next/image";

import { motion } from "framer-motion";

import {
	Quote,
	BadgeCheck,
} from "lucide-react";

import {
	assetUrl,
	fetchSiteConfig,
	type SiteReview,
} from "./siteConfig";

const FALLBACK_TESTIMONIALS: SiteReview[] = [];

function TestimonialCard({
	testimonial,
}: {
	testimonial: SiteReview;
}) {
	const [photoIndex, setPhotoIndex] =
		useState(0);

	const photos =
		testimonial.photos ?? [];

	useEffect(() => {
		setPhotoIndex(0);
	}, [
		testimonial.name,
		photos.length,
	]);

	const initials = testimonial.name
		.split(" ")
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const starCount = Math.max(
		0,
		Math.min(
			5,
			Number(testimonial.star_count) || 0,
		),
	);

	return (
		<article
			className="
				group
				relative
				flex
				h-[310px]
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
				sm:h-[330px]
				sm:w-[340px]
				sm:p-7
				lg:h-[340px]
				lg:w-[360px]
			"
		>
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
				<Quote
					size={54}
					strokeWidth={1.5}
					fill="currentColor"
				/>
			</div>

			<div className="relative z-10 min-h-0">
				<div className="mb-3 flex items-center gap-1">
					{Array.from({
						length: starCount,
					}).map(
						(_, starIndex) => (
							<span
								key={
									starIndex
								}
								className="
									text-sm
									text-[#D89A3D]
								"
							>
								★
							</span>
						),
					)}
				</div>

				<p
					className="
						line-clamp-4
						whitespace-pre-line
						text-[15px]
						leading-7
						text-[#2E2E2E]/75
						sm:text-base
					"
				>
					“{testimonial.description}”
				</p>

				{photos.length > 0 && (
					<div className="mt-4 flex items-center gap-2">
						<div
							className="
								relative
								h-16
								w-16
								overflow-hidden
								rounded-xl
								bg-[#F7D6BF]/30
							"
						>
							<Image
								src={assetUrl(
									photos[
										photoIndex
									],
								)}
								alt={`${testimonial.name} review photo ${
									photoIndex + 1
								}`}
								fill
								sizes="64px"
								className="object-cover"
							/>
						</div>

						{photos.length > 1 && (
							<div className="flex gap-1.5">
								{photos.map(
									(
										photo,
										index,
									) => (
										<button
											key={`${photo}-${index}`}
											type="button"
											onClick={() =>
												setPhotoIndex(
													index,
												)
											}
											aria-label={`Show review photo ${
												index +
												1
											}`}
											className={`
												relative
												h-10
												w-10
												overflow-hidden
												rounded-lg
												border-2
												${
													index ===
													photoIndex
														? "border-[#85161B]"
														: "border-transparent"
												}
											`}
										>
											<Image
												src={assetUrl(
													photo,
												)}
												alt=""
												fill
												sizes="40px"
												className="object-cover"
											/>
										</button>
									),
								)}
							</div>
						)}
					</div>
				)}
			</div>

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
					{initials}
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
						<span className="truncate">
							{
								testimonial.name
							}
						</span>

						<BadgeCheck
							size={15}
							className="
								shrink-0
								text-[#85161B]
							"
							fill="#F7D6BF"
						/>
					</div>

					<div
						className="
							mt-0.5
							text-xs
							text-[#2E2E2E]/50
						"
					>
						Verified customer
					</div>
				</div>
			</div>
		</article>
	);
}

export default function Testimonials() {
	const [testimonials, setTestimonials] =
		useState<SiteReview[]>(
			FALLBACK_TESTIMONIALS,
		);

	useEffect(() => {
		let mounted = true;

		fetchSiteConfig()
			.then((config) => {
				if (
					mounted &&
					Array.isArray(
						config.reviews,
					)
				) {
					setTestimonials(
						config.reviews,
					);
				}
			})
			.catch((error) => {
				console.error(
					"Failed to load review config:",
					error,
				);
			});

		return () => {
			mounted = false;
		};
	}, []);

	const marqueeTestimonials =
		useMemo(
			() => [
				...testimonials,
				...testimonials,
			],
			[testimonials],
		);

	return (
		<section
			className="
				my-10
				overflow-hidden
				rounded-3xl
				bg-[#F7D6BF]/25
				py-12
				sm:py-14
				lg:py-16
			"
		>
			<div className="mx-auto w-full">
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
						Real experiences from people
						who made their moments a
						little more special with us.
					</p>
				</div>

				{testimonials.length > 0 ? (
					<div className="relative w-full overflow-hidden">
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
								x: [
									"0%",
									"-50%",
								],
							}}
							transition={{
								x: {
									duration: 60,
									ease: "linear",
									repeat: Infinity,
									repeatType:
										"loop",
								},
							}}
						>
							{marqueeTestimonials.map(
								(
									testimonial,
									index,
								) => (
									<TestimonialCard
										key={`${testimonial.name}-${testimonial.timestamp}-${index}`}
										testimonial={
											testimonial
										}
									/>
								),
							)}
						</motion.div>
					</div>
				) : (
					<div
						className="
							px-5
							text-center
							text-sm
							text-[#2E2E2E]/50
						"
					>
						Loading customer
						reviews…
					</div>
				)}

				<div className="mt-8 px-5 text-center">
					<p
						className="
							text-sm
							text-[#2E2E2E]/55
						"
					>
						Loved by customers across India
					</p>
				</div>
			</div>
		</section>
	);
}