import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const options = [
    {
      key: "student",
      title: "I’m a Student",
      desc: "Submit answers and view live poll results in real time",
    },
    {
      key: "teacher",
      title: "I’m a Teacher",
      desc: "Create polls, see live scoring, and manage participants",
    },
  ];

  const handleContinue = () => {
    if (role) navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-bgLight flex flex-col items-center justify-center px-4 ">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-3 py-1 rounded-full text-white shoadow-lg">
        <span className="mr-2">✨</span> Intervue Poll
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold  text-textDark mb-4 text-center">
        Welcome to the{" "}
        <span className="text-textDark font-bold">Live Polling System</span>
      </h1>
      <p className="text-textGray mb-12 text-center max-w-lg leading-relaxed">
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
                  ? "border-brandPurple bg-white shadow-lg ring-2 ring-brandPurple ring-opacity-20"
                  : "border-gray-200 bg-white hover:border-textGray"
              }
              flex flex-col text-left
            `}
          >
            <h2 className="text-xl font-bold text-textDark mb-3">
              {title}
            </h2>
            <p className="text-textGray text-sm leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!role}
        className={`px-12 py-3 rounded-full text-white font-semobold text-lg transition-all duration-200  
          ${
            role
              ? "bg-gradient-to-r from-brandPurple to-brandDeep hover:from-brandDeep hover:to-brandPurple shadow-lg hover:shadow-xl transform hover:scale-105"
              : "bg-textGray cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>
    </div>
  );
}
