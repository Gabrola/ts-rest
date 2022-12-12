import { z } from 'zod';
import { initClient } from './client-v4';
import { initContract } from '..';

const c = initContract();

const router = c.router({
  getPosts: {
    method: 'GET',
    path: '/posts',
    responses: {
      200: z.object({
        posts: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            publishedAt: z.date(),
          })
        ),
      }),
    },
    query: z.object({
      take: z.string().default('50').transform(Number),
      skip: z.string().default('0').transform(Number),
    }),
  },
  createAuthor: {
    method: 'POST',
    path: '/authors/',
    responses: {
      200: z.object({
        id: z.string(),
      }),
    },
    body: z.object({
      authorName: z.string(),
    }),
  },
  comments: {
    getComments: {
      method: 'GET',
      path: '/posts/:id/comments',
      responses: {
        200: z.object({
          comments: z.array(z.object({ title: z.string() })),
        }),
      },
      query: z.object({
        take: z.string().default('50').transform(Number),
        skip: z.string().default('0').transform(Number),
      }),
    },
    createComment: {
      method: 'POST',
      path: '/posts/:id/comments',
      responses: {
        200: z.object({
          id: z.string(),
        }),
      },
      body: z.object({
        content: z.string(),
        authorId: z.number(),
      }),
    },
  },
});

const api = jest.fn();

const client = initClient<typeof router>({
  baseUrl: 'http://api.com',
  baseHeaders: {},
  api,
});

describe('client', () => {
  beforeEach(() => {
    api.mockClear();
  });

  describe('posts', () => {
    it('w/ no parameters', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ body: value, status: 200 });

      const result = await client('GET', '/posts', { query: {} });

      expect(result).toStrictEqual({ body: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });

    it('w/ query parameters', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ body: value, status: 200 });

      const result = await client('GET', '/posts', { query: { take: '10' } });

      expect(result).toStrictEqual({ body: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts?take=10',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });

    it('w/ undefined query parameters', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ body: value, status: 200 });

      const result = await client('GET', '/posts', {
        query: { take: '10', skip: undefined },
      });

      expect(result).toStrictEqual({ body: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts?take=10',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });
  });

  describe('comments', () => {
    it('create comment', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ body: value, status: 200 });

      const result = await client('POST', `/posts/${123}/comments`, {
        body: { content: 'hello', authorId: 1 },
      });

      expect(result).toStrictEqual({ body: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });
  });
});
