'use client';

import CompetitionForm, {
  type CompetitionFormValues,
} from '@/components/competition/CompetitionForm';
import PostFormActions from '@/components/community/PostFormActions';
import ConfirmModal from '@/components/common/ConfirmModal';

export interface CompetitionFormBaseProps {
  pageTitle: string;
  values: CompetitionFormValues;
  onChange: (values: CompetitionFormValues) => void;
  // tab — undefined이면 탭 스위처 미표시, 항상 작성 폼만 렌더
  tab?: 'write' | 'preview';
  onTabChange?: (tab: 'write' | 'preview') => void;
  // 미리보기 탭에서 빈 상태 메시지를 표시할지 여부 (caller가 판단)
  showEmptyPreview?: boolean;
  // 미리보기 탭에 렌더할 내용
  previewContent?: React.ReactNode;
  // 액션
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isLoading: boolean;
  // 취소 확인 모달
  cancelModalOpen: boolean;
  onCancelModalClose: () => void;
  onCancelConfirm: () => void;
  cancelModalTitle: string;
  cancelModalDescription: string;
}

const tabActiveStyle = {
  background: '#2563eb',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
} as const;

const tabInactiveStyle = { color: 'var(--color-text-hint)' } as const;

export default function CompetitionFormBase({
  pageTitle,
  values,
  onChange,
  tab,
  onTabChange,
  showEmptyPreview,
  previewContent,
  onCancel,
  onSubmit,
  submitLabel,
  isLoading,
  cancelModalOpen,
  onCancelModalClose,
  onCancelConfirm,
  cancelModalTitle,
  cancelModalDescription,
}: CompetitionFormBaseProps) {
  const showForm = tab === undefined || tab === 'write';
  const showPreview = tab === 'preview';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="relative w-full flex items-center justify-center mb-6">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      {tab !== undefined && onTabChange && (
        <div
          role="tablist"
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'var(--color-bg-tint)' }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'write'}
            onClick={() => onTabChange('write')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={tab === 'write' ? tabActiveStyle : tabInactiveStyle}
          >
            작성
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            onClick={() => onTabChange('preview')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={tab === 'preview' ? tabActiveStyle : tabInactiveStyle}
          >
            미리보기
          </button>
        </div>
      )}

      {showForm && <CompetitionForm values={values} onChange={onChange} />}

      {showPreview && (
        showEmptyPreview ? (
          <div
            className="flex flex-col items-center justify-center py-16 mb-6"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            <p className="text-sm">작성 탭에서 내용을 입력하면</p>
            <p className="text-sm">여기서 미리볼 수 있어요.</p>
          </div>
        ) : (
          <div className="mb-6">{previewContent}</div>
        )
      )}

      <PostFormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        isLoading={isLoading}
      />

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={onCancelModalClose}
        onConfirm={onCancelConfirm}
        title={cancelModalTitle}
        description={cancelModalDescription}
      />
    </div>
  );
}
