import React, { useState, useEffect, useRef, use } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../sockets/SocketProvider";
import ChatBox from "../components/ChatBox";

export default function StudentPollRoomPage() {
  const { sessionId } = useParams();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const { state } = useLocation()
  const userName = state?.name || "Anonymous"
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hasAnswered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isKicked, setIsKicked] = useState(false);
  const timerRef = useRef(null);

  // chat & participants
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("chat");
  const [chatLog, setChatLog] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    localStorage.setItem(`student_name_${sessionId}`, userName);
    socket.emit(
      "student:join-session",
      { sessionId, name: userName },
      ({ success, poll, message }) => {
        if (!success) {
          alert(
            message || "Failed to join session. Please check the Session ID."
          );
          navigate("/student");
          return;
        }
        if (poll) {
          setQuestion(poll.question);
          setOptions(poll.options);
          setAnswers(poll.answers || {});
          setAnswered(!!poll.answers?.[userName]);
          setRemaining(poll.duration);
          setIsWaiting(false);
          // start timer
          clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setRemaining((r) => {
              if (r <= 1) {
                clearInterval(timerRef.current);
                setAnswered(true);
                return 0;
              }
              return r - 1;
            });
          }, 1000);
        }
      }
    );

    socket.on("poll:new", ({ question, options, duration }) => {
      setQuestion(question);
      setOptions(options);
      setAnswers({});
      setAnswered(false);
      setSelectedIndex(null);
      setRemaining(duration);
      setIsWaiting(false);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(timerRef.current);
            setAnswered(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    });

    socket.on("poll:update-results", (latestAnswers) => {
      setAnswers(latestAnswers);
    });

    socket.on("poll:end", () => {
      setAnswered(true);
      clearInterval(timerRef.current);
    });

    socket.on("session:kicked", () => {
      setIsKicked(true);
      clearInterval(timerRef.current);
    });

    socket.on("chat:message", (msg) => setChatLog((log) => [...log, msg]));

    socket.on("session:update-users", (users) => setParticipants(users));

    return () => {
      clearInterval(timerRef.current);
      socket.off("poll:new");
      socket.off("poll:update-results");
      socket.off("poll:end");
      socket.off("session:kicked");
      socket.off("chat:message");
      socket.off("session:update-users");
    };
  }, [socket, sessionId, userName, navigate]);

  const submitAnswer = () => {
    if (selectedIndex === null) return;
    socket.emit("student:submit-answer", {
      sessionId,
      answer: options[selectedIndex],
    });
    setAnswered(true);
  };

  const sendChat = (text) => {
    const msg = { sender: userName, message: text, sessionId };
    socket.emit("chat:message", msg);
  };

  // Kicked out screen
  if (isKicked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="mb-8 inline-flex items-center bg-gradient-to-r from-[#756509] to-[#4D0ACD] text-xs font-medium uppercase px-4 py-2 rounded-full text-white shadow-lg">
          <span className="mr-2"></span> Intervue Poll
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          You've been Kicked out !
        </h1>
        <p className="text-gray-600 text-center max-w-lg">
          Looks like the teacher had removed you from the poll system .Please
          Try again sometime.
        </p>
      </div>
    );
  }
  // Waiting screen
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="mb-8 inline-flex items-center bg-gradient-to-r from-[#756509] to-[#4D0ACD] text-xs font-medium uppercase px-4 py-2 rounded-full text-white shadow-lg">
          <span className="mr-2"></span> Intervue Poll
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#756509] mb-8"></div>
        <h2 className="text-2x1 font-bold text-gray-900 mb-4">
          Wait for the teacher to ask questions.
        </h2>
      </div>
    );
  }

  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Main PoLL Card */}
      <div className="w-full max-w-3x1">
        {/* Poll Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2x1 font-bold text-gray-900">Question 1</h1>
            <div className="flex items-center space-x-4">
              <span className="text-red-500 font-mono text-lg">
                {remaining !== null ? formatTime(remaining) : "00:15"}
              </span>
            </div>
          </div>
        </div>
        {/* Question Box */}
        <div className="bg-white rounded-x1 border-2 border-[#3882F6] overflow-hidden shadow-lg mb-6">
          {/* Question Header */}
          <div className="bg-gray-700 text-white px-6 py-4">
            <h3 className="font-semibold">
              {question || "Which planet is known as the Red Planet?"}
            </h3>
          </div>

          {/* Options/Results */}
          <div className="p-6">
            {!hasAnswered ? (
              remaining > 0 ? (
                options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full flex items-center space-x-4 border-2 rounded-lg p-4 transition-all ${
                      selectedIndex === i
                        ? "border-brandPurple bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold ${
                        selectedIndex === i
                          ? "bg-brandPurple text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="flex-1 text-left font-medium">{opt}</span>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500">Time’s up!</p>
              )
            ) : (
              options.map((opt, i) => {
                const count = answers[opt] || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-brandPurple text-white rounded-full font-semibold">
                      {i + 1} 
                    </div>
                    <div className="w-16 font-medium text-gray-700">{opt}</div>
                    <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-brandPurple transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${pct}%` }}
                      >
                        {pct > 0 && (
                          <span className="text-white text-sm font-semibold">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {/* Submit Button */}
            {!hasAnswered && remaining > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={submitAnswer}
                  disabled={selectedIndex===null}
                  className="bg-gradient-to-r from-brandPurple to-brandDeep text-white font-semibold px-8 py-3 rounded-full hover:from-[#6554C8] hover:to-[#3C0ABC] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Results Footer */}
        {hasAnswered && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Wait for the teacher to ask a new question
            </p>
          </div>
        )}
      </div>

      {/* Chat Toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 bg-brandPurple text-white p-4 rounded-full shadow-1g hover:bg-[#6554C8] transition-colors z-20"
      >
        💬
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex border-b">
              {["Chat", "Participants"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t.toLowerCase())}
                  className={`flex-1 py-4 text-center font-medium ${
                    tab === t.toLowerCase()
                      ? "border-b-2 border-brandPurple text-textDark"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-4 py-4 text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tab === "chat" ? (
                <ChatBox chatLog={chatLog} onSend={sendChat} />
              ) : (
                <div className="p-6">
                  <h3 className="font-semibold text-textDark  mb-4">
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {participants.map((participant, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700">
                          {participant.name || participant}
                        </span>
                        <span className="text-sm text-gray-500">Online</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
