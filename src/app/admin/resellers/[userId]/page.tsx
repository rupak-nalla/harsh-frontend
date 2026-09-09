"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Boxes,
	CheckCircle2,
	Loader2,
	Package,
	Plus,
	RefreshCw,
	Trash2,
	User,
	X,
	Edit3,
	Mail,
	Phone,
	Search,
} from "lucide-react";

/* ─────────────────────────────────────────
   PRODUCT IMAGE URL
───────────────────────────────────────── */

const PRODUCT_IMAGE_URL = "https://printinghouseujjain.in/assets/products/";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

interface UserDetails {
	id: number;
	name: string;
	phone: string;
	email: string;
	is_reseller: string;
	is_reseller_active: string;
	credit_eligibility: string;
}

interface Product {
	id: number;
	name: string;
	description?: string;
	variants?: string;
	primary_photo_path?: string;
	other_photos_paths?: string;
	market_price?: string;
	selling_price?: string;
	reseller_price?: string;
	category_ids?: string;
	occasion_ids?: string;
	in_stock?: string;
	sold?: number;
	customize_reqs?: string;
	keywords?: string;
	created_at?: string;
	updated_at?: string;
	delivery?: string;
	custom_reseller_price?: string;
}

interface Reseller {
	user: UserDetails;
	products: Product[];
}

interface ResellerApiResponse {
	status: number;
	message?: string;
	data?: Reseller[];
}

interface ProductsApiResponse {
	status?: number;
	message?: string;
	data?: Product[] | { products?: Product[] };
	products?: Product[];
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const getImageUrl = (path?: string | null) => {
	if (!path) return "";

	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	return `${PRODUCT_IMAGE_URL}${path.replace(/^\/+/, "")}`;
};

const formatCurrency = (value?: string | number | null) => {
	const amount = Number(value);

	if (!Number.isFinite(amount)) {
		return "₹0";
	}

	return `₹${amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})}`;
};

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */

export default function ResellerDetailsPage() {
	const params = useParams();
	const router = useRouter();

	const userId = String(params.userId || "");

	/* ─────────────────────────────────────
	   RESELLER STATE
	───────────────────────────────────── */

	const [reseller, setReseller] = useState<Reseller | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	/* ─────────────────────────────────────
	   MODAL STATE
	───────────────────────────────────── */

	const [showModal, setShowModal] = useState(false);

	const [action, setAction] = useState<"add" | "change" | "remove">("add");

	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const [resellerPrice, setResellerPrice] = useState("");

	const [updating, setUpdating] = useState(false);

	/* ─────────────────────────────────────
	   ALL PRODUCTS FOR ADD MODAL
	───────────────────────────────────── */

	const [allProducts, setAllProducts] = useState<Product[]>([]);

	const [loadingProducts, setLoadingProducts] = useState(false);

	const [productSearch, setProductSearch] = useState("");

	/* ─────────────────────────────────────
	   FETCH RESELLER
	───────────────────────────────────── */

	const fetchReseller = useCallback(
		async (isRefresh = false) => {
			if (!userId) return;

			try {
				if (isRefresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				setError("");

				const response = await fetch(
					`/api/admin/resellers?user_id=${encodeURIComponent(userId)}`,
					{
						method: "POST",
						credentials: "include",
						cache: "no-store",
					},
				);

				const text = await response.text();

				let data: ResellerApiResponse;

				try {
					data = JSON.parse(text);
				} catch {
					throw new Error(text || "Invalid server response.");
				}

				if (!response.ok) {
					throw new Error(
						data?.message || `Failed to fetch reseller (${response.status})`,
					);
				}

				if (data?.status !== 200) {
					throw new Error(data?.message || "Failed to fetch reseller details.");
				}

				const resellerData = data?.data?.[0];

				if (!resellerData) {
					throw new Error("Reseller not found.");
				}

				setReseller({
					...resellerData,
					products: resellerData.products || [],
				});
			} catch (err) {
				console.error("Fetch reseller error:", err);

				setError(
					err instanceof Error ? err.message : "Failed to load reseller.",
				);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[userId],
	);

	useEffect(() => {
		fetchReseller();
	}, [fetchReseller]);

	/* ─────────────────────────────────────
	   FETCH ALL PRODUCTS
	───────────────────────────────────── */

	const fetchAllProducts = async () => {
		try {
			setLoadingProducts(true);

			const response = await fetch("/api/admin/products", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const text = await response.text();

			let data: ProductsApiResponse;

			try {
				data = JSON.parse(text);
			} catch {
				throw new Error(text || "Invalid products response.");
			}

			if (!response.ok) {
				throw new Error(
					data?.message || `Failed to fetch products (${response.status})`,
				);
			}

			if (typeof data?.status === "number" && data.status !== 200) {
				throw new Error(data?.message || "Failed to fetch products.");
			}

			let products: Product[] = [];

			/*
			 * Supports common response structures:
			 *
			 * { data: [...] }
			 * { products: [...] }
			 * { data: { products: [...] } }
			 */

			if (Array.isArray(data?.data)) {
				products = data.data;
			} else if (Array.isArray(data?.products)) {
				products = data.products;
			} else if (
				data?.data &&
				typeof data.data === "object" &&
				Array.isArray(data.data.products)
			) {
				products = data.data.products;
			}

			setAllProducts(products);
		} catch (err) {
			console.error("Fetch all products error:", err);

			alert(err instanceof Error ? err.message : "Failed to load products.");
		} finally {
			setLoadingProducts(false);
		}
	};

	/* ─────────────────────────────────────
	   AVAILABLE PRODUCTS
	───────────────────────────────────── */

	const availableProducts = useMemo(() => {
		if (!reseller) return [];

		const assignedIds = new Set(reseller.products.map((product) => product.id));

		const search = productSearch.trim().toLowerCase();

		return allProducts.filter((product) => {
			/* Don't show already assigned products */
			if (assignedIds.has(product.id)) {
				return false;
			}

			/* No search */
			if (!search) {
				return true;
			}

			return (
				String(product.id).includes(search) ||
				(product.name || "").toLowerCase().includes(search)
			);
		});
	}, [allProducts, reseller, productSearch]);

	/* ─────────────────────────────────────
	   CLOSE MODAL
	───────────────────────────────────── */

	const closeModal = () => {
		if (updating) return;

		setShowModal(false);
		setSelectedProduct(null);
		setResellerPrice("");
		setProductSearch("");
		setAction("add");
	};

	/* ─────────────────────────────────────
	   OPEN ADD MODAL
	───────────────────────────────────── */

	const openAddModal = async () => {
		setAction("add");
		setSelectedProduct(null);
		setResellerPrice("");
		setProductSearch("");
		setShowModal(true);

		/*
		 * Fetch all products when the modal opens.
		 */
		await fetchAllProducts();
	};

	/* ─────────────────────────────────────
	   OPEN CHANGE MODAL
	───────────────────────────────────── */

	const openChangeModal = (product: Product) => {
		setAction("change");
		setSelectedProduct(product);

		setResellerPrice(
			product.custom_reseller_price || product.reseller_price || "",
		);

		setProductSearch("");

		setShowModal(true);
	};

	/* ─────────────────────────────────────
	   OPEN REMOVE MODAL
	───────────────────────────────────── */

	const openRemoveModal = (product: Product) => {
		setAction("remove");
		setSelectedProduct(product);
		setResellerPrice("");
		setProductSearch("");
		setShowModal(true);
	};

	/* ─────────────────────────────────────
	   SELECT PRODUCT FOR ADD
	───────────────────────────────────── */

	const selectProduct = (product: Product) => {
		setSelectedProduct(product);

		/*
		 * Don't automatically use the normal reseller price
		 * as the custom price.
		 *
		 * The admin explicitly enters the custom reseller price.
		 */
		setResellerPrice("");
	};

	/* ─────────────────────────────────────
	   UPDATE RESELLER
	───────────────────────────────────── */

	const updateReseller = async () => {
		if (!reseller) return;

		if (!selectedProduct) {
			alert("Please select a product.");
			return;
		}

		const productId = String(selectedProduct.id);

		if (!productId || Number(productId) <= 0) {
			alert("Please select a valid product.");
			return;
		}

		/* ─────────────────────────────────
		   PRICE VALIDATION
		───────────────────────────────── */

		if (action === "add" || action === "change") {
			const price = resellerPrice.trim();

			if (!price) {
				alert("Please enter a reseller price.");
				return;
			}

			const numericPrice = Number(price);

			if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
				alert("Reseller price must be greater than 0.");
				return;
			}
		}

		try {
			setUpdating(true);

			/* ─────────────────────────────
			   BACKEND REQUEST
			───────────────────────────── */

			const formData = new FormData();

			/*
			 * Browser sends:
			 *
			 * action
			 * user_id
			 * product_id
			 * reseller_price
			 *
			 * The Next.js proxy should add:
			 *
			 * command_type=admin
			 */

			formData.append("action", action);

			formData.append("user_id", String(reseller.user.id));

			formData.append("product_id", productId);

			if (action === "add" || action === "change") {
				formData.append("reseller_price", resellerPrice.trim());
			}

			console.log("UPDATE RESELLER REQUEST:", {
				action,
				user_id: String(reseller.user.id),
				product_id: productId,
				reseller_price: action === "remove" ? undefined : resellerPrice.trim(),
			});

			const response = await fetch("/api/admin/update_reseller", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			const text = await response.text();

			let data: {
				status?: number;
				message?: string;
				[key: string]: unknown;
			};

			try {
				data = JSON.parse(text);
			} catch {
				throw new Error(text || "Invalid server response.");
			}

			if (!response.ok) {
				throw new Error(data?.message || `Request failed (${response.status})`);
			}

			if (data?.status !== 200) {
				throw new Error(data?.message || "Failed to update reseller.");
			}

			/* ─────────────────────────────
			   REFRESH DATA
			───────────────────────────── */

			await fetchReseller(true);

			closeModal();

			/* ─────────────────────────────
			   SUCCESS MESSAGE
			───────────────────────────── */

			if (action === "add") {
				alert("Product added successfully.");
			} else if (action === "change") {
				alert("Reseller price updated successfully.");
			} else {
				alert("Product removed successfully.");
			}
		} catch (err) {
			console.error("Update reseller error:", err);

			alert(
				err instanceof Error
					? err.message
					: "Something went wrong while updating the reseller.",
			);
		} finally {
			setUpdating(false);
		}
	};

	/* ─────────────────────────────────────
	   LOADING
	───────────────────────────────────── */

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-[#85161B]" />

					<p className="text-sm text-gray-500">Loading reseller...</p>
				</div>
			</div>
		);
	}

	/* ─────────────────────────────────────
	   ERROR
	───────────────────────────────────── */

	if (error || !reseller) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
				<button
					onClick={() => router.push("/admin/resellers")}
					className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#85161B]"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Resellers
				</button>

				<div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
					<X className="mx-auto mb-3 h-8 w-8 text-red-500" />

					<h2 className="text-lg font-semibold text-gray-900">
						Unable to load reseller
					</h2>

					<p className="mt-2 text-sm text-gray-600">
						{error || "Reseller not found."}
					</p>

					<button
						onClick={() => fetchReseller()}
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1217]"
					>
						<RefreshCw className="h-4 w-4" />
						Try Again
					</button>
				</div>
			</div>
		);
	}

	/* ─────────────────────────────────────
	   PAGE
	───────────────────────────────────── */

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			{/* ─────────────────────────────
			    HEADER
			───────────────────────────── */}

			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Link
						href="/admin/resellers"
						className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#85161B]"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Resellers
					</Link>

					<h1 className="text-2xl font-bold text-gray-900">
						{reseller.user.name}
					</h1>

					<p className="mt-1 text-sm text-gray-500">
						Reseller #{reseller.user.id}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => fetchReseller(true)}
						disabled={refreshing}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<RefreshCw
							className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						Refresh
					</button>

					<button
						type="button"
						onClick={openAddModal}
						className="inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6f1217]"
					>
						<Plus className="h-4 w-4" />
						Add Product
					</button>
				</div>
			</div>

			{/* ─────────────────────────────
			    RESELLER INFORMATION
			───────────────────────────── */}

			<div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Name */}

				<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#85161B]/10">
						<User className="h-5 w-5 text-[#85161B]" />
					</div>

					<p className="text-xs font-medium uppercase tracking-wide text-gray-400">
						Name
					</p>

					<p className="mt-1 font-semibold text-gray-900">
						{reseller.user.name || "—"}
					</p>
				</div>

				{/* Email */}

				<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#85161B]/10">
						<Mail className="h-5 w-5 text-[#85161B]" />
					</div>

					<p className="text-xs font-medium uppercase tracking-wide text-gray-400">
						Email
					</p>

					<p className="mt-1 truncate font-semibold text-gray-900">
						{reseller.user.email || "—"}
					</p>
				</div>

				{/* Phone */}

				<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#85161B]/10">
						<Phone className="h-5 w-5 text-[#85161B]" />
					</div>

					<p className="text-xs font-medium uppercase tracking-wide text-gray-400">
						Phone
					</p>

					<p className="mt-1 font-semibold text-gray-900">
						{reseller.user.phone || "—"}
					</p>
				</div>

				{/* Products */}

				<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#85161B]/10">
						<Boxes className="h-5 w-5 text-[#85161B]" />
					</div>

					<p className="text-xs font-medium uppercase tracking-wide text-gray-400">
						Assigned Products
					</p>

					<p className="mt-1 font-semibold text-gray-900">
						{reseller.products.length}
					</p>
				</div>
			</div>

			{/* ─────────────────────────────
			    STATUS
			───────────────────────────── */}

			<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<span
							className={`h-2.5 w-2.5 rounded-full ${
								reseller.user.is_reseller_active === "yes"
									? "bg-green-500"
									: "bg-gray-400"
							}`}
						/>

						<span className="text-sm font-semibold text-gray-800">
							{reseller.user.is_reseller_active === "yes"
								? "Active Reseller"
								: "Inactive Reseller"}
						</span>
					</div>

					<span className="hidden h-4 w-px bg-gray-200 sm:block" />

					<span className="text-sm text-gray-500">
						Credit eligibility:{" "}
						<span className="font-medium text-gray-700">
							{reseller.user.credit_eligibility || "—"}
						</span>
					</span>
				</div>
			</div>

			{/* ─────────────────────────────
			    PRODUCTS HEADER
			───────────────────────────── */}

			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-900">Assigned Products</h2>

					<p className="mt-1 text-sm text-gray-500">
						Products and custom reseller prices
					</p>
				</div>

				<span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
					{reseller.products.length} products
				</span>
			</div>

			{/* ─────────────────────────────
			    EMPTY PRODUCTS
			───────────────────────────── */}

			{reseller.products.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
						<Package className="h-7 w-7 text-gray-300" />
					</div>

					<h3 className="mt-4 font-semibold text-gray-900">
						No products assigned
					</h3>

					<p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
						Add a product and set a custom reseller price for this reseller.
					</p>

					<button
						type="button"
						onClick={openAddModal}
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6f1217]"
					>
						<Plus className="h-4 w-4" />
						Add Product
					</button>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{reseller.products.map((product) => (
						<div
							key={product.id}
							className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
						>
							{/* Image */}

							<div className="relative aspect-square bg-gray-50">
								{product.primary_photo_path ? (
									<img
										src={getImageUrl(product.primary_photo_path)}
										alt={product.name || `Product #${product.id}`}
										className="h-full w-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								) : (
									<div className="flex h-full items-center justify-center">
										<Package className="h-12 w-12 text-gray-200" />
									</div>
								)}

								<div className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
									#{product.id}
								</div>
							</div>

							{/* Details */}

							<div className="p-4">
								<h3 className="truncate font-semibold text-gray-900">
									{product.name || `Product #${product.id}`}
								</h3>

								<div className="mt-3 space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-500">Market price</span>

										<span className="font-medium text-gray-700">
											{formatCurrency(product.market_price)}
										</span>
									</div>

									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-500">Selling price</span>

										<span className="font-medium text-gray-700">
											{formatCurrency(product.selling_price)}
										</span>
									</div>

									<div className="flex items-center justify-between rounded-lg bg-[#85161B]/5 px-3 py-2">
										<span className="text-sm font-medium text-[#85161B]">
											Reseller price
										</span>

										<span className="font-bold text-[#85161B]">
											{formatCurrency(
												product.custom_reseller_price || product.reseller_price,
											)}
										</span>
									</div>
								</div>

								{/* Actions */}

								<div className="mt-4 grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() => openChangeModal(product)}
										className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
									>
										<Edit3 className="h-3.5 w-3.5" />
										Change Price
									</button>

									<button
										type="button"
										onClick={() => openRemoveModal(product)}
										className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
									>
										<Trash2 className="h-3.5 w-3.5" />
										Remove
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* ─────────────────────────────────
			    ADD / CHANGE / REMOVE MODAL
			───────────────────────────────── */}

			{showModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
					onClick={closeModal}
				>
					<div
						className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* ─────────────────────────
						    MODAL HEADER
						───────────────────────── */}

						<div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
							<div>
								<h2 className="text-xl font-semibold text-gray-900">
									{action === "add"
										? "Add Product"
										: action === "change"
											? "Change Reseller Price"
											: "Remove Product"}
								</h2>

								<p className="mt-1 text-sm text-gray-500">
									{action === "add"
										? "Select a product and set its reseller price"
										: action === "change"
											? "Update the custom price for this product"
											: "Remove this product from the reseller"}
								</p>
							</div>

							<button
								type="button"
								onClick={closeModal}
								disabled={updating}
								className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* ─────────────────────────
						    MODAL BODY
						───────────────────────── */}

						<div className="space-y-5 px-6 py-6">
							{/* ═══════════════════════
							    ADD PRODUCT
							═══════════════════════ */}

							{action === "add" && (
								<div>
									<label
										htmlFor="product-search"
										className="mb-2 block text-sm font-semibold text-gray-700"
									>
										Select Product
									</label>

									{/* Search */}

									<div className="relative">
										<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

										<input
											id="product-search"
											type="text"
											value={productSearch}
											onChange={(e) => setProductSearch(e.target.value)}
											placeholder="Search products by name or ID..."
											disabled={updating || loadingProducts}
											className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
										/>
									</div>

									{/* Product List */}

									<div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2">
										{loadingProducts ? (
											<div className="flex flex-col items-center justify-center py-10">
												<Loader2 className="h-6 w-6 animate-spin text-[#85161B]" />

												<p className="mt-2 text-sm text-gray-500">
													Loading products...
												</p>
											</div>
										) : availableProducts.length === 0 ? (
											<div className="py-10 text-center">
												<Package className="mx-auto h-8 w-8 text-gray-300" />

												<p className="mt-2 text-sm font-medium text-gray-700">
													No products found
												</p>

												<p className="mt-1 px-4 text-xs text-gray-400">
													{allProducts.length === 0
														? "No products are available."
														: productSearch
															? "Try a different product name or ID."
															: "All products are already assigned to this reseller."}
												</p>
											</div>
										) : (
											<div className="space-y-1">
												{availableProducts.map((product) => {
													const isSelected = selectedProduct?.id === product.id;

													return (
														<button
															key={product.id}
															type="button"
															disabled={updating}
															onClick={() => selectProduct(product)}
															className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
																isSelected
																	? "border-[#85161B] bg-[#85161B]/5"
																	: "border-transparent hover:border-gray-100 hover:bg-gray-50"
															}`}
														>
															{/* Product image */}

															<div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
																{product.primary_photo_path ? (
																	<img
																		src={getImageUrl(
																			product.primary_photo_path,
																		)}
																		alt={
																			product.name || `Product #${product.id}`
																		}
																		className="h-full w-full object-cover"
																		onError={(e) => {
																			e.currentTarget.style.display = "none";
																		}}
																	/>
																) : (
																	<div className="flex h-full w-full items-center justify-center">
																		<Package className="h-6 w-6 text-gray-300" />
																	</div>
																)}
															</div>

															{/* Product details */}

															<div className="min-w-0 flex-1">
																<p className="truncate text-sm font-semibold text-gray-900">
																	{product.name || `Product #${product.id}`}
																</p>

																<p className="mt-0.5 text-xs text-gray-400">
																	Product #{product.id}
																</p>

																<div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
																	<span className="text-gray-500">
																		Selling:{" "}
																		<span className="font-medium text-gray-700">
																			{formatCurrency(product.selling_price)}
																		</span>
																	</span>

																	{product.reseller_price && (
																		<span className="text-[#85161B]">
																			Standard reseller:{" "}
																			<span className="font-medium">
																				{formatCurrency(product.reseller_price)}
																			</span>
																		</span>
																	)}
																</div>
															</div>

															{/* Selected icon */}

															{isSelected && (
																<CheckCircle2 className="h-5 w-5 shrink-0 text-[#85161B]" />
															)}
														</button>
													);
												})}
											</div>
										)}
									</div>
								</div>
							)}

							{/* ═══════════════════════
							    CHANGE / REMOVE PRODUCT
							═══════════════════════ */}

							{action !== "add" && selectedProduct && (
								<div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
									<div className="flex items-center gap-3">
										<div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
											{selectedProduct.primary_photo_path ? (
												<img
													src={getImageUrl(selectedProduct.primary_photo_path)}
													alt={
														selectedProduct.name ||
														`Product #${selectedProduct.id}`
													}
													className="h-full w-full object-cover"
													onError={(e) => {
														e.currentTarget.style.display = "none";
													}}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Package className="h-6 w-6 text-gray-300" />
												</div>
											)}
										</div>

										<div className="min-w-0">
											<p className="text-xs font-medium text-gray-400">
												Product #{selectedProduct.id}
											</p>

											<p className="truncate text-sm font-semibold text-gray-800">
												{selectedProduct.name ||
													`Product #${selectedProduct.id}`}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* ═══════════════════════
							    SELECTED PRODUCT FOR ADD
							═══════════════════════ */}

							{action === "add" && selectedProduct && (
								<div className="rounded-xl border border-[#85161B]/20 bg-[#85161B]/5 p-4">
									<div className="flex items-center gap-3">
										<div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
											{selectedProduct.primary_photo_path ? (
												<img
													src={getImageUrl(selectedProduct.primary_photo_path)}
													alt={
														selectedProduct.name ||
														`Product #${selectedProduct.id}`
													}
													className="h-full w-full object-cover"
													onError={(e) => {
														e.currentTarget.style.display = "none";
													}}
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center">
													<Package className="h-5 w-5 text-gray-300" />
												</div>
											)}
										</div>

										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium text-[#85161B]/70">
												Selected Product #{selectedProduct.id}
											</p>

											<p className="truncate text-sm font-semibold text-gray-900">
												{selectedProduct.name ||
													`Product #${selectedProduct.id}`}
											</p>
										</div>

										<button
											type="button"
											onClick={() => selectProduct(selectedProduct)}
											disabled={updating}
											className="shrink-0 text-xs font-medium text-gray-500 hover:text-[#85161B]"
										>
											Change
										</button>
									</div>
								</div>
							)}

							{/* ═══════════════════════
							    RESELLER PRICE
							═══════════════════════ */}

							{action !== "remove" && selectedProduct && (
								<div>
									<label
										htmlFor="reseller-price"
										className="mb-2 block text-sm font-semibold text-gray-700"
									>
										Reseller Price
									</label>

									<div className="relative">
										<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
											₹
										</span>

										<input
											id="reseller-price"
											type="number"
											min="0.01"
											step="0.01"
											value={resellerPrice}
											onChange={(e) => setResellerPrice(e.target.value)}
											placeholder="Enter custom reseller price"
											disabled={updating}
											className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#85161B] focus:ring-2 focus:ring-[#85161B]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
										/>
									</div>

									<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
										{selectedProduct.selling_price && (
											<span>
												Selling price:{" "}
												<span className="font-medium text-gray-600">
													{formatCurrency(selectedProduct.selling_price)}
												</span>
											</span>
										)}

										{selectedProduct.reseller_price && (
											<span>
												Standard reseller:{" "}
												<span className="font-medium text-gray-600">
													{formatCurrency(selectedProduct.reseller_price)}
												</span>
											</span>
										)}
									</div>

									<p className="mt-1 text-xs text-gray-400">
										This is the custom price this reseller will pay.
									</p>
								</div>
							)}

							{/* ═══════════════════════
							    REMOVE WARNING
							═══════════════════════ */}

							{action === "remove" && selectedProduct && (
								<div className="rounded-xl border border-red-100 bg-red-50 p-4">
									<div className="flex gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
											<Trash2 className="h-4 w-4 text-red-600" />
										</div>

										<div>
											<p className="text-sm font-semibold text-red-800">
												Remove this product?
											</p>

											<p className="mt-1 text-xs leading-5 text-red-600">
												This will remove the custom reseller price and unassign
												the product from this reseller.
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* ─────────────────────────
						    MODAL FOOTER
						───────────────────────── */}

						<div className="flex gap-3 border-t border-gray-100 px-6 py-5">
							<button
								type="button"
								onClick={closeModal}
								disabled={updating}
								className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={updateReseller}
								disabled={
									updating ||
									!selectedProduct ||
									(action !== "remove" &&
										(!resellerPrice.trim() || Number(resellerPrice) <= 0))
								}
								className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${
									action === "remove"
										? "bg-red-600 hover:bg-red-700"
										: "bg-[#85161B] hover:bg-[#6f1217]"
								}`}
							>
								{updating ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />

										{action === "add"
											? "Adding..."
											: action === "change"
												? "Updating..."
												: "Removing..."}
									</>
								) : action === "add" ? (
									<>
										<Plus className="h-4 w-4" />
										Add Product
									</>
								) : action === "change" ? (
									<>
										<CheckCircle2 className="h-4 w-4" />
										Update Price
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4" />
										Remove Product
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
