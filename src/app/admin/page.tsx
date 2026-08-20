"use client";

import React from "react";
import {
	ShoppingBag,
	Users,
	Package,
	IndianRupee,
	ArrowUpRight,
	ArrowDownRight,
	Plus,
	ClipboardList,
	Boxes,
	UserPlus,
	MoreHorizontal,
	AlertTriangle,
} from "lucide-react";

const STATS = [
	{
		title: "Total Revenue",
		value: "₹1,24,580",
		change: "+12.5%",
		positive: true,
		icon: IndianRupee,
	},
	{
		title: "Total Orders",
		value: "348",
		change: "+8.2%",
		positive: true,
		icon: ShoppingBag,
	},
	{
		title: "Customers",
		value: "1,248",
		change: "+5.4%",
		positive: true,
		icon: Users,
	},
	{
		title: "Products",
		value: "86",
		change: "-2.1%",
		positive: false,
		icon: Package,
	},
];

const RECENT_ORDERS = [
	{
		id: "#GF1024",
		customer: "Anaya Sharma",
		product: "Personalized Rakhi",
		amount: "₹499",
		status: "Delivered",
	},
	{
		id: "#GF1023",
		customer: "Rohan Mehta",
		product: "Custom Bracelet",
		amount: "₹799",
		status: "Processing",
	},
	{
		id: "#GF1022",
		customer: "Priya Kapoor",
		product: "Photo Frame",
		amount: "₹699",
		status: "Shipped",
	},
	{
		id: "#GF1021",
		customer: "Arjun Rao",
		product: "Gift Box",
		amount: "₹1,299",
		status: "Pending",
	},
	{
		id: "#GF1020",
		customer: "Sneha Reddy",
		product: "Personalized T-Shirt",
		amount: "₹599",
		status: "Delivered",
	},
];

const LOW_STOCK = [
	{
		name: "Personalized Rakhi",
		stock: 4,
	},
	{
		name: "Wooden Photo Frame",
		stock: 7,
	},
	{
		name: "Custom Bracelet",
		stock: 9,
	},
];

const statusStyles: Record<string, string> = {
	Delivered: "bg-green-50 text-green-700",
	Processing: "bg-blue-50 text-blue-700",
	Shipped: "bg-purple-50 text-purple-700",
	Pending: "bg-amber-50 text-amber-700",
};

export default function AdminPage() {
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

					<button
						type="button"
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
					</button>
				</div>

				{/* =====================================================
				    STATS
				===================================================== */}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{STATS.map((stat) => {
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
								<div className="flex items-start justify-between">
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7D6BF]/45 text-[#85161B]">
										<Icon size={20} />
									</div>

									<div
										className={`flex items-center gap-1 text-xs font-semibold ${
											stat.positive
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{stat.positive ? (
											<ArrowUpRight size={14} />
										) : (
											<ArrowDownRight size={14} />
										)}
										{stat.change}
									</div>
								</div>

								<p className="mt-5 text-sm text-[#2E2E2E]/50">
									{stat.title}
								</p>

								<p className="mt-1 text-2xl font-bold tracking-tight text-[#2E2E2E]">
									{stat.value}
								</p>
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
						<button
							type="button"
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
						</button>

						<button
							type="button"
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
						</button>

						<button
							type="button"
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
						</button>

						<button
							type="button"
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
						</button>
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

							<button
								type="button"
								className="text-sm font-semibold text-[#85161B] hover:underline"
							>
								View all
							</button>
						</div>

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
									{RECENT_ORDERS.map((order) => (
										<tr
											key={order.id}
											className="border-b border-[#E8DED7]/70 last:border-0 hover:bg-[#FBF9F7]"
										>
											<td className="px-5 py-4 text-sm font-semibold text-[#85161B]">
												{order.id}
											</td>

											<td className="px-5 py-4 text-sm text-[#2E2E2E]">
												{order.customer}
											</td>

											<td className="px-5 py-4 text-sm text-[#2E2E2E]/65">
												{order.product}
											</td>

											<td className="px-5 py-4 text-sm font-semibold text-[#2E2E2E]">
												{order.amount}
											</td>

											<td className="px-5 py-4">
												<span
													className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
												>
													{order.status}
												</span>
											</td>

											<td className="px-5 py-4">
												<button
													type="button"
													className="text-[#2E2E2E]/35 hover:text-[#85161B]"
													aria-label={`More options for ${order.id}`}
												>
													<MoreHorizontal size={18} />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile orders */}

						<div className="divide-y divide-[#E8DED7] md:hidden">
							{RECENT_ORDERS.map((order) => (
								<div
									key={order.id}
									className="p-4"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-[#85161B]">
												{order.id}
											</p>

											<p className="mt-1 text-sm font-medium text-[#2E2E2E]">
												{order.customer}
											</p>

											<p className="mt-0.5 text-xs text-[#2E2E2E]/50">
												{order.product}
											</p>
										</div>

										<span
											className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
										>
											{order.status}
										</span>
									</div>

									<p className="mt-3 text-sm font-bold text-[#2E2E2E]">
										{order.amount}
									</p>
								</div>
							))}
						</div>
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

						<div className="divide-y divide-[#E8DED7]">
							{LOW_STOCK.map((product) => (
								<div
									key={product.name}
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

						<div className="p-5">
							<button
								type="button"
								className="w-full rounded-xl border border-[#85161B]/20 py-2.5 text-sm font-semibold text-[#85161B] transition hover:bg-[#85161B] hover:text-white"
							>
								Manage Inventory
							</button>
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