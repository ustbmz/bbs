import { getJWTPayload } from '@/common/Utils'

export default async (ctx, next) => {
  const header = ctx.header.authorization
  if (typeof header !== 'undefined') {
    const obj = await getJWTPayload(ctx.header.authorization)

    if (obj.id) {
      ctx._id = obj.id
    }
  }
  await next()
}
