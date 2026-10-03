"use client"

import { ExternalLink, Heart } from "lucide-react"
import type { ArchivePost } from "@/lib/archive-types"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface PostCardProps {
  post: ArchivePost
  bookmarked: boolean
  onToggleBookmark: (id: string) => void
  onTagClick: (tag: string) => void
  memo: string
  onMemoChange: (id: string, value: string) => void
}

export function PostCard({ post, bookmarked, onToggleBookmark, onTagClick, memo, onMemoChange }: PostCardProps) {
  const initial = post.author.trim().charAt(0) || "?"

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      {/* Top row: status badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone={post.isCompleted ? "success" : "primary"}>
          {post.isCompleted ? "완결" : "연재중"}
        </Badge>
        <Badge tone={post.isAdult ? "adult" : "muted"}>{post.isAdult ? "성인" : "전연령"}</Badge>
        <Badge tone="outline">{post.format}</Badge>
        {post.onlyJemJen && <Badge tone="neutral">잼젠</Badge>}
      </div>

      {/* Title */}
      <h3 className="mt-3 text-balance text-base font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary">
        {post.title}
      </h3>

      {/* Author */}
      <div className="mt-2 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
        >
          {initial}
        </span>
        <span className="text-sm text-muted-foreground">{post.author}</span>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.slice(0, 3).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag)}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Memo */}
      <input
        type="text"
        value={memo}
        onChange={(e) => onMemoChange(post.id, e.target.value)}
        maxLength={30}
        placeholder="메모 추가 (최대 30자)"
        className="mt-3 h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/50"
      />

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => onToggleBookmark(post.id)}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border border-border transition-colors",
            bookmarked
              ? "border-primary/40 bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Heart className="size-4" fill={bookmarked ? "currentColor" : "none"} />
        </button>

        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Postype에서 읽기
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  )
}
