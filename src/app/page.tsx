"use client";

import React from "react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hi Sameer, what data donk would you like to do today?
          </h1>
          <p className="text-xl text-gray-600">
            Your data analytics playground is ready for action
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link
            href="/upload"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📁
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Data</h2>
              <p className="text-gray-600">
                Drop in some CSV or Excel files and let&apos;s see what we can discover
              </p>
            </div>
          </Link>

          <Link
            href="/history"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">View History</h2>
              <p className="text-gray-600">
                Check out all the data you&apos;ve uploaded and track your progress
              </p>
            </div>
          </Link>
        </div>

        {/* Fun Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Ready to make some data magic happen?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Upload your first file and start building your data empire
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Let&apos;s Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
