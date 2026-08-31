
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Search,
	ChevronRight,
	ClipboardList,
	Loader2,
	AlertCircle,
	MapPin,
} from "lucide-react";

/* ============================================================================
   TYPES
============================================================================ */

type OrderStatus =
	| "Delivered"
	| "Processing"
	| "Shipped"
	| "Pending"
	| string;

type CartProduct = {
	id?: number | string;
	name?: string;
	quantity?: number | string;
	qty?: number | string;
	price?: number | string;
	total_price?: number | string;
	[key: string]: unknown;
};

type OrderAddress = {
	name?: string;
	flat_house_building?: string;
	road_area_colony?: string;
	city?: string;
	state?: string;
	pincode?: string;
	landmark?: string;
	phone?: string;
	[key: string]: unknown;
};

type BackendOrder = {
	id: number | string;
	user_id?: number | string | null;
	cart_id?: number | string | null;
	type?: string | null;
	delivery_method?: string | null;
	order_id?: string | null;
	payment_status?: string | null;
	order_status?: string | null;
	address?: string | OrderAddress | null;
	transaction_id?: string | null;
	products_count?: number | string | null;
	total_price?: number | string | null;
	delivery_fee?: number | string | null;
	grand_total?: number | string | null;
	cart?: string | CartProduct[] | null;
	created_at?: string | null;
	createdAt?: string | null;
	order_date?: string | null;
	orderDate?: string | null;
	date?: string | null;

	[key: string]: unknown;
};

type Order = {
	id: string;
	customer: string;
	product: string;
	items: number;
	amount: number;
	status: OrderStatus;
	date: string;
	address: string;
};

/* ============================================================================
   STATUS FILTERS
============================================================================ */

const STATUS_FILTERS: (OrderStatus | "All")[] = [
	"All",
	"Pending",
	"Processing",
	"Shipped",
	"Delivered",
];

/* ============================================================================
   STATUS STYLES
============================================================================ */

const STATUS_STYLES: Record<string, string> = {
	Delivered: "bg-[#EDF8F0] text-[#31824A]",
	Processing: "bg-[#EEF5FF] text-[#3973B9]",
	Shipped: "bg-[#F3EBFA] text-[#8B4FC7]",
	Pending: "bg-[#FFF3E8] text-[#B56B27]",

	delivered: "bg-[#EDF8F0] text-[#31824A]",
	processing: "bg-[#EEF5FF] text-[#3973B9]",
	shipped: "bg-[#F3EBFA] text-[#8B4FC7]",
	pending: "bg-[#FFF3E8] text-[#B56B27]",
};

/* ============================================================================
   PARSE CART
============================================================================ */

function parseCart(
	cart: string | CartProduct[] | null | undefined,
): CartProduct[] {
	if (!cart) {
		return [];
	}

	if (Array.isArray(cart)) {
		return cart;
	}

	try {
		const parsed = JSON.parse(cart);

		return Array.isArray(parsed)
			? parsed
			: [];
	} catch (error) {
		console.error(
			"Failed to parse order cart:",
			error,
		);

		return [];
	}
}

/* ============================================================================
   PARSE ADDRESS
============================================================================ */

function parseAddress(
	address: string | OrderAddress | null | undefined,
): OrderAddress | null {
	if (!address) {
		return null;
	}

	if (typeof address === "object") {
		return address;
	}

	try {
		const parsed = JSON.parse(address);

		if (
			typeof parsed === "object" &&
			parsed !== null
		) {
			return parsed;
		}

		return null;
	} catch (error) {
		console.error(
			"Failed to parse order address:",
			error,
		);

		return null;
	}
}

/* ============================================================================
   FORMAT ADDRESS
============================================================================ */

function formatAddress(
	address: string | OrderAddress | null | undefined,
): string {
	const parsed = parseAddress(address);

	if (!parsed) {
		return "—";
	}

	const parts = [
		parsed.flat_house_building,
		parsed.road_area_colony,
		parsed.landmark,
		parsed.city,
		parsed.state,
		parsed.pincode,
	].filter(
		(value) =>
			value !== undefined &&
			value !== null &&
			String(value).trim() !== "",
	);

	return parts.length > 0
		? parts.join(", ")
		: "—";
}

/* ============================================================================
   FORMAT STATUS
============================================================================ */

function formatStatus(
	status: unknown,
): string {
	if (!status) {
		return "Pending";
	}

	const value = String(status)
		.trim()
		.toLowerCase();

	switch (value) {
		case "pending":
			return "Pending";

		case "processing":
		case "process":
		case "confirmed":
		case "confirm":
			return "Processing";

		case "shipped":
		case "shipping":
		case "dispatch":
		case "dispatched":
		case "out_for_delivery":
		case "out for delivery":
			return "Shipped";

		case "delivered":
		case "completed":
		case "complete":
			return "Delivered";

		default:
			return String(status);
	}
}

/* ============================================================================
   FORMAT DATE
============================================================================ */

function formatDate(
	value: unknown,
): string {
	if (!value) {
		return "—";
	}

	const valueString = String(value);

	const date = new Date(
		valueString,
	);

	if (Number.isNaN(date.getTime())) {
		return valueString;
	}

	return date.toLocaleDateString(
		"en-IN",
		{
			day: "2-digit",
			month: "short",
			year: "numeric",
		},
	);
}

/* ============================================================================
   FORMAT AMOUNT
============================================================================ */

function formatAmount(
	value: unknown,
): number {
	const amount = Number(value);

	return Number.isFinite(amount)
		? amount
		: 0;
}

/* ============================================================================
   GET CUSTOMER
============================================================================ */

function getCustomerName(
	order: BackendOrder,
): string {
	const userId = order.user_id;

	if (
		userId === null ||
		userId === undefined ||
		String(userId).trim() === ""
	) {
		return "Guest";
	}

	return `User #${userId}`;
}

/* ============================================================================
   NORMALIZE ORDER
============================================================================ */

function normalizeOrder(
	order: BackendOrder,
): Order {
	const cartProducts = parseCart(
		order.cart,
	);

	const firstProduct =
		cartProducts[0];

	const productName =
		firstProduct?.name ||
		(cartProducts.length > 0
			? "Order items"
			: "—");

	const calculatedItems =
		cartProducts.reduce(
			(total, product) => {
				const quantity =
					Number(
						product.quantity ??
							product.qty ??
							1,
					) || 1;

				return total + quantity;
			},
			0,
		);

	const items =
		Number(order.products_count) ||
		calculatedItems ||
		1;

	const amount =
		formatAmount(
			order.grand_total,
		) ||
		formatAmount(
			order.total_price,
		);

	const dateValue =
		order.created_at ??
		order.createdAt ??
		order.order_date ??
		order.orderDate ??
		order.date;

	return {
		id: String(
			order.order_id ??
				order.id,
		),

		customer:
			getCustomerName(order),

		product: productName,

		items,

		amount,

		status: formatStatus(
			order.order_status,
		),

		date: formatDate(
			dateValue,
		),

		address: formatAddress(
			order.address,
		),
	};
}

/* ============================================================================
   EXTRACT ORDERS
============================================================================ */

function extractOrders(
	data: unknown,
): Order[] {
	if (
		typeof data !== "object" ||
		data === null
	) {
		return [];
	}

	const response =
		data as {
			orders?: unknown;
		};

	if (
		!Array.isArray(
			response.orders,
		)
	) {
		return [];
	}

	return response.orders
		.filter(
			(order): order is BackendOrder =>
				typeof order ===
					"object" &&
				order !== null &&
				!Array.isArray(
					order,
				),
		)
		.map(normalizeOrder);
}

/* ============================================================================
   PAGE
============================================================================ */

export default function AdminOrdersPage() {
	const [orders, setOrders] =
		useState<Order[]>([]);

	const [query, setQuery] =
		useState("");

	const [statusFilter, setStatusFilter] =
		useState<OrderStatus | "All">(
			"All",
		);

	const [isLoading, setIsLoading] =
		useState(true);

	const [error, setError] =
		useState("");

	/* ========================================================================
	   FETCH ORDERS
	========================================================================= */

	useEffect(() => {
		let isMounted = true;

		const fetchOrders = async () => {
			try {
				setIsLoading(true);
				setError("");

				const response =
					await fetch(
						"/api/admin/orders",
						{
							method: "GET",
							credentials:
								"include",
							cache: "no-store",
						},
					);

				const text =
					await response.text();

				console.log(
					"Admin orders HTTP status:",
					response.status,
				);

				console.log(
					"Admin orders raw response:",
					text,
				);

				let data: unknown;

				try {
					data = text
						? JSON.parse(
								text,
							)
						: {};
				} catch {
					throw new Error(
						"Invalid JSON response from admin orders API.",
					);
				}

				if (!response.ok) {
					let message =
						"Unable to fetch admin orders.";

					if (
						typeof data ===
							"object" &&
						data !==
							null &&
						"message" in
							data &&
						typeof data.message ===
							"string"
					) {
						message =
							data.message;
					}

					throw new Error(
						message,
					);
				}

				const fetchedOrders =
					extractOrders(
						data,
					);

				console.log(
					"Extracted admin orders:",
					fetchedOrders,
				);

				if (
					isMounted
				) {
					setOrders(
						fetchedOrders,
					);
				}
			} catch (error) {
				console.error(
					"Failed to fetch admin orders:",
					error,
				);

				if (
					isMounted
				) {
					setOrders(
						[],
					);

					setError(
						error instanceof
							Error
							? error.message
							: "Unable to fetch orders. Please try again.",
					);
				}
			} finally {
				if (
					isMounted
				) {
					setIsLoading(
						false,
					);
				}
			}
		};

		fetchOrders();

		return () => {
			isMounted = false;
		};
	}, []);

	/* ========================================================================
	   FILTER
	========================================================================= */

	const filteredOrders =
		useMemo(() => {
			const normalizedQuery =
				query
					.trim()
					.toLowerCase();

			return orders.filter(
				(order) => {
					const matchesStatus =
						statusFilter ===
							"All" ||
						order.status.toLowerCase() ===
							statusFilter.toLowerCase();

					const matchesQuery =
						normalizedQuery ===
							"" ||
						order.id
							.toLowerCase()
							.includes(
								normalizedQuery,
							) ||
						order.customer
							.toLowerCase()
							.includes(
								normalizedQuery,
							) ||
						order.product
							.toLowerCase()
							.includes(
								normalizedQuery,
							) ||
						order.address
							.toLowerCase()
							.includes(
								normalizedQuery,
							);

					return (
						matchesStatus &&
						matchesQuery
					);
				},
			);
		}, [
			orders,
			query,
			statusFilter,
		]);

	/* ========================================================================
	   RENDER
	========================================================================= */

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');

				.font-display {
					font-family: 'Fraunces', Georgia, serif;
				}
			`}</style>

			<div className="mx-auto max-w-8xl px-5 py-10 sm:px-6 lg:px-8">
				{/* HEADER */}

				<Link
					href="/admin"
					className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
				>
					<ArrowLeft size={16} />
					Back to dashboard
				</Link>

				<div className="mt-6">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
						Orders
					</p>

					<h1 className="font-display mt-1 text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
						All Orders
					</h1>

					<p className="mt-2 text-sm text-[#2E2E2E]/55">
						{isLoading
							? "Loading orders..."
							: `${filteredOrders.length} of ${orders.length} orders`}
					</p>
				</div>

				{/* FILTERS */}

				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative w-full sm:max-w-xs">
						<Search
							size={16}
							className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35"
						/>

						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search order, customer, product..."
							className="w-full rounded-xl border border-[#E8DED7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2E2E2E] outline-none transition placeholder:text-[#2E2E2E]/35 focus:border-[#85161B]/40 focus:ring-2 focus:ring-[#85161B]/10"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{STATUS_FILTERS.map((status) => (
							<button
								key={status}
								type="button"
								onClick={() => setStatusFilter(status)}
								className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
									statusFilter === status
										? "bg-[#85161B] text-white shadow-sm"
										: "border border-[#E8DED7] bg-white text-[#2E2E2E]/60 hover:border-[#85161B]/30"
								}`}
							>
								{status}
							</button>
						))}
					</div>
				</div>

				{/* ERROR */}

				{error && (
					<div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
						<AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

						<div>
							<p className="text-sm font-semibold text-red-700">
								Unable to load orders
							</p>

							<p className="mt-1 text-xs text-red-600">{error}</p>
						</div>
					</div>
				)}

				{/* TABLE */}

				{/* TABLE */}

				<div className="mt-6 overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
					{isLoading ? (
						<div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7D6BF]/40">
								<Loader2 size={24} className="animate-spin text-[#85161B]" />
							</div>

							<p className="mt-4 text-sm font-semibold text-[#2E2E2E]">
								Loading orders
							</p>

							<p className="mt-1 text-xs text-[#2E2E2E]/45">
								Fetching orders from the server...
							</p>
						</div>
					) : filteredOrders.length > 0 ? (
						<div className="w-full overflow-x-auto">
							<table className="w-full table-fixed text-left text-sm">
								<colgroup>
									<col className="w-[15%]" />
									<col className="w-[9%]" />
									<col className="w-[17%]" />
									<col className="w-[8%]" />
									<col className="w-[9%]" />
									<col className="w-[31%]" />
									<col className="w-[11%]" />
								</colgroup>

								<thead>
									<tr className="border-b border-[#EEE6E1] text-xs text-[#2E2E2E]/40">
										<th className="px-4 py-3.5 font-medium sm:px-5">Order</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">
											Customer
										</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">Product</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">Amount</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">Status</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">Address</th>

										<th className="px-4 py-3.5 font-medium sm:px-5">Date</th>
									</tr>
								</thead>

								<tbody className="divide-y divide-[#EEE6E1]">
									{filteredOrders.map((order, index) => (
										<tr
											key={`${order.id}-${index}`}
											className="hover:bg-[#FBF9F7]"
										>
											{/* ORDER */}

											<td className="px-4 py-4 sm:px-5">
												<Link
													href={`/admin/orders/${order.id}`}
													className="block truncate font-semibold text-[#85161B] hover:underline"
													title={`#${order.id}`}
												>
													#{order.id}
												</Link>
											</td>

											{/* CUSTOMER */}

											<td className="px-4 py-4 sm:px-5">
												<span
													className={`block truncate ${
														order.customer === "Guest"
															? "font-semibold text-[#8A6A5B]"
															: "text-[#2E2E2E]"
													}`}
												>
													{order.customer}
												</span>
											</td>

											{/* PRODUCT */}

											<td className="px-4 py-4 sm:px-5">
												<div className="min-w-0" title={order.product}>
													<p className="truncate text-[#2E2E2E]/70">
														{order.product}
													</p>

													{order.items > 1 && (
														<span className="block truncate text-[#2E2E2E]/40">
															+{order.items - 1} more
														</span>
													)}
												</div>
											</td>

											{/* AMOUNT */}

											<td className="whitespace-nowrap px-4 py-4 font-semibold text-[#2E2E2E] sm:px-5">
												₹{order.amount.toLocaleString("en-IN")}
											</td>

											{/* STATUS */}

											<td className="px-4 py-4 sm:px-5">
												<span
													className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
														STATUS_STYLES[order.status] ||
														"bg-gray-100 text-gray-600"
													}`}
												>
													{order.status}
												</span>
											</td>

											{/* ADDRESS */}

											<td className="px-4 py-4 sm:px-5">
												<div className="flex min-w-0 items-start gap-2">
													<MapPin
														size={15}
														className="mt-0.5 shrink-0 text-[#85161B]"
													/>

													<div className="min-w-0">
														<p
															className="line-clamp-2 break-words text-xs leading-5 text-[#2E2E2E]/65"
															title={order.address}
														>
															{order.address}
														</p>
													</div>
												</div>
											</td>

											{/* DATE */}

											<td className="whitespace-nowrap px-4 py-4 text-xs text-[#2E2E2E]/45 sm:px-5">
												{order.date}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="px-6 py-16 text-center">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7D6BF]/40">
								<ClipboardList size={22} className="text-[#85161B]" />
							</div>

							<p className="mt-4 text-sm font-semibold text-[#2E2E2E]">
								{error ? "No orders available" : "No orders match your search"}
							</p>

							<p className="mt-1 text-xs text-[#2E2E2E]/45">
								{error
									? "Please check your admin session and try again."
									: "Try a different keyword or status filter."}
							</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

