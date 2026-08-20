"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	LockKeyhole,
	MapPin,
	ShoppingBag,
	Truck,
	CreditCard,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { CartProvider } from "../../context/CartContext";

export default function CheckoutPage() {
	return (
		<CartProvider>
			<CheckoutView />
		</CartProvider>
	);
}

function CheckoutView() {
	const { items, total } = useCart();

	const cartTotal = total();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		pincode: "",
	});

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [isPlacingOrder, setIsPlacingOrder] = useState(false);

	/*
	 * ---------------------------------------------------------
	 * HANDLE INPUT CHANGE
	 * ---------------------------------------------------------
	 */

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	/*
	 * ---------------------------------------------------------
	 * PLACE ORDER
	 * ---------------------------------------------------------
	 *
	 * Backend integration is intentionally commented for now.
	 *
	 * When your backend API is ready, uncomment the fetch call
	 * below and update the endpoint if required.
	 *
	 * Expected backend request:
	 *
	 * POST /api/orders
	 *
	 * Body:
	 * {
	 *   items,
	 *   shippingAddress,
	 *   paymentMethod,
	 *   subtotal
	 * }
	 *
	 */

	const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setIsPlacingOrder(true);

		try {
			/*
			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					items,
					shippingAddress: formData,
					paymentMethod,
					subtotal: cartTotal,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to place order");
			}

			const data = await response.json();

			// Example:
			// router.push(`/orders/${data.orderId}`);
			*/

			/*
			 * Temporary mock behaviour.
			 *
			 * Remove this when backend integration
			 * is enabled.
			 */
			await new Promise((resolve) => setTimeout(resolve, 800));

			alert("Order placed successfully!");
		} catch (error) {
			console.error("Order placement failed:", error);
		} finally {
			setIsPlacingOrder(false);
		}
	};

	/*
	 * ---------------------------------------------------------
	 * EMPTY CART
	 * ---------------------------------------------------------
	 */

	if (items.length === 0) {
		return (
			<main className="min-h-[calc(100vh-72px)] bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12 sm:px-6">
					<div className="w-full rounded-3xl border border-[#E8DED7] bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7D6BF]/40">
							<ShoppingBag
								size={32}
								className="text-[#85161B]"
								strokeWidth={1.7}
							/>
						</div>

						<p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#85161B]">
							Checkout
						</p>

						<h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Your cart is empty.
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							Add something special to your cart before proceeding to checkout.
						</p>

						<Link
							href="/shop"
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg"
						>
							Continue Shopping
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			{/* =====================================================
			    HEADER
			===================================================== */}

			<section className="border-b border-[#E8DED7] bg-white">
				<div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
					<Link
						href="/cart"
						className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
					>
						<ArrowLeft size={16} />
						Back to Cart
					</Link>

					<div className="mt-6">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85161B]">
							Almost there
						</p>

						<h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
							Checkout
						</h1>

						<p className="mt-2 text-sm text-[#2E2E2E]/50">
							Complete your details to place your order.
						</p>
					</div>
				</div>
			</section>

			{/* =====================================================
			    CHECKOUT CONTENT
			===================================================== */}

			<section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
				<form
					onSubmit={handlePlaceOrder}
					className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8"
				>
					{/* =================================================
					    LEFT COLUMN
					================================================= */}

					<div className="space-y-6">
						{/* Delivery Information */}

						<section className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7D6BF]/40">
										<MapPin size={17} className="text-[#85161B]" />
									</div>

									<div>
										<h2 className="font-semibold text-[#2E2E2E]">
											Delivery Information
										</h2>

										<p className="mt-0.5 text-xs text-[#2E2E2E]/45">
											Where should we deliver your order?
										</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
								<FormInput
									label="First name"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									placeholder="Enter first name"
									required
								/>

								<FormInput
									label="Last name"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									placeholder="Enter last name"
									required
								/>

								<FormInput
									label="Email address"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="you@example.com"
									required
								/>

								<FormInput
									label="Phone number"
									name="phone"
									type="tel"
									value={formData.phone}
									onChange={handleChange}
									placeholder="10-digit mobile number"
									required
								/>

								<div className="sm:col-span-2">
									<FormInput
										label="Address"
										name="address"
										value={formData.address}
										onChange={handleChange}
										placeholder="House number, street, area"
										required
									/>
								</div>

								<FormInput
									label="City"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="Hyderabad"
									required
								/>

								<FormInput
									label="State"
									name="state"
									value={formData.state}
									onChange={handleChange}
									placeholder="Telangana"
									required
								/>

								<FormInput
									label="PIN code"
									name="pincode"
									value={formData.pincode}
									onChange={handleChange}
									placeholder="500001"
									required
								/>
							</div>
						</section>

						{/* Delivery Method */}

						<section className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7D6BF]/40">
										<Truck size={17} className="text-[#85161B]" />
									</div>

									<div>
										<h2 className="font-semibold text-[#2E2E2E]">
											Delivery Method
										</h2>

										<p className="mt-0.5 text-xs text-[#2E2E2E]/45">
											Choose how you'd like your order delivered.
										</p>
									</div>
								</div>
							</div>

							<div className="p-5 sm:p-6">
								<div className="flex items-center justify-between rounded-xl border border-[#85161B] bg-[#FFF9F6] p-4">
									<div className="flex items-center gap-3">
										<div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#85161B]">
											<div className="h-2.5 w-2.5 rounded-full bg-[#85161B]" />
										</div>

										<div>
											<p className="text-sm font-semibold text-[#2E2E2E]">
												Standard Delivery
											</p>

											<p className="mt-1 text-xs text-[#2E2E2E]/50">
												Delivered within 4–7 business days
											</p>
										</div>
									</div>

									<span className="text-sm font-semibold text-[#31824A]">
										Free
									</span>
								</div>
							</div>
						</section>

						{/* Payment */}

						<section className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7D6BF]/40">
										<CreditCard size={17} className="text-[#85161B]" />
									</div>

									<div>
										<h2 className="font-semibold text-[#2E2E2E]">
											Payment Method
										</h2>

										<p className="mt-0.5 text-xs text-[#2E2E2E]/45">
											Choose your preferred payment option.
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-3 p-5 sm:p-6">
								<PaymentOption
									value="card"
									selected={paymentMethod === "card"}
									onChange={setPaymentMethod}
									title="Credit / Debit Card"
									description="Pay securely using your card"
								/>

								<PaymentOption
									value="upi"
									selected={paymentMethod === "upi"}
									onChange={setPaymentMethod}
									title="UPI"
									description="Google Pay, PhonePe, Paytm and more"
								/>

								<PaymentOption
									value="cod"
									selected={paymentMethod === "cod"}
									onChange={setPaymentMethod}
									title="Cash on Delivery"
									description="Pay when your order arrives"
								/>
							</div>
						</section>
					</div>

					{/* =================================================
					    RIGHT COLUMN — ORDER SUMMARY
					================================================= */}

					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white shadow-[0_10px_35px_rgba(80,40,20,0.05)]">
							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-[#2E2E2E]">
										Order Summary
									</h2>

									<span className="text-xs text-[#2E2E2E]/45">
										{items.length} {items.length === 1 ? "item" : "items"}
									</span>
								</div>
							</div>

							{/* Products */}

							<div className="divide-y divide-[#E8DED7]">
								{items.map((item) => {
									const quantity = item.quantity || 1;

									return (
										<div key={item.id} className="flex gap-3 p-4">
											<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F7F3F0]">
												{item.image ? (
													<img
														src={item.image}
														alt={item.title}
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center">
														<ShoppingBag
															size={20}
															className="text-[#85161B]/30"
														/>
													</div>
												)}

												<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#85161B] px-1 text-[10px] font-bold text-white">
													{quantity}
												</span>
											</div>

											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-[#2E2E2E]">
													{item.title}
												</p>

												<p className="mt-1 text-xs text-[#2E2E2E]/45">
													₹{Number(item.price).toFixed(2)} each
												</p>
											</div>

											<p className="text-sm font-semibold text-[#2E2E2E]">
												₹{(Number(item.price) * quantity).toFixed(2)}
											</p>
										</div>
									);
								})}
							</div>

							{/* Totals */}

							<div className="border-t border-[#E8DED7] p-5 sm:p-6">
								<div className="space-y-3 text-sm">
									<div className="flex justify-between text-[#2E2E2E]/60">
										<span>Subtotal</span>

										<span>₹{cartTotal.toFixed(2)}</span>
									</div>

									<div className="flex justify-between text-[#2E2E2E]/60">
										<span>Delivery</span>

										<span className="font-medium text-[#31824A]">Free</span>
									</div>

									<div className="border-t border-[#E8DED7] pt-4">
										<div className="flex items-end justify-between">
											<div>
												<p className="font-semibold text-[#2E2E2E]">Total</p>

												<p className="mt-1 text-[11px] text-[#2E2E2E]/40">
													Inclusive of applicable taxes
												</p>
											</div>

											<p className="text-2xl font-bold text-[#85161B]">
												₹{cartTotal.toFixed(2)}
											</p>
										</div>
									</div>
								</div>

								{/* Place Order */}

								<button
									type="submit"
									disabled={isPlacingOrder}
									className="
										group
										mt-6
										flex
										w-full
										items-center
										justify-center
										gap-2
										rounded-xl
										bg-[#85161B]
										py-3.5
										text-sm
										font-semibold
										text-white
										transition-all
										hover:bg-[#721318]
										hover:shadow-lg
										active:scale-[0.99]
										disabled:cursor-not-allowed
										disabled:opacity-60
									"
								>
									{isPlacingOrder ? "Placing Order..." : "Place Order"}

									{!isPlacingOrder && (
										<ArrowRight
											size={17}
											className="transition-transform group-hover:translate-x-1"
										/>
									)}
								</button>

								<div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#2E2E2E]/40">
									<LockKeyhole size={13} />

									<span>Secure & encrypted checkout</span>
								</div>
							</div>
						</div>
					</aside>
				</form>
			</section>
		</main>
	);
}

/* =============================================================
   FORM INPUT
============================================================= */

function FormInput({
	label,
	name,
	value,
	onChange,
	placeholder,
	type = "text",
	required = false,
}: {
	label: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	type?: string;
	required?: boolean;
}) {
	return (
		<div>
			<label
				htmlFor={name}
				className="mb-2 block text-xs font-semibold text-[#2E2E2E]"
			>
				{label}
				{required && <span className="ml-1 text-[#85161B]">*</span>}
			</label>

			<input
				id={name}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				className="
					w-full
					rounded-xl
					border
					border-[#DED6D0]
					bg-[#FCFBFA]
					px-3.5
					py-3
					text-sm
					text-[#2E2E2E]
					outline-none
					transition
					placeholder:text-[#2E2E2E]/30
					focus:border-[#85161B]
					focus:ring-2
					focus:ring-[#85161B]/10
				"
			/>
		</div>
	);
}

/* =============================================================
   PAYMENT OPTION
============================================================= */

function PaymentOption({
	value,
	selected,
	onChange,
	title,
	description,
}: {
	value: string;
	selected: boolean;
	onChange: (value: string) => void;
	title: string;
	description: string;
}) {
	return (
		<button
			type="button"
			onClick={() => onChange(value)}
			className={`
				flex
				w-full
				items-center
				justify-between
				rounded-xl
				border
				p-4
				text-left
				transition-all
				${
					selected
						? "border-[#85161B] bg-[#FFF9F6]"
						: "border-[#DED6D0] bg-white hover:border-[#85161B]/30"
				}
			`}
		>
			<div className="flex items-center gap-3">
				<div
					className={`
						flex
						h-5
						w-5
						items-center
						justify-center
						rounded-full
						border-2
						${selected ? "border-[#85161B]" : "border-[#DED6D0]"}
					`}
				>
					{selected && (
						<div className="h-2.5 w-2.5 rounded-full bg-[#85161B]" />
					)}
				</div>

				<div>
					<p className="text-sm font-semibold text-[#2E2E2E]">{title}</p>

					<p className="mt-1 text-xs text-[#2E2E2E]/45">{description}</p>
				</div>
			</div>

			{selected && (
				<CheckCircle2 size={18} className="shrink-0 text-[#85161B]" />
			)}
		</button>
	);
}
