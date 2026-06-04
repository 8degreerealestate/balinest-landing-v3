import type { BlogPost } from "@workspace/api-client-react";
import { resolveJournalImageUrl, rewriteJournalContentHtml } from "@/lib/journal-image-url";

type JournalImportFile = {
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImageUrl: string | null;
    author: string;
    categoryName: string | null;
    readingTime: number;
    publishedAt: string;
  }>;
};

let cache: BlogPost[] | null = null;
let loadPromise: Promise<BlogPost[]> | null = null;

function toBlogPost(row: JournalImportFile["posts"][number], index: number): BlogPost {
  return {
    id: index + 1,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: rewriteJournalContentHtml(row.content),
    featuredImageUrl: resolveJournalImageUrl(row.featuredImageUrl),
    author: row.author,
    categoryId: null,
    categoryName: row.categoryName,
    readingTime: row.readingTime,
    published: true,
    publishedAt: row.publishedAt,
    createdAt: row.publishedAt,
  };
}

export async function loadStaticJournalPosts(): Promise<BlogPost[]> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = fetch("/journal-import.json")
      .then((res) => {
        if (!res.ok) throw new Error(`journal-import.json ${res.status}`);
        return res.json() as Promise<JournalImportFile>;
      })
      .then((body) => {
        const sorted = [...(body.posts ?? [])].sort(
          (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
        );
        cache = sorted.map(toBlogPost);
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      });
  }
  return loadPromise;
}

export async function getStaticJournalPost(slug: string): Promise<BlogPost | null> {
  const posts = await loadStaticJournalPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Newest journal posts first (homepage “Latest News”). */
export async function loadLatestJournalPosts(limit: number): Promise<BlogPost[]> {
  const posts = await loadStaticJournalPosts();
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
    )
    .slice(0, Math.max(1, limit));
}
