"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Zap,
	Plus,
	RefreshCw,
	AlertCircle,
	PenLine,
	Trash2,
	Store,
	LogOut,
} from "lucide-react";

/* ============================================================================
   TYPES
============================================================================ */

type Occasion = {
	id: number;
	name: string;
	icon_path?: string;
};

type FormData = {
	mode: "new" | "edit";
	id?: number;
	name: string;
	Icon?: File;
};

/* ============================================================================
   PAGE
============================================================================ */

export default function OccasionsPage() {
	const router = useRouter();
	const [occasions, setOccasions] = useState<Occasion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState<FormData>({
		mode: "new",
		name: "",
		Icon: undefined,
	});

	/* ========================================================================
       LOAD OCCASIONS
    ======================================================================== */

	const loadOccasions = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/admin/occasions");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to load occasions");
			}

			setOccasions(Array.isArray(data) ? data : data.occasions || []);
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Failed to load occasions";
			setError(message);
			console.error("Error loading occasions:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOccasions();
	}, []);

	/* ========================================================================
       CREATE/EDIT OCCASION
    ======================================================================== */

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			setError("Name is required");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const body = new FormData();
			body.append("mode", formData.mode);
			body.append("name", formData.name);
			body.append("command_type", "admin");

			if (formData.mode === "edit" && formData.id) {
				body.append("id", formData.id.toString());
			}

			if (formData.Icon) {
				body.append("Icon", formData.Icon);
			}

			const response = await fetch("/api/admin/occasions", {
				method: "POST",
				body,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to save occasion");
			}

			setFormData({
				mode: "new",
				name: "",
				Icon: undefined,
			});
			setEditingId(null);
			setShowForm(false);

			await loadOccasions();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to save occasion";
			setError(message);
			console.error("Error saving occasion:", err);
		} finally {
			setLoading(false);
		}
	};

	/* ========================================================================
       EDIT OCCASION
    ======================================================================== */

	const handleEdit = (occasion: Occasion) => {
		setEditingId(occasion.id);
		setFormData({
			mode: "edit",
			id: occasion.id,
			name: occasion.name,
			Icon: undefined,
		});
		setShowForm(true);
		setError(null);
	};

	/* ========================================================================
       DELETE OCCASION
    ======================================================================== */

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this occasion?")) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const body = new FormData();
			body.append("mode", "delete");
			body.append("id", id.toString());
			body.append("command_type", "admin");

			const response = await fetch("/api/admin/occasions", {
				method: "POST",
				body,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to delete occasion");
			}

			await loadOccasions();
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "Failed to delete occasion";
			setError(message);
			console.error("Error deleting occasion:", err);
		} finally {
			setLoading(false);
		}
	};

	/* ========================================================================
       RENDER
    ======================================================================== */

	return (
		<div className="min-h-screen bg-[#FBF9F7] p-4 lg:p-8">
			<div className="mx-auto max-w-7xl">
				{/* HEADER */}

				<div className="mb-8 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Zap className="text-[#85161B]" size={28} />

						<h1 className="text-3xl font-bold text-[#2E2E2E]">
							Occasions
						</h1>
					</div>

					<button
						type="button"
						onClick={() => {
							setShowForm(!showForm);
							setEditingId(null);
							setFormData({
								mode: "new",
								name: "",
								Icon: undefined,
							});
							setError(null);
						}}
						className="
							inline-flex
							items-center
							gap-2
							rounded-lg
							bg-[#85161B]
							px-4
							py-2
							font-medium
							text-white
							transition-all
							duration-200
							hover:bg-[#A01E23]
							active:scale-95
						"
					>
						<Plus size={18} />

						<span>New Occasion</span>
					</button>
				</div>

				{/* ERROR MESSAGE */}

				{error && (
					<div
						className="
							mb-6
							flex
							items-start
							gap-3
							rounded-lg
							border
							border-red-200
							bg-red-50
							px-4
							py-3
							text-sm
							text-red-700
						"
					>
						<AlertCircle size={18} className="mt-0.5 flex-shrink-0" />

						<div>
							<p className="font-medium">Error</p>
							<p className="mt-1">{error}</p>
						</div>
					</div>
				)}

				{/* CREATE/EDIT FORM */}

				{showForm && (
					<div className="mb-8 rounded-lg border border-[#E8DED7] bg-white p-6">
						<h2 className="mb-4 text-xl font-bold text-[#2E2E2E]">
							{editingId
								? "Edit Occasion"
								: "Create New Occasion"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							{/* NAME FIELD */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Occasion Name *
								</label>

								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									placeholder="e.g., Wedding, Anniversary"
									className="
										w-full
										rounded-lg
										border
										border-[#E8DED7]
										px-3
										py-2
										text-sm
										focus:border-[#85161B]
										focus:outline-none
										focus:ring-1
										focus:ring-[#85161B]
									"
								/>
							</div>

							{/* ICON FIELD */}

							<div>
								<label className="mb-2 block text-sm font-medium text-[#2E2E2E]">
									Icon (Image)
								</label>

								<div className="flex items-center gap-4">
									<input
										type="file"
										accept="image/*"
										onChange={(e) =>
											setFormData({
												...formData,
												Icon: e.target.files?.[0],
											})
										}
										className="
											flex-1
											rounded-lg
											border
											border-[#E8DED7]
											px-3
											py-2
											text-sm
										"
									/>

									{formData.Icon && (
										<span className="text-xs text-[#2E2E2E]/60">
											{formData.Icon.name}
										</span>
									)}
								</div>
							</div>

							{/* BUTTONS */}

							<div className="flex gap-3">
								<button
									type="submit"
									disabled={loading}
									className="
										rounded-lg
										bg-[#85161B]
										px-4
										py-2
										font-medium
										text-white
										transition-all
										duration-200
										hover:bg-[#A01E23]
										active:scale-95
										disabled:opacity-50
									"
								>
									{loading
										? "Saving..."
										: editingId
											? "Update"
											: "Create"}
								</button>

								<button
									type="button"
									onClick={() => {
										setShowForm(false);
										setEditingId(null);
										setFormData({
											mode: "new",
											name: "",
											Icon: undefined,
										});
										setError(null);
									}}
									className="
										rounded-lg
										border
										border-[#E8DED7]
										px-4
										py-2
										font-medium
										text-[#2E2E2E]
										transition-all
										duration-200
										hover:bg-[#FBF9F7]
									"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* LOADING STATE */}

				{loading && !showForm && (
					<div className="flex items-center justify-center py-12">
						<div className="flex flex-col items-center gap-3">
							<RefreshCw
								className="animate-spin text-[#85161B]"
								size={24}
							/>

							<p className="text-[#2E2E2E]/60">
								Loading occasions...
							</p>
						</div>
					</div>
				)}

				{/* OCCASIONS TABLE */}

				{!loading && occasions.length > 0 && (
					<div className="overflow-x-auto rounded-lg border border-[#E8DED7] bg-white">
						<table className="w-full">
							<thead>
								<tr className="border-b border-[#E8DED7] bg-[#FBF9F7]">
									<th className="px-6 py-3 text-left text-sm font-semibold text-[#2E2E2E]">
										Icon
									</th>

									<th className="px-6 py-3 text-left text-sm font-semibold text-[#2E2E2E]">
										Name
									</th>

									<th className="px-6 py-3 text-right text-sm font-semibold text-[#2E2E2E]">
										Actions
									</th>
								</tr>
							</thead>

							<tbody>
								{occasions.map((occasion) => (
									<tr
										key={occasion.id}
										className="
											border-b
											border-[#E8DED7]
											transition-all
											duration-200
											hover:bg-[#FBF9F7]
										"
									>
										<td className="px-4 py-4">
											{occasion.icon_path ? (
												<img
													src={`https://printinghouseujjain.in/assets/occasions/${occasion.icon_path}`}
													alt={occasion.name}
													className="h-16 w-16 rounded object-cover"
												/>
											) : (
												<span className="text-xs text-[#2E2E2E]/40">
													No image
												</span>
											)}
										</td>

										<td className="px-3 py-4 text-sm text-[#2E2E2E]">
											{occasion.name}
										</td>

										<td className="px-6 py-4 text-right">
											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={() =>
														handleEdit(occasion)
													}
													className="
														inline-flex
														items-center
														gap-1
														rounded
														bg-blue-50
														px-3
														py-1.5
														text-xs
														font-medium
														text-blue-600
														transition-all
														hover:bg-blue-100
													"
												>
													<PenLine size={14} />

													<span>Edit</span>
												</button>

												<button
													type="button"
													onClick={() =>
														handleDelete(
															occasion.id
														)
													}
													className="
														inline-flex
														items-center
														gap-1
														rounded
														bg-red-50
														px-3
														py-1.5
														text-xs
														font-medium
														text-red-600
														transition-all
														hover:bg-red-100
													"
												>
													<Trash2 size={14} />

													<span>Delete</span>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* EMPTY STATE */}

				{!loading && occasions.length === 0 && (
					<div className="text-center">
						<div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF9F7]">
							<Zap
								className="text-[#2E2E2E]/40"
								size={24}
							/>
						</div>

						<p className="mb-4 text-[#2E2E2E]/60">
							No occasions yet. Create your first one!
						</p>

						<button
							type="button"
							onClick={() => {
								setShowForm(true);
								setError(null);
							}}
							className="
								inline-flex
								items-center
								gap-2
								rounded-lg
								bg-[#85161B]
								px-4
								py-2
								font-medium
								text-white
								transition-all
								duration-200
								hover:bg-[#A01E23]
								active:scale-95
							"
						>
							<Plus size={18} />

							<span>Create Occasion</span>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
