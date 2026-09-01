import { Suspense } from "react";
import ShopPageContent from "./ShopPageContent";

function ShopLoading() {
	return (
		<main
			className="min-h-screen bg-[#FBF9F7] pt-[112px] sm:pt-[120px]"
		>
			<section className="border-b border-[#E8DED7] bg-white">
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
					<div className="max-w-2xl">
						<div className="h-4 w-40 animate-pulse rounded bg-[#E8DED7]" />

						<div className="mt-4 h-12 w-96 max-w-full animate-pulse rounded bg-[#E8DED7]" />

						<div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-[#E8DED7]" />
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className="h-[400px] animate-pulse rounded-2xl bg-white"
						/>
					))}
				</div>
			</section>
		</main>
	);
}

export default function ShopPage() {
	return (
		<Suspense fallback={<ShopLoading />}>
			<ShopPageContent />
		</Suspense>
	);
}