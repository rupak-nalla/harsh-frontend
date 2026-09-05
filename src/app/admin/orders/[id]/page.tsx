"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	AlertCircle,
	ArrowLeft,
	CalendarDays,
	CreditCard,
	MapPin,
	Phone,
	Save,
	Store,
	Truck,
	User,
} from "lucide-react";

const PRODUCT_IMAGE_URL = "https://printinghouseujjain.in/assets/products/";
const UPLOAD_IMAGE_URL = "https://printinghouseujjain.in/assets/uploads/";
const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

type RawItem = {
	id?: string | number;
	name?: string;
	primary_photo_path?: string;
	quantity?: string | number;
	selling_price?: string | number;
	customization?: string;
	[key: string]: unknown;
};

type RawAddress = {
	name?: string;
	phone?: string;
	flat_house_building?: string;
	road_area_colony?: string;
	landmark?: string;
	city?: string;
	state?: string;
	pincode?: string | number;
	[key: string]: unknown;
};

type RawOrder = {
	id?: string | number;
	order_id?: string | number;
	user_id?: string | number;
	name?: string;
	user_name?: string;
	customer_name?: string;
	email?: string;
	phone?: string;
	user?: Record<string, unknown> | null;
	customer?: Record<string, unknown> | null;
	delivery_method?: string;
	type?: string;
	payment_status?: string;
	order_status?: string;
	address?: string | RawAddress | null;
	cart?: string | RawItem[] | null;
	total_price?: string | number;
	delivery_fee?: string | number;
	grand_total?: string | number;
	created_at?: string;
	[key: string]: unknown;
};

type DetailOrder = {
	id: string;
	status: string;
	date: string;
	method: "pickup" | "delivery";
	paymentStatus: string;
	items: RawItem[];
	address: RawAddress | null;
	customer: { name: string; email: string; phone: string; id: string };
	total: number;
	deliveryFee: number;
	grandTotal: number;
};

function asNumber(value: unknown) {
	const number = Number(value ?? 0);
	return Number.isFinite(number) ? number : 0;
}

function parseJson<T>(value: unknown, fallback: T): T {
	if (typeof value !== "string") return (value as T) ?? fallback;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

function normalizeStatus(value: unknown) {
	const status = String(value ?? "Pending").toLowerCase().replace(/[\s_-]+/g, "");
	if (status.includes("cancel")) return "Cancelled";
	if (status.includes("deliver") || status.includes("complete")) return "Delivered";
	if (status.includes("ship") || status.includes("dispatch")) return "Shipped";
	if (status.includes("process") || status.includes("confirm") || status.includes("accept")) return "Processing";
	return "Pending";
}

function formatDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value.replace(" ", "T"));
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function parseCustomization(item: RawItem) {
	const customization = String(item.customization ?? "").trim();

	if (!customization || customization.toLowerCase() === "no customization.") {
		return [];
	}

	const parsedCustomization = parseJson<Record<string, unknown> | null>(
		customization,
		null,
	);

	if (!parsedCustomization || typeof parsedCustomization !== "object") {
		return [{ label: "Details", value: customization, photos: [] }];
	}

	const values = parsedCustomization;
	return Object.entries(values).filter(([key, value]) => !["id", "name", "primary_photo_path", "quantity", "selling_price", "customization"].includes(key) && value !== null && value !== undefined && String(value).trim() !== "").map(([key, value]) => {
		const text = String(value);
		const separator = text.indexOf("=");
		const label = separator > -1 ? text.slice(0, separator).trim() : key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
		const displayValue = separator > -1 ? text.slice(separator + 1).trim() : text;
		const photos = displayValue.match(/[\w-]+\.(?:jpg|jpeg|png|webp|gif)/gi) ?? [];
		return { label, value: displayValue, photos: [...new Set(photos)] };
	});
}

function normalizeOrder(raw: RawOrder): DetailOrder {
	const nestedCustomer = raw.user ?? raw.customer ?? {};
	const items = parseJson<RawItem[]>(raw.cart, []).filter((item) => item && typeof item === "object");
	const address = parseJson<RawAddress | null>(raw.address, null);
	const name = String(raw.name ?? raw.user_name ?? raw.customer_name ?? nestedCustomer.name ?? nestedCustomer.full_name ?? address?.name ?? "Guest");
	return {
		id: String(raw.order_id ?? raw.id ?? ""),
		status: normalizeStatus(raw.order_status),
		date: formatDate(raw.created_at),
		method: String(raw.delivery_method ?? raw.type).toLowerCase() === "pickup" ? "pickup" : "delivery",
		paymentStatus: String(raw.payment_status ?? "—"),
		items,
		address,
		customer: {
			name,
			email: String(raw.email ?? nestedCustomer.email ?? "—"),
			phone: String(raw.phone ?? nestedCustomer.phone ?? address?.phone ?? "—"),
			id: String(raw.user_id ?? nestedCustomer.id ?? "Guest"),
		},
		total: asNumber(raw.total_price),
		deliveryFee: asNumber(raw.delivery_fee),
		grandTotal: asNumber(raw.grand_total) || asNumber(raw.total_price),
	};
}

function extractOrder(data: unknown, id: string) {
	if (!data || typeof data !== "object") return null;
	const value = data as { order?: RawOrder; orders?: RawOrder[]; wishlist?: RawOrder[]; result?: RawOrder[] };
	const orderList = value.orders ?? value.wishlist ?? value.result ?? [];
	return value.order ?? orderList.find((order) => String(order.order_id ?? order.id) === id) ?? orderList[0] ?? null;
}

function statusClasses(status: string) {
	return { Delivered: "bg-[#EDF8F0] text-[#31824A]", Shipped: "bg-[#F3EBFA] text-[#8B4FC7]", Processing: "bg-[#EEF5FF] text-[#3973B9]", Cancelled: "bg-red-50 text-red-700", Pending: "bg-[#FFF3E8] text-[#B56B27]" }[status] ?? "bg-gray-100 text-gray-700";
}

export default function AdminOrderDetailsPage() {
	const params = useParams<{ id: string }>();
	const orderId = params?.id ? decodeURIComponent(params.id) : "";
	const [order, setOrder] = useState<DetailOrder | null>(null);
	const [status, setStatus] = useState("Pending");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!orderId) return;
		void (async () => {
			try {
				const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, { cache: "no-store", credentials: "include" });
				const data = await response.json().catch(() => ({}));
				if (!response.ok) throw new Error(data.message || "Unable to load order.");
				const raw = extractOrder(data, orderId);
				if (!raw) throw new Error("Order not found.");
				const normalized = normalizeOrder(raw);
				setOrder(normalized);
				setStatus(normalized.status);
			} catch (loadError) {
				setError(loadError instanceof Error ? loadError.message : "Unable to load order.");
			} finally {
				setLoading(false);
			}
		})();
	}, [orderId]);

	const itemCount = useMemo(() => order?.items.reduce((sum, item) => sum + Math.max(1, Math.floor(asNumber(item.quantity))), 0) ?? 0, [order]);

	const updateStatus = async () => {
		if (!order || saving || status === order.status) return;
		setSaving(true);
		setMessage("");
		try {
			const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) });
			const data = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(data.message || "Unable to update order status.");
			setOrder({ ...order, status });
			setMessage("Order status updated.");
		} catch (updateError) {
			setMessage(updateError instanceof Error ? updateError.message : "Unable to update order status.");
			setStatus(order.status);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#FBF9F7] text-sm text-[#2E2E2E]/60">Loading order...</main>;
	if (error || !order) return <main className="flex min-h-screen items-center justify-center bg-[#FBF9F7] px-5"><div className="rounded-2xl border border-red-200 bg-white p-8 text-center"><AlertCircle className="mx-auto text-red-600" /><p className="mt-3 text-sm text-red-700">{error || "Order not found."}</p><Link href="/admin/orders" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#85161B]"><ArrowLeft size={16} />Back to orders</Link></div></main>;

	return (
		<main className="min-h-screen bg-[#FBF9F7] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
			<div className="mx-auto max-w-7xl">
				<Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 hover:text-[#85161B]"><ArrowLeft size={16} />All orders</Link>
				<div className="mt-6 flex flex-col justify-between gap-5 border-b border-[#E8DED7] pb-7 lg:flex-row lg:items-end">
					<div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">Order details</p><h1 className="mt-2 text-3xl font-bold text-[#2E2E2E]">Order #{order.id}</h1><div className="mt-2 flex flex-wrap gap-4 text-sm text-[#2E2E2E]/55"><span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{order.date}</span><span>{itemCount} item{itemCount === 1 ? "" : "s"}</span></div></div>
					<div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(order.status)}`}>{order.status}</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-[#E8DED7] bg-white px-3 py-2.5 text-sm text-[#2E2E2E] outline-none">{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select><button type="button" onClick={updateStatus} disabled={saving || status === order.status} className="inline-flex items-center gap-2 rounded-xl bg-[#85161B] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} />{saving ? "Saving..." : "Update status"}</button></div>
				</div>
				{message && <p className="mt-4 text-sm text-[#85161B]">{message}</p>}

				<div className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
					<section className="space-y-5">
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-base font-semibold text-[#2E2E2E]">Items and customizations</h2><span className="text-xs text-[#2E2E2E]/45">{order.items.length} product{order.items.length === 1 ? "" : "s"}</span></div><div className="mt-5 divide-y divide-[#F0E8E2]">{order.items.map((item, index) => <div key={`${item.id ?? index}-${index}`} className="py-5 first:pt-0 last:pb-0"><div className="flex gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F2EE]">{item.primary_photo_path && <img src={`${PRODUCT_IMAGE_URL}${item.primary_photo_path}`} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold text-[#2E2E2E]">{item.name ?? "Untitled product"}</h3><p className="mt-1 text-xs text-[#2E2E2E]/50">Qty {item.quantity ?? 1} · ₹{asNumber(item.selling_price).toLocaleString("en-IN")}</p></div><span className="text-sm font-semibold text-[#85161B]">₹{(asNumber(item.selling_price) * Math.max(1, asNumber(item.quantity))).toLocaleString("en-IN")}</span></div>{parseCustomization(item).length > 0 && <div className="mt-4 rounded-xl bg-[#FBF9F7] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#85161B]">Customization</p><div className="mt-2 space-y-2">{parseCustomization(item).map((customization) => <div key={customization.label} className="text-sm"><span className="font-medium text-[#2E2E2E]">{customization.label}:</span> <span className="text-[#2E2E2E]/65">{customization.value}</span>{customization.photos.length > 0 && <div className="mt-2 flex gap-2">{customization.photos.map((photo) => <a key={photo} href={`${UPLOAD_IMAGE_URL}${photo}`} target="_blank" rel="noreferrer"><img src={`${UPLOAD_IMAGE_URL}${photo}`} alt={photo} className="h-12 w-12 rounded-lg object-cover" /></a>)}</div>}</div>)}</div></div>}</div></div></div>)}</div></div>
						<div className="rounded-2xl border border-[#E8DED7] bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-[#2E2E2E]">Payment summary</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between text-[#2E2E2E]/60"><span>Products</span><span>₹{order.total.toLocaleString("en-IN")}</span></div><div className="flex justify-between text-[#2E2E2E]/60"><span>Delivery fee</span><span>₹{order.deliveryFee.toLocaleString("en-IN")}</span></div><div className="flex justify-between border-t border-[#F0E8E2] pt-3 text-base font-bold text-[#2E2E2E]"><span>Total</span><span>₹{order.grandTotal.toLocaleString("en-IN")}</span></div><p className="inline-flex items-center gap-2 text-xs text-[#2E2E2E]/50"><CreditCard size={14} />Payment: {order.paymentStatus}</p></div></div>
					</section>
					<aside className="space-y-5"><div className="rounded-2xl border border-[#E8DED7] bg-white p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-semibold text-[#2E2E2E]"><User size={18} className="text-[#85161B]" />Customer</h2><div className="mt-4 space-y-2 text-sm"><p className="font-semibold text-[#2E2E2E]">{order.customer.name}</p><p className="text-[#2E2E2E]/60">{order.customer.email}</p><p className="text-[#2E2E2E]/60">{order.customer.phone}</p><p className="text-xs text-[#2E2E2E]/40">Account: {order.customer.id}</p></div></div><div className={`rounded-2xl border p-5 sm:p-6 ${order.method === "pickup" ? "border-[#E7C9A2] bg-[#FFF8EF]" : "border-[#E8DED7] bg-white"}`}><h2 className="flex items-center gap-2 text-base font-semibold text-[#2E2E2E]">{order.method === "pickup" ? <Store size={18} className="text-[#85161B]" /> : <Truck size={18} className="text-[#85161B]" />}{order.method === "pickup" ? "Store pickup" : "Delivery address"}</h2>{order.method === "pickup" ? <p className="mt-3 text-sm leading-6 text-[#2E2E2E]/65">Prepare this order for collection at the store. The customer will pick it up instead of receiving a shipment.</p> : order.address ? <div className="mt-4 flex gap-3 text-sm leading-6 text-[#2E2E2E]/65"><MapPin size={17} className="mt-1 shrink-0 text-[#85161B]" /><div><p>{order.address.name}</p><p>{[order.address.flat_house_building, order.address.road_area_colony, order.address.landmark, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(", ")}</p>{order.address.phone && <p className="mt-2 inline-flex items-center gap-1.5"><Phone size={14} />{order.address.phone}</p>}</div></div> : <p className="mt-3 text-sm text-[#2E2E2E]/55">No address was provided.</p>}</div></aside>
				</div>
			</div>
		</main>
	);
}
