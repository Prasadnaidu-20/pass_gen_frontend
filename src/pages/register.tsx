import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage(res.data.message);
      router.push("/login");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl mb-6 text-white text-center">Register</h2>
        
        <form onSubmit={handleRegister} className="space-y-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />
          
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
            Register
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            href="/login" 
            className="text-sm text-gray-400 hover:text-white cursor-pointer"
          >
            Already have an account? Login here
          </Link>
        </div>

        {message && (
          <p className="mt-4 text-xs text-center text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
}