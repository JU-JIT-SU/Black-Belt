'use client';

interface PostFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading?: boolean;
}

export default function PostFormActions({
  onCancel,
  onSubmit,
  submitLabel,
  isLoading = false,
}: PostFormActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 py-3 rounded-xl bg-btn-basic text-[color:var(--color-text-primary)] hover:bg-[var(--color-border-medium)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className={`hover:bg-[var(--color-border-medium)] flex-3 py-3 rounded-xl text-[color:var(--color-text-primary)] text-sm font-medium transition-colors duration-200 ${
          isLoading
            ? 'bg-[var(--color-btn-basic)] opacity-50 cursor-not-allowed'
            : 'bg-btn-basic cursor-pointer'
        }`}
      >
        {isLoading ? '처리 중...' : submitLabel}
      </button>
    </div>
  );
}
