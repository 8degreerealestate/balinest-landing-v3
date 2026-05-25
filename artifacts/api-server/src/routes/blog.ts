import { Router } from "express";
import { eq, and, sql, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import { blogPostsTable, blogCategoriesTable } from "@workspace/db";
import {
  ListBlogPostsQueryParams,
  CreateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  UpdateBlogPostBody,
  DeleteBlogPostParams,
} from "@workspace/api-zod";
import {
  getJournalFallbackBySlug,
  listJournalFallback,
  listJournalFallbackCategories,
  syncJournalImportToDatabaseIfEmpty,
  type JournalPostDto,
} from "../lib/journal-import-fallback";

const router = Router();

router.get("/blog/categories", async (_req, res): Promise<void> => {
  await syncJournalImportToDatabaseIfEmpty();
  const categories = await db
    .select()
    .from(blogCategoriesTable)
    .orderBy(blogCategoriesTable.name);

  if (categories.length === 0) {
    res.json({ categories: listJournalFallbackCategories() });
    return;
  }

  res.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
  });
});

router.get("/blog", async (req, res): Promise<void> => {
  const parsed = ListBlogPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await syncJournalImportToDatabaseIfEmpty();

  const { category, limit = 12, offset = 0 } = parsed.data;
  const conditions = [eq(blogPostsTable.published, true)];
  if (category) conditions.push(eq(blogCategoriesTable.name, category));

  const where = and(...conditions);

  const [posts, countResult] = await Promise.all([
    db
      .select({
        post: blogPostsTable,
        categoryName: blogCategoriesTable.name,
      })
      .from(blogPostsTable)
      .leftJoin(blogCategoriesTable, eq(blogPostsTable.categoryId, blogCategoriesTable.id))
      .where(where)
      .orderBy(asc(sql`coalesce(${blogPostsTable.publishedAt}, ${blogPostsTable.createdAt})`))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPostsTable)
      .leftJoin(blogCategoriesTable, eq(blogPostsTable.categoryId, blogCategoriesTable.id))
      .where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  if (total === 0) {
    const fallback = listJournalFallback({ category, limit, offset });
    res.json(fallback);
    return;
  }

  res.json({
    posts: posts.map(({ post, categoryName }) => mapPost(post, categoryName)),
    total,
  });
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const params = GetBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await syncJournalImportToDatabaseIfEmpty();

  const [result] = await db
    .select({
      post: blogPostsTable,
      categoryName: blogCategoriesTable.name,
    })
    .from(blogPostsTable)
    .leftJoin(blogCategoriesTable, eq(blogPostsTable.categoryId, blogCategoriesTable.id))
    .where(eq(blogPostsTable.slug, params.data.slug));

  if (result) {
    res.json(mapPost(result.post, result.categoryName));
    return;
  }

  const fallback = getJournalFallbackBySlug(params.data.slug);
  if (!fallback) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(fallback);
});

router.post("/blog", async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db.insert(blogPostsTable).values({
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    featuredImageUrl: parsed.data.featuredImageUrl ?? null,
    author: parsed.data.author,
    categoryId: parsed.data.categoryId ?? null,
    readingTime: parsed.data.readingTime,
    published: parsed.data.published,
    publishedAt: parsed.data.published ? new Date() : null,
  }).returning();

  res.status(201).json(mapPost(post, null));
});

router.put("/blog/:slug", async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db
    .update(blogPostsTable)
    .set({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      featuredImageUrl: parsed.data.featuredImageUrl ?? null,
      author: parsed.data.author,
      categoryId: parsed.data.categoryId ?? null,
      readingTime: parsed.data.readingTime,
      published: parsed.data.published,
    })
    .where(eq(blogPostsTable.slug, params.data.slug))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(mapPost(post, null));
});

router.delete("/blog/:slug", async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .delete(blogPostsTable)
    .where(eq(blogPostsTable.slug, params.data.slug))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ success: true });
});

function mapPost(
  p: typeof blogPostsTable.$inferSelect,
  categoryName: string | null | undefined,
): JournalPostDto {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    featuredImageUrl: p.featuredImageUrl ?? null,
    author: p.author,
    categoryId: p.categoryId ?? null,
    categoryName: categoryName ?? null,
    readingTime: p.readingTime,
    published: p.published,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
