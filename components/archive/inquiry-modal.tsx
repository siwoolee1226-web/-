"use client"

import { useState } from "react"
import { createArchiveSubmission } from "@/lib/archive-submissions"
import { type AgeRelation, AGE_RELATIONS, FORMATS, type InquirySubmission, type PostFormat, type RegistrationRequest } from "@/lib/archive-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryModal({ open, onOpenChange }: InquiryModalProps) {
  const [submissions, setSubmissions] = useState<Array<InquirySubmission | RegistrationRequest>>([])
  const [adminMode, setAdminMode] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [inquiry, setInquiry] = useState({ title: "", content: "" })
  const [registration, setRegistration] = useState({
    title: "",
    author: "",
    link: "",
    ageRelation: "" as AgeRelation | "",
    genres: "",
    rating: "" as "성인" | "전연령" | "",
    format: "" as PostFormat | "",
    content: "",
  })

  const resetFeedback = () => setSubmitted(false)

  const submitInquiry = () => {
    if (!inquiry.title.trim() || !inquiry.content.trim()) return
    const payload: InquirySubmission = { id: crypto.randomUUID(), type: "inquiry", ...inquiry, createdAt: new Date() }
    setSubmissions((prev) => [...prev, payload])
    void createArchiveSubmission(payload).catch((error) => console.error("[v0] inquiry submission failed", error))
    setInquiry({ title: "", content: "" })
    setSubmitted(true)
  }

  const submitRegistration = () => {
    if (!registration.title.trim() || !registration.author.trim() || !registration.link.trim()) return
    const payload: RegistrationRequest = {
        id: crypto.randomUUID(),
        type: "registration",
        title: registration.title,
        content: registration.content || "작품 등록 요청",
        author: registration.author,
        link: registration.link,
        ageRelation: registration.ageRelation || null,
        genres: registration.genres.split(",").map((item) => item.trim()).filter(Boolean),
        rating: registration.rating || null,
        format: registration.format || "단편",
        createdAt: new Date(),
      }
    setSubmissions((prev) => [...prev, payload])
    void createArchiveSubmission(payload).catch((error) => console.error("[v0] registration submission failed", error))
    setRegistration({ title: "", author: "", link: "", ageRelation: "", genres: "", rating: "", format: "", content: "" })
    setSubmitted(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>건의/문의 및 작품 등록 요청</DialogTitle>
          <DialogDescription>서비스에 대한 의견을 보내거나 작품 등록을 요청해주세요.</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium text-foreground">제출이 완료되었습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">관리자가 확인 후 반영하겠습니다.</p>
              <Button className="mt-5" variant="outline" onClick={resetFeedback}>새로운 내용 작성</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="inquiry">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inquiry">건의/문의사항</TabsTrigger>
              <TabsTrigger value="registration">작품 등록 요청</TabsTrigger>
            </TabsList>

            <TabsContent value="inquiry">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">문의사항 보내기</CardTitle>
                  <CardDescription>궁금한 점이나 개선 의견을 남겨주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1"><Label htmlFor="inquiry-title">제목</Label><Input id="inquiry-title" value={inquiry.title} onChange={(e) => setInquiry({ ...inquiry, title: e.target.value })} /></div>
                  <div className="space-y-1"><Label htmlFor="inquiry-content">내용</Label><Textarea id="inquiry-content" className="min-h-32" value={inquiry.content} onChange={(e) => setInquiry({ ...inquiry, content: e.target.value })} /></div>
                  <Button onClick={submitInquiry} className="w-full">제출하기</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registration">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">작품 등록 요청</CardTitle>
                  <CardDescription>아는 작품을 아카이브에 추가해주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1"><Label htmlFor="reg-title">작품 제목 *</Label><Input id="reg-title" value={registration.title} onChange={(e) => setRegistration({ ...registration, title: e.target.value })} /></div>
                    <div className="space-y-1"><Label htmlFor="reg-author">작가 *</Label><Input id="reg-author" value={registration.author} onChange={(e) => setRegistration({ ...registration, author: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1"><Label htmlFor="reg-link">작품 링크 *</Label><Input id="reg-link" type="url" placeholder="https://" value={registration.link} onChange={(e) => setRegistration({ ...registration, link: e.target.value })} /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1"><Label htmlFor="reg-age">나이/관계 성향</Label><select id="reg-age" value={registration.ageRelation} onChange={(e) => setRegistration({ ...registration, ageRelation: e.target.value as AgeRelation | "" })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">선택해주세요</option>{AGE_RELATIONS.map((age) => <option key={age} value={age}>{age}</option>)}</select></div>
                    <div className="space-y-1"><Label htmlFor="reg-genres">장르/태그</Label><Input id="reg-genres" placeholder="쉼표로 구분" value={registration.genres} onChange={(e) => setRegistration({ ...registration, genres: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1"><Label htmlFor="reg-rating">수위</Label><select id="reg-rating" value={registration.rating} onChange={(e) => setRegistration({ ...registration, rating: e.target.value as "성인" | "전연령" | "" })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">선택해주세요</option><option value="전연령">전연령</option><option value="성인">성인</option></select></div>
                    <div className="space-y-1"><Label htmlFor="reg-format">분량</Label><select id="reg-format" value={registration.format} onChange={(e) => setRegistration({ ...registration, format: e.target.value as PostFormat | "" })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">선택해주세요</option>{FORMATS.map((format) => <option key={format} value={format}>{format}</option>)}</select></div>
                  </div>
                  <div className="space-y-1"><Label htmlFor="reg-content">추가 설명</Label><Textarea id="reg-content" value={registration.content} onChange={(e) => setRegistration({ ...registration, content: e.target.value })} /></div>
                  <Button onClick={submitRegistration} className="w-full">등록 요청 제출</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

      </DialogContent>
    </Dialog>
  )
}
