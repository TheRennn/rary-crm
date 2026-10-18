export type AccessRequirementStatus =
  | "legacy"
  | "email-unverified"
  | "payment-required"
  | "granted";

export function getAccessRequirementStatus(account: {
  requirementsEnforced: boolean;
  emailVerified: boolean;
  paymentVerified: boolean;
  accessExpiresAt: string | null | undefined;
}): AccessRequirementStatus {
  if (!account.requirementsEnforced) return "legacy";
  if (!account.emailVerified) return "email-unverified";
  if (!account.paymentVerified || !account.accessExpiresAt) return "payment-required";

  const expiryTime = Date.parse(account.accessExpiresAt);
  if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
    return "payment-required";
  }

  return "granted";
}
