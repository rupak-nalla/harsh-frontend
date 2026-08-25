"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Check, X, Upload, Trash2 } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type CustomizeRequirement = {
	key: string;
	type: "text" | "photo" | "photos";
	max: number;
	placeholder: string;
	optional: boolean;
};

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

	/*
	 * Backend can return customizeReqs as:
	 *
	 * JSON string:
	 * '["text:10:Enter your custom name"]'
	 *
	 * OR:
	 *
	 * ["text:10:Enter your custom name"]
	 */
	customizeReqs?: string | string[] | null;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* =========================================================
   PARSE CUSTOMIZATION REQUIREMENTS
========================================================= */

/*
 * Supported backend formats:
 *
 * 1. text:10:Enter your custom name
 * 2. photo:Upload Photo
 * 3. photos:5:Upload Photos
 *
 * Also supports the older format:
 *
 * 4. key:text:10:Enter your custom name
 * 5. key:photo:1:Upload Photo
 * 6. key:photos:5:Upload Photos
 */

function parseCustomizeRequirements(
	value?: string | string[] | null,
): CustomizeRequirement[] {
	if (!value) {
		return [];
	}

	let parsed: unknown;

	/* ---------------------------------------------------------
	   VALUE MAY ALREADY BE AN ARRAY
	--------------------------------------------------------- */

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

			/* =====================================================
			   FORMAT:

			   text:10:Enter your custom name
			===================================================== */

			if (
				parts[0] === "text" ||
				parts[0] === "photo" ||
				parts[0] === "photos"
			) {
				type = parts[0];

				/*
				 * TEXT / PHOTOS:
				 *
				 * text:10:Enter name
				 * photos:5:Upload photos
				 *
				 * PHOTO:
				 *
				 * photo:Upload Photo
				 */

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
						/*
						 * Fallback:
						 *
						 * text:Enter your name
						 */
						max = type === "text" ? 100 : 1;
						placeholder = parts.slice(1).join(":").trim();
					}

					key =
						type === "text"
							? `text_${Math.random().toString(36).slice(2, 8)}`
							: `photos_${Math.random().toString(36).slice(2, 8)}`;
				}
			} else if (

			/* =====================================================
			   OLD FORMAT:

			   key:text:10:Enter name
			   key:photo:1:Upload Photo
			   key:photos:5:Upload Photos
			===================================================== */
				parts.length >= 3 &&
				(parts[1] === "text" || parts[1] === "photo" || parts[1] === "photos")
			) {
				key = parts[0];

				type = parts[1];

				const possibleMax = Number(parts[2]);

				if (Number.isFinite(possibleMax) && possibleMax >= 1) {
					max = possibleMax;
				} else {
					max = type === "photo" ? 1 : 100;
				}

				placeholder = parts.slice(3).join(":").trim();

				/*
				 * Handle:
				 *
				 * key:photo:Upload Photo
				 */
				if (!placeholder && parts.length >= 3) {
					placeholder = parts.slice(2).join(":").trim();

					max = type === "photo" ? 1 : 100;
				}
			} else {
				return null;
			}

			if (!placeholder) {
				return null;
			}

			const optional = /\(\s*optional\s*\)/i.test(placeholder);

			/*
			 * Remove optional marker from placeholder displayed
			 * inside the actual input.
			 */
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

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductCard({
	item,
	showOriginal = false,
}: {
	item: Item;
	showOriginal?: boolean;
}) {
	/* =====================================================
	   WISHLIST
	===================================================== */

	const [wishlisted, setWishlisted] = useState(false);
	const [wishlistLoading, setWishlistLoading] = useState(false);
	const [wishlistError, setWishlistError] = useState("");

	/* =====================================================
	   CART
	===================================================== */

	const [addingToCart, setAddingToCart] = useState(false);

	const [addedToCart, setAddedToCart] = useState(false);

	const [cartError, setCartError] = useState("");

	/* =====================================================
	   CUSTOMIZATION
	===================================================== */

	const [customizationOpen, setCustomizationOpen] = useState(false);

	const [customizationValues, setCustomizationValues] = useState<
		Record<string, string>
	>({});

	const [customizationFiles, setCustomizationFiles] = useState<
		Record<string, File[]>
	>({});

	const [customizationValidationError, setCustomizationValidationError] =
		useState("");

	/* =====================================================
	   PARSED CUSTOMIZATION REQUIREMENTS
	===================================================== */

	const customizeRequirements = parseCustomizeRequirements(item.customizeReqs);

	/*
	 * Debugging.
	 *
	 * You can remove this later.
	 */
	useEffect(() => {
		console.log(
			`Product "${item.name}" raw customizeReqs:`,
			item.customizeReqs,
		);

		console.log(
			`Product "${item.name}" parsed customization requirements:`,
			customizeRequirements,
		);
	}, [item.name, item.customizeReqs]);

	/* =====================================================
	   BODY SCROLL LOCK
	===================================================== */

	useEffect(() => {
		if (!customizationOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [customizationOpen]);

	/* =====================================================
	   RESET CUSTOMIZATION
	===================================================== */

	const resetCustomization = () => {
		setCustomizationValues({});
		setCustomizationFiles({});
		setCustomizationValidationError("");
	};

	/* =====================================================
	   OPEN MODAL
	===================================================== */

	const openCustomizationModal = () => {
		setCartError("");
		setCustomizationValidationError("");
		setCustomizationOpen(true);
	};

	/* =====================================================
	   CLOSE MODAL
	===================================================== */

	const closeCustomizationModal = () => {
		if (addingToCart) {
			return;
		}

		setCustomizationOpen(false);
		resetCustomization();
	};

	/* =====================================================
	   ADD TO CART
	===================================================== */

	const addToCart = async (
		values: Record<string, string>,
		files: Record<string, File[]>,
	) => {
		if (addingToCart) {
			return;
		}

		setCartError("");
		setAddingToCart(true);

		try {
			const formData = new FormData();

			/* PRODUCT ID */

			formData.append("product_id", item.id);

			/* =================================================
			   TEXT CUSTOMIZATION
			================================================= */

			Object.entries(values).forEach(([key, value]) => {
				const trimmedValue = value.trim();

				if (trimmedValue) {
					formData.append(key, trimmedValue);
				}
			});

			/* =================================================
			   FILE CUSTOMIZATION
			================================================= */

			Object.entries(files).forEach(([key, fileList]) => {
				if (!fileList.length) {
					return;
				}

				/*
				 * Single photo
				 */
				if (fileList.length === 1) {
					formData.append(key, fileList[0]);

					return;
				}

				/*
				 * Multiple photos
				 */
				fileList.forEach((file) => {
					formData.append(`${key}[]`, file);
				});
			});

			const response = await fetch("/api/cart/add", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const responseText = await response.text();

			let data: any;

			try {
				data = JSON.parse(responseText);
			} catch {
				data = {
					message: responseText || "Invalid response from server.",
				};
			}

			console.log("ADD TO CART STATUS:", response.status);
			console.log("ADD TO CART RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message || `Unable to add product to cart (${response.status})`,
				);
			}

			console.log("Product successfully added to cart:", data);

			// const data: {
			// 	message?: string;
			// } = await response.json().catch(() => ({}));

			// if (!response.ok) {
			// 	throw new Error(
			// 		data?.message || "Unable to add item to cart. Please try again.",
			// 	);
			// }

			setAddedToCart(true);
			setCustomizationOpen(false);
			resetCustomization();

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
		} finally {
			setAddingToCart(false);
		}
	};

	/* =====================================================
	   HANDLE ADD TO CART
	===================================================== */

	const handleAddToCart = async () => {
		if (addingToCart) {
			return;
		}

		setCartError("");

		console.log("Add to cart clicked:", item.name);

		console.log("Customization requirements:", customizeRequirements);

		/*
		 * IMPORTANT:
		 *
		 * If customization requirements exist,
		 * ALWAYS open the modal.
		 */

		if (customizeRequirements.length > 0) {
			openCustomizationModal();
			return;
		}

		/*
		 * Normal product.
		 */

		await addToCart({}, {});
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
		if (!file) {
			return;
		}

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
	===================================================== */

	const handleMultiplePhotoChange = (
		requirement: CustomizeRequirement,
		fileList: FileList | null,
	) => {
		if (!fileList) {
			return;
		}

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
		for (const requirement of customizeRequirements) {
			/* TEXT */

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

			/* SINGLE PHOTO */

			if (requirement.type === "photo") {
				const files = customizationFiles[requirement.key] || [];

				if (!requirement.optional && files.length === 0) {
					setCustomizationValidationError(
						`${requirement.placeholder} is required.`,
					);

					return false;
				}
			}

			/* MULTIPLE PHOTOS */

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

	/* =====================================================
	   SUBMIT CUSTOMIZATION
	===================================================== */

	const handleCustomizationSubmit = async () => {
		setCustomizationValidationError("");

		const valid = validateCustomization();

		if (!valid) {
			return;
		}

		await addToCart(customizationValues, customizationFiles);
	};

	/* =====================================================
	   WISHLIST
	===================================================== */

	const handleToggleWishlist = async () => {
		if (wishlistLoading) {
			return;
		}

		setWishlistError("");

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

			const data: {
				message?: string;
			} = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to update wishlist. Please try again.",
				);
			}
		} catch (error) {
			console.error("Wishlist update failed:", error);

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

	/* =====================================================
	   RENDER
	===================================================== */

	return (
		<>
			{/* =================================================
			    PRODUCT CARD
			================================================= */}

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
				{/* IMAGE */}

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

					{/* BADGE */}

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

					{/* WISHLIST */}

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
				</div>

				{/* PRODUCT INFORMATION */}

				<div className="px-2 pb-1 pt-4">
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

					{/* PRICE */}

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

					{/* ADD TO CART */}

					<div className="mt-3 flex items-center gap-2">
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
								<span
									className="
										h-3.5
										w-3.5
										animate-spin
										rounded-full
										border-2
										border-[#85161B]/30
										border-t-[#85161B]
									"
								/>
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
										: customizeRequirements.length > 0
											? "Customize & Add"
											: "Add to cart"}
							</span>
						</button>
					</div>

					{/* ERRORS */}

					{cartError && (
						<p
							role="alert"
							className="
								mt-2
								text-[11px]
								font-medium
								text-red-600
							"
						>
							{cartError}
						</p>
					)}

					{wishlistError && (
						<p
							role="alert"
							className="
								mt-2
								text-[11px]
								font-medium
								text-red-600
							"
						>
							{wishlistError}
						</p>
					)}
				</div>
			</article>

			{/* =====================================================
			    CUSTOMIZATION MODAL
			===================================================== */}

			{customizationOpen && (
				<div
					className="
						fixed
						inset-0
						z-[100]
						flex
						items-center
						justify-center
						p-4
					"
				>
					{/* BACKDROP */}

					<button
						type="button"
						aria-label="Close customization"
						onClick={closeCustomizationModal}
						className="
							absolute
							inset-0
							cursor-default
							bg-black/45
							backdrop-blur-[2px]
						"
					/>

					{/* MODAL */}

					<div
						className="
							relative
							z-10
							flex
							max-h-[90vh]
							w-full
							max-w-lg
							flex-col
							overflow-hidden
							rounded-[26px]
							bg-white
							shadow-2xl
						"
					>
						{/* HEADER */}

						<div
							className="
								flex
								items-start
								justify-between
								gap-4
								border-b
								border-[#E8DED7]
								px-5
								py-4
								sm:px-6
							"
						>
							<div className="min-w-0">
								<p
									className="
										text-[10px]
										font-bold
										uppercase
										tracking-[0.15em]
										text-[#85161B]
									"
								>
									Personalize
								</p>

								<h2
									className="
										mt-1
										line-clamp-2
										text-lg
										font-semibold
										text-[#202020]
									"
								>
									{item.name}
								</h2>

								<p
									className="
										mt-1
										text-xs
										text-black/45
									"
								>
									Add the details required for your custom order.
								</p>
							</div>

							<button
								type="button"
								onClick={closeCustomizationModal}
								disabled={addingToCart}
								className="
									flex
									h-9
									w-9
									shrink-0
									items-center
									justify-center
									rounded-full
									bg-[#F7F4F1]
									text-black/55
									transition
									hover:bg-[#F0EAE5]
									hover:text-[#85161B]
									disabled:opacity-50
								"
							>
								<X size={18} />
							</button>
						</div>

						{/* FORM */}

						<div className="overflow-y-auto px-5 py-5 sm:px-6">
							<div className="space-y-5">
								{customizeRequirements.map((requirement) => {
									const label = requirement.placeholder;

									const textValue = customizationValues[requirement.key] || "";

									const files = customizationFiles[requirement.key] || [];

									return (
										<div key={requirement.key}>
											{/* LABEL */}

											<label
												className="
														mb-2
														flex
														items-center
														justify-between
														gap-3
													"
											>
												<span className="text-sm font-semibold text-[#202020]">
													{label}
												</span>

												{requirement.optional ? (
													<span className="text-[10px] font-medium text-black/35">
														Optional
													</span>
												) : (
													<span className="text-[10px] font-semibold text-[#85161B]">
														Required
													</span>
												)}
											</label>

											{/* TEXT */}

											{requirement.type === "text" && (
												<div>
													<input
														type="text"
														value={textValue}
														onChange={(e) =>
															handleTextChange(
																requirement.key,
																e.target.value,
																requirement.max,
															)
														}
														maxLength={requirement.max}
														placeholder={requirement.placeholder}
														className="
																w-full
																rounded-xl
																border
																border-[#DED6D0]
																bg-white
																px-4
																py-3
																text-sm
																text-[#202020]
																outline-none
																transition
																placeholder:text-black/30
																focus:border-[#85161B]
																focus:ring-2
																focus:ring-[#85161B]/10
															"
													/>

													<div className="mt-1.5 flex justify-end">
														<span className="text-[10px] text-black/35">
															{textValue.length}/{requirement.max}
														</span>
													</div>
												</div>
											)}

											{/* SINGLE PHOTO */}

											{requirement.type === "photo" && (
												<div>
													<label
														className="
																flex
																cursor-pointer
																flex-col
																items-center
																justify-center
																rounded-xl
																border
																border-dashed
																border-[#DED6D0]
																bg-[#FBF9F7]
																px-4
																py-7
																text-center
																transition
																hover:border-[#85161B]/50
																hover:bg-[#85161B]/[0.02]
															"
													>
														<Upload size={20} className="text-[#85161B]" />

														<span className="mt-2 text-sm font-medium text-[#202020]">
															{files.length > 0
																? "Change image"
																: "Upload image"}
														</span>

														<span className="mt-1 text-[10px] text-black/40">
															PNG, JPG, WEBP • Max 10 MB
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
														<div
															className="
																	mt-2
																	flex
																	items-center
																	justify-between
																	rounded-lg
																	bg-[#F7F4F1]
																	px-3
																	py-2
																"
														>
															<span className="max-w-[80%] truncate text-xs text-black/65">
																{files[0].name}
															</span>

															<button
																type="button"
																onClick={() => removePhoto(requirement.key, 0)}
																className="text-black/35 transition hover:text-red-600"
															>
																<Trash2 size={15} />
															</button>
														</div>
													)}
												</div>
											)}

											{/* MULTIPLE PHOTOS */}

											{requirement.type === "photos" && (
												<div>
													<label
														className="
																flex
																cursor-pointer
																flex-col
																items-center
																justify-center
																rounded-xl
																border
																border-dashed
																border-[#DED6D0]
																bg-[#FBF9F7]
																px-4
																py-7
																text-center
																transition
																hover:border-[#85161B]/50
																hover:bg-[#85161B]/[0.02]
															"
													>
														<Upload size={20} className="text-[#85161B]" />

														<span className="mt-2 text-sm font-medium text-[#202020]">
															Select photos
														</span>

														<span className="mt-1 text-[10px] text-black/40">
															Up to {requirement.max} photos • Each max 10 MB
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
																	className="
																				flex
																				items-center
																				justify-between
																				rounded-lg
																				bg-[#F7F4F1]
																				px-3
																				py-2
																			"
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

							{/* VALIDATION ERROR */}

							{customizationValidationError && (
								<div
									role="alert"
									className="
										mt-5
										rounded-xl
										border
										border-red-200
										bg-red-50
										px-3.5
										py-3
										text-xs
										font-medium
										text-red-600
									"
								>
									{customizationValidationError}
								</div>
							)}
						</div>

						{/* FOOTER */}

						<div
							className="
								border-t
								border-[#E8DED7]
								bg-white
								px-5
								py-4
								sm:px-6
							"
						>
							<button
								type="button"
								onClick={handleCustomizationSubmit}
								disabled={addingToCart}
								className="
									flex
									h-11
									w-full
									items-center
									justify-center
									gap-2
									rounded-full
									bg-[#85161B]
									text-sm
									font-semibold
									text-white
									transition
									hover:bg-[#721318]
									active:scale-[0.99]
									disabled:cursor-not-allowed
									disabled:opacity-60
								"
							>
								{addingToCart ? (
									<>
										<span
											className="
												h-4
												w-4
												animate-spin
												rounded-full
												border-2
												border-white/30
												border-t-white
											"
										/>
										Adding to cart...
									</>
								) : (
									<>
										<ShoppingBag size={17} />
										Add to cart
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
