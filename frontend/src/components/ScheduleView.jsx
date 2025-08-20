import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'

const API_BASE = '/api'

export function ScheduleView({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [notes, setNotes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('calendar') // 'calendar' or 'list'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch courses
      const coursesResponse = await fetch(`${API_BASE}/courses`)
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData)
        
        // Fetch notes for all courses
        const allNotes = []
        for (const course of coursesData) {
          const notesResponse = await fetch(`${API_BASE}/courses/${course.id}/notes`)
          if (notesResponse.ok) {
            const notesData = await notesResponse.json()
            allNotes.push(...notesData.map(note => ({ ...note, course })))
          }
        }
        setNotes(allNotes)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotesWithReviewDates = () => {
    return notes.filter(note => note.review_date)
  }

  const getNotesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return getNotesWithReviewDates().filter(note => {
      if (!note.review_date) return false
      const reviewDate = format(parseISO(note.review_date), 'yyyy-MM-dd')
      return reviewDate === dateStr
    })
  }

  const getUpcomingNotes = () => {
    const now = new Date()
    return getNotesWithReviewDates()
      .filter(note => parseISO(note.review_date) >= now)
      .sort((a, b) => parseISO(a.review_date) - parseISO(b.review_date))
  }

  const getOverdueNotes = () => {
    const now = new Date()
    return getNotesWithReviewDates()
      .filter(note => parseISO(note.review_date) < now)
      .sort((a, b) => parseISO(b.review_date) - parseISO(a.review_date))
  }

  const formatRelativeDate = (dateStr) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isThisWeek(date)) return format(date, 'EEEE')
    return format(date, 'MMM d, yyyy')
  }

  const getCourseColor = (course) => {
    const colors = {
      'red': 'bg-red-100 text-red-800',
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'purple': 'bg-purple-100 text-purple-800',
      'pink': 'bg-pink-100 text-pink-800',
      'indigo': 'bg-indigo-100 text-indigo-800',
      'gray': 'bg-gray-100 text-gray-800'
    }
    return colors[course?.color] || colors.gray
  }

  const selectedDateNotes = getNotesForDate(selectedDate)
  const upcomingNotes = getUpcomingNotes()
  const overdueNotes = getOverdueNotes()

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading schedule...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Study Schedule
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {view === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasReview: (date) => getNotesForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasReview: { 
                    backgroundColor: 'rgb(59 130 246)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Days with review notes</span>
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            <div>
              <h3 className="font-semibold mb-3">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              
              {selectedDateNotes.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateNotes.map((note) => (
                    <Card key={note.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`mt-1 text-xs ${getCourseColor(note.course)}`}
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            {note.course?.name}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(note.review_date), 'h:mm a')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reviews scheduled for this date</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Overdue */}
            {overdueNotes.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Overdue ({overdueNotes.length})
                </h3>
                <div className="space-y-2">
                  {overdueNotes.map((note) => (
                    <Card key={note.id} className="p-3 border-red-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getCourseColor(note.course)}`}
                            >
                              {note.course?.name}
                            </Badge>
                            <span className="text-xs text-red-600">
                              Due {formatRelativeDate(note.review_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Upcoming ({upcomingNotes.length})
              </h3>
              {upcomingNotes.length > 0 ? (
                <div className="space-y-2">
                  {upcomingNotes.map((note) => (
                    <Card key={note.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{note.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getCourseColor(note.course)}`}
                            >
                              {note.course?.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeDate(note.review_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming reviews scheduled</p>
                  <p className="text-sm mt-1">Add review dates to your notes to see them here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

