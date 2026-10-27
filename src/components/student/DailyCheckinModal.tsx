import React, { useState } from 'react';
import { X, Check, Moon, Activity, Utensils, BookOpen, Smile, Info } from 'lucide-react';
import { calculateDomainScores, calculateCompositeScore, calculateMealScore } from '../../services/scoringEngine';
import { DailyLog } from '../../types/swms';

interface DailyCheckinModalProps {
  userId: string;
  existingLog?: DailyLog;
  onSave: (
    mood: number,
    sleepHours: number,
    activityMinutes: number,
    mealScore: number,
    mealsResponses: { breakfast: boolean; fruitVeg: boolean; skippedMain: boolean },
    stressLevel: number
  ) => void;
  onClose: () => void;
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  existingLog,
  onSave,
  onClose,
}) => {
  const [mood, setMood] = useState<number>(existingLog?.mood ?? 3);
  const [sleepHours, setSleepHours] = useState<number>(existingLog?.sleepHours ?? 7.5);
  const [activityMinutes, setActivityMinutes] = useState<number>(existingLog?.activityMinutes ?? 30);
  const [breakfast, setBreakfast] = useState<boolean>(existingLog?.mealsResponses?.breakfast ?? true);
  const [fruitVeg, setFruitVeg] = useState<boolean>(existingLog?.mealsResponses?.fruitVeg ?? true);
  const [skippedMain, setSkippedMain] = useState<boolean>(existingLog?.mealsResponses?.skippedMain ?? false);
  const [stressLevel, setStressLevel] = useState<number>(existingLog?.stressLevel ?? 2);

  const mealScore = calculateMealScore(breakfast, fruitVeg, skippedMain);
  const domainScores = calculateDomainScores(sleepHours, activityMinutes, mood, stressLevel, mealScore);
  const previewScore = calculateCompositeScore(domainScores);

  const moodFaces = [
    { value: 1, label: 'Very Low', emoji: '🌧️', color: 'border-slate-300 hover:bg-slate-100 text-slate-700' },
    { value: 2, label: 'Low', emoji: '☁️', color: 'border-slate-300 hover:bg-slate-100 text-slate-700' },
    { value: 3, label: 'Okay', emoji: '⛅', color: 'border-teal-200 hover:bg-teal-50 text-teal-800' },
    { value: 4, label: 'Good', emoji: '🌤️', color: 'border-teal-300 hover:bg-teal-50 text-teal-800' },
    { value: 5, label: 'Great', emoji: '☀️', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-800' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(mood, sleepHours, activityMinutes, mealScore, { breakfast, fruitVeg, skippedMain }, stressLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Daily Wellness Check-in</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              5 quick sections • Takes under 3 minutes • Helps keep your rhythms healthy
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Mood */}
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Smile className="w-4 h-4 text-teal-600" />
              1. How are you feeling overall today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moodFaces.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMood(item.value)}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all ${
                    mood === item.value
                      ? 'border-teal-600 bg-teal-50 font-bold shadow-xs'
                      : `${item.color} bg-white`
                  }`}
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-[11px] leading-tight text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sleep */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Moon className="w-4 h-4 text-teal-600" />
                2. Sleep duration last night:
              </label>
              <span className="text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {sleepHours.toFixed(1)} hours
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0h</span>
              <span className="text-teal-700 font-medium">Optimal: 7–9 hours</span>
              <span>14h</span>
            </div>
          </div>

          {/* Section 3: Physical Activity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Activity className="w-4 h-4 text-teal-600" />
                3. Physical activity / movement:
              </label>
              <span className="text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {activityMinutes} mins
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={activityMinutes}
              onChange={(e) => setActivityMinutes(parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0m</span>
              <span className="text-teal-700 font-medium">Target: 30+ mins</span>
              <span>180m+</span>
            </div>
          </div>

          {/* Section 4: Nutrition / Meals (KIDMED) */}
          <div className="space-y-3 bg-[#fbf9f5] p-3.5 rounded-xl border border-[#e7e2d7]">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Utensils className="w-4 h-4 text-teal-600" />
              4. Daily meals & nutrition (KIDMED index):
            </label>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Did you eat breakfast today?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBreakfast(true)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      breakfast ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBreakfast(false)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      !breakfast ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Included fruits or vegetables?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFruitVeg(true)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      fruitVeg ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFruitVeg(false)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      !fruitVeg ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Skipped any regular main meals?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSkippedMain(true)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      skippedMain ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkippedMain(false)}
                    className={`px-3 py-1 rounded text-xs font-medium border ${
                      !skippedMain ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Academic Stress */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <BookOpen className="w-4 h-4 text-teal-600" />
              5. Academic stress level today:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 1, label: 'Relaxed' },
                { val: 2, label: 'Manageable' },
                { val: 3, label: 'Moderate' },
                { val: 4, label: 'High' },
                { val: 5, label: 'Overloaded' },
              ].map((step) => (
                <button
                  type="button"
                  key={step.val}
                  onClick={() => setStressLevel(step.val)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all ${
                    stressLevel === step.val
                      ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold">{step.val}</div>
                  <div className="text-[10px]">{step.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Score Indicator */}
          <div className="flex items-center justify-between p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-medium text-teal-900">
                Estimated Composite Wellness Score:
              </span>
            </div>
            <span className="text-lg font-black text-teal-800">
              {previewScore} <span className="text-xs font-normal text-teal-600">/ 100</span>
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" /> Save Today's Check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
