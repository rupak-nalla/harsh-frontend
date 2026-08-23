"use client";

import React, { useEffect, useState } from "react";
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
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Address = {
	id: number;
	user_id: number;
	phone: string;
	flat_house_building: string;
	road_area_colony: string;
	landmark: string;
	city: string;
	state: string;
	pincode: number | string;
	primary: boolean;
};

type UserResponse = {
	status?: number;
	message?: string;
	login_status?: boolean;
	name?: string;
	phone?: string;
	email?: string;
	addresses?: Address[] | string;
};

export default function ProfilePage() {
	const router = useRouter();

	const [user, setUser] = useState<UserResponse | null>(null);
	const [loading, setLoading] = useState(true);

	const [logoutLoading, setLogoutLoading] = useState(false);
	const [error, setError] = useState("");

	/* =========================================================
	   FETCH USER
	========================================================= */

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setLoading(true);
				setError("");

				const response = await fetch("/api/auth/user", {
					method: "GET",
					credentials: "include",
					cache: "no-store",
					headers: {
						Accept: "application/json",
					},
				});

				/*
				 * Read as text first.
				 *
				 * This prevents:
				 * JSON.parse: unexpected character at line 1 column 1
				 *
				 * if the proxy/backend returns HTML or plain text.
				 */
				const text = await response.text();

				let data: UserResponse;

				try {
					data = text ? JSON.parse(text) : {};
				} catch (parseError) {
					console.error("Invalid JSON from /api/user:", text, parseError);

					throw new Error("The server returned an invalid response.");
				}

				console.log("USER RESPONSE:", data);

				if (!response.ok) {
					throw new Error(data?.message || "Unable to load your profile.");
				}

				if (data.login_status === false) {
					router.replace("/login");
					return;
				}

				setUser(data);
			} catch (error) {
				console.error("Profile fetch failed:", error);

				setError(
					error instanceof Error
						? error.message
						: "Unable to load your profile.",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [router]);

	/* =========================================================
	   LOGOUT
	========================================================= */

	const handleLogout = async () => {
		if (logoutLoading) return;

		try {
			setLogoutLoading(true);
			setError("");

			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
				headers: {
					Accept: "application/json",
				},
			});

			const text = await response.text();

			let data: {
				message?: string;
				success?: boolean;
			} = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				console.error("Invalid logout response:", text);
			}

			console.log("LOGOUT RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to sign out. Please try again.",
				);
			}

			/*
			 * Logout successful.
			 */
			router.replace("/login");
			router.refresh();
		} catch (error) {
			console.error("Logout failed:", error);

			setError(error instanceof Error ? error.message : "Unable to sign out.");

			setLogoutLoading(false);
		}
	};

	/* =========================================================
	   LOADING
	========================================================= */

	if (loading) {
		return (
			<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
				<section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center justify-center px-5">
					<div className="flex items-center gap-3 text-sm text-[#2E2E2E]/55">
						<Loader2 size={18} className="animate-spin text-[#85161B]" />
						Loading your profile...
					</div>
				</section>
			</main>
		);
	}

	/* =========================================================
	   ERROR
	========================================================= */

	if (error && !user) {
		return (
			<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
				<section className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center justify-center px-5">
					<div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
							<User size={22} />
						</div>

						<h2 className="mt-4 text-lg font-semibold text-[#2E2E2E]">
							Unable to load profile
						</h2>

						<p className="mt-2 text-sm text-[#2E2E2E]/55">{error}</p>

						<button
							type="button"
							onClick={() => window.location.reload()}
							className="mt-5 rounded-xl bg-[#85161B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#721318]"
						>
							Try again
						</button>
					</div>
				</section>
			</main>
		);
	}

	const addresses: Address[] = Array.isArray(user?.addresses)
		? user.addresses
		: [];

	const primaryAddress = addresses.find((address) => address.primary) || null;

	return (
		<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
			<section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
				{/* =====================================================
				    PAGE HEADER
				===================================================== */}

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

				{/* LOGOUT / OTHER ERROR */}

				{error && (
					<div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
					{/* =================================================
					    LEFT COLUMN
					================================================= */}

					<div className="space-y-6">
						{/* =================================================
						    PERSONAL INFORMATION
						================================================= */}

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
									className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#85161B] transition hover:bg-[#F8F0EC]"
								>
									<Pencil size={14} />
									Edit
								</button>
							</div>

							<div className="p-5 sm:p-6">
								{/* AVATAR */}

								<div className="mb-7 flex items-center gap-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7D6BF] text-[#85161B]">
										<User size={27} />
									</div>

									<div>
										<h3 className="text-lg font-semibold text-[#2E2E2E]">
											{user?.name || "User"}
										</h3>

										<p className="mt-1 text-xs text-[#2E2E2E]/50">
											Printing House member
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
									<ProfileField
										icon={<User size={17} />}
										label="Full name"
										value={user?.name || "Not available"}
									/>

									<ProfileField
										icon={<Mail size={17} />}
										label="Email address"
										value={user?.email || "Not available"}
									/>

									<ProfileField
										icon={<Phone size={17} />}
										label="Phone number"
										value={user?.phone || "Not available"}
									/>

									<ProfileField
										icon={<MapPin size={17} />}
										label="Primary location"
										value={
											primaryAddress
												? `${primaryAddress.city}, ${primaryAddress.state}`
												: "No address saved"
										}
									/>
								</div>
							</div>
						</div>

						{/* =================================================
						    SAVED ADDRESSES
						================================================= */}

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

								<Link
									href="/profile/address/add"
									className="inline-flex items-center gap-1.5 rounded-lg bg-[#85161B] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#721318]"
								>
									<Plus size={14} />
									Add
								</Link>
							</div>

							<div className="space-y-3 p-5 sm:p-6">
								{/* NO ADDRESS */}

								{addresses.length === 0 && (
									<div className="rounded-xl border border-dashed border-[#DCCFC8] bg-[#FCFAF8] p-6 text-center">
										<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F8F1ED] text-[#85161B]">
											<MapPin size={19} />
										</div>

										<p className="mt-3 text-sm font-semibold text-[#2E2E2E]">
											No addresses saved
										</p>

										<p className="mt-1 text-xs text-[#2E2E2E]/50">
											Add an address to make checkout faster.
										</p>
									</div>
								)}

								{/* ADDRESSES */}

								{addresses.map((address) => (
									<AddressCard key={address.id} address={address} />
								))}
							</div>
						</div>
					</div>

					{/* =================================================
					    RIGHT COLUMN
					================================================= */}

					<div className="space-y-6">
						{/* QUICK LINKS */}

						<div className="overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
							<div className="border-b border-[#EEE6E1] px-5 py-4">
								<h2 className="text-base font-semibold text-[#2E2E2E]">
									Quick access
								</h2>

								<p className="mt-1 text-xs text-[#2E2E2E]/45">
									Manage your Printing House account
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

						{/* JOURNEY */}

						<div className="rounded-2xl bg-[#85161B] p-6 text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
								<Package size={19} />
							</div>

							<h3
								className="mt-5 text-xl font-semibold"
								style={{ color: "white" }}
							>
								Your Printing House journey
							</h3>

							<p className="mt-2 text-sm leading-6 text-white/85">
								Keep track of your orders and discover more personalized gifts
								for the people you love.
							</p>

							<Link
								href="/orders"
								className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F7D6BF]"
							>
								View your orders
								<ArrowRight
									size={16}
									className="transition-transform group-hover:translate-x-1"
								/>
							</Link>
						</div>

						{/* LOGOUT */}

						<button
							type="button"
							onClick={handleLogout}
							disabled={logoutLoading}
							className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E9DED7] bg-white py-3 text-sm font-semibold text-[#85161B] transition hover:bg-[#FFF8F5] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{logoutLoading ? (
								<>
									<Loader2 size={17} className="animate-spin" />
									Signing out...
								</>
							) : (
								<>
									<LogOut size={17} />
									Sign out
								</>
							)}
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

/* =========================================================
   ADDRESS CARD
========================================================= */

function AddressCard({ address }: { address: Address }) {
	return (
		<div
			className={`rounded-xl border p-4 transition ${
				address.primary
					? "border-[#85161B]/40 bg-[#FFF8F5] shadow-[0_4px_20px_rgba(133,22,27,0.07)]"
					: "border-[#E9DED7] bg-[#FCFAF8]"
			}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 gap-3">
					{/* ICON */}

					<div
						className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
							address.primary
								? "bg-[#85161B] text-white"
								: "bg-[#F7D6BF]/60 text-[#85161B]"
						}`}
					>
						<MapPin size={17} />
					</div>

					<div className="min-w-0">
						{/* HEADER */}

						<div className="flex flex-wrap items-center gap-2">
							<p className="text-sm font-semibold text-[#2E2E2E]">Address</p>

							{address.primary && (
								<span className="inline-flex items-center rounded-full bg-[#85161B] px-2 py-0.5 text-[10px] font-semibold text-white">
									Primary
								</span>
							)}
						</div>

						{/* ADDRESS */}

						<p className="mt-2 text-xs leading-5 text-[#2E2E2E]/60">
							{address.flat_house_building}
							<br />
							{address.road_area_colony}
							<br />
							{address.landmark && (
								<>
									{address.landmark}
									<br />
								</>
							)}
							{address.city}, {address.state}
							<br />
							India - {address.pincode}
						</p>

						{/* PHONE */}

						{address.phone && (
							<p className="mt-2 flex items-center gap-1.5 text-xs text-[#2E2E2E]/55">
								<Phone size={12} />
								{address.phone}
							</p>
						)}
					</div>
				</div>

				{/* EDIT */}

				<Link
					href={`/profile/address/edit/${address.id}`}
					className="shrink-0 rounded-lg p-2 text-[#2E2E2E]/35 transition hover:bg-[#F1E7E1] hover:text-[#85161B]"
					aria-label="Edit address"
				>
					<Pencil size={15} />
				</Link>
			</div>
		</div>
	);
}

/* =========================================================
   PROFILE FIELD
========================================================= */

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

/* =========================================================
   ACCOUNT LINK
========================================================= */

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
			className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#FCF7F4]"
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
