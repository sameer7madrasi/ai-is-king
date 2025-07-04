"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Make An Entry", href: "/upload", icon: "📁" },
  { name: "Data History", href: "/history", icon: "📋" },
  { name: "Analytics", href: "/analytics", icon: "🤖" },
  { name: "Test NLP", href: "/test-nlp", icon: "🧪" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mil by 30</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-r-2 border-blue-700 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Time to let AI control your life
        </div>
      </div>
    </div>
  );
} 