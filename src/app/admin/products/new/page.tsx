"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2 } from "lucide-react";

/* ============================================================================
   TYPES
============================================================================ */

type CustomizeField = {
	id: string;
	label: string;
	type: "text" | "photo";
	maxLength: string;
	required: boolean;
};

/* ============================================================================
   PAGE
============================================================================ */

export default function AdminAddProductPage() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [sellingPrice, setSellingPrice] = useState("");
	const [marketPrice, setMarketPrice] = useState("");
	const [stock, setStock] = useState("");
	const [deliveryFee, setDeliveryFee] = useState("");
	const [inStock, setInStock] = useState(true);

	const [images, setImages] = useState<File[]>([]);

	const [customFields, setCustomFields] = useState<CustomizeField[]>([]);

	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	/* =====================================================
	   IMAGES
	===================================================== */

	const handleImageChange = (fileList: FileList | null) => {
		if (!fileList) return;
		setImages((previous) => [...previous, ...Array.from(fileList)]);
	};

	const removeImage = (index: number) => {
		setImages((previous) => previous.filter((_, i) => i !== index));
	};

	/* =====================================================
	   CUSTOMIZE FIELDS
	===================================================== */

	const addCustomField = () => {
		setCustomFields((previous) => [
			...previous,
			{
				id: `field-${Date.now()}`,
				label: "",
				type: "text",
				maxLength: "50",
				required: true,
			},
		]);
	};

	const updateCustomField = (id: string, patch: Partial<CustomizeField>) => {
		setCustomFields((previous) =>
			previous.map((field) =>
				field.id === id ? { ...field, ...patch } : field,
			),
		);
	};

	const removeCustomField = (id: string) => {
		setCustomFields((previous) => previous.filter((field) => field.id !== id));
	};

	/* =====================================================
	   SUBMIT
	===================================================== */
    
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim() || !sellingPrice.trim()) {
			setError("Product name and selling price are required.");
			return;
		}

		setSubmitting(true);

		try {
			// Wire this up to your real create-product endpoint.
			await new Promise((resolve) => setTimeout(resolve, 700));

			setSubmitted(true);

			setTimeout(() => {
				router.push("/admin");
			}, 1200);
		} catch (err) {
			setError("Unable to save this product. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
				.font-display { font-family: 'Fraunces', Georgia, serif; }
			`}</style>

			<div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 lg:px-8">
				<Link
					href="/admin"
					className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
				>
					<ArrowLeft size={16} />
					Back to dashboard
				</Link>

				<div className="mt-6">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
						Products
					</p>
					<h1 className="font-display mt-1 text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
						Add Product
					</h1>
					<p className="mt-2 text-sm text-[#2E2E2E]/55">
						Create a new listing for your store.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-8 space-y-6">
					{/* BASIC INFO */}

					<section className="rounded-2xl border border-[#E9DED7] bg-white p-6">
						<h2 className="font-semibold text-[#2E2E2E]">Basic information</h2>

						<div className="mt-4 space-y-4">
							<Field label="Product name" required>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Personalized Engraved Full Kada"
									className={inputClass}
								/>
							</Field>

							<Field label="Category">
								<input
									type="text"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									placeholder="e.g. Jewelry"
									className={inputClass}
								/>
							</Field>

							<Field label="Description">
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={4}
									placeholder="Describe the product, materials, and sizing..."
									className={`${inputClass} resize-none`}
								/>
							</Field>
						</div>
					</section>

					{/* PRICING & STOCK */}

					<section className="rounded-2xl border border-[#E9DED7] bg-white p-6">
						<h2 className="font-semibold text-[#2E2E2E]">Pricing & stock</h2>

						<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field label="Selling price (₹)" required>
								<input
									type="number"
									value={sellingPrice}
									onChange={(e) => setSellingPrice(e.target.value)}
									placeholder="249"
									className={inputClass}
								/>
							</Field>

							<Field label="Market price (₹)">
								<input
									type="number"
									value={marketPrice}
									onChange={(e) => setMarketPrice(e.target.value)}
									placeholder="300"
									className={inputClass}
								/>
							</Field>

							<Field label="Stock quantity">
								<input
									type="number"
									value={stock}
									onChange={(e) => setStock(e.target.value)}
									placeholder="50"
									className={inputClass}
								/>
							</Field>

							<Field label="Delivery fee (₹)">
								<input
									type="number"
									value={deliveryFee}
									onChange={(e) => setDeliveryFee(e.target.value)}
									placeholder="60"
									className={inputClass}
								/>
							</Field>
						</div>

						<label className="mt-4 flex cursor-pointer items-center gap-2.5">
							<input
								type="checkbox"
								checked={inStock}
								onChange={(e) => setInStock(e.target.checked)}
								className="h-4 w-4 accent-[#85161B]"
							/>
							<span className="text-sm text-[#2E2E2E]">
								This product is in stock
							</span>
						</label>
					</section>

					{/* IMAGES */}

					<section className="rounded-2xl border border-[#E9DED7] bg-white p-6">
						<h2 className="font-semibold text-[#2E2E2E]">Product images</h2>

						<label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#DED6D0] bg-[#FBF9F7] px-4 py-8 text-center transition hover:border-[#85161B]/50 hover:bg-[#85161B]/[0.02]">
							<Upload size={20} className="text-[#85161B]" />
							<span className="mt-2 text-sm font-medium text-[#202020]">
								Upload images
							</span>
							<span className="mt-1 text-[10px] text-black/40">
								PNG, JPG, WEBP • First image becomes the primary photo
							</span>
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(e) => handleImageChange(e.target.files)}
							/>
						</label>

						{images.length > 0 && (
							<div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
								{images.map((file, index) => (
									<div
										key={`${file.name}-${index}`}
										className="group relative aspect-square overflow-hidden rounded-xl border border-[#E8DED7] bg-[#F7F3F0]"
									>
										<img
											src={URL.createObjectURL(file)}
											alt={file.name}
											className="h-full w-full object-cover"
										/>
										{index === 0 && (
											<span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#85161B]">
												Primary
											</span>
										)}
										<button
											type="button"
											onClick={() => removeImage(index)}
											aria-label="Remove image"
											className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#2E2E2E]/60 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
										>
											<Trash2 size={12} />
										</button>
									</div>
								))}
							</div>
						)}
					</section>

					{/* CUSTOMIZATION FIELDS */}

					<section className="rounded-2xl border border-[#E9DED7] bg-white p-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-semibold text-[#2E2E2E]">Customization</h2>
								<p className="mt-1 text-xs text-[#2E2E2E]/45">
									Fields buyers fill in to personalize this product.
								</p>
							</div>

							<button
								type="button"
								onClick={addCustomField}
								className="inline-flex items-center gap-1.5 rounded-lg border border-[#DED6D0] px-3 py-2 text-xs font-semibold text-[#2E2E2E]/70 transition hover:border-[#85161B]/30 hover:text-[#85161B]"
							>
								<Plus size={14} />
								Add field
							</button>
						</div>

						{customFields.length > 0 && (
							<div className="mt-4 space-y-4">
								{customFields.map((field) => (
									<div
										key={field.id}
										className="rounded-xl border border-[#E8DED7] bg-[#FBF9F7] p-4"
									>
										<div className="flex items-start gap-3">
											<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[1fr_120px_90px]">
												<input
													type="text"
													value={field.label}
													onChange={(e) =>
														updateCustomField(field.id, {
															label: e.target.value,
														})
													}
													placeholder="Field label, e.g. Name to print"
													className={`${inputClass} bg-white`}
												/>

												<select
													value={field.type}
													onChange={(e) =>
														updateCustomField(field.id, {
															type: e.target.value as "text" | "photo",
														})
													}
													className={`${inputClass} bg-white`}
												>
													<option value="text">Text</option>
													<option value="photo">Photo</option>
												</select>

												{field.type === "text" ? (
													<input
														type="number"
														value={field.maxLength}
														onChange={(e) =>
															updateCustomField(field.id, {
																maxLength: e.target.value,
															})
														}
														placeholder="Max chars"
														className={`${inputClass} bg-white`}
													/>
												) : (
													<div />
												)}
											</div>

											<button
												type="button"
												onClick={() => removeCustomField(field.id)}
												aria-label="Remove field"
												className="mt-1 shrink-0 text-[#2E2E2E]/35 transition hover:text-red-600"
											>
												<Trash2 size={16} />
											</button>
										</div>

										<label className="mt-3 flex items-center gap-2">
											<input
												type="checkbox"
												checked={field.required}
												onChange={(e) =>
													updateCustomField(field.id, {
														required: e.target.checked,
													})
												}
												className="h-3.5 w-3.5 accent-[#85161B]"
											/>
											<span className="text-xs text-[#2E2E2E]/60">
												Required
											</span>
										</label>
									</div>
								))}
							</div>
						)}
					</section>

					{error && <p className="text-sm font-medium text-red-600">{error}</p>}

					{/* SUBMIT */}

					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
						>
							{submitting ? (
								<>
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Saving...
								</>
							) : submitted ? (
								<>
									<CheckCircle2 size={17} />
									Product added
								</>
							) : (
								"Save product"
							)}
						</button>

						<Link
							href="/admin"
							className="rounded-xl border border-[#DED6D0] px-6 py-3.5 text-sm font-semibold text-[#2E2E2E]/70 transition hover:border-[#85161B]/30 hover:text-[#85161B]"
						>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</main>
	);
}

/* ============================================================================
   HELPERS
============================================================================ */

const inputClass =
	"w-full rounded-xl border border-[#DED6D0] bg-white px-4 py-2.5 text-sm text-[#202020] outline-none transition placeholder:text-black/30 focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10";

function Field({
	label,
	required,
	children,
}: {
	label: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-1.5 block text-xs font-semibold text-[#2E2E2E]">
				{label}
				{required && <span className="ml-1 text-[#85161B]">*</span>}
			</label>
			{children}
		</div>
	);
}
