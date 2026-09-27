"use client"

import { useState } from "react"
import type { FindRequest, InquirySubmission, RegistrationRequest } from "@/lib/archive-types"
import { BookHeart, KeyRound, Megaphone, Moon, Search, Send, Shuffle, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FindPostsModal } from "./find-posts-modal"
import { AdminDashboard } from "./admin-dashboard"
import { InquiryModal } from "./inquiry-modal"
import { useTheme } from "./use-theme"

interface HeaderProps {
  query: string
  onQueryChange: (value: string) => void
  bookmarkCount: number
  onRandom: () => void
  showOnlyBookmarks: boolean
  onToggleShowBookmarks: () => void
  findRequests: FindRequest[]
  onFindRequestsChange: (requests: FindRequest[]) => void
}

export function Header({
  query,
  onQueryChange,
  bookmarkCount,
  onRandom,
  showOnlyBookmarks,
  onToggleShowBookmarks,
  findRequests,
  onFindRequestsChange,
}: HeaderProps) {

  const { theme, toggleTheme, mounted } = useTheme()
  const [findOpen, setFindOpen] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)

  const verifyAdmin = () => {
    if (password === "siwoo1226!") {
      setPasswordError(false)
      setPassword("")
      setLoginOpen(false)
      setAdminOpen(true)
    } else {
      setPasswordError(true)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => { setPasswordError(false); setLoginOpen(true) }} className="cursor-pointer text-left leading-tight" aria-label="관리자 로그인">
            <span className="block text-base font-bold text-foreground">JJ Archive</span>
            <span className="block text-xs text-muted-foreground">잼젠포타검색기</span>
          </button>
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

          <Button type="button" variant="outline" size="icon" onClick={toggleTheme} aria-label="라이트/다크 모드 전환">
            {mounted && theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <Button type="button" variant="outline" size="icon" onClick={() => setFindOpen(true)} aria-label="포스타입을 찾습니다">
            <Megaphone />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => setInquiryOpen(true)} aria-label="문의 및 등록요청">
            <Send />
          </Button>
        </div>
      </div>
      <FindPostsModal open={findOpen} onOpenChange={setFindOpen} requests={findRequests} onRequestsChange={onFindRequestsChange} />
      <InquiryModal open={inquiryOpen} onOpenChange={setInquiryOpen} />
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>관리자 인증</DialogTitle><DialogDescription>관리자 비밀번호를 입력하세요.</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-3">
            <Input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(false) }} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) verifyAdmin() }} placeholder="비밀번호" aria-invalid={passwordError} />
            {passwordError && <p className="text-sm text-destructive" role="alert">비밀번호가 올바르지 않습니다.</p>}
            <Button onClick={verifyAdmin}><KeyRound data-icon="inline-start" />확인</Button>
          </div>
        </DialogContent>
      </Dialog>
      <AdminDashboard open={adminOpen} onOpenChange={setAdminOpen} findRequests={findRequests} onFindRequestsChange={onFindRequestsChange} />
      <div className="border-t border-border/60 bg-muted/30 px-4 py-1.5 text-center text-xs text-muted-foreground">
        문의 및 건의 사항 @endeulim4
      </div>
    </header>
  )
}
