"use client";

import React, { FormEvent, useEffect, useState } from "react";
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
	X,
	Trash2,
	Star,
	Check,
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

type AddressForm = {
	phone: string;
	flat_house_building: string;
	road_area_colony: string;
	landmark: string;
	city: string;
	state: string;
	pincode: string;
};

const emptyAddress: AddressForm = {
	phone: "",
	flat_house_building: "",
	road_area_colony: "",
	landmark: "",
	city: "",
	state: "",
	pincode: "",
};

export default function ProfilePage() {
	const router = useRouter();

	const [user, setUser] = useState<UserResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	/* =========================================================
	   MODALS
	========================================================= */

	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showAddressModal, setShowAddressModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [deletingAddress, setDeletingAddress] = useState<Address | null>(
		null,
	);

	/* =========================================================
	   PROFILE FORM
	========================================================= */

	const [profileName, setProfileName] = useState("");
	const [profilePhone, setProfilePhone] = useState("");
	const [profileLoading, setProfileLoading] = useState(false);

	/* =========================================================
	   ADDRESS FORM
	========================================================= */

	const [addressForm, setAddressForm] =
		useState<AddressForm>(emptyAddress);

	const [addressLoading, setAddressLoading] = useState(false);

	/* =========================================================
	   ACTION LOADING
	========================================================= */

	const [primaryLoading, setPrimaryLoading] = useState<number | null>(
		null,
	);

	const [deleteLoading, setDeleteLoading] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);

	/* =========================================================
	   FETCH USER
	========================================================= */

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

			const text = await response.text();

			let data: UserResponse = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch (parseError) {
				console.error("Invalid JSON from user API:", text);

				throw new Error(
					"The server returned an invalid response.",
				);
			}

			console.log("USER RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to load your profile.",
				);
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

	useEffect(() => {
		fetchUser();
	}, []);

	/* =========================================================
	   OPEN PROFILE MODAL
	========================================================= */

	const openProfileModal = () => {
		setProfileName(user?.name || "");
		setProfilePhone(user?.phone || "");
		setError("");
		setShowProfileModal(true);
	};

	/* =========================================================
	   UPDATE USER
	========================================================= */

	const handleUpdateUser = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (!profileName.trim()) {
			setError("Name is required.");
			return;
		}

		try {
			setProfileLoading(true);
			setError("");

			const formData = new FormData();

			formData.append("name", profileName.trim());

			if (profilePhone.trim()) {
				formData.append("phone", profilePhone.trim());
			}

			const response = await fetch("/api/auth/user/update-user", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					"The server returned an invalid response.",
				);
			}

			console.log("UPDATE USER RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message || "Unable to update your profile.",
				);
			}

			setShowProfileModal(false);

			await fetchUser();
		} catch (error) {
			console.error("Update user failed:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to update your profile.",
			);
		} finally {
			setProfileLoading(false);
		}
	};

	/* =========================================================
	   OPEN ADD ADDRESS
	========================================================= */

	const openAddAddressModal = () => {
		setEditingAddress(null);

		setAddressForm({
			...emptyAddress,
			phone: user?.phone || "",
		});

		setError("");
		setShowAddressModal(true);
	};

	/* =========================================================
	   OPEN EDIT ADDRESS
	========================================================= */

	const openEditAddressModal = (address: Address) => {
		setEditingAddress(address);

		setAddressForm({
			phone: address.phone || "",
			flat_house_building: address.flat_house_building || "",
			road_area_colony: address.road_area_colony || "",
			landmark: address.landmark || "",
			city: address.city || "",
			state: address.state || "",
			pincode: String(address.pincode || ""),
		});

		setError("");
		setShowAddressModal(true);
	};

	/* =========================================================
	   ADDRESS FORM CHANGE
	========================================================= */

	const updateAddressField = (
		field: keyof AddressForm,
		value: string,
	) => {
		setAddressForm((previous) => ({
			...previous,
			[field]: value,
		}));
	};

	/* =========================================================
	   ADD / UPDATE ADDRESS
	========================================================= */

	const handleAddressSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (
			!addressForm.phone.trim() ||
			!addressForm.flat_house_building.trim() ||
			!addressForm.road_area_colony.trim() ||
			!addressForm.city.trim() ||
			!addressForm.state.trim() ||
			!addressForm.pincode.trim()
		) {
			setError("Please fill all required address fields.");
			return;
		}

		try {
			setAddressLoading(true);
			setError("");

			const formData = new FormData();

			formData.append("phone", addressForm.phone.trim());
			formData.append(
				"flat_house_building",
				addressForm.flat_house_building.trim(),
			);
			formData.append(
				"road_area_colony",
				addressForm.road_area_colony.trim(),
			);
			formData.append("landmark", addressForm.landmark.trim());
			formData.append("city", addressForm.city.trim());
			formData.append("state", addressForm.state.trim());
			formData.append("pincode", addressForm.pincode.trim());

			let endpoint = "/api/auth/address/add";

			/*
			 * For editing we send the address ID.
			 *
			 * Your backend's update_user endpoint is used
			 * for updating the existing address.
			 */
			if (editingAddress) {
				endpoint = "/api/auth/address/update";

				formData.append(
					"id",
					String(editingAddress.id),
				);
			}

			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					"The server returned an invalid response.",
				);
			}

			console.log(
				editingAddress
					? "UPDATE ADDRESS RESPONSE:"
					: "ADD ADDRESS RESPONSE:",
				data,
			);

			if (!response.ok) {
				throw new Error(
					data?.message ||
						(editingAddress
							? "Unable to update address."
							: "Unable to add address."),
				);
			}

			setShowAddressModal(false);
			setEditingAddress(null);
			setAddressForm(emptyAddress);

			await fetchUser();
		} catch (error) {
			console.error("Address operation failed:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to save address.",
			);
		} finally {
			setAddressLoading(false);
		}
	};

	/* =========================================================
	   SET PRIMARY
	========================================================= */

	const handleSetPrimary = async (addressId: number) => {
		try {
			setPrimaryLoading(addressId);
			setError("");

			const formData = new FormData();

			formData.append("id", String(addressId));

			const response = await fetch("/api/auth/address/set-primary", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					"The server returned an invalid response.",
				);
			}

			console.log("SET PRIMARY RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message ||
						"Unable to set primary address.",
				);
			}

			await fetchUser();
		} catch (error) {
			console.error("Set primary failed:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to set primary address.",
			);
		} finally {
			setPrimaryLoading(null);
		}
	};

	/* =========================================================
	   DELETE ADDRESS
	========================================================= */

	const openDeleteModal = (address: Address) => {
		setDeletingAddress(address);
		setError("");
		setShowDeleteModal(true);
	};

	const handleDeleteAddress = async () => {
		if (!deletingAddress) return;

		try {
			setDeleteLoading(true);
			setError("");

			const formData = new FormData();

			formData.append(
				"id",
				String(deletingAddress.id),
			);

			const response = await fetch("/api/auth/address/delete", {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					"The server returned an invalid response.",
				);
			}

			console.log("DELETE ADDRESS RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message ||
						"Unable to delete address.",
				);
			}

			setShowDeleteModal(false);
			setDeletingAddress(null);

			await fetchUser();
		} catch (error) {
			console.error("Delete address failed:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to delete address.",
			);
		} finally {
			setDeleteLoading(false);
		}
	};

	/* =========================================================
	   LOGOUT
	========================================================= */

	const handleLogout = async () => {
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

			let data: any = {};

			try {
				data = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					"The server returned an invalid logout response.",
				);
			}

			console.log("LOGOUT RESPONSE:", data);

			if (!response.ok) {
				throw new Error(
					data?.message ||
						"Unable to sign out. Please try again.",
				);
			}

			setShowLogoutModal(false);

			router.replace("/login");
			router.refresh();
		} catch (error) {
			console.error("Logout failed:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to sign out.",
			);

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
						<Loader2
							size={18}
							className="animate-spin text-[#85161B]"
						/>
						Loading your profile...
					</div>
				</section>
			</main>
		);
	}

	/* =========================================================
	   ERROR WITH NO USER
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

						<p className="mt-2 text-sm text-[#2E2E2E]/55">
							{error}
						</p>

						<button
							type="button"
							onClick={fetchUser}
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

	const primaryAddress =
		addresses.find((address) => address.primary) || null;

	return (
		<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
			<section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
				{/* HEADER */}

				<div className="mb-8">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
						My account
					</p>

					<h1 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
						Profile
					</h1>

					<p className="mt-2 text-sm text-[#2E2E2E]/55 sm:text-base">
						Manage your personal information, addresses and
						account settings.
					</p>
				</div>

				{/* ERROR */}

				{error && user && (
					<div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						<span>{error}</span>

						<button
							type="button"
							onClick={() => setError("")}
							className="shrink-0"
						>
							<X size={16} />
						</button>
					</div>
				)}

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
					{/* LEFT */}

					<div className="space-y-6">
						{/* PERSONAL INFORMATION */}

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
									onClick={openProfileModal}
									className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#85161B] transition hover:bg-[#F8F0EC]"
								>
									<Pencil size={14} />
									Edit
								</button>
							</div>

							<div className="p-5 sm:p-6">
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
										value={
											user?.name ||
											"Not available"
										}
									/>

									<ProfileField
										icon={<Mail size={17} />}
										label="Email address"
										value={
											user?.email ||
											"Not available"
										}
									/>

									<ProfileField
										icon={<Phone size={17} />}
										label="Phone number"
										value={
											user?.phone ||
											"Not available"
										}
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

						{/* ADDRESSES */}

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
									onClick={openAddAddressModal}
									className="inline-flex items-center gap-1.5 rounded-lg bg-[#85161B] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#721318]"
								>
									<Plus size={14} />
									Add
								</button>
							</div>

							<div className="space-y-3 p-5 sm:p-6">
								{addresses.length === 0 && (
									<div className="rounded-xl border border-dashed border-[#DCCFC8] bg-[#FCFAF8] p-6 text-center">
										<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F8F1ED] text-[#85161B]">
											<MapPin size={19} />
										</div>

										<p className="mt-3 text-sm font-semibold text-[#2E2E2E]">
											No addresses saved
										</p>

										<p className="mt-1 text-xs text-[#2E2E2E]/50">
											Add an address to make
											checkout faster.
										</p>
									</div>
								)}

								{addresses.map((address) => (
									<AddressCard
										key={address.id}
										address={address}
										primaryLoading={
											primaryLoading
										}
										onSetPrimary={
											handleSetPrimary
										}
										onEdit={
											openEditAddressModal
										}
										onDelete={
											openDeleteModal
										}
									/>
								))}
							</div>
						</div>
					</div>

					{/* RIGHT */}

					<div className="space-y-6">
						{/* QUICK ACCESS */}

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

								{/* <AccountLink
									href="/settings"
									icon={<Settings size={18} />}
									title="Account Settings"
									subtitle="Password and preferences"
								/> */}
							</div>
						</div>

						{/* JOURNEY */}

						<div className="rounded-2xl bg-[#85161B] p-6 text-white">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
								<Package size={19} />
							</div>

							<h3 className="mt-5 text-xl font-semibold" style={{ color: "#FFFF" }}>
								Your Printing House journey
							</h3>

							<p className="mt-2 text-sm leading-6 text-white/85">
								Keep track of your orders and discover more
								personalized gifts for the people you love.
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
							onClick={() => setShowLogoutModal(true)}
							className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E9DED7] bg-white py-3 text-sm font-semibold text-[#85161B] transition hover:bg-[#FFF8F5]"
						>
							<LogOut size={17} />
							Sign out
						</button>
					</div>
				</div>
			</section>

			{/* =========================================================
			    PROFILE MODAL
			========================================================= */}

			{showProfileModal && (
				<Modal
					title="Edit personal information"
					onClose={() => setShowProfileModal(false)}
				>
					<form
						onSubmit={handleUpdateUser}
						className="space-y-5"
					>
						<FormInput
							label="Full name"
							value={profileName}
							onChange={setProfileName}
							icon={<User size={17} />}
						/>

						<FormInput
							label="Phone number"
							value={profilePhone}
							onChange={(value) =>
								setProfilePhone(
									value.replace(/\D/g, ""),
								)
							}
							icon={<Phone size={17} />}
						/>

						<div className="rounded-xl bg-[#F8F1ED] px-4 py-3 text-xs text-[#2E2E2E]/55">
							Your email address cannot be changed from
							here.
						</div>

						<ModalButtons
							loading={profileLoading}
							submitText="Save changes"
							onCancel={() =>
								setShowProfileModal(false)
							}
						/>
					</form>
				</Modal>
			)}

			{/* =========================================================
			    ADDRESS MODAL
			========================================================= */}

			{showAddressModal && (
				<Modal
					title={
						editingAddress
							? "Edit address"
							: "Add new address"
					}
					onClose={() => {
						if (!addressLoading) {
							setShowAddressModal(false);
							setEditingAddress(null);
						}
					}}
					wide
				>
					<form
						onSubmit={handleAddressSubmit}
						className="space-y-4"
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								label="Phone number"
								value={addressForm.phone}
								onChange={(value) =>
									updateAddressField(
										"phone",
										value.replace(
											/\D/g,
											"",
										),
									)
								}
								icon={<Phone size={17} />}
								required
							/>

							<FormInput
								label="Pincode"
								value={addressForm.pincode}
								onChange={(value) =>
									updateAddressField(
										"pincode",
										value.replace(
											/\D/g,
											"",
										),
									)
								}
								icon={<MapPin size={17} />}
								required
							/>
						</div>

						<FormInput
							label="Flat / House / Building"
							value={
								addressForm.flat_house_building
							}
							onChange={(value) =>
								updateAddressField(
									"flat_house_building",
									value,
								)
							}
							icon={<MapPin size={17} />}
							required
						/>

						<FormInput
							label="Road / Area / Colony"
							value={
								addressForm.road_area_colony
							}
							onChange={(value) =>
								updateAddressField(
									"road_area_colony",
									value,
								)
							}
							icon={<MapPin size={17} />}
							required
						/>

						<FormInput
							label="Landmark"
							value={addressForm.landmark}
							onChange={(value) =>
								updateAddressField(
									"landmark",
									value,
								)
							}
							icon={<MapPin size={17} />}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormInput
								label="City"
								value={addressForm.city}
								onChange={(value) =>
									updateAddressField(
										"city",
										value,
									)
								}
								icon={<MapPin size={17} />}
								required
							/>

							<FormInput
								label="State"
								value={addressForm.state}
								onChange={(value) =>
									updateAddressField(
										"state",
										value,
									)
								}
								icon={<MapPin size={17} />}
								required
							/>
						</div>

						<div className="rounded-xl border border-[#E9DED7] bg-[#FCFAF8] px-4 py-3 text-xs text-[#2E2E2E]/55">
							{editingAddress
								? "Update the address details and save your changes."
								: addresses.length === 0
									? "This will automatically become your primary address."
									: "You can make this address primary after adding it."}
						</div>

						<ModalButtons
							loading={addressLoading}
							submitText={
								editingAddress
									? "Update address"
									: "Save address"
							}
							onCancel={() => {
								setShowAddressModal(false);
								setEditingAddress(null);
							}}
						/>
					</form>
				</Modal>
			)}

			{/* =========================================================
			    DELETE MODAL
			========================================================= */}

			{showDeleteModal && deletingAddress && (
				<Modal
					title="Delete address"
					onClose={() => {
						if (!deleteLoading) {
							setShowDeleteModal(false);
							setDeletingAddress(null);
						}
					}}
				>
					<div className="text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
							<Trash2 size={21} />
						</div>

						<h3 className="mt-4 text-base font-semibold text-[#2E2E2E]">
							Delete this address?
						</h3>

						<p className="mt-2 text-sm leading-6 text-[#2E2E2E]/55">
							This address will be permanently removed
							from your account.
						</p>

						<div className="mt-5 rounded-xl bg-[#FCFAF8] p-4 text-left text-xs leading-5 text-[#2E2E2E]/60">
							{deletingAddress.flat_house_building}
							<br />
							{deletingAddress.road_area_colony}
							<br />
							{deletingAddress.city},{" "}
							{deletingAddress.state} -{" "}
							{deletingAddress.pincode}
						</div>

						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() => {
									setShowDeleteModal(false);
									setDeletingAddress(null);
								}}
								disabled={deleteLoading}
								className="flex-1 rounded-xl border border-[#DED6D0] bg-white py-3 text-sm font-semibold text-[#2E2E2E] hover:bg-[#FCFAF8]"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleDeleteAddress}
								disabled={deleteLoading}
								className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
							>
								{deleteLoading ? (
									<>
										<Loader2
											size={16}
											className="animate-spin"
										/>
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</button>
						</div>
					</div>
				</Modal>
			)}

			{/* =========================================================
			    LOGOUT MODAL
			========================================================= */}

			{showLogoutModal && (
				<Modal
					title="Sign out"
					onClose={() => {
						if (!logoutLoading) {
							setShowLogoutModal(false);
						}
					}}
				>
					<div className="text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F1ED] text-[#85161B]">
							<LogOut size={21} />
						</div>

						<h3 className="mt-4 text-base font-semibold text-[#2E2E2E]">
							Are you sure you want to sign out?
						</h3>

						<p className="mt-2 text-sm leading-6 text-[#2E2E2E]/55">
							You will need to sign in again to access
							your account.
						</p>

						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() =>
									setShowLogoutModal(false)
								}
								disabled={logoutLoading}
								className="flex-1 rounded-xl border border-[#DED6D0] bg-white py-3 text-sm font-semibold text-[#2E2E2E] hover:bg-[#FCFAF8]"
							>
								Cancel
							</button>

							<button
								type="button"
								onClick={handleLogout}
								disabled={logoutLoading}
								className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3 text-sm font-semibold text-white hover:bg-[#721318] disabled:opacity-60"
							>
								{logoutLoading ? (
									<>
										<Loader2
											size={16}
											className="animate-spin"
										/>
										Signing out...
									</>
								) : (
									"Sign out"
								)}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</main>
	);
}

/* =========================================================
   ADDRESS CARD
========================================================= */

function AddressCard({
	address,
	primaryLoading,
	onSetPrimary,
	onEdit,
	onDelete,
}: {
	address: Address;
	primaryLoading: number | null;
	onSetPrimary: (id: number) => void;
	onEdit: (address: Address) => void;
	onDelete: (address: Address) => void;
}) {
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
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-sm font-semibold text-[#2E2E2E]">
								Address
							</p>

							{address.primary && (
								<span className="inline-flex items-center gap-1 rounded-full bg-[#85161B] px-2 py-0.5 text-[10px] font-semibold text-white">
									<Star size={9} />
									Primary
								</span>
							)}
						</div>

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

						{address.phone && (
							<p className="mt-2 flex items-center gap-1.5 text-xs text-[#2E2E2E]/55">
								<Phone size={12} />
								{address.phone}
							</p>
						)}

						{/* ACTIONS */}

						<div className="mt-4 flex flex-wrap items-center gap-2">
							{!address.primary && (
								<button
									type="button"
									onClick={() =>
										onSetPrimary(address.id)
									}
									disabled={
										primaryLoading ===
										address.id
									}
									className="inline-flex items-center gap-1.5 rounded-lg border border-[#E9DED7] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#85161B] transition hover:bg-[#FFF8F5] disabled:opacity-60"
								>
									{primaryLoading ===
									address.id ? (
										<>
											<Loader2
												size={12}
												className="animate-spin"
											/>
											Setting...
										</>
									) : (
										<>
											<Star size={12} />
											Set as primary
										</>
									)}
								</button>
							)}

							{address.primary && (
								<span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EDF8F0] px-3 py-1.5 text-[11px] font-semibold text-[#31824A]">
									<Check size={12} />
									Default delivery address
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						onClick={() => onEdit(address)}
						className="rounded-lg p-2 text-[#2E2E2E]/35 transition hover:bg-[#F1E7E1] hover:text-[#85161B]"
						aria-label="Edit address"
					>
						<Pencil size={15} />
					</button>

					<button
						type="button"
						onClick={() => onDelete(address)}
						className="rounded-lg p-2 text-[#2E2E2E]/35 transition hover:bg-red-50 hover:text-red-600"
						aria-label="Delete address"
					>
						<Trash2 size={15} />
					</button>
				</div>
			</div>
		</div>
	);
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
	title,
	children,
	onClose,
	wide = false,
}: {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
	wide?: boolean;
}) {
	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${
					wide ? "max-w-2xl" : "max-w-md"
				}`}
			>
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEE6E1] bg-white px-5 py-4 sm:px-6">
					<h2 className="text-base font-semibold text-[#2E2E2E]">
						{title}
					</h2>

					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-[#2E2E2E]/40 transition hover:bg-[#F8F1ED] hover:text-[#85161B]"
					>
						<X size={18} />
					</button>
				</div>

				<div className="p-5 sm:p-6">{children}</div>
			</div>
		</div>
	);
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
	label,
	value,
	onChange,
	icon,
	required = false,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	icon: React.ReactNode;
	required?: boolean;
}) {
	return (
		<div>
			<label className="mb-2 block text-xs font-semibold text-[#2E2E2E]">
				{label}

				{required && (
					<span className="ml-1 text-[#85161B]">*</span>
				)}
			</label>

			<div className="flex items-center rounded-xl border border-[#DED6D0] bg-[#FCFBFA] px-3.5 transition focus-within:border-[#85161B] focus-within:ring-2 focus-within:ring-[#85161B]/10">
				<span className="mr-3 shrink-0 text-[#2E2E2E]/35">
					{icon}
				</span>

				<input
					type="text"
					value={value}
					onChange={(event) =>
						onChange(event.target.value)
					}
					className="w-full bg-transparent py-3 text-sm text-[#2E2E2E] outline-none placeholder:text-[#2E2E2E]/30"
				/>
			</div>
		</div>
	);
}

/* =========================================================
   MODAL BUTTONS
========================================================= */

function ModalButtons({
	loading,
	submitText,
	onCancel,
}: {
	loading: boolean;
	submitText: string;
	onCancel: () => void;
}) {
	return (
		<div className="flex gap-3 pt-2">
			<button
				type="button"
				onClick={onCancel}
				disabled={loading}
				className="flex-1 rounded-xl border border-[#DED6D0] bg-white py-3 text-sm font-semibold text-[#2E2E2E] transition hover:bg-[#FCFAF8] disabled:opacity-60"
			>
				Cancel
			</button>

			<button
				type="submit"
				disabled={loading}
				className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3 text-sm font-semibold text-white transition hover:bg-[#721318] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{loading ? (
					<>
						<Loader2
							size={16}
							className="animate-spin"
						/>
						Saving...
					</>
				) : (
					submitText
				)}
			</button>
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
				<p className="text-sm font-semibold text-[#2E2E2E]">
					{title}
				</p>

				<p className="mt-0.5 text-xs text-[#2E2E2E]/45">
					{subtitle}
				</p>
			</div>

			<ArrowRight
				size={16}
				className="text-[#2E2E2E]/25 transition group-hover:translate-x-0.5 group-hover:text-[#85161B]"
			/>
		</Link>
	);
}