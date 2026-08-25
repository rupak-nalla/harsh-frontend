"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	LockKeyhole,
	MapPin,
	ShoppingBag,
	Truck,
	CreditCard,
	AlertCircle,
	Plus,
} from "lucide-react";

/* =========================================================
   RAZORPAY TYPES
========================================================= */

declare global {
	interface Window {
		Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
	}
}

type RazorpayResponse = {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
};

type RazorpayOptions = {
	key: string;
	order_id: string;
	name?: string;
	description?: string;

	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};

	handler: (response: RazorpayResponse) => void;

	modal?: {
		ondismiss?: () => void;
	};

	theme?: {
		color?: string;
	};
};

type RazorpayInstance = {
	open: () => void;
	on: (event: string, callback: (response: unknown) => void) => void;
};

/* =========================================================
   CART TYPES
========================================================= */

/*
   These fields match the actual /cart response.
*/

type CartItem = {
	id: string;
	name: string;
	selling_price: number;
	quantity: number;
	image?: string;
	delivery: number;
};

type RawCartItem = {
	id?: string | number;
	name?: string;

	selling_price?: number | string;
	market_price?: number | string;
	reseller_price?: number | string;

	quantity?: number | string;

	primary_photo_path?: string;
	other_photos_paths?: string;

	delivery?: number | string;

	description?: string;
};

/* =========================================================
   CART RESPONSE
========================================================= */

type CartResponse = {
	status?: number;
	message?: string;

	products_count?: number;

	cart?: RawCartItem[];

	total_price?: number | string;
	delivery_fee?: number | string;
	grand_total?: number | string;
};

/* =========================================================
   CHECKOUT RESPONSE
========================================================= */

type CheckoutResponse = {
	status: number;
	message: string;
	result: {
		key: string;
		order_id: string;
	};
};

/* =========================================================
   AUTH USER RESPONSE (/api/auth/user)

   Actual response:
   {
     "status": 200,
     "message": "Success",
     "login_status": true,
     "name": "Nalla Rupak",
     "phone": "9154048555",
     "email": "nallarupak@gmail.com",
     "addresses": [
       {
         "id": 1,
         "user_id": 17,
         "phone": "9154048555",
         "flat_house_building": "23-1/6-24, RAJARAJESHWARA COLONY, CHUNNAMBATTIWADA",
         "road_area_colony": "ASDFGHJ",
         "landmark": "23-1/6-24, RAJARAJESHWARA COLONY, CHUNNAMBATTIWADA",
         "city": "Mancherial",
         "state": "Telangana",
         "pincode": 504208,
         "primary": false
       }
     ]
   }

   This single endpoint tells us whether the user is logged in
   AND (when logged in) gives us their name/phone/email plus
   saved addresses — no separate /api/init call needed.
========================================================= */

type RawAddress = {
	id?: string | number;
	user_id?: string | number;
	phone?: string;
	flat_house_building?: string;
	road_area_colony?: string;
	landmark?: string;
	city?: string;
	state?: string;
	pincode?: number | string;
	primary?: boolean;
};

type Address = {
	id: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	pincode: string;
	isDefault: boolean;
};

type AuthUserResponse = {
	status?: number;
	message?: string;
	login_status?: boolean;
	name?: string;
	phone?: string;
	email?: string;
	addresses?: RawAddress[];
};

/* =========================================================
   NORMALIZE CART ITEM
========================================================= */

function normalizeCartItem(raw: RawCartItem): CartItem {
	const id = String(raw.id ?? "");

	const name = raw.name ?? "Untitled product";

	const sellingPrice = Number(raw.selling_price ?? 0);

	const quantity = Number(raw.quantity ?? 1);

	const delivery = Number(raw.delivery ?? 0);

	return {
		id,
		name,

		selling_price: Number.isFinite(sellingPrice) ? sellingPrice : 0,

		quantity:
			Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,

		image: raw.primary_photo_path,

		delivery: Number.isFinite(delivery) ? delivery : 0,
	};
}

/* =========================================================
   NORMALIZE ADDRESS
========================================================= */

function normalizeAddress(raw: RawAddress, index: number): Address {
	const id = String(raw.id ?? `addr-${index}`);

	/*
		Build a single display/edit address string out of the
		flat/building, road/area, and landmark fields. The backend
		sometimes duplicates the same text between
		flat_house_building and landmark (see sample response), so
		skip landmark if it's identical to avoid repeating it.
	*/
	const parts = [raw.flat_house_building, raw.road_area_colony].filter(
		(part): part is string => Boolean(part && part.trim()),
	);

	if (
		raw.landmark &&
		raw.landmark.trim() &&
		raw.landmark.trim() !== raw.flat_house_building?.trim()
	) {
		parts.push(raw.landmark.trim());
	}

	return {
		id,
		phone: raw.phone ?? "",
		address: parts.join(", "),
		city: raw.city ?? "",
		state: raw.state ?? "",
		pincode: raw.pincode !== undefined ? String(raw.pincode) : "",
		isDefault: Boolean(raw.primary),
	};
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
	return (
		<>
			<Script
				src="https://checkout.razorpay.com/v1/checkout.js"
				strategy="afterInteractive"
			/>

			<CheckoutView />
		</>
	);
}

/* =========================================================
   CHECKOUT VIEW
========================================================= */

function CheckoutView() {
	/* =======================================================
	   CART STATE
	======================================================= */

	const [items, setItems] = useState<CartItem[]>([]);

	const [itemCount, setItemCount] = useState(0);

	const [subtotal, setSubtotal] = useState(0);

	const [deliveryFee, setDeliveryFee] = useState(0);

	const [grandTotal, setGrandTotal] = useState(0);

	const [loadingCart, setLoadingCart] = useState(true);

	const [cartError, setCartError] = useState("");

	/* =======================================================
	   AUTH + SAVED ADDRESS STATE
	======================================================= */

	const [checkingAuth, setCheckingAuth] = useState(true);

	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

	// "new" means "use the manual address form below".
	// Any other value is the id of a selected saved address.
	const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

	/* =======================================================
	   FORM STATE
	======================================================= */

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

	/* =======================================================
	   PAYMENT STATE
	======================================================= */

	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	const [paymentError, setPaymentError] = useState("");

	const [paymentSuccess, setPaymentSuccess] = useState(false);

	/* =======================================================
	   FETCH CART
	======================================================= */

	const fetchCart = async () => {
		setLoadingCart(true);
		setCartError("");

		try {
			const response = await fetch("/api/cart", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: CartResponse = await response.json().catch(() => ({}));

			console.log("CART RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to load your cart.");
			}

			/* =================================================
			   CART ITEMS
			================================================= */

			const rawItems = data.cart ?? [];

			const normalizedItems = rawItems.map(normalizeCartItem);

			console.log("NORMALIZED CART ITEMS:", normalizedItems);

			setItems(normalizedItems);

			/* =================================================
			   ITEM COUNT

			   Backend:
			   products_count: 3
			================================================= */

			const calculatedItemCount = normalizedItems.reduce(
				(sum, item) => sum + item.quantity,
				0,
			);

			const backendItemCount = Number(
				data.products_count ?? calculatedItemCount,
			);

			setItemCount(
				Number.isFinite(backendItemCount)
					? backendItemCount
					: calculatedItemCount,
			);

			/* =================================================
			   SUBTOTAL

			   Backend:
			   total_price: 537
			================================================= */

			const calculatedSubtotal = normalizedItems.reduce(
				(sum, item) => sum + item.selling_price * item.quantity,
				0,
			);

			const backendSubtotal = Number(data.total_price ?? calculatedSubtotal);

			const safeSubtotal = Number.isFinite(backendSubtotal)
				? backendSubtotal
				: calculatedSubtotal;

			setSubtotal(safeSubtotal);

			/* =================================================
			   DELIVERY

			   Backend:
			   delivery_fee: 90
			================================================= */

			const backendDeliveryFee = Number(data.delivery_fee ?? 0);

			const safeDeliveryFee = Number.isFinite(backendDeliveryFee)
				? backendDeliveryFee
				: 0;

			setDeliveryFee(safeDeliveryFee);

			/* =================================================
			   GRAND TOTAL

			   Backend:
			   grand_total: 627
			================================================= */

			const calculatedGrandTotal = safeSubtotal + safeDeliveryFee;

			const backendGrandTotal = Number(
				data.grand_total ?? calculatedGrandTotal,
			);

			const safeGrandTotal = Number.isFinite(backendGrandTotal)
				? backendGrandTotal
				: calculatedGrandTotal;

			setGrandTotal(safeGrandTotal);
		} catch (error) {
			console.error("Fetch checkout cart failed:", error);

			setCartError(
				error instanceof Error ? error.message : "Unable to load your cart.",
			);
		} finally {
			setLoadingCart(false);
		}
	};

	/* =======================================================
	   APPLY A SAVED ADDRESS TO THE FORM

	   Only touches the address-related fields (address, city,
	   state, pincode, phone). Name/email always come from the
	   account, not from the address record.
	======================================================= */

	const applyAddressToForm = (addr: Address) => {
		setFormData((previous) => ({
			...previous,
			phone: addr.phone || previous.phone,
			address: addr.address,
			city: addr.city,
			state: addr.state,
			pincode: addr.pincode,
		}));
	};

	/* =======================================================
	   CHECK LOGIN + LOAD ACCOUNT DETAILS (/api/auth/user)

	   Single source of truth when logged in: name, phone,
	   email, and saved addresses all come from this one call —
	   nothing here is re-typed by the user unless they choose
	   "Add a new address".
	======================================================= */

	const loadAccount = async () => {
		setCheckingAuth(true);

		try {
			const response = await fetch("/api/auth/user", {
				method: "GET",
				credentials: "include",
				cache: "no-store",
			});

			const data: AuthUserResponse = await response.json().catch(() => ({}));

			console.log("AUTH USER RESPONSE:", data);

			const loggedIn = Boolean(data.login_status);

			setIsLoggedIn(loggedIn);

			if (!loggedIn) {
				return;
			}

			/* =================================================
			   RECEIVER NAME / CONTACT DETAILS

			   The API returns a single "name" field rather than
			   first/last, so split it. This name + email + phone
			   apply account-wide — they don't vary per address.
			================================================= */

			const nameParts = (data.name ?? "").trim().split(/\s+/).filter(Boolean);

			const firstName = nameParts[0] ?? "";
			const lastName = nameParts.slice(1).join(" ");

			setFormData((previous) => ({
				...previous,
				firstName: firstName || previous.firstName,
				lastName: lastName || previous.lastName,
				email: data.email || previous.email,
				phone: data.phone || previous.phone,
			}));

			/* =================================================
			   SAVED ADDRESSES
			================================================= */

			const rawAddresses = data.addresses ?? [];

			const normalized = rawAddresses.map((raw, index) =>
				normalizeAddress(raw, index),
			);

			console.log("NORMALIZED ADDRESSES:", normalized);

			setSavedAddresses(normalized);

			if (normalized.length > 0) {
				const defaultAddress =
					normalized.find((addr) => addr.isDefault) ?? normalized[0];

				setSelectedAddressId(defaultAddress.id);
				applyAddressToForm(defaultAddress);
			} else {
				setSelectedAddressId("new");
			}
		} catch (error) {
			console.error("Load account failed:", error);

			// Treat as logged out — the manual address form still works.
			setIsLoggedIn(false);
			setSavedAddresses([]);
		} finally {
			setCheckingAuth(false);
		}
	};

	useEffect(() => {
		fetchCart();
		loadAccount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/* =======================================================
	   HANDLE INPUT
	======================================================= */

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	/* =======================================================
	   HANDLE SELECTING A SAVED ADDRESS / "ADD NEW"
	======================================================= */

	const handleSelectAddress = (id: string) => {
		setSelectedAddressId(id);

		if (id === "new") {
			// Keep the account's name/email/phone — only clear the
			// address-specific fields so a new delivery address can
			// be entered.
			setFormData((previous) => ({
				...previous,
				address: "",
				city: "",
				state: "",
				pincode: "",
			}));

			return;
		}

		const address = savedAddresses.find((addr) => addr.id === id);

		if (address) {
			applyAddressToForm(address);
		}
	};

	/* =======================================================
	   VALIDATE FORM
	======================================================= */

	const validateForm = () => {
		if (!formData.firstName.trim()) {
			return "Please enter your first name.";
		}

		if (!formData.lastName.trim()) {
			return "Please enter your last name.";
		}

		if (!formData.email.trim()) {
			return "Please enter your email address.";
		}

		if (!formData.phone.trim()) {
			return "Please enter your phone number.";
		}

		if (!formData.address.trim()) {
			return "Please enter your address.";
		}

		if (!formData.city.trim()) {
			return "Please enter your city.";
		}

		if (!formData.state.trim()) {
			return "Please enter your state.";
		}

		if (!formData.pincode.trim()) {
			return "Please enter your PIN code.";
		}

		return null;
	};

	/* =======================================================
	   OPEN RAZORPAY
	======================================================= */

	const openRazorpay = (apiKey: string, orderId: string) => {
		if (!window.Razorpay) {
			throw new Error(
				"Razorpay Checkout has not loaded yet. Please refresh the page and try again.",
			);
		}

		const fullName = `${formData.firstName} ${formData.lastName}`.trim();

		const options: RazorpayOptions = {
			key: apiKey,

			order_id: orderId,

			name: "Printing House",

			description: "Personalized Gifts & Custom Printing",

			prefill: {
				name: fullName,
				email: formData.email,
				contact: formData.phone,
			},

			theme: {
				color: "#85161B",
			},

			/* ===============================================
			   SUCCESS CALLBACK
			=============================================== */

			handler: async (response: RazorpayResponse) => {
				console.log("RAZORPAY SUCCESS:", response);

				try {
					/*
					 * Send all 3 Razorpay values to /api/verify_payment
					 */
					const verifyResponse = await fetch("/api/verify_payment", {
						method: "POST",

						headers: {
							"Content-Type": "application/json",
						},

						credentials: "include",

						body: JSON.stringify({
							razorpay_order_id: response.razorpay_order_id,
							razorpay_signature: response.razorpay_signature,
							razorpay_payment_id: response.razorpay_payment_id,
						}),
					});

					const verifyData: {
						status?: number;
						message?: string;
					} = await verifyResponse.json().catch(() => ({}));

					console.log("VERIFY PAYMENT RESPONSE:", verifyData);

					/*
					 * Check HTTP response status
					 */
					if (!verifyResponse.ok) {
						throw new Error(
							verifyData.message || "Payment verification failed.",
						);
					}

					/*
					 * API returns:
					 * {
					 *   "status": 200,
					 *   "message": "Success."
					 * }
					 */
					if (verifyData.status !== 200 || verifyData.message !== "Success.") {
						throw new Error(
							verifyData.message || "Payment could not be verified.",
						);
					}

					/* =======================================
		   PAYMENT VERIFIED
		======================================= */

					setPaymentSuccess(true);
					setPaymentError("");

					console.log("PAYMENT VERIFIED SUCCESSFULLY");
				} catch (error) {
					console.error("Payment verification failed:", error);

					setPaymentError(
						error instanceof Error
							? error.message
							: "Payment verification failed.",
					);
				} finally {
					setIsProcessingPayment(false);
				}
			},
			/* ===============================================
			   USER CLOSED RAZORPAY
			=============================================== */

			modal: {
				ondismiss: () => {
					console.log("Razorpay checkout closed.");

					setIsProcessingPayment(false);
				},
			},
		};

		const razorpay = new window.Razorpay(options);

		/* ===============================================
		   PAYMENT FAILED
		=============================================== */

		razorpay.on("payment.failed", (response: unknown) => {
			console.error("RAZORPAY PAYMENT FAILED:", response);

			setPaymentError("Payment failed. Please try again.");

			setIsProcessingPayment(false);
		});

		razorpay.open();
	};

	/* =======================================================
	   HANDLE PAYMENT
	======================================================= */

	const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setPaymentError("");
		setPaymentSuccess(false);

		/* ===============================================
		   EMPTY CART
		=============================================== */

		if (items.length === 0) {
			setPaymentError("Your cart is empty.");
			return;
		}

		/* ===============================================
		   VALIDATION
		=============================================== */

		const validationError = validateForm();

		if (validationError) {
			setPaymentError(validationError);
			return;
		}

		setIsProcessingPayment(true);

		try {
			/* ===========================================
			   STEP 1
			   CREATE RAZORPAY ORDER
			=========================================== */

			const response = await fetch("/api/checkout", {
				method: "POST",

				headers: {
					"Content-Type": "application/json",
				},

				credentials: "include",

				body: JSON.stringify({
					customer: {
						firstName: formData.firstName,

						lastName: formData.lastName,

						email: formData.email,

						phone: formData.phone,
					},

					deliveryAddress: {
						address: formData.address,

						city: formData.city,

						state: formData.state,

						pincode: formData.pincode,
					},

					// Lets the backend know whether this order used a
					// previously saved address or a freshly entered one.
					savedAddressId:
						isLoggedIn && selectedAddressId !== "new"
							? selectedAddressId
							: null,
				}),
			});

			const data: CheckoutResponse = await response.json().catch(() => ({}));

			console.log("CHECKOUT RESPONSE:", data);

			if (!response.ok) {
				throw new Error(data?.message || "Unable to create payment order.");
			}

			/* ===========================================
			   API KEY
			=========================================== */

			const apiKey = data.result.key;

			/* ===========================================
			   ORDER ID
			=========================================== */

			const orderId = data.result.order_id;

			if (!apiKey) {
				throw new Error("Razorpay API key was not returned by the server.");
			}

			if (!orderId) {
				throw new Error("Razorpay order ID was not returned by the server.");
			}

			console.log("RAZORPAY ORDER CREATED:", {
				apiKey,
				orderId,
			});

			/* ===========================================
			   STEP 2
			   OPEN RAZORPAY
			=========================================== */

			openRazorpay(apiKey, orderId);
		} catch (error) {
			console.error("Checkout failed:", error);

			setPaymentError(
				error instanceof Error ? error.message : "Unable to start payment.",
			);

			setIsProcessingPayment(false);
		}
	};

	/* =======================================================
	   LOADING
	======================================================= */

	if (loadingCart) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12">
					<div className="flex flex-col items-center gap-3">
						<span className="h-8 w-8 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />

						<p className="text-sm text-[#2E2E2E]/50">Loading your cart...</p>
					</div>
				</div>
			</main>
		);
	}

	/* =======================================================
	   CART ERROR
	======================================================= */

	if (cartError) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12">
					<div className="w-full rounded-3xl border border-red-200 bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
							<AlertCircle
								size={32}
								className="text-red-500"
								strokeWidth={1.7}
							/>
						</div>

						<h1 className="mt-6 text-2xl font-bold text-[#2E2E2E]">
							Unable to load checkout
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							{cartError}
						</p>

						<button
							type="button"
							onClick={fetchCart}
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#721318]"
						>
							Try Again
						</button>
					</div>
				</div>
			</main>
		);
	}

	/* =======================================================
	   EMPTY CART
	======================================================= */

	if (items.length === 0) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-4xl items-center justify-center px-5 py-12">
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

						<h1 className="mt-2 text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
							Your cart is empty.
						</h1>

						<p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							Add something special to your cart before proceeding to checkout.
						</p>

						<Link
							href="/shop"
							className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#721318]"
						>
							Continue Shopping
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</main>
		);
	}

	/* =======================================================
	   PAYMENT SUCCESS
	======================================================= */

	if (paymentSuccess) {
		return (
			<main className="min-h-screen bg-[#FBF9F7]">
				<div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-5 py-12">
					<div className="w-full rounded-3xl border border-[#E8DED7] bg-white px-6 py-14 text-center shadow-[0_12px_45px_rgba(80,40,20,0.06)] sm:px-12">
						<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
							<CheckCircle2
								size={42}
								className="text-green-600"
								strokeWidth={1.7}
							/>
						</div>

						<p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
							Payment Successful
						</p>

						<h1 className="mt-2 text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
							Thank you for your order!
						</h1>

						<p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#2E2E2E]/55">
							Your payment has been successfully verified and your order is
							being processed.
						</p>

						<Link
							href="/shop"
							className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#721318]"
						>
							Continue Shopping
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</main>
		);
	}

	/* =======================================================
	   MAIN CHECKOUT
	======================================================= */

	// Show the manual address form when the user isn't logged in,
	// hasn't finished the auth check yet, has no saved addresses,
	// or has explicitly chosen "Add a new address".
	const showAddressForm =
		!isLoggedIn ||
		checkingAuth ||
		savedAddresses.length === 0 ||
		selectedAddressId === "new";

	// Name/email are always account-driven once logged in, so lock
	// those two fields instead of letting them silently drift from
	// what /api/auth/user returned.
	const lockContactFields = isLoggedIn && !checkingAuth;

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			{/* HEADER */}

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
							Complete your delivery details and make your payment securely.
						</p>
					</div>
				</div>
			</section>

			{/* PAYMENT ERROR */}

			{paymentError && (
				<div className="mx-auto mt-5 max-w-7xl px-5 sm:px-6 lg:px-8">
					<div
						role="alert"
						className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						{paymentError}
					</div>
				</div>
			)}

			{/* CONTENT */}

			<section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
				<form
					onSubmit={handlePayment}
					className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8"
				>
					{/* =================================================
					    LEFT COLUMN
					================================================= */}

					<div className="space-y-6">
						{/* DELIVERY INFORMATION */}

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
											{isLoggedIn
												? "Choose a saved address or add a new one."
												: "Where should we deliver your order?"}
										</p>
									</div>
								</div>
							</div>

							<div className="p-5 sm:p-6">
								{/* RECEIVER NAME (LOGGED-IN USERS) */}

								{lockContactFields && (
									<div className="mb-6 flex items-center justify-between rounded-xl border border-[#E8DED7] bg-[#FCFBFA] px-4 py-3">
										<div>
											<p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#2E2E2E]/40">
												Receiver
											</p>

											<p className="mt-1 text-sm font-semibold text-[#2E2E2E]">
												{formData.firstName} {formData.lastName}
											</p>

											<p className="mt-0.5 text-xs text-[#2E2E2E]/50">
												{formData.email} · {formData.phone}
											</p>
										</div>
									</div>
								)}

								{/* SAVED ADDRESSES (LOGGED-IN USERS ONLY) */}

								{isLoggedIn && (checkingAuth || savedAddresses.length > 0) && (
									<div className="mb-6 space-y-3">
										{checkingAuth ? (
											<div className="flex items-center gap-2 py-2 text-sm text-[#2E2E2E]/50">
												<span className="h-4 w-4 animate-spin rounded-full border-2 border-[#85161B]/25 border-t-[#85161B]" />
												Loading saved addresses...
											</div>
										) : (
											<>
												<p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2E2E2E]/45">
													Saved Addresses
												</p>

												<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
													{savedAddresses.map((addr) => {
														const isSelected = selectedAddressId === addr.id;

														return (
															<button
																key={addr.id}
																type="button"
																onClick={() => handleSelectAddress(addr.id)}
																className={`
																	flex
																	items-start
																	gap-3
																	rounded-xl
																	border
																	p-4
																	text-left
																	transition
																	${
																		isSelected
																			? "border-[#85161B] bg-[#FFF9F6]"
																			: "border-[#DED6D0] bg-[#FCFBFA] hover:border-[#85161B]/40"
																	}
																`}
															>
																<div
																	className={`
																		mt-0.5
																		flex
																		h-5
																		w-5
																		shrink-0
																		items-center
																		justify-center
																		rounded-full
																		border-2
																		${isSelected ? "border-[#85161B]" : "border-[#DED6D0]"}
																	`}
																>
																	{isSelected && (
																		<div className="h-2.5 w-2.5 rounded-full bg-[#85161B]" />
																	)}
																</div>

																<div className="min-w-0">
																	<div className="flex flex-wrap items-center gap-2">
																		<p className="text-sm font-semibold text-[#2E2E2E]">
																			{addr.city}, {addr.state}
																		</p>

																		{addr.isDefault && (
																			<span className="rounded-full bg-[#F7D6BF]/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#85161B]">
																				Default
																			</span>
																		)}
																	</div>

																	<p className="mt-1 text-xs leading-5 text-[#2E2E2E]/55">
																		{addr.address}, {addr.pincode}
																	</p>

																	<p className="mt-1 text-xs text-[#2E2E2E]/45">
																		{addr.phone}
																	</p>
																</div>
															</button>
														);
													})}

													{/* ADD NEW ADDRESS */}

													<button
														type="button"
														onClick={() => handleSelectAddress("new")}
														className={`
															flex
															items-center
															justify-center
															gap-2
															rounded-xl
															border
															border-dashed
															p-4
															text-sm
															font-semibold
															transition
															${
																selectedAddressId === "new"
																	? "border-[#85161B] bg-[#FFF9F6] text-[#85161B]"
																	: "border-[#DED6D0] text-[#2E2E2E]/55 hover:border-[#85161B]/40 hover:text-[#85161B]"
															}
														`}
													>
														<Plus size={16} />
														Add a new address
													</button>
												</div>
											</>
										)}
									</div>
								)}

								{/* MANUAL ADDRESS FORM */}

								{showAddressForm && (
									<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
										{/* Name/email are locked once we know the account's
										    identity — phone stays editable per-address since a
										    delivery address can have its own contact number. */}

										<FormInput
											label="First name"
											name="firstName"
											value={formData.firstName}
											onChange={handleChange}
											placeholder="Enter first name"
											required
											disabled={lockContactFields}
										/>

										<FormInput
											label="Last name"
											name="lastName"
											value={formData.lastName}
											onChange={handleChange}
											placeholder="Enter last name"
											required
											disabled={lockContactFields}
										/>

										<FormInput
											label="Email address"
											name="email"
											type="email"
											value={formData.email}
											onChange={handleChange}
											placeholder="you@example.com"
											required
											disabled={lockContactFields}
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
											placeholder="Ujjain"
											required
										/>

										<FormInput
											label="State"
											name="state"
											value={formData.state}
											onChange={handleChange}
											placeholder="Madhya Pradesh"
											required
										/>

										<FormInput
											label="PIN code"
											name="pincode"
											value={formData.pincode}
											onChange={handleChange}
											placeholder="456001"
											required
										/>
									</div>
								)}
							</div>
						</section>

						{/* DELIVERY METHOD */}

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
											Your delivery fee is calculated from the cart.
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
												Delivery fee from cart
											</p>
										</div>
									</div>

									<span className="text-sm font-semibold text-[#85161B]">
										₹{deliveryFee.toFixed(2)}
									</span>
								</div>
							</div>
						</section>

						{/* PAYMENT */}

						<section className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white">
							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7D6BF]/40">
										<CreditCard size={17} className="text-[#85161B]" />
									</div>

									<div>
										<h2 className="font-semibold text-[#2E2E2E]">Payment</h2>

										<p className="mt-0.5 text-xs text-[#2E2E2E]/45">
											You will be redirected to Razorpay's secure checkout.
										</p>
									</div>
								</div>
							</div>

							<div className="p-5 sm:p-6">
								<div className="flex items-center gap-3 rounded-xl border border-[#85161B] bg-[#FFF9F6] p-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7D6BF]/50">
										<CreditCard size={19} className="text-[#85161B]" />
									</div>

									<div>
										<p className="text-sm font-semibold text-[#2E2E2E]">
											Razorpay
										</p>

										<p className="mt-1 text-xs text-[#2E2E2E]/50">
											Cards, UPI, net banking and more
										</p>
									</div>

									<CheckCircle2 size={19} className="ml-auto text-[#85161B]" />
								</div>
							</div>
						</section>
					</div>

					{/* =================================================
					    ORDER SUMMARY
					================================================= */}

					<aside className="lg:sticky lg:top-24 lg:self-start">
						<div className="overflow-hidden rounded-2xl border border-[#E8DED7] bg-white shadow-[0_10px_35px_rgba(80,40,20,0.05)]">
							{/* SUMMARY HEADER */}

							<div className="border-b border-[#E8DED7] px-5 py-4 sm:px-6">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-[#2E2E2E]">
										Order Summary
									</h2>

									<span className="text-xs text-[#2E2E2E]/45">
										{itemCount} {itemCount === 1 ? "item" : "items"}
									</span>
								</div>
							</div>

							{/* PRODUCTS */}

							<div className="divide-y divide-[#E8DED7]">
								{items.map((item) => {
									const quantity = item.quantity;

									/*
										IMPORTANT:
										Use selling_price from backend,
										not price.
									*/

									const itemTotal = item.selling_price * quantity;

									return (
										<div key={item.id} className="flex gap-3 p-4">
											{/* PRODUCT IMAGE */}

											<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F7F3F0]">
												{item.image ? (
													<img
														src={item.image}
														alt={item.name}
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

												{/* QUANTITY */}

												<span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#85161B] px-1 text-[10px] font-bold text-white">
													{quantity}
												</span>
											</div>

											{/* PRODUCT INFO */}

											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-[#2E2E2E]">
													{item.name}
												</p>

												<p className="mt-1 text-xs text-[#2E2E2E]/45">
													₹{item.selling_price.toFixed(2)} each
												</p>
											</div>

											{/* ITEM TOTAL */}

											<p className="shrink-0 text-sm font-semibold text-[#2E2E2E]">
												₹{itemTotal.toFixed(2)}
											</p>
										</div>
									);
								})}
							</div>

							{/* TOTALS */}

							<div className="border-t border-[#E8DED7] p-5 sm:p-6">
								<div className="space-y-3 text-sm">
									{/* SUBTOTAL */}

									<div className="flex justify-between text-[#2E2E2E]/60">
										<span>Subtotal</span>

										<span>₹{subtotal.toFixed(2)}</span>
									</div>

									{/* DELIVERY */}

									<div className="flex justify-between text-[#2E2E2E]/60">
										<span>Delivery</span>

										<span>₹{deliveryFee.toFixed(2)}</span>
									</div>

									{/* GRAND TOTAL */}

									<div className="border-t border-[#E8DED7] pt-4">
										<div className="flex items-end justify-between">
											<div>
												<p className="font-semibold text-[#2E2E2E]">
													Grand Total
												</p>

												<p className="mt-1 text-[11px] text-[#2E2E2E]/40">
													Secure payment via Razorpay
												</p>
											</div>

											<p className="text-2xl font-bold text-[#85161B]">
												₹{grandTotal.toFixed(2)}
											</p>
										</div>
									</div>
								</div>

								{/* PAY BUTTON */}

								<button
									type="submit"
									disabled={isProcessingPayment}
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
									{isProcessingPayment ? (
										<>
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
											Processing...
										</>
									) : (
										<>
											Pay ₹{grandTotal.toFixed(2)}
											<ArrowRight
												size={17}
												className="transition-transform group-hover:translate-x-1"
											/>
										</>
									)}
								</button>

								{/* SECURITY */}

								<div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#2E2E2E]/40">
									<LockKeyhole size={13} />

									<span>Secure & encrypted payment</span>
								</div>
							</div>
						</div>
					</aside>
				</form>
			</section>
		</main>
	);
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
	label,
	name,
	value,
	onChange,
	placeholder,
	type = "text",
	required = false,
	disabled = false,
}: {
	label: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	type?: string;
	required?: boolean;
	disabled?: boolean;
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
				disabled={disabled}
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
					disabled:cursor-not-allowed
					disabled:opacity-60
				"
			/>
		</div>
	);
}
