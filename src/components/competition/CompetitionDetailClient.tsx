'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { getStatus } from '@/utils/formatDate';
import { handleShare } from '@/utils/share';
import type { Competition } from '@/types/competition';
import CompetitionDetailCard from '@/components/competition/CompetitionDetailCard';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';
import {
  canManageContent,
  type ContentUserRole,
} from '@/lib/contentPermissions';
import { Pencil, Trash2, Share2 } from 'lucide-react';
import { buildCompetitionUrl } from '@/lib/slug';
import { deleteManagedCompetition } from '@/actions/competition/competitions';

interface CompetitionDetailClientProps {
  competition: Competition;
  userId: string | null;
  currentUserRole: ContentUserRole;
}

export default function CompetitionDetailClient({
  competition,
  userId,
  currentUserRole,
}: CompetitionDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = competition;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const canManageCompetition = canManageContent({
    currentUserId: userId,
    authorUserId: competition.user_id,
    currentUserRole,
    authorRole: competition.role,
  });
  const status = getStatus(competition.apply_deadline);

  const handleDeletePost = async () => {
    try {
      const result = await deleteManagedCompetition(id);

      if (!result.success) {
        showErrorToast(result.message);
        return;
      }

      setDeleteModalOpen(false);
      showSuccessToast(result.message, '🗑️');
      await queryClient.invalidateQueries({ queryKey: ['competition'] });
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push('/competitions');
      router.refresh();
    } catch {
      showErrorToast('대회일정 삭제에 실패했습니다.');
    }
  };

  return (
    <section
      className="max-w-2xl mx-auto p-4 space-y-4"
      aria-label={`${competition.name} 대회 상세`}
    >
      <Link
        href="/competitions"
        aria-label="대회일정 목록으로 돌아가기"
        className="w-fit flex items-center gap-2 px-2.5 py-2 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer"
        style={{ background: 'var(--color-border-medium)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text-high)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        목록으로
      </Link>
      <CompetitionDetailCard
        data={{
          name: competition.name,
          image_url: competition.image_url,
          description: competition.description,
          event_data: competition.event_data,
          location: competition.location,
          apply_deadline: competition.apply_deadline,
          created_at: competition.created_at,
          nickname: competition.nickname,
          avatar_url: competition.avatar_url,
        }}
        headerActions={
          <>
            {canManageCompetition && (
              <>
                <button
                  type="button"
                  title="수정하기"
                  aria-label="대회 게시글 수정하기"
                  onClick={() =>
                    router.push(
                      `${buildCompetitionUrl(competition.name, id)}/edit`,
                    )
                  }
                  className="p-1 cursor-pointer"
                >
                  <Pencil
                    size={20}
                    className="text-white/40 hover:text-white/80 transition-colors light:text-black/40 light:hover:text-[#0f1117]"
                  />
                </button>
                <button
                  type="button"
                  title="삭제하기"
                  aria-label="대회 게시글 삭제하기"
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-1 cursor-pointer"
                >
                  <Trash2
                    size={20}
                    className="text-white/40 hover:text-red-400 transition-colors light:text-black/40"
                  />
                </button>
              </>
            )}
            <button
              type="button"
              title="공유하기"
              aria-label="대회 게시글 링크 공유하기"
              onClick={() => handleShare()}
              className="p-1 cursor-pointer"
            >
              <Share2 size={18} className="text-white/40 hover:text-white/80 transition-colors light:text-black/40 light:hover:text-[#0f1117]" />
            </button>
          </>
        }
      />
      <a
        href={competition.apply_url?.startsWith('http')
          ? competition.apply_url
          : `https://${competition.apply_url}`}
        target="_blank"
        rel="noopener noreferrer"
        {...(status === '모집완료' && { 'aria-disabled': true })}
        className={`block w-full py-4 text-center text-sm font-bold text-white rounded-2xl transition-all
          ${
            status === '모집완료'
              ? 'cursor-not-allowed pointer-events-none'
              : ''
          }`}
        style={
          status === '모집완료'
            ? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }
            : { background: '#2563eb', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }
        }
        onMouseEnter={(e) => {
          if (status !== '모집완료') (e.currentTarget as HTMLElement).style.background = '#1d4ed8';
        }}
        onMouseLeave={(e) => {
          if (status !== '모집완료') (e.currentTarget as HTMLElement).style.background = '#2563eb';
        }}
      >
        {status === '모집완료' ? '모집 완료' : '대회 신청하기'}
      </a>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="대회 게시글 삭제"
        description="정말 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
      />
    </section>
  );
}
