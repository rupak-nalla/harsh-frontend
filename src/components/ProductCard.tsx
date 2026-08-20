"use client";

import { useState } from "react";
import { Heart, ArrowUpRight, ShoppingBag, Check } from "lucide-react";

type Item = {
	id: string;
	name: string;
	price: number;
	image?: string;
	original?: number;
	badge?: string;
	tag?: string;
	description?: string;
	brand?: string;
};

export default function ProductCard({
	item,
	showOriginal = false,
}: {
	item: Item;
	showOriginal?: boolean;
}) {
	const [wishlisted, setWishlisted] = useState(false);
	const [wishlistLoading, setWishlistLoading] = useState(false);
	const [wishlistError, setWishlistError] = useState("");

	const [addingToCart, setAddingToCart] = useState(false);
	const [addedToCart, setAddedToCart] = useState(false);
	const [cartError, setCartError] = useState("");

	console.log(item.description);
	const handleAddToCart = async () => {
		if (addingToCart) return;

		setCartError("");
		setAddingToCart(true);

		try {
			/*
			 * Only productId is sent. No quantity — the backend
			 * automatically increments the cart quantity by 1
			 * each time the same product is added again.
			 */
			const response = await fetch("/api/cart/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					productId: item.id,
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

			setAddedToCart(true);

			/*
			 * Reset the "Added" confirmation state after a short delay
			 * so the button returns to its normal state.
			 */
			setTimeout(() => {
				setAddedToCart(false);
			}, 1800);
		} catch (error) {
			console.error("Add to cart failed:", error);

			setCartError(
				error instanceof Error
					? error.message
					: "Unable to add item to cart. Please try again.",
			);

			setTimeout(() => {
				setCartError("");
			}, 2500);
		} finally {
			setAddingToCart(false);
		}
	};

	const handleToggleWishlist = async () => {
		if (wishlistLoading) return;

		setWishlistError("");

		/*
		 * Optimistically toggle the heart right away for a
		 * snappy feel, then revert if the request fails.
		 */
		const previousValue = wishlisted;
		setWishlisted(!previousValue);
		setWishlistLoading(true);

		try {
			const response = await fetch("/api/wishlist/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					productId: item.id,
				}),
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to update wishlist. Please try again.",
				);
			}
		} catch (error) {
			console.error("Wishlist update failed:", error);

			/*
			 * Revert the optimistic update on failure.
			 */
			setWishlisted(previousValue);

			setWishlistError(
				error instanceof Error
					? error.message
					: "Unable to update wishlist. Please try again.",
			);

			setTimeout(() => {
				setWishlistError("");
			}, 2500);
		} finally {
			setWishlistLoading(false);
		}
	};

	const handleBuyNow = () => {
		/*
		 * TODO: wire this up to your actual checkout flow
		 * (e.g. redirect to /checkout?itemId=... or add to
		 * cart then redirect to /checkout).
		 */
		console.log("Buy now:", item.id);
	};

	return (
		<article
			className="
				group
				w-full
				min-w-0
				overflow-hidden
				rounded-[26px]
				border
				border-black/[0.06]
				bg-white
				p-2.5
				shadow-[0_8px_30px_rgba(0,0,0,0.05)]
				transition-all
				duration-300
				hover:-translate-y-1
				hover:shadow-[0_14px_40px_rgba(0,0,0,0.09)]
			"
		>
			{/* =====================================================
			    IMAGE
			===================================================== */}

			<div
				className="
					relative
					aspect-[0.92]
					overflow-hidden
					rounded-[21px]
					bg-[#F3F0EC]
				"
			>
				{item.image ? (
					<img
						src={item.image}
						alt={item.name}
						loading="lazy"
						className="
							h-full
							w-full
							object-cover
							transition-transform
							duration-500
							ease-out
							group-hover:scale-[1.035]
						"
					/>
				) : (
					<div
						className="
							flex
							h-full
							w-full
							items-center
							justify-center
							text-sm
							text-black/40
						"
					>
						No image
					</div>
				)}

				{/* =================================================
				    BADGE
				================================================= */}

				{(item.badge || item.tag) && (
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
							tracking-[0.08em]
							text-[#85161B]
							shadow-sm
						"
					>
						{item.badge || item.tag}
					</div>
				)}

				{/* =================================================
				    WISHLIST
				================================================= */}

				<button
					type="button"
					onClick={handleToggleWishlist}
					disabled={wishlistLoading}
					aria-label={
						wishlisted
							? `Remove ${item.name} from wishlist`
							: `Add ${item.name} to wishlist`
					}
					className="
						absolute
						right-3
						top-3
						flex
						h-10
						w-10
						items-center
						justify-center
						rounded-full
						bg-white/95
						shadow-sm
						transition-all
						duration-200
						hover:scale-105
						active:scale-90
						disabled:cursor-not-allowed
						disabled:opacity-70
					"
				>
					<Heart
						size={19}
						strokeWidth={1.8}
						className={
							wishlisted ? "fill-[#85161B] text-[#85161B]" : "text-[#222]"
						}
					/>
				</button>

				{/* =================================================
				    OPTIONAL IMAGE BOTTOM GRADIENT
				    Very subtle — only improves readability if
				    the image is bright.
				================================================= */}

				<div
					className="
						pointer-events-none
						absolute
						inset-x-0
						bottom-0
						h-16
						bg-gradient-to-t
						from-black/10
						to-transparent
						opacity-0
						transition-opacity
						duration-300
						group-hover:opacity-100
					"
				/>
			</div>

			{/* =====================================================
			    PRODUCT INFORMATION
			===================================================== */}

			<div className="px-2 pb-1 pt-4">
				{/* Product name */}

				<h3
					className="
						line-clamp-1
						text-[16px]
						font-semibold
						leading-tight
						tracking-[-0.01em]
						text-[#202020]
					"
				>
					{item.name}
				</h3>

				{/* Brand */}

				{item.brand && (
					<p
						className="
							mt-1
							text-[12px]
							font-medium
							text-black/40
						"
					>
						{item.brand}
					</p>
				)}

				{/* Description */}
				{/* <p
					className="
        mt-1.5
        text-[12px]
        leading-[1.45]
        text-black/45
    "
				>
					{item.description}
				</p> */}
				<p
					className="
						mt-1.5
						line-clamp-2
						min-h-[34px]
						text-[12px]
						leading-[1.45]
						text-black/45
					"
				>
					{item.description ||
						"Thoughtfully designed and made to make every moment personal."}
				</p>

				{/* =================================================
				    PRICE
				================================================= */}

				<div className="mt-4 min-w-0">
					<div className="flex items-baseline gap-2">
						<span
							className="
								text-[19px]
								font-bold
								tracking-tight
								text-[#85161B]
							"
						>
							₹{item.price.toFixed(0)}
						</span>

						{showOriginal && item.original && (
							<span
								className="
									text-[12px]
									font-medium
									text-black/30
									line-through
								"
							>
								₹{item.original.toFixed(0)}
							</span>
						)}
					</div>
				</div>

				{/* =================================================
				    ACTIONS: ADD TO CART + BUY NOW
				================================================= */}

				<div className="mt-3 flex items-center gap-2">
					{/* ADD TO CART */}

					<button
						type="button"
						onClick={handleAddToCart}
						disabled={addingToCart}
						aria-label={`Add ${item.name} to cart`}
						className="
							flex
							h-11
							flex-1
							items-center
							justify-center
							gap-2
							rounded-full
							border
							border-[#85161B]/25
							bg-white
							text-[12px]
							font-semibold
							text-[#85161B]
							transition-all
							duration-200
							hover:border-[#85161B]/50
							hover:bg-[#85161B]/[0.04]
							active:scale-95
							disabled:cursor-not-allowed
							disabled:opacity-60
						"
					>
						{addingToCart ? (
							<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#85161B]/30 border-t-[#85161B]" />
						) : addedToCart ? (
							<Check size={16} strokeWidth={2.4} />
						) : (
							<ShoppingBag size={16} strokeWidth={2} />
						)}

						<span>
							{addingToCart
								? "Adding..."
								: addedToCart
									? "Added"
									: "Add to cart"}
						</span>
					</button>

					{/* BUY NOW */}

					{/* <button
						type="button"
						onClick={handleBuyNow}
						aria-label={`Buy ${item.name} now`}
						className="
							group/button
							flex
							h-11
							items-center
							gap-2
							rounded-full
							bg-[#85161B]
							pl-4
							pr-1.5
							text-[12px]
							font-semibold
							text-white
							transition-all
							duration-200
							hover:bg-[#6f1116]
							active:scale-95
						"
					>
						<span className="hidden sm:inline">Buy Now</span>

						<span className="sm:hidden">Buy</span>

						<span
							className="
								flex
								h-8
								w-8
								items-center
								justify-center
								rounded-full
								bg-white
								text-[#85161B]
								transition-transform
								duration-200
								group-hover/button:rotate-12
							"
						>
							<ArrowUpRight size={17} strokeWidth={2.2} />
						</span>
					</button> */}
				</div>

				{/* =================================================
				    CART / WISHLIST ERRORS
				================================================= */}

				{cartError && (
					<p role="alert" className="mt-2 text-[11px] font-medium text-red-600">
						{cartError}
					</p>
				)}

				{wishlistError && (
					<p role="alert" className="mt-2 text-[11px] font-medium text-red-600">
						{wishlistError}
					</p>
				)}
			</div>
		</article>
	);
}
