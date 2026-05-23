"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  async function handleLogin() {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      alert("Login Successful");
      router.push("/");
    } else {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-lg w-full mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-lg w-full mb-4"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg w-full"
        >
          Login
        </button>

        <p className="text-center mt-4">
            Do not have an account?{" "}
            <a href="/signup" className="text-blue-600 font-bold">
                Signup
            </a>
        </p>

      </div>

    </div>
  );
}