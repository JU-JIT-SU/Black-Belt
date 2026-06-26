'use client';

import ImageUpload from '@/components/community/ImageUpload';
import VideoUpload from '@/components/community/VideoUpload';
import PostFormActions from '@/components/community/PostFormActions';
import ConfirmModal from '@/components/common/ConfirmModal';
import { LimitedInput } from '@/components/common/LimitedInput';
import { LimitedTextarea } from '@/components/common/LimitedTextarea';

export interface PostFormBaseProps {
  pageTitle: string;
  // tab — undefined이면 탭 스위처 미표시, 항상 작성 폼만 렌더
  tab?: 'write' | 'preview';
  onTabChange?: (tab: 'write' | 'preview') => void;
  // 필드 값
  title: string;
  onTitleChange: (v: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  imagePreview: string | null;
  onImageChange: (file: File, previewUrl: string) => void;
  onImageRemove: () => void;
  videoPreview: string | null;
  onVideoChange: (file: File, previewUrl: string) => void;
  onVideoRemove: () => void;
  // 게시글 유형 섹션 — 호출자가 role 분기를 처리해서 ReactNode로 전달
  categorySection: React.ReactNode;
  // 미리보기 탭에 렌더할 내용 — 탭이 없으면 사용 안 함
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

export default function PostFormBase({
  pageTitle,
  tab,
  onTabChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  imagePreview,
  onImageChange,
  onImageRemove,
  videoPreview,
  onVideoChange,
  onVideoRemove,
  categorySection,
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
}: PostFormBaseProps) {
  const showForm = tab === undefined || tab === 'write';
  const showPreview = tab === 'preview';

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      <div className="w-full flex items-center mb-6">
        <h1 className="text-lg font-semibold mx-auto">{pageTitle}</h1>
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

      {showForm && (
        <>
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-tertiary)' }}>게시글 유형</p>
            {categorySection}
          </div>

          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <label
              htmlFor="post-title"
              className="text-sm mb-2 block"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              제목
            </label>
            <LimitedInput
              id="post-title"
              value={title}
              onChange={onTitleChange}
              maxLength={35}
              placeholder="제목을 입력하세요"
            />
          </div>

          <ImageUpload
            preview={imagePreview}
            onChange={onImageChange}
            onRemove={onImageRemove}
          />

          <VideoUpload
            preview={videoPreview}
            onChange={onVideoChange}
            onRemove={onVideoRemove}
          />

          <div
            className="rounded-xl p-4 mb-6"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
          >
            <label
              htmlFor="post-content"
              className="text-sm mb-2 block"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              내용
            </label>
            <LimitedTextarea
              id="post-content"
              value={content}
              onChange={onContentChange}
              maxLength={5000}
              rows={8}
              placeholder="내용을 입력하세요"
            />
          </div>
        </>
      )}

      {showPreview && (
        !title && !content ? (
          <div
            className="flex flex-col items-center justify-center py-16 mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
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
