"use client"

import { useState } from "react"
import { type FindRequest } from "@/lib/archive-types"
import { createArchiveSubmission, updateArchiveSubmission } from "@/lib/archive-submissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FindPostsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requests: FindRequest[]
  onRequestsChange: (requests: FindRequest[]) => void
}

export function FindPostsModal({ open, onOpenChange, requests, onRequestsChange }: FindPostsModalProps) {
  const updateRequests = (updater: (items: FindRequest[]) => FindRequest[]) => onRequestsChange(updater(requests))
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [comment, setComment] = useState<Record<string, string>>({})

  const submitRequest = () => {
    if (!title.trim() || !description.trim()) return
    const request: FindRequest = { id: crypto.randomUUID(), title: title.trim(), description: description.trim(), createdAt: new Date(), isApproved: false, status: "찾는중", comments: [] }
    updateRequests((items) => [request, ...items])
    void createArchiveSubmission(request).catch((error) => console.error("[v0] find request submission failed", error))
    setTitle(""); setDescription("")
  }
  const addComment = (requestId: string) => {
    const content = comment[requestId]?.trim()
    if (!content) return
    const commentItem = { id: crypto.randomUUID(), requestId, content, createdAt: new Date() }
    updateRequests((items) => items.map((request) => request.id !== requestId || request.status === "완료" ? request : { ...request, comments: [...request.comments, commentItem] }))
    void updateArchiveSubmission("findRequest", requestId, { comments: [...(requests.find((request) => request.id === requestId)?.comments ?? []), commentItem] }).catch((error) => console.error("[v0] comment sync failed", error))
    setComment((items) => ({ ...items, [requestId]: "" }))
  }
  const approved = requests.filter((request) => request.isApproved)

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
    <DialogHeader><DialogTitle className="text-2xl">포스타입을 찾습니다</DialogTitle><DialogDescription>작품의 설명을 작성하면 승인 후 등록되고, 댓글을 통해 공유할수 있습니다</DialogDescription></DialogHeader>
    <Tabs defaultValue="posts"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="posts">요청글 리스트</TabsTrigger><TabsTrigger value="submit">요청글 작성</TabsTrigger></TabsList>
      <TabsContent value="posts" className="flex flex-col gap-3">{approved.length === 0 ? <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">등록된 요청글이 없습니다.</CardContent></Card> : approved.map((request) => <Card key={request.id}><CardHeader className="pb-3"><div className="flex items-start justify-between gap-2"><div><CardTitle className="text-base">{request.title}</CardTitle><CardDescription>{request.createdAt.toLocaleDateString("ko-KR")}</CardDescription></div><Badge variant={request.status === "완료" ? "default" : "secondary"}>{request.status}</Badge></div></CardHeader><CardContent className="flex flex-col gap-3"><p className="text-sm">{request.description}</p><div className="border-t pt-3"><p className="mb-2 text-xs font-medium text-muted-foreground">댓글 ({request.comments.length})</p>{request.comments.map((item) => <div key={item.id} className="mb-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">{item.content}</div>)}{request.status === "완료" ? <p className="text-xs text-muted-foreground">완료된 요청에는 더 이상 댓글을 남길 수 없습니다</p> : <div className="flex gap-2"><Input placeholder="댓글을 남겨주세요" value={comment[request.id] || ""} onChange={(event) => setComment((items) => ({ ...items, [request.id]: event.target.value }))} /><Button size="sm" onClick={() => addComment(request.id)} disabled={!comment[request.id]?.trim()}>등록</Button></div>}</div></CardContent></Card>)}</TabsContent>
      <TabsContent value="submit"><Card><CardHeader><CardTitle className="text-base">요청글 작성</CardTitle></CardHeader><CardContent className="flex flex-col gap-3"><Input placeholder="제목" value={title} onChange={(event) => setTitle(event.target.value)} /><Textarea placeholder="찾는 작품 설명" value={description} onChange={(event) => setDescription(event.target.value)} /><Button onClick={submitRequest}>제출하기</Button><p className="text-xs text-muted-foreground">제출 후 관리자 승인 시 요청글 리스트에 표시됩니다.</p></CardContent></Card></TabsContent>
    </Tabs>
  </DialogContent></Dialog>
}
