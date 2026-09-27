"use client"

import { RotateCcw } from "lucide-react"
import {
  AGE_RELATIONS,
  type AgeRelation,
  type Filters,
  FORMATS,
  GENRES,
  type PostFormat,
  type SortOption,
} from "@/lib/archive-types"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  filters: Filters
  onChange: (next: Filters) => void
  onReset: () => void
  activeCount: number
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{children}</h3>
}

export function FilterPanel({ filters, onChange, onReset, activeCount }: FilterPanelProps) {
  const toggleInArray = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

  return (
    <aside className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-card-foreground">필터</h2>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
        >
          <RotateCcw className="size-3" />
          초기화{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      {/* Only 잼젠 */}
      <div>
        <SectionTitle>Only 잼젠 </SectionTitle>
        <div className="flex gap-2">
          <Toggle
            active={filters.onlyJemJen === true}
            onClick={() => onChange({ ...filters, onlyJemJen: filters.onlyJemJen === true ? null : true })}
          >
            O
          </Toggle>
          <Toggle
            active={filters.onlyJemJen === false}
            onClick={() => onChange({ ...filters, onlyJemJen: filters.onlyJemJen === false ? null : false })}
          >
            X
          </Toggle>
        </div>
      </div>

      {/* 나이 관계 (multi) */}
      <div>
        <SectionTitle>나이 관계</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {AGE_RELATIONS.map((age) => (
            <Toggle
              key={age}
              active={filters.ageRelations.includes(age)}
              onClick={() =>
                onChange({ ...filters, ageRelations: toggleInArray<AgeRelation>(filters.ageRelations, age) })
              }
            >
              {age}
            </Toggle>
          ))}
        </div>
      </div>

      {/* 수위 (single) */}
      <div>
        <SectionTitle>수위</SectionTitle>
        <div className="flex gap-2">
          {(["성인", "전연령"] as const).map((option) => (
            <Toggle
              key={option}
              active={filters.adult === option}
              onClick={() => onChange({ ...filters, adult: filters.adult === option ? null : option })}
            >
              {option}
            </Toggle>
          ))}
        </div>
      </div>

      {/* 분량 (multi) */}
      <div>
        <SectionTitle>분량</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((format) => (
            <Toggle
              key={format}
              active={filters.formats.includes(format)}
              onClick={() => onChange({ ...filters, formats: toggleInArray<PostFormat>(filters.formats, format) })}
            >
              {format}
            </Toggle>
          ))}
        </div>
      </div>

      {/* 장르/키워드 (multi) */}
      <div>
        <SectionTitle>장르 / 키워드</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((genre) => (
            <Toggle
              key={genre}
              active={filters.genres.includes(genre)}
              onClick={() => onChange({ ...filters, genres: toggleInArray<string>(filters.genres, genre) })}
            >
              {genre}
            </Toggle>
          ))}
        </div>
      </div>

      {/* 제외 키워드 */}
      <div>
        <SectionTitle>제외 키워드</SectionTitle>
        <input
          type="text"
          value={filters.excludeKeywords}
          onChange={(event) => onChange({ ...filters, excludeKeywords: event.target.value })}
          placeholder="쉼표로 구분해 입력"
          aria-label="제외 키워드"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      {/* 정렬 */}
      <div>
        <SectionTitle>정렬</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "popular", label: "등록순" },
              { value: "latest", label: "최신순" },
              { value: "hit", label: "HIT" },
            ] as { value: SortOption; label: string }[]
          ).map((sort) => (
            <Toggle
              key={sort.value}
              active={filters.sort === sort.value}
              onClick={() => onChange({ ...filters, sort: sort.value })}
            >
              {sort.label}
            </Toggle>
          ))}
        </div>
      </div>
    </aside>
  )
}
