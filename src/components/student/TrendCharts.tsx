import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DailyLog } from '../../types/swms';
import { Moon, Activity, Smile, BookOpen, Utensils, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendChartsProps {
  logs: DailyLog[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ logs }) => {
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  // Filter logs based on range
  const daysCount = range === '7d' ? 7 : 30;
  const filteredLogs = logs.slice(-daysCount);

  // Format labels: "Oct 24"
  const labels = filteredLogs.map((l) => {
    const parts = l.logDate.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[mIdx]} ${parseInt(parts[2], 10)}`;
    }
    return l.logDate;
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 8,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
    },
    elements: {
      point: { radius: range === '7d' ? 4 : 2, hoverRadius: 6 },
      line: { tension: 0.35, borderWidth: 2 },
    },
  };

  // Domain configurations
  const domainCharts = [
    {
      title: 'Sleep (hours)',
      icon: <Moon className="w-4 h-4 text-indigo-600" />,
      color: '#4f46e5',
      bgColor: 'rgba(79, 70, 229, 0.08)',
      data: filteredLogs.map((l) => l.sleepHours),
      target: '7–9 hrs',
      min: 0,
      max: 12,
    },
    {
      title: 'Activity (mins)',
      icon: <Activity className="w-4 h-4 text-emerald-600" />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
      data: filteredLogs.map((l) => l.activityMinutes),
      target: '30+ mins',
      min: 0,
      max: 120,
    },
    {
      title: 'Mood (1–5)',
      icon: <Smile className="w-4 h-4 text-teal-600" />,
      color: '#0d9488',
      bgColor: 'rgba(13, 148, 136, 0.08)',
      data: filteredLogs.map((l) => l.mood),
      target: '3+ stable',
      min: 1,
      max: 5,
    },
    {
      title: 'Academic Stress (1–5)',
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      color: '#d97706',
      bgColor: 'rgba(217, 119, 6, 0.08)',
      data: filteredLogs.map((l) => l.stressLevel),
      target: 'Lower is better',
      min: 1,
      max: 5,
    },
    {
      title: 'Nutrition / Meals (0–100)',
      icon: <Utensils className="w-4 h-4 text-rose-600" />,
      color: '#e11d48',
      bgColor: 'rgba(225, 29, 72, 0.08)',
      data: filteredLogs.map((l) => l.mealScore),
      target: 'KIDMED score',
      min: 0,
      max: 100,
    },
  ];

  // Composite Score Line Chart data
  const compositeChartData = {
    labels,
    datasets: [
      {
        label: 'Composite Wellness Score',
        data: filteredLogs.map((l) => l.compositeScore),
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.12)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header with Range Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-700" /> Five Domain Trends
          </h3>
          <p className="text-xs text-slate-500">
            Track daily variations in mood, rest, activity, stress, and nutrition.
          </p>
        </div>

        {/* 7-day / 30-day Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setRange('7d')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              range === '7d'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              range === '30d'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Main Composite Trend Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">Composite Wellness Trajectory (0–100)</span>
          <span className="text-slate-500">Based on weighted multi-domain aggregation</span>
        </div>
        <div className="h-56">
          <Line
            data={compositeChartData}
            options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: { ...commonOptions.scales.y, min: 0, max: 100 },
              },
            }}
          />
        </div>
      </div>

      {/* Five Individual Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainCharts.map((domain) => {
          const chartData = {
            labels,
            datasets: [
              {
                data: domain.data,
                borderColor: domain.color,
                backgroundColor: domain.bgColor,
                fill: true,
              },
            ],
          };

          const latestValue = domain.data[domain.data.length - 1] ?? 0;

          return (
            <div
              key={domain.title}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  {domain.icon}
                  <span>{domain.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">{latestValue}</span>
                  <span className="text-[10px] text-slate-400 block">{domain.target}</span>
                </div>
              </div>
              <div className="h-28">
                <Line
                  data={chartData}
                  options={{
                    ...commonOptions,
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        min: domain.min,
                        max: domain.max,
                      },
                    },
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
