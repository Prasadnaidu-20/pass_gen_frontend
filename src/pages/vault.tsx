"use client";
import { useState, useEffect, useRef, useCallback} from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  password: string;
}

export default function Vault() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [form, setForm] = useState<VaultItem>({
    title: "",
    username: "",
    password: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const clearTimerRef = useRef<number | null>(null);

  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);

  const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const encrypt = (text: string) =>
    CryptoJS.AES.encrypt(text, secretKey).toString();

  const decrypt = (cipher: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "Error decrypting";
    }
  };

  const generatePassword = () => {
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-={}[]|:;<>,.?/";

    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    setForm({ ...form, password: pwd });
  };

  const fetchVault = useCallback(async () => {
  if (!token) return;
  try {
    const res = await axios.get(`${API_URL}/api/vault`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const decryptedData = res.data.map((item: VaultItem) => ({
      ...item,
      password: decrypt(item.password),
    }));
    setVaultItems(decryptedData);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}, [token, API_URL,decrypt]);

  useEffect(() => {
  fetchVault();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const encrypted = encrypt(form.password);
      if (editingId) {
        await axios.put(
          `${API_URL}/api/vault/${editingId}`,
          { ...form, password: encrypted },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingId(null);
      } else {
        await axios.post(
          `${API_URL}/api/vault`,
          { ...form, password: encrypted },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setForm({ title: "", username: "", password: "" });
      fetchVault();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleEdit = (item: VaultItem) => {
    setForm(item);
    setEditingId(item._id || null);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !token) return;
    try {
      await axios.delete(`${API_URL}/api/vault/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVault();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const copyAndAutoClear = async (text: string, timeoutMs = 15000) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied! Will clear in 15s");

      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }

      clearTimerRef.current = window.setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
          setMessage("Clipboard cleared");
        } catch {
          setMessage("Could not clear clipboard automatically");
        } finally {
          clearTimerRef.current = null;
        }
      }, timeoutMs);
    } catch (err) {
      console.error("Clipboard error:", err);
      setMessage("Failed to copy");
    }
  };

  const filteredItems = vaultItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-gray-300 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-6 text-white">Password Vault</h1>

        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />

          <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Length: {length}</span>
            </div>
            <input
              type="range"
              min={6}
              max={32}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full cursor-pointer"
            />

            <div className="flex gap-4 text-xs">
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={() => setIncludeUppercase(!includeUppercase)}
                  className="cursor-pointer"
                />{" "}
                ABC
              </label>
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={() => setIncludeNumbers(!includeNumbers)}
                  className="cursor-pointer"
                />{" "}
                123
              </label>
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={() => setIncludeSymbols(!includeSymbols)}
                  className="cursor-pointer"
                />{" "}
                !@#
              </label>
            </div>

            <button
              type="button"
              onClick={generatePassword}
              className="w-full p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer"
            >
              Generate
            </button>
          </div>

          <input
            type="text"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
          />

          <button
            type="submit"
            className="w-full p-2 bg-white text-black hover:bg-gray-200 cursor-pointer"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </form>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700"
        />

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-neutral-900 border border-neutral-800 p-3"
            >
              <div className="mb-2">
                <div className="text-white text-sm">{item.title}</div>
                <div className="text-xs text-gray-500">{item.username}</div>
                <div className="text-xs font-mono text-gray-400 mt-1">
                  {item.password}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => copyAndAutoClear(item.password)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-4 text-xs text-center text-gray-500">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
