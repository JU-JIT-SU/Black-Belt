'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PostCategory } from '@/types/community';
import { createPost, uploadPostImage, uploadPostVideo } from '@/services/communityService';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import PostDetailCard from '@/components/community/PostDetailCard';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import PostFormBase from '@/components/community/PostFormBase';

export default function WriteClient({ sport }: { sport?: string } = {}) {
  const router = useRouter();
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { user } = useAuth();
  const [category, setCategory] = useState<PostCategory>('personal');
  const queryClient = useQueryClient();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const isDirty =
    title.trim() !== '' || content.trim() !== '' || imageFile !== null || videoFile !== null;

  useBeforeUnload(isDirty);

  const getFinalCategory = (): PostCategory =>
    user?.role === 'admin'
      ? 'notice'
      : user?.role === 'manager'
        ? category
        : 'personal';

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showErrorToast('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      const image_url = imageFile ? await uploadPostImage(imageFile) : undefined;
      const video_url = videoFile ? await uploadPostVideo(videoFile) : undefined;

      await createPost({
        category: getFinalCategory(),
        title,
        content,
        image_url,
        video_url,
        sport,
        user_id: user.id,
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSuccessToast('게시글이 업로드되었습니다.', '📝');
      setTitle('');
      setContent('');
      setImageFile(null);
      setVideoFile(null);
      setPreview(null);
      setVideoPreview(null);
      setCategory('personal');
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push(sport ? `/community/sport/${sport}` : '/community');
    } catch {
      showErrorToast('게시글 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const categorySection =
    user?.role === 'manager' ? (
      <div className="flex gap-2">
        {(['personal', 'promo'] as PostCategory[]).map((type) => (
          <button
            type="button"
            key={type}
            aria-pressed={category === type}
            onClick={() => setCategory(type)}
            className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={
              category === type
                ? { background: '#2563eb', color: '#fff' }
                : { background: 'var(--color-btn-basic)', color: 'var(--color-text-secondary)' }
            }
          >
            {type === 'personal' ? '일반 게시글' : '도장 홍보'}
          </button>
        ))}
      </div>
    ) : (
      <div
        aria-label={`게시글 유형: ${user?.role === 'admin' ? '공지' : '일반 게시글'}`}
        className="py-2 px-3 rounded-lg text-sm font-medium text-center"
        style={{ background: 'var(--color-bg-tint)', color: 'var(--color-text-primary)' }}
      >
        {user?.role === 'admin' ? '공지' : '일반 게시글'}
      </div>
    );

  return (
    <PostFormBase
      pageTitle="게시글 작성"
      tab={tab}
      onTabChange={setTab}
      title={title}
      onTitleChange={setTitle}
      content={content}
      onContentChange={setContent}
      imagePreview={preview}
      onImageChange={(file, previewUrl) => {
        setImageFile(file);
        setPreview(previewUrl);
      }}
      onImageRemove={() => {
        setImageFile(null);
        setPreview(null);
      }}
      videoPreview={videoPreview}
      onVideoChange={(file, previewUrl) => {
        setVideoFile(file);
        setVideoPreview(previewUrl);
      }}
      onVideoRemove={() => {
        setVideoFile(null);
        setVideoPreview(null);
      }}
      categorySection={categorySection}
      previewContent={
        <PostDetailCard
          post={{
            nickname: user?.name ?? '알 수 없음',
            avatar_url: user?.image ?? null,
            category: getFinalCategory(),
            created_at: new Date().toISOString(),
            title,
            image_url: preview,
            content,
            commentCount: 0,
          }}
        />
      }
      onCancel={() => {
        if (isDirty) {
          setCancelModalOpen(true);
        } else {
          showErrorToast('작성된 내용이 없습니다.');
          router.push(sport ? `/community/sport/${sport}` : '/community');
        }
      }}
      onSubmit={handleSubmit}
      submitLabel="작성하기"
      isLoading={isLoading}
      cancelModalOpen={cancelModalOpen}
      onCancelModalClose={() => setCancelModalOpen(false)}
      onCancelConfirm={() => {
        setTitle('');
        setContent('');
        setImageFile(null);
        setVideoFile(null);
        setPreview(null);
        setVideoPreview(null);
        setCategory('personal');
        setTab('write');
        router.push(sport ? `/community/sport/${sport}` : '/community');
      }}
      cancelModalTitle="작성 취소"
      cancelModalDescription="작성 중인 내용이 있습니다. 정말 나가시겠습니까?"
    />
  );
}
