// src/pages/StudentPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../sockets/SocketProvider"; // your socket hook

export default function StudentPage() {
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handleContinue = () => {
    setError("");
    if (!sessionId.trim() || !name.trim()) {
      setError("Both Session ID and Name are required.");
      return;
    }

    socket.emit(
      "student:join-session",
      { name, sessionId },
      ({ success, poll }) => {
        if (success) {
          navigate(`/student/${sessionId}/poll`, { state: { poll } });
        } else {
          alert("Join failed");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16 px-4">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-3 py-1 rounded-full text-white">
        Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-textDark mb-2">
        Let’s <span className="text-brandPurple">Get Started</span>
      </h1>
      <p className="text-textGray mb-8 text-center max-w-lg">
        Enter the Session ID provided by your teacher, then your name, to join
        their live poll.
      </p>

      {/* Inputs */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-medium text-textDark">
            Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="e.g. room-1234"
            className="w-full bg-[#F2F2F2] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-textDark">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Bajaj"
            className="w-full bg-bgLight p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!sessionId.trim() || !name.trim()}
        className={`
          px-12 py-3 rounded-full text-white font-medium transition
          ${
            sessionId && name
              ? "bg-gradient-to-r from-brandPurple to-brandDeep hover:opacity-90"
              : "opacity-50 cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>
    </div>
  );
}
