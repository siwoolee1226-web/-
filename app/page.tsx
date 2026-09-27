import { ArchiveDashboard } from "@/components/archive/archive-dashboard"
import { fetchArchivePosts } from "@/lib/archive-data"

// Fetch on the server so the CSV request reads the runtime env var and avoids
// browser CORS restrictions when calling docs.google.com.
export const dynamic = "force-dynamic"

export default async function Page() {
  const { posts, usedMock } = await fetchArchivePosts()
  return <ArchiveDashboard initialPosts={posts} initialUsedMock={usedMock} />
}
