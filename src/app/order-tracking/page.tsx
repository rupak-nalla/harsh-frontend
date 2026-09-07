import { Suspense } from "react";
import OrderTrackingClient from "./OrderTrackingClient";

export default function OrderTrackingPage() {
	return (
		<Suspense
			fallback={
				<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7] pt-[112px] sm:pt-[120px]">
					<section className="mx-auto max-w-4xl px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
						<div className="mx-auto max-w-2xl text-center">
							<div className="mx-auto h-16 w-16 animate-pulse rounded-2xl bg-[#F7D6BF]/50" />

							<div className="mx-auto mt-6 h-3 w-32 animate-pulse rounded bg-[#85161B]/10" />

							<div className="mx-auto mt-3 h-10 w-64 animate-pulse rounded bg-[#2E2E2E]/10" />

							<div className="mx-auto mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-[#2E2E2E]/5" />
						</div>

						<div className="mx-auto mt-8 max-w-2xl animate-pulse rounded-3xl border border-[#E9DED7] bg-white p-5 sm:p-7">
							<div className="h-4 w-24 rounded bg-[#2E2E2E]/10" />

							<div className="mt-3 h-12 w-full rounded-xl bg-[#2E2E2E]/5" />
						</div>
					</section>
				</main>
			}
		>
			<OrderTrackingClient />
		</Suspense>
	);
}