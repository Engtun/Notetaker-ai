import { useState, useEffect } from 'react'
import { RichTextEditor } from './RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save, 
  Calendar as CalendarIcon, 
  Clock,
  Tag,
  X
} from 'lucide-react'
import { format } from 'date-fns'

const API_BASE = '/api'

export function NoteEditor({ note, onSave, onUpdate }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '<p>Start writing your note...</p>')
  const [reviewDate, setReviewDate] = useState(note?.review_date ? new Date(note.review_date) : null)
  const [tags, setTags] = useState(note?.tags ? JSON.parse(note.tags) : [])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Auto-save functionality
  useEffect(() => {
    if (!note) return

    const autoSaveTimer = setTimeout(() => {
      handleSave(false) // Silent save
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, reviewDate, tags])

  const handleSave = async (showFeedback = true) => {
    if (!note || saving) return

    setSaving(true)
    try {
      const updatedNote = {
        title,
        content,
        review_date: reviewDate ? reviewDate.toISOString() : null,
        tags: JSON.stringify(tags)
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
        if (showFeedback && onSave) {
          onSave(savedNote)
        }
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTag()
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
              placeholder="Note title..."
            />
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                Saved {format(lastSaved, 'HH:mm')}
              </span>
            )}
            <Button 
              onClick={() => handleSave(true)} 
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Review Date */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Review Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {reviewDate ? format(reviewDate, 'MMM dd, yyyy') : 'Set date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reviewDate}
                  onSelect={setReviewDate}
                  initialFocus
                />
                {reviewDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewDate(null)}
                      className="w-full"
                    >
                      Clear Date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm">Tags:</Label>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag..."
                className="w-24 h-6 text-xs"
                size="sm"
              />
              <Button onClick={addTag} size="sm" variant="ghost" className="h-6 px-2">
                <Tag className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  )
}

