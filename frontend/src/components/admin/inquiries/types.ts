export type Subscriber = { id: string; email: string; created_at: string };

export type LegacyBooking = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  package_id: string;
  package_title: string;
  travel_date: string;
  travelers: number;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

export const INQUIRY_TYPES = [
  { value: "general", label: "General" },
  { value: "package", label: "Package" },
  { value: "visa", label: "Visa" },
  { value: "other", label: "Other" },
] as const;

export function inquiryTypeLabel(type: string): string {
  return INQUIRY_TYPES.find((t) => t.value === type)?.label ?? type;
}
