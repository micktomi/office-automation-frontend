export interface Email {
  id: string
  sender: string
  subject: string
  received_at?: string | null
  priority: string
  unread: boolean
  body?: string
}
