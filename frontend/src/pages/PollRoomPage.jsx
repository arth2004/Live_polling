import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FiMessageCircle, FiEye, FiX } from "react-icons/fi";
import { useSocket } from "../sockets/SocketProvider";
import ChatBox from "../components/ChatBox";
import { Button } from "../components/Button";

export default function PollRoomPage({ userName = "Teacher" }) {
  const { sessionId } = useParams();
  const socket = useSocket();

  // Poll state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]); // [{ text, count }]
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [remaining, setRemaining] = useState(null); // seconds left

  // Sidebar/chat
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("chat");
  const [chatLog, setChatLog] = useState([]);
  const [participants, setParticipants] = useState([]);

  // New-question form
  const [showForm, setShowForm] = useState(false);
  const [draftQ, setDraftQ] = useState("");
  const [draftOpts, setDraftOpts] = useState(["", ""]);
  const [draftDur, setDraftDur] = useState(30);

  const timerRef = useRef(null);

  // join + listeners
  useEffect(() => {
    socket.emit(
      "student:join-session",
      { sessionId, name: userName },
      ({ success, poll }) => {
        if (success && poll) {
          // initialize the poll if one is already active
          setQuestion(poll.question);
          setOptions(poll.options.map((t) => ({ text: t, count: 0 })));
          setTotalAnswers(
            Object.values(poll.answers || {}).reduce((a, b) => a + b, 0)
          );
          setRemaining(poll.duration);
          // start countdown
          clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setRemaining((r) => (r > 0 ? r - 1 : 0));
          }, 1000);
        }
      }
    );

    socket.on("poll:new", ({ question, options, duration }) => {
      // reset state
      setQuestion(question);
      setOptions(options.map((text) => ({ text, count: 0 })));
      setTotalAnswers(0);
      setRemaining(duration);

      // countdown
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    });

    socket.on("poll:update-results", (answers) => {
      const newTotal = Object.values(answers).reduce((a, b) => a + b, 0);
      setTotalAnswers(newTotal);
      setOptions((opts) =>
        opts.map((o) => ({ ...o, count: answers[o.text] || 0 }))
      );
    });

    socket.on("chat:message", (msg) => setChatLog((log) => [...log, msg]));

    socket.on("session:update-users", (users) => setParticipants(users));

    return () => {
      clearInterval(timerRef.current);
      socket.off("poll:new");
      socket.off("poll:update-results");
      socket.off("chat:message");
      socket.off("session:update-users");
    };
  }, [socket, sessionId, userName]);

  // send new poll
  const handlePublish = () => {
    // only non-empty question + ≥2 options
    const opts = draftOpts.filter((o) => o.trim() !== "");
    if (!draftQ.trim() || opts.length < 2) return;

    socket.emit(
      "teacher:create-poll",
      {
        sessionId,
        question: draftQ,
        options: opts,
        duration: draftDur,
      },
      () => {
        // close & reset
        setShowForm(false);
        setDraftQ("");
        setDraftOpts(["", ""]);
        setDraftDur(30);
      }
    );
  };

  // dynamic option inputs
  const updateOpt = (i, v) =>
    setDraftOpts((os) => os.map((o, j) => (j === i ? v : o)));
  const addOpt = () => setDraftOpts((os) => [...os, ""]);
  const removeOpt = (i) => setDraftOpts((os) => os.filter((_, j) => j !== i));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Poll Card */}
        <h2 className="text-lg font-bold mb-2 text-black">Question</h2>
        <div className="bg-poll-card rounded-lg shadow-sm overflow-hidden">
          {/* Header bar */}
          <div className="bg-poll-header text-white py-3 flex justify-between items-center">
            <p className="font-bold p-4 text-white bg-gradient-to-r from-textDark to-textGray w-full">
              {question}
            </p>
            {/* <p className="font-mono text-black">{remaining != null ? `0:${remaining.toString().padStart(2,'0')}` : "--:--"}</p> */}
          </div>

          {/* Bars */}
          <div className="py-6 space-y-4">
            {options.map((opt, i) => {
              const pct = totalAnswers
                ? Math.round((opt.count / totalAnswers) * 100)
                : 0;
              return (
                <div key={i} className="flex items-center gap-4 bg-[f6f6f6]">
                  <div className="w-8 h-8 bg-brandPurple text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="w-16 text-poll-text font-medium truncate">
                    {opt.text}
                  </div>
                  <div className="flex-1 bg-poll-bar-bg rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-poll-text font-medium">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end mt-6 ">
          <Button
            variant="secondary"
            onClick={() => setShowForm(true)}
            className=" text-white rounded-full  hover:bg-primary/90 bg-gradient-to-r from-brandPurple to-brandBlue"
          >
           +
            Ask a new question
          </Button>
        </div>
      </div>

      {/* Chat Toggle */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="fixed bottom-10 right-20 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition z-20"
      >
        <FiMessageCircle size={24} />
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed bottom-24 h-1/2 right-20 w-80 bg-poll-card shadow-xl z-30 flex flex-col">
          <div className="flex border-b border-border">
            {["chat", "participants"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-center transition-colors ${
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-poll-text hover:text-primary"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === "chat" ? (
              <ChatBox
                chatLog={chatLog}
                onSend={(text) =>
                  socket.emit("chat:message", {
                    sender: userName,
                    message: text,
                    sessionId,
                  })
                }
              />
            ) : (
              <ul className="p-4 space-y-2">
                {participants.map((name, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span className="text-poll-text truncate">{name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        socket.emit("teacher:remove-student", {
                          sessionId,
                          name,
                        })
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      Kick
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Ask-New-Question Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>

            <h3 className="text-lg font-semibold">New Poll</h3>
            <input
              type="text"
              placeholder="Your question"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <div className="space-y-2">
              {draftOpts.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOpt(i, e.target.value)}
                    className="flex-1 border px-3 py-2 rounded"
                  />
                  {draftOpts.length > 2 && (
                    <button
                      onClick={() => removeOpt(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOpt}
                className="text-sm text-primary hover:underline"
              >
                + Add another option
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Duration (sec):</label>
              <input
                type="number"
                min={5}
                max={300}
                value={draftDur}
                onChange={(e) => setDraftDur(Number(e.target.value))}
                className="w-20 border px-2 py-1 rounded"
              />
            </div>

            <div className="text-right">
              <Button onClick={handlePublish} className="px-6">
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
