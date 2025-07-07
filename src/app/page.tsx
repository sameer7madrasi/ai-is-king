"use client";

import React from "react";
import Link from "next/link";
import { useBackground } from "@/components/BackgroundProvider";

export default function Dashboard() {
  const { getBackgroundStyle } = useBackground();

  return (
    <div className="p-8 min-h-screen" style={getBackgroundStyle()}>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 drop-shadow-lg">
            Hi Sameer, what data donk would you like to do today?
          </h1>
          <p className="text-2xl text-gray-800 dark:text-gray-200 font-medium drop-shadow-md">
            Your data analytics playground is ready for action
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link
            href="/upload"
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📁
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Make An Entry</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Drop in CSV, Excel, or text files and let&apos;s see what we can discover
              </p>
            </div>
          </Link>

          <Link
            href="/history"
            className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">View History</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Check out all the data you&apos;ve uploaded and track your progress
              </p>
            </div>
          </Link>
        </div>

        {/* Analytics Card */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
          <Link
            href="/analytics"
            className="group bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                🤖
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get intelligent insights and recommendations powered by AI
              </p>
            </div>
          </Link>
        </div>

        {/* Fun Stats Section */}
        <div className="bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🚀 Ready to make some data magic happen?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Upload files or paste text to start building your data empire
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
          >
            Let&apos;s Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
