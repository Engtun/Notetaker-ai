import { useState } from 'react'
import { PDFUpload } from './PDFUpload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

const API_BASE = '/api'

export function PDFUploadDialog({ selectedCourse, onNoteCreated, children }) {
  const [open, setOpen] = useState(false)
  const [generatedNote, setGeneratedNote] = useState(null)

  const handleNoteGenerated = (noteData) => {
    setGeneratedNote(noteData)
  }

  const handleAddToCourse = async () => {
    if (!generatedNote || !selectedCourse) return

    try {
      const response = await fetch(`${API_BASE}/pdf/create-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          note_data: generatedNote
        }),
      })

      if (response.ok) {
        const newNote = await response.json()
        if (onNoteCreated) {
          onNoteCreated(newNote)
        }
        setOpen(false)
        setGeneratedNote(null)
      } else {
        console.error('Failed to create note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload PDF Document</DialogTitle>
          <DialogDescription>
            Upload a PDF file to automatically generate a summary note using AI.
            {selectedCourse && ` The note will be added to "${selectedCourse.name}".`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <PDFUpload 
            onNoteGenerated={handleNoteGenerated}
            onClose={() => setOpen(false)}
          />
          
          {/* Generated Note Preview */}
          {generatedNote && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Generated Note Preview:</h3>
              <div className="space-y-2">
                <h4 className="font-medium">{generatedNote.title}</h4>
                <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{generatedNote.content}</pre>
                </div>
              </div>
              
              {selectedCourse ? (
                <div className="flex gap-2">
                  <Button onClick={handleAddToCourse} className="flex-1">
                    Add to "{selectedCourse.name}"
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedNote(null)}
                  >
                    Regenerate
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Please select a course first to add this note.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

