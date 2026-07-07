import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createBlogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().default(''),
  published: z.boolean().default(false),
});

const updateBlogSchema = createBlogSchema.partial();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Public: list published posts
router.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      ...(category && { category }),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      category: true, imageUrl: true, authorId: true,
      published: true, createdAt: true, updatedAt: true,
    },
  });
  res.json(posts);
});

// Admin: list all posts (including drafts)
router.get('/admin', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

// Public: get single post by slug or id
router.get('/:identifier', async (req: Request, res: Response) => {
  const post = await prisma.blogPost.findFirst({
    where: {
      OR: [
        { slug: req.params.identifier },
        { id: req.params.identifier },
      ],
    },
  });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  // Only return published posts for non-admin
  if (!post.published) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(post);
});

// Admin: create post
router.post('/', authenticate, requireRole('admin'), validate(createBlogSchema), async (req: Request, res: Response) => {
  // Auto-generate slug if empty
  const data = {
    ...req.body,
    slug: req.body.slug || slugify(req.body.title),
    authorId: req.user!.userId,
  };

  const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing) {
    res.status(409).json({ error: 'A post with this slug already exists' });
    return;
  }

  const post = await prisma.blogPost.create({ data });
  res.status(201).json(post);
});

// Admin: update post
router.patch('/:id', authenticate, requireRole('admin'), validate(updateBlogSchema), async (req: Request, res: Response) => {
  const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (req.body.slug && req.body.slug !== post.slug) {
    const slugExists = await prisma.blogPost.findUnique({ where: { slug: req.body.slug } });
    if (slugExists) {
      res.status(409).json({ error: 'A post with this slug already exists' });
      return;
    }
  }

  const updated = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});

// Admin: delete post
router.delete('/:id', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
