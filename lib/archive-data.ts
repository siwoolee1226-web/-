import type { AgeRelation, ArchivePost } from "./archive-types"

// Default source sheet (published & publicly readable). Override any time by
// setting NEXT_PUBLIC_ARCHIVE_CSV_URL. If both are empty, mock data is used.
const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1qhq-8ceD6D76oH2WpK90bRAL2V8sTlJmrHgLubsQPZY/edit?usp=sharing"
const RAW_CSV_URL = process.env.NEXT_PUBLIC_ARCHIVE_CSV_URL || DEFAULT_SHEET_URL

/**
 * Accepts any Google Sheets URL form and returns a CSV export URL.
 * - .../edit?usp=sharing            -> .../export?format=csv
 * - .../edit#gid=123                -> .../export?format=csv&gid=123
 * - already an export/csv link      -> returned unchanged
 * - non-Google URLs                 -> returned unchanged
 */
export function normalizeSheetUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  const match = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) return trimmed
  // Already a CSV export link — leave it alone.
  if (/[?&]format=csv/.test(trimmed) || /\/export\b/.test(trimmed)) return trimmed
  const id = match[1]
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/)
  const gid = gidMatch ? `&gid=${gidMatch[1]}` : ""
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid}`
}

export const CSV_URL = normalizeSheetUrl(RAW_CSV_URL)

/** Minimal RFC-4180-ish CSV parser that supports quoted fields and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char === "\r") {
      // ignore, handled by \n
    } else {
      field += char
    }
  }
  // flush last field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

function toBool(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === "true" || v === "1" || v === "o" || v === "y" || v === "yes" || v === "성인"
}

function toAgeRelation(value: string): AgeRelation | null {
  const v = value.trim()
  if (v === "연상연하" || v === "동갑" || v === "연하연상") return v
  return null
}

function splitList(value: string): string[] {
  return value
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Convert parsed CSV rows (with a header row) into ArchivePost objects. */
export function rowsToPosts(rows: string[][]): ArchivePost[] {
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)

  const iId = idx("id")
  const iTitle = idx("title")
  const iAuthor = idx("author")
  const iAdult = idx("isadult")
  const iFormat = idx("format")
  const iCompleted = idx("iscompleted")
  const iJemJen = idx("onlyjemjen")
  const iAge = idx("agerelation")
  const iGenres = idx("genres")
  const iTags = idx("tags")
  const iLink = idx("link")

  return rows.slice(1).map((cols, i) => {
    const format = cols[iFormat]?.trim()
    const allTags = iTags >= 0 ? splitList(cols[iTags] ?? "") : []
    // The sheet has no dedicated genres column; genre filtering falls back to tags.
    const genres = iGenres >= 0 ? splitList(cols[iGenres] ?? "") : allTags
    return {
      id: cols[iId]?.trim() || String(i + 1),
      title: cols[iTitle]?.trim() || "제목 없음",
      author: cols[iAuthor]?.trim() || "익명",
      isAdult: iAdult >= 0 ? toBool(cols[iAdult] ?? "") : false,
      format: format === "장편" || format === "시리즈" ? "장편" : "단편",
      isCompleted: iCompleted >= 0 ? toBool(cols[iCompleted] ?? "") : false,
      onlyJemJen: iJemJen >= 0 ? toBool(cols[iJemJen] ?? "") : false,
      ageRelation: iAge >= 0 ? toAgeRelation(cols[iAge] ?? "") : null,
      genres,
      tags: allTags,
      link: cols[iLink]?.trim() || "#",
    }
  })
}

export async function fetchArchivePosts(): Promise<{ posts: ArchivePost[]; usedMock: boolean }> {
  if (!CSV_URL) {
    return { posts: MOCK_POSTS, usedMock: true }
  }
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    const posts = rowsToPosts(parseCsv(text))
    if (posts.length === 0) throw new Error("빈 데이터")
    return { posts, usedMock: false }
  } catch (err) {
    console.log("[v0] CSV fetch failed, falling back to mock:", (err as Error).message)
    return { posts: MOCK_POSTS, usedMock: true }
  }
}

export const MOCK_POSTS: ArchivePost[] = [
  {
    id: "1",
    title: "여름의 끝에서 우리는",
    author: "달빛작가",
    isAdult: false,
    format: "장편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "연상연하",
    genres: ["일상물", "현대판타지"],
    tags: ["일상물", "현대판타지", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "2",
    title: "계약 연인의 조건",
    author: "밤하늘",
    isAdult: true,
    format: "장편",
    isCompleted: false,
    onlyJemJen: true,
    ageRelation: "동갑",
    genres: ["계약", "연예계"],
    tags: ["계약", "연예계", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "3",
    title: "겨울 정원의 비밀",
    author: "서리꽃",
    isAdult: false,
    format: "단편",
    isCompleted: true,
    onlyJemJen: false,
    ageRelation: "연하연상",
    genres: ["시대물", "au"],
    tags: ["시대물", "au", "후회물"],
    link: "https://www.postype.com",
  },
  {
    id: "4",
    title: "오메가의 봄",
    author: "봄바람",
    isAdult: true,
    format: "장편",
    isCompleted: false,
    onlyJemJen: true,
    ageRelation: "연상연하",
    genres: ["오메가버스", "임신물"],
    tags: ["오메가버스", "임신물", "육아물"],
    link: "https://www.postype.com",
  },
  {
    id: "5",
    title: "센티넬의 가이드",
    author: "은하수",
    isAdult: false,
    format: "장편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "동갑",
    genres: ["센티넬버스", "현대판타지"],
    tags: ["센티넬버스", "현대판타지", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "6",
    title: "친구에서 연인으로",
    author: "노을",
    isAdult: false,
    format: "단편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "연하연상",
    genres: ["친구에서연인", "일상물"],
    tags: ["친구에서연인", "일상물", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "7",
    title: "느와르의 밤",
    author: "검은고양이",
    isAdult: true,
    format: "장편",
    isCompleted: false,
    onlyJemJen: false,
    ageRelation: "연상연하",
    genres: ["느와르", "사망"],
    tags: ["느와르", "사망", "혐관물"],
    link: "https://www.postype.com",
  },
  {
    id: "8",
    title: "리맨의 하루",
    author: "출근길",
    isAdult: false,
    format: "단편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "동갑",
    genres: ["리맨", "일상물"],
    tags: ["리맨", "일상물", "리얼"],
    link: "https://www.postype.com",
  },
  {
    id: "9",
    title: "후회의 계절",
    author: "가을편지",
    isAdult: true,
    format: "장편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "연상연하",
    genres: ["후회물", "이별물"],
    tags: ["후회물", "이별물", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "10",
    title: "수인의 숲",
    author: "늑대별",
    isAdult: false,
    format: "장편",
    isCompleted: false,
    onlyJemJen: false,
    ageRelation: "연하연상",
    genres: ["수인물", "현대판타지"],
    tags: ["수인물", "현대판타지", "au"],
    link: "https://www.postype.com",
  },
  {
    id: "11",
    title: "청춘의 게임",
    author: "십대의꿈",
    isAdult: false,
    format: "단편",
    isCompleted: true,
    onlyJemJen: true,
    ageRelation: "동갑",
    genres: ["청게", "일상물"],
    tags: ["청게", "일상물", "쌍방삽질"],
    link: "https://www.postype.com",
  },
  {
    id: "12",
    title: "육아 일기",
    author: "따뜻한손",
    isAdult: false,
    format: "장편",
    isCompleted: false,
    onlyJemJen: true,
    ageRelation: "연상연하",
    genres: ["육아물", "일상물"],
    tags: ["육아물", "일상물", "오메가버스"],
    link: "https://www.postype.com",
  },
]
