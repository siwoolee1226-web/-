"use client"

import { BookHeart, Moon, Search, Shuffle, Sun } from "lucide-react"
import { useTheme } from "./use-theme"

interface HeaderProps {
  query: string
  onQueryChange: (value: string) => void
  bookmarkCount: number
  onRandom: () => void
  showOnlyBookmarks: boolean
  onToggleShowBookmarks: () => void
}

export function Header({
  query,
  onQueryChange,
  bookmarkCount,
  onRandom,
  showOnlyBookmarks,
  onToggleShowBookmarks,
}: HeaderProps) {

  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="leading-tight">
            <p className="text-base font-bold text-foreground">JJ Archive</p>
            <p className="text-xs text-muted-foreground">잼젠포타검색기</p>
          </div>
        </div>
        {/* Search */}
        <div className="relative flex-1 md:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="제목, 작가, 태그 검색..."
            aria-label="작품 검색"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRandom}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Shuffle className="size-4" />
            <span>랜덤 추천</span>
          </button>
<button
            type="button"
            onClick={onToggleShowBookmarks}
            aria-pressed={showOnlyBookmarks}
            className={
              showOnlyBookmarks
                ? "inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors"
                : "inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
            }
          >
            <BookHeart className="size-4" />
            즐겨찾기 {bookmarkCount}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="라이트/다크 모드 전환"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
          >
            {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
      <div className="border-t border-border/60 bg-muted/30 px-4 py-1.5 text-center text-xs text-muted-foreground">
        문의 및 건의 사항 @endeulim4
      </div>
    </header>
  )
}
