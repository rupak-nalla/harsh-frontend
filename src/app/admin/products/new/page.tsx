"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Package,
	ChevronLeft,
	Upload,
	Plus,
	X as CloseIcon,
	AlertCircle,
} from "lucide-react";

/* ============================================================================
   TYPES
============================================================================ */

type Category = {
	id: number;
	name: string;
};

type Occasion = {
	id: number;
	name: string;
};

type FormData = {
	mode: "new" | "edit";
	id?: string;
	name: string;
	description: string;
	primary_photo?: File;
	other_photos: File[];
	market_price: string;
	selling_price: string;
	reseller_price: string;
	category_ids: number[];
	occasion_ids: number[];
	customize_reqs: string[];
	keywords: string;
	delivery: string;
};

/* ============================================================================
   PAGE
============================================================================ */

export default function ProductsNewPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const productId = searchParams.get("id");

	const [formData, setFormData] = useState<FormData>({
		mode: productId ? "edit" : "new",
		id: productId || undefined,
		name: "",
		description: "",
		primary_photo: undefined,
		other_photos: [],
		market_price: "",
		selling_price: "",
		reseller_price: "",
		category_ids: [],
		occasion_ids: [],
		customize_reqs: [],
		keywords: "",
		delivery: "",
	});

	const [categories, setCategories] = useState<Category[]>([]);
	const [occasions, setOccasions] = useState<Occasion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [customizeReqInput, setCustomizeReqInput] = useState("");

	/* ========================================================================
       LOAD DATA
    ======================================================================== */

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			try {
				const [catRes, occRes] = await Promise.all([
					fetch("/api/admin/categories"),
					fetch("/api/admin/occasions"),
				]);

				if (!catRes.ok || !occRes.ok) {
					throw new Error("Failed to load categories or occasions");
				}

				const catData = await catRes.json();
				const occData = await occRes.json();

				setCategories(
					Array.isArray(catData)
						? catData
						: catData.categories || []
				);
				setOccasions(
					Array.isArray(occData)
						? occData
						: occData.occasions || []
				);
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "Failed to load data";
				setError(message);
				console.error("Error loading data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	/* ========================================================================
       HANDLE FORM SUBMISSION
    ======================================================================== */

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			setError("Product name is required");
			return;
		}

		if (!formData.description.trim()) {
			setError("Product description is required");
			return;
		}

		if (!formData.primary_photo && formData.mode === "new") {
			setError("Primary photo is required");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const body = new FormData();
			body.append("mode", formData.mode);
			body.append("command_type", "admin");

			if (formData.mode === "edit" && formData.id) {
				body.append("id", formData.id);
			}

			body.append("name", formData.name);
			body.append("description", formData.description);
			body.append("market_price", formData.market_price);
			body.append("selling_price", formData.selling_price);
			body.append("reseller_price", formData.reseller_price);
			body.append("keywords", formData.keywords);
			body.append("delivery", formData.delivery);

			if (formData.primary_photo) {
				body.append("primary_photo", formData.primary_photo);
			}

			for (const photo of formData.other_photos) {
				body.append("other_photos[]", photo);
			}

			for (const catId of formData.category_ids) {
				body.append("category_ids[]", catId.toString());
			}

			for (const occId of formData.occasion_ids) {
				body.append("occasion_ids[]", occId.toString());
			}

			for (const req of formData.customize_reqs) {
				body.append("customize_reqs[]", req);
			}

			const response = await fetch("/api/admin/products", {
				method: "POST",
				body,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to save product");
			}

			router.push("/admin/products");
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Failed to save product";
			setError(message);
			console.error("Error saving product:", err);
		} finally {
			setSaving(false);
		}
	};

	/* ========================================================================
       RENDER
    ======================================================================== */

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-[#FBF9F7]">
				<div className="text-center">
					<div className="animate-spin mb-4">
						<Package
							className="text-[#85161B]"
							size={32}
						/>
					</div>
					<p className="text-[#2E2E2E]/60">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#FBF9F7] p-4 lg:p-8">
			<div className="mx-auto max-w-4xl">
				{/* HEADER */}

				<div className="mb-8 flex items-center gap-4">
					<button
						type="button"
						onClick={() => router.back()}
						className="
							inline-flex
							h-10
							w-10
							items-center
							justify-center
							rounded-lg
							border
							border-[#E8DED7]
							text-[#2E2E2E]
							transition-all
							hover:bg-[#FBF9F7]
						"
					>
						<ChevronLeft size={20} />
					</button>

					<div>
						<p className="text-sm text-[#2E2E2E]/60">
							{formData.mode === "edit"
								? "Edit"
								: "Create New"}
						</p>

						<h1 className="text-3xl font-bold text-[#2E2E2E]">
							Product
						</h1>
					</div>
				</div>

				{/* ERROR MESSAGE */}

				{error && (
					<div
						className="
							mb-6
							flex
							items-start
							gap-3
							rounded-lg
							border
							border-red-200
							bg-red-50
							px-4
							py-3
							text-sm
							text-red-700
						"
					>
						<AlertCircle
							size={18}
							className="mt-0.5 flex-shrink-0"
						/>

						<div>
							<p className="font-medium">Error</p>
							<p className="mt-1">{error}</p>
						</div>
					</div>
				)}

				{/* FORM */}

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* BASIC INFO */}

					<div className="rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-[#2E2E2E]">
							Basic Information
						</h2>

						<div className="space-y-4">
							{/* NAME */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Product Name *
								</label>

								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="e.g., Premium Coffee Mug"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>

							{/* DESCRIPTION */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Description *
								</label>

								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									placeholder="Describe your product..."
									rows={4}
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>
						</div>
					</div>

					{/* PRICING */}

					<div className="rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-[#2E2E2E]">
							Pricing
						</h2>

						<div className="grid gap-4 sm:grid-cols-3">
							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Market Price
								</label>

								<input
									type="number"
									value={formData.market_price}
									onChange={(e) =>
										setFormData({
											...formData,
											market_price: e.target.value,
										})
									}
									placeholder="0"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Selling Price
								</label>

								<input
									type="number"
									value={formData.selling_price}
									onChange={(e) =>
										setFormData({
											...formData,
											selling_price: e.target.value,
										})
									}
									placeholder="0"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Reseller Price
								</label>

								<input
									type="number"
									value={formData.reseller_price}
									onChange={(e) =>
										setFormData({
											...formData,
											reseller_price: e.target.value,
										})
									}
									placeholder="0"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>
						</div>
					</div>

					{/* PHOTOS */}

					<div className="rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-[#2E2E2E]">
							Photos
						</h2>

						<div className="space-y-4">
							{/* PRIMARY PHOTO */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Primary Photo {formData.mode === "new" && "*"}
								</label>

								<div className="flex items-center gap-4">
									<label className="flex-1 cursor-pointer">
										<input
											type="file"
											accept="image/*"
											onChange={(e) =>
												setFormData({
													...formData,
													primary_photo:
														e.target
															.files?.[0],
												})
											}
											className="hidden"
										/>

										<div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E8DED7] px-4 py-6 text-center hover:border-[#85161B]">
											<Upload
												size={20}
												className="mr-2 text-[#2E2E2E]/60"
											/>

											<span className="text-sm text-[#2E2E2E]/60">
												{formData.primary_photo
													? formData
														.primary_photo
														.name
													: "Click to upload or drag"}
											</span>
										</div>
									</label>
								</div>
							</div>

							{/* OTHER PHOTOS */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Other Photos
								</label>

								<label className="block cursor-pointer">
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={(e) =>
											setFormData({
												...formData,
												other_photos: Array.from(
													e.target.files || []
												),
											})
										}
										className="hidden"
									/>

									<div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E8DED7] px-4 py-6 text-center hover:border-[#85161B]">
										<Upload
											size={20}
											className="mr-2 text-[#2E2E2E]/60"
										/>

										<span className="text-sm text-[#2E2E2E]/60">
											{formData.other_photos.length >
											0
												? `${formData.other_photos.length} file(s) selected`
												: "Click to upload or drag"}
										</span>
									</div>
								</label>

								{formData.other_photos.length > 0 && (
									<div className="mt-2 space-y-1">
										{formData.other_photos.map(
											(file, idx) => (
												<div
													key={idx}
													className="flex items-center justify-between rounded bg-[#FBF9F7] px-3 py-2 text-sm"
												>
													<span>
														{file.name}
													</span>

													<button
														type="button"
														onClick={() =>
															setFormData({
																...formData,
																other_photos:
																	formData.other_photos.filter(
																		(
																			_,
																			i
																		) =>
																			i !==
																			idx
																	),
															})
														}
														className="text-red-500 hover:text-red-600"
													>
														<CloseIcon size={16} />
													</button>
												</div>
											)
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* CATEGORIES & OCCASIONS */}

					<div className="rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-[#2E2E2E]">
							Categories & Occasions
						</h2>

						<div className="grid gap-4 sm:grid-cols-2">
							{/* CATEGORIES */}

							<div>
								<label className="mb-3 block text-sm font-medium text-[#2E2E2E]">
									Categories
								</label>

								<div className="space-y-2 max-h-48 overflow-y-auto">
									{categories.map((cat) => (
										<label
											key={cat.id}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={formData.category_ids.includes(
													cat.id
												)}
												onChange={(e) => {
													if (e.target
														.checked) {
														setFormData({
															...formData,
															category_ids: [
																...formData.category_ids,
																cat.id,
															],
														});
													} else {
														setFormData({
															...formData,
															category_ids:
																formData.category_ids.filter(
																	(id) =>
																		id !==
																		cat.id
																),
														});
													}
												}}
												className="rounded border-[#E8DED7]"
											/>

											<span className="text-sm text-[#2E2E2E]">
												{cat.name}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* OCCASIONS */}

							<div>
								<label className="mb-3 block text-sm font-medium text-[#2E2E2E]">
									Occasions
								</label>

								<div className="space-y-2 max-h-48 overflow-y-auto">
									{occasions.map((occ) => (
										<label
											key={occ.id}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={formData.occasion_ids.includes(
													occ.id
												)}
												onChange={(e) => {
													if (e.target
														.checked) {
														setFormData({
															...formData,
															occasion_ids: [
																...formData.occasion_ids,
																occ.id,
															],
														});
													} else {
														setFormData({
															...formData,
															occasion_ids:
																formData.occasion_ids.filter(
																	(id) =>
																		id !==
																		occ.id
																),
														});
													}
												}}
												className="rounded border-[#E8DED7]"
											/>

											<span className="text-sm text-[#2E2E2E]">
												{occ.name}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* CUSTOMIZATION & KEYWORDS */}

					<div className="rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-[#2E2E2E]">
							Customization & Keywords
						</h2>

						<div className="space-y-4">
							{/* CUSTOMIZE REQUIREMENTS */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Customization Requirements
								</label>

								<div className="flex gap-2">
									<input
										type="text"
										value={customizeReqInput}
										onChange={(e) =>
											setCustomizeReqInput(
												e.target.value
											)
										}
										placeholder="e.g., frontext:text:15:name"
										className="
											flex-1
											rounded-lg
											border
											border-[#E8DED7]
											px-3
											py-2
											text-sm
											focus:border-[#85161B]
											focus:outline-none
											focus:ring-1
											focus:ring-[#85161B]
										"
									/>

									<button
										type="button"
										onClick={() => {
											if (
												customizeReqInput.trim()
											) {
												setFormData({
													...formData,
													customize_reqs: [
														...formData.customize_reqs,
														customizeReqInput.trim(),
													],
												});
												setCustomizeReqInput(
													""
												);
											}
										}}
										className="rounded-lg bg-[#85161B] px-4 py-2 font-medium text-white hover:bg-[#A01E23]"
									>
										<Plus size={18} />
									</button>
								</div>

								{formData.customize_reqs.length > 0 && (
									<div className="mt-2 space-y-1">
										{formData.customize_reqs.map(
											(req, idx) => (
												<div
													key={idx}
													className="flex items-center justify-between rounded bg-[#FBF9F7] px-3 py-2 text-sm"
												>
													<span>{req}</span>

													<button
														type="button"
														onClick={() =>
															setFormData({
																...formData,
																customize_reqs:
																	formData.customize_reqs.filter(
																		(
																			_,
																			i
																		) =>
																			i !==
																			idx
																	),
															})
														}
														className="text-red-500 hover:text-red-600"
													>
														<CloseIcon size={16} />
													</button>
												</div>
											)
										)}
									</div>
								)}
							</div>

							{/* KEYWORDS */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Keywords
								</label>

								<input
									type="text"
									value={formData.keywords}
									onChange={(e) =>
										setFormData({
											...formData,
											keywords: e.target.value,
										})
									}
									placeholder="e.g., best for anniversary, purse, wallet"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>

							{/* DELIVERY */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Delivery Time (days)
								</label>

								<input
									type="number"
									value={formData.delivery}
									onChange={(e) =>
										setFormData({
											...formData,
											delivery: e.target.value,
										})
									}
									placeholder="0"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>
						</div>
					</div>

					{/* SUBMIT BUTTON */}

					<div className="flex gap-3">
						<button
							type="submit"
							disabled={saving}
							className="
								rounded-lg
								bg-[#85161B]
								px-6
								py-3
								font-medium
								text-white
								transition-all
								duration-200
								hover:bg-[#A01E23]
								active:scale-95
								disabled:opacity-50
							"
						>
							{saving
								? "Saving..."
								: formData.mode === "edit"
									? "Update Product"
									: "Create Product"}
						</button>

						<button
							type="button"
							onClick={() => router.back()}
							className="
								rounded-lg
								border
								border-[#E8DED7]
								px-6
								py-3
								font-medium
								text-[#2E2E2E]
								transition-all
								duration-200
								hover:bg-[#FBF9F7]
							"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
