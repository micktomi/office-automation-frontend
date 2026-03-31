'use client'

import { useEffect, useState } from 'react'
import { Mail, Reply, Archive, User, Calendar, MoreVertical } from 'lucide-react'
import locales from '@/locales/el.json'
import type { Email } from '@/types/email'
import { apiService } from '@/lib/api'

interface EmailPreviewProps {
  email: Email | null
}

function parseSender(sender: string) {
  const addressMatch = sender.match(/<([^>]+)>/)
  const emailAddress = addressMatch?.[1]?.trim() || ''
  const displayName = sender.replace(/<[^>]+>/g, '').replace(/"/g, '').trim() || emailAddress || sender
  return { displayName, emailAddress }
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || '?'
  )
}

function formatReceivedAt(receivedAt?: string | null) {
  if (!receivedAt) return ''
  const date = new Date(receivedAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('el-GR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function cleanEmailBody(rawBody?: string | null) {
  const raw = (rawBody || '').trim()
  if (!raw) return 'Δεν υπάρχει περιεχόμενο για αυτό το email.'

  const looksLikeHtml = /<[a-zA-Z!/][^>]*>/.test(raw)
  if (!looksLikeHtml) return raw

  const withoutStyleScript = raw
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  const textOnly = withoutStyleScript.replace(/<[^>]+>/g, ' ')
  const decoded = textOnly
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
  return decoded.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function formatReplySuggestion(rawReply: string) {
  return rawReply.trim()
}

export function EmailPreview({ email }: EmailPreviewProps) {
  const [replyDraft, setReplyDraft] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')

  useEffect(() => {
    setReplyDraft('')
    setReplyError('')
    setReplyLoading(false)
  }, [email?.id])

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20">
        <Mail className="w-24 h-24 mb-6" />
        <p className="text-xl font-medium italic">Επιλέξτε ένα email για προεπισκόπηση</p>
      </div>
    )
  }

  const senderInfo = parseSender(email.sender)
  const subject = email.subject?.trim() || '(Χωρίς θέμα)'
  const body = cleanEmailBody(email.body)

  const extractDraftText = (rawResponse: string) => {
    const blockMatch = rawResponse.match(/---\s*([\s\S]*?)\s*---/)
    return (blockMatch?.[1] || rawResponse).trim()
  }

  const handleReplyClick = async () => {
    setReplyError('')
    setReplyLoading(true)

    try {
      const data = await apiService.callAction('email.reply', { 
        email_id: email.id 
      })
      
      const responseData = data.data
      const generatedReply =
        responseData &&
        typeof responseData === 'object' &&
        'reply' in responseData &&
        typeof responseData.reply === 'string'
          ? responseData.reply
          : null
      const replyText = generatedReply || data.response || 'Δεν έλαβα έγκυρη απάντηση.'
      setReplyDraft(formatReplySuggestion(extractDraftText(replyText)))
    } catch (error) {
      console.error('Reply generation failed', error)
      setReplyError('Αποτυχία δημιουργίας απάντησης. Δοκίμασε ξανά.')
    } finally {
      setReplyLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 overflow-hidden">
      {/* Actions Toolbar */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface/40">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplyClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Reply className="w-4 h-4" />
            {locales.inbox.actions.reply}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-danger/10 hover:text-danger rounded-xl text-text-muted transition-all" title={locales.inbox.actions.archive}>
            <Archive className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl text-text-muted transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Email Header */}
      <div className="p-8 border-b border-border bg-surface/20">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20 shadow-inner">
              {initialsFromName(senderInfo.displayName)}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{subject}</h1>
              <div className="flex items-center gap-3 text-text-muted text-sm">
                <span className="flex items-center gap-1.5 font-medium text-text">
                  <User className="w-4 h-4" /> {senderInfo.displayName}
                </span>
                {senderInfo.emailAddress && <span>&lt;{senderInfo.emailAddress}&gt;</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-text-muted text-xs font-mono uppercase tracking-widest mb-1">
              <Calendar className="w-3.5 h-3.5" /> {formatReceivedAt(email.received_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-white/[0.01]">
        <div className="max-w-3xl space-y-6 text-text/90 leading-relaxed font-sans text-lg">
          <p className="whitespace-pre-wrap">{body}</p>

          {(replyLoading || replyDraft || replyError) && (
            <div className="border border-border rounded-2xl bg-surface/30 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider opacity-70 mb-2">
                Πρόταση απάντησης
              </h3>
              <p className="mb-3 text-[11px] uppercase tracking-wider text-text-muted/70">
                Auto / manual
              </p>
              {replyLoading && (
                <p className="text-sm text-text-muted">Δημιουργία απάντησης...</p>
              )}
              {!replyLoading && replyError && (
                <p className="text-sm text-danger">{replyError}</p>
              )}
              {!replyLoading && !replyError && replyDraft && (
                <p className="whitespace-pre-wrap text-sm leading-6 text-text/90">{replyDraft}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
