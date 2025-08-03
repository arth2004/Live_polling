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
    <div className="min-h-screen bg-bgLight flex flex-col items-center justify-center  pt-16 px-4 ">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-xs font-medium uppercase px-3 py-1 rounded-full text-white">
        Intervue Poll
      </div>

      {/* Title */}
      <h1 className="text-4xl text-textDark mb-2">
        Welcome to the{" "}
        <span className="text-textDark font-bold">Live Polling System</span>
      </h1>
      <p className="text-textGray mb-12 text-center max-w-md">
        Please select the role that best describes you to begin using the live
        polling system
      </p>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12">
        {options.map(({ key, title, desc }) => (
          <button
            key={key}
            onClick={() => setRole(key)}
            className={`w-64 p-6 rounded-lg border-2
              ${
                role === key
                  ? "border-brandPurple bg-white"
                  : "border-gray-200 bg-white"
              }
              hover:shadow-lg transition
              flex flex-col
            `}
          >
            <h2 className="text-xl font-semibold text-textDark mb-2">
              {title}
            </h2>
            <p className="text-textGray text-sm">{desc}</p>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!role}
        className={`px-12 py-3 rounded-full text-white font-medium
          ${
            role
              ? "bg-gradient-to-r from-brandPurple to-brandDeep hover:from-brandDeep hover:to-brandPurple"
              : "opacity-50 cursor-not-allowed"
          }
          transition
        `}
      >
        Continue
      </button>
    </div>
  );
}
