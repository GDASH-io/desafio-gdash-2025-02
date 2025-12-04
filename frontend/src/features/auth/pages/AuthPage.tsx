import React, { useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { BackgroundEffect } from "../components/BackgroundEffect";
import { WeatherStats } from "../components/WeatherStats";
import { AuthForm } from "../components/AuthForm";
import { LoadingOverlay } from "../../../components/layout/LoadingOverlay";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); 
  const weather = useWeather();
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="w-screen h-screen relative flex justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
      <BackgroundEffect weather={weather} />
      <LoadingOverlay visible={loading} />
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl space-y-6">
        <WeatherStats weather={weather} />
        <AuthForm
          tab={tab}
          setTab={setTab}
          loading={loading}
          setLoading={setLoading}
          showToast={showToast}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
