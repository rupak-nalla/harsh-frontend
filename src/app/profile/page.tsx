"use client";

import React from "react";
import Link from "next/link";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Package,
	Heart,
	Settings,
	LogOut,
	ArrowRight,
	Pencil,
	Plus,
} from "lucide-react";

export default function ProfilePage() {
	return (
		<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
			<section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
				{/* ─────────────────────────
				    PAGE HEADER
				───────────────────────── */}

				<div className="mb-8">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
						My account
					</p>

					<h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
						Profile
					</h1>

					<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
						Manage your personal information, addresses and account settings.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
					{/* ─────────────────────────
					    LEFT COLUMN
					───────────────────────── */}

					<div className="space-y-6">
						{/* Profile information */}

						<div className="overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
							<div className="flex items-center justify-between border-b border-[#EEE6E1] px-5 py-4 sm:px-6">
								<div>
									<h2 className="text-base font-semibold text-[#2E2E2E]">
										Personal information
									</h2>

									<p className="mt-1 text-xs text-[#2E2E2E]/45">
										Your basic account details
									</p>
								</div>

								<button
									type="button"
									className="
										inline-flex
										items-center
										gap-1.5
										rounded-lg
										px-3
										py-2
										text-xs
										font-semibold
										text-[#85161B]
										transition
										hover:bg-[#F8F0EC]
									"
								>
									<Pencil size={14} />
									Edit
								</button>
							</div>

							<div className="p-5 sm:p-6">
								{/* Avatar */}

								<div className="mb-7 flex items-center gap-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7D6BF] text-[#85161B]">
										<User size={27} />
									</div>

									<div>
										<h3 className="text-lg font-semibold text-[#2E2E2E]">
											Rupak Nalla
										</h3>

										<p className="mt-1 text-xs text-[#2E2E2E]/50">
											Giftify member
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
									<ProfileField
										icon={<User size={17} />}
										label="Full name"
										value="Rupak Nalla"
									/>

									<ProfileField
										icon={<Mail size={17} />}
										label="Email address"
										value="rupak@example.com"
									/>

									<ProfileField
										icon={<Phone size={17} />}
										label="Phone number"
										value="+91 98765 43210"
									/>

									<ProfileField
										icon={<MapPin size={17} />}
										label="Location"
										value="Hyderabad, India"
									/>
								</div>
							</div>
						</div>

						{/* Address */}

						<div className="overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
							<div className="flex items-center justify-between border-b border-[#EEE6E1] px-5 py-4 sm:px-6">
								<div>
									<h2 className="text-base font-semibold text-[#2E2E2E]">
										Saved addresses
									</h2>

									<p className="mt-1 text-xs text-[#2E2E2E]/45">
										Addresses used for your deliveries
									</p>
								</div>

								<button
									type="button"
									className="
										inline-flex
										items-center
										gap-1.5
										rounded-lg
										bg-[#85161B]
										px-3
										py-2
										text-xs
										font-semibold
										text-white
										transition
										hover:bg-[#721318]
									"
								>
									<Plus size={14} />
									Add
								</button>
							</div>

							<div className="p-5 sm:p-6">
								<div className="rounded-xl border border-[#E9DED7] bg-[#FCFAF8] p-4">
									<div className="flex items-start justify-between gap-4">
										<div className="flex gap-3">
											<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF]/60 text-[#85161B]">
												<MapPin size={17} />
											</div>

											<div>
												<div className="flex items-center gap-2">
													<p className="text-sm font-semibold text-[#2E2E2E]">
														Home
													</p>

													<span className="rounded-full bg-[#EDF8F0] px-2 py-0.5 text-[10px] font-semibold text-[#31824A]">
														Default
													</span>
												</div>

												<p className="mt-2 text-xs leading-5 text-[#2E2E2E]/55">
													Rupak Nalla
													<br />
													Hyderabad, Telangana
													<br />
													India - 500081
												</p>

												<p className="mt-2 text-xs text-[#2E2E2E]/55">
													+91 98765 43210
												</p>
											</div>
										</div>

										<button
											type="button"
											className="rounded-lg p-2 text-[#2E2E2E]/35 transition hover:bg-[#F1E7E1] hover:text-[#85161B]"
											aria-label="Edit address"
										>
											<Pencil size={15} />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ─────────────────────────
					    RIGHT COLUMN
					───────────────────────── */}

					<div className="space-y-6">
						{/* Quick links */}

						<div className="overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
							<div className="border-b border-[#EEE6E1] px-5 py-4">
								<h2 className="text-base font-semibold text-[#2E2E2E]">
									Quick access
								</h2>

								<p className="mt-1 text-xs text-[#2E2E2E]/45">
									Manage your Giftify account
								</p>
							</div>

							<div className="p-3">
								<AccountLink
									href="/orders"
									icon={<Package size={18} />}
									title="My Orders"
									subtitle="Track and view your orders"
								/>

								<AccountLink
									href="/wishlist"
									icon={<Heart size={18} />}
									title="Wishlist"
									subtitle="Your saved products"
								/>

								<AccountLink
									href="/settings"
									icon={<Settings size={18} />}
									title="Account Settings"
									subtitle="Password and preferences"
								/>
							</div>
						</div>

						{/* Order summary */}

						<div className="rounded-2xl bg-[#85161B] p-6 text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
								<Package size={19} />
							</div>

							<h3 className="mt-5 text-xl font-semibold">
								Your Giftify journey
							</h3>

							<p className="mt-2 text-sm leading-6 text-white/65">
								Keep track of your orders and discover more personalized gifts
								for the people you love.
							</p>

							<Link
								href="/orders"
								className="
									group
									mt-5
									inline-flex
									items-center
									gap-2
									text-sm
									font-semibold
									text-[#F7D6BF]
								"
							>
								View your orders
								<ArrowRight
									size={16}
									className="transition-transform group-hover:translate-x-1"
								/>
							</Link>
						</div>

						{/* Logout */}

						<button
							type="button"
							className="
								flex
								w-full
								items-center
								justify-center
								gap-2
								rounded-xl
								border
								border-[#E9DED7]
								bg-white
								py-3
								text-sm
								font-semibold
								text-[#85161B]
								transition
								hover:bg-[#FFF8F5]
							"
						>
							<LogOut size={17} />
							Sign out
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

/* ─────────────────────────
   PROFILE FIELD
───────────────────────── */

function ProfileField({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F1ED] text-[#85161B]">
				{icon}
			</div>

			<div className="min-w-0">
				<p className="text-[11px] font-medium uppercase tracking-wide text-[#2E2E2E]/40">
					{label}
				</p>

				<p className="mt-1 truncate text-sm font-medium text-[#2E2E2E]">
					{value}
				</p>
			</div>
		</div>
	);
}

/* ─────────────────────────
   ACCOUNT LINK
───────────────────────── */

function AccountLink({
	href,
	icon,
	title,
	subtitle,
}: {
	href: string;
	icon: React.ReactNode;
	title: string;
	subtitle: string;
}) {
	return (
		<Link
			href={href}
			className="
				group
				flex
				items-center
				gap-3
				rounded-xl
				p-3
				transition
				hover:bg-[#FCF7F4]
			"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F1ED] text-[#85161B] transition group-hover:bg-[#F7D6BF]">
				{icon}
			</div>

			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-[#2E2E2E]">{title}</p>

				<p className="mt-0.5 text-xs text-[#2E2E2E]/45">{subtitle}</p>
			</div>

			<ArrowRight
				size={16}
				className="text-[#2E2E2E]/25 transition group-hover:translate-x-0.5 group-hover:text-[#85161B]"
			/>
		</Link>
	);
}
