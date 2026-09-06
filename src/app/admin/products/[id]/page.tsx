"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Image as ImageIcon,
	Loader2,
	Package,
	PenLine,
	Pencil,
	Plus,
	Save,
	Star,
	Trash2,
	Truck,
	X,
} from "lucide-react";

const PRODUCT_IMAGE_BASE_URL = "https://printinghouseujjain.in/assets/products/";
const REVIEW_IMAGE_BASE_URL = "https://printinghouseujjain.in/assets/reviews/";

type Category = { id: number; name: string };
type Occasion = { id: number; name: string };

type RawProduct = {
	id?: number | string;
	name?: string;
	description?: string;
	primary_photo_path?: string;
	other_photos_paths?: string | string[];
	market_price?: string | number;
	selling_price?: string | number;
	reseller_price?: string | number;
	category_ids?: string | number[];
	occasion_ids?: string | number[];
	in_stock?: string | boolean;
	sold?: string | number;
	customize_reqs?: string | string[] | null;
	keywords?: string;
	delivery?: string | number;
	created_at?: string;
};

type Review = {
	id: string;
	name: string;
	rating: number;
	comment: string;
	date: string;
	photos: string[];
};

type Order = {
	id: string;
	date: string;
	status: string;
	amount: number;
	customer: string;
};

type RawOrder = {
	id?: number | string;
	order_id?: string;
	user_id?: number | string | null;
	order_status?: string;
	grand_total?: number | string;
	created_at?: string;
	cart?: string | Array<{ id?: number | string }>;
};

type FormState = {
	name: string;
	description: string;
	marketPrice: string;
	sellingPrice: string;
	resellerPrice: string;
	keywords: string;
	delivery: string;
	inStock: boolean;
	categoryIds: number[];
	occasionIds: number[];
	customizeReqs: string[];
};

function parseArray<T>(value: unknown): T[] {
	if (Array.isArray(value)) return value as T[];
	if (typeof value !== "string" || !value.trim()) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function numberValue(value: unknown) {
	const number = Number(value ?? 0);
	return Number.isFinite(number) ? number : 0;
}

function imageUrl(path?: string) {
	if (!path) return "";
	return path.startsWith("http") ? path : `${PRODUCT_IMAGE_BASE_URL}${path.replace(/^\/+/, "")}`;
}

function dateValue(value?: string) {
	if (!value) return "—";
	const date = new Date(value.replace(" ", "T"));
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeReview(raw: Record<string, unknown>, index: number): Review {
	const photoValue = raw.photos_path ?? raw.photo_path;
	const photos = parseArray<string>(photoValue);
	const rating = Math.max(0, Math.min(5, numberValue(raw.star_count ?? raw.rating ?? raw.stars)));
	return {
		id: String(raw.id ?? `review-${index}`),
		name: String(raw.name ?? raw.customer_name ?? raw.user_name ?? "Customer"),
		rating,
		comment: String(raw.description ?? raw.comment ?? raw.review ?? raw.review_text ?? raw.message ?? ""),
		date: dateValue(String(raw.created_at ?? raw.date ?? "")),
		photos,
	};
}

function normalizeStatus(value?: string) {
	const status = String(value ?? "Pending").toLowerCase();
	if (status.includes("deliver") || status.includes("complete")) return "Delivered";
	if (status.includes("ship") || status.includes("dispatch")) return "Shipped";
	if (status.includes("process") || status.includes("confirm")) return "Processing";
	if (status.includes("cancel")) return "Cancelled";
	return "Pending";
}

function parseProduct(data: unknown): RawProduct | null {
	if (!data || typeof data !== "object") return null;
	const value = data as { result?: RawProduct; product?: RawProduct; data?: RawProduct };
	return value.result ?? value.product ?? value.data ?? (data as RawProduct);
}

function parseOrders(data: unknown, productId: string): Order[] {
	if (!data || typeof data !== "object") return [];
	const value = data as { orders?: RawOrder[] };
	return (value.orders ?? []).filter((order) => {
		const cart = parseArray<{ id?: number | string }>(order.cart);
		return cart.some((item) => String(item.id ?? "") === productId);
	}).map((order) => ({
		id: String(order.order_id ?? order.id ?? ""),
		date: dateValue(order.created_at),
		status: normalizeStatus(order.order_status),
		amount: numberValue(order.grand_total),
		customer: order.user_id === null || order.user_id === undefined ? "Guest" : `User #${order.user_id}`,
	}));
}

function initialForm(product: RawProduct): FormState {
	return {
		name: product.name ?? "",
		description: product.description ?? "",
		marketPrice: String(product.market_price ?? ""),
		sellingPrice: String(product.selling_price ?? ""),
		resellerPrice: String(product.reseller_price ?? ""),
		keywords: product.keywords ?? "",
		delivery: String(product.delivery ?? ""),
		inStock: String(product.in_stock ?? "available").toLowerCase() === "available" || product.in_stock === true,
		categoryIds: parseArray<number>(product.category_ids).map(Number),
		occasionIds: parseArray<number>(product.occasion_ids).map(Number),
		customizeReqs: parseArray<string>(product.customize_reqs),
	};
}

function ReviewStars({ rating }: { rating: number }) {
	return (
		<span className="inline-flex text-[#C47A21]">
			{Array.from({ length: 5 }, (_, index) => (
				<Star key={index} size={14} fill={index < rating ? "currentColor" : "none"} />
			))}
		</span>
	);
}

/* ============================================================================
   READ-ONLY OVERVIEW
============================================================================ */

function ProductOverview({
	product,
	form,
	otherPhotoPaths,
	reviews,
	orders,
	averageRating,
	onEdit,
}: {
	product: RawProduct;
	form: FormState;
	otherPhotoPaths: string[];
	reviews: Review[];
	orders: Order[];
	averageRating: number;
	onEdit: () => void;
}) {
	const images = [product.primary_photo_path, ...otherPhotoPaths].filter(
		(path): path is string => Boolean(path),
	);
	const [activeImage, setActiveImage] = useState(0);
	const heroImage = images[activeImage];

	const showPreviousImage = () => {
		if (images.length <= 1) return;
		setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
	};

	const showNextImage = () => {
		if (images.length <= 1) return;
		setActiveImage((current) => (current === images.length - 1 ? 0 : current + 1));
	};

	return (
		<div className="mt-6 space-y-5">
			<section className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
				<div className="rounded-2xl border border-[#E8DED7] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-5">
					<div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
						{images.length > 1 && (
							<div className="order-first flex max-h-[420px] flex-col gap-2.5 overflow-y-auto pr-0.5">
								{images.map((image, index) => (
									<button
										key={`${image}-${index}`}
										type="button"
										aria-label={`View image ${index + 1}`}
										onClick={() => setActiveImage(index)}
										className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
											activeImage === index
												? "border-[#85161B] opacity-100 shadow-sm"
												: "border-[#E8DED7] opacity-60 hover:opacity-100"
										}`}
									>
										<img src={imageUrl(image)} alt={`${form.name} ${index + 1}`} className="h-full w-full object-cover" />
									</button>
								))}
							</div>
						)}
						<div className="group relative aspect-square overflow-hidden rounded-xl border border-[#E8DED7] bg-[#FBF9F7]">
							{heroImage ? (
								<img src={imageUrl(heroImage)} alt={form.name} className="h-full w-full object-cover" />
							) : (
								<div className="flex h-full w-full items-center justify-center text-sm text-[#2E2E2E]/40">No product image</div>
							)}

							{images.length > 1 && (
								<>
									<button
										type="button"
										aria-label="Previous image"
										onClick={showPreviousImage}
										className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2E2E2E] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#85161B]"
									>
										<ArrowLeft size={18} />
									</button>
									<button
										type="button"
										aria-label="Next image"
										onClick={showNextImage}
										className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#2E2E2E] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#85161B]"
									>
										<ArrowRight size={18} />
									</button>
									<div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
										{activeImage + 1} / {images.length}
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#85161B]">Product information</p>
							<h2 className="mt-2 text-xl font-bold leading-snug text-[#2E2E2E]">{form.name}</h2>
						</div>
						<span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${form.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
							{form.inStock ? "In stock" : "Out of stock"}
						</span>
					</div>

					<p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#2E2E2E]/65">{form.description || "No description provided."}</p>

					<div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F0E8E2] pt-5 sm:grid-cols-4">
						<div>
							<p className="text-xs text-[#2E2E2E]/45">Selling price</p>
							<p className="mt-1 text-base font-bold text-[#85161B]">₹{numberValue(form.sellingPrice).toLocaleString("en-IN")}</p>
						</div>
						<div>
							<p className="text-xs text-[#2E2E2E]/45">Market price</p>
							<p className="mt-1 text-base font-semibold text-[#2E2E2E]">₹{numberValue(form.marketPrice).toLocaleString("en-IN")}</p>
						</div>
						<div>
							<p className="text-xs text-[#2E2E2E]/45">Delivery</p>
							<p className="mt-1 text-base font-semibold text-[#2E2E2E]">₹{numberValue(form.delivery).toLocaleString("en-IN")}</p>
						</div>
						<div>
							<p className="text-xs text-[#2E2E2E]/45">Sold</p>
							<p className="mt-1 text-base font-semibold text-[#2E2E2E]">{product.sold ?? 0}</p>
						</div>
					</div>

					{form.keywords && (
						<p className="mt-4 text-xs leading-5 text-[#2E2E2E]/50">
							<span className="font-semibold text-[#2E2E2E]/70">Keywords:</span> {form.keywords}
						</p>
					)}
				</div>
			</section>

			<section className="rounded-2xl border border-[#E8DED7] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:px-6">
				<div className="flex items-center justify-between">
					<h2 className="flex items-center gap-2 text-sm font-semibold text-[#2E2E2E]">
						<PenLine size={16} className="text-[#85161B]" />
						Customization requirements
					</h2>
					<span className="text-xs text-[#2E2E2E]/45">{form.customizeReqs.length}</span>
				</div>
				{form.customizeReqs.length > 0 ? (
					<div className="mt-3 flex flex-wrap gap-2">
						{form.customizeReqs.map((requirement, index) => (
							<span key={`${requirement}-${index}`} className="rounded-lg bg-[#FBF9F7] px-3 py-1.5 text-xs text-[#2E2E2E]/70">
								{requirement}
							</span>
						))}
					</div>
				) : (
					<p className="mt-3 text-xs text-[#2E2E2E]/50">No customization requirements.</p>
				)}
			</section>

			<section className="grid gap-5 lg:grid-cols-2">
				<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-[#2E2E2E]">Reviews</h2>
						<span className="text-xs text-[#2E2E2E]/50">{reviews.length} · {averageRating ? averageRating.toFixed(1) : "0.0"}/5</span>
					</div>
					{reviews.length === 0 ? (
						<p className="mt-4 text-xs text-[#2E2E2E]/50">No reviews for this product yet.</p>
					) : (
						<div className="mt-4 space-y-3.5">
							{reviews.map((review) => (
								<article key={review.id} className="border-t border-[#F0E8E2] pt-3.5 first:border-0 first:pt-0">
									<div className="flex items-center justify-between gap-3">
										<p className="text-xs font-semibold text-[#2E2E2E]">{review.name}</p>
										<span className="text-[10px] text-[#2E2E2E]/45">{review.date}</span>
									</div>
									<div className="mt-1.5">
										<ReviewStars rating={review.rating} />
									</div>
									<p className="mt-1.5 text-xs leading-5 text-[#2E2E2E]/65">{review.comment || "No written comment."}</p>
								</article>
							))}
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-[#2E2E2E]">Orders containing this product</h2>
						<span className="text-xs text-[#2E2E2E]/50">{orders.length}</span>
					</div>
					{orders.length === 0 ? (
						<p className="mt-4 text-xs text-[#2E2E2E]/50">No orders contain this product yet.</p>
					) : (
						<div className="mt-3.5 divide-y divide-[#F0E8E2]">
							{orders.map((order) => (
								<div key={order.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
									<div>
										<p className="text-xs font-semibold text-[#2E2E2E]">#{order.id}</p>
										<p className="mt-0.5 text-[10px] text-[#2E2E2E]/50">
											{order.customer} · {order.date} · {order.status}
										</p>
									</div>
									<Link
										href={`/admin/orders/${order.id}`}
										className="shrink-0 rounded-lg border border-[#85161B]/20 px-2.5 py-1.5 text-[10px] font-semibold text-[#85161B] transition hover:bg-[#85161B]/5"
									>
										View order
									</Link>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			<button
				type="button"
				onClick={onEdit}
				className="inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f1116]"
			>
				<Pencil size={15} />
				Edit product
			</button>
		</div>
	);
}

/* ============================================================================
   PAGE
============================================================================ */

export default function AdminProductDetailsPage() {
	const params = useParams<{ id: string }>();
	const productId = params?.id ? decodeURIComponent(params.id) : "";
	const [product, setProduct] = useState<RawProduct | null>(null);
	const [form, setForm] = useState<FormState | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [occasions, setOccasions] = useState<Occasion[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);
	const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);
	const [otherPhotos, setOtherPhotos] = useState<File[]>([]);
	const [newRequirement, setNewRequirement] = useState("");
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	/* ========================================================================
	   LOAD PRODUCT DATA

	   Pulled out of the initial effect so it can also be called after a
	   successful save — the backend is the source of truth for things like
	   the final stored photo filenames, so re-fetching (rather than trusting
	   whatever we optimistically had in the form) is what keeps the page
	   showing what's actually saved.
	========================================================================= */

	const loadProductData = async () => {
		const productBody = new FormData();
		productBody.append("product_id", productId);
		const reviewsBody = new FormData();
		reviewsBody.append("product_id", productId);

		const [productResponse, reviewsResponse, ordersResponse, categoriesResponse, occasionsResponse] = await Promise.all([
			fetch(`/api/product/${encodeURIComponent(productId)}`, { method: "POST", body: productBody, cache: "no-store", credentials: "include" }),
			fetch("/api/reviews", { method: "POST", body: reviewsBody, cache: "no-store", credentials: "include" }),
			fetch("/api/admin/orders", { cache: "no-store", credentials: "include" }),
			fetch("/api/admin/categories", { cache: "no-store", credentials: "include" }),
			fetch("/api/admin/occasions", { cache: "no-store", credentials: "include" }),
		]);

		const productData = await productResponse.json().catch(() => ({}));
		if (!productResponse.ok) throw new Error(productData.message || "Unable to load product.");
		const rawProduct = parseProduct(productData);
		if (!rawProduct) throw new Error("Product not found.");

		setProduct(rawProduct);
		setForm(initialForm(rawProduct));

		const reviewsData = await reviewsResponse.json().catch(() => ({}));
		const rawReviews = reviewsData.reviews ?? reviewsData.result ?? reviewsData.data ?? [];
		setReviews(Array.isArray(rawReviews) ? rawReviews.map(normalizeReview) : []);

		setOrders(parseOrders(await ordersResponse.json().catch(() => ({})), productId));

		const categoryData = await categoriesResponse.json().catch(() => ({}));
		const occasionData = await occasionsResponse.json().catch(() => ({}));
		setCategories(Array.isArray(categoryData) ? categoryData : categoryData.categories ?? []);
		setOccasions(Array.isArray(occasionData) ? occasionData : occasionData.occasions ?? []);
	};

	useEffect(() => {
		if (!productId) return;
		void (async () => {
			try {
				await loadProductData();
			} catch (loadError) {
				setError(loadError instanceof Error ? loadError.message : "Unable to load product.");
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId]);

	const otherPhotoPaths = useMemo(() => parseArray<string>(product?.other_photos_paths), [product]);
	const allReviewsRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

	/* ========================================================================
	   NEW PHOTO PREVIEWS

	   Without these, picking a new primary/other photo in the edit form gave
	   no visual confirmation at all — the Photos grid kept showing only the
	   already-saved images, so a selected file looked like it had no effect.
	========================================================================= */

	const primaryPreviewUrl = useMemo(() => (primaryPhoto ? URL.createObjectURL(primaryPhoto) : null), [primaryPhoto]);
	useEffect(() => {
		return () => {
			if (primaryPreviewUrl) URL.revokeObjectURL(primaryPreviewUrl);
		};
	}, [primaryPreviewUrl]);

	const otherPreviewUrls = useMemo(() => otherPhotos.map((file) => URL.createObjectURL(file)), [otherPhotos]);
	useEffect(() => {
		return () => {
			otherPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [otherPreviewUrls]);

	const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => (current ? { ...current, [key]: value } : current));

	const toggleId = (key: "categoryIds" | "occasionIds", value: number) => {
		if (!form) return;
		const next = form[key].includes(value) ? form[key].filter((id) => id !== value) : [...form[key], value];
		updateForm(key, next);
	};

	const addRequirement = () => {
		const value = newRequirement.trim();
		if (!value || !form) return;
		updateForm("customizeReqs", [...form.customizeReqs, value]);
		setNewRequirement("");
	};

	const removeOtherPhoto = (index: number) => {
		setOtherPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
	};

	/* ========================================================================
	   CANCEL EDIT — discards any unsaved changes and returns to the overview.
	========================================================================= */

	const handleCancelEdit = () => {
		if (product) setForm(initialForm(product));
		setPrimaryPhoto(null);
		setOtherPhotos([]);
		setNewRequirement("");
		setError("");
		setMessage("");
		setIsEditing(false);
	};

	const saveProduct = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!form || !productId) return;
		if (!form.name.trim() || !form.description.trim()) {
			setError("Product name and description are required.");
			return;
		}
		setSaving(true);
		setError("");
		setMessage("");
		try {
			const body = new FormData();
			body.append("mode", "edit");
			body.append("command_type", "admin");
			// Every other admin/customer endpoint in this app identifies its
			// record with an "<entity>_id" field (order_id, user_id, and the
			// product_id used by the /api/product/{id} read endpoint above).
			// This save call was the only one sending a bare "id", which is
			// almost certainly why edits weren't taking effect — the backend
			// likely never located the product to update.
			body.append("product_id", productId);
			body.append("name", form.name);
			body.append("description", form.description);
			body.append("market_price", form.marketPrice);
			body.append("selling_price", form.sellingPrice);
			body.append("reseller_price", form.resellerPrice);
			body.append("keywords", form.keywords);
			body.append("delivery", form.delivery);
			body.append("in_stock", form.inStock ? "available" : "unavailable");
			if (primaryPhoto) body.append("primary_photo", primaryPhoto);
			otherPhotos.forEach((photo) => body.append("other_photos[]", photo));
			form.categoryIds.forEach((id) => body.append("category_ids[]", String(id)));
			form.occasionIds.forEach((id) => body.append("occasion_ids[]", String(id)));
			form.customizeReqs.forEach((value) => body.append("customize_reqs[]", value));

			const response = await fetch("/api/admin/products", { method: "POST", body, credentials: "include" });
			const data = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(data.message || "Unable to update product.");

			// Re-fetch rather than trust our own optimistic state — this is
			// what makes newly uploaded photos (whose final stored filenames
			// are decided by the backend) show up correctly afterwards.
			await loadProductData();

			setPrimaryPhoto(null);
			setOtherPhotos([]);
			setMessage("Product updated successfully.");
			setIsEditing(false);
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Unable to update product.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#FBF9F7] text-sm text-[#2E2E2E]/60">
				<Loader2 className="mr-2 animate-spin" size={18} />
				Loading product...
			</main>
		);
	}

	if (error && !form) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[#FBF9F7] px-5">
				<div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
					<AlertCircle className="mx-auto text-red-600" />
					<p className="mt-3 text-sm text-red-700">{error}</p>
					<Link href="/admin/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#85161B]">
						<ArrowLeft size={16} />
						Back to products
					</Link>
				</div>
			</main>
		);
	}

	if (!product || !form) return null;

	/* ========================================================================
	   VIEW MODE
	========================================================================= */

	if (!isEditing) {
		return (
			<main className="min-h-screen bg-[#FBF9F7] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
				<div className="mx-auto max-w-7xl">
					<Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 hover:text-[#85161B]">
						<ArrowLeft size={16} />
						All products
					</Link>

					<div className="mt-6 flex flex-col justify-between gap-4 border-b border-[#E8DED7] pb-7 lg:flex-row lg:items-end">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">Product #{product.id}</p>
							<h1 className="mt-2 text-3xl font-bold text-[#2E2E2E]">{form.name}</h1>
							<p className="mt-2 text-sm text-[#2E2E2E]/55">
								Created {dateValue(product.created_at)} · {product.sold ?? 0} sold
							</p>
						</div>
						<Link
							href={`/product/${product.id}`}
							target="_blank"
							className="inline-flex items-center gap-2 rounded-xl border border-[#85161B]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#85161B] transition hover:bg-[#85161B]/5"
						>
							View storefront
						</Link>
					</div>

					{(error || message) && (
						<div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
							{error || message}
						</div>
					)}

					<ProductOverview
						product={product}
						form={form}
						otherPhotoPaths={otherPhotoPaths}
						reviews={reviews}
						orders={orders}
						averageRating={allReviewsRating}
						onEdit={() => setIsEditing(true)}
					/>
				</div>
			</main>
		);
	}

	/* ========================================================================
	   EDIT MODE
	========================================================================= */

	return (
		<main className="min-h-screen bg-[#FBF9F7] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
			<div className="mx-auto max-w-7xl">
				<button
					type="button"
					onClick={handleCancelEdit}
					className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 hover:text-[#85161B]"
				>
					<ArrowLeft size={16} />
					Back to product
				</button>

				<div className="mt-6 flex flex-col justify-between gap-4 border-b border-[#E8DED7] pb-7 lg:flex-row lg:items-end">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">Editing product #{product.id}</p>
						<h1 className="mt-2 text-3xl font-bold text-[#2E2E2E]">{form.name || "Untitled product"}</h1>
						<p className="mt-2 text-sm text-[#2E2E2E]/55">
							Created {dateValue(product.created_at)} · {product.sold ?? 0} sold
						</p>
					</div>
					<Link
						href={`/product/${product.id}`}
						target="_blank"
						className="inline-flex items-center gap-2 rounded-xl border border-[#85161B]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#85161B] transition hover:bg-[#85161B]/5"
					>
						View storefront
					</Link>
				</div>

				{(error || message) && (
					<div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
						{error || message}
					</div>
				)}

				<form onSubmit={saveProduct} className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
					<section className="space-y-5">
						{/* PRODUCT DETAILS */}
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
							<h2 className="text-base font-semibold text-[#2E2E2E]">Product details</h2>
							<div className="mt-5 space-y-4">
								<label className="block text-sm font-medium text-[#2E2E2E]">
									Name
									<input
										value={form.name}
										onChange={(event) => updateForm("name", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
								<label className="block text-sm font-medium text-[#2E2E2E]">
									Description
									<textarea
										value={form.description}
										onChange={(event) => updateForm("description", event.target.value)}
										rows={6}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
								<label className="block text-sm font-medium text-[#2E2E2E]">
									Keywords
									<input
										value={form.keywords}
										onChange={(event) => updateForm("keywords", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
							</div>
						</div>

						{/* PRICING */}
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
							<h2 className="text-base font-semibold text-[#2E2E2E]">Pricing and fulfilment</h2>
							<div className="mt-5 grid gap-4 sm:grid-cols-2">
								<label className="text-sm font-medium text-[#2E2E2E]">
									Market price
									<input
										type="number"
										value={form.marketPrice}
										onChange={(event) => updateForm("marketPrice", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
								<label className="text-sm font-medium text-[#2E2E2E]">
									Selling price
									<input
										type="number"
										value={form.sellingPrice}
										onChange={(event) => updateForm("sellingPrice", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
								<label className="text-sm font-medium text-[#2E2E2E]">
									Reseller price
									<input
										type="number"
										value={form.resellerPrice}
										onChange={(event) => updateForm("resellerPrice", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
								<label className="text-sm font-medium text-[#2E2E2E]">
									Delivery fee
									<input
										type="number"
										value={form.delivery}
										onChange={(event) => updateForm("delivery", event.target.value)}
										className="mt-1.5 w-full rounded-xl border border-[#E8DED7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
									/>
								</label>
							</div>
							<label className="mt-5 flex items-center gap-2.5 text-sm text-[#2E2E2E]">
								<input type="checkbox" checked={form.inStock} onChange={(event) => updateForm("inStock", event.target.checked)} className="h-4 w-4 accent-[#85161B]" />
								Available for purchase
							</label>
						</div>

						{/* CATEGORIES + OCCASIONS */}
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold text-[#2E2E2E]">Categories and occasions</h2>
								<Package size={18} className="text-[#85161B]" />
							</div>
							<div className="mt-5 grid gap-6 sm:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2E2E2E]/45">Categories</p>
									<div className="mt-3 space-y-2.5">
										{categories.map((category) => (
											<label key={category.id} className="flex items-center gap-2.5 text-sm text-[#2E2E2E]">
												<input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={() => toggleId("categoryIds", category.id)} className="accent-[#85161B]" />
												{category.name}
											</label>
										))}
									</div>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2E2E2E]/45">Occasions</p>
									<div className="mt-3 space-y-2.5">
										{occasions.map((occasion) => (
											<label key={occasion.id} className="flex items-center gap-2.5 text-sm text-[#2E2E2E]">
												<input type="checkbox" checked={form.occasionIds.includes(occasion.id)} onChange={() => toggleId("occasionIds", occasion.id)} className="accent-[#85161B]" />
												{occasion.name}
											</label>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<aside className="space-y-5">
						{/* PHOTOS */}
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold text-[#2E2E2E]">Photos</h2>
								<ImageIcon size={18} className="text-[#85161B]" />
							</div>

							{/* PRIMARY PHOTO */}
							<div className="mt-5">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2E2E2E]/45">Primary photo</p>
								<div className="relative mt-2.5 aspect-square w-28 overflow-hidden rounded-xl border border-[#E8DED7] bg-[#F7F2EE]">
									{primaryPreviewUrl || product.primary_photo_path ? (
										<img src={primaryPreviewUrl ?? imageUrl(product.primary_photo_path)} alt="Primary" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full w-full items-center justify-center text-[10px] text-[#2E2E2E]/40">No photo</div>
									)}
									{primaryPreviewUrl && (
										<span className="absolute left-1.5 top-1.5 rounded-full bg-[#85161B] px-2 py-0.5 text-[9px] font-semibold text-white">New</span>
									)}
								</div>
								<label className="mt-3 block text-xs font-medium text-[#2E2E2E]/65">
									Replace primary photo
									<input type="file" accept="image/*" onChange={(event) => setPrimaryPhoto(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-xs" />
								</label>
								{primaryPhoto && (
									<button type="button" onClick={() => setPrimaryPhoto(null)} className="mt-1.5 text-xs font-medium text-red-600 hover:underline">
										Undo change
									</button>
								)}
							</div>

							{/* OTHER PHOTOS */}
							<div className="mt-6 border-t border-[#F0E8E2] pt-5">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2E2E2E]/45">Other photos</p>
								<div className="mt-2.5 grid grid-cols-3 gap-2">
									{otherPhotoPaths.map((photo, index) => (
										<div key={`${photo}-${index}`} className="aspect-square overflow-hidden rounded-xl border border-[#E8DED7] bg-[#F7F2EE]">
											<img src={imageUrl(photo)} alt="Product" className="h-full w-full object-cover" />
										</div>
									))}
									{otherPreviewUrls.map((url, index) => (
										<div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-[#85161B]/40 bg-[#F7F2EE]">
											<img src={url} alt="New upload" className="h-full w-full object-cover" />
											<span className="absolute left-1 top-1 rounded-full bg-[#85161B] px-1.5 py-0.5 text-[8px] font-semibold text-white">New</span>
											<button
												type="button"
												onClick={() => removeOtherPhoto(index)}
												aria-label="Remove new photo"
												className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
											>
												<X size={12} />
											</button>
										</div>
									))}
								</div>
								<label className="mt-3 block text-xs font-medium text-[#2E2E2E]/65">
									Add other photos
									<input type="file" accept="image/*" multiple onChange={(event) => setOtherPhotos(Array.from(event.target.files ?? []))} className="mt-2 block w-full text-xs" />
								</label>
								<p className="mt-1.5 text-[10px] leading-4 text-[#2E2E2E]/40">Selecting new files here replaces the previous pending selection — remove any you don't want with the ✕ above before saving.</p>
							</div>
						</div>

						{/* CUSTOMIZATION REQUIREMENTS */}
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
							<div className="flex items-center justify-between">
								<h2 className="flex items-center gap-2 text-base font-semibold text-[#2E2E2E]">
									<PenLine size={17} className="text-[#85161B]" />
									Customization requirements
								</h2>
								<span className="text-xs text-[#2E2E2E]/45">{form.customizeReqs.length}</span>
							</div>
							<div className="mt-4 space-y-2">
								{form.customizeReqs.map((requirement, index) => (
									<div key={`${requirement}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-[#FBF9F7] px-3 py-2 text-sm text-[#2E2E2E]">
										<span className="truncate">{requirement}</span>
										<button
											type="button"
											onClick={() => updateForm("customizeReqs", form.customizeReqs.filter((_, itemIndex) => itemIndex !== index))}
											className="shrink-0 text-red-600 transition hover:text-red-700"
											aria-label="Remove requirement"
										>
											<Trash2 size={15} />
										</button>
									</div>
								))}
							</div>
							<div className="mt-3 flex gap-2">
								<input
									value={newRequirement}
									onChange={(event) => setNewRequirement(event.target.value)}
									placeholder="text:10:Name to print"
									className="min-w-0 flex-1 rounded-lg border border-[#E8DED7] px-3 py-2 text-sm outline-none transition focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10"
								/>
								<button type="button" onClick={addRequirement} aria-label="Add requirement" className="rounded-lg bg-[#85161B] px-3 text-white transition hover:bg-[#6f1116]">
									<Plus size={16} />
								</button>
							</div>
						</div>

						{/* ACTIONS */}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleCancelEdit}
								disabled={saving}
								className="flex-1 rounded-xl border border-[#E8DED7] bg-white px-4 py-3 text-sm font-semibold text-[#2E2E2E]/70 transition hover:border-[#85161B]/30 hover:text-[#85161B] disabled:cursor-not-allowed disabled:opacity-60"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={saving}
								className="inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#85161B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6f1116] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
								{saving ? "Saving product..." : "Save product changes"}
							</button>
						</div>
					</aside>
				</form>

				<div className="mt-5 grid gap-5 lg:grid-cols-2">
					<section className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-base font-semibold text-[#2E2E2E]">Reviews</h2>
							<span className="text-sm text-[#2E2E2E]/50">{reviews.length} · {allReviewsRating ? allReviewsRating.toFixed(1) : "0.0"}/5</span>
						</div>
						{reviews.length === 0 ? (
							<p className="mt-5 text-sm text-[#2E2E2E]/50">No reviews for this product yet.</p>
						) : (
							<div className="mt-4 space-y-4">
								{reviews.map((review) => (
									<article key={review.id} className="border-t border-[#F0E8E2] pt-4 first:border-0 first:pt-0">
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm font-semibold text-[#2E2E2E]">{review.name}</p>
											<span className="text-xs text-[#2E2E2E]/45">{review.date}</span>
										</div>
										<div className="mt-1">
											<ReviewStars rating={review.rating} />
										</div>
										<p className="mt-2 text-sm leading-6 text-[#2E2E2E]/65">{review.comment || "No written comment."}</p>
										{review.photos.length > 0 && (
											<div className="mt-2 flex gap-2">
												{review.photos.map((photo) => (
													<img key={photo} src={`${REVIEW_IMAGE_BASE_URL}${photo}`} alt="Review" className="h-12 w-12 rounded-lg object-cover" />
												))}
											</div>
										)}
									</article>
								))}
							</div>
						)}
					</section>

					<section className="rounded-2xl border border-[#E8DED7] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:p-6">
						<div className="flex items-center justify-between">
							<h2 className="flex items-center gap-2 text-base font-semibold text-[#2E2E2E]">
								<Truck size={17} className="text-[#85161B]" />
								Orders containing this product
							</h2>
							<span className="text-sm text-[#2E2E2E]/50">{orders.length}</span>
						</div>
						{orders.length === 0 ? (
							<p className="mt-5 text-sm text-[#2E2E2E]/50">No orders contain this product yet.</p>
						) : (
							<div className="mt-4 divide-y divide-[#F0E8E2]">
								{orders.map((order) => (
									<div key={order.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
										<div>
											<p className="text-sm font-semibold text-[#2E2E2E]">#{order.id}</p>
											<p className="mt-1 text-xs text-[#2E2E2E]/50">
												{order.customer} · {order.date} · {order.status}
											</p>
										</div>
										<Link
											href={`/admin/orders/${order.id}`}
											className="shrink-0 rounded-lg border border-[#85161B]/20 px-3 py-2 text-xs font-semibold text-[#85161B] transition hover:bg-[#85161B]/5"
										>
											View order
										</Link>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}