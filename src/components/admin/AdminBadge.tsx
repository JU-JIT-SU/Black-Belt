export type AdminBadgeVariant = 'gray' | 'blue' | 'red' | 'green' | 'yellow';

interface AdminBadgeProps {
  label: string;
  variant: AdminBadgeVariant;
}

const baseStyle =
  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';

const variantStyleMap: Record<AdminBadgeVariant, string> = {
  gray: 'bg-gray-500/[0.15] text-gray-400 light:bg-gray-100 light:text-gray-700',
  blue: 'bg-blue-500/[0.15] text-blue-400 light:bg-blue-100 light:text-blue-700',
  red: 'bg-red-500/[0.15] text-red-400 light:bg-red-100 light:text-red-700',
  green: 'bg-emerald-500/[0.15] text-emerald-400 light:bg-green-100 light:text-green-700',
  yellow: 'bg-amber-500/[0.15] text-amber-400 light:bg-yellow-100 light:text-yellow-700',
};

export default function AdminBadge({ label, variant }: AdminBadgeProps) {
  return (
    <span className={`${baseStyle} ${variantStyleMap[variant]}`}>{label}</span>
  );
}
