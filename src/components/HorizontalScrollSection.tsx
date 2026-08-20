"use client";

import { useRef, Children, isValidElement } from "react";

export default function HorizontalScrollSection({
	children,
	title,
	subtitle,
	viewAll,
}: {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
	viewAll?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const scroll = (dir: "l" | "r") => {
		const card =
			ref.current?.querySelector<HTMLElement>(
				"[data-scroll-card]",
			);

		const cardWidth = card?.offsetWidth ?? 320;
		const gap = 20;

		const distance = cardWidth + gap;

		ref.current?.scrollBy({
			left: dir === "r" ? distance : -distance,
			behavior: "smooth",
		});
	};

	/*
	 * Only keep actual rendered children.
	 *
	 * This prevents empty/null/false children from becoming
	 * empty carousel cards.
	 */
	const items = Children.toArray(children).filter(
		(child) => {
			if (
				child === null ||
				child === undefined ||
				child === false
			) {
				return false;
			}

			return isValidElement(child);
		},
	);

	return (
		<section className="py-6 lg:py-8">
			<div
				className="
					rounded-3xl
					border
					border-[#E8CDBB]
					bg-[#F7D6BF]/30
					px-5
					py-7
					sm:px-7
					sm:py-8
					lg:px-9
					lg:py-9
				"
			>
				{/* HEADER */}
				<div className="mb-7 flex items-end justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
							{title}
						</h2>

						{subtitle && (
							<p
								className="mt-1 text-lg"
								style={{
									color: "var(--primary)",
								}}
							>
								{subtitle}
							</p>
						)}
					</div>

					{/* CONTROLS */}
					<div className="flex items-center gap-3">
						{viewAll && (
							<a
								href="#"
								className="
									hidden
									text-sm
									font-medium
									transition-opacity
									hover:opacity-70
									sm:block
								"
								style={{
									color: "var(--primary)",
								}}
							>
								{viewAll} →
							</a>
						)}

						<button
							type="button"
							onClick={() => scroll("l")}
							aria-label="Scroll left"
							className="
								flex
								h-10
								w-10
								shrink-0
								items-center
								justify-center
								rounded-full
								border
								border-[#D8BBA8]
								bg-white
								text-lg
								text-[#2E2E2E]
								shadow-sm
								transition-all
								duration-200
								hover:bg-[#F8F1EC]
								active:scale-95
							"
						>
							‹
						</button>

						<button
							type="button"
							onClick={() => scroll("r")}
							aria-label="Scroll right"
							className="
								flex
								h-10
								w-10
								shrink-0
								items-center
								justify-center
								rounded-full
								text-lg
								text-white
								shadow-sm
								transition-all
								duration-200
								hover:opacity-90
								active:scale-95
							"
							style={{
								background:
									"var(--primary)",
							}}
						>
							›
						</button>
					</div>
				</div>

				{/* PRODUCTS */}
				<div
					ref={ref}
					className="
						flex
						justify-start
						gap-5
						overflow-x-auto
						overflow-y-hidden
						pb-3
						scrollbar-hide
					"
					style={{
						scrollSnapType:
							"x mandatory",
						scrollPaddingLeft:
							"0px",
					}}
				>
					{items.map((child, index) => (
						<div
							key={index}
							data-scroll-card
							className="
								w-[260px]
								shrink-0
								sm:w-[290px]
								md:w-[310px]
								lg:w-[330px]
								xl:w-[340px]
							"
							style={{
								scrollSnapAlign:
									"start",
							}}
						>
							{child}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}