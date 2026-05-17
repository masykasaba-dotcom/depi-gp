import { RequestHandler } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET /api/blog?page=1&limit=10 — public: list published posts
export const getPosts: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where: { is_published: true } }),
      prisma.blogPost.findMany({
        where: { is_published: true },
        skip,
        take: limit,
        orderBy: { published_at: "desc" },
        select: {
          post_id: true, slug: true, title: true, excerpt: true,
          cover_image: true, published_at: true,
          author: { select: { first_name: true, last_name: true } },
        },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: posts });
  } catch (err) {
    console.error("[blog] getPosts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// GET /api/blog/:slug — public: single post
export const getPostBySlug: RequestHandler = async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug as string },
      include: { author: { select: { first_name: true, last_name: true } } },
    });

    if (!post || !post.is_published) return res.status(404).json({ error: "Post not found" });

    res.json({ data: post });
  } catch (err) {
    console.error("[blog] getPostBySlug error:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// GET /api/admin/blog — admin: all posts (including drafts)
export const adminGetPosts: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.findMany({
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { author: { select: { first_name: true, last_name: true } } },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: posts });
  } catch (err) {
    console.error("[blog] adminGetPosts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// POST /api/admin/blog
export const createPost: RequestHandler = async (req, res) => {
  try {
    const adminReq = req as AuthRequest;
    const author_id = adminReq.user?.adminId ?? null;

    const { slug, title, excerpt, content, cover_image, is_published, seo_title, seo_desc } = req.body;
    if (!slug || !title || !content) {
      return res.status(400).json({ error: "slug, title, and content are required" });
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        cover_image,
        author_id,
        is_published: is_published ?? false,
        seo_title,
        seo_desc,
        published_at: is_published ? new Date() : null,
      },
    });

    res.status(201).json({ message: "Post created", data: post });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Slug already exists" });
    console.error("[blog] createPost error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// PUT /api/admin/blog/:id
export const updatePost: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid post ID" });

    const { slug, title, excerpt, content, cover_image, is_published, seo_title, seo_desc } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { post_id: id } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    const post = await prisma.blogPost.update({
      where: { post_id: id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content }),
        ...(cover_image !== undefined && { cover_image }),
        ...(is_published !== undefined && { is_published }),
        ...(is_published === true && !existing.published_at && { published_at: new Date() }),
        ...(seo_title !== undefined && { seo_title }),
        ...(seo_desc !== undefined && { seo_desc }),
      },
    });

    res.json({ message: "Post updated", data: post });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Slug already exists" });
    console.error("[blog] updatePost error:", err);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// DELETE /api/admin/blog/:id
export const deletePost: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid post ID" });

    await prisma.blogPost.delete({ where: { post_id: id } });
    res.json({ message: "Post deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Post not found" });
    console.error("[blog] deletePost error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};
