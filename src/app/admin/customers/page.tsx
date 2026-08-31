"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users, Mail, Phone } from "lucide-react";

/* ============================================================================
   MOCK DATA
============================================================================ */

type Customer = {
	id: string;
	name: string;
	email: string;
	phone: string;
	orders: number;
	totalSpent: number;
	joined: string;
};

const CUSTOMERS: Customer[] = [
	{
		id: "C-01",
		name: "Anaya Sharma",
		email: "anaya.sharma@example.com",
		phone: "+91 98765 43210",
		orders: 6,
		totalSpent: 3240,
		joined: "Jan 2026",
	},
	{
		id: "C-02",
		name: "Rohan Mehta",
		email: "rohan.mehta@example.com",
		phone: "+91 91234 56780",
		orders: 3,
		totalSpent: 1980,
		joined: "Mar 2026",
	},
	{
		id: "C-03",
		name: "Priya Kapoor",
		email: "priya.kapoor@example.com",
		phone: "+91 99887 66554",
		orders: 9,
		totalSpent: 5860,
		joined: "Nov 2025",
	},
	{
		id: "C-04",
		name: "Arjun Rao",
		email: "arjun.rao@example.com",
		phone: "+91 90011 22334",
		orders: 2,
		totalSpent: 1299,
		joined: "Jun 2026",
	},
	{
		id: "C-05",
		name: "Sneha Reddy",
		email: "sneha.reddy@example.com",
		phone: "+91 97766 55443",
		orders: 4,
		totalSpent: 2196,
		joined: "Feb 2026",
	},
	{
		id: "C-06",
		name: "Karan Malhotra",
		email: "karan.malhotra@example.com",
		phone: "+91 98123 45670",
		orders: 1,
		totalSpent: 249,
		joined: "Aug 2026",
	},
];

export default function AdminCustomersPage() {
	const [query, setQuery] = useState("");

	const filteredCustomers = useMemo(() => {
		if (query.trim() === "") return CUSTOMERS;

		const q = query.toLowerCase();

		return CUSTOMERS.filter(
			(customer) =>
				customer.name.toLowerCase().includes(q) ||
				customer.email.toLowerCase().includes(q),
		);
	}, [query]);

	return (
		<main className="min-h-screen bg-[#FBF9F7]">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap');
				.font-display { font-family: 'Fraunces', Georgia, serif; }
			`}</style>

			<div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
				<Link
					href="/admin"
					className="inline-flex items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
				>
					<ArrowLeft size={16} />
					Back to dashboard
				</Link>

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85161B]">
							Customers
						</p>
						<h1 className="font-display mt-1 text-3xl font-bold text-[#2E2E2E] sm:text-4xl">
							All Customers
						</h1>
						<p className="mt-2 text-sm text-[#2E2E2E]/55">
							{filteredCustomers.length} of {CUSTOMERS.length} customers
						</p>
					</div>
				</div>

				<div className="relative mt-6 max-w-xs">
					<Search
						size={16}
						className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2E2E2E]/35"
					/>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search name or email..."
						className="w-full rounded-xl border border-[#E8DED7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2E2E2E] outline-none transition placeholder:text-[#2E2E2E]/35 focus:border-[#85161B]/40 focus:ring-2 focus:ring-[#85161B]/10"
					/>
				</div>

				{/* TABLE */}

				<div className="mt-6 overflow-hidden rounded-2xl border border-[#E9DED7] bg-white">
					{filteredCustomers.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[720px] text-left text-sm">
								<thead>
									<tr className="border-b border-[#EEE6E1] text-xs text-[#2E2E2E]/40">
										<th className="px-6 py-3.5 font-medium">Customer</th>
										<th className="px-6 py-3.5 font-medium">Contact</th>
										<th className="px-6 py-3.5 font-medium">Orders</th>
										<th className="px-6 py-3.5 font-medium">Total spent</th>
										<th className="px-6 py-3.5 font-medium">Joined</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#EEE6E1]">
									{filteredCustomers.map((customer) => (
										<tr
											key={customer.id}
											className="transition-colors hover:bg-[#FBF9F7]"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7D6BF]/50 text-xs font-bold text-[#85161B]">
														{customer.name
															.split(" ")
															.map((part) => part[0])
															.join("")
															.slice(0, 2)}
													</div>
													<span className="font-medium text-[#2E2E2E]">
														{customer.name}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<p className="flex items-center gap-1.5 text-xs text-[#2E2E2E]/55">
													<Mail size={12} />
													{customer.email}
												</p>
												<p className="mt-1 flex items-center gap-1.5 text-xs text-[#2E2E2E]/45">
													<Phone size={12} />
													{customer.phone}
												</p>
											</td>
											<td className="px-6 py-4 font-semibold text-[#2E2E2E]">
												{customer.orders}
											</td>
											<td className="px-6 py-4 font-semibold text-[#85161B]">
												₹{customer.totalSpent.toLocaleString("en-IN")}
											</td>
											<td className="px-6 py-4 text-[#2E2E2E]/45">
												{customer.joined}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="px-6 py-16 text-center">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7D6BF]/40">
								<Users size={22} className="text-[#85161B]" />
							</div>
							<p className="mt-4 text-sm font-semibold text-[#2E2E2E]">
								No customers match your search
							</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
