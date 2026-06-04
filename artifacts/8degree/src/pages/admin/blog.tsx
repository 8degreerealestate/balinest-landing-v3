import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, X } from "lucide-react";
import { useListBlogPosts, useCreateBlogPost, useDeleteBlogPost, getListBlogPostsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminBlog() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useListBlogPosts({ limit: 50 });
  const posts = data?.posts ?? [];
  const createBlogPost = useCreateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", author: "8 Degree Team",
    featuredImageUrl: "", readingTime: 5, published: false,
  });

  const handleCreate = async () => {
    try {
      await createBlogPost.mutateAsync({
        data: {
          title: form.title,
          slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          excerpt: form.excerpt,
          content: form.content,
          author: form.author,
          featuredImageUrl: form.featuredImageUrl || null,
          readingTime: Number(form.readingTime),
          published: form.published,
          categoryId: null,
        },
      });
      qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
      toast({ title: "Blog post created" });
      setShowForm(false);
    } catch {
      toast({ title: "Error creating post", variant: "destructive" });
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteBlogPost.mutateAsync({ slug });
      qc.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
      toast({ title: "Post deleted" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">{posts.length} articles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-none tracking-widest uppercase" data-testid="button-new-post">
          <Plus size={16} className="mr-2" /> New Article
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">New Article</h2>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-none" data-testid="input-blog-title" />
            <Input placeholder="Slug (auto-generated)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="rounded-none" />
            <Input placeholder="Author" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="rounded-none" />
            <Input placeholder="Reading Time (minutes)" type="number" value={form.readingTime} onChange={e => setForm(p => ({ ...p, readingTime: Number(e.target.value) }))} className="rounded-none" />
            <Input placeholder="Featured Image URL" value={form.featuredImageUrl} onChange={e => setForm(p => ({ ...p, featuredImageUrl: e.target.value }))} className="rounded-none sm:col-span-2" />
          </div>
          <Textarea placeholder="Excerpt" value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} className="rounded-none resize-none h-20 mt-4" />
          <Textarea placeholder="Content (HTML supported)" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="rounded-none resize-none h-40 mt-4" />
          <div className="flex items-center gap-3 mt-4">
            <Switch id="published" checked={form.published} onCheckedChange={v => setForm(p => ({ ...p, published: v }))} data-testid="switch-published" />
            <Label htmlFor="published">Published</Label>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleCreate} disabled={createBlogPost.isPending} className="rounded-none tracking-wider" data-testid="button-create-post">
              {createBlogPost.isPending ? "Creating..." : "Create Article"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-none">Cancel</Button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Author</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-border/50 hover:bg-muted/20" data-testid={`row-post-${post.id}`}>
                  <td className="py-3 px-4 font-medium max-w-xs truncate">{post.title}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{post.author}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{post.categoryName ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${post.published ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Eye size={14} /></a>
                      <button onClick={() => handleDelete(post.slug, post.title)} className="text-muted-foreground hover:text-destructive" data-testid={`button-delete-post-${post.id}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No posts yet</div>}
        </div>
      )}
    </div>
  );
}
