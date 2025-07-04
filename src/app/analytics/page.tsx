"use client";

import Link from 'next/link';
import { AcademicCapIcon, BanknotesIcon, CakeIcon, HeartIcon, TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  {
    name: 'Sports',
    slug: 'sports',
    icon: TrophyIcon,
    description: 'Your athletic activities and achievements.'
  },
  {
    name: 'Food',
    slug: 'food',
    icon: CakeIcon,
    description: 'Meals, nutrition, and culinary adventures.'
  },
  {
    name: 'Finance',
    slug: 'finance',
    icon: BanknotesIcon,
    description: 'Spending, saving, and financial health.'
  },
  {
    name: 'Health',
    slug: 'health',
    icon: HeartIcon,
    description: 'Physical and mental well-being.'
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    icon: ChartBarIcon,
    description: 'Work, study, and personal growth.'
  },
  {
    name: 'Learning',
    slug: 'learning',
    icon: AcademicCapIcon,
    description: 'Education, skills, and knowledge.'
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Your Life Analytics</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Explore insights from every corner of your life. Click a category to dive deeper.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/analytics/${cat.slug}`} className="group block bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100 p-6 text-center cursor-pointer">
              <div className="flex justify-center mb-4">
                <cat.icon className="h-12 w-12 text-blue-500 group-hover:text-blue-700 transition-colors" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{cat.name}</h2>
              <p className="text-gray-500 text-sm mb-2">{cat.description}</p>
              <span className="inline-block mt-2 text-blue-600 group-hover:underline">View Insights →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}