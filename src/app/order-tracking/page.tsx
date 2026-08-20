"use client";

import React from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Check,
	CheckCircle2,
	MapPin,
	Package,
	Phone,
	ShoppingBag,
	Truck,
	MessageCircle,
	Clock3,
} from "lucide-react";

/* ─────────────────────────────────────────
   ORDER DATA
───────────────────────────────────────── */

const order = {
	id: "GIF-10294",
	date: "August 18, 2026",
	estimatedDelivery: "August 21, 2026",

	customer: {
		name: "Rupak",
		phone: "+91 98765 43210",
	},

	delivery: {
		name: "Rupak Nalla",
		address: "Flat 204, Rajapushpa Residency, Hyderabad, Telangana - 500032",
	},

	items: [
		{
			id: "1",
			name: "Personalized Rakhi",
			description: "Custom name & photo",
			price: 999,
			quantity: 1,
			image: "/images/rakhi.jpg",
		},
		{
			id: "2",
			name: "Custom Bracelet",
			description: "Personalized engraving",
			price: 499,
			quantity: 1,
			image: "/images/customised-bracelet.jpg",
		},
	],

	subtotal: 1498,
	deliveryFee: 0,
	total: 1498,
};

/* ─────────────────────────────────────────
   CURRENT ORDER STATUS

   1 = Order placed
   2 = Order accepted
   3 = Packed
   4 = Shipped
   5 = Out for delivery
   6 = Delivered

   Later, replace this with the status
   received from your backend.
───────────────────────────────────────── */

const currentStageId = 2;

/* ─────────────────────────────────────────
   TRACKING STAGES
───────────────────────────────────────── */

const trackingStages = [
	{
		id: 1,
		title: "Order placed",
		description: "We received your order",
		date: "Aug 18",
		icon: ShoppingBag,
	},

	{
		id: 2,
		title: "Order accepted",
		description: "Your order has been accepted",
		date: "Aug 18",
		icon: CheckCircle2,
	},

	{
		id: 3,
		title: "Packed",
		description: "Your items have been packed",
		date: "",
		icon: Package,
	},

	{
		id: 4,
		title: "Shipped",
		description: "Your package is on its way",
		date: "",
		icon: Truck,
	},

	{
		id: 5,
		title: "Out for delivery",
		description: "Your order is arriving today",
		date: "",
		icon: MapPin,
	},

	{
		id: 6,
		title: "Delivered",
		description: "Your order has been delivered",
		date: "",
		icon: Check,
	},
];

/* ─────────────────────────────────────────
   HELPER
───────────────────────────────────────── */

function getStageState(stageId: number) {
	return {
		completed: stageId <= currentStageId,
		current: stageId === currentStageId,
	};
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */

export default function OrderTrackingPage() {
	const currentStage = trackingStages.find(
		(stage) => stage.id === currentStageId,
	);

	/*
	 * Percentage of the desktop progress line
	 * that should be filled.
	 *
	 * The actual line starts at 8.33% and ends
	 * at 91.67%, so its usable width is 83.34%.
	 */
	const progressPercentage =
		((currentStageId - 1) / (trackingStages.length - 1)) * 83.34;

	return (
		<main className="min-h-screen bg-[#FAF7F4] text-[#2E2E2E]">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
				{/* =========================================
				    BACK
				========================================= */}

				<Link
					href="/orders"
					className="
						mb-7
						inline-flex
						items-center
						gap-2
						text-sm
						font-medium
						text-[#2E2E2E]/60
						transition
						hover:text-[#85161B]
					"
				>
					<ArrowLeft size={17} />
					Back to orders
				</Link>

				{/* =========================================
				    PAGE HEADER
				========================================= */}

				<div className="mb-8">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
						<div>
							<p
								className="
									mb-2
									text-sm
									font-semibold
									uppercase
									tracking-[0.15em]
									text-[#85161B]
								"
							>
								Order tracking
							</p>

							<h1
								className="
									text-3xl
									font-bold
									tracking-tight
									sm:text-4xl
									lg:text-5xl
								"
							>
								Track your order
							</h1>

							<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
								Order #{order.id} · Placed on {order.date}
							</p>
						</div>

						{/* Current status */}

						{currentStage && (
							<div
								className="
									inline-flex
									w-fit
									items-center
									gap-2
									rounded-full
									bg-[#F7D6BF]
									px-4
									py-2
									text-sm
									font-semibold
									text-[#85161B]
								"
							>
								<Clock3 size={16} />
								{currentStage.title}
							</div>
						)}
					</div>
				</div>

				{/* =========================================
				    TOP GRID
				========================================= */}

				<div className="grid gap-6 lg:grid-cols-[1fr_340px]">
					{/* =====================================
					    ORDER PROGRESS
					===================================== */}

					<section
						className="
							rounded-[30px]
							border
							border-[#E8D7CC]
							bg-white
							p-5
							shadow-[0_8px_30px_rgba(60,30,20,0.04)]
							sm:p-7
							lg:p-9
						"
					>
						<div className="mb-8">
							<h2 className="text-xl font-bold sm:text-2xl">Order progress</h2>

							<p className="mt-1 text-sm text-[#2E2E2E]/50">
								We'll keep you updated as your order moves.
							</p>
						</div>

						{/* =====================================
						    DESKTOP TIMELINE
						===================================== */}

						<div className="hidden md:block">
							<div className="relative">
								{/* Background connecting line */}

								<div
									className="
										absolute
										left-[8.33%]
										right-[8.33%]
										top-[22px]
										h-[2px]
										bg-[#E8DDD7]
									"
								/>

								{/* Completed connecting line */}

								<div
									className="
										absolute
										left-[8.33%]
										top-[22px]
										h-[2px]
										bg-[#85161B]
										transition-all
										duration-500
									"
									style={{
										width: `${progressPercentage}%`,
									}}
								/>

								<div className="relative grid grid-cols-6 gap-2">
									{trackingStages.map((stage) => {
										const Icon = stage.icon;
										const state = getStageState(stage.id);

										return (
											<div
												key={stage.id}
												className="flex flex-col items-center text-center"
											>
												{/* Stage icon */}

												<div
													className={`
														flex
														h-11
														w-11
														items-center
														justify-center
														rounded-full
														border-2
														transition-all
														duration-300
														${
															state.completed
																? "border-[#85161B] bg-[#85161B] text-white"
																: "border-[#DED2CB] bg-white text-[#A99B93]"
														}
														${state.current ? "ring-4 ring-[#F7D6BF]" : ""}
													`}
												>
													<Icon size={18} />
												</div>

												{/* Stage information */}

												<div className="mt-4">
													<p
														className={`
															text-sm
															font-semibold
															${state.completed ? "text-[#2E2E2E]" : "text-[#2E2E2E]/45"}
														`}
													>
														{stage.title}
													</p>

													<p
														className="
															mx-auto
															mt-1
															max-w-[130px]
															text-xs
															leading-relaxed
															text-[#2E2E2E]/45
														"
													>
														{stage.description}
													</p>

													{stage.date && (
														<p className="mt-2 text-[11px] font-medium text-[#85161B]">
															{stage.date}
														</p>
													)}

													{state.current && (
														<span
															className="
																mt-2
																inline-block
																rounded-full
																bg-[#F7D6BF]
																px-2.5
																py-1
																text-[9px]
																font-bold
																uppercase
																tracking-wide
																text-[#85161B]
															"
														>
															Current
														</span>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						{/* =====================================
						    MOBILE TIMELINE
						===================================== */}

						<div className="md:hidden">
							<div className="relative">
								{/* Vertical background line */}

								<div
									className="
										absolute
										bottom-5
										left-[20px]
										top-5
										w-[2px]
										bg-[#E8DDD7]
									"
								/>

								{/* Vertical completed line */}

								<div
									className="
										absolute
										left-[20px]
										top-5
										w-[2px]
										bg-[#85161B]
										transition-all
										duration-500
									"
									style={{
										height: `${
											((currentStageId - 1) / (trackingStages.length - 1)) * 100
										}%`,
									}}
								/>

								<div className="space-y-6">
									{trackingStages.map((stage) => {
										const Icon = stage.icon;
										const state = getStageState(stage.id);

										return (
											<div key={stage.id} className="relative flex gap-4">
												{/* Stage icon */}

												<div
													className={`
														relative
														z-10
														flex
														h-10
														w-10
														shrink-0
														items-center
														justify-center
														rounded-full
														border-2
														transition-all
														duration-300
														${
															state.completed
																? "border-[#85161B] bg-[#85161B] text-white"
																: "border-[#DED2CB] bg-white text-[#A99B93]"
														}
														${state.current ? "ring-4 ring-[#F7D6BF]" : ""}
													`}
												>
													<Icon size={17} />
												</div>

												{/* Stage content */}

												<div className="pt-0.5">
													<div className="flex flex-wrap items-center gap-2">
														<h3
															className={`
																text-sm
																font-semibold
																${state.completed ? "text-[#2E2E2E]" : "text-[#2E2E2E]/45"}
															`}
														>
															{stage.title}
														</h3>

														{state.current && (
															<span
																className="
																	rounded-full
																	bg-[#F7D6BF]
																	px-2
																	py-0.5
																	text-[9px]
																	font-bold
																	uppercase
																	tracking-wide
																	text-[#85161B]
																"
															>
																Now
															</span>
														)}
													</div>

													<p className="mt-1 text-xs text-[#2E2E2E]/50">
														{stage.description}
													</p>

													{stage.date && (
														<p className="mt-1 text-[11px] font-medium text-[#85161B]">
															{stage.date}
														</p>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						{/* =====================================
						    CURRENT STATUS
						===================================== */}

						{currentStage && (
							<div
								className="
									mt-8
									rounded-2xl
									border
									border-[#E8CDBB]
									bg-[#F7D6BF]/35
									p-4
									sm:p-5
								"
							>
								<div className="flex gap-3">
									<div
										className="
											flex
											h-10
											w-10
											shrink-0
											items-center
											justify-center
											rounded-full
											bg-[#85161B]
											text-white
										"
									>
										<currentStage.icon size={18} />
									</div>

									<div>
										<p className="text-sm font-bold text-[#85161B]">
											{currentStage.title}
										</p>

										<p className="mt-1 text-xs leading-relaxed text-[#2E2E2E]/60 sm:text-sm">
											{currentStage.description}. We'll keep you updated when
											your order moves to the next stage.
										</p>
									</div>
								</div>
							</div>
						)}
					</section>

					{/* =====================================
					    DELIVERY CARD
					===================================== */}

					<section
						className="
							rounded-[30px]
							border
							border-[#E8D7CC]
							bg-[#F7D6BF]/35
							p-5
							sm:p-7
						"
					>
						<div className="flex items-center gap-3">
							<div
								className="
									flex
									h-11
									w-11
									items-center
									justify-center
									rounded-full
									bg-[#85161B]
									text-white
								"
							>
								<Truck size={19} />
							</div>

							<div>
								<p className="text-xs font-medium text-[#2E2E2E]/50">
									Estimated delivery
								</p>

								<h2 className="text-lg font-bold text-[#85161B]">
									{order.estimatedDelivery}
								</h2>
							</div>
						</div>

						<div className="my-6 h-px bg-[#DCC8BB]" />

						{/* Address */}

						<div>
							<div className="mb-3 flex items-center gap-2">
								<MapPin size={17} className="text-[#85161B]" />

								<h3 className="text-sm font-bold">Delivery address</h3>
							</div>

							<div className="rounded-2xl bg-white/80 p-4">
								<p className="text-sm font-semibold">{order.delivery.name}</p>

								<p className="mt-1 text-xs leading-relaxed text-[#2E2E2E]/55">
									{order.delivery.address}
								</p>
							</div>
						</div>

						{/* Contact */}

						<div className="mt-5">
							<div className="mb-3 flex items-center gap-2">
								<Phone size={16} className="text-[#85161B]" />

								<h3 className="text-sm font-bold">Contact</h3>
							</div>

							<p className="text-sm text-[#2E2E2E]/60">
								{order.customer.phone}
							</p>
						</div>
					</section>
				</div>

				{/* =========================================
				    ORDER ITEMS
				========================================= */}

				<section
					className="
						mt-6
						rounded-[30px]
						border
						border-[#E8D7CC]
						bg-white
						p-5
						shadow-[0_8px_30px_rgba(60,30,20,0.04)]
						sm:p-7
						lg:p-8
					"
				>
					<div className="mb-6 flex items-end justify-between">
						<div>
							<h2 className="text-xl font-bold sm:text-2xl">Your order</h2>

							<p className="mt-1 text-sm text-[#2E2E2E]/50">
								{order.items.length} items
							</p>
						</div>

						<span className="hidden text-sm text-[#2E2E2E]/45 sm:block">
							Order #{order.id}
						</span>
					</div>

					<div className="divide-y divide-[#EEE5DF]">
						{order.items.map((item) => (
							<div
								key={item.id}
								className="
									flex
									gap-4
									py-4
									first:pt-0
									last:pb-0
									sm:gap-5
								"
							>
								{/* Product image */}

								<div
									className="
										h-20
										w-20
										shrink-0
										overflow-hidden
										rounded-2xl
										bg-[#F4F0EC]
										sm:h-24
										sm:w-24
									"
								>
									<img
										src={item.image}
										alt={item.name}
										className="h-full w-full object-cover"
									/>
								</div>

								{/* Product information */}

								<div className="flex min-w-0 flex-1 flex-col justify-center">
									<h3 className="text-sm font-semibold sm:text-base">
										{item.name}
									</h3>

									<p className="mt-1 text-xs text-[#2E2E2E]/50">
										{item.description}
									</p>

									<p className="mt-2 text-xs font-medium text-[#2E2E2E]/45">
										Qty: {item.quantity}
									</p>
								</div>

								{/* Price */}

								<div className="flex items-center">
									<p className="text-sm font-bold sm:text-base">
										₹{item.price.toFixed(2)}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* =====================================
					    ORDER TOTAL
					===================================== */}

					<div
						className="
							mt-6
							border-t
							border-[#EEE5DF]
							pt-5
						"
					>
						<div className="ml-auto max-w-sm space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-[#2E2E2E]/50">Subtotal</span>

								<span>₹{order.subtotal.toFixed(2)}</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-[#2E2E2E]/50">Delivery</span>

								<span className="font-medium text-[#85161B]">Free</span>
							</div>

							<div className="flex justify-between border-t border-[#EEE5DF] pt-3">
								<span className="font-bold">Total</span>

								<span className="text-lg font-bold text-[#85161B]">
									₹{order.total.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* =========================================
				    HELP
				========================================= */}

				<section
					className="
						mt-6
						flex
						flex-col
						gap-4
						rounded-[30px]
						border
						border-[#E8D7CC]
						bg-[#85161B]
						p-5
						text-white
						sm:flex-row
						sm:items-center
						sm:justify-between
						sm:p-7
					"
				>
					<div className="flex items-center gap-4">
						<div
							className="
								flex
								h-11
								w-11
								shrink-0
								items-center
								justify-center
								rounded-full
								bg-white
								text-[#85161B]
							"
						>
							<MessageCircle size={20} />
						</div>

						<div>
							<h2 className="text-base font-bold">
								Need help with your order?
							</h2>

							<p className="mt-1 text-xs text-white/65 sm:text-sm">
								Our team is happy to help you.
							</p>
						</div>
					</div>

					<a
						href="https://wa.me/917000000000"
						target="_blank"
						rel="noopener noreferrer"
						className="
							inline-flex
							items-center
							justify-center
							gap-2
							rounded-full
							bg-white
							px-5
							py-3
							text-sm
							font-semibold
							text-[#85161B]
							transition
							hover:bg-[#F7D6BF]
						"
					>
						<MessageCircle size={17} />
						Chat with us
					</a>
				</section>
			</div>
		</main>
	);
}
