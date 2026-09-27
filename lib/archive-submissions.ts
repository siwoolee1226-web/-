import type { FindRequest, InquirySubmission, RegistrationRequest } from "./archive-types"

/** Public webhook endpoint used for shared user submissions and admin mutations. */
export const ARCHIVE_WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL?.trim() || ""

export type ArchiveSubmission = InquirySubmission | RegistrationRequest

export interface ArchiveSubmissionSnapshot {
  findRequests: FindRequest[]
  submissions: ArchiveSubmission[]
}

function reviveDates<T extends { createdAt: Date }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, createdAt: new Date(item.createdAt) }))
}

function normalizeSnapshot(value: unknown): ArchiveSubmissionSnapshot {
  const payload = (value && typeof value === "object" ? value : {}) as Record<string, unknown>
  const findRequests = Array.isArray(payload.findRequests) ? payload.findRequests as FindRequest[] : []
  const submissions = Array.isArray(payload.submissions) ? payload.submissions as ArchiveSubmission[] : []
  return {
    findRequests: reviveDates(findRequests).map((request) => ({
      ...request,
      comments: (request.comments ?? []).map((comment) => ({ ...comment, createdAt: new Date(comment.createdAt) })),
    })),
    submissions: reviveDates(submissions),
  }
}

async function requestWebhook(path: string, init?: RequestInit): Promise<unknown> {
  if (!ARCHIVE_WEBHOOK_URL) return null
  const response = await fetch(`${ARCHIVE_WEBHOOK_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  if (!response.ok) throw new Error(`Archive webhook failed: ${response.status}`)
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export async function fetchArchiveSubmissions(): Promise<ArchiveSubmissionSnapshot> {
  if (!ARCHIVE_WEBHOOK_URL) return { findRequests: [], submissions: [] }
  return normalizeSnapshot(await requestWebhook(""))
}

export async function createArchiveSubmission(payload: ArchiveSubmission | FindRequest): Promise<void> {
  await requestWebhook("", { method: "POST", body: JSON.stringify({ action: "create", payload }) })
}

export async function updateArchiveSubmission(type: "findRequest" | "submission", id: string, update: Record<string, unknown>): Promise<void> {
  await requestWebhook("", { method: "POST", body: JSON.stringify({ action: "update", type, id, update }) })
}

export async function deleteArchiveSubmission(type: "findRequest" | "submission", id: string): Promise<void> {
  await requestWebhook("", { method: "POST", body: JSON.stringify({ action: "delete", type, id }) })
}
