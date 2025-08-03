import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const options = [
    {
      key: "student",
      title: "I'm a Student",
      desc: "Lorem ipsum is simply dummy text of the printing and typesetting industry",
    },
    {
      key: "teacher",
      title: "I'm a Teacher", 
      desc: "Submit answers and view live poll results in real-time.",
    },
  ];

  const handleContinue = () => {
    if (role) navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Badge */}
      <div className="mb-8 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-4 py-2 rounded-full text-white shadow-lg">
        <span className="mr-2">✨</span> Intervue Poll
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        Welcome to the{" "}
        <span className="text-gray-900">Live Polling System</span>
      </h1>
      <p className="text-gray-600 mb-12 text-center max-w-lg leading-relaxed">
        Please select the role that best describes you to begin using the live
        polling system
      </p>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        {options.map(({ key, title, desc }) => (
          <button
            key={key}
            onClick={() => setRole(key)}
            className={`w-80 p-8 rounded-2xl border-2 transition-all duration-200 hover:shadow-xl
              ${
                role === key
                  ? "border-[#7565D9] bg-white shadow-lg ring-2 ring-[#7565D9] ring-opacity-20"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
              flex flex-col text-left
            `}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!role}
        className={`px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200
          ${
            role
              ? "bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] hover:from-[#6554C8] hover:to-[#3C0ABC] shadow-lg hover:shadow-xl transform hover:scale-105"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>
    </div>
  );
}
