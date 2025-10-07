import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      router.push("/vault");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl mb-6 text-white text-center">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />
          
          <button
            type="submit"
            className="w-full p-2 bg-white text-black hover:bg-gray-200 cursor-pointer"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            href="/register" 
            className="text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            Register here
          </Link>
        </div>

        {message && (
          <p className="mt-4 text-xs text-center text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
}