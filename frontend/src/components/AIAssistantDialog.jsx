import { useState } from 'react'
import { AIAssistant } from './AIAssistant'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export function AIAssistantDialog({ selectedNote, selectedCourse, children }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>AI Study Assistant</DialogTitle>
          <DialogDescription>
            Get help with your notes, generate summaries, create study questions, and ask questions about your course material.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[60vh]">
          <AIAssistant 
            selectedNote={selectedNote}
            selectedCourse={selectedCourse}
            onClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

