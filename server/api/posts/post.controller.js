import mongoose from 'mongoose'
import {
  isNumber,
  isNullOrUndefined,
} from 'util';
import PostModel from '../../models/Post.model'
import errorHanle from '../../utils/errorHandle';
import * as pagination from '../../constants/Pagination'
import {
  toRegexpQuery,
} from '../../utils/toRegexpQuery'

const Post = mongoose.model('Post')

class PostController {

  /**
   * 获取post分页列表
   *  没有page 参数则默认显示全部
   *  page：当前页数
   *  pageSize: 每页数量
   *  orderColumn 排序字段
   *  orderType desc asc default
   *  filterColumn 过滤字段
   *  tag 查询包含该标签的所有post
   *  category 查询该分类的post
   * @param {*} ctx
   */
  async posts(ctx) {
    const {
      orderColumn = pagination.ORDER_COLUMN,
      filterColumn,
      orderType = pagination.ORDER_TYPE,
      tag,
      category,
      word,
    } = ctx.query

    let {
      page,
      pageSize = pagination.PAGE_SIZE,
    } = ctx.query
    const params = {
      sort: {},
      query: {
        or: {},
        find: {},
      },
      filter: {},
    }

    params.sort[orderColumn] = orderType
    // if (status !== null && status !== undefined) {
    //   params.filter.status = status
    // }
    if (word !== undefined && word !== '' && word !== null) {
      if (filterColumn !== undefined) {
        params.query.or = toRegexpQuery(filterColumn, word)
      } else {
        params.query.or = toRegexpQuery(['title'], word)
      }
    }
    // tag search
    if (tag !== undefined && tag !== null) {
      params.query.find = {
        tags: tag,
      }
    }

    // category search
    if (category !== undefined && category !== null) {
      params.query.find = {
        category,
      }
    }

    try {
      if (!isNullOrUndefined(page) && isNumber(parseInt(page, 0))) {
        page = parseInt(page, 0)
        pageSize = parseInt(pageSize, 0)
        const total = await Post.getCount(params.query)
        const posts = await Post.findPostsPagination(page, pageSize, params).exec()
        ctx.status = 200
        ctx.body = {
          data: {
            page: {
              page,
              pageSize,
              total,
            },
            items: posts,
          },
        }
      } else {
        const posts = await Post.findPosts(params).exec()
        ctx.status = 200
        ctx.body = {
          data: {
            items: posts,
          },
        }
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  /**
   * 新增文章
   * @param {*} ctx
   */
  async add(ctx) {
    const {
      body,
    } = ctx.request
    try {
      const post = new Post(body)
      await post.save()
      ctx.status = 200;
      ctx.body = {
        message: '操作成功',
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  /**
   * 更新文章
   * @param {*} ctx
   */
  async update(ctx) {
    const {
      body,
    } = ctx.request
    const {
      id,
    } = ctx.params
    try {
      await Post.findByIdAndUpdate(id, body)
      ctx.status = 200
      ctx.body = {
        message: '操作成功',
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  /**
   * 更改文章状态：发布、下架，上架
   * @param {*} ctx
   */
  async changeStatus(ctx) {
    const {
      status,
    } = ctx.request.body
    const {
      id,
    } = ctx.params
    try {
      const post = await Post.findByIdAndUpdate(id, {
        status,
      })
      ctx.status = 200
      ctx.body = {
        message: '操作成功',
        data: {
          post,
        },
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  /**
   * 删除文章
   * @param {*} ctx
   */
  async remove(ctx) {
    const {
      id,
    } = ctx.params
    try {
      await Post.findByIdAndRemove(id)
      ctx.status = 200
      ctx.body = {
        message: '操作成功',
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  /**
   * 根据id获取文章详情
   * @param {*} ctx
   */
  async detail(ctx) {
    const {
      id,
    } = ctx.params
    try {
      const post = await Post.findPostById(id).exec()
      ctx.status = 200
      ctx.body = {
        data: {
          post,
        },
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }

  async getPostsByTagId(ctx) {
    const { id } = ctx.params
    try {
      const posts = await Post.find({
        tags: id,
      })
      // const posts = await Post.findPostsByTagId(id).exec()
      ctx.status = 200
      ctx.body = {
        data: {
          items: posts,
        },
      }
    } catch (error) {
      errorHanle(ctx, error)
    }
  }
}

export default new PostController()
