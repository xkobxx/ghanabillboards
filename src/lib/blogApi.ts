import type { BlogPost } from '../types';
import { apiRequest } from './apiClient';

export const blogApi = {
  list: (category?: string) =>
    apiRequest<BlogPost[]>(`/api/blogs${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  listAll: () =>
    apiRequest<BlogPost[]>('/api/blogs/admin'),

  get: (identifier: string) =>
    apiRequest<BlogPost>(`/api/blogs/${encodeURIComponent(identifier)}`),

  create: (data: Omit<BlogPost, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<BlogPost>('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<BlogPost>) =>
    apiRequest<BlogPost>(`/api/blogs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/api/blogs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};
