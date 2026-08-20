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

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface WishlistProduct {
	id: string | number;
	name: string;
	price: number;
	originalPrice?: number;
	image: string;
	badge?: string;
	category?: string;
}

interface RawWishlistProduct {
	id?: string | number;
	product_id?: string | number;
	productId?: string | number;
	name?: string;
	title?: string;
	price?: number | string;
	original_price?: number | string;
	originalPrice?: number | string;
	image?: string;
	image_url?: string;
	badge?: string;
	category?: string;
}

interface WishlistResponse {
	data?: RawWishlistProduct[];
	items?: RawWishlistProduct[];
	wishlist?: RawWishlistProduct[];
	message?: string;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE BACKEND ITEM
|--------------------------------------------------------------------------
|
| The backend's exact field names aren't confirmed yet, so this accepts
| a few likely variants (id/product_id, name/title, price,
| original_price/originalPrice, image/image_url) and maps them to the
| shape the UI expects.
|
*/

function normalizeWishlistItem(raw: RawWishlistProduct): WishlistProduct {
	const id = raw.id ?? raw.product_id ?? raw.productId ?? "";
	const name = raw.name ?? raw.title ?? "Untitled product";
	const price = Number(raw.price ?? 0);

	const rawOriginal = raw.original_price ?? raw.originalPrice;
	const originalPrice =
		rawOriginal !== undefined ? Number(rawOriginal) : undefined;

	const image = raw.image ?? raw.image_url ?? "";

	return {
		id,
		name,
		price: Number.isFinite(price) ? price : 0,
		originalPrice:
			originalPrice !== undefined && Number.isFinite(originalPrice)
				? originalPrice
				: undefined,
		image,
		badge: raw.badge,
		category: raw.category,
	};
}

/*
|--------------------------------------------------------------------------
| WISHLIST PAGE
|--------------------------------------------------------------------------
*/

export default function WishlistPage() {
	const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	/*
	|--------------------------------------------------------------------------
	| FETCH WISHLIST FROM BACKEND
	|--------------------------------------------------------------------------
	*/

	const fetchWishlist = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/wishlist", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: WishlistResponse = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to load your wishlist. Please try again.",
				);
			}

			const rawItems = data.data ?? data.items ?? data.wishlist ?? [];

			setWishlist(rawItems.map(normalizeWishlistItem));
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

	useEffect(() => {
		fetchWishlist();
	}, []);

	/*
	|--------------------------------------------------------------------------
	| REMOVE FROM WISHLIST
	|--------------------------------------------------------------------------
	|
	| Optimistically removes the item from the UI, then calls the backend.
	| Reverts (re-inserts the item) if the request fails.
	|
	*/

	const removeFromWishlist = async (productId: WishlistProduct["id"]) => {
		const removedItem = wishlist.find((item) => item.id === productId);
		const removedIndex = wishlist.findIndex((item) => item.id === productId);

		setWishlist((current) => current.filter((item) => item.id !== productId));

		try {
			const response = await fetch("/api/wishlist/remove", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ productId }),
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message ||
						"Unable to remove item from wishlist. Please try again.",
				);
			}
		} catch (err) {
			console.error("Error removing wishlist item:", err);

			/*
			 * Revert — re-insert the item at its original position.
			 */
			if (removedItem) {
				setWishlist((current) => {
					const next = [...current];
					next.splice(removedIndex, 0, removedItem);
					return next;
				});
			}

			setError(
				err instanceof Error
					? err.message
					: "Unable to remove item from wishlist. Please try again.",
			);

			setTimeout(() => {
				setError("");
			}, 2500);
		}
	};

	/*
	|--------------------------------------------------------------------------
	| ADD TO CART
	|--------------------------------------------------------------------------
	|
	| Uses the same /api/cart/add proxy as the product card, then removes
	| the item from the wishlist on success.
	|
	*/

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
				}),
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to add item to cart. Please try again.",
				);
			}

			/*
			 * Remove from wishlist after a successful cart addition.
			 */
			await removeFromWishlist(product.id);
		} catch (err) {
			console.error("Error adding product to cart:", err);

			setError(
				err instanceof Error
					? err.message
					: "Unable to add item to cart. Please try again.",
			);

			setTimeout(() => {
				setError("");
			}, 2500);
		}
	};

	/*
	|--------------------------------------------------------------------------
	| LOADING STATE
	|--------------------------------------------------------------------------
	*/

	if (loading) {
		return (
			<main className="min-h-screen bg-[#F8F5F2]">
				<WishlistHeader />

				<div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="overflow-hidden rounded-2xl bg-white">
								<div className="aspect-square animate-pulse bg-[#EDE5DF]" />

								<div className="space-y-3 p-4">
									<div className="h-4 animate-pulse rounded bg-[#EDE5DF]" />
									<div className="h-4 w-1/2 animate-pulse rounded bg-[#EDE5DF]" />
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		);
	}

	/*
	|--------------------------------------------------------------------------
	| ERROR STATE (initial fetch failed, nothing to show)
	|--------------------------------------------------------------------------
	*/

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

	return (
		<main className="min-h-screen bg-[#F8F5F2]">
			<WishlistHeader />

			{/* -----------------------------------------------------------------
			    INLINE ERROR (e.g. remove / add-to-cart failed)
			----------------------------------------------------------------- */}

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
				{/* -----------------------------------------------------------------
				    PAGE INTRO
				----------------------------------------------------------------- */}

				<div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
					<div>
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
							Your favourites
						</p>

						<h1
							className="
								text-3xl
								font-bold
								tracking-tight
								text-[#2E2E2E]
								sm:text-4xl
								lg:text-[42px]
							"
						>
							My Wishlist
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
							Keep the gifts you love close until you're ready to make them
							yours.
						</p>
					</div>

					{wishlist.length > 0 && (
						<div
							className="
								flex
								w-fit
								items-center
								gap-2
								rounded-full
								bg-white
								px-4
								py-2
								text-xs
								font-medium
								text-[#2E2E2E]/60
								shadow-sm
							"
						>
							<Heart size={14} className="text-[#85161B]" fill="currentColor" />
							{wishlist.length} {wishlist.length === 1 ? "item" : "items"}
						</div>
					)}
				</div>

				{/* -----------------------------------------------------------------
				    EMPTY STATE
				----------------------------------------------------------------- */}

				{wishlist.length === 0 ? (
					<EmptyWishlist />
				) : (
					/*
					|--------------------------------------------------------------------------
					| WISHLIST GRID
					|--------------------------------------------------------------------------
					*/

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

				{/* -----------------------------------------------------------------
				    BOTTOM MESSAGE
				----------------------------------------------------------------- */}

				{wishlist.length > 0 && (
					<div
						className="
							mx-auto
							mt-12
							flex
							max-w-xl
							items-center
							justify-center
							gap-3
							text-center
						"
					>
						<div className="h-px flex-1 bg-[#E7D5C8]" />

						<span
							className="
								px-2
								text-xs
								font-medium
								text-[#2E2E2E]/40
							"
						>
							Save it today, gift it when the moment comes
						</span>

						<div className="h-px flex-1 bg-[#E7D5C8]" />
					</div>
				)}
			</div>
		</main>
	);
}

/*
|--------------------------------------------------------------------------
| HEADER
|--------------------------------------------------------------------------
*/

function WishlistHeader() {
	return (
		<section className="border-b border-[#E7D5C8] bg-white">
			<div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-6 lg:px-8">
				<div
					className="
						flex
						h-10
						w-10
						items-center
						justify-center
						rounded-full
						bg-[#F7D6BF]/50
						text-[#85161B]
					"
				>
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

/*
|--------------------------------------------------------------------------
| WISHLIST CARD
|--------------------------------------------------------------------------
*/

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
		product.originalPrice && product.originalPrice > product.price;

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
			className="
				group
				overflow-hidden
				rounded-2xl
				border
				border-[#E7D5C8]
				bg-white
				shadow-sm
				transition-all
				duration-300
				hover:-translate-y-1
				hover:shadow-lg
			"
		>
			{/* -----------------------------------------------------------------
			    IMAGE
			----------------------------------------------------------------- */}

			<div className="relative aspect-square overflow-hidden bg-[#F2E9E2]">
				<Image
					src={product.image}
					alt={product.name}
					fill
					sizes="
						(max-width: 640px) 100vw,
						(max-width: 1024px) 50vw,
						25vw
					"
					className="
						object-cover
						transition-transform
						duration-700
						ease-out
						group-hover:scale-105
					"
				/>

				{/* Badge */}

				{product.badge && (
					<div
						className="
							absolute
							left-3
							top-3
							rounded-full
							bg-white/95
							px-3
							py-1.5
							text-[10px]
							font-bold
							uppercase
							tracking-wide
							text-[#85161B]
							shadow-sm
							backdrop-blur-sm
						"
					>
						{product.badge}
					</div>
				)}

				{/* Remove */}

				<button
					type="button"
					onClick={() => onRemove(product.id)}
					aria-label={`Remove ${product.name} from wishlist`}
					className="
						absolute
						right-3
						top-3
						flex
						h-9
						w-9
						items-center
						justify-center
						rounded-full
						bg-white/95
						text-[#85161B]
						shadow-sm
						backdrop-blur-sm
						transition-all
						duration-200
						hover:scale-105
						hover:bg-[#85161B]
						hover:text-white
					"
				>
					<Trash2 size={15} />
				</button>
			</div>

			{/* -----------------------------------------------------------------
			    CONTENT
			----------------------------------------------------------------- */}

			<div className="p-4 sm:p-5">
				{product.category && (
					<p
						className="
							mb-1
							text-[10px]
							font-semibold
							uppercase
							tracking-[0.14em]
							text-[#85161B]/60
						"
					>
						{product.category}
					</p>
				)}

				<h2
					className="
						line-clamp-2
						min-h-[44px]
						text-base
						font-semibold
						leading-snug
						text-[#2E2E2E]
					"
				>
					{product.name}
				</h2>

				{/* Price */}

				<div className="mt-3 flex items-center gap-2">
					<span className="text-lg font-bold text-[#85161B]">
						₹{product.price.toLocaleString("en-IN")}
					</span>

					{hasDiscount && (
						<span className="text-xs text-[#2E2E2E]/35 line-through">
							₹{product.originalPrice?.toLocaleString("en-IN")}
						</span>
					)}
				</div>

				{/* -----------------------------------------------------------------
				    ACTIONS
				----------------------------------------------------------------- */}

				<div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
					<button
						type="button"
						onClick={() => onAddToCart(product)}
						className="
							inline-flex
							items-center
							justify-center
							gap-2
							rounded-xl
							bg-[#85161B]
							px-4
							py-3
							text-xs
							font-semibold
							text-white
							transition-all
							duration-200
							hover:-translate-y-0.5
							hover:bg-[#721318]
							hover:shadow-md
							active:translate-y-0
						"
					>
						<ShoppingCart size={15} />
						Add to Cart
					</button>

					<Link
						href={`/product/${product.id}`}
						aria-label={`View ${product.name}`}
						className="
							flex
							h-11
							w-11
							items-center
							justify-center
							rounded-xl
							border
							border-[#E7D5C8]
							text-[#85161B]
							transition-all
							duration-200
							hover:bg-[#F8F5F2]
						"
					>
						<ArrowRight size={17} />
					</Link>
				</div>
			</div>
		</motion.article>
	);
}

/*
|--------------------------------------------------------------------------
| EMPTY WISHLIST
|--------------------------------------------------------------------------
*/

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
			className="
				flex
				min-h-[420px]
				flex-col
				items-center
				justify-center
				rounded-3xl
				border
				border-dashed
				border-[#DCCBC0]
				bg-white
				px-6
				text-center
			"
		>
			<div
				className="
					flex
					h-20
					w-20
					items-center
					justify-center
					rounded-full
					bg-[#F7D6BF]/40
					text-[#85161B]
				"
			>
				<HeartOff size={32} strokeWidth={1.5} />
			</div>

			<h2
				className="
					mt-6
					text-2xl
					font-bold
					text-[#2E2E2E]
					sm:text-3xl
				"
			>
				Your wishlist is waiting
			</h2>

			<p
				className="
					mt-2
					max-w-md
					text-sm
					leading-6
					text-[#2E2E2E]/55
					sm:text-base
				"
			>
				Save the gifts you love and come back whenever you're ready to make
				someone's day a little more special.
			</p>

			<Link
				href="/shop"
				className="
					mt-7
					inline-flex
					items-center
					gap-2
					rounded-xl
					bg-[#85161B]
					px-6
					py-3.5
					text-sm
					font-semibold
					text-white
					shadow-sm
					transition-all
					duration-200
					hover:-translate-y-0.5
					hover:bg-[#721318]
					hover:shadow-md
				"
			>
				<ShoppingBag size={16} />
				Start Shopping
				<ArrowRight size={16} />
			</Link>
		</motion.div>
	);
}
