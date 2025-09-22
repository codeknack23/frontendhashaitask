"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false); // Loading state
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setSubmitting(true); 
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password });
      alert("Registration successful! Please login.");
      router.push("/");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold">Register - HashAi Task</h2>
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={submitting}
        >
          {submitting ? "Registering..." : "Register"}
        </button>
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
