"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar({
  darkMode,
  setDarkMode,
}: any) {

    const router = useRouter();
    async function handleLogout() {
  await supabase.auth.signOut();

  alert("Logged out successfully");

  router.push("/login");
}
  return (
    <div className="flex justify-end mb-6 relative">

      <details className="dropdown">
        <summary className="btn bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
          Profile
        </summary>

        <ul className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-2 z-50">
          
          <li className={`p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white"
                : "bg-white text-black"
            }`}>
            <Link href="/my-bookings">
              My Bookings
            </Link>
          </li>

          <li
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-lg ${
              darkMode
                ? "bg-gray-700 text-white"
                : "bg-white text-black"
                } cursor-pointer
            }`}
          >
            {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </li>

          <li
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-gray-100 rounded cursor-pointer"
          >
            Logout
          </li>

        </ul>
      </details>

    </div>
  );
}