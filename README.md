# Live Polling System

A real-time interactive polling system built with React, Express.js, and Socket.IO that allows teachers to create polls and students to participate in real-time.

## Features

### Core Features
- **Role-based Access**: Separate interfaces for Teachers and Students
- **Real-time Polling**: Live poll creation and response collection
- **Live Results**: Real-time result visualization with percentages
- **Timer Functionality**: Configurable poll duration with automatic closure
- **Student Management**: Teachers can remove (kick out) students
- **Chat System**: Real-time chat between teachers and students
- **Responsive Design**: Modern UI that works on all devices

### Teacher Features
- Create new polling sessions
- Design polls with multiple choice questions
- Set custom time limits (5-300 seconds)
- View live polling results with percentages
- Manage participants (view and remove students)
- Access chat for interaction with students
- Add multiple answer options

### Student Features
- Join sessions using Session ID and name
- Submit answers to active polls
- View live results after submission
- Participate in chat discussions
- Real-time notifications for new polls
- Automatic results display when time expires

### Bonus Features
- **Chat Popup**: Interactive communication between teachers and students
- **Kick Out Functionality**: Teachers can remove disruptive students
- **Poll History**: Track completed polls (backend ready)
- **Beautiful UI**: Matches provided Figma designs exactly

## Technology Stack

### Frontend
- **React 19.1.0**: Modern React with hooks
- **React Router 7.7.1**: Client-side routing
- **Socket.IO Client 4.8.1**: Real-time communication
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Vite**: Fast development build tool

### Backend
- **Express.js 5.1.0**: Web application framework
- **Socket.IO 4.8.1**: Real-time bidirectional communication
- **Node.js**: Server runtime
- **CORS**: Cross-origin resource sharing

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   node src/app.js
   ```

The backend server will start on port 3001.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173

## Usage Guide

### Getting Started

1. **Access the Application**: Open http://localhost:5173 in your browser

2. **Choose Your Role**: Select either "I'm a Teacher" or "I'm a Student"

### For Teachers

1. **Create a Session**:
   - Click "I'm a Teacher" on the landing page
   - A new session will be created automatically
   - Note the Session ID displayed

2. **Create a Poll**:
   - Enter your question in the text area
   - Add answer options (minimum 2 required)
   - Mark correct answers using radio buttons
   - Set the time limit (default 60 seconds)
   - Click "Ask Question" to start the poll

3. **Monitor Results**:
   - View real-time responses as students submit answers
   - See percentage breakdowns for each option
   - Timer shows remaining time

4. **Manage Students**:
   - Click "View Poll History" to open the sidebar
   - Switch to "Participants" tab
   - View all connected students
   - Use "Kick out" to remove students if needed

5. **Use Chat**:
   - Click the chat icon (💬) to open chat
   - Send messages to all participants
   - Monitor student questions and feedback

### For Students

1. **Join a Session**:
   - Click "I'm a Student" on the landing page
   - Enter the Session ID provided by your teacher
   - Enter your name
   - Click "Continue"

2. **Participate in Polls**:
   - Wait for the teacher to start a poll
   - Select your answer from the options
   - Click "Submit Answer"
   - View live results after submission

3. **Use Chat**:
   - Click the chat icon to participate in discussions
   - Ask questions or provide feedback to the teacher

## API Endpoints

### Socket.IO Events

#### Teacher Events
- `teacher:create-session` - Create a new polling session
- `teacher:create-poll` - Create and start a new poll
- `teacher:remove-student` - Remove a student from the session
- `chat:message` - Send chat messages

#### Student Events
- `student:join-session` - Join an existing session
- `student:submit-answer` - Submit poll response
- `chat:message` - Send chat messages

#### Broadcast Events
- `poll:new` - New poll started
- `poll:update-results` - Real-time result updates
- `poll:end` - Poll time expired
- `session:update-users` - Participant list updated
- `session:kicked` - Student removed notification
- `chat:message` - New chat message

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=3001
```

### Customization
- **Timer Options**: Modify `TIME_OPTIONS` in `TeacherDashboardPage.jsx`
- **Styling**: Update Tailwind configuration in `tailwind.config.cjs`
- **Socket Configuration**: Modify settings in `backend/src/sockets/index.js`

## File Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── sockets/            # Socket.IO client setup
│   │   └── ...
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── models/             # Data models and storage
│   │   ├── services/           # Business logic
│   │   ├── sockets/            # Socket.IO server handlers
│   │   └── app.js              # Main server file
│   └── package.json
└── README.md
```

## Development Notes

- The system uses in-memory storage for simplicity
- Session data is lost when the server restarts
- For production, consider implementing persistent storage
- The UI exactly matches the provided Figma designs
- All required features are implemented and functional

## Troubleshooting

### Common Issues

1. **Connection Issues**: Ensure both frontend (5173) and backend (3001) servers are running
2. **Socket Connection**: Check browser console for WebSocket connection errors
3. **CORS Issues**: Backend includes CORS middleware for development

### Development Tips

- Use browser developer tools to monitor Socket.IO connections
- Check server console for error messages
- Restart servers if experiencing connection issues

## Future Enhancements

- Persistent database storage
- User authentication and authorization
- Poll analytics and reporting
- Multiple session management
- Export poll results
- Mobile app version

## License

This project is developed for educational purposes.