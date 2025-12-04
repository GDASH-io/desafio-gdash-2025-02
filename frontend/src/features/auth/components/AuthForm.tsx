import React, { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { registerUser } from "../../../services/auth-router/register";
import { loginUser } from "../../../services/auth-router/login";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

interface AuthFormProps {
  tab: "login" | "register";
  setTab: (v: "login" | "register") => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  showToast: (msg: string) => void;
  navigate: (path: string) => void;
}

export function AuthForm({ tab, setTab, loading, setLoading, showToast, navigate }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Função que tenta capturar a geolocalização, aguardando até 10 segundos
  const getLocation = async () => {
    return new Promise<{ latitude?: number; longitude?: number }>(async (resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          async () => {
            // fallback por IP
            try {
              const res = await fetch("https://ipapi.co/json/");
              const data = await res.json();
              resolve({ latitude: data.latitude, longitude: data.longitude });
            } catch {
              resolve({});
            }
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      } else {
        resolve({});
      }
    });
  };

  const submitAuth = async (type: "login" | "register") => {
    setLoading(true);
    setError("");

    try {
      const location = await getLocation();
      console.log("Location captured:", location);

      if (type === "register") {
        await registerUser({ name, email, password, ...location });
        showToast("Registration successful!");
      } else {
        await loginUser({ email, password, ...location });
        showToast("Login successful!");
      }

      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 8000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {tab === "register" && (
          <motion.div
            key="username"
            className="relative w-full"
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <Input
              className="pl-12 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border-white/30"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="relative w-full" variants={fieldVariants} initial="hidden" animate="visible">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
        <Input
          className="pl-12 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border-white/30"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </motion.div>

      <motion.div className="relative w-full" variants={fieldVariants} initial="hidden" animate="visible">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
        <Input
          className="pl-12 py-4 rounded-xl bg-white/20 placeholder-white/60 text-white border-white/30"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </motion.div>

      {tab === "login" && (
        <motion.label className="flex items-center gap-2 text-white mb-4">
          <Checkbox className="border-white data-[state=checked]:bg-white" />
          Remember me
        </motion.label>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <Button
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-lg"
        onClick={() => submitAuth(tab)}
        disabled={loading}
      >
        {tab === "login" ? "Login" : "Register"}
      </Button>

      <p className="text-center text-sm text-white/70 mt-2">
        {tab === "login" ? "Don’t have an account? " : "Already have an account? "}
        <button
          className="text-blue-300 underline"
          onClick={() => setTab(tab === "login" ? "register" : "login")}
        >
          {tab === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </>
  );
}
