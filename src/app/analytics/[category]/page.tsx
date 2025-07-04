import { notFound } from 'next/navigation';
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

const MOCK_INSIGHTS: Record<string, { title: string; detail: string }[]> = {
  sports: [
    { title: 'Soccer Game Performance', detail: 'You ran 7.2km and scored 1 goal in your last match.' },
    { title: 'Weekly Activity', detail: 'You played 3 times this week. Keep it up!' },
  ],
  food: [
    { title: 'Healthy Eating', detail: 'You ate vegetables 5 times this week.' },
    { title: 'Calorie Intake', detail: 'Average daily calories: 2,100 kcal.' },
  ],
  finance: [
    { title: 'Spending Trend', detail: 'You spent $320 this week, mostly on groceries and dining.' },
    { title: 'Savings Rate', detail: 'You saved 15% of your income this month.' },
  ],
  health: [
    { title: 'Sleep Quality', detail: 'Average sleep: 7h 45m/night.' },
    { title: 'Exercise', detail: 'You exercised 4 times this week.' },
  ],
  productivity: [
    { title: 'Focus Sessions', detail: 'You completed 8 deep work sessions this week.' },
    { title: 'Task Completion', detail: 'You finished 12 out of 15 planned tasks.' },
  ],
  learning: [
    { title: 'Courses Progress', detail: 'You completed 2 new modules in your online course.' },
    { title: 'Reading', detail: 'You read 3 new articles this week.' },
  ],
};

export default function CategoryInsightsPage({ params }: { params: { category: string } }) {
  const category = CATEGORIES.find(cat => cat.slug === params.category);
  if (!category) return notFound();
  const insights = MOCK_INSIGHTS[category.slug] || [];

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="mr-4">
            <category.icon className="h-14 w-14 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{category.name} Insights</h1>
            <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Insights</h2>
          {insights.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No insights available yet for this category.</p>
          ) : (
            <ul className="space-y-4">
              {insights.map((insight, idx) => (
                <li key={idx} className="border-l-4 border-blue-200 dark:border-blue-400 pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{insight.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{insight.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 