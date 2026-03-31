export interface Email {
  id: string
  sender: string
  subject: string
  received_at?: string | null
  classification?: 'important' | 'probable' | 'irrelevant'
  classification_label?: string
  priority: string
  unread: boolean
  processed?: boolean
  body?: string
}
