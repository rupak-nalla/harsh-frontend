"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Package,
	ArrowRight,
	Clock3,
	CheckCircle2,
	Truck,
	ShoppingBag,
	MapPin,
	Box,
	AlertCircle,
} from "lucide-react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */

type OrderStatus =
	| "Order placed"
	| "Order accepted"
	| "Packed"
	| "Shipped"
	| "Out for delivery"
	| "Delivered";

type OrderStatusType = "processing" | "shipping" | "delivered";

type OrderItem = {
	id: string;
	name: string;
	image: string;
	qty: number;
};

type Order = {
	id: string;
	date: string;
	status: OrderStatus;
	statusType: OrderStatusType;
	total: string;
	items: OrderItem[];
};

/* ─────────────────────────────────────────
   RAW /api/orders RESPONSE

   NOTE:
   The exact shape of /api/orders isn't confirmed yet, so this
   normalizes defensively — same pattern used for /api/cart and
   /api/auth/user elsewhere in this app. Trim the fallback field
   names down once the real response shape is confirmed.
───────────────────────────────────────── */

type RawOrderItem = {
	id?: string | number;
	product_id?: string | number;
	name?: string;
	product_name?: string;
	image?: string;
	primary_photo_path?: string;
	quantity?: number | string;
	qty?: number | string;
};

type RawOrder = {
	id?: string | number;
	order_id?: string | number;

	created_at?: string;
	date?: string;
	order_date?: string;

	status?: string;
	order_status?: string;

	total?: number | string;
	grand_total?: number | string;
	total_price?: number | string;

	items?: RawOrderItem[];
	products?: RawOrderItem[];
	order_items?: RawOrderItem[];
};

type OrdersResponse = {
	status?: number;
	message?: string;
	result?: RawOrder[];
	orders?: RawOrder[];
	data?: RawOrder[];
};

/* ─────────────────────────────────────────
   STATUS FILTERS
───────────────────────────────────────── */

const STATUS_FILTERS = [
	"All orders",
	"Processing",
	"Shipped",
	"Out for delivery",
	"Delivered",
];

/* ─────────────────────────────────────────
   STATUS NORMALIZATION

   Maps whatever status string the backend sends (any casing,
   spaces, underscores, or hyphens) to the display label + badge
   type this page already knows how to render.
───────────────────────────────────────── */

function normalizeStatus(rawStatus: string | undefined): {
	status: OrderStatus;
	statusType: OrderStatusType;
} {
	const key = (rawStatus ?? "").toLowerCase().replace(/[\s_-]+/g, "");

	if (key.includes("delivered")) {
		return { status: "Delivered", statusType: "delivered" };
	}

	if (key.includes("outfordelivery")) {
		return { status: "Out for delivery", statusType: "shipping" };
	}

	if (key.includes("shipped") || key.includes("dispatch")) {
		return { status: "Shipped", statusType: "shipping" };
	}

	if (key.includes("packed")) {
		return { status: "Packed", statusType: "processing" };
	}

	if (key.includes("accepted") || key.includes("confirmed")) {
		return { status: "Order accepted", statusType: "processing" };
	}

	// Default: freshly placed / pending / unrecognized statuses.
	return { status: "Order placed", statusType: "processing" };
}

/* ─────────────────────────────────────────
   NORMALIZE ORDER
───────────────────────────────────────── */

function normalizeOrder(raw: RawOrder, index: number): Order {
	const id = String(raw.id ?? raw.order_id ?? `order-${index}`);

	const rawDate = raw.created_at ?? raw.date ?? raw.order_date ?? "";

	let date = rawDate;

	if (rawDate) {
		const parsed = new Date(rawDate);

		if (!Number.isNaN(parsed.getTime())) {
			date = parsed.toLocaleDateString("en-IN", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
	}

	const { status, statusType } = normalizeStatus(
		raw.status ?? raw.order_status,
	);

	const rawTotal = Number(raw.grand_total ?? raw.total ?? raw.total_price ?? 0);

	const total = `₹${(Number.isFinite(rawTotal) ? rawTotal : 0).toFixed(2)}`;

	const rawItems = raw.items ?? raw.products ?? raw.order_items ?? [];

	const items: OrderItem[] = rawItems.map((rawItem, itemIndex) => {
		const quantity = Number(rawItem.quantity ?? rawItem.qty ?? 1);

		return {
			id: String(rawItem.id ?? rawItem.product_id ?? `${id}-item-${itemIndex}`),
			name: rawItem.name ?? rawItem.product_name ?? "Untitled product",
			image: rawItem.image ?? rawItem.primary_photo_path ?? "",
			qty: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,
		};
	});

	return {
		id,
		date: date || "—",
		status,
		statusType,
		total,
		items,
	};
}

/* ─────────────────────────────────────────
   ORDERS PAGE
───────────────────────────────────────── */

export default function OrdersPage() {
	const [activeFilter, setActiveFilter] = useState("All orders");

	const [orders, setOrders] = useState<Order[]>([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	/* ─────────────────────────────────────
	   FETCH ORDERS
	───────────────────────────────────── */

	const fetchOrders = async () => {
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/orders", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: OrdersResponse = await response.json().catch(() => ({}));

			console.log("ORDERS RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to load your orders.");
			}

			const rawOrders = data.result ?? data.orders ?? data.data ?? [];

			const normalizedOrders = rawOrders.map((raw, index) =>
				normalizeOrder(raw, index),
			);

			console.log("NORMALIZED ORDERS:", normalizedOrders);

			setOrders(normalizedOrders);
		} catch (err) {
			console.error("Fetch orders failed:", err);

			setError(
				err instanceof Error ? err.message : "Unable to load your orders.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	/* ─────────────────────────────────────
	   CALCULATE STATS
	───────────────────────────────────── */

	const stats = useMemo(() => {
		const totalOrders = orders.length;

		const delivered = orders.filter(
			(order) => order.status === "Delivered",
		).length;

		const inProgress = orders.filter(
			(order) => order.status !== "Delivered",
		).length;

		return {
			totalOrders,
			inProgress,
			delivered,
		};
	}, [orders]);

	/* ─────────────────────────────────────
	   FILTER ORDERS
	───────────────────────────────────── */

	const filteredOrders = useMemo(() => {
		if (activeFilter === "All orders") {
			return orders;
		}

		if (activeFilter === "Processing") {
			return orders.filter(
				(order) =>
					order.status === "Order placed" ||
					order.status === "Order accepted" ||
					order.status === "Packed",
			);
		}

		if (activeFilter === "Shipped") {
			return orders.filter((order) => order.status === "Shipped");
		}

		if (activeFilter === "Out for delivery") {
			return orders.filter((order) => order.status === "Out for delivery");
		}

		if (activeFilter === "Delivered") {
			return orders.filter((order) => order.status === "Delivered");
		}

		return orders;
	}, [activeFilter, orders]);

	/* ─────────────────────────────────────
	   LOADING
	───────────────────────────────────── */

	if (loading) {
		return (
			<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center justify-center px-5 py-12">
					<div className="flex flex-col items-center gap-3">
						<span className="h-8 w-8 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />

						<p className="text-sm text-[#2E2E2E]/50">Loading your orders...</p>
					</div>
				</div>
			</main>
		);
	}

	/* ─────────────────────────────────────
	   ERROR
	───────────────────────────────────── */

	if (error) {
		return (
			<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-4xl items-center justify-center px-5 py-12">
					<div className="w-full rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
							<AlertCircle
								size={32}
								className="text-red-500"
								strokeWidth={1.7}
							/>
						</div>

						<h1 className="mt-6 text-2xl font-bold text-[#2E2E2E]">
							Unable to load orders
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							{error}
						</p>

						<button
							type="button"
							onClick={fetchOrders}
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#721318]"
						>
							Try Again
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
			<section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
				{/* ─────────────────────────
				    HEADER
				───────────────────────── */}

				<div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
							My account
						</p>

						<h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							My Orders
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
							Track your purchases and view your order history.
						</p>
					</div>

					<Link
						href="/shop"
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
						<ShoppingBag size={17} />
						Continue Shopping
					</Link>
				</div>

				{/* ─────────────────────────
				    ORDER SUMMARY
				───────────────────────── */}

				<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
					<StatCard
						label="Total orders"
						value={stats.totalOrders}
						icon={<Package size={19} />}
						iconClass="bg-[#F7D6BF]/50 text-[#85161B]"
					/>

					<StatCard
						label="In progress"
						value={stats.inProgress}
						icon={<Clock3 size={19} />}
						iconClass="bg-[#FFF3E8] text-[#B56B27]"
					/>

					<StatCard
						label="Delivered"
						value={stats.delivered}
						icon={<CheckCircle2 size={19} />}
						iconClass="bg-[#EDF8F0] text-[#31824A]"
					/>
				</div>

				{/* ─────────────────────────
				    FILTERS
				───────────────────────── */}

				<div className="mb-6 rounded-2xl border border-[#E9DED7] bg-white p-4">
					<div className="flex gap-2 overflow-x-auto scrollbar-hide">
						{STATUS_FILTERS.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setActiveFilter(filter)}
								className={`
									whitespace-nowrap
									rounded-full
									px-4
									py-2.5
									text-xs
									font-medium
									transition-all
									${
										activeFilter === filter
											? "bg-[#85161B] text-white shadow-sm"
											: "bg-[#F8F3F0] text-[#2E2E2E]/65 hover:bg-[#F1E7E1]"
									}
								`}
							>
								{filter}
							</button>
						))}
					</div>
				</div>

				{/* ─────────────────────────
				    ORDERS
				───────────────────────── */}

				{filteredOrders.length > 0 ? (
					<div className="space-y-4">
						{filteredOrders.map((order) => (
							<OrderCard key={order.id} order={order} />
						))}
					</div>
				) : (
					<EmptyOrders />
				)}
			</section>
		</main>
	);
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */

function StatCard({
	label,
	value,
	icon,
	iconClass,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	iconClass: string;
}) {
	return (
		<div className="rounded-2xl border border-[#E9DED7] bg-white p-5">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium text-[#2E2E2E]/50">{label}</p>

					<p className="mt-1 text-2xl font-bold text-[#2E2E2E]">{value}</p>
				</div>

				<div
					className={`
						flex
						h-10
						w-10
						items-center
						justify-center
						rounded-full
						${iconClass}
					`}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────── */

function OrderCard({ order }: { order: Order }) {
	const isDelivered = order.status === "Delivered";

	return (
		<article
			className="
				overflow-hidden
				rounded-2xl
				border
				border-[#E9DED7]
				bg-white
				transition-all
				duration-200
				hover:-translate-y-0.5
				hover:shadow-[0_12px_35px_rgba(80,40,20,0.07)]
			"
		>
			{/* ORDER HEADER */}

			<div
				className="
					flex
					flex-col
					gap-3
					border-b
					border-[#EEE6E1]
					px-5
					py-4
					sm:flex-row
					sm:items-center
					sm:justify-between
					sm:px-6
				"
			>
				<div>
					<p className="text-xs text-[#2E2E2E]/45">
						Order placed on {order.date}
					</p>

					<p className="mt-1 text-sm font-semibold text-[#2E2E2E]">
						#{order.id}
					</p>
				</div>

				<StatusBadge status={order.status} type={order.statusType} />
			</div>

			{/* PRODUCTS */}

			<div className="px-5 py-5 sm:px-6">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					{/* PRODUCT INFORMATION */}

					<div className="flex min-w-0 flex-1 items-center gap-4">
						{/* PRODUCT IMAGES */}

						<div className="flex -space-x-3">
							{order.items.map((item) => (
								<div
									key={item.id}
									className="
										h-16
										w-16
										overflow-hidden
										rounded-xl
										border-2
										border-white
										bg-[#F5F1ED]
										shadow-sm
										sm:h-20
										sm:w-20
									"
								>
									{item.image ? (
										<img
											src={item.image}
											alt={item.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center">
											<ShoppingBag size={20} className="text-[#85161B]/30" />
										</div>
									)}
								</div>
							))}
						</div>

						<div className="min-w-0">
							<p className="text-sm font-semibold text-[#2E2E2E]">
								{order.items[0]?.name ?? "Untitled product"}
							</p>

							{order.items.length > 1 && (
								<p className="mt-1 text-xs text-[#2E2E2E]/50">
									+ {order.items.length - 1} more item
									{order.items.length > 2 ? "s" : ""}
								</p>
							)}

							<p className="mt-2 text-sm font-bold text-[#85161B]">
								{order.total}
							</p>
						</div>
					</div>

					{/* ACTIONS */}

					<div className="flex flex-col gap-2 sm:flex-row">
						{/* VIEW ORDER */}

						<Link
							href={`/orders/${encodeURIComponent(order.id)}`}
							className="
								group
								inline-flex
								items-center
								justify-center
								gap-2
								rounded-xl
								border
								border-[#DED6D0]
								px-4
								py-2.5
								text-xs
								font-semibold
								text-[#2E2E2E]/70
								transition-all
								hover:border-[#85161B]/20
								hover:bg-[#F8F3F0]
								hover:text-[#85161B]
							"
						>
							View order
							<ArrowRight
								size={15}
								className="
									transition-transform
									group-hover:translate-x-0.5
								"
							/>
						</Link>

						{/* TRACK / DELIVERY */}

						<Link
							href={`/order-tracking/${encodeURIComponent(order.id)}`}
							className={`
								group
								inline-flex
								items-center
								justify-center
								gap-2
								rounded-xl
								px-4
								py-2.5
								text-xs
								font-semibold
								transition-all
								${
									isDelivered
										? `
											border
											border-[#31824A]/20
											bg-[#EDF8F0]
											text-[#31824A]
											hover:bg-[#31824A]
											hover:text-white
										`
										: `
											bg-[#85161B]
											text-white
											hover:bg-[#721318]
											hover:shadow-md
										`
								}
							`}
						>
							{isDelivered ? (
								<>
									<CheckCircle2 size={15} />
									View delivery
								</>
							) : (
								<>
									<MapPin
										size={15}
										className="
											transition-transform
											group-hover:-translate-y-0.5
										"
									/>
									Track order
								</>
							)}
						</Link>
					</div>
				</div>

				{/* CURRENT STATUS MESSAGE */}

				{!isDelivered && (
					<div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F8F3F0] px-4 py-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF] text-[#85161B]">
							<Package size={15} />
						</div>

						<div>
							<p className="text-xs font-semibold text-[#85161B]">
								Current status
							</p>

							<p className="mt-0.5 text-xs text-[#2E2E2E]/55">
								Your order is currently at the "{order.status}" stage.
							</p>
						</div>
					</div>
				)}
			</div>
		</article>
	);
}

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */

function StatusBadge({
	status,
	type,
}: {
	status: OrderStatus;
	type: OrderStatusType;
}) {
	const getStatusIcon = () => {
		switch (status) {
			case "Order placed":
				return <Package size={14} />;

			case "Order accepted":
				return <CheckCircle2 size={14} />;

			case "Packed":
				return <Box size={14} />;

			case "Shipped":
				return <Truck size={14} />;

			case "Out for delivery":
				return <MapPin size={14} />;

			case "Delivered":
				return <CheckCircle2 size={14} />;

			default:
				return <Package size={14} />;
		}
	};

	const styles = {
		delivered: "bg-[#EDF8F0] text-[#31824A]",
		shipping: "bg-[#EEF5FF] text-[#3973B9]",
		processing: "bg-[#FFF3E8] text-[#B56B27]",
	};

	return (
		<span
			className={`
				inline-flex
				w-fit
				items-center
				gap-1.5
				rounded-full
				px-3
				py-1.5
				text-xs
				font-semibold
				${styles[type]}
			`}
		>
			{getStatusIcon()}
			{status}
		</span>
	);
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */

function EmptyOrders() {
	return (
		<div className="rounded-2xl border border-[#E9DED7] bg-white px-6 py-16 text-center">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7D6BF]/50 text-[#85161B]">
				<Package size={27} />
			</div>

			<h3 className="mt-5 text-xl font-semibold text-[#2E2E2E]">
				No orders found
			</h3>

			<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#2E2E2E]/55">
				There are no orders in this category yet.
			</p>

			<Link
				href="/shop"
				className="
					mt-6
					inline-flex
					items-center
					gap-2
					rounded-xl
					bg-[#85161B]
					px-5
					py-3
					text-sm
					font-semibold
					text-white
					transition
					hover:bg-[#721318]
				"
			>
				Start Shopping
				<ArrowRight size={16} />
			</Link>
		</div>
	);
}
