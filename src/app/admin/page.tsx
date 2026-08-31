"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ShoppingBag,
	Users,
	Package,
	IndianRupee,
	Plus,
	ClipboardList,
	Boxes,
	UserPlus,
	MoreHorizontal,
	AlertTriangle,
	AlertCircle,
} from "lucide-react";

/* ============================================================================
   HELPERS
============================================================================ */

function toNumber(value: unknown, fallback = 0): number {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/*
 * Unwraps whatever list wrapper shape the backend uses for a given
 * endpoint. Different admin endpoints have been observed (or are
 * expected) to nest their array under different keys — this checks
 * the common candidates before giving up.
 */
function unwrapList<T>(data: unknown, keys: string[]): T[] {
	if (Array.isArray(data)) {
		return data as T[];
	}

	if (data && typeof data === "object") {
		for (const key of keys) {
			const value = (data as Record<string, unknown>)[key];

			if (Array.isArray(value)) {
				return value as T[];
			}
		}
	}

	return [];
}

/* ============================================================================
   USERS (CUSTOMERS COUNT)
============================================================================ */

type RawUser = {
	id?: string | number;
	name?: string;
	email?: string;
	reseller?: string | boolean;
};

/* ============================================================================
   PRODUCTS (PRODUCT COUNT + LOW STOCK)

   NOTE:
   The admin product listing hasn't confirmed an explicit numeric
   stock field (customer-facing responses only had "in_stock" as
   available/out-of-stock text, not a count). This checks a few
   likely field names — if none are present for a product, it's
   left out of the low-stock list rather than guessing a number.
============================================================================ */

type RawAdminProduct = {
	id?: string | number;
	name?: string;
	stock?: string | number;
	quantity?: string | number;
	available_quantity?: string | number;
	in_stock?: string;
};

type LowStockProduct = {
	id: string;
	name: string;
	stock: number;
};

const LOW_STOCK_THRESHOLD = 10;

function getStockCount(raw: RawAdminProduct): number | null {
	const candidates = [raw.stock, raw.quantity, raw.available_quantity];

	for (const candidate of candidates) {
		if (candidate !== undefined && candidate !== null && candidate !== "") {
			const number = toNumber(candidate, NaN);

			if (Number.isFinite(number)) {
				return number;
			}
		}
	}

	return null;
}

/* ============================================================================
   ORDERS (REVENUE, ORDER COUNT, RECENT ORDERS)

   NOTE:
   Shape inferred from the customer-facing /api/orders response —
   "cart" and "address" arrive as JSON-encoded strings. Admin
   listings may additionally include a customer name field; a few
   likely names are checked, falling back to a generic label.
============================================================================ */

type AdminOrderStatus =
	| "Delivered"
	| "Processing"
	| "Shipped"
	| "Pending"
	| "Cancelled";

type RawAdminOrder = {
	id?: string | number;
	order_id?: string | number;
	order_status?: string;
	grand_total?: string | number;
	cart?: string;
	created_at?: string;
	customer_name?: string;
	name?: string;
	user_name?: string;
};

type RecentOrder = {
	id: string;
	customer: string;
	product: string;
	amount: number;
	status: AdminOrderStatus;
};

const STATUS_STYLES: Record<AdminOrderStatus, string> = {
	Delivered: "bg-green-50 text-green-700",
	Processing: "bg-blue-50 text-blue-700",
	Shipped: "bg-purple-50 text-purple-700",
	Pending: "bg-amber-50 text-amber-700",
	Cancelled: "bg-red-50 text-red-700",
};

function normalizeOrderStatus(rawStatus?: string): AdminOrderStatus {
	const key = (rawStatus ?? "").toLowerCase().replace(/[\s_-]+/g, "");

	if (key.includes("cancel")) return "Cancelled";
	if (key.includes("delivered")) return "Delivered";
	if (key.includes("shipped") || key.includes("dispatch")) return "Shipped";
	if (key.includes("process") || key.includes("accepted")) return "Processing";

	return "Pending";
}

function getFirstProductName(cartJson?: string): {
	name: string;
	extraCount: number;
} {
	if (!cartJson) {
		return { name: "—", extraCount: 0 };
	}

	try {
		const items: { name?: string }[] = JSON.parse(cartJson);

		if (Array.isArray(items) && items.length > 0) {
			return {
				name: items[0]?.name ?? "Untitled product",
				extraCount: items.length - 1,
			};
		}
	} catch (error) {
		console.error("Failed to parse order cart JSON:", error, cartJson);
	}

	return { name: "—", extraCount: 0 };
}

/* ============================================================================
   ADMIN DASHBOARD
============================================================================ */

export default function AdminPage() {
	/* =====================================================
	   USERS
	===================================================== */

	const [usersLoading, setUsersLoading] = useState(true);
	const [usersError, setUsersError] = useState("");
	const [customersCount, setCustomersCount] = useState(0);

	useEffect(() => {
		const fetchUsers = async () => {
			setUsersLoading(true);
			setUsersError("");

			try {
				const response = await fetch("/api/admin/users", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				const data = await response.json().catch(() => ({}));

				console.log("ADMIN USERS RESPONSE:", data);

				if (!response.ok) {
					throw new Error(
						(data as { message?: string })?.message ||
							"Unable to load users.",
					);
				}

				const users = unwrapList<RawUser>(data, ["users", "result", "data"]);

				setCustomersCount(users.length);
			} catch (err) {
				console.error("Fetch admin users failed:", err);
				setUsersError(
					err instanceof Error ? err.message : "Unable to load users.",
				);
			} finally {
				setUsersLoading(false);
			}
		};

		fetchUsers();
	}, []);

	/* =====================================================
	   PRODUCTS
	===================================================== */

	const [productsLoading, setProductsLoading] = useState(true);
	const [productsError, setProductsError] = useState("");
	const [productsCount, setProductsCount] = useState(0);
	const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			setProductsLoading(true);
			setProductsError("");

			try {
				const response = await fetch("/api/admin/products", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				const data = await response.json().catch(() => ({}));

				console.log("ADMIN PRODUCTS RESPONSE:", data);

				if (!response.ok) {
					throw new Error(
						(data as { message?: string })?.message ||
							"Unable to load products.",
					);
				}

				const rawProducts = unwrapList<RawAdminProduct>(data, [
					"products",
					"result",
					"data",
				]);

				setProductsCount(rawProducts.length);

				const low = rawProducts
					.map((raw): LowStockProduct | null => {
						const stock = getStockCount(raw);

						if (stock === null) {
							return null;
						}

						return {
							id: String(raw.id ?? raw.name ?? ""),
							name: raw.name ?? "Untitled product",
							stock,
						};
					})
					.filter(
						(item): item is LowStockProduct =>
							item !== null && item.stock <= LOW_STOCK_THRESHOLD,
					)
					.sort((a, b) => a.stock - b.stock)
					.slice(0, 5);

				setLowStock(low);
			} catch (err) {
				console.error("Fetch admin products failed:", err);
				setProductsError(
					err instanceof Error ? err.message : "Unable to load products.",
				);
			} finally {
				setProductsLoading(false);
			}
		};

		fetchProducts();
	}, []);

	/* =====================================================
	   ORDERS
	===================================================== */

	const [ordersLoading, setOrdersLoading] = useState(true);
	const [ordersError, setOrdersError] = useState("");
	const [totalOrders, setTotalOrders] = useState(0);
	const [totalRevenue, setTotalRevenue] = useState(0);
	const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

	useEffect(() => {
		const fetchOrders = async () => {
			setOrdersLoading(true);
			setOrdersError("");

			try {
				const response = await fetch("/api/admin/orders", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				const data = await response.json().catch(() => ({}));

				console.log("ADMIN ORDERS RESPONSE:", data);

				if (!response.ok) {
					throw new Error(
						(data as { message?: string })?.message ||
							"Unable to load orders.",
					);
				}

				const rawOrders = unwrapList<RawAdminOrder>(data, [
					"orders",
					"wishlist",
					"result",
					"data",
				]);

				setTotalOrders(rawOrders.length);

				setTotalRevenue(
					rawOrders.reduce(
						(sum, order) => sum + toNumber(order.grand_total, 0),
						0,
					),
				);

				const sorted = [...rawOrders].sort((a, b) => {
					const dateA = new Date(a.created_at ?? "").getTime();
					const dateB = new Date(b.created_at ?? "").getTime();
					return (Number.isFinite(dateB) ? dateB : 0) - (Number.isFinite(dateA) ? dateA : 0);
				});

				const recent = sorted.slice(0, 5).map((raw): RecentOrder => {
					const { name, extraCount } = getFirstProductName(raw.cart);

					return {
						id: String(raw.order_id ?? raw.id ?? "—"),
						customer:
							raw.customer_name ?? raw.name ?? raw.user_name ?? "Customer",
						product: extraCount > 0 ? `${name} +${extraCount} more` : name,
						amount: toNumber(raw.grand_total, 0),
						status: normalizeOrderStatus(raw.order_status),
					};
				});

				setRecentOrders(recent);
			} catch (err) {
				console.error("Fetch admin orders failed:", err);
				setOrdersError(
					err instanceof Error ? err.message : "Unable to load orders.",
				);
			} finally {
				setOrdersLoading(false);
			}
		};

		fetchOrders();
	}, []);

	/* =====================================================
	   STATS (derived from the three fetches above)
	===================================================== */

	const stats = useMemo(
		() => [
			{
				title: "Total Revenue",
				value: `₹${totalRevenue.toLocaleString("en-IN")}`,
				icon: IndianRupee,
				loading: ordersLoading,
				error: ordersError,
			},
			{
				title: "Total Orders",
				value: String(totalOrders),
				icon: ShoppingBag,
				loading: ordersLoading,
				error: ordersError,
			},
			{
				title: "Customers",
				value: customersCount.toLocaleString("en-IN"),
				icon: Users,
				loading: usersLoading,
				error: usersError,
			},
			{
				title: "Products",
				value: String(productsCount),
				icon: Package,
				loading: productsLoading,
				error: productsError,
			},
		],
		[
			totalRevenue,
			totalOrders,
			customersCount,
			productsCount,
			ordersLoading,
			usersLoading,
			productsLoading,
			ordersError,
			usersError,
			productsError,
		],
	);

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			<div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

				{/* =====================================================
				    HEADER
				===================================================== */}

				<div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#85161B]">
							Printing House Admin
						</p>

						<h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Good morning, Admin.
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
							Here's what's happening with your store today.
						</p>
					</div>

					<Link
						href="/admin/products/new"
						className="
							inline-flex
							items-center
							justify-center
							gap-2
							rounded-xl
							bg-[#85161B]
							px-5
							py-3
							text-sm
							font-semibold
							text-white
							transition-all
							hover:bg-[#721318]
							hover:shadow-lg
							active:scale-[0.98]
						"
					>
						<Plus size={17} />
						Add Product
					</Link>
				</div>

				{/* =====================================================
				    STATS
				===================================================== */}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => {
						const Icon = stat.icon;

						return (
							<div
								key={stat.title}
								className="
									rounded-2xl
									border
									border-[#E8DED7]
									bg-white
									p-5
									shadow-[0_4px_20px_rgba(80,40,20,0.04)]
									transition-all
									duration-200
									hover:-translate-y-0.5
									hover:shadow-[0_8px_25px_rgba(80,40,20,0.07)]
								"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7D6BF]/45 text-[#85161B]">
									<Icon size={20} />
								</div>

								<p className="mt-5 text-sm text-[#2E2E2E]/50">
									{stat.title}
								</p>

								{stat.loading ? (
									<span className="mt-2 inline-block h-7 w-20 animate-pulse rounded bg-[#F0EAE5]" />
								) : stat.error ? (
									<p className="mt-1 text-xs font-medium text-red-500">
										Unable to load
									</p>
								) : (
									<p className="mt-1 text-2xl font-bold tracking-tight text-[#2E2E2E]">
										{stat.value}
									</p>
								)}
							</div>
						);
					})}
				</div>

				{/* =====================================================
				    QUICK ACTIONS
				===================================================== */}

				<div className="mt-8">
					<h2 className="mb-4 text-lg font-semibold text-[#2E2E2E]">
						Quick actions
					</h2>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<Link
							href="/admin/products/new"
							className="group flex items-center gap-3 rounded-2xl border border-[#E8DED7] bg-white p-4 text-left transition-all hover:border-[#85161B]/30 hover:shadow-md"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D6BF]/40 text-[#85161B]">
								<Plus size={18} />
							</div>

							<div>
								<p className="text-sm font-semibold text-[#2E2E2E]">
									Add Product
								</p>
								<p className="mt-0.5 hidden text-xs text-[#2E2E2E]/45 sm:block">
									Create new listing
								</p>
							</div>
						</Link>

						<Link
							href="/admin/orders"
							className="group flex items-center gap-3 rounded-2xl border border-[#E8DED7] bg-white p-4 text-left transition-all hover:border-[#85161B]/30 hover:shadow-md"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D6BF]/40 text-[#85161B]">
								<ClipboardList size={18} />
							</div>

							<div>
								<p className="text-sm font-semibold text-[#2E2E2E]">
									View Orders
								</p>
								<p className="mt-0.5 hidden text-xs text-[#2E2E2E]/45 sm:block">
									Manage orders
								</p>
							</div>
						</Link>

						<Link
							href="/admin/inventory"
							className="group flex items-center gap-3 rounded-2xl border border-[#E8DED7] bg-white p-4 text-left transition-all hover:border-[#85161B]/30 hover:shadow-md"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D6BF]/40 text-[#85161B]">
								<Boxes size={18} />
							</div>

							<div>
								<p className="text-sm font-semibold text-[#2E2E2E]">
									Inventory
								</p>
								<p className="mt-0.5 hidden text-xs text-[#2E2E2E]/45 sm:block">
									Check stock
								</p>
							</div>
						</Link>

						<Link
							href="/admin/customers"
							className="group flex items-center gap-3 rounded-2xl border border-[#E8DED7] bg-white p-4 text-left transition-all hover:border-[#85161B]/30 hover:shadow-md"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7D6BF]/40 text-[#85161B]">
								<UserPlus size={18} />
							</div>

							<div>
								<p className="text-sm font-semibold text-[#2E2E2E]">
									Customers
								</p>
								<p className="mt-0.5 hidden text-xs text-[#2E2E2E]/45 sm:block">
									View customers
								</p>
							</div>
						</Link>
					</div>
				</div>

				{/* =====================================================
				    ORDERS + INVENTORY
				===================================================== */}

				<div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">

					{/* Recent Orders */}

					<div className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
						<div className="flex items-center justify-between border-b border-[#E8DED7] px-5 py-5">
							<div>
								<h2 className="font-semibold text-[#2E2E2E]">
									Recent Orders
								</h2>

								<p className="mt-1 text-xs text-[#2E2E2E]/45">
									Latest customer orders
								</p>
							</div>

							<Link
								href="/admin/orders"
								className="text-sm font-semibold text-[#85161B] hover:underline"
							>
								View all
							</Link>
						</div>

						{ordersLoading ? (
							<div className="flex items-center justify-center gap-3 px-5 py-14">
								<span className="h-5 w-5 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
								<p className="text-sm text-[#2E2E2E]/50">Loading orders...</p>
							</div>
						) : ordersError ? (
							<div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
								<AlertCircle size={22} className="text-red-500" />
								<p className="text-sm text-[#2E2E2E]/55">{ordersError}</p>
							</div>
						) : recentOrders.length === 0 ? (
							<div className="px-5 py-14 text-center text-sm text-[#2E2E2E]/45">
								No orders yet.
							</div>
						) : (
							<>
								{/* Desktop table */}

								<div className="hidden overflow-x-auto md:block">
									<table className="w-full">
										<thead>
											<tr className="border-b border-[#E8DED7] text-left">
												<th className="px-5 py-3 text-xs font-medium text-[#2E2E2E]/45">
													Order
												</th>

												<th className="px-5 py-3 text-xs font-medium text-[#2E2E2E]/45">
													Customer
												</th>

												<th className="px-5 py-3 text-xs font-medium text-[#2E2E2E]/45">
													Product
												</th>

												<th className="px-5 py-3 text-xs font-medium text-[#2E2E2E]/45">
													Amount
												</th>

												<th className="px-5 py-3 text-xs font-medium text-[#2E2E2E]/45">
													Status
												</th>

												<th />
											</tr>
										</thead>

										<tbody>
											{recentOrders.map((order) => (
												<tr
													key={order.id}
													className="border-b border-[#E8DED7]/70 last:border-0 hover:bg-[#FBF9F7]"
												>
													<td className="px-5 py-4 text-sm font-semibold text-[#85161B]">
														<Link href={`/admin/orders/${order.id}`} className="hover:underline">
															#{order.id}
														</Link>
													</td>

													<td className="px-5 py-4 text-sm text-[#2E2E2E]">
														{order.customer}
													</td>

													<td className="px-5 py-4 text-sm text-[#2E2E2E]/65">
														{order.product}
													</td>

													<td className="px-5 py-4 text-sm font-semibold text-[#2E2E2E]">
														₹{order.amount.toLocaleString("en-IN")}
													</td>

													<td className="px-5 py-4">
														<span
															className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
														>
															{order.status}
														</span>
													</td>

													<td className="px-5 py-4">
														<Link
															href={`/admin/orders/${order.id}`}
															className="text-[#2E2E2E]/35 hover:text-[#85161B]"
															aria-label={`More options for ${order.id}`}
														>
															<MoreHorizontal size={18} />
														</Link>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Mobile orders */}

								<div className="divide-y divide-[#E8DED7] md:hidden">
									{recentOrders.map((order) => (
										<Link
											key={order.id}
											href={`/admin/orders/${order.id}`}
											className="block p-4"
										>
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-[#85161B]">
														#{order.id}
													</p>

													<p className="mt-1 text-sm font-medium text-[#2E2E2E]">
														{order.customer}
													</p>

													<p className="mt-0.5 text-xs text-[#2E2E2E]/50">
														{order.product}
													</p>
												</div>

												<span
													className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
												>
													{order.status}
												</span>
											</div>

											<p className="mt-3 text-sm font-bold text-[#2E2E2E]">
												₹{order.amount.toLocaleString("en-IN")}
											</p>
										</Link>
									))}
								</div>
							</>
						)}
					</div>

					{/* =================================================
					    LOW STOCK
					================================================= */}

					<div className="rounded-2xl border border-[#E8DED7] bg-white">
						<div className="border-b border-[#E8DED7] px-5 py-5">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
									<AlertTriangle size={16} />
								</div>

								<div>
									<h2 className="font-semibold text-[#2E2E2E]">
										Low Stock
									</h2>

									<p className="text-xs text-[#2E2E2E]/45">
										Products needing attention
									</p>
								</div>
							</div>
						</div>

						{productsLoading ? (
							<div className="flex items-center justify-center gap-3 px-5 py-10">
								<span className="h-5 w-5 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
								<p className="text-sm text-[#2E2E2E]/50">Loading...</p>
							</div>
						) : productsError ? (
							<div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
								<AlertCircle size={20} className="text-red-500" />
								<p className="text-sm text-[#2E2E2E]/55">{productsError}</p>
							</div>
						) : lowStock.length === 0 ? (
							<div className="px-5 py-10 text-center text-sm text-[#2E2E2E]/45">
								All products are well stocked.
							</div>
						) : (
							<div className="divide-y divide-[#E8DED7]">
								{lowStock.map((product) => (
									<div
										key={product.id}
										className="flex items-center justify-between gap-4 px-5 py-4"
									>
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-[#2E2E2E]">
												{product.name}
											</p>

											<p className="mt-1 text-xs text-[#2E2E2E]/45">
												Only {product.stock} left
											</p>
										</div>

										<span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
											Low
										</span>
									</div>
								))}
							</div>
						)}

						<div className="p-5">
							<Link
								href="/admin/inventory"
								className="block w-full rounded-xl border border-[#85161B]/20 py-2.5 text-center text-sm font-semibold text-[#85161B] transition hover:bg-[#85161B] hover:text-white"
							>
								Manage Inventory
							</Link>
						</div>
					</div>
				</div>

				{/* =====================================================
				    FOOTER NOTE
				===================================================== */}

				<div className="mt-8 text-center">
					<p className="text-xs text-[#2E2E2E]/35">
						Printing House Admin Dashboard • Store overview
					</p>
				</div>

			</div>
		</main>
	);
}