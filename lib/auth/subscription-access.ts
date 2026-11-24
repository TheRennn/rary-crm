export type AccessRequirementStatus =
  | "legacy"
  | "email-unverified"
  | "approval-required"
  | "granted";

export function getAccessRequirementStatus(account: {
  requirementsEnforced: boolean;
  emailVerified: boolean;
  accessStatus?: string | null;
}): AccessRequirementStatus {
  if (!account.requirementsEnforced) return "legacy";
  if (!account.emailVerified) return "email-unverified";
  return account.accessStatus === "Liberado" ? "granted" : "approval-required";
}
