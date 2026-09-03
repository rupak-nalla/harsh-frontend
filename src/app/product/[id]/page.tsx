
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
    Camera,
    Upload,
    CheckCircle2,
    PackageX,
} from "lucide-react";

/* ============================================================================
   CONSTANTS
============================================================================ */

const PRODUCT_IMAGE_BASE_URL =
    "https://printinghouseujjain.in/assets/products/";

/* ============================================================================
   TYPES
============================================================================ */

type CustomizationFieldType = "text" | "photo";

type CustomizationField = {
    key: string;
    type: CustomizationFieldType;
    label: string;
    maxLength?: number;
    required: boolean;
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
    customizationFields: CustomizationField[];
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
    customize_reqs?: string;
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

    if (
        photoPath.startsWith("http://") ||
        photoPath.startsWith("https://")
    ) {
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
            return parsed.filter(
                (item): item is string => typeof item === "string",
            );
        }
    } catch (err) {
        console.error("Failed to parse JSON array:", err, value);
    }

    return [];
}

/* ============================================================================
   CUSTOMIZATION PARSER
============================================================================ */

function parseCustomizationField(
    raw: string,
): CustomizationField | null {
    const parts = raw.split(":");

    if (parts.length < 2) {
        return null;
    }

    const key = parts[0];
    const type = parts[1] as CustomizationFieldType;

    let maxLength: number | undefined;
    let label: string;

    if (type === "text") {
        const maybeLength = Number(parts[2]);

        if (Number.isFinite(maybeLength) && parts.length > 3) {
            maxLength = maybeLength;
            label = parts.slice(3).join(":");
        } else {
            label = parts.slice(2).join(":");
        }
    } else {
        label = parts.slice(2).join(":");
    }

    label = label.trim() || key;

    return {
        key,
        type: type === "photo" ? "photo" : "text",
        label,
        maxLength,
        required: !label.toLowerCase().includes("optional"),
    };
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

    const images = [primaryImage, ...otherImages].filter(
        (img): img is string => Boolean(img),
    );

    const customizationFields = parseJsonArray(raw.customize_reqs)
        .map(parseCustomizationField)
        .filter(
            (field): field is CustomizationField => field !== null,
        );

    return {
        id,
        name: raw.name ?? "Untitled product",
        description: raw.description ?? "",
        sellingPrice: toNumber(raw.selling_price, 0),
        marketPrice: toNumber(raw.market_price, 0),
        delivery: toNumber(raw.delivery, 0),
        inStock:
            (raw.in_stock ?? "available").toLowerCase() === "available",
        sold: toNumber(raw.sold, 0),
        images,
        customizationFields,
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

    const [customValues, setCustomValues] = useState<
        Record<string, string>
    >({});

    const [customFiles, setCustomFiles] = useState<
        Record<string, File | null>
    >({});

    const [addingToCart, setAddingToCart] = useState(false);
    const [addError, setAddError] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);

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

            const data: ProductResponse = await response
                .json()
                .catch(() => ({}));

            console.log("PRODUCT RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Unable to load this product.",
                );
            }

            const rawProduct =
                data.result ??
                data.product ??
                data.data ??
                data;

            const normalized = normalizeProduct(rawProduct);

            console.log("NORMALIZED PRODUCT:", normalized);

            setProduct(normalized);
            setActiveImage(0);
            setCustomValues({});
            setCustomFiles({});
        } catch (err) {
            console.error("Fetch product failed:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load this product.",
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
       PRICE
    ========================================================================== */

    const discountPercent = useMemo(() => {
        if (!product || product.marketPrice <= product.sellingPrice) {
            return 0;
        }

        return Math.round(
            ((product.marketPrice - product.sellingPrice) /
                product.marketPrice) *
                100,
        );
    }, [product]);

    /* ==========================================================================
       IMAGE NAVIGATION
    ========================================================================== */

    const showPreviousImage = () => {
        if (!product || product.images.length <= 1) {
            return;
        }

        setActiveImage((current) =>
            current === 0
                ? product.images.length - 1
                : current - 1,
        );
    };

    const showNextImage = () => {
        if (!product || product.images.length <= 1) {
            return;
        }

        setActiveImage((current) =>
            current === product.images.length - 1
                ? 0
                : current + 1,
        );
    };

    /* ==========================================================================
       CUSTOMIZATION
    ========================================================================== */

    const handleTextFieldChange = (
        field: CustomizationField,
        value: string,
    ) => {
        setCustomValues((previous) => ({
            ...previous,
            [field.key]: field.maxLength
                ? value.slice(0, field.maxLength)
                : value,
        }));
    };

    const handlePhotoFieldChange = (
        field: CustomizationField,
        file: File | null,
    ) => {
        setCustomFiles((previous) => ({
            ...previous,
            [field.key]: file,
        }));
    };

    /* ==========================================================================
       REQUIRED FIELD VALIDATION
    ========================================================================== */

    const missingRequiredField = useMemo(() => {
        if (!product) {
            return null;
        }

        return product.customizationFields.find((field) => {
            if (!field.required) {
                return false;
            }

            if (field.type === "photo") {
                return !customFiles[field.key];
            }

            return !(customValues[field.key] ?? "").trim();
        });
    }, [product, customValues, customFiles]);

    /* ==========================================================================
       ADD TO CART
    ========================================================================== */

    const handleAddToCart = async () => {
			if (!product || !product.inStock || addingToCart) {
				return;
			}

			if (missingRequiredField) {
				setAddError(`Please fill in "${missingRequiredField.label}" first.`);
				return;
			}

			setAddingToCart(true);
			setAddError("");
			setAddedToCart(false);

			try {
				const formData = new FormData();

				// Only product ID
				formData.append("product_id", product.id);

				// Send only what the user entered/uploaded
				for (const field of product.customizationFields) {
					if (field.type === "photo") {
						const file = customFiles[field.key];

						if (file) {
							formData.append(field.key, file);
						}

						continue;
					}

					const value = (customValues[field.key] ?? "").trim();

					// Only send text if the user actually entered something
					if (value) {
						formData.append(field.key, value);
					}
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
			} catch (err) {
				console.error("Add to cart failed:", err);

				setAddError(
					err instanceof Error
						? err.message
						: "Unable to add this to your cart.",
				);
			} finally {
				setAddingToCart(false);
			}
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

                        <p className="text-sm text-[#2E2E2E]/50">
                            Loading product...
                        </p>
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
					<main
						className="min-h-screen bg-[#FBF9F7] pt-[112px]
					sm:pt-[120px]"
					>
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
				{/* ==========================================================================
                FONT
            ========================================================================== */}

				<style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');

                .font-display {
                    font-family: 'Fraunces', Georgia, serif;
                    font-optical-sizing: auto;
                }
            `}</style>

				{/* ==========================================================================
                PRODUCT CONTENT
            ========================================================================== */}

				<section className="mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
					{/* INLINE BACK BUTTON */}

					<button
						type="button"
						onClick={() => router.back()}
						className="mb-7 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
					>
						<ArrowLeft size={16} />
						Back
					</button>

					<div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
						{/* ==========================================================================
                        GALLERY
                    ========================================================================== */}

						<div>
							{/* MAIN IMAGE */}

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

								{/* LEFT ARROW */}

								{product.images.length > 1 && (
									<button
										type="button"
										aria-label="Previous image"
										onClick={showPreviousImage}
										className="
                                        absolute
                                        left-3
                                        top-1/2
                                        flex
                                        h-10
                                        w-10
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-white/70
                                        bg-white/90
                                        text-[#2E2E2E]
                                        shadow-md
                                        backdrop-blur-sm
                                        transition
                                        hover:bg-white
                                        hover:text-[#85161B]
                                    "
									>
										<ArrowLeft size={18} />
									</button>
								)}

								{/* RIGHT ARROW */}

								{product.images.length > 1 && (
									<button
										type="button"
										aria-label="Next image"
										onClick={showNextImage}
										className="
                                        absolute
                                        right-3
                                        top-1/2
                                        flex
                                        h-10
                                        w-10
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-white/70
                                        bg-white/90
                                        text-[#2E2E2E]
                                        shadow-md
                                        backdrop-blur-sm
                                        transition
                                        hover:bg-white
                                        hover:text-[#85161B]
                                    "
									>
										<ArrowRight size={18} />
									</button>
								)}

								{/* IMAGE COUNTER */}

								{product.images.length > 1 && (
									<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
										{activeImage + 1} / {product.images.length}
									</div>
								)}
							</div>

							{/* THUMBNAILS */}

							{product.images.length > 1 && (
								<div className="mt-4 flex gap-3 overflow-x-auto pb-1">
									{product.images.map((img, index) => (
										<button
											key={img + index}
											type="button"
											aria-label={`View image ${index + 1}`}
											onClick={() => setActiveImage(index)}
											className={`
                                            h-20
                                            w-20
                                            shrink-0
                                            overflow-hidden
                                            rounded-xl
                                            border-2
                                            bg-white
                                            transition-all
                                            ${
																							activeImage === index
																								? "border-[#85161B] opacity-100 shadow-sm"
																								: "border-[#E8DED7] opacity-65 hover:opacity-100"
																						}
                                        `}
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

						{/* ==========================================================================
                        DETAILS
                    ========================================================================== */}

						<div>
							{/* STOCK STATUS */}

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
							</div>

							{/* PRODUCT NAME */}

							<h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-[#2E2E2E] sm:text-4xl">
								{product.name}
							</h1>

							{/* DESCRIPTION */}

							{product.description && (
								<p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#2E2E2E]/60">
									{product.description}
								</p>
							)}

							{/* PRICE */}

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

							{/* DELIVERY */}

							{product.delivery > 0 && (
								<p className="mt-2 flex items-center gap-1.5 text-xs text-[#2E2E2E]/45">
									<Truck size={13} />
									Delivery ₹{product.delivery.toFixed(2)}
								</p>
							)}

							{/* ==========================================================================
                            PERSONALIZATION TICKET
                        ========================================================================== */}

							{product.customizationFields.length > 0 && (
								<div className="relative mt-8 rounded-2xl border-2 border-dashed border-[#D9BBAE] bg-[#FFFBF8] p-6">
									{/* Punch hole */}

									<div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-dashed border-[#D9BBAE] bg-[#FBF9F7]" />

									{/* TITLE */}

									<p className="font-display text-sm font-semibold uppercase tracking-[0.20em] text-[#85161B] sm:text-[15px]">
										Personalization Ticket
									</p>

									{/* SUBTITLE */}

									<p className="mt-2 text-[13px] leading-6 text-[#2E2E2E]/55">
										Tell us how to make this one yours.
									</p>

									<div className="mt-6 space-y-6">
										{product.customizationFields.map((field) =>
											field.type === "photo" ? (
												<div key={field.key}>
													{/* PHOTO LABEL */}

													<label className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-[#2E2E2E]">
														<Camera size={15} className="text-[#85161B]" />

														{field.label}

														{field.required && (
															<span className="text-[#85161B]">*</span>
														)}
													</label>

													{/* PHOTO UPLOAD */}

													<label
														className="
                                                            flex
                                                            cursor-pointer
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-[#DED6D0]
                                                            bg-white
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            font-medium
                                                            text-[#2E2E2E]/60
                                                            transition
                                                            hover:border-[#85161B]/40
                                                            hover:text-[#85161B]
                                                        "
													>
														<Upload size={15} />

														<span className="max-w-[80%] truncate">
															{customFiles[field.key]
																? customFiles[field.key]?.name
																: "Choose a photo"}
														</span>

														<input
															type="file"
															accept="image/*"
															className="hidden"
															onChange={(event) =>
																handlePhotoFieldChange(
																	field,
																	event.target.files?.[0] ?? null,
																)
															}
														/>
													</label>
												</div>
											) : (
												<div key={field.key}>
													{/* TEXT LABEL + COUNTER */}

													<div className="mb-2.5 flex items-center justify-between gap-3">
														<label className="text-sm font-semibold leading-5 text-[#2E2E2E]">
															{field.label}

															{field.required && (
																<span className="ml-1 text-[#85161B]">*</span>
															)}
														</label>

														{field.maxLength && (
															<span className="shrink-0 text-[11px] font-medium text-[#2E2E2E]/40">
																{(customValues[field.key] ?? "").length}/
																{field.maxLength}
															</span>
														)}
													</div>

													{/* TEXT INPUT */}

													<input
														type="text"
														value={customValues[field.key] ?? ""}
														maxLength={field.maxLength}
														onChange={(event) =>
															handleTextFieldChange(field, event.target.value)
														}
														placeholder={`Enter ${field.label.toLowerCase()}`}
														className="
                                                            w-full
                                                            rounded-xl
                                                            border
                                                            border-[#DED6D0]
                                                            bg-white
                                                            px-3.5
                                                            py-3
                                                            text-sm
                                                            text-[#2E2E2E]
                                                            outline-none
                                                            transition
                                                            placeholder:text-[#2E2E2E]/30
                                                            focus:border-[#85161B]
                                                            focus:ring-2
                                                            focus:ring-[#85161B]/10
                                                        "
													/>
												</div>
											),
										)}
									</div>

									{/* LIVE PREVIEW */}

									{customValues[product.customizationFields[0]?.key] && (
										<p className="font-display mt-6 border-t border-dashed border-[#D9BBAE] pt-4 text-sm italic text-[#2E2E2E]/60">
											"For {customValues[product.customizationFields[0].key]}"
										</p>
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
									className="
                                    group
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#85161B]
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition-all
                                    hover:bg-[#721318]
                                    hover:shadow-lg
                                    active:scale-[0.99]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
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
											Add to Cart
											<ArrowRight
												size={15}
												className="transition-transform group-hover:translate-x-1"
											/>
										</>
									)}
								</button>
							</div>

							{/* ADD ERROR */}

							{addError && (
								<p className="mt-3 text-xs font-medium text-red-600">
									{addError}
								</p>
							)}

							{/* ==========================================================================
                            TRUST + PRIVACY
                        ========================================================================== */}

							<div className="mt-7 space-y-3">
								{/* SECURE CHECKOUT */}

								<div className="flex items-center gap-2.5 text-[13px] font-medium text-[#2E2E2E]/55">
									<ShieldCheck size={16} className="shrink-0 text-[#85161B]" />

									<span>Secure checkout · Made to order</span>
								</div>

								{/* PRIVACY */}

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
			</main>
		);
}
