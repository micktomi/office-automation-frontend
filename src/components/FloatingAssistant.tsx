'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, X, Mic, Send, Paperclip, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/appStore'
import { apiService } from '@/lib/api'
import { cn } from '@/lib/utils'
import locales from '@/locales/el.json'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actionPerformed?: string
  data?: unknown
}

function formatAssistantData(actionPerformed: string | undefined, data: unknown): string | null {
  if (!actionPerformed || data == null) {
    return null
  }

  if (actionPerformed === 'calendar.list' && Array.isArray(data)) {
    if (data.length === 0) return 'Δεν βρήκα ραντεβού στο ημερολόγιο.'
    return data.slice(0, 5).map((item, index) => {
      if (!item || typeof item !== 'object') return `${index + 1}. Ραντεβού`
      const row = item as Record<string, unknown>
      const summary = typeof row.summary === 'string' ? row.summary : 'Χωρίς τίτλο'
      const start = typeof row.start === 'string' ? row.start : ''
      return `${index + 1}. ${summary}${start ? ` - ${start}` : ''}`
    }).join('\n')
  }

  if ((actionPerformed === 'email.list' || actionPerformed === 'email.needs_reply') && Array.isArray(data)) {
    if (data.length === 0) return 'Δεν βρήκα emails.'
    return data.slice(0, 5).map((item, index) => {
      if (!item || typeof item !== 'object') return `${index + 1}. Email`
      const row = item as Record<string, unknown>
      const subject = typeof row.subject === 'string' ? row.subject : 'Χωρίς θέμα'
      const sender = typeof row.sender === 'string' ? row.sender : ''
      return `${index + 1}. ${subject}${sender ? ` - ${sender}` : ''}`
    }).join('\n')
  }

  if (actionPerformed === 'tasks.list' && Array.isArray(data)) {
    if (data.length === 0) return 'Δεν βρήκα tasks.'
    return data.slice(0, 5).map((item, index) => {
      if (!item || typeof item !== 'object') return `${index + 1}. Task`
      const row = item as Record<string, unknown>
      const title = typeof row.title === 'string' ? row.title : 'Χωρίς τίτλο'
      const completed = row.completed === true ? 'ολοκληρωμένο' : 'εκκρεμές'
      return `${index + 1}. ${title} (${completed})`
    }).join('\n')
  }

  if (actionPerformed === 'insurance.alerts' && Array.isArray(data)) {
    if (data.length === 0) return 'Δεν βρήκα λήξεις συμβολαίων.'
    return data.slice(0, 5).map((item, index) => {
      if (!item || typeof item !== 'object') return `${index + 1}. Ασφαλιστήριο`
      const row = item as Record<string, unknown>
      const holder = typeof row.policy_holder === 'string' ? row.policy_holder : 'Πελάτης'
      const expiry = typeof row.expiry_date === 'string' ? row.expiry_date : ''
      return `${index + 1}. ${holder}${expiry ? ` - λήξη ${expiry}` : ''}`
    }).join('\n')
  }

  if (actionPerformed === 'documents.list' && Array.isArray(data)) {
    if (data.length === 0) return 'Δεν βρήκα έγγραφα.'
    return data.slice(0, 5).map((item, index) => {
      if (!item || typeof item !== 'object') return `${index + 1}. Έγγραφο`
      const row = item as Record<string, unknown>
      const title = typeof row.title === 'string' ? row.title : 'Έγγραφο'
      const type = typeof row.type === 'string' ? row.type : ''
      return `${index + 1}. ${title}${type ? ` (${type})` : ''}`
    }).join('\n')
  }

  if (actionPerformed === 'email.reply' && data && typeof data === 'object' && 'reply' in data) {
    const reply = (data as { reply?: unknown }).reply
    return typeof reply === 'string' ? reply : null
  }

  return null
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (_event: Event) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function FloatingAssistant() {
  const {
    isAssistantOpen,
    toggleAssistant,
    getContext,
    assistantMessage,
    setAssistantMessage,
    requestDashboardRefresh,
  } = useAppStore()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const WebkitSpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      if (WebkitSpeechRecognition) {
        const recognition = new WebkitSpeechRecognition() as SpeechRecognition
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'el-GR'

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleMicClick = () => {
    if (isListening) recognitionRef.current?.stop()
    else {
      setIsListening(true)
      recognitionRef.current?.start()
    }
  }

  const sendMessage = useCallback(async (messageTextRaw: string) => {
    const messageText = messageTextRaw.trim()
    if (!messageText.trim() || loading) return

    const userMessage: Message = { role: 'user', content: messageText }
    const lastMeaningfulAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant' && msg.actionPerformed && msg.actionPerformed !== 'chat')

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const context = getContext()
      const data = await apiService.chat({
        message: messageText,
        context: {
          ...context,
          lastActionPerformed: lastMeaningfulAssistantMessage?.actionPerformed ?? null,
          lastActionData: lastMeaningfulAssistantMessage?.data ?? null,
          recentMessages: [...messages, userMessage].slice(-6).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }
      })

      const dataSummary = formatAssistantData(data.action_performed, data.data)

      const assistantMessage: Message = {
        role: 'assistant', 
        content: [data.response || data.reply || 'Δεν έλαβα έγκυρη απάντηση.', dataSummary].filter(Boolean).join('\n\n'),
        actionPerformed: data.action_performed,
        data: data.data,
      }
      setMessages(prev => [...prev, assistantMessage])

      if (
        data.action_performed &&
        [
          'email.sync',
          'insurance.scan',
          'insurance.approve',
          'insurance.dismiss',
          'insurance.notify',
        ].includes(data.action_performed)
      ) {
        requestDashboardRefresh()
      }
    } catch (error) {
      console.error("Chat failed", error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Συγγνώμη, παρουσιάστηκε πρόβλημα στη σύνδεση.' }])
    } finally {
      setLoading(false)
    }
  }, [getContext, loading, messages, requestDashboardRefresh])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    await sendMessage(messageText)
  }

  useEffect(() => {
    const queuedMessage = assistantMessage.trim()
    if (!queuedMessage || loading) return

    if (!isAssistantOpen) {
      toggleAssistant(true)
    }

    void sendMessage(queuedMessage)
    setAssistantMessage('')
  }, [
    assistantMessage,
    isAssistantOpen,
    loading,
    sendMessage,
    setAssistantMessage,
    toggleAssistant,
  ])

  return (
    <>
      <motion.button
        onClick={() => toggleAssistant()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "fixed bottom-8 right-8 w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl z-50 transition-colors",
          isAssistantOpen ? "bg-surface border border-border text-accent" : ""
        )}
      >
        {isAssistantOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
      </motion.button>

      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 w-[380px] h-[600px] bg-surface border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{locales.assistant.title}</h3>
                  <p className="text-xs text-text-muted">
                    {loading ? locales.assistant.states.processing : isListening ? locales.assistant.states.listening : locales.assistant.states.idle}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 px-6">
                  <Bot className="w-12 h-12 mb-4" />
                  <h4 className="font-medium mb-4">{locales.assistant.placeholder}</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(locales.assistant.suggestions).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleSend(value)}
                        className="px-3 py-1.5 bg-white/5 border border-border rounded-lg text-xs hover:border-primary transition-all"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-primary text-background font-medium rounded-tr-none" 
                      : "bg-background border border-border text-text rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-end gap-2"
              >
                <div className="flex-1 bg-background border border-border rounded-xl focus-within:border-accent transition-colors overflow-hidden">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={locales.assistant.placeholder}
                    className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none"
                    rows={1}
                  />
                  <div className="flex items-center justify-between px-2 pb-2">
                    <button type="button" className="p-1.5 hover:bg-white/5 rounded-lg text-text-muted">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isListening ? "bg-danger text-white animate-pulse" : "hover:bg-white/5 text-text-muted"
                      )}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 bg-accent text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
