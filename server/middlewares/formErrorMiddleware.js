import objectToFormFieldArray from '../utils/objectToArray';

export default function formErrorMiddleware(ctx, error) {
  console.log(error);

  // DuplicateKey Error
  if (error.name === 'MongoError' && error.code === 11000) {
    ctx.status = 400
    ctx.body = {
      message: error.message,
    }
    return;
  }
  // objectId 转换错误
  if (error.name === 'CastError') {
    ctx.status = 404
    ctx.body = {
      message: 'id不存在',
    }
    return;
  }
  if (error.errors) {
    ctx.status = 400
    ctx.body = {
      errors: objectToFormFieldArray(error.errors),
    }
    return;
  }
  ctx.throw(500, '服务器内部错误')
}