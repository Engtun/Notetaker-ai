import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CreateCourseDialog } from '@/components/CreateCourseDialog'
import { CreateNoteDialog } from '@/components/CreateNoteDialog'
import { SimpleNoteEditor } from '@/components/SimpleNoteEditor'
import { PDFUploadDialog } from '@/components/PDFUploadDialog'
import { AIAssistantDialog } from '@/components/AIAssistantDialog'
import { ScheduleDialog } from '@/components/ScheduleDialog'
import { BookOpen, Search, Calendar, Bot, Upload, X } from 'lucide-react'
import './App.css'

const API_BASE = '/api'

function App() {
  const [courses, setCourses] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Fetch courses on mount
  useEffect(() => { fetchCourses() }, [])

  // Fetch notes when a course is selected
  useEffect(() => { if (selectedCourse) fetchNotes(selectedCourse.id) }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`)
      const data = await res.json()
      setCourses(data)
      if (data.length && !selectedCourse) setSelectedCourse(data[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchNotes = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE}/courses/${courseId}/notes`)
      const data = await res.json()
      setNotes(data)
      if (data.length && !selectedNote) setSelectedNote(data[0])
    } catch (e) { console.error(e) }
  }

  const createCourse = async (courseData) => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      })
      const newCourse = await res.json()
      setCourses([...courses, newCourse])
      setSelectedCourse(newCourse)
    } catch (e) { console.error(e) }
  }

  const createNote = async (noteData) => {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, course_id: selectedCourse.id }),
      })
      const newNote = await res.json()
      setNotes([...notes, newNote])
      setSelectedNote(newNote)
    } catch (e) { console.error(e) }
  }

  const updateNote = (updatedNote) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n))
    if (selectedNote?.id === updatedNote.id) setSelectedNote(updatedNote)
  }

  const handlePDFNoteCreated = (newNote) => {
    setNotes([...notes, newNote])
    setSelectedNote(newNote)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading StudyNotes...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-card`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <BookOpen className="h-6 w-6" /> StudyNotes
                </h1>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search notes..." className="pl-10" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Courses Section */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Courses</h2>
                <CreateCourseDialog onCreateCourse={createCourse} />
              </div>
              <div className="space-y-2 mb-6">
                {courses.map(course => (
                  <Card
                    key={course.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedCourse?.id === course.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
                        <div>
                          <h3 className="font-medium text-sm">{course.name}</h3>
                          <p className="text-xs text-muted-foreground">{course.notes_count} notes</p>
                        </div>
                      </div>
                      <Badge>{course.notes_count}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Notes Section */}
              {selectedCourse && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Notes</h2>
                    <div className="flex gap-2">
                      <CreateNoteDialog courseId={selectedCourse.id} onCreateNote={createNote} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {notes.map(note => (
                      <Card
                        key={note.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-medium">{note.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{note.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 p-6 relative">
          {selectedNote ? (
            <SimpleNoteEditor note={selectedNote} onUpdateNote={updateNote} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a note to start editing
            </div>
          )}

          {/* Top Right Action Buttons */}
          <div className="fixed top-6 right-6 flex gap-2">
            {selectedCourse && (
              <>
                <PDFUploadDialog selectedCourse={selectedCourse} onNoteCreated={handlePDFNoteCreated}>

                  <Button className="shadow-lg">
                    <Upload className="w-4 h-4 mr-1" /> Upload PDF
                  </Button>
                </PDFUploadDialog>
                <ScheduleDialog courseId={selectedCourse.id}>
                  <Button className="shadow-lg">
                    <Calendar className="w-4 h-4 mr-1" /> Schedule
                  </Button>
                </ScheduleDialog>
              </>
            )}
          </div>

          {/* AI Assistant */}
          <AIAssistantDialog>
            <Button className="fixed bottom-6 right-6 rounded-full p-3 shadow-lg bg-primary text-white">
              <Bot className="w-6 h-6" />
            </Button>
          </AIAssistantDialog>
        </div>
      </div>
    </Router>
  )
}

export default App
