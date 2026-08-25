"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	ArrowRight,
	Minus,
	Plus,
	ShoppingBag,
	Trash2,
	ShieldCheck,
	Truck,
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

type Customization = Record<string, string>;

type CartItem = {
	id: string;
	title: string;
	description: string;
	price: number;
	marketPrice: number;
	resellerPrice: number;
	quantity: number;
	image?: string;
	delivery: number;
	customization: Customization;
	inStock: string;
};

type CartResponse = {
	status?: number;
	message?: string;
	products_count?: number;
	cart?: RawCartItem[];
	total_price?: number | string;
	delivery_fee?: number | string;
	grand_total?: number | string;
};

type RawCartItem = {
	id?: string | number;
	product_id?: string | number;

	name?: string;
	description?: string;

	varients?: string;

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

	delivery?: string | number;

	quantity?: string | number;

	customization?: string | Record<string, string>;
};

/* ============================================================================
   HELPERS
============================================================================ */

/**
 * Convert a value into a safe number.
 */
function toNumber(value: unknown, fallback = 0): number {
	const number = Number(value);

	return Number.isFinite(number) ? number : fallback;
}

/**
 * Convert API customization string into an object.
 *
 * Example API:
 *
 * "{\"penname\":\"Name To be Printed On Pen = xcvbnmn,\"}"
 *
 * becomes:
 *
 * {
 *   penname: "Name To be Printed On Pen = xcvbnmn,"
 * }
 */
function parseCustomization(
	value?: string | Record<string, string>,
): Customization {
	if (!value) {
		return {};
	}

	if (typeof value === "object") {
		return value;
	}

	try {
		const parsed = JSON.parse(value);

		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed as Customization;
		}
	} catch (error) {
		console.error("Unable to parse customization:", error);
	}

	return {};
}

/**
 * Convert an API image filename into the actual image URL.
 */
function getProductImage(photoPath?: string): string | undefined {
	if (!photoPath) {
		return undefined;
	}

	if (
		photoPath.startsWith("http://") ||
		photoPath.startsWith("https://")
	) {
		return photoPath;
	}

	const cleanPath = photoPath.replace(/^\/+/, "");

	return `${PRODUCT_IMAGE_BASE_URL}${cleanPath}`;
}

/**
 * Convert raw cart item returned by the backend into
 * the structure used by the UI.
 */
function normalizeCartItem(raw: RawCartItem): CartItem {
	const id = String(raw.id ?? raw.product_id ?? "");

	const quantity = Math.max(
		1,
		Math.floor(toNumber(raw.quantity, 1)),
	);

	return {
		id,

		title: raw.name ?? "Untitled product",

		description: raw.description ?? "",

		price: toNumber(raw.selling_price, 0),

		marketPrice: toNumber(raw.market_price, 0),

		resellerPrice: toNumber(raw.reseller_price, 0),

		quantity,

		image: getProductImage(raw.primary_photo_path),

		delivery: toNumber(raw.delivery, 0),

		customization: parseCustomization(raw.customization),

		inStock: raw.in_stock ?? "available",
	};
}

/* ============================================================================
   CART PAGE
============================================================================ */

export default function CartPage() {
	return <CartView />;
}

/* ============================================================================
   CART VIEW
============================================================================ */

function CartView() {
	const router = useRouter();

	const [items, setItems] = useState<CartItem[]>([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	const [deliveryFee, setDeliveryFee] = useState(0);

	const [serverSubtotal, setServerSubtotal] = useState(0);

	const [serverGrandTotal, setServerGrandTotal] = useState(0);

	const [updatingItemIds, setUpdatingItemIds] = useState<Set<string>>(
		new Set(),
	);

	/* ==========================================================================
	   ERROR
	========================================================================== */

	const showError = (message: string) => {
		setError(message);

		setTimeout(() => {
			setError("");
		}, 3000);
	};

	/* ==========================================================================
	   FETCH CART
	========================================================================== */

	const fetchCart = async () => {
		setLoading(true);

		setError("");

		try {
			const response = await fetch("/api/cart", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: CartResponse = await response
				.json()
				.catch(() => ({}));

			console.log("CART RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message ??
						"Unable to load your cart. Please try again.",
				);
			}

			const rawItems = Array.isArray(data.cart) ? data.cart : [];

			const normalizedItems = rawItems
				.map(normalizeCartItem)
				.filter((item) => item.id);

			setItems(normalizedItems);

			/*
			 * Store totals returned by the backend.
			 */

			setServerSubtotal(
				toNumber(data.total_price, 0),
			);

			setDeliveryFee(
				toNumber(data.delivery_fee, 0),
			);

			setServerGrandTotal(
				toNumber(data.grand_total, 0),
			);
		} catch (err) {
			console.error("Fetch cart failed:", err);

			setError(
				err instanceof Error
					? err.message
					: "Unable to load your cart. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* ==========================================================================
	   INITIAL LOAD
	========================================================================== */

	useEffect(() => {
		fetchCart();
	}, []);

	/* ==========================================================================
	   LOCAL TOTALS
	========================================================================== */

	const localSubtotal = items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const totalProducts = items.reduce(
		(total, item) => total + item.quantity,
		0,
	);

	/*
	 * Use backend totals when available.
	 *
	 * During optimistic quantity changes, localSubtotal is more
	 * accurate until fetchCart() finishes.
	 */

	const subtotal =
		items.length > 0 && serverSubtotal > 0
			? localSubtotal
			: localSubtotal;

	const grandTotal =
		items.length > 0
			? subtotal + deliveryFee
			: 0;

	/* ==========================================================================
	   SET QUANTITY
	========================================================================== */

	const setItemQuantity = async (
		itemId: string,
		newQuantity: number,
	) => {
		if (newQuantity < 0) {
			return;
		}

		if (updatingItemIds.has(itemId)) {
			return;
		}

		const currentItem = items.find(
			(item) => item.id === itemId,
		);

		if (!currentItem) {
			return;
		}

		const previousQuantity = currentItem.quantity;

		/*
		 * Mark item as updating.
		 */

		setUpdatingItemIds((previous) => {
			const next = new Set(previous);

			next.add(itemId);

			return next;
		});

		/*
		 * Optimistic update.
		 */

		if (newQuantity === 0) {
			setItems((previous) =>
				previous.filter(
					(item) => item.id !== itemId,
				),
			);
		} else {
			setItems((previous) =>
				previous.map((item) =>
					item.id === itemId
						? {
								...item,
								quantity: newQuantity,
							}
						: item,
				),
			);
		}

		try {
			/*
			 * IMPORTANT:
			 *
			 * /api/cart/add expects multipart/form-data.
			 *
			 * Do NOT send JSON.
			 */

			const formData = new FormData();

			formData.append("product_id", itemId);

			formData.append(
				"quantity",
				String(newQuantity),
			);

			const response = await fetch("/api/cart/add", {
				method: "POST",

				credentials: "include",

				body: formData,
			});

			const data = await response
				.json()
				.catch(() => ({}));

			console.log(
				"UPDATE CART RESPONSE:",
				data,
			);

			if (!response.ok) {
				throw new Error(
					data?.message ??
						"Unable to update cart. Please try again.",
				);
			}

			/*
			 * Fetch the cart again so that:
			 *
			 * - quantity
			 * - subtotal
			 * - delivery
			 * - grand total
			 *
			 * are all synchronized with backend.
			 */

			await fetchCart();
		} catch (err) {
			console.error(
				"Quantity update failed:",
				err,
			);

			/*
			 * Restore old quantity.
			 */

			setItems((previous) => {
				const exists = previous.some(
					(item) => item.id === itemId,
				);

				if (!exists) {
					return [
						...previous,
						{
							...currentItem,
							quantity:
								previousQuantity,
						},
					];
				}

				return previous.map((item) =>
					item.id === itemId
						? {
								...item,
								quantity:
									previousQuantity,
							}
						: item,
				);
			});

			showError(
				err instanceof Error
					? err.message
					: "Unable to update cart.",
			);
		} finally {
			setUpdatingItemIds((previous) => {
				const next = new Set(previous);

				next.delete(itemId);

				return next;
			});
		}
	};

	/* ==========================================================================
	   INCREASE
	========================================================================== */

	const handleIncrease = (item: CartItem) => {
		setItemQuantity(
			item.id,
			item.quantity + 1,
		);
	};

	/* ==========================================================================
	   DECREASE
	========================================================================== */

	const handleDecrease = (item: CartItem) => {
		setItemQuantity(
			item.id,
			Math.max(0, item.quantity - 1),
		);
	};

	/* ==========================================================================
	   REMOVE
	========================================================================== */

	const handleRemove = (item: CartItem) => {
		setItemQuantity(item.id, 0);
	};

	/* ==========================================================================
	   CLEAR CART
	========================================================================== */

	const handleClearCart = async () => {
		if (items.length === 0) {
			return;
		}

		const confirmed = window.confirm(
			"Are you sure you want to clear your cart?",
		);

		if (!confirmed) {
			return;
		}

		const previousItems = [...items];

		setItems([]);

		try {
			/*
			 * Remove every product.
			 */

			for (const item of previousItems) {
				const formData = new FormData();

				formData.append(
					"product_id",
					item.id,
				);

				formData.append(
					"quantity",
					"0",
				);

				const response = await fetch(
					"/api/cart/add",
					{
						method: "POST",

						credentials: "include",

						body: formData,
					},
				);

				const data = await response
					.json()
					.catch(() => ({}));

				if (!response.ok) {
					throw new Error(
						data?.message ??
							"Unable to clear the cart.",
					);
				}
			}

			setDeliveryFee(0);
			setServerSubtotal(0);
			setServerGrandTotal(0);
		} catch (err) {
			console.error(
				"Clear cart failed:",
				err,
			);

			setItems(previousItems);

			showError(
				err instanceof Error
					? err.message
					: "Unable to clear your cart.",
			);
		}
	};

	/* ==========================================================================
	   CHECKOUT
	========================================================================== */

	const handleCheckout = () => {
		if (items.length === 0) {
			return;
		}

		router.push("/checkout");
	};

	/* ==========================================================================
	   LOADING
	========================================================================== */

	if (loading) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12 sm:px-6">
					<div className="flex flex-col items-center gap-3">
						<span className="h-8 w-8 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />

						<p className="text-sm text-[#2E2E2E]/50">
							Loading your cart...
						</p>
					</div>
				</div>
			</main>
		);
	}

	/* ==========================================================================
	   ERROR WITH NO ITEMS
	========================================================================== */

	if (error && items.length === 0) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12 sm:px-6">
					<div className="w-full rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
							<AlertCircle
								size={32}
								className="text-red-500"
								strokeWidth={1.7}
							/>
						</div>

						<h1 className="mt-6 text-2xl font-bold tracking-tight text-[#2E2E2E]">
							Couldn't load your cart
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							{error}
						</p>

						<button
							type="button"
							onClick={fetchCart}
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
	   EMPTY CART
	========================================================================== */

	if (items.length === 0) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12 sm:px-6">
					<div className="w-full rounded-3xl border border-[#E8DED7] bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7D6BF]/40">
							<ShoppingBag
								size={32}
								className="text-[#85161B]"
								strokeWidth={1.7}
							/>
						</div>

						<p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#85161B]">
							Your Cart
						</p>

						<h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Nothing here yet.
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							Looks like you haven't added anything to
							your cart. Find something special and make
							it personal.
						</p>

						<Link
							href="/shop"
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg"
						>
							Continue Shopping
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</main>
		);
	}

	/* ==========================================================================
	   CART PAGE
	========================================================================== */

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			{/* =================================================================
			    PAGE HEADER
			================================================================= */}

			<section className="border-b border-[#E8DED7] bg-white">
				<div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
					<Link
						href="/shop"
						className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
					>
						<ArrowLeft size={16} />
						Continue Shopping
					</Link>

					<div className="mt-6">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85161B]">
							Shopping Bag
						</p>

						<h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Your Cart
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/50">
							{totalProducts}{" "}
							{totalProducts === 1
								? "product"
								: "products"}{" "}
							in your cart
						</p>
					</div>
				</div>
			</section>

			{/* =================================================================
			    INLINE ERROR
			================================================================= */}

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

			{/* =================================================================
			    CONTENT
			================================================================= */}

			<section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
					{/* =========================================================
					    LEFT
					========================================================= */}

					<div>
						<div className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
							{/* HEADER */}

							<div className="flex items-center justify-between border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<h2 className="font-semibold text-[#2E2E2E]">
									Cart Items
								</h2>

								<button
									type="button"
									onClick={handleClearCart}
									className="text-xs font-medium text-[#2E2E2E]/45 transition-colors hover:text-[#85161B]"
								>
									Clear cart
								</button>
							</div>

							{/* PRODUCTS */}

							<div className="divide-y divide-[#E8DED7]">
								{items.map((item) => {
									const isUpdating =
										updatingItemIds.has(
											item.id,
										);

									const itemTotal =
										item.price *
										item.quantity;

									return (
										<div
											key={item.id}
											className="p-5 sm:p-6"
										>
											<div className="flex gap-4 sm:gap-5">
												{/* =================================================
												    IMAGE
												================================================= */}

												<div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F7F3F0] sm:h-28 sm:w-28">
													{item.image ? (
														<img
															src={
																item.image
															}
															alt={
																item.title
															}
															className="h-full w-full object-cover"
															onError={(
																event,
															) => {
																event.currentTarget.style.display =
																	"none";
															}}
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center">
															<ShoppingBag
																size={
																	25
																}
																className="text-[#85161B]/30"
															/>
														</div>
													)}
												</div>

												{/* =================================================
												    DETAILS
												================================================= */}

												<div className="min-w-0 flex-1">
													<div className="flex items-start justify-between gap-3">
														<div className="min-w-0">
															<h3 className="font-semibold text-[#2E2E2E]">
																{
																	item.title
																}
															</h3>

															{item.description && (
																<p className="mt-1 line-clamp-2 text-xs leading-5 text-[#2E2E2E]/45">
																	{
																		item.description
																	}
																</p>
															)}

															<div className="mt-2 flex flex-wrap items-center gap-2">
																<span className="text-sm font-medium text-[#85161B]">
																	₹
																	{item.price.toFixed(
																		2,
																	)}
																</span>

																{item.marketPrice >
																	item.price && (
																	<span className="text-xs text-[#2E2E2E]/35 line-through">
																		₹
																		{item.marketPrice.toFixed(
																			2,
																		)}
																	</span>
																)}
															</div>
														</div>

														{/* REMOVE */}

														<button
															type="button"
															disabled={
																isUpdating
															}
															onClick={() =>
																handleRemove(
																	item,
																)
															}
															aria-label={`Remove ${item.title}`}
															className="shrink-0 rounded-lg p-2 text-[#2E2E2E]/35 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
														>
															<Trash2
																size={
																	17
																}
															/>
														</button>
													</div>

													{/* =================================================
													    CUSTOMIZATION
													================================================= */}

													{Object.keys(
														item.customization,
													).length >
														0 && (
														<div className="mt-3 rounded-lg bg-[#FBF9F7] px-3 py-2.5">
															<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#85161B]">
																Customization
															</p>

															<div className="mt-1 space-y-0.5">
																{Object.entries(
																	item.customization,
																).map(
																	(
																		[
																			key,
																			value,
																		],
																	) => (
																		<p
																			key={
																				key
																			}
																			className="text-xs leading-5 text-[#2E2E2E]/60"
																		>
																			<span className="font-medium text-[#2E2E2E]">
																				{key
																					.replace(
																						/_/g,
																						" ",
																					)
																					.replace(
																						/\b\w/g,
																						(
																							char,
																						) =>
																							char.toUpperCase(),
																					)}
																				:
																			</span>{" "}
																			{
																				value
																			}
																		</p>
																	),
																)}
															</div>
														</div>
													)}

													{/* =================================================
													    QUANTITY + TOTAL
													================================================= */}

													<div className="mt-4 flex items-center justify-between gap-3">
														<div className="flex items-center rounded-lg border border-[#DED6D0]">
															<button
																type="button"
																disabled={
																	isUpdating
																}
																onClick={() =>
																	handleDecrease(
																		item,
																	)
																}
																aria-label={`Decrease quantity of ${item.title}`}
																className="flex h-9 w-9 items-center justify-center text-[#2E2E2E]/60 transition hover:bg-[#FBF9F7] disabled:cursor-not-allowed disabled:opacity-30"
															>
																<Minus
																	size={
																		14
																	}
																/>
															</button>

															<span className="flex h-9 min-w-10 items-center justify-center border-x border-[#DED6D0] text-sm font-medium text-[#2E2E2E]">
																{isUpdating ? (
																	<span className="h-3 w-3 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
																) : (
																	item.quantity
																)}
															</span>

															<button
																type="button"
																disabled={
																	isUpdating
																}
																onClick={() =>
																	handleIncrease(
																		item,
																	)
																}
																aria-label={`Increase quantity of ${item.title}`}
																className="flex h-9 w-9 items-center justify-center text-[#2E2E2E]/60 transition hover:bg-[#FBF9F7] disabled:cursor-not-allowed disabled:opacity-30"
															>
																<Plus
																	size={
																		14
																	}
																/>
															</button>
														</div>

														<p className="font-semibold text-[#85161B]">
															₹
															{itemTotal.toFixed(
																2,
															)}
														</p>
													</div>

													{/* DELIVERY */}

													{item.delivery >
														0 && (
														<p className="mt-2 text-[11px] text-[#2E2E2E]/40">
															Delivery: ₹
															{item.delivery.toFixed(
																2,
															)}
														</p>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* =====================================================
						    TRUST FEATURES
						===================================================== */}

						<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="flex items-center gap-3 rounded-xl border border-[#E8DED7] bg-white p-4">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF]/40">
									<Truck
										size={17}
										className="text-[#85161B]"
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-[#2E2E2E]">
										Reliable Delivery
									</p>

									<p className="mt-0.5 text-[11px] text-[#2E2E2E]/50">
										Delivered safely to
										your doorstep
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 rounded-xl border border-[#E8DED7] bg-white p-4">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF]/40">
									<ShieldCheck
										size={17}
										className="text-[#85161B]"
									/>
								</div>

								<div>
									<p className="text-xs font-semibold text-[#2E2E2E]">
										Secure Checkout
									</p>

									<p className="mt-0.5 text-[11px] text-[#2E2E2E]/50">
										Your information is
										protected
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* =========================================================
					    ORDER SUMMARY
					========================================================= */}

					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_10px_35px_rgba(80,40,20,0.05)] sm:p-6">
							<h2 className="text-lg font-semibold text-[#2E2E2E]">
								Order Summary
							</h2>

							<div className="mt-6 space-y-4 text-sm">
								{/* SUBTOTAL */}

								<div className="flex justify-between text-[#2E2E2E]/60">
									<span>Subtotal</span>

									<span>
										₹
										{subtotal.toFixed(
											2,
										)}
									</span>
								</div>

								{/* DELIVERY */}

								<div className="flex justify-between text-[#2E2E2E]/60">
									<span>Delivery</span>

									<span>
										{deliveryFee >
										0
											? `₹${deliveryFee.toFixed(
													2,
												)}`
											: "Free"}
									</span>
								</div>

								{/* TOTAL */}

								<div className="border-t border-[#E8DED7] pt-4">
									<div className="flex items-end justify-between">
										<div>
											<p className="font-semibold text-[#2E2E2E]">
												Grand Total
											</p>

											<p className="mt-1 text-[11px] text-[#2E2E2E]/40">
												Including delivery
											</p>
										</div>

										<p className="text-2xl font-bold text-[#85161B]">
											₹
											{grandTotal.toFixed(
												2,
											)}
										</p>
									</div>
								</div>
							</div>

							{/* CHECKOUT */}

							<button
								type="button"
								onClick={handleCheckout}
								className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg active:scale-[0.99]"
							>
								Proceed to Checkout

								<ArrowRight
									size={17}
									className="transition-transform group-hover:translate-x-1"
								/>
							</button>

							{/* CONTINUE */}

							<Link
								href="/shop"
								className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#DED6D0] py-3 text-sm font-medium text-[#2E2E2E]/70 transition-colors hover:border-[#85161B]/30 hover:text-[#85161B]"
							>
								Continue Shopping
							</Link>

							<p className="mt-5 text-center text-[11px] leading-5 text-[#2E2E2E]/40">
								By proceeding to checkout, you agree
								to our terms and conditions.
							</p>
						</div>
					</aside>
				</div>
			</section>
		</main>
	);
}