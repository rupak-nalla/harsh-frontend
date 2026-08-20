"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

interface PrintingService {
	id: string;
	title: string;
	price: number;
	image: string;
	slug?: string;
}

/*
 * ============================================================
 * MOCK DATA
 *
 * Temporary data for development.
 *
 * Once the backend API is ready, remove/comment this data
 * and uncomment the API fetching code below.
 * ============================================================
 */

const MOCK_SERVICES: PrintingService[] = [
	{
		id: "s-1",
		title: "Poster & Banner Printing",
		price: 50,
		image: "/images/poster-and-banner-printing.jpg",
		slug: "poster-banner-printing",
	},
	{
		id: "s-2",
		title: "Sticker Printing",
		price: 200,
		image: "/images/stickers.jpg",
		slug: "sticker-printing",
	},
	{
		id: "s-3",
		title: "Business Cards",
		price: 499,
		image: "/images/business-card.jpg",
		slug: "business-cards",
	},
	{
		id: "s-4",
		title: "PVC Cards",
		price: 299,
		image: "/images/pvc-cards.jpg",
		slug: "pvc-cards",
	},
	{
		id: "s-5",
		title: "ID Cards",
		price: 149,
		image: "/images/id-card.jpg",
		slug: "id-cards",
	},
];

/*
 * ============================================================
 * BACKEND API
 * ============================================================
 *
 * Expected backend response:
 *
 * GET /api/services
 *
 * Example:
 * {
 *   "services": [
 *     {
 *       "id": "1",
 *       "title": "Poster & Banner Printing",
 *       "price": 50,
 *       "image": "/images/poster.jpg",
 *       "slug": "poster-banner-printing"
 *     }
 *   ]
 * }
 *
 * Uncomment the fetch logic in the component when the backend
 * endpoint is available.
 * ============================================================
 */

export default function PrintingServices() {
	const [services, setServices] = useState<PrintingService[]>(MOCK_SERVICES);

	/*
	 * Loading state for when backend data is enabled.
	 */
	const [isLoading, setIsLoading] = useState(false);

	/*
	 * Error state for API failures.
	 */
	const [error, setError] = useState("");

	/*
	 * ============================================================
	 * BACKEND FETCH
	 * ============================================================
	 *
	 * Uncomment this useEffect when your backend API is ready.
	 *
	 * IMPORTANT:
	 * - Change "/api/services" if your actual API endpoint differs.
	 * - The frontend expects the response to contain:
	 *
	 *     { services: PrintingService[] }
	 *
	 * ============================================================
	 */

	/*
	useEffect(() => {
		const fetchServices = async () => {
			try {
				setIsLoading(true);
				setError("");

				const response = await fetch("/api/services", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch printing services.");
				}

				const data = await response.json();

				setServices(data.services ?? []);
			} catch (err) {
				console.error("Failed to fetch printing services:", err);

				setError(
					"Unable to load printing services. Please try again later.",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchServices();
	}, []);
	*/

	/*
	 * ============================================================
	 * LOADING STATE
	 * ============================================================
	 *
	 * This will be useful once backend fetching is enabled.
	 */

	if (isLoading) {
		return (
			<section className="my-3 py-12 sm:py-14 lg:py-16">
				<div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
					<div className="flex min-h-[250px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-[#85161B]/20 border-t-[#85161B]" />
					</div>
				</div>
			</section>
		);
	}

	/*
	 * ============================================================
	 * ERROR STATE
	 * ============================================================
	 */

	if (error) {
		return (
			<section className="my-3 py-12 sm:py-14 lg:py-16">
				<div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
					<div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="my-3 py-12 sm:py-14 lg:py-16">
			<div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
				{/* =====================================================
				    HEADER
				===================================================== */}

				<div className="mb-8 flex items-end justify-between">
					<div>
						<div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]/70">
							What we offer
						</div>

						<h2 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Printing Services
						</h2>

						<p className="mt-2 max-w-lg text-sm text-[#2E2E2E]/60 sm:text-base">
							Professional printing solutions made to bring your ideas to life.
						</p>
					</div>

					{/* Desktop View All */}

					<Link
						href="/services"
						className="
							hidden
							items-center
							gap-1
							text-sm
							font-semibold
							text-[#85161B]
							transition-all
							hover:gap-2
							sm:flex
						"
					>
						View all services
						<ArrowUpRight size={17} />
					</Link>
				</div>

				{/* =====================================================
				    SERVICES
				===================================================== */}

				{services.length === 0 ? (
					<div className="rounded-2xl border border-[#E8DED7] bg-[#F8F5F2] px-6 py-10 text-center">
						<p className="text-sm text-[#2E2E2E]/60">
							No printing services are currently available.
						</p>
					</div>
				) : (
					<div
						className="
							flex
							gap-5
							overflow-x-auto
							pb-5
							snap-x
							snap-mandatory
							scrollbar-hide

							lg:grid
							lg:grid-cols-5
							lg:gap-5
							lg:overflow-visible
							lg:pb-0
						"
					>
						{services.map((service, index) => (
							<motion.article
								key={service.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{
									once: true,
									amount: 0.2,
								}}
								transition={{
									duration: 0.45,
									delay: index * 0.07,
								}}
								className="group min-w-[280px] snap-start lg:min-w-0"
							>
								{/* =================================================
								    IMAGE
								================================================= */}

								<div
									className="
										relative
										aspect-[4/3]
										overflow-hidden
										rounded-2xl
										bg-[#F2E9E2]
										shadow-sm
									"
								>
									<img
										src={service.image}
										alt={service.title}
										loading="lazy"
										className="
											h-full
											w-full
											object-cover
											transition-transform
											duration-700
											ease-out
											group-hover:scale-110
										"
									/>

									{/* Dark image overlay */}

									<div
										className="
											absolute
											inset-x-0
											bottom-0
											h-24
											bg-gradient-to-t
											from-black/25
											to-transparent
											opacity-0
											transition-opacity
											duration-300
											group-hover:opacity-100
										"
									/>

									{/* Service number */}

									<div
										className="
											absolute
											left-4
											top-4
											flex
											h-9
											min-w-9
											items-center
											justify-center
											rounded-full
											bg-white/90
											px-2
											text-xs
											font-bold
											text-[#85161B]
											shadow-sm
											backdrop-blur-sm
										"
									>
										{String(index + 1).padStart(2, "0")}
									</div>

									{/* Service link */}

									<Link
										href={`/services/${service.slug ?? service.id}`}
										aria-label={`View ${service.title}`}
										className="
											absolute
											bottom-4
											right-4
											flex
											h-11
											w-11
											items-center
											justify-center
											rounded-full
											bg-white
											text-[#85161B]
											shadow-md
											transition-all
											duration-300
											group-hover:rotate-45
											group-hover:bg-[#85161B]
											group-hover:text-white
										"
									>
										<ArrowUpRight size={19} />
									</Link>
								</div>

								{/* =================================================
								    CONTENT
								================================================= */}

								<div className="px-1 pt-4">
									<h3 className="text-base font-semibold leading-snug text-[#2E2E2E] sm:text-lg">
										{service.title}
									</h3>

									<div className="mt-2">
										<span className="text-xs text-[#2E2E2E]/50">
											Starting at
										</span>

										<div className="mt-0.5 text-base font-bold text-[#85161B]">
											₹{service.price.toLocaleString("en-IN")}
										</div>
									</div>
								</div>
							</motion.article>
						))}
					</div>
				)}

				{/* =====================================================
				    MOBILE VIEW ALL
				===================================================== */}

				<Link
					href="/services"
					className="
						mt-6
						flex
						w-full
						items-center
						justify-center
						gap-2
						rounded-xl
						border
						border-[#85161B]/20
						bg-white
						py-3.5
						text-sm
						font-semibold
						text-[#85161B]
						transition-all
						hover:bg-[#85161B]
						hover:text-white
						sm:hidden
					"
				>
					View all services
					<ArrowUpRight size={17} />
				</Link>
			</div>
		</section>
	);
}
