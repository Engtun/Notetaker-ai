import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Bot,
  Send,
  Loader2,
  MessageSquare,
  FileText,
  HelpCircle,
  Lightbulb,
  X
} from 'lucide-react'

const API_BASE = '/api'

export function AIAssistant({ selectedNote, selectedCourse, onClose }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState('chat') // 'chat', 'summarize', 'questions'
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (content, type = 'user', feature = null) => {
    const message = {
      id: Date.now(),
      content,
      type,
      feature,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
    return message
  }

  const handleSummarizeNote = async () => {
    if (!selectedNote) return

    setLoading(true)
    addMessage(`Summarize the note "${selectedNote.title}"`, 'user', 'summarize')

    try {
      const response = await fetch(`${API_BASE}/ai/summarize-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_id: selectedNote.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addMessage(data.summary, 'assistant', 'summarize')
      } else {
        const error = await response.json()
        addMessage(`Error: ${error.error}`, 'error')
      }
    } catch (error) {
      addMessage('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuestions = async () => {
    if (!selectedNote) return

    setLoading(true)
    addMessage(`Generate study questions for "${selectedNote.title}"`, 'user', 'questions')

    try {
      const response = await fetch(`${API_BASE}/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_id: selectedNote.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addMessage(data.questions, 'assistant', 'questions')
      } else {
        const error = await response.json()
        addMessage(`Error: ${error.error}`, 'error')
      }
    } catch (error) {
      addMessage('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    addMessage(userMessage, 'user', 'chat')

    try {
      let endpoint = `${API_BASE}/ai/chat`
      let payload = {
        message: userMessage
      }

      // Add context based on what's selected
      if (selectedNote) {
        endpoint = `${API_BASE}/ai/ask-question`
        payload = {
          question: userMessage,
          note_id: selectedNote.id
        }
      } else if (selectedCourse) {
        payload.course_id = selectedCourse.id
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        const reply = data.reply || data.answer
        addMessage(reply, 'assistant', 'chat')
      } else {
        const error = await response.json()
        addMessage(`Error: ${error.error}`, 'error')
      }
    } catch (error) {
      addMessage('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
        {line}
      </div>
    ))
  }

  return (
    <Card className="h-full flex flex-col">
      {/* <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Study Assistant
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader> */}

      {/* Context Info */}
      {(selectedNote || selectedCourse) && (
        <div className="px-6 pb-3">
          <div className="text-sm text-muted-foreground">
            Context: {selectedNote ? (
              <Badge variant="secondary">
                <FileText className="h-3 w-3 mr-1" />
                {selectedNote.title}
              </Badge>
            ) : selectedCourse ? (
              <Badge variant="outline">
                {selectedCourse.name}
              </Badge>
            ) : 'General'}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedNote && (
        <div className="px-6 pb-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarizeNote}
              disabled={loading}
            >
              <FileText className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateQuestions}
              disabled={loading}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Study Questions
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">AI Study Assistant</p>
            <p className="text-sm">
              Ask questions about your notes, get summaries, or generate study questions.
            </p>
            {selectedNote && (
              <p className="text-xs mt-2">
                Currently focused on: <strong>{selectedNote.title}</strong>
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.type === 'error'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-muted'
                }`}
            >
              <div className="text-sm">
                {formatMessage(message.content)}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedNote
                ? `Ask a question about "${selectedNote.title}"...`
                : selectedCourse
                  ? `Ask about ${selectedCourse.name}...`
                  : "Ask me anything about your notes..."
            }
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

