export type AgeRelation = "연상연하" | "동갑" | "연하연상"
export type PostFormat = "단편" | "장편"

export interface ArchivePost {
  id: string
  title: string
  description?: string
  author: string
  isAdult: boolean
  format: PostFormat
  isCompleted: boolean
  onlyJemJen: boolean
  isHit?: boolean
  ageRelation: AgeRelation | null
  genres: string[]
  tags: string[]
  link: string
}

export const AGE_RELATIONS: AgeRelation[] = ["연상연하", "동갑", "연하연상"]

export const FORMATS: PostFormat[] = ["단편", "장편"]

export const GENRES: string[] = [
  "수인물",
  "au",
  "시대물",
  "현대판타지",
  "일상물",
  "잼짝젠",
  "젠짝잼",
  "오메가버스",
  "쌍방삽질",
  "싱글대디",
  "센티넬버스",
  "캠게",
  "청게",
  "리맨",
  "입헌군주제",
  "아포칼립스",
  "이별물",
  "친구에서연인",
  "혐관",
  "계약",
  "종교",
  "오컬트",
  "sf",
  "연예계",
  "사별",
  "후회물",
  "근친",
  "로코",
  "느와르",
  "인외",
  "만화",
  "스포츠",
  "전문직",
  "밴드",
]

export type SortOption = "latest" | "popular" | "hit"

export interface Filters {
  onlyJemJen: boolean | null
  ageRelations: AgeRelation[]
  adult: "성인" | "전연령" | null
  formats: PostFormat[]
  genres: string[]
  excludeKeywords: string
  sort: SortOption
}

export const DEFAULT_FILTERS: Filters = {
  onlyJemJen: null,
  ageRelations: [],
  adult: null,
  formats: [],
  genres: [],
  excludeKeywords: "",
  sort: "latest",
}

// Find Request types
export interface FindRequest {
  id: string
  title: string
  description: string
  createdAt: Date
  isApproved: boolean
  status: "찾는중" | "완료"
  comments: FindRequestComment[]
}

export interface FindRequestComment {
  id: string
  requestId: string
  content: string
  createdAt: Date
}

// Inquiry & Registration Request types
export interface InquirySubmission {
  id: string
  type: "inquiry"
  title: string
  content: string
  createdAt: Date
}

export interface RegistrationRequest {
  id: string
  type: "registration"
  title: string
  content: string
  createdAt: Date
  author: string
  link: string
  ageRelation: AgeRelation | null
  genres: string[]
  rating: "성인" | "전연령" | null
  format: string
}
