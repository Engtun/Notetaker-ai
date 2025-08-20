import { useState } from 'react'
import { ScheduleView } from './ScheduleView'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

export function ScheduleDialog({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Study Schedule</DialogTitle>
          <DialogDescription>
            View and manage your note review schedule. Set review dates for your notes to create an effective study routine.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[60vh]">
          <ScheduleView onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

