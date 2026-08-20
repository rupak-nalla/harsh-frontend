"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
	Heart,
	ShoppingBag,
	Trash2,
	ArrowRight,
	HeartOff,
	ShoppingCart,
	AlertCircle,
} from "lucide-react";

/* ============================================================================
   CONSTANTS
============================================================================ */

const PRODUCT_IMAGE_BASE_URL =
	"https://printinghouseujjain.in/assets/products/";

/* ============================================================================
   TYPES
============================================================================ */

interface WishlistProduct {
	id: string;
	name: string;
	price: number;
	originalPrice?: number;
	image?: string;
	badge?: string;
	category?: string;
}

/*
 * This represents what we expect from /api/wishlist.
 *
 * The wishlist API may only return product IDs.
 */
interface RawWishlistItem {
	id?: string | number;
	product_id?: string | number;
	productId?: string | number;
}

/*
 * Product returned by:
 *
 * /api/products?product_id=<id>
 */
interface Product {
	id?: string | number;
	name?: string;
	description?: string;

	primary_photo_path?: string;
	other_photos_paths?: string;

	market_price?: string | number;
	selling_price?: string | number;
	reseller_price?: string | number;

	category_ids?: string;
	occasion_ids?: string;
	in_stock?: string;
	sold?: string | number;

	customize_reqs?: string;
	keywords?: string;
	created_at?: string;
}

/*
 * Wishlist API response
 */
interface WishlistResponse {
	data?: RawWishlistItem[];
	items?: RawWishlistItem[];
	wishlist?: RawWishlistItem[];
	message?: string;
	status?: number;
}

/*
 * Product API response
 */
interface ProductResponse {
	status?: number;
	message?: string;
	product?: Product;
	data?: Product | Product[];
	products?: Product[];
}

/* ============================================================================
   NORMALIZE WISHLIST ITEM
============================================================================ */

function normalizeWishlistItem(raw: RawWishlistItem): WishlistProduct {
	const id = String(raw.product_id ?? raw.productId ?? raw.id ?? "");

	return {
		id,
		name: "Untitled product",
		price: 0,
		image: undefined,
	};
}

/* ============================================================================
   EXTRACT PRODUCT
============================================================================ */

function extractProduct(data: ProductResponse): Product | null {
	/*
	 * Normal response:
	 *
	 * {
	 *   status: 200,
	 *   message: "Success.",
	 *   product: {...}
	 * }
	 */

	if (data.product && typeof data.product === "object") {
		return data.product;
	}

	/*
	 * Fallback:
	 *
	 * {
	 *   data: {...}
	 * }
	 */

	if (data.data && !Array.isArray(data.data) && typeof data.data === "object") {
		return data.data;
	}

	/*
	 * Fallback:
	 *
	 * {
	 *   products: [...]
	 * }
	 */

	if (Array.isArray(data.products) && data.products.length > 0) {
		return data.products[0];
	}

	/*
	 * Fallback:
	 *
	 * {
	 *   data: [...]
	 * }
	 */

	if (Array.isArray(data.data) && data.data.length > 0) {
		return data.data[0];
	}

	return null;
}

/* ============================================================================
   PRODUCT IMAGE URL
============================================================================ */

function getProductImage(photoPath?: string): string | undefined {
	if (!photoPath) {
		return undefined;
	}

	/*
	 * If the API already returns a complete URL,
	 * use it directly.
	 */

	if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
		return photoPath;
	}

	/*
	 * Remove leading slashes.
	 */

	const cleanPath = photoPath.replace(/^\/+/, "");

	return `${PRODUCT_IMAGE_BASE_URL}${cleanPath}`;
}

/* ============================================================================
   WISHLIST PAGE
============================================================================ */

export default function WishlistPage() {
	const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	/* ==========================================================================
	   ERROR HELPER
	========================================================================== */

	const showError = (message: string) => {
		setError(message);

		setTimeout(() => {
			setError("");
		}, 2500);
	};

	/* ==========================================================================
	   FETCH PRODUCT DETAILS
	========================================================================== */

	const fetchProductDetails = async (
		productId: string,
	): Promise<Product | null> => {
		try {
			const response = await fetch(
				`/api/products?product_id=${encodeURIComponent(productId)}`,
				{
					method: "GET",
					cache: "no-store",
				},
			);

			const data: ProductResponse = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message ?? `Unable to fetch product ${productId}.`,
				);
			}

			return extractProduct(data);
		} catch (err) {
			console.error(`Fetch product ${productId} failed:`, err);

			return null;
		}
	};

	/* ==========================================================================
	   FETCH WISHLIST
	========================================================================== */

	const fetchWishlist = async () => {
		setLoading(true);
		setError("");

		try {
			/*
			 * ---------------------------------------------------------------
			 * STEP 1
			 * Get wishlist items.
			 * ---------------------------------------------------------------
			 */

			const response = await fetch("/api/wishlist", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: WishlistResponse = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message ?? "Unable to load your wishlist. Please try again.",
				);
			}

			/*
			 * Support:
			 *
			 * data
			 * items
			 * wishlist
			 */

			const rawItems = data.data ?? data.items ?? data.wishlist ?? [];

			/*
			 * ---------------------------------------------------------------
			 * STEP 2
			 * Normalize wishlist items.
			 * ---------------------------------------------------------------
			 */

			const wishlistItems = rawItems
				.map(normalizeWishlistItem)
				.filter((item) => item.id);

			/*
			 * ---------------------------------------------------------------
			 * STEP 3
			 * Fetch actual product information.
			 *
			 * This is the important part.
			 * ---------------------------------------------------------------
			 */

			const itemsWithDetails = await Promise.all(
				wishlistItems.map(async (wishlistItem) => {
					const product = await fetchProductDetails(wishlistItem.id);

					/*
					 * If product API fails,
					 * keep the wishlist item.
					 */

					if (!product) {
						return wishlistItem;
					}

					/*
					 * -------------------------------------------------------
					 * PRODUCT NAME
					 * -------------------------------------------------------
					 */

					const name = product.name ?? wishlistItem.name ?? "Untitled product";

					/*
					 * -------------------------------------------------------
					 * SELLING PRICE
					 * -------------------------------------------------------
					 */

					const price = Number(
						product.selling_price ?? wishlistItem.price ?? 0,
					);

					/*
					 * -------------------------------------------------------
					 * MARKET / ORIGINAL PRICE
					 * -------------------------------------------------------
					 */

					const originalPrice = Number(
						product.market_price ?? wishlistItem.originalPrice ?? 0,
					);

					/*
					 * -------------------------------------------------------
					 * PRODUCT IMAGE
					 * -------------------------------------------------------
					 */

					const image =
						getProductImage(product.primary_photo_path) ?? wishlistItem.image;

					return {
						...wishlistItem,

						name,

						price: Number.isFinite(price) ? price : 0,

						originalPrice:
							Number.isFinite(originalPrice) && originalPrice > price
								? originalPrice
								: undefined,

						image,
					};
				}),
			);

			setWishlist(itemsWithDetails);
		} catch (err) {
			console.error("Fetch wishlist failed:", err);

			setError(
				err instanceof Error
					? err.message
					: "Unable to load your wishlist. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* ==========================================================================
	   INITIAL FETCH
	========================================================================== */

	useEffect(() => {
		fetchWishlist();
	}, []);

	/* ==========================================================================
	   REMOVE FROM WISHLIST
	========================================================================== */

	const removeFromWishlist = async (productId: WishlistProduct["id"]) => {
		const removedItem = wishlist.find((item) => item.id === productId);

		const removedIndex = wishlist.findIndex((item) => item.id === productId);

		/*
		 * Optimistic removal.
		 */

		setWishlist((current) => current.filter((item) => item.id !== productId));

		try {
			const response = await fetch("/api/wishlist/remove", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					productId,
				}),
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message ??
						"Unable to remove item from wishlist. Please try again.",
				);
			}
		} catch (err) {
			console.error("Error removing wishlist item:", err);

			/*
			 * Revert optimistic update.
			 */

			if (removedItem) {
				setWishlist((current) => {
					const next = [...current];

					next.splice(removedIndex, 0, removedItem);

					return next;
				});
			}

			showError(
				err instanceof Error
					? err.message
					: "Unable to remove item from wishlist. Please try again.",
			);
		}
	};

	/* ==========================================================================
	   ADD TO CART
	========================================================================== */

	const addToCart = async (product: WishlistProduct) => {
		try {
			const response = await fetch("/api/cart/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					productId: product.id,
					quantity: 1,
				}),
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message ?? "Unable to add item to cart. Please try again.",
				);
			}

			/*
			 * Remove from wishlist after
			 * successful cart addition.
			 */

			await removeFromWishlist(product.id);
		} catch (err) {
			console.error("Error adding product to cart:", err);

			showError(
				err instanceof Error
					? err.message
					: "Unable to add item to cart. Please try again.",
			);
		}
	};

	/* ==========================================================================
	   LOADING STATE
	========================================================================== */

	if (loading) {
		return (
			<main className="min-h-screen bg-[#F8F5F2]">
				<WishlistHeader />

				<div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div
								key={index}
								className="overflow-hidden rounded-2xl border border-[#E7D5C8] bg-white"
							>
								<div className="aspect-square animate-pulse bg-[#EDE5DF]" />

								<div className="space-y-3 p-5">
									<div className="h-3 w-1/3 animate-pulse rounded bg-[#EDE5DF]" />

									<div className="h-5 animate-pulse rounded bg-[#EDE5DF]" />

									<div className="h-5 w-1/2 animate-pulse rounded bg-[#EDE5DF]" />

									<div className="mt-4 h-11 animate-pulse rounded-xl bg-[#EDE5DF]" />
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		);
	}

	/* ==========================================================================
	   ERROR STATE
	========================================================================== */

	if (error && wishlist.length === 0) {
		return (
			<main className="min-h-screen bg-[#F8F5F2]">
				<WishlistHeader />

				<div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
					<div className="rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
							<AlertCircle
								size={32}
								className="text-red-500"
								strokeWidth={1.7}
							/>
						</div>

						<h1 className="mt-6 text-2xl font-bold tracking-tight text-[#2E2E2E]">
							Couldn't load your wishlist
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							{error}
						</p>

						<button
							type="button"
							onClick={fetchWishlist}
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg"
						>
							Try again
						</button>
					</div>
				</div>
			</main>
		);
	}

	/* ==========================================================================
	   MAIN PAGE
	========================================================================== */

	return (
		<main className="min-h-screen bg-[#F8F5F2]">
			<WishlistHeader />

			{/* ------------------------------------------------------------------
			    INLINE ERROR
			------------------------------------------------------------------ */}

			{error && (
				<div className="mx-auto mt-5 max-w-7xl px-5 sm:px-6 lg:px-8">
					<div
						role="alert"
						className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						{error}
					</div>
				</div>
			)}

			<div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
				{/* ----------------------------------------------------------------
				    PAGE INTRO
				---------------------------------------------------------------- */}

				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]/70">
							Your favourites
						</p>

						<h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl lg:text-[42px]">
							My Wishlist
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
							Keep the gifts you love close until you're ready to make them
							yours.
						</p>
					</div>

					{wishlist.length > 0 && (
						<div className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#2E2E2E]/60 shadow-sm">
							<Heart size={14} className="text-[#85161B]" fill="currentColor" />
							{wishlist.length} {wishlist.length === 1 ? "item" : "items"}
						</div>
					)}
				</div>

				{/* ----------------------------------------------------------------
				    EMPTY STATE / GRID
				---------------------------------------------------------------- */}

				{wishlist.length === 0 ? (
					<EmptyWishlist />
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<AnimatePresence mode="popLayout">
							{wishlist.map((product, index) => (
								<WishlistCard
									key={product.id}
									product={product}
									index={index}
									onRemove={removeFromWishlist}
									onAddToCart={addToCart}
								/>
							))}
						</AnimatePresence>
					</div>
				)}

				{/* ----------------------------------------------------------------
				    BOTTOM MESSAGE
				---------------------------------------------------------------- */}

				{wishlist.length > 0 && (
					<div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-3 text-center">
						<div className="h-px flex-1 bg-[#E7D5C8]" />

						<span className="px-2 text-xs font-medium text-[#2E2E2E]/40">
							Save it today, gift it when the moment comes
						</span>

						<div className="h-px flex-1 bg-[#E7D5C8]" />
					</div>
				)}
			</div>
		</main>
	);
}

/* ============================================================================
   HEADER
============================================================================ */

function WishlistHeader() {
	return (
		<section className="border-b border-[#E7D5C8] bg-white">
			<div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-6 lg:px-8">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7D6BF]/50 text-[#85161B]">
					<Heart size={19} strokeWidth={1.8} />
				</div>

				<div>
					<p className="text-sm font-semibold text-[#2E2E2E]">Your Wishlist</p>

					<p className="text-xs text-[#2E2E2E]/45">
						Your handpicked favourites
					</p>
				</div>
			</div>
		</section>
	);
}

/* ============================================================================
   WISHLIST CARD
============================================================================ */

interface WishlistCardProps {
	product: WishlistProduct;
	index: number;
	onRemove: (productId: WishlistProduct["id"]) => void;
	onAddToCart: (product: WishlistProduct) => void;
}

function WishlistCard({
	product,
	index,
	onRemove,
	onAddToCart,
}: WishlistCardProps) {
	const hasDiscount =
		product.originalPrice !== undefined &&
		product.originalPrice > product.price;

	return (
		<motion.article
			layout
			initial={{
				opacity: 0,
				y: 20,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			exit={{
				opacity: 0,
				scale: 0.95,
			}}
			transition={{
				duration: 0.35,
				delay: index * 0.05,
			}}
			className="group overflow-hidden rounded-2xl border border-[#E7D5C8] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
		>
			{/* ----------------------------------------------------------------
			    IMAGE
			---------------------------------------------------------------- */}

			<div className="relative aspect-square overflow-hidden bg-[#F2E9E2]">
				{product.image ? (
					<Image
						src={product.image}
						alt={product.name}
						fill
						sizes="
							(max-width: 640px) 100vw,
							(max-width: 1024px) 50vw,
							25vw
						"
						className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<ShoppingBag
							size={40}
							className="text-[#85161B]/25"
							strokeWidth={1.5}
						/>
					</div>
				)}

				{/* Badge */}

				{product.badge && (
					<div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#85161B] shadow-sm backdrop-blur-sm">
						{product.badge}
					</div>
				)}

				{/* Remove */}

				<button
					type="button"
					onClick={() => onRemove(product.id)}
					aria-label={`Remove ${product.name} from wishlist`}
					className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#85161B] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-[#85161B] hover:text-white"
				>
					<Trash2 size={15} />
				</button>
			</div>

			{/* ----------------------------------------------------------------
			    CONTENT
			---------------------------------------------------------------- */}

			<div className="p-4 sm:p-5">
				{product.category && (
					<p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#85161B]/60">
						{product.category}
					</p>
				)}

				<h2 className="line-clamp-2 min-h-[44px] text-base font-semibold leading-snug text-[#2E2E2E]">
					{product.name}
				</h2>

				{/* PRICE */}

				<div className="mt-3 flex items-center gap-2">
					<span className="text-lg font-bold text-[#85161B]">
						₹
						{product.price.toLocaleString("en-IN", {
							minimumFractionDigits: 0,
							maximumFractionDigits: 2,
						})}
					</span>

					{hasDiscount && (
						<span className="text-xs text-[#2E2E2E]/35 line-through">
							₹
							{product.originalPrice?.toLocaleString("en-IN", {
								minimumFractionDigits: 0,
								maximumFractionDigits: 2,
							})}
						</span>
					)}
				</div>

				{/* ----------------------------------------------------------------
				    ACTIONS
				---------------------------------------------------------------- */}

				<div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
					<button
						type="button"
						onClick={() => onAddToCart(product)}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#85161B] px-4 py-3 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#721318] hover:shadow-md active:translate-y-0"
					>
						<ShoppingCart size={15} />
						Add to Cart
					</button>

					<Link
						href={`/product/${product.id}`}
						aria-label={`View ${product.name}`}
						className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E7D5C8] text-[#85161B] transition-all duration-200 hover:bg-[#F8F5F2]"
					>
						<ArrowRight size={17} />
					</Link>
				</div>
			</div>
		</motion.article>
	);
}

/* ============================================================================
   EMPTY WISHLIST
============================================================================ */

function EmptyWishlist() {
	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 15,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#DCCBC0] bg-white px-6 text-center"
		>
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F7D6BF]/40 text-[#85161B]">
				<HeartOff size={32} strokeWidth={1.5} />
			</div>

			<h2 className="mt-6 text-2xl font-bold text-[#2E2E2E] sm:text-3xl">
				Your wishlist is waiting
			</h2>

			<p className="mt-2 max-w-md text-sm leading-6 text-[#2E2E2E]/55 sm:text-base">
				Save the gifts you love and come back whenever you're ready to make
				someone's day a little more special.
			</p>

			<Link
				href="/shop"
				className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#721318] hover:shadow-md"
			>
				<ShoppingBag size={16} />
				Start Shopping
				<ArrowRight size={16} />
			</Link>
		</motion.div>
	);
}
