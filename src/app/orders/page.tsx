"use client";

import React, { useMemo, useState } from "react";
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
   MOCK DATA
───────────────────────────────────────── */

const MOCK_ORDERS: Order[] = [
	{
		id: "GIF-10294",
		date: "August 18, 2026",
		status: "Order accepted",
		statusType: "processing",
		total: "₹1,498.00",
		items: [
			{
				id: "1",
				name: "Personalized Rakhi",
				qty: 1,
				image: "/images/rakhi.jpg",
			},
			{
				id: "2",
				name: "Custom Bracelet",
				qty: 1,
				image: "/images/customised-bracelet.jpg",
			},
		],
	},

	{
		id: "GIF-10281",
		date: "August 16, 2026",
		status: "Packed",
		statusType: "processing",
		total: "₹899.00",
		items: [
			{
				id: "3",
				name: "Wooden Photo Frame",
				qty: 1,
				image: "/images/wooden-photoframe.jpg",
			},
		],
	},

	{
		id: "GIF-10265",
		date: "August 14, 2026",
		status: "Shipped",
		statusType: "shipping",
		total: "₹1,249.00",
		items: [
			{
				id: "4",
				name: "Printed T-Shirt",
				qty: 1,
				image: "/images/tshirts.jpg",
			},
			{
				id: "5",
				name: "Custom Bracelet",
				qty: 1,
				image: "/images/customised-bracelet.jpg",
			},
		],
	},

	{
		id: "GIF-10241",
		date: "August 12, 2026",
		status: "Out for delivery",
		statusType: "shipping",
		total: "₹1,699.00",
		items: [
			{
				id: "6",
				name: "Personalized Gift Set",
				qty: 1,
				image: "/images/rakhi.jpg",
			},
		],
	},

	{
		id: "GIF-10198",
		date: "August 7, 2026",
		status: "Delivered",
		statusType: "delivered",
		total: "₹2,199.00",
		items: [
			{
				id: "7",
				name: "Leather Wallet",
				qty: 1,
				image: "/images/wallet.jpg",
			},
			{
				id: "8",
				name: "Wooden Photo Frame",
				qty: 1,
				image: "/images/wooden-photoframe.jpg",
			},
		],
	},

	{
		id: "GIF-10172",
		date: "August 3, 2026",
		status: "Delivered",
		statusType: "delivered",
		total: "₹1,499.00",
		items: [
			{
				id: "9",
				name: "Personalized Rakhi",
				qty: 2,
				image: "/images/rakhi.jpg",
			},
		],
	},
];

/* ─────────────────────────────────────────
   ORDERS PAGE
───────────────────────────────────────── */

export default function OrdersPage() {
	const [activeFilter, setActiveFilter] = useState("All orders");

	/* ─────────────────────────────────────
	   CALCULATE STATS
	───────────────────────────────────── */

	const stats = useMemo(() => {
		const totalOrders = MOCK_ORDERS.length;

		const delivered = MOCK_ORDERS.filter(
			(order) => order.status === "Delivered",
		).length;

		const inProgress = MOCK_ORDERS.filter(
			(order) => order.status !== "Delivered",
		).length;

		return {
			totalOrders,
			inProgress,
			delivered,
		};
	}, []);

	/* ─────────────────────────────────────
	   FILTER ORDERS
	───────────────────────────────────── */

	const filteredOrders = useMemo(() => {
		if (activeFilter === "All orders") {
			return MOCK_ORDERS;
		}

		if (activeFilter === "Processing") {
			return MOCK_ORDERS.filter(
				(order) =>
					order.status === "Order placed" ||
					order.status === "Order accepted" ||
					order.status === "Packed",
			);
		}

		if (activeFilter === "Shipped") {
			return MOCK_ORDERS.filter((order) => order.status === "Shipped");
		}

		if (activeFilter === "Out for delivery") {
			return MOCK_ORDERS.filter((order) => order.status === "Out for delivery");
		}

		if (activeFilter === "Delivered") {
			return MOCK_ORDERS.filter((order) => order.status === "Delivered");
		}

		return MOCK_ORDERS;
	}, [activeFilter]);

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
							{order.items.map((item, index) => (
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
									<img
										src={item.image}
										alt={item.name}
										className="h-full w-full object-cover"
									/>
								</div>
							))}
						</div>

						<div className="min-w-0">
							<p className="text-sm font-semibold text-[#2E2E2E]">
								{order.items[0]?.name}
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
