"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Gift,
	CheckCircle2,
	KeyRound,
} from "lucide-react";

type FormErrors = {
	email?: string;
	newPassword?: string;
	confirmPassword?: string;
	otp?: string;
	general?: string;
};

export default function ForgotPasswordPage() {
	/*
	 * step 1: enter email + new password, request OTP
	 * step 2: enter OTP to verify and complete the reset
	 * step 3: success
	 */
	const [step, setStep] = useState<1 | 2 | 3>(1);

	const [email, setEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [otp, setOtp] = useState("");

	const [transactionId, setTransactionId] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	// ------------------------------------------------------------
	// Validation
	// ------------------------------------------------------------

	const validateEmail = (value: string) => {
		const clean = value.trim();

		if (!clean) return "Email address is required.";
		if (clean.length > 254) return "Email address is too long.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
			return "Please enter a valid email address.";
		}

		return undefined;
	};

	const validateNewPassword = (value: string) => {
		if (!value) return "New password is required.";
		if (value.length < 8) {
			return "Password must contain at least 8 characters.";
		}

		if (value.length > 128) {
			return "Password must be less than 128 characters.";
		}

		if (!/[A-Z]/.test(value)) {
			return "Password must contain at least one uppercase letter.";
		}

		if (!/[a-z]/.test(value)) {
			return "Password must contain at least one lowercase letter.";
		}

		if (!/[0-9]/.test(value)) {
			return "Password must contain at least one number.";
		}

		if (!/[^A-Za-z0-9]/.test(value)) {
			return "Password must contain at least one special character.";
		}

		return undefined;
	};

	const validateConfirmPassword = (value: string) => {
		if (!value) return "Please confirm your new password.";
		if (value !== newPassword) return "Passwords do not match.";

		return undefined;
	};

	const validateOtp = (value: string) => {
		const clean = value.trim();

		if (!clean) return "Please enter the OTP.";

		return undefined;
	};

	// ------------------------------------------------------------
	// STEP 1 — EMAIL + NEW PASSWORD, REQUEST OTP
	// ------------------------------------------------------------

	const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isLoading) return;

		setErrors({});

		const newErrors: FormErrors = {};

		const emailError = validateEmail(email);
		const newPasswordError = validateNewPassword(newPassword);
		const confirmPasswordError = validateConfirmPassword(confirmPassword);

		if (emailError) newErrors.email = emailError;
		if (newPasswordError) newErrors.newPassword = newPasswordError;
		if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsLoading(true);

		const normalizedEmail = email.trim().toLowerCase();

		try {
			/*
			 * /api/auth/forgot expects BOTH email and new_password.
			 * The backend ties new_password to the returned
			 * transaction_id, applying it once /api/verify succeeds.
			 */
			const formData = new FormData();

			formData.append("email", normalizedEmail);
			formData.append("new_password", newPassword);

			const response = await fetch("/api/auth/forgot", {
				method: "POST",
				body: formData,
			});

			type ForgotResponse = {
				message?: string;
				transaction_id?: string;
				transactionId?: string;
				transaction?: string;
			};

			const data: ForgotResponse = await response.json().catch(() => ({}));

			if (!response.ok) {
				setErrors({
					general:
						data?.message ||
						"Unable to send OTP. Please check your email and try again.",
				});
				return;
			}

			const transaction =
				data.transaction_id ?? data.transactionId ?? data.transaction;

			if (!transaction) {
				setErrors({
					general:
						"OTP was requested, but no transaction ID was returned. Please try again.",
				});
				return;
			}

			setTransactionId(String(transaction));
			setSuccessMessage(
				data.message || `OTP has been sent to ${normalizedEmail}.`,
			);
			setStep(2);
		} catch {
			setErrors({
				general: "Unable to connect to the server. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// ------------------------------------------------------------
	// STEP 2 — VERIFY OTP (hits the shared /api/auth/verify route;
	// the backend applies the new_password already tied to this
	// transaction_id once the OTP checks out)
	// ------------------------------------------------------------

	const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isLoading) return;

		setErrors({});

		const otpError = validateOtp(otp);

		if (otpError) {
			setErrors({ otp: otpError });
			return;
		}

		if (!transactionId) {
			setErrors({
				general:
					"Your session has expired. Please restart the password reset process.",
			});
			setStep(1);
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();

			formData.append("otp", otp.trim());
			formData.append("transaction_id", transactionId);

			const response = await fetch("/api/auth/verify", {
				method: "POST",
				body: formData,
			});

			const data: { message?: string } = await response
				.json()
				.catch(() => ({}));

			if (!response.ok) {
				setErrors({
					general: data?.message || "Invalid or expired OTP. Please try again.",
				});
				return;
			}

			setSuccessMessage(
				data?.message || "Your password has been reset successfully.",
			);
			setStep(3);
		} catch {
			setErrors({
				general: "Unable to connect to the server. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// ------------------------------------------------------------
	// Input helpers
	// ------------------------------------------------------------

	const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);

		if (errors.email || errors.general) {
			setErrors((previous) => ({
				...previous,
				email: undefined,
				general: undefined,
			}));
		}
	};

	const handleNewPasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setNewPassword(event.target.value);

		if (errors.newPassword || errors.general) {
			setErrors((previous) => ({
				...previous,
				newPassword: undefined,
				general: undefined,
			}));
		}
	};

	const handleConfirmPasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setConfirmPassword(event.target.value);

		if (errors.confirmPassword || errors.general) {
			setErrors((previous) => ({
				...previous,
				confirmPassword: undefined,
				general: undefined,
			}));
		}
	};

	const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setOtp(event.target.value.replace(/\D/g, ""));

		if (errors.otp || errors.general) {
			setErrors((previous) => ({
				...previous,
				otp: undefined,
				general: undefined,
			}));
		}
	};

	const passwordChecks = {
		length: newPassword.length >= 8,
		uppercase: /[A-Z]/.test(newPassword),
		lowercase: /[a-z]/.test(newPassword),
		number: /[0-9]/.test(newPassword),
		special: /[^A-Za-z0-9]/.test(newPassword),
	};

	return (
		<main className="min-h-[calc(100vh-90px)] bg-[#FBF9F7]">
			<div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-6xl items-center px-5 py-10 sm:px-6 lg:px-8">
				<div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-[0_15px_60px_rgba(80,40,20,0.08)] lg:grid-cols-2">
					{/* =====================================================
              BRAND PANEL
          ====================================================== */}

					<div className="relative hidden min-h-[620px] overflow-hidden bg-[#85161B] p-10 text-white lg:flex lg:flex-col lg:justify-between">
						<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

						<div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full border border-white/10" />

						<div className="pointer-events-none absolute right-20 top-1/2 h-32 w-32 rounded-full border border-white/5" />

						<Link
							href="/"
							className="relative z-10 flex w-fit items-center gap-3 transition-opacity hover:opacity-85"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7D6BF] text-[#85161B]">
								<Gift size={21} />
							</div>

							<div>
								<div className="text-xl font-bold">Giftify</div>

								<div className="text-xs text-white/70">Make it Personal</div>
							</div>
						</Link>

						<div className="relative z-10 max-w-md">
							<p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#F7D6BF]">
								Account recovery
							</p>

							<h1
								className="text-4xl font-bold leading-tight text-white xl:text-5xl"
								style={{ color: "#ffff" }}
							>
								Let's get you
								<br />
								back in.
							</h1>

							<p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
								Set your new password and we'll send a one-time code to your
								email to confirm it's you before we make the change.
							</p>

							<div className="mt-8 space-y-4">
								{[
									"Verified with a one-time code",
									"Your data stays protected",
									"Back to your account in minutes",
								].map((item) => (
									<div key={item} className="flex items-center gap-3">
										<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F7D6BF]">
											<CheckCircle2 size={14} />
										</div>

										<span className="text-sm text-white/75">{item}</span>
									</div>
								))}
							</div>
						</div>

						<div className="relative z-10">
							<div className="mb-3 h-px w-full bg-white/15" />

							<p className="text-xs text-white/65">
								Personalized gifts. Beautiful memories.
							</p>
						</div>
					</div>

					{/* =====================================================
              FORM
          ====================================================== */}

					<div className="flex min-h-[620px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
						{/* Mobile logo */}

						<div className="mb-10 lg:hidden">
							<Link href="/" className="inline-flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7D6BF] text-[#85161B]">
									<Gift size={19} />
								</div>

								<div>
									<div className="font-bold text-[#2E2E2E]">Giftify</div>

									<div className="text-[10px] text-[#2E2E2E]/50">
										Make it Personal
									</div>
								</div>
							</Link>
						</div>

						{/* Back to login */}

						<Link
							href="/login"
							className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#2E2E2E]/55 transition-colors hover:text-[#85161B]"
						>
							<ArrowLeft size={16} />
							Back to sign in
						</Link>

						{/* =================================================
						    STEP 1 — EMAIL + NEW PASSWORD
						================================================= */}

						{step === 1 && (
							<>
								<div>
									<h2 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
										Forgot password?
									</h2>

									<p className="mt-2 text-sm text-[#2E2E2E]/55">
										Enter your email and choose a new password. We'll send a
										code to verify it's you.
									</p>
								</div>

								{errors.general && (
									<div
										role="alert"
										aria-live="polite"
										className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
									>
										{errors.general}
									</div>
								)}

								<form
									onSubmit={handleRequestOtp}
									className="mt-7 space-y-5"
									noValidate
								>
									{/* EMAIL */}

									<div>
										<label
											htmlFor="email"
											className="mb-2 block text-sm font-medium text-[#2E2E2E]"
										>
											Email address
										</label>

										<div
											className={`flex items-center rounded-xl border bg-[#FCFBFA] px-3.5 transition focus-within:ring-2 ${
												errors.email
													? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
													: "border-[#DED6D0] focus-within:border-[#85161B] focus-within:ring-[#85161B]/10"
											}`}
										>
											<Mail
												size={18}
												aria-hidden="true"
												className="mr-3 shrink-0 text-[#2E2E2E]/35"
											/>

											<input
												id="email"
												name="email"
												type="email"
												value={email}
												onChange={handleEmailChange}
												autoComplete="email"
												inputMode="email"
												maxLength={254}
												required
												disabled={isLoading}
												placeholder="you@example.com"
												aria-invalid={Boolean(errors.email)}
												aria-describedby={
													errors.email ? "email-error" : undefined
												}
												className="w-full bg-transparent py-3.5 text-sm text-[#2E2E2E] outline-none placeholder:text-[#2E2E2E]/30 disabled:cursor-not-allowed disabled:opacity-60"
											/>
										</div>

										{errors.email && (
											<p
												id="email-error"
												role="alert"
												className="mt-1.5 text-xs text-red-600"
											>
												{errors.email}
											</p>
										)}
									</div>

									{/* NEW PASSWORD */}

									<div>
										<label
											htmlFor="newPassword"
											className="mb-2 block text-sm font-medium text-[#2E2E2E]"
										>
											New password
										</label>

										<div
											className={`flex items-center rounded-xl border bg-[#FCFBFA] px-3.5 transition focus-within:ring-2 ${
												errors.newPassword
													? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
													: "border-[#DED6D0] focus-within:border-[#85161B] focus-within:ring-[#85161B]/10"
											}`}
										>
											<Lock
												size={18}
												aria-hidden="true"
												className="mr-3 shrink-0 text-[#2E2E2E]/35"
											/>

											<input
												id="newPassword"
												type={showPassword ? "text" : "password"}
												value={newPassword}
												onChange={handleNewPasswordChange}
												autoComplete="new-password"
												disabled={isLoading}
												placeholder="Create a new password"
												aria-invalid={Boolean(errors.newPassword)}
												aria-describedby={
													errors.newPassword ? "new-password-error" : undefined
												}
												className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-[#2E2E2E] outline-none placeholder:text-[#2E2E2E]/30 disabled:cursor-not-allowed disabled:opacity-60"
											/>

											<button
												type="button"
												onClick={() => setShowPassword((v) => !v)}
												disabled={isLoading}
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
												className="ml-2 shrink-0 rounded-md p-1 text-[#2E2E2E]/40 transition-colors hover:text-[#85161B] disabled:cursor-not-allowed disabled:opacity-50"
											>
												{showPassword ? (
													<EyeOff size={18} />
												) : (
													<Eye size={18} />
												)}
											</button>
										</div>

										{errors.newPassword && (
											<p
												id="new-password-error"
												role="alert"
												className="mt-1.5 text-xs text-red-600"
											>
												{errors.newPassword}
											</p>
										)}

										<div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
											<PasswordRequirement
												valid={passwordChecks.length}
												text="8+ characters"
											/>

											<PasswordRequirement
												valid={passwordChecks.uppercase}
												text="Uppercase"
											/>

											<PasswordRequirement
												valid={passwordChecks.lowercase}
												text="Lowercase"
											/>

											<PasswordRequirement
												valid={passwordChecks.number}
												text="Number"
											/>

											<PasswordRequirement
												valid={passwordChecks.special}
												text="Special character"
											/>
										</div>
									</div>

									{/* CONFIRM PASSWORD */}

									<div>
										<label
											htmlFor="confirmPassword"
											className="mb-2 block text-sm font-medium text-[#2E2E2E]"
										>
											Confirm new password
										</label>

										<div
											className={`flex items-center rounded-xl border bg-[#FCFBFA] px-3.5 transition focus-within:ring-2 ${
												errors.confirmPassword
													? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
													: "border-[#DED6D0] focus-within:border-[#85161B] focus-within:ring-[#85161B]/10"
											}`}
										>
											<Lock
												size={18}
												aria-hidden="true"
												className="mr-3 shrink-0 text-[#2E2E2E]/35"
											/>

											<input
												id="confirmPassword"
												type={showConfirmPassword ? "text" : "password"}
												value={confirmPassword}
												onChange={handleConfirmPasswordChange}
												autoComplete="new-password"
												disabled={isLoading}
												placeholder="Confirm your new password"
												aria-invalid={Boolean(errors.confirmPassword)}
												aria-describedby={
													errors.confirmPassword
														? "confirm-password-error"
														: undefined
												}
												className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-[#2E2E2E] outline-none placeholder:text-[#2E2E2E]/30 disabled:cursor-not-allowed disabled:opacity-60"
											/>

											<button
												type="button"
												onClick={() => setShowConfirmPassword((v) => !v)}
												disabled={isLoading}
												aria-label={
													showConfirmPassword
														? "Hide password"
														: "Show password"
												}
												className="ml-2 shrink-0 rounded-md p-1 text-[#2E2E2E]/40 transition-colors hover:text-[#85161B] disabled:cursor-not-allowed disabled:opacity-50"
											>
												{showConfirmPassword ? (
													<EyeOff size={18} />
												) : (
													<Eye size={18} />
												)}
											</button>
										</div>

										{errors.confirmPassword && (
											<p
												id="confirm-password-error"
												role="alert"
												className="mt-1.5 text-xs text-red-600"
											>
												{errors.confirmPassword}
											</p>
										)}
									</div>

									<button
										type="submit"
										disabled={isLoading}
										className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#721318] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#85161B] disabled:hover:shadow-none"
									>
										{isLoading ? (
											<>
												<span
													className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
													aria-hidden="true"
												/>
												Sending OTP...
											</>
										) : (
											<>
												Send OTP
												<ArrowRight
													size={17}
													className="transition-transform duration-200 group-hover:translate-x-1"
												/>
											</>
										)}
									</button>
								</form>
							</>
						)}

						{/* =================================================
						    STEP 2 — VERIFY OTP
						================================================= */}

						{step === 2 && (
							<>
								<div>
									<h2 className="text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
										Verify your email
									</h2>

									<p className="mt-2 text-sm text-[#2E2E2E]/55">
										Enter the OTP sent to{" "}
										<span className="font-medium text-[#2E2E2E]">{email}</span>{" "}
										to confirm your new password.
									</p>
								</div>

								{successMessage && (
									<div
										role="status"
										className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
									>
										{successMessage}
									</div>
								)}

								{errors.general && (
									<div
										role="alert"
										aria-live="polite"
										className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
									>
										{errors.general}
									</div>
								)}

								<form
									onSubmit={handleVerifyOtp}
									className="mt-7 space-y-5"
									noValidate
								>
									{/* OTP */}

									<div>
										<label
											htmlFor="otp"
											className="mb-2 block text-sm font-medium text-[#2E2E2E]"
										>
											Verification code
										</label>

										<div
											className={`flex items-center rounded-xl border bg-[#FCFBFA] px-3.5 transition focus-within:ring-2 ${
												errors.otp
													? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10"
													: "border-[#DED6D0] focus-within:border-[#85161B] focus-within:ring-[#85161B]/10"
											}`}
										>
											<KeyRound
												size={18}
												aria-hidden="true"
												className="mr-3 shrink-0 text-[#2E2E2E]/35"
											/>

											<input
												id="otp"
												type="text"
												inputMode="numeric"
												autoComplete="one-time-code"
												value={otp}
												onChange={handleOtpChange}
												maxLength={6}
												disabled={isLoading}
												placeholder="Enter OTP"
												aria-invalid={Boolean(errors.otp)}
												aria-describedby={errors.otp ? "otp-error" : undefined}
												className="w-full bg-transparent py-3.5 text-center text-sm tracking-[0.4em] text-[#2E2E2E] outline-none placeholder:tracking-normal placeholder:text-[#2E2E2E]/30 disabled:cursor-not-allowed disabled:opacity-60"
											/>
										</div>

										{errors.otp && (
											<p
												id="otp-error"
												role="alert"
												className="mt-1.5 text-xs text-red-600"
											>
												{errors.otp}
											</p>
										)}
									</div>

									<button
										type="submit"
										disabled={isLoading}
										className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#721318] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#85161B] disabled:hover:shadow-none"
									>
										{isLoading ? (
											<>
												<span
													className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
													aria-hidden="true"
												/>
												Verifying...
											</>
										) : (
											<>
												Verify & reset password
												<ArrowRight
													size={17}
													className="transition-transform duration-200 group-hover:translate-x-1"
												/>
											</>
										)}
									</button>

									<button
										type="button"
										onClick={() => {
											setStep(1);
											setOtp("");
											setTransactionId("");
											setErrors({});
											setSuccessMessage("");
										}}
										disabled={isLoading}
										className="w-full text-center text-sm font-medium text-[#85161B] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
									>
										Use a different email
									</button>
								</form>
							</>
						)}

						{/* =================================================
						    STEP 3 — SUCCESS
						================================================= */}

						{step === 3 && (
							<div className="flex flex-col items-center py-6 text-center">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
									<CheckCircle2 size={30} className="text-green-600" />
								</div>

								<h2 className="mt-6 text-3xl font-bold tracking-tight text-[#2E2E2E] sm:text-4xl">
									Password reset
								</h2>

								<p className="mt-2 max-w-sm text-sm leading-6 text-[#2E2E2E]/55">
									{successMessage ||
										"Your password has been changed successfully. You can now sign in with your new password."}
								</p>

								<Link
									href="/login"
									className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85161B] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#721318] hover:shadow-lg"
								>
									Sign in
									<ArrowRight size={17} />
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}

function PasswordRequirement({
	valid,
	text,
}: {
	valid: boolean;
	text: string;
}) {
	return (
		<div
			className={`flex items-center gap-1.5 ${
				valid ? "text-green-600" : "text-[#2E2E2E]/40"
			}`}
		>
			<div
				className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
					valid ? "bg-green-100" : "bg-[#2E2E2E]/5"
				}`}
			>
				{valid && <CheckCircle2 size={9} />}
			</div>

			<span>{text}</span>
		</div>
	);
}
