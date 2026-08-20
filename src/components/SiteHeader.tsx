"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	HiOutlineShoppingCart,
	HiOutlineSearch,
	HiOutlineUser,
	HiOutlineHeart,
	HiOutlineMenu,
	HiOutlineX,
} from "react-icons/hi";

export default function SiteHeader() {
	const router = useRouter();

	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [searchOpen, setSearchOpen] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState("");

	const navItems = [
		{ href: "/", label: "Home" },
		{ href: "/shop", label: "Shop" },
	];

	const closeMobileMenu = () => {
		setMobileOpen(false);
	};

	/* =========================================================
	   SEARCH
	========================================================= */

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedSearch = searchValue.trim();

		if (!trimmedSearch) return;

		setSearchOpen(false);
		setMobileOpen(false);

		router.push(`/shop?search=${encodeURIComponent(trimmedSearch)}`);
	};

	return (
		<>
			{/* =====================================================
			    MAIN NAVBAR
			===================================================== */}

			<motion.header
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4 }}
				className="sticky top-0 z-50 isolate w-full border-b border-border/70 bg-background"
			>
				<div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 bg-background px-4 sm:px-6 lg:px-8">
					{/* =================================================
					    LOGO
					================================================= */}

					<Link
						href="/"
						onClick={closeMobileMenu}
						className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
					>
						<img
							src="https://printinghouseujjain.in/assets/logo.png"
							alt="Printing House"
							className="h-10 w-10 object-contain"
						/>

						<div className="hidden sm:block">
							<div className="text-lg font-bold leading-none tracking-tight">
								Printing House
							</div>

							<div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-foreground/45">
								You think... We Create...
							</div>
						</div>
					</Link>

					{/* =================================================
					    DESKTOP NAVIGATION
					================================================= */}

					<nav className="ml-6 hidden items-center gap-1 md:flex lg:ml-10">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-lg px-3.5 py-2 text-sm font-medium text-foreground/65 transition-all duration-200 hover:bg-muted/10 hover:text-[#85161B]"
							>
								{item.label}
							</Link>
						))}
					</nav>

					{/* =================================================
					    RIGHT ACTIONS
					================================================= */}

					<div className="ml-auto flex items-center gap-1.5 bg-background sm:gap-2">
						{/* =================================================
						    SEARCH
						================================================= */}

						<AnimatePresence mode="wait">
							{searchOpen ? (
								<motion.form
									key="search-input"
									initial={{ width: 40, opacity: 0 }}
									animate={{ width: 240, opacity: 1 }}
									exit={{ width: 40, opacity: 0 }}
									transition={{ duration: 0.2 }}
									onSubmit={handleSearch}
									className="flex h-10 items-center overflow-hidden rounded-xl border border-border bg-background focus-within:border-[#85161B] focus-within:ring-2 focus-within:ring-[#85161B]/10"
								>
									<button
										type="submit"
										aria-label="Search"
										className="flex h-10 w-10 shrink-0 items-center justify-center bg-background text-foreground/60 transition hover:text-[#85161B]"
									>
										<HiOutlineSearch size={20} />
									</button>

									<input
										autoFocus
										type="search"
										value={searchValue}
										onChange={(e) => setSearchValue(e.target.value)}
										placeholder="Search products..."
										className="min-w-0 flex-1 bg-background pr-2 text-sm text-foreground outline-none placeholder:text-foreground/40"
									/>

									<button
										type="button"
										onClick={() => {
											setSearchOpen(false);
											setSearchValue("");
										}}
										aria-label="Close search"
										className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-foreground/40 transition hover:bg-muted/10 hover:text-foreground"
									>
										<HiOutlineX size={17} />
									</button>
								</motion.form>
							) : (
								<motion.button
									key="search-button"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									type="button"
									aria-label="Search"
									onClick={() => setSearchOpen(true)}
									className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-foreground/70 transition hover:bg-muted/10 hover:text-[#85161B]"
								>
									<HiOutlineSearch size={20} />
								</motion.button>
							)}
						</AnimatePresence>

						{/* =================================================
						    WISHLIST
						================================================= */}

						<Link
							href="/wishlist"
							aria-label="Wishlist"
							className="hidden h-10 w-10 items-center justify-center rounded-xl bg-background text-foreground/70 transition hover:bg-muted/10 hover:text-[#85161B] sm:flex"
						>
							<HiOutlineHeart size={20} />
						</Link>

						{/* =================================================
						    ACCOUNT
						================================================= */}

						{/* <Link
							href="/profile"
							aria-label="Account"
							className="hidden h-10 w-10 items-center justify-center rounded-xl bg-background text-foreground/70 transition hover:bg-muted/10 hover:text-[#85161B] sm:flex"
						>
							<HiOutlineUser size={20} />
						</Link> */}

						{/* =================================================
						    CART
						================================================= */}

						<Link
							href="/cart"
							aria-label="Shopping cart"
							className="relative flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition-all hover:border-[#85161B]/30 hover:bg-muted/10"
						>
							<HiOutlineShoppingCart size={20} />

							<span className="hidden sm:inline">Cart</span>
						</Link>

						{/* =================================================
						    WHATSAPP
						================================================= */}

						<a
							href="https://wa.me/917000000000"
							target="_blank"
							rel="noopener noreferrer"
							className="hidden items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 lg:flex"
						>
							<span>💬</span>
							WhatsApp
						</a>

						{/* =================================================
						    MOBILE MENU BUTTON
						================================================= */}

						<button
							type="button"
							aria-label={mobileOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileOpen}
							onClick={() => setMobileOpen((value) => !value)}
							className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-foreground transition hover:bg-muted/10 md:hidden"
						>
							{mobileOpen ? (
								<HiOutlineX size={23} />
							) : (
								<HiOutlineMenu size={23} />
							)}
						</button>
					</div>
				</div>
			</motion.header>

			{/* =========================================================
			    MOBILE SIDEBAR
			========================================================= */}

			<AnimatePresence>
				{mobileOpen && (
					<>
						{/* BACKDROP */}

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onClick={closeMobileMenu}
							className="fixed inset-0 z-[60] bg-black/40 md:hidden"
						/>

						{/* SIDEBAR */}

						<motion.aside
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 35,
							}}
							className="fixed right-0 top-0 z-[70] flex h-full w-[82%] max-w-[360px] flex-col overflow-hidden border-l border-border bg-background shadow-2xl md:hidden"
						>
							{/* SIDEBAR HEADER */}

							<div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-background px-5">
								<div className="flex items-center gap-2.5">
									<img
										src="https://printinghouseujjain.in/assets/logo.png"
										alt="Printing House"
										className="h-9 w-9 object-contain"
									/>
									<div>
										<div className="text-base font-bold">Printing House</div>

										<div className="text-[8px] font-medium uppercase tracking-[0.15em] text-foreground/40">
											You think... We Create...
										</div>
									</div>
								</div>

								<button
									type="button"
									onClick={closeMobileMenu}
									aria-label="Close menu"
									className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-foreground/70 transition hover:bg-muted/10 hover:text-[#85161B]"
								>
									<HiOutlineX size={23} />
								</button>
							</div>

							{/* SIDEBAR CONTENT */}

							<div className="flex-1 overflow-y-auto bg-background px-5 py-6">
								{/* SEARCH */}

								<div>
									<p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">
										Search
									</p>

									<form
										onSubmit={(e) => {
											handleSearch(e);
											closeMobileMenu();
										}}
										className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-[#85161B] focus-within:ring-2 focus-within:ring-[#85161B]/10"
									>
										<HiOutlineSearch
											size={19}
											className="mr-2 shrink-0 text-foreground/40"
										/>

										<input
											type="search"
											value={searchValue}
											onChange={(e) => setSearchValue(e.target.value)}
											placeholder="Search products..."
											className="w-full bg-background py-3 text-sm outline-none placeholder:text-foreground/40"
										/>
									</form>
								</div>

								{/* MENU */}

								<div className="mt-7">
									<p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">
										Menu
									</p>

									<nav className="space-y-1">
										{navItems.map((item) => (
											<Link
												key={item.href}
												href={item.href}
												onClick={closeMobileMenu}
												className="flex items-center justify-between rounded-xl bg-background px-4 py-3.5 text-sm font-medium text-foreground/75 transition hover:bg-muted/10 hover:text-[#85161B]"
											>
												<span>{item.label}</span>

												<span className="text-foreground/30">→</span>
											</Link>
										))}
									</nav>
								</div>

								{/* ACCOUNT */}

								<div className="mt-7">
									<p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/40">
										Account
									</p>

									<div className="space-y-1">
										<Link
											href="/profile"
											onClick={closeMobileMenu}
											className="flex items-center gap-3 rounded-xl bg-background px-4 py-3.5 text-sm font-medium text-foreground/75 transition hover:bg-muted/10 hover:text-[#85161B]"
										>
											<HiOutlineUser size={20} />
											Account
										</Link>

										<Link
											href="/wishlist"
											onClick={closeMobileMenu}
											className="flex items-center gap-3 rounded-xl bg-background px-4 py-3.5 text-sm font-medium text-foreground/75 transition hover:bg-muted/10 hover:text-[#85161B]"
										>
											<HiOutlineHeart size={20} />
											Wishlist
										</Link>

										<Link
											href="/cart"
											onClick={closeMobileMenu}
											className="flex items-center justify-between rounded-xl bg-background px-4 py-3.5 text-sm font-medium text-foreground/75 transition hover:bg-muted/10 hover:text-[#85161B]"
										>
											<div className="flex items-center gap-3">
												<HiOutlineShoppingCart size={20} />
												Cart
											</div>

										
										</Link>
									</div>
								</div>
							</div>

							{/* WHATSAPP */}

							<div className="shrink-0 border-t border-border bg-background p-5">
								<a
									href="https://wa.me/918827882713?text=Hi"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="WhatsApp"
									className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
								>
									<span>💬</span>
									Chat with us on WhatsApp
								</a>
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
