import { Controller, Get, Query } from '@nestjs/common';
import { apiBlog } from '@ts-rest/example-contracts';
import { Api, ApiDecorator, initNestServer } from '@ts-rest/nest';
import { PostService } from './post.service';

const s = initNestServer(apiBlog);
type RouteShape = typeof s.routeShapes;
type ResponseShapes = typeof s.responseShapes;

// Alternatively, you can the use the ResponseShapes type to ensure type safety

@Controller()
export class PostController  {
  constructor(private readonly postService: PostService) {}

  @Get('/test')
  test(@Query() queryParams: any) {
    return { queryParams };
  }

  @Api(s.route.getPosts)
  async getPosts(
    @ApiDecorator() { query: { take, skip, search } }: RouteShape['getPosts']
  ): Promise<ResponseShapes['getPosts']> {
    const { posts, totalPosts } = await this.postService.getPosts({
      take,
      skip,
      search,
    });

    return {
      status: 200,
      body: { posts, count: totalPosts, skip, take },
    };
  }

  @Api(s.route.getPost)
  async getPost(@ApiDecorator() { params: { id } }: RouteShape['getPost']):
    Promise<ResponseShapes['getPost']> {
    const post = await this.postService.getPost(id);

    if (!post) {
      return { status: 404, body: null };
    }

    return { status: 200, body: post };
  }

  @Api(s.route.createPost)
  async createPost(@ApiDecorator() { body }: RouteShape['createPost']): 
    Promise<ResponseShapes['createPost']> {
    const post = await this.postService.createPost({
      title: body.title,
      content: body.content,
      published: body.published,
      description: body.description,
    });

    return { status: 201, body: post };
  }

  @Api(s.route.updatePost)
  async updatePost(
    @ApiDecorator() { params: { id }, body }: RouteShape['updatePost']
  ): Promise<ResponseShapes['updatePost']> {
    const post = await this.postService.updatePost(id, {
      title: body.title,
      content: body.content,
      published: body.published,
      description: body.description,
    });

    return { status: 200, body: post };
  }

  @Api(s.route.deletePost)
  async deletePost(
    @ApiDecorator() { params: { id } }: RouteShape['deletePost']
  ): Promise<ResponseShapes['deletePost']> {
    await this.postService.deletePost(id);

    return { status: 200, body: { message: 'Post Deleted' } };
  }

  @Api(s.route.testPathParams)
  async testPathParams(
    @ApiDecorator() { params }: RouteShape['testPathParams']
  ): Promise<ResponseShapes['testPathParams']> {
    return { status: 200, body: params };
  }
}
