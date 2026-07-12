// ─── Component prop types ──────────────────────────────────────────────────────

export interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  color?: string;
  isLoading: boolean;
}
