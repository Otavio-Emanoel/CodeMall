export type ReviewTarget = 'product' | 'seller'

export interface CreateReviewInput {
  targetType: ReviewTarget
  targetId: number
  buyerId: number
  rating: number // 1..5
  comment?: string
}

export interface ReplyInput {
  reviewId: string
  sellerId: number
  message: string
}

export interface ReviewReply {
  sellerId: number
  message: string
  createdAt: string
}

export interface Review {
  id: string
  targetType: ReviewTarget
  targetId: number
  buyerId: number
  rating: number
  comment?: string
  reply?: ReviewReply
  createdAt: string
}

const reviews: Review[] = []

export const reviewService = {
  async create(input: CreateReviewInput): Promise<Review> {
    if (!['product', 'seller'].includes(input.targetType)) throw new Error('targetType inválido')
    if (!Number.isFinite(input.targetId)) throw new Error('targetId inválido')
    if (!Number.isFinite(input.buyerId)) throw new Error('buyerId inválido')
    const r = Number(input.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) throw new Error('rating deve ser 1..5')
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const review: Review = {
      id,
      targetType: input.targetType,
      targetId: Number(input.targetId),
      buyerId: Number(input.buyerId),
      rating: r,
      comment: input.comment?.toString().slice(0, 1000),
      createdAt: new Date().toISOString(),
    }
    reviews.push(review)
    return review
  },

  async list(targetType: ReviewTarget, targetId: number): Promise<Review[]> {
    return reviews.filter((rv) => rv.targetType === targetType && rv.targetId === targetId)
  },

  async reply(input: ReplyInput): Promise<Review | undefined> {
    const review = reviews.find((rv) => rv.id === input.reviewId)
    if (!review) return undefined
    if (review.reply) throw new Error('Review já possui resposta')
    review.reply = {
      sellerId: Number(input.sellerId),
      message: input.message.toString().slice(0, 1000),
      createdAt: new Date().toISOString(),
    }
    return review
  },

  async summary(targetType: ReviewTarget, targetId: number): Promise<{ count: number; avg: number }> {
    const list = await this.list(targetType, targetId)
    const count = list.length
    const avg = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0
    return { count, avg: Number(avg.toFixed(2)) }
  },
}
