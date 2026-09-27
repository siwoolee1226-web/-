"use client"

import { useEffect, useMemo, useState } from "react"
import { Sparkles, X } from "lucide-react"
import { type ArchivePost, DEFAULT_FILTERS, type Filters } from "@/lib/archive-types"
import { FilterPanel } from "./filter-panel"
import { Header } from "./header"
import { PostCard } from "./post-card"

const PAGE_SIZE = 9

interface ArchiveDashboardProps {
  initialPosts: ArchivePost[]
  initialUsedMock: boolean
}

export function ArchiveDashboard({ initialPosts, initialUsedMock }: ArchiveDashboardProps) {
  const [posts, setPosts] = useState<ArchivePost[]>(initialPosts)
  const usedMock = initialUsedMock
  const [findRequests, setFindRequests] = useState<import("@/lib/archive-types").FindRequest[]>([])

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
const [bookmarksLoaded, setBookmarksLoaded] = useState(false)

// Load saved bookmarks from this device on first mount
useEffect(() => {
  try {
    const raw = localStorage.getItem("hq-archive-bookmarks")
    if (raw) setBookmarks(new Set(JSON.parse(raw)))
  } catch {
    // ignore malformed/missing data
  } finally {
    setBookmarksLoaded(true)
  }
}, [])
// Persist bookmarks to this device whenever they change
useEffect(() => {
  if (!bookmarksLoaded) return
  localStorage.setItem("hq-archive-bookmarks", JSON.stringify([...bookmarks]))
}, [bookmarks, bookmarksLoaded])

const [readPosts, setReadPosts] = useState<Set<string>>(new Set())
const [readLoaded, setReadLoaded] = useState(false)

useEffect(() => {
  try {
    const raw = localStorage.getItem("hq-archive-read")
    if (raw) setReadPosts(new Set(JSON.parse(raw)))
  } catch {
  } finally {
    setReadLoaded(true)
  }
}, [])

useEffect(() => {
  if (!readLoaded) return
  localStorage.setItem("hq-archive-read", JSON.stringify([...readPosts]))
}, [readPosts, readLoaded])

const toggleRead = (id: string) => {
  setReadPosts((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
}

 const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [memos, setMemos] = useState<Record<string, string>>({})
  const [memosLoaded, setMemosLoaded] = useState(false)
  const [showOnlyMemos, setShowOnlyMemos] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hq-archive-memos")
      if (raw) setMemos(JSON.parse(raw))
    } catch {
      // ignore malformed/missing data
    } finally {
      setMemosLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!memosLoaded) return
    localStorage.setItem("hq-archive-memos", JSON.stringify(memos))
  }, [memos, memosLoaded])

  const updateMemo = (id: string, value: string) => {
    setMemos((prev) => {
      const next = { ...prev }
      const trimmed = value.slice(0, 30)
      if (trimmed.trim()) next[id] = trimmed
      else delete next[id]
      return next
    })
  }
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [randomPick, setRandomPick] = useState<ArchivePost | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "").replace(/\s+/g, "")
    const result = posts.filter((post) => {
      if (showOnlyBookmarks && !bookmarks.has(post.id)) return false
      if (showOnlyMemos && !memos[post.id]) return false
      const haystack = [post.title, post.description ?? "", post.author, ...post.genres, ...post.tags].join(" ").toLowerCase().replace(/\s+/g, "")
      if (q && !haystack.includes(q)) return false
      const excludeKeywords = filters.excludeKeywords
        .split(",")
        .map((keyword) => keyword.trim().toLowerCase().replace(/\s+/g, ""))
        .filter(Boolean)
      if (excludeKeywords.some((keyword) => haystack.includes(keyword))) return false
      if (filters.onlyJemJen !== null && post.onlyJemJen !== filters.onlyJemJen) return false
      if (filters.ageRelations.length > 0 && (!post.ageRelation || !filters.ageRelations.includes(post.ageRelation)))
        return false
      if (filters.adult === "성인" && !post.isAdult) return false
      if (filters.adult === "전연령" && post.isAdult) return false
      if (filters.formats.length > 0 && !filters.formats.includes(post.format)) return false
      if (filters.genres.length > 0 && !filters.genres.some((g) => post.genres.includes(g) || post.tags.includes(g)))
        return false
      return true
    })

    if (filters.sort === "hit") {
      result.sort((a, b) => {
        const hitA = a.isHit ? 1 : 0
        const hitB = b.isHit ? 1 : 0
        if (hitA !== hitB) return hitB - hitA
        return Number(b.id) - Number(a.id)
      })
    } else if (filters.sort === "latest") {
      result.sort((a, b) => Number(b.id) - Number(a.id))
    } else {
      // "등록순" — bookmarked first, then by id as a stable proxy
      result.sort((a, b) => {
        const bmA = bookmarks.has(a.id) ? 1 : 0
        const bmB = bookmarks.has(b.id) ? 1 : 0
        if (bmA !== bmB) return bmB - bmA
        return Number(a.id) - Number(b.id)
      })
    }
    return result
  }, [posts, query, filters, bookmarks, showOnlyBookmarks, memos, showOnlyMemos])

  // Reset pagination whenever the result set changes
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [query, filters])

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleTagClick = (tag: string) => {
    setFilters((prev) =>
      prev.genres.includes(tag) ? prev : { ...prev, genres: [...prev.genres, tag] },
    )
  }

  const handleRandom = () => {
    const pool = filtered.length > 0 ? filtered : posts
    if (pool.length === 0) return
    setRandomPick(pool[Math.floor(Math.random() * pool.length)])
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = []
    if (filters.sort === "hit")
      chips.push({ label: "HIT 정렬", clear: () => setFilters((f) => ({ ...f, sort: "latest" })) })
    if (filters.onlyJemJen !== null)
      chips.push({
        label: `잼젠 ${filters.onlyJemJen ? "O" : "X"}`,
        clear: () => setFilters((f) => ({ ...f, onlyJemJen: null })),
      })
    filters.ageRelations.forEach((age) =>
      chips.push({
        label: age,
        clear: () => setFilters((f) => ({ ...f, ageRelations: f.ageRelations.filter((v) => v !== age) })),
      }),
    )
    if (filters.adult)
      chips.push({ label: filters.adult, clear: () => setFilters((f) => ({ ...f, adult: null })) })
    filters.formats.forEach((format) =>
      chips.push({
        label: format,
        clear: () => setFilters((f) => ({ ...f, formats: f.formats.filter((v) => v !== format) })),
      }),
    )
    filters.excludeKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .forEach((keyword) =>
        chips.push({
          label: `제외: ${keyword}`,
          clear: () =>
            setFilters((f) => ({
              ...f,
              excludeKeywords: f.excludeKeywords
                .split(",")
                .map((value) => value.trim())
                .filter((value) => value && value !== keyword)
                .join(", "),
            })),
        }),
      )
    filters.genres.forEach((genre) =>
      chips.push({
        label: genre,
        clear: () => setFilters((f) => ({ ...f, genres: f.genres.filter((v) => v !== genre) })),
      }),
    )
    return chips
  }, [filters])

  const shown = filtered.slice(0, visible)

  return (
    <div className="min-h-screen bg-background">
      <Header
        query={query}
        onQueryChange={setQuery}
        bookmarkCount={bookmarks.size}
        onRandom={handleRandom}
        showOnlyBookmarks={showOnlyBookmarks}
        onToggleShowBookmarks={() => setShowOnlyBookmarks((prev) => !prev)}
        findRequests={findRequests}
        onFindRequestsChange={setFindRequests}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {usedMock && (
          <p className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            외부 CSV를 불러오지 못해 예시 데이터를 표시하고 있습니다. 환경 변수{" "}
            <code className="font-mono text-foreground">NEXT_PUBLIC_ARCHIVE_CSV_URL</code>을 설정하면 실제 데이터가
            연동됩니다.
          </p>
        )}

        {randomPick && (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
             <div className="flex flex-col gap-1">
                <p className="text-sm text-foreground">
                  오늘의 추천: <span className="font-bold">{randomPick.title}</span>{" "}
                  <span className="text-muted-foreground">· {randomPick.author}</span>
                </p>
                {randomPick.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {randomPick.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={randomPick.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                읽으러 가기
              </a>
              <button
                type="button"
                onClick={() => setRandomPick(null)}
                aria-label="추천 닫기"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
<div className={showFilters ? "grid gap-6 lg:grid-cols-[280px_1fr]" : "grid gap-6"}>
          {showFilters && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                activeCount={activeChips.length}
              />
            </div>
          )}

          <section>
            {/* Active filters bar */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
              >
                {showFilters ? "필터 숨기기" : "필터 보이기"}
              </button>
              <button
                type="button"
                onClick={() => setShowOnlyMemos((prev) => !prev)}
                className={
                  showOnlyMemos
                    ? "rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors"
                    : "rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40"
                }
              >
                메모 모아보기
              </button>
              <span className="text-sm text-muted-foreground">
                총 <span className="font-bold text-foreground">{filtered.length}</span>개 작품
              </span>  
              {activeChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {chip.label}
                  <X className="size-3" />
                </button>
              ))}
              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  초기화
                </button>
              )}
            </div>

            {shown.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-24 text-center text-muted-foreground">
                조건에 맞는 작품이 없습니다.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      bookmarked={bookmarks.has(post.id)}
                      onToggleBookmark={toggleBookmark}
                      onTagClick={handleTagClick}
                      memo={memos[post.id] || ""}
                      onMemoChange={updateMemo}
                      isRead={readPosts.has(post.id)}
                      onToggleRead={toggleRead}
                    />
                  ))}
                </div>

                {visible < filtered.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      더보기 ({filtered.length - visible}개 남음)
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
