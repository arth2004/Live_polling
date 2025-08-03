import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage          from './pages/LandingPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import PollRoomPage         from './pages/PollRoomPage'
import StudentPage          from './pages/StudentPage'
import StudentPollRoomPage  from './pages/StudentPollroomPage'

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Teacher: invite + create */}
      <Route
        path="/teacher/:sessionId?"
        element={<TeacherDashboardPage />}
      />

      {/* Teacher live-poll */}
      <Route
        path="/teacher/:sessionId/poll"
        element={<PollRoomPage userName="Teacher" />}
      />

      {/* Student join */}
      <Route path="/student" element={<StudentPage />} />

      {/* Student live-poll */}
      <Route
        path="/student/:sessionId/poll"
        element={<StudentPollRoomPage  />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
