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
      ({ success, poll, message }) => {
        if (success) {
          navigate(`/student/${sessionId}/poll`, { state: { poll } });
        } else {
          setError(message || "Failed to join session. Please check your Session ID.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-4 py-2 rounded-full text-white shadow-lg">
        <span className="mr-2">✨</span> Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        Let's <span className="text-gray-900">Get Started</span>
      </h1>
      <p className="text-gray-600 mb-12 text-center max-w-lg leading-relaxed">
        Enter the Session ID provided by your teacher, then your name, to join
        their live poll.
      </p>

      {/* Inputs */}
      <div className="w-full max-w-md space-y-6 mb-8">
        <div>
          <label className="block mb-2 font-semibold text-gray-900">
            Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="e.g. room-1234"
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-[#7565D9] transition-colors"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-900">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Bajaj"
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 focus:outline-none focus:border-[#7565D9] transition-colors"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Continue */}
      <button
        onClick={handleContinue}
        disabled={!sessionId.trim() || !name.trim()}
        className={`px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200 shadow-lg
          ${
            sessionId && name
              ? "bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] hover:from-[#6554C8] hover:to-[#3C0ABC] hover:shadow-xl transform hover:scale-105"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>
    </div>
  );
}
