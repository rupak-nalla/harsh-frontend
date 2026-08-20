"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import {
	FaInstagram,
	FaFacebookF,
	FaYoutube,
	FaWhatsapp,
} from "react-icons/fa";

interface ApiCategory {
	id: number;
	name: string;
	icon_path: string;
}

interface Category {
	id: string;
	name: string;
}

export default function SiteFooter() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoadingCategories, setIsLoadingCategories] = useState(true);

	/* =========================================================
	   FETCH CATEGORIES
	========================================================= */

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoadingCategories(true);

				const response = await fetch("/api/categories", {
					method: "GET",
					cache: "no-store",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch categories");
				}

				const data = await response.json();

				console.log("Footer categories response:", data);

				if (!Array.isArray(data.categories)) {
					throw new Error("Invalid categories response");
				}

				const formattedCategories: Category[] = (
					data.categories as ApiCategory[]
				).map((category) => ({
					id: String(category.id),
					name: category.name,
				}));

				setCategories(formattedCategories);
			} catch (error) {
				console.error("Failed to fetch footer categories:", error);
				setCategories([]);
			} finally {
				setIsLoadingCategories(false);
			}
		};

		fetchCategories();
	}, []);

	return (
		<footer className="mt-20 w-full bg-[#A23939] pt-14 pb-8 text-white">
			<div className="container-max px-4 sm:px-6">
				{/* =====================================================
				    MAIN FOOTER
				===================================================== */}

				<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
					{/* =================================================
					    BRAND
					================================================= */}

					<div>
						<Link href="/" className="text-2xl font-semibold tracking-tight">
							Printing House
						</Link>

						<p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
							Personalized gifts & professional printing for every occasion.
						</p>

						{/* CONTACT */}
						<div className="mt-5 space-y-3 text-sm text-white/80">
							{/* PHONE */}
							<a
								href="tel:+918827882713"
								className="flex items-center gap-2 transition hover:text-white"
							>
								<Phone size={16} />
								<span>+91 88278 82713</span>
							</a>

							{/* WHATSAPP */}
							<a
								href="https://wa.me/918827882713?text=Hi"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 transition hover:text-white"
							>
								<FaWhatsapp size={17} />
								<span>Chat on WhatsApp</span>
							</a>
						</div>
					</div>

					{/* =================================================
					    SHOP
					================================================= */}

					<div>
						<h3 className="mb-4 font-semibold " style={{ color: "white" }}>
							Shop
						</h3>

						<ul className="space-y-2.5 text-sm text-white/80">
							{/* LOADING */}
							{isLoadingCategories && (
								<>
									{Array.from({ length: 5 }).map((_, index) => (
										<li key={index}>
											<div className="h-4 w-24 animate-pulse rounded bg-white/10" />
										</li>
									))}
								</>
							)}

							{/* CATEGORIES */}
							{!isLoadingCategories &&
								categories.map((category) => (
									<li key={category.id}>
										<Link
											href={`/shop?category=${encodeURIComponent(category.id)}`}
											className="transition hover:text-white"
										>
											{category.name}
										</Link>
									</li>
								))}

							{/* VIEW ALL */}
							{!isLoadingCategories && (
								<li>
									<Link
										href="/shop"
										className="inline-block pt-1 font-medium text-white transition hover:underline"
									>
										View All Products →
									</Link>
								</li>
							)}
						</ul>
					</div>

					{/* =================================================
					    PRINTING
					================================================= */}

					{/* <div>
						<h3 className="mb-4 font-semibold" style={{ color: "white" }}>
							Printing
						</h3>

						<ul className="space-y-2.5 text-sm text-white/80">
							<li>
								<Link
									href="/printing/business-cards"
									className="transition hover:text-white"
								>
									Business Cards
								</Link>
							</li>

							<li>
								<Link
									href="/printing/banners"
									className="transition hover:text-white"
								>
									Banners
								</Link>
							</li>

							<li>
								<Link
									href="/printing/stickers"
									className="transition hover:text-white"
								>
									Stickers
								</Link>
							</li>

							<li>
								<Link
									href="/printing/flyers"
									className="transition hover:text-white"
								>
									Flyers
								</Link>
							</li>

							<li>
								<Link
									href="/printing"
									className="inline-block pt-1 font-medium text-white transition hover:underline"
								>
									View All Services →
								</Link>
							</li>
						</ul>
					</div> */}

					{/* =================================================
					    SUPPORT
					================================================= */}

					{/* <div>
						<h3 className="mb-4 font-semibold" style={{ color: "white" }}>
							Support
						</h3>

						<ul className="space-y-2.5 text-sm text-white/80">
							<li>
								<Link href="/contact" className="transition hover:text-white">
									Contact Us
								</Link>
							</li>

							<li>
								<Link href="/faq" className="transition hover:text-white">
									FAQs
								</Link>
							</li>

							<li>
								<Link href="/shipping" className="transition hover:text-white">
									Shipping & Delivery
								</Link>
							</li>

							<li>
								<Link href="/returns" className="transition hover:text-white">
									Returns & Refunds
								</Link>
							</li>

							<li>
								<Link href="/privacy" className="transition hover:text-white">
									Privacy Policy
								</Link>
							</li>

							<li>
								<Link href="/terms" className="transition hover:text-white">
									Terms & Conditions
								</Link>
							</li>
						</ul>
					</div> */}

					{/* =================================================
					    SOCIAL MEDIA
					================================================= */}

					<div>
						<h3 className="mb-4 font-semibold" style={{ color: "white" }}>
							Follow Us
						</h3>

						<p className="max-w-xs text-sm leading-6 text-white/75">
							Stay connected with Printing House for new products, offers and
							updates.
						</p>

						{/* SOCIAL ICONS */}

						<div className="mt-5 flex gap-3">
							{/* INSTAGRAM */}
							<a
								href="https://www.instagram.com/printinghouseujjain/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Instagram"
								className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
							>
								<FaInstagram size={18} />
							</a>

							{/* FACEBOOK */}
							<a
								href="https://www.facebook.com/61586784283566/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Facebook"
								className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
							>
								<FaFacebookF size={17} />
							</a>

							{/* YOUTUBE */}
							<a
								href="https://www.youtube.com/@Printinghouseujjain/"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="YouTube"
								className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
							>
								<FaYoutube size={19} />
							</a>

							{/* WHATSAPP */}
							<a
								href="https://wa.me/918827882713?text=Hi"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="WhatsApp"
								className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
							>
								<FaWhatsapp size={19} />
							</a>
						</div>

						{/* PHONE */}

						<a
							href="tel:+918827882713"
							className="mt-4 flex items-center gap-2 text-sm text-white/80 transition hover:text-white"
						>
							<Phone size={16} />
							<span>+91 88278 82713</span>
						</a>
					</div>
				</div>

				{/* =====================================================
				    BOTTOM FOOTER
				===================================================== */}

				<div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/70 sm:text-sm">
					© 2026 PrintingHouseUjjain — All rights reserved.
				</div>
			</div>
		</footer>
	);
}
