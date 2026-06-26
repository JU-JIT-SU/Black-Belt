'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Post, PostCategory } from '@/types/community';
import { updatePost, uploadPostImage, uploadPostVideo } from '@/services/communityService';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { buildPostUrl } from '@/lib/slug';
import PostFormBase from '@/components/community/PostFormBase';

interface Props {
  id: string;
  initialPost: Post;
}

export default function EditClient({ id, initialPost }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(initialPost.title);
  const [content, setContent] = useState(initialPost.content);
  const [category] = useState<PostCategory>(initialPost.category);
  const [preview, setPreview] = useState<string | null>(initialPost.image_url ?? null);
  const [videoPreview, setVideoPreview] = useState<string | null>(initialPost.video_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [videoRemoved, setVideoRemoved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const isDirty =
    title !== initialPost.title ||
    content !== initialPost.content ||
    imageFile !== null ||
    imageRemoved ||
    videoFile !== null ||
    videoRemoved;

  useBeforeUnload(isDirty);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      showErrorToast('제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (!isDirty) {
      showErrorToast('수정된 내용이 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const image_url = imageFile
        ? await uploadPostImage(imageFile)
        : imageRemoved ? null : undefined;
      const video_url = videoFile
        ? await uploadPostVideo(videoFile)
        : videoRemoved ? null : undefined;

      await updatePost(id, { title, content, image_url, video_url });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSuccessToast('게시글이 수정되었습니다.', '✅');
      await new Promise((resolve) => setTimeout(resolve, 700));

      setTitle(title);
      setContent(content);
      setPreview(image_url ?? preview);
      setVideoPreview(video_url ?? videoPreview);
      setImageFile(null);
      setVideoFile(null);
      setIsLoading(false);
      router.refresh();
      router.push(buildPostUrl(title, id));
    } catch {
      showErrorToast('게시글 수정에 실패했습니다.');
      setIsLoading(false);
    }
  };

  const categorySection = (
    <div
      aria-label={`게시글 유형: ${category === 'promo' ? '도장 홍보' : category === 'notice' ? '공지' : '일반 게시글'}`}
      className="py-2 px-3 rounded-lg text-sm font-medium text-center"
      style={{ background: 'var(--color-bg-tint)', color: 'var(--color-text-primary)' }}
    >
      {category === 'promo'
        ? '도장 홍보'
        : category === 'notice'
          ? '공지'
          : '일반 게시글'}
    </div>
  );

  return (
    <PostFormBase
      pageTitle="게시글 수정"
      title={title}
      onTitleChange={setTitle}
      content={content}
      onContentChange={setContent}
      imagePreview={preview}
      onImageChange={(file, previewUrl) => {
        setImageFile(file);
        setPreview(previewUrl);
        setImageRemoved(false);
      }}
      onImageRemove={() => {
        setImageFile(null);
        setPreview(null);
        setImageRemoved(true);
      }}
      videoPreview={videoPreview}
      onVideoChange={(file, previewUrl) => {
        setVideoFile(file);
        setVideoPreview(previewUrl);
        setVideoRemoved(false);
      }}
      onVideoRemove={() => {
        setVideoFile(null);
        setVideoPreview(null);
        setVideoRemoved(true);
      }}
      categorySection={categorySection}
      onCancel={() => {
        if (isDirty) {
          setCancelModalOpen(true);
        } else {
          showErrorToast('수정된 내용이 없습니다.');
          router.push(buildPostUrl(initialPost.title, id));
        }
      }}
      onSubmit={handleSubmit}
      submitLabel="수정하기"
      isLoading={isLoading}
      cancelModalOpen={cancelModalOpen}
      onCancelModalClose={() => setCancelModalOpen(false)}
      onCancelConfirm={() => {
        setTitle(initialPost.title);
        setContent(initialPost.content);
        setPreview(initialPost.image_url ?? null);
        setVideoPreview(initialPost.video_url ?? null);
        setImageFile(null);
        setVideoFile(null);
        router.push(buildPostUrl(initialPost.title, id));
      }}
      cancelModalTitle="수정 취소"
      cancelModalDescription="수정 중인 내용이 있습니다. 정말 나가시겠습니까?"
    />
  );
}
