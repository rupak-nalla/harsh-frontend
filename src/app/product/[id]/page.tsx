"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
	ArrowLeft,
	ArrowRight,
	ShoppingBag,
	Truck,
	ShieldCheck,
	AlertCircle,
	AlertTriangle,
	Upload,
	Trash2,
	CheckCircle2,
	PackageX,
	ChevronDown,
	Star,
	MessageSquare,
} from "lucide-react";

/* ============================================================================
   CONSTANTS
============================================================================ */

const PRODUCT_IMAGE_BASE_URL =
	"https://printinghouseujjain.in/assets/products/";

const REVIEW_IMAGE_URL = "https://printinghouseujjain.in/assets/reviews/";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* ============================================================================
   TYPES
============================================================================ */

type CustomizeRequirement = {
	key: string;
	type: "text" | "photo" | "photos";
	max: number;
	placeholder: string;
	optional: boolean;
};

type Product = {
	id: string;
	name: string;
	description: string;
	sellingPrice: number;
	marketPrice: number;
	delivery: number;
	inStock: boolean;
	sold: number;
	images: string[];

	/*
	 * Kept raw (same shape ProductCard receives) so it can be run
	 * through the exact same parseCustomizeRequirements() used on
	 * the shop grid — text / photo / photos, both new and old
	 * backend formats.
	 */
	customizeReqs?: string | string[] | null;

	options?: string[];

	noCustomization?: boolean;
};

/* ============================================================================
   RAW API RESPONSE
============================================================================ */

type RawProduct = {
	id?: string | number;
	name?: string;
	description?: string;
	primary_photo_path?: string;
	other_photos_paths?: string;
	market_price?: string | number;
	selling_price?: string | number;
	reseller_price?: string | number;
	in_stock?: string;
	sold?: string | number;
	customize_reqs?: string | string[] | null;
	options?: string[];
	no_customization?: string | boolean;
	delivery?: string | number;
};

type ProductResponse = {
	status?: number;
	message?: string;
	result?: RawProduct;
	product?: RawProduct;
	data?: RawProduct;
} & RawProduct;

/* ============================================================================
   REVIEWS

   NOTE:
   The exact response shape for /api/reviews isn't confirmed, so
   this checks a few likely field names for each review (name,
   rating, comment, date) and falls back gracefully if a field is
   missing rather than breaking the whole section.
============================================================================ */

type RawReview = {
	id?: string | number;
	tracker?: string;
	name?: string;
	customer_name?: string;
	user_name?: string;
	rating?: string | number;
	stars?: string | number;
	star_count?: string | number;
	comment?: string;
	review?: string;
	review_text?: string;
	description?: string;
	message?: string;
	photos_path?: string;
	photo_path?: string | string[];
	created_at?: string;
	date?: string;
};

type RawReviewsResponse = {
	status?: number;
	message?: string;
	reviews?: RawReview[];
	result?: RawReview[];
	data?: RawReview[];
};

type Review = {
	id: string;
	name: string;
	rating: number;
	comment: string;
	date: string;
	photos: string[];
};

function parseReviewPhotos(value?: unknown): string[] {
	if (!value) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.filter((photo): photo is string => typeof photo === "string");
	}

	try {
		const parsed = JSON.parse(String(value));
		return Array.isArray(parsed)
			? parsed.filter((photo): photo is string => typeof photo === "string")
			: [];
	} catch {
		return [];
	}
}

function normalizeReview(raw: RawReview, index: number): Review {
	const rating = toNumber(raw.star_count ?? raw.rating ?? raw.stars, 0);

	let date = raw.created_at ?? raw.date ?? "";

	if (date) {
		const parsed = new Date(date.replace(" ", "T"));

		if (!Number.isNaN(parsed.getTime())) {
			date = parsed.toLocaleDateString("en-IN", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		}
	}

	return {
		id: String(raw.id ?? `review-${index}`),
		name: raw.name ?? raw.customer_name ?? raw.user_name ?? "Customer",
		rating: Math.min(5, Math.max(0, rating)),
		comment:
			raw.description ??
			raw.comment ??
			raw.review ??
			raw.review_text ??
			raw.message ??
			"",
		date,
		photos: parseReviewPhotos(raw.photos_path ?? raw.photo_path),
	};
}

/* ============================================================================
   HELPERS
============================================================================ */

function toNumber(value: unknown, fallback = 0): number {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function getProductImage(photoPath?: string): string | undefined {
	if (!photoPath) {
		return undefined;
	}

	if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
		return photoPath;
	}

	return `${PRODUCT_IMAGE_BASE_URL}${photoPath.replace(/^\/+/, "")}`;
}

function parseJsonArray(value?: string): string[] {
	if (!value) {
		return [];
	}

	try {
		const parsed = JSON.parse(value);

		if (Array.isArray(parsed)) {
			return parsed.filter((item): item is string => typeof item === "string");
		}
	} catch (err) {
		console.error("Failed to parse JSON array:", err, value);
	}

	return [];
}

/* ============================================================================
   PARSE CUSTOMIZATION REQUIREMENTS

   Ported as-is from ProductCard so the product page and the shop
   grid card always agree on the same customize_reqs formats:

   1. text:10:Enter your custom name
   2. photo:Upload Photo
   3. photos:5:Upload Photos

   Also supports the older format:

   4. key:text:10:Enter your custom name
   5. key:photo:1:Upload Photo
   6. key:photos:5:Upload Photos
============================================================================ */

function parseCustomizeRequirements(
	value?: string | string[] | null,
): CustomizeRequirement[] {
	if (!value) {
		return [];
	}

	let parsed: unknown;

	if (Array.isArray(value)) {
		parsed = value;
	} else {
		try {
			parsed = JSON.parse(value);
		} catch (error) {
			console.error("Failed to parse customize_reqs:", value, error);
			return [];
		}
	}

	if (!Array.isArray(parsed)) {
		return [];
	}

	return parsed
		.map((requirement): CustomizeRequirement | null => {
			if (typeof requirement !== "string") {
				return null;
			}

			const parts = requirement.split(":").map((part) => part.trim());

			if (parts.length < 2) {
				return null;
			}

			let key = "";
			let type: "text" | "photo" | "photos";
			let max = 1;
			let placeholder = "";

			if (
				parts[0] === "text" ||
				parts[0] === "photo" ||
				parts[0] === "photos"
			) {
				type = parts[0];

				if (type === "photo") {
					key = "photo";
					max = 1;
					placeholder = parts.slice(1).join(":").trim();
				} else {
					const possibleMax = Number(parts[1]);

					if (Number.isFinite(possibleMax) && possibleMax >= 1) {
						max = possibleMax;
						placeholder = parts.slice(2).join(":").trim();
					} else {
						max = type === "text" ? 100 : 1;
						placeholder = parts.slice(1).join(":").trim();
					}

					key =
						type === "text"
							? `text_${placeholder
									.toLowerCase()
									.replace(/[^a-z0-9]+/g, "_")
									.slice(0, 30)}`
							: `photos_${placeholder
									.toLowerCase()
									.replace(/[^a-z0-9]+/g, "_")
									.slice(0, 30)}`;
				}
			} else if (
				parts.length >= 3 &&
				(parts[1] === "text" || parts[1] === "photo" || parts[1] === "photos")
			) {
				key = parts[0];
				type = parts[1];

				const possibleMax = Number(parts[2]);

				if (Number.isFinite(possibleMax) && possibleMax >= 1) {
					max = possibleMax;
					placeholder = parts.slice(3).join(":").trim();
				} else {
					max = type === "photo" ? 1 : 100;
					placeholder = parts.slice(2).join(":").trim();
				}
			} else {
				return null;
			}

			if (!placeholder) {
				return null;
			}

			const optional = /\(\s*optional\s*\)/i.test(placeholder);

			const cleanPlaceholder = placeholder
				.replace(/\s*\(\s*optional\s*\)/i, "")
				.trim();

			return {
				key,
				type,
				max,
				placeholder: cleanPlaceholder,
				optional,
			};
		})
		.filter((item): item is CustomizeRequirement => item !== null);
}

/* ============================================================================
   NORMALIZE PRODUCT
============================================================================ */

function normalizeProduct(raw: RawProduct): Product {
	const id = String(raw.id ?? "");

	const primaryImage = getProductImage(raw.primary_photo_path);

	const otherImages = parseJsonArray(raw.other_photos_paths)
		.map((path) => getProductImage(path))
		.filter((path): path is string => Boolean(path));

	const images = [primaryImage, ...otherImages].filter((img): img is string =>
		Boolean(img),
	);

	return {
		id,
		name: raw.name ?? "Untitled product",
		description: raw.description ?? "",
		sellingPrice: toNumber(raw.selling_price, 0),
		marketPrice: toNumber(raw.market_price, 0),
		delivery: toNumber(raw.delivery, 0),
		inStock: (raw.in_stock ?? "available").toLowerCase() === "available",
		sold: toNumber(raw.sold, 0),
		images,
		customizeReqs: raw.customize_reqs ?? null,
		options: Array.isArray(raw.options) ? raw.options : undefined,
		noCustomization:
			raw.no_customization === true ||
			String(raw.no_customization ?? "").toLowerCase() === "true" ||
			String(raw.no_customization ?? "").toLowerCase() === "yes",
	};
}

/* ============================================================================
   PRODUCT PAGE
============================================================================ */

export default function ProductPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();

	const productId = params?.id;

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [activeImage, setActiveImage] = useState(0);

	/* =====================================================
	   CUSTOMIZATION (mirrors ProductCard)
	===================================================== */

	const [customizationValues, setCustomizationValues] = useState<
		Record<string, string>
	>({});

	const [customizationFiles, setCustomizationFiles] = useState<
		Record<string, File[]>
	>({});

	const [customizationValidationError, setCustomizationValidationError] =
		useState("");

	const [rawOrder, setRawOrder] = useState(false);

	const [selectedOption, setSelectedOption] = useState("");

	const [addingToCart, setAddingToCart] = useState(false);
	const [addError, setAddError] = useState("");
	const [addedToCart, setAddedToCart] = useState(false);

	/* =====================================================
	   REVIEWS
	===================================================== */

	const [reviews, setReviews] = useState<Review[]>([]);
	const [reviewsLoading, setReviewsLoading] = useState(true);
	const [reviewsError, setReviewsError] = useState("");

	const customizeRequirements = useMemo(
		() => parseCustomizeRequirements(product?.customizeReqs),
		[product?.customizeReqs],
	);

	const hasOptions =
		!!product &&
		!product.noCustomization &&
		Array.isArray(product.options) &&
		product.options.length > 0;

	const hasCustomization =
		!!product &&
		!product.noCustomization &&
		(customizeRequirements.length > 0 || hasOptions);

	/* ==========================================================================
	   FETCH PRODUCT
	========================================================================== */

	const fetchProduct = async () => {
		if (!productId) {
			return;
		}

		setLoading(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("product_id", String(productId));

			const response = await fetch(`/api/product/${productId}`, {
				method: "POST",
				credentials: "include",
				cache: "no-store",
				body: formData,
			});

			const data: ProductResponse = await response.json().catch(() => ({}));

			console.log("PRODUCT RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to load this product.");
			}

			const rawProduct = data.result ?? data.product ?? data.data ?? data;

			const normalized = normalizeProduct(rawProduct);

			console.log("NORMALIZED PRODUCT:", normalized);

			setProduct(normalized);
			setActiveImage(0);
			resetCustomization();
		} catch (err) {
			console.error("Fetch product failed:", err);

			setError(
				err instanceof Error ? err.message : "Unable to load this product.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProduct();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId]);

	/* ==========================================================================
	   FETCH REVIEWS
	========================================================================== */

	const fetchReviews = async () => {
		if (!productId) {
			return;
		}

		setReviewsLoading(true);
		setReviewsError("");

		try {
			const formData = new FormData();
			formData.append("product_id", String(productId));

			const response = await fetch("/api/reviews", {
				method: "POST",
				credentials: "include",
				cache: "no-store",
				body: formData,
			});

			const data: RawReviewsResponse = await response.json().catch(() => ({}));

			console.log("REVIEWS RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to load reviews.");
			}

			const rawReviews = data.reviews ?? data.result ?? data.data ?? [];

			const normalized = rawReviews.map((raw, index) =>
				normalizeReview(raw, index),
			);

			console.log("NORMALIZED REVIEWS:", normalized);

			setReviews(normalized);
		} catch (err) {
			console.error("Fetch reviews failed:", err);

			setReviewsError(
				err instanceof Error ? err.message : "Unable to load reviews.",
			);
		} finally {
			setReviewsLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId]);

	/* ==========================================================================
	   PRICE
	========================================================================== */

	const discountPercent = useMemo(() => {
		if (!product || product.marketPrice <= product.sellingPrice) {
			return 0;
		}

		return Math.round(
			((product.marketPrice - product.sellingPrice) / product.marketPrice) *
				100,
		);
	}, [product]);

	const averageRating = useMemo(() => {
		if (reviews.length === 0) {
			return 0;
		}

		return (
			reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
		);
	}, [reviews]);

	/* ==========================================================================
	   IMAGE NAVIGATION
	========================================================================== */

	const showPreviousImage = () => {
		if (!product || product.images.length <= 1) return;
		setActiveImage((current) =>
			current === 0 ? product.images.length - 1 : current - 1,
		);
	};

	const showNextImage = () => {
		if (!product || product.images.length <= 1) return;
		setActiveImage((current) =>
			current === product.images.length - 1 ? 0 : current + 1,
		);
	};

	/* =====================================================
	   RESET CUSTOMIZATION
	===================================================== */

	const resetCustomization = () => {
		setCustomizationValues({});
		setCustomizationFiles({});
		setCustomizationValidationError("");
		setSelectedOption("");
		setRawOrder(false);
	};

	/* =====================================================
	   TOGGLE RAW ORDER
	===================================================== */

	const handleToggleRawOrder = () => {
		setCustomizationValidationError("");
		setRawOrder((previous) => !previous);
	};

	/* =====================================================
	   TEXT CHANGE
	===================================================== */

	const handleTextChange = (key: string, value: string, max: number) => {
		setCustomizationValues((previous) => ({
			...previous,
			[key]: value.slice(0, max),
		}));

		setCustomizationValidationError("");
	};

	/* =====================================================
	   SINGLE PHOTO
	===================================================== */

	const handleSinglePhotoChange = (
		requirement: CustomizeRequirement,
		file: File | undefined,
	) => {
		if (!file) return;

		setCustomizationValidationError("");

		if (!file.type.startsWith("image/")) {
			setCustomizationValidationError(
				`${requirement.placeholder}: Please select an image file.`,
			);
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			setCustomizationValidationError(
				`${requirement.placeholder}: Image must be 10 MB or smaller.`,
			);
			return;
		}

		setCustomizationFiles((previous) => ({
			...previous,
			[requirement.key]: [file],
		}));
	};

	/* =====================================================
	   MULTIPLE PHOTOS

	   This is the piece the product page was missing — a
	   "photos" requirement (unlike "photo") allows the buyer
	   to pick several images, up to requirement.max, each
	   validated for type and size, all stored under the same
	   field key as a File[].
	===================================================== */

	const handleMultiplePhotoChange = (
		requirement: CustomizeRequirement,
		fileList: FileList | null,
	) => {
		if (!fileList) return;

		setCustomizationValidationError("");

		const selectedFiles = Array.from(fileList);

		if (selectedFiles.length > requirement.max) {
			setCustomizationValidationError(
				`${requirement.placeholder}: Please select up to ${requirement.max} photos.`,
			);
			return;
		}

		const invalidFile = selectedFiles.find(
			(file) => !file.type.startsWith("image/"),
		);

		if (invalidFile) {
			setCustomizationValidationError(
				`${requirement.placeholder}: Only image files are allowed.`,
			);
			return;
		}

		const oversizedFile = selectedFiles.find(
			(file) => file.size > MAX_FILE_SIZE,
		);

		if (oversizedFile) {
			setCustomizationValidationError(
				`${requirement.placeholder}: Each image must be 10 MB or smaller.`,
			);
			return;
		}

		setCustomizationFiles((previous) => ({
			...previous,
			[requirement.key]: selectedFiles,
		}));
	};

	/* =====================================================
	   REMOVE PHOTO
	===================================================== */

	const removePhoto = (key: string, index: number) => {
		setCustomizationFiles((previous) => ({
			...previous,
			[key]: (previous[key] || []).filter(
				(_, fileIndex) => fileIndex !== index,
			),
		}));
	};

	/* =====================================================
	   VALIDATE CUSTOMIZATION
	===================================================== */

	const validateCustomization = (): boolean => {
		if (hasOptions && !selectedOption.trim()) {
			setCustomizationValidationError("Please select an option.");
			return false;
		}

		for (const requirement of customizeRequirements) {
			if (requirement.type === "text") {
				const value = customizationValues[requirement.key]?.trim() || "";

				if (!requirement.optional && !value) {
					setCustomizationValidationError(
						`${requirement.placeholder} is required.`,
					);
					return false;
				}

				if (value.length > requirement.max) {
					setCustomizationValidationError(
						`${requirement.placeholder}: Maximum ${requirement.max} characters allowed.`,
					);
					return false;
				}
			}

			if (requirement.type === "photo") {
				const files = customizationFiles[requirement.key] || [];

				if (!requirement.optional && files.length === 0) {
					setCustomizationValidationError(
						`${requirement.placeholder} is required.`,
					);
					return false;
				}
			}

			if (requirement.type === "photos") {
				const files = customizationFiles[requirement.key] || [];

				if (!requirement.optional && files.length === 0) {
					setCustomizationValidationError(
						`${requirement.placeholder} is required.`,
					);
					return false;
				}

				if (files.length > requirement.max) {
					setCustomizationValidationError(
						`${requirement.placeholder}: Maximum ${requirement.max} photos allowed.`,
					);
					return false;
				}
			}
		}

		return true;
	};

	/* ==========================================================================
	   ADD TO CART (customized / option-based)

	   Text fields append directly, single photo appends under its
	   key, multiple photos append under "key[]" — same shape
	   ProductCard sends.
	========================================================== */

	const addToCart = async (
		values: Record<string, string>,
		files: Record<string, File[]>,
		option?: string,
	) => {
		if (!product || !product.inStock || addingToCart) {
			return;
		}

		setAddError("");
		setAddingToCart(true);
		setAddedToCart(false);

		try {
			const formData = new FormData();

			formData.append("product_id", product.id);

			if (!product.noCustomization && option?.trim()) {
				formData.append("option", option.trim());
			}

			if (!product.noCustomization) {
				Object.entries(values).forEach(([key, value]) => {
					const trimmedValue = value.trim();
					if (trimmedValue) {
						formData.append(key, trimmedValue);
					}
				});

				Object.entries(files).forEach(([key, fileList]) => {
					if (!fileList.length) return;

					if (fileList.length === 1) {
						formData.append(key, fileList[0]);
						return;
					}

					fileList.forEach((file) => {
						formData.append(`${key}[]`, file);
					});
				});
			}

			const response = await fetch("/api/cart/add", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const data = await response.json().catch(() => ({}));

			console.log("ADD TO CART RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to add this to your cart.");
			}

			setAddedToCart(true);
			resetCustomization();

			setTimeout(() => setAddedToCart(false), 1800);
		} catch (err) {
			console.error("Add to cart failed:", err);

			setAddError(
				err instanceof Error ? err.message : "Unable to add this to your cart.",
			);
		} finally {
			setAddingToCart(false);
		}
	};

	/* ==========================================================================
	   ADD TO CART (raw / no customization)
	========================================================== */

	const addRawToCart = async () => {
		if (!product || !product.inStock || addingToCart) {
			return;
		}

		setAddError("");
		setAddingToCart(true);
		setAddedToCart(false);

		try {
			const formData = new FormData();
			formData.append("product_id", product.id);
			formData.append("customize", "raw");

			const response = await fetch("/api/cart/add", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const data = await response.json().catch(() => ({}));

			console.log("ADD TO CART (RAW) RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to add this to your cart.");
			}

			setAddedToCart(true);
			resetCustomization();

			setTimeout(() => setAddedToCart(false), 1800);
		} catch (err) {
			console.error("Add to cart failed:", err);

			setAddError(
				err instanceof Error ? err.message : "Unable to add this to your cart.",
			);
		} finally {
			setAddingToCart(false);
		}
	};

	/* =====================================================
	   HANDLE ADD TO CART
	===================================================== */

	const handleAddToCart = async () => {
		if (!product || !product.inStock || addingToCart) {
			return;
		}

		setAddError("");
		setCustomizationValidationError("");

		if (product.noCustomization) {
			await addToCart({}, {});
			return;
		}

		if (!hasCustomization) {
			await addToCart({}, {});
			return;
		}

		if (rawOrder) {
			await addRawToCart();
			return;
		}

		const valid = validateCustomization();
		if (!valid) return;

		await addToCart(customizationValues, customizationFiles, selectedOption);
	};

	/* ==========================================================================
	   LOADING
	========================================================================== */

	if (loading) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-12">
					<div className="flex flex-col items-center gap-3">
						<span className="h-8 w-8 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
						<p className="text-sm text-[#2E2E2E]/50">Loading product...</p>
					</div>
				</div>
			</main>
		);
	}

	/* ==========================================================================
	   ERROR / NOT FOUND
	========================================================================== */

	if (error || !product) {
		return (
			<main className="min-h-screen bg-[#FBF9F7] pt-[112px] sm:pt-[120px]">
				<div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-12">
					<div className="w-full rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
							<AlertCircle
								size={32}
								className="text-red-500"
								strokeWidth={1.7}
							/>
						</div>

						<h1 className="mt-6 text-2xl font-bold text-[#2E2E2E]">
							Couldn't load this product
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							{error || "This product doesn't seem to exist."}
						</p>

						<div className="mt-7 flex items-center justify-center gap-3">
							<button
								type="button"
								onClick={fetchProduct}
								className="inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#721318]"
							>
								Try Again
							</button>

							<Link
								href="/shop"
								className="inline-flex items-center gap-2 rounded-xl border border-[#DED6D0] px-6 py-3.5 text-sm font-semibold text-[#2E2E2E]/70 transition hover:border-[#85161B]/30 hover:text-[#85161B]"
							>
								Back to Shop
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	const heroImage = product.images[activeImage];

	return (
		<main className="min-h-screen bg-[#FBF9F7] pt-[112px] sm:pt-[120px]">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');

				.font-display {
					font-family: 'Fraunces', Georgia, serif;
					font-optical-sizing: auto;
				}
			`}</style>

			<section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
				<button
					type="button"
					onClick={() => router.back()}
					className="mb-7 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
				>
					<ArrowLeft size={16} />
					Back
				</button>

				<div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
					{/* =====================================================
					    GALLERY
					===================================================== */}

					<div>
						<div className="group relative aspect-square overflow-hidden rounded-3xl border border-[#E8DED7] bg-white">
							{heroImage ? (
								<img
									src={heroImage}
									alt={product.name}
									className="h-full w-full object-cover"
									onError={(event) => {
										event.currentTarget.style.display = "none";
									}}
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center">
									<ShoppingBag size={40} className="text-[#85161B]/25" />
								</div>
							)}

							{product.images.length > 1 && (
								<button
									type="button"
									aria-label="Previous image"
									onClick={showPreviousImage}
									className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2E2E2E] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#85161B]"
								>
									<ArrowLeft size={18} />
								</button>
							)}

							{product.images.length > 1 && (
								<button
									type="button"
									aria-label="Next image"
									onClick={showNextImage}
									className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2E2E2E] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#85161B]"
								>
									<ArrowRight size={18} />
								</button>
							)}

							{product.images.length > 1 && (
								<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
									{activeImage + 1} / {product.images.length}
								</div>
							)}
						</div>

						{product.images.length > 1 && (
							<div className="mt-4 flex gap-3 overflow-x-auto pb-1">
								{product.images.map((img, index) => (
									<button
										key={img + index}
										type="button"
										aria-label={`View image ${index + 1}`}
										onClick={() => setActiveImage(index)}
										className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
											activeImage === index
												? "border-[#85161B] opacity-100 shadow-sm"
												: "border-[#E8DED7] opacity-65 hover:opacity-100"
										}`}
									>
										<img
											src={img}
											alt={`${product.name} ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* =====================================================
					    DETAILS
					===================================================== */}

					<div>
						<div className="flex flex-wrap items-center gap-2">
							{product.inStock ? (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF8F0] px-3 py-1 text-[11px] font-semibold text-[#31824A]">
									<CheckCircle2 size={12} />
									In Stock
								</span>
							) : (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600">
									<PackageX size={12} />
									Out of Stock
								</span>
							)}

							{product.sold > 0 && (
								<span className="text-[11px] text-[#2E2E2E]/40">
									{product.sold}+ sold
								</span>
							)}

							{!reviewsLoading && reviews.length > 0 && (
								<a
									href="#reviews"
									className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2E2E2E]/55 transition hover:text-[#85161B]"
								>
									<Star size={12} className="fill-[#F5A623] text-[#F5A623]" />
									{averageRating.toFixed(1)} ({reviews.length})
								</a>
							)}
						</div>

						<h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-[#2E2E2E] sm:text-4xl">
							{product.name}
						</h1>

						{product.description && (
							<p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#2E2E2E]/60">
								{product.description}
							</p>
						)}

						<div className="mt-6 flex flex-wrap items-end gap-3">
							<span className="text-3xl font-bold text-[#85161B]">
								₹{product.sellingPrice.toFixed(2)}
							</span>

							{product.marketPrice > product.sellingPrice && (
								<>
									<span className="text-base text-[#2E2E2E]/35 line-through">
										₹{product.marketPrice.toFixed(2)}
									</span>

									<span className="rounded-full bg-[#F7D6BF]/50 px-2.5 py-1 text-[11px] font-semibold text-[#85161B]">
										{discountPercent}% off
									</span>
								</>
							)}
						</div>

						{product.delivery > 0 && (
							<p className="mt-2 flex items-center gap-1.5 text-xs text-[#2E2E2E]/45">
								<Truck size={13} />
								Delivery ₹{product.delivery.toFixed(2)}
							</p>
						)}

						{/* ==========================================================================
						    PERSONALIZATION TICKET
						========================================================================== */}

						{hasCustomization && (
							<div className="relative mt-8 rounded-2xl border-2 border-dashed border-[#D9BBAE] bg-[#FFFBF8] p-6">
								<div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-dashed border-[#D9BBAE] bg-[#FBF9F7]" />

								<p className="font-display text-sm font-semibold uppercase tracking-[0.20em] text-[#85161B] sm:text-[15px]">
									Personalization Ticket
								</p>

								<p className="mt-2 text-[13px] leading-6 text-[#2E2E2E]/55">
									Tell us how to make this one yours.
								</p>

								{/* RAW ORDER TOGGLE */}

								<div className="mt-5 rounded-xl border border-[#DED6D0] bg-white p-4">
									<label className="flex cursor-pointer items-start gap-3">
										<input
											type="checkbox"
											checked={rawOrder}
											onChange={handleToggleRawOrder}
											className="mt-0.5 h-4 w-4 accent-[#85161B]"
										/>

										<div className="min-w-0">
											<span className="text-sm font-semibold text-[#202020]">
												No customization — send raw product
											</span>
											<p className="mt-1 text-xs text-black/45">
												Skip personalization and receive the plain product
												as-is.
											</p>
										</div>
									</label>

									{rawOrder && (
										<div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
											<AlertTriangle
												size={14}
												strokeWidth={2}
												className="mt-0.5 shrink-0 text-amber-600"
											/>
											<p className="text-[11px] leading-[1.5] text-amber-800">
												A raw product will be delivered without any
												customization applied — preferably suited for resellers.
											</p>
										</div>
									)}
								</div>

								{!rawOrder && (
									<div className="mt-6 space-y-6">
										{/* OPTION */}

										{hasOptions && (
											<div>
												<label
													htmlFor={`option-${product.id}`}
													className="mb-2.5 flex items-center justify-between gap-3"
												>
													<span className="text-sm font-semibold text-[#2E2E2E]">
														Select option
													</span>
													<span className="text-[10px] font-semibold text-[#85161B]">
														Required
													</span>
												</label>

												<div className="relative">
													<select
														id={`option-${product.id}`}
														value={selectedOption}
														onChange={(e) => {
															setSelectedOption(e.target.value);
															setCustomizationValidationError("");
														}}
														className="w-full appearance-none rounded-xl border border-[#DED6D0] bg-white px-4 py-3 pr-10 text-sm text-[#2E2E2E] outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
													>
														<option value="">Select an option</option>
														{product.options?.map((option, index) => (
															<option key={`${option}-${index}`} value={option}>
																{option}
															</option>
														))}
													</select>

													<ChevronDown
														size={17}
														className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
													/>
												</div>
											</div>
										)}

										{/* CUSTOMIZATION REQUIREMENTS */}

										{customizeRequirements.map((requirement) => {
											const textValue =
												customizationValues[requirement.key] || "";

											const files = customizationFiles[requirement.key] || [];

											return (
												<div key={requirement.key}>
													<div className="mb-2.5 flex items-center justify-between gap-3">
														<label className="text-sm font-semibold leading-5 text-[#2E2E2E]">
															{requirement.placeholder}
															{!requirement.optional && (
																<span className="ml-1 text-[#85161B]">*</span>
															)}
														</label>

														{requirement.type === "text" && (
															<span className="shrink-0 text-[11px] font-medium text-[#2E2E2E]/40">
																{textValue.length}/{requirement.max}
															</span>
														)}
													</div>

													{/* TEXT */}

													{requirement.type === "text" && (
														<input
															type="text"
															value={textValue}
															maxLength={requirement.max}
															onChange={(e) =>
																handleTextChange(
																	requirement.key,
																	e.target.value,
																	requirement.max,
																)
															}
															placeholder={`Enter ${requirement.placeholder.toLowerCase()}`}
															className="w-full rounded-xl border border-[#DED6D0] bg-white px-3.5 py-3 text-sm text-[#2E2E2E] outline-none transition placeholder:text-[#2E2E2E]/30 focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
														/>
													)}

													{/* SINGLE PHOTO */}

													{requirement.type === "photo" && (
														<div>
															<label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DED6D0] bg-white px-4 py-3 text-sm font-medium text-[#2E2E2E]/60 transition hover:border-[#85161B]/40 hover:text-[#85161B]">
																<Upload size={15} />
																<span className="max-w-[80%] truncate">
																	{files[0] ? files[0].name : "Choose a photo"}
																</span>
																<input
																	type="file"
																	accept="image/*"
																	className="hidden"
																	onChange={(e) =>
																		handleSinglePhotoChange(
																			requirement,
																			e.target.files?.[0],
																		)
																	}
																/>
															</label>

															{files.length > 0 && (
																<div className="mt-2 flex items-center justify-between rounded-lg bg-[#F7F4F1] px-3 py-2">
																	<span className="max-w-[80%] truncate text-xs text-black/65">
																		{files[0].name}
																	</span>
																	<button
																		type="button"
																		onClick={() =>
																			removePhoto(requirement.key, 0)
																		}
																		className="text-black/35 transition hover:text-red-600"
																	>
																		<Trash2 size={15} />
																	</button>
																</div>
															)}
														</div>
													)}

													{/* MULTIPLE PHOTOS — the piece that was missing */}

													{requirement.type === "photos" && (
														<div>
															<label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#DED6D0] bg-white px-4 py-6 text-center transition hover:border-[#85161B]/50 hover:bg-[#85161B]/[0.02]">
																<Upload size={18} className="text-[#85161B]" />
																<span className="text-sm font-medium text-[#2E2E2E]">
																	Select photos
																</span>
																<span className="text-[10px] text-black/40">
																	Up to {requirement.max} photos • Each max 10
																	MB
																</span>
																<input
																	type="file"
																	accept="image/*"
																	multiple
																	className="hidden"
																	onChange={(e) =>
																		handleMultiplePhotoChange(
																			requirement,
																			e.target.files,
																		)
																	}
																/>
															</label>

															{files.length > 0 && (
																<div className="mt-3 space-y-2">
																	{files.map((file, index) => (
																		<div
																			key={`${file.name}-${file.lastModified}-${index}`}
																			className="flex items-center justify-between rounded-lg bg-[#F7F4F1] px-3 py-2"
																		>
																			<span className="max-w-[80%] truncate text-xs text-black/65">
																				{file.name}
																			</span>
																			<button
																				type="button"
																				onClick={() =>
																					removePhoto(requirement.key, index)
																				}
																				className="text-black/35 transition hover:text-red-600"
																			>
																				<Trash2 size={15} />
																			</button>
																		</div>
																	))}
																</div>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}

								{customizationValidationError && (
									<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-600">
										{customizationValidationError}
									</div>
								)}
							</div>
						)}

						{/* ==========================================================================
						    ADD TO CART
						========================================================================== */}

						<div className="mt-8">
							<button
								type="button"
								disabled={!product.inStock || addingToCart}
								onClick={handleAddToCart}
								className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
							>
								{addingToCart ? (
									<>
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										Adding...
									</>
								) : addedToCart ? (
									<>
										<CheckCircle2 size={17} />
										Added to Cart
									</>
								) : (
									<>
										<ShoppingBag size={17} />
										{hasCustomization ? "Customize & Add" : "Add to Cart"}
										<ArrowRight
											size={15}
											className="transition-transform group-hover:translate-x-1"
										/>
									</>
								)}
							</button>
						</div>

						{addError && (
							<p className="mt-3 text-xs font-medium text-red-600">
								{addError}
							</p>
						)}

						<div className="mt-7 space-y-3">
							<div className="flex items-center gap-2.5 text-[13px] font-medium text-[#2E2E2E]/55">
								<ShieldCheck size={16} className="shrink-0 text-[#85161B]" />
								<span>Secure checkout · Made to order</span>
							</div>

							<p className="flex items-start gap-2.5 text-[13px] leading-6 text-[#2E2E2E]/50">
								<ShieldCheck
									size={15}
									className="mt-0.5 shrink-0 text-[#85161B]"
								/>
								<span>
									Your photos are used only for your order and deleted after
									processing.
								</span>
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ==========================================================================
			    REVIEWS
			========================================================================== */}

			<section
				id="reviews"
				className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8"
			>
				<div className="rounded-3xl border border-[#E8DED7] bg-white p-6 sm:p-8">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="font-display text-2xl font-semibold text-[#2E2E2E]">
								Customer Reviews
							</h2>

							{!reviewsLoading && !reviewsError && reviews.length > 0 && (
								<div className="mt-2 flex items-center gap-2">
									<StarRating rating={averageRating} />
									<span className="text-sm font-semibold text-[#2E2E2E]">
										{averageRating.toFixed(1)}
									</span>
									<span className="text-sm text-[#2E2E2E]/45">
										· {reviews.length} review
										{reviews.length === 1 ? "" : "s"}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* LOADING */}

					{reviewsLoading && (
						<div className="mt-8 flex items-center justify-center gap-3 py-10">
							<span className="h-6 w-6 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
							<p className="text-sm text-[#2E2E2E]/50">Loading reviews...</p>
						</div>
					)}

					{/* ERROR */}

					{!reviewsLoading && reviewsError && (
						<div className="mt-8 flex flex-col items-center gap-3 py-10 text-center">
							<AlertCircle size={24} className="text-red-500" />
							<p className="text-sm text-[#2E2E2E]/55">{reviewsError}</p>
							<button
								type="button"
								onClick={fetchReviews}
								className="rounded-lg border border-[#DED6D0] px-4 py-2 text-xs font-semibold text-[#2E2E2E]/70 transition hover:border-[#85161B]/30 hover:text-[#85161B]"
							>
								Try Again
							</button>
						</div>
					)}

					{/* EMPTY */}

					{!reviewsLoading && !reviewsError && reviews.length === 0 && (
						<div className="mt-8 flex flex-col items-center gap-3 py-10 text-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7D6BF]/40">
								<MessageSquare size={22} className="text-[#85161B]" />
							</div>
							<p className="text-sm text-[#2E2E2E]/55">
								No reviews yet for this product.
							</p>
						</div>
					)}

					{/* LIST */}

					{/* LIST */}
					{!reviewsLoading && !reviewsError && reviews.length > 0 && (
						<div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
							{reviews.map((review) => (
								<div
									key={review.id}
									className="flex h-full flex-col rounded-2xl border border-[#E8DED7] bg-[#FFFCFA] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D9C8BE] hover:shadow-[0_10px_30px_rgba(80,40,20,0.06)]"
								>
									{/* HEADER */}
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 items-center gap-3">
											{/* Avatar */}
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF]/50 text-xs font-bold text-[#85161B]">
												{review.name
													.split(" ")
													.map((part) => part[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</div>

											{/* Name + Rating */}
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-[#2E2E2E]">
													{review.name}
												</p>

												<div className="mt-1">
													<StarRating rating={review.rating} size={12} />
												</div>
											</div>
										</div>

										{/* DATE */}
										{review.date && (
											<span className="shrink-0 text-[11px] text-[#2E2E2E]/40">
												{review.date}
											</span>
										)}
									</div>

									{/* REVIEW TEXT */}
									{review.comment && (
										<p className="mt-4 line-clamp-4 text-sm leading-6 text-[#2E2E2E]/65">
											{review.comment}
										</p>
									)}

									{/* REVIEW PHOTOS */}
									{review.photos.length > 0 && (
										<div className="mt-4 grid grid-cols-3 gap-2">
											{review.photos.map((photo, index) => (
												<a
													key={`${photo}-${index}`}
													href={`${REVIEW_IMAGE_URL}${photo}`}
													target="_blank"
													rel="noreferrer"
													className="group aspect-square overflow-hidden rounded-xl border border-[#E8DED7] bg-white"
												>
													<img
														src={`${REVIEW_IMAGE_URL}${photo}`}
														alt={`Review photo ${index + 1}`}
														className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
													/>
												</a>
											))}
										</div>
									)}

									{/* FOOTER */}
									<div className="mt-auto pt-4">
										<div className="border-t border-[#EEE6E1] pt-3">
											<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#2E2E2E]/40">
												<CheckCircle2 size={12} className="text-[#31824A]" />
												Verified customer
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</section>
		</main>
	);
}

/* ============================================================================
   STAR RATING
============================================================================ */

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
	const rounded = Math.round(rating);

	return (
		<div
			className="flex items-center gap-0.5"
			aria-label={`${rating} out of 5 stars`}
		>
			{Array.from({ length: 5 }).map((_, index) => (
				<Star
					key={index}
					size={size}
					className={
						index < rounded
							? "fill-[#F5A623] text-[#F5A623]"
							: "fill-transparent text-[#2E2E2E]/20"
					}
				/>
			))}
		</div>
	);
}
