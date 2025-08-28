export type NotificationType = 'order' | 'review' | 'system'

export interface Notification {
  id: string
  userId: number
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

const notifications: Notification[] = []

export const notificationService = {
  async create(n: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const notif: Notification = {
      id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      read: false,
      createdAt: new Date().toISOString(),
    }
    notifications.push(notif)
    return notif
  },

  async listByUser(userId: number): Promise<Notification[]> {
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  },

  async markRead(id: string): Promise<Notification | undefined> {
    const n = notifications.find((x) => x.id === id)
    if (!n) return undefined
    n.read = true
    return n
  },

  async markAllRead(userId: number): Promise<number> {
    let count = 0
    for (const n of notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true
        count++
      }
    }
    return count
  },
}
