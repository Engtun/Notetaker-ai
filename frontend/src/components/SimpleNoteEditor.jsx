import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Clock, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react'
import { format } from 'date-fns'

const API_BASE = '/api'

export function SimpleNoteEditor({ note, onSave, onUpdate }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [reviewDate, setReviewDate] = useState(
    note?.review_date ? new Date(note.review_date) : null
  )
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setReviewDate(note.review_date ? new Date(note.review_date) : null)
    }
  }, [note])

  const handleSave = async () => {
    if (!note || saving) return

    setSaving(true)
    try {
      const updatedNote = {
        title,
        content,
        plain_content: content, // For search functionality
        review_date: reviewDate ? reviewDate.toISOString() : null,
        tags: note.tags
      }

      const response = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      })

      if (response.ok) {
        const savedNote = await response.json()
        setLastSaved(new Date())
        if (onUpdate) {
          onUpdate(savedNote)
        }
        if (onSave) {
          onSave(savedNote)
        }
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">No note selected</h2>
          <p className="text-muted-foreground">
            Select a note from the sidebar to start editing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
              placeholder="Note title..."
            />
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          {/* Review Date Section */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Review Date:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="h-3 w-3 mr-2" />
                  {reviewDate ? format(reviewDate, 'MMM d, yyyy') : 'Set review date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reviewDate}
                  onSelect={setReviewDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {reviewDate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setReviewDate(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {reviewDate && (
              <Badge variant="secondary" className="text-xs">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {format(reviewDate, 'MMM d, yyyy')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            className="min-h-[400px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}

