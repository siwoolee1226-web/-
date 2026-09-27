"use client"

import { useEffect, useState } from "react"
import { ARCHIVE_WEBHOOK_URL, deleteArchiveSubmission, fetchArchiveSubmissions, updateArchiveSubmission } from "@/lib/archive-submissions"
import { Check, MessageSquare, ShieldCheck, Trash2, X } from "lucide-react"
import type { FindRequest, InquirySubmission, RegistrationRequest } from "@/lib/archive-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminDashboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  findRequests: FindRequest[]
  onFindRequestsChange: (requests: FindRequest[]) => void
}

const initialFindRequests: FindRequest[] = [
  { id: "admin-1", title: "경찰물 단편 찾습니다", description: "경찰 배경의 단편 작품을 찾고 있습니다.", createdAt: new Date("2024-01-15"), isApproved: false, status: "찾는중", comments: [{ id: "comment-1", requestId: "admin-1", content: "비슷한 작품을 확인해볼게요.", createdAt: new Date("2024-01-16") }] },
  { id: "admin-2", title: "오메가버스 추천 받습니다", description: "최근 발행된 오메가버스 작품 추천 부탁드립니다.", createdAt: new Date("2024-01-10"), isApproved: true, status: "찾는중", comments: [] },
]

const initialRegistrations: RegistrationRequest[] = [
  { id: "registration-1", type: "registration", title: "밤의 정원", content: "현대 판타지 작품입니다.", createdAt: new Date("2024-02-01"), author: "작가님", link: "https://example.com", ageRelation: "동갑", genres: ["현대판타지"], rating: "전연령", format: "장편" },
]

const initialInquiries: InquirySubmission[] = [
  { id: "inquiry-1", type: "inquiry", title: "태그 추가 건의", content: "새로운 태그를 추가해주실 수 있을까요?", createdAt: new Date("2024-02-03") },
]

export function AdminDashboard({ open, onOpenChange, findRequests, onFindRequestsChange }: AdminDashboardProps) {
  const updateSharedRequests = (updater: (items: FindRequest[]) => FindRequest[]) => onFindRequestsChange(updater(findRequests))
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>(initialRegistrations)
  const [inquiries, setInquiries] = useState<InquirySubmission[]>(initialInquiries)

  useEffect(() => {
    if (!open || !ARCHIVE_WEBHOOK_URL) return
    void fetchArchiveSubmissions().then((snapshot) => {
      if (snapshot.findRequests.length) onFindRequestsChange(snapshot.findRequests)
      setRegistrations(snapshot.submissions.filter((item): item is RegistrationRequest => item.type === "registration"))
      setInquiries(snapshot.submissions.filter((item): item is InquirySubmission => item.type === "inquiry"))
    }).catch((error) => console.error("[v0] admin inbox fetch failed", error))
  }, [open])

  const updateRequest = (id: string, update: Partial<FindRequest>) => {
    updateSharedRequests((items) => items.map((item) => (item.id === id ? { ...item, ...update } : item)))
    void updateArchiveSubmission("findRequest", id, update).catch((error) => console.error("[v0] request update failed", error))
  }

  const deleteRequest = (id: string) => {
    updateSharedRequests((items) => items.filter((item) => item.id !== id))
    void deleteArchiveSubmission("findRequest", id).catch((error) => console.error("[v0] request deletion failed", error))
  }

  const removeComment = (requestId: string, commentId: string) => {
    updateSharedRequests((items) => items.map((item) => item.id === requestId ? { ...item, comments: item.comments.filter((comment) => comment.id !== commentId) } : item))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <DialogTitle>시크릿 관리자 대시보드</DialogTitle>
          </div>
          <DialogDescription>승인, 상태 변경, 삭제 작업은 이 화면의 Mock 상태에 즉시 반영됩니다.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="find">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find">포스타입 관리</TabsTrigger>
            <TabsTrigger value="registration">작품 등록 수신함</TabsTrigger>
            <TabsTrigger value="inquiry">건의/문의 수신함</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="flex flex-col gap-3">
            {findRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div><CardTitle className="text-base">{request.title}</CardTitle><CardDescription>{request.description}</CardDescription></div>
                    <Badge variant={request.status === "완료" ? "default" : "secondary"}>{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {request.isApproved ? <Badge variant="outline"><Check data-icon="inline-start" />승인됨</Badge> : <Button size="sm" onClick={() => updateRequest(request.id, { isApproved: true })}><Check data-icon="inline-start" />승인</Button>}
                    {!request.isApproved && <Button size="sm" variant="outline" onClick={() => deleteRequest(request.id)}><X data-icon="inline-start" />거절</Button>}
                    <Button size="sm" variant="outline" onClick={() => updateRequest(request.id, { status: request.status === "완료" ? "찾는중" : "완료" })}>{request.status === "완료" ? "찾는중으로 변경" : "완료로 변경"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRequest(request.id)}><Trash2 data-icon="inline-start" />삭제</Button>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium"><MessageSquare className="size-4" />댓글/답글 ({request.comments.length})</p>
                    {request.comments.length === 0 ? <p className="text-xs text-muted-foreground">작성된 댓글이 없습니다.</p> : <div className="flex flex-col gap-2">{request.comments.map((comment) => <div key={comment.id} className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 text-sm"><span>{comment.content}</span><Button size="icon" variant="ghost" className="size-7" onClick={() => removeComment(request.id, comment.id)} aria-label="댓글 삭제"><Trash2 /></Button></div>)}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {findRequests.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">관리할 요청글이 없습니다.</p>}
          </TabsContent>

          <TabsContent value="registration" className="flex flex-col gap-3">
            {registrations.map((request) => <Card key={request.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{request.title}</CardTitle><CardDescription>{request.author} · {request.createdAt.toLocaleString("ko-KR")}</CardDescription></div><Badge>{request.format}</Badge></div></CardHeader><CardContent className="flex flex-col gap-3 text-sm"><div className="grid gap-2 sm:grid-cols-2"><p>나이/관계: {request.ageRelation ?? "미입력"}</p><p>수위: {request.rating ?? "미입력"}</p><p>장르: {request.genres.join(", ") || "미입력"}</p><a href={request.link} target="_blank" rel="noreferrer" className="text-primary underline">작품 링크 열기</a></div><p className="text-muted-foreground">{request.content}</p><Button className="self-end" size="sm" variant="outline" onClick={() => { setRegistrations((items) => items.filter((item) => item.id !== request.id)); void deleteArchiveSubmission("submission", request.id).catch((error) => console.error("[v0] registration deletion failed", error)) }}><Trash2 data-icon="inline-start" />확인 완료 후 삭제</Button></CardContent></Card>)}
            {registrations.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">받은 작품 등록 요청이 없습니다.</p>}
          </TabsContent>

          <TabsContent value="inquiry" className="flex flex-col gap-3">
            {inquiries.map((inquiry) => <Card key={inquiry.id}><CardHeader><CardTitle className="text-base">{inquiry.title}</CardTitle><CardDescription>{inquiry.createdAt.toLocaleString("ko-KR")}</CardDescription></CardHeader><CardContent className="flex items-end justify-between gap-3"><p className="text-sm text-muted-foreground">{inquiry.content}</p><Button size="sm" variant="outline" onClick={() => { setInquiries((items) => items.filter((item) => item.id !== inquiry.id)); void deleteArchiveSubmission("submission", inquiry.id).catch((error) => console.error("[v0] inquiry deletion failed", error)) }}><Trash2 data-icon="inline-start" />처리 완료</Button></CardContent></Card>)}
            {inquiries.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">받은 건의 및 문의가 없습니다.</p>}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
