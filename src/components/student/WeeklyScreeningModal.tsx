import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, AlertTriangle, ShieldCheck, PhoneCall, Calendar, CheckCircle2 } from 'lucide-react';
import { Screening } from '../../types/swms';

interface WeeklyScreeningModalProps {
  userId: string;
  onSaveScreening: (screening: Omit<Screening, 'id' | 'completedAt'>) => void;
  onClose: () => void;
  onBookAppointment: () => void;
  onOpenHelp: () => void;
}

interface QuestionDef {
  id: string;
  instrument: 'PHQ-2' | 'GAD-2' | 'PHQ-9' | 'GAD-7';
  questionNumber: number;
  text: string;
  isItem9SelfHarm?: boolean;
}

export const WeeklyScreeningModal: React.FC<WeeklyScreeningModalProps> = ({
  userId,
  onSaveScreening,
  onClose,
  onBookAppointment,
  onOpenHelp,
}) => {
  // Step 1: Initial 4 questions (PHQ-2 items 1-2, GAD-2 items 1-2)
  const initialQuestions: QuestionDef[] = [
    {
      id: 'phq_1',
      instrument: 'PHQ-2',
      questionNumber: 1,
      text: 'Little interest or pleasure in doing things?',
    },
    {
      id: 'phq_2',
      instrument: 'PHQ-2',
      questionNumber: 2,
      text: 'Feeling down, depressed, or hopeless?',
    },
    {
      id: 'gad_1',
      instrument: 'GAD-2',
      questionNumber: 1,
      text: 'Feeling nervous, anxious, or on edge?',
    },
    {
      id: 'gad_2',
      instrument: 'GAD-2',
      questionNumber: 2,
      text: 'Not being able to stop or control worrying?',
    },
  ];

  // Additional PHQ-9 questions (items 3-9)
  const phqFollowUpQuestions: QuestionDef[] = [
    { id: 'phq_3', instrument: 'PHQ-9', questionNumber: 3, text: 'Trouble falling or staying asleep, or sleeping too much?' },
    { id: 'phq_4', instrument: 'PHQ-9', questionNumber: 4, text: 'Feeling tired or having little energy?' },
    { id: 'phq_5', instrument: 'PHQ-9', questionNumber: 5, text: 'Poor appetite or overeating?' },
    { id: 'phq_6', instrument: 'PHQ-9', questionNumber: 6, text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
    { id: 'phq_7', instrument: 'PHQ-9', questionNumber: 7, text: 'Trouble concentrating on things, such as reading assignments or lectures?' },
    { id: 'phq_8', instrument: 'PHQ-9', questionNumber: 8, text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being fidgety or restless?' },
    { id: 'phq_9', instrument: 'PHQ-9', questionNumber: 9, text: 'Thoughts that you would be better off dead, or of hurting yourself in some way?', isItem9SelfHarm: true },
  ];

  // Additional GAD-7 questions (items 3-7)
  const gadFollowUpQuestions: QuestionDef[] = [
    { id: 'gad_3', instrument: 'GAD-7', questionNumber: 3, text: 'Worrying too much about different things?' },
    { id: 'gad_4', instrument: 'GAD-7', questionNumber: 4, text: 'Trouble relaxing?' },
    { id: 'gad_5', instrument: 'GAD-7', questionNumber: 5, text: 'Being so restless that it is hard to sit still?' },
    { id: 'gad_6', instrument: 'GAD-7', questionNumber: 6, text: 'Becoming easily annoyed or irritable?' },
    { id: 'gad_7', instrument: 'GAD-7', questionNumber: 7, text: 'Feeling afraid, as if something awful might happen?' },
  ];

  const answerOptions = [
    { label: 'Not at all', points: 0 },
    { label: 'Several days', points: 1 },
    { label: 'More than half the days', points: 2 },
    { label: 'Nearly every day', points: 3 },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeQuestions, setActiveQuestions] = useState<QuestionDef[]>(initialQuestions);
  const [hasEvaluatedBranching, setHasEvaluatedBranching] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Results calculation
  const phq2Score = (answers['phq_1'] ?? 0) + (answers['phq_2'] ?? 0);
  const gad2Score = (answers['gad_1'] ?? 0) + (answers['gad_2'] ?? 0);

  const calculateFullScores = () => {
    let phqTotal = phq2Score;
    phqFollowUpQuestions.forEach((q) => {
      phqTotal += answers[q.id] ?? 0;
    });

    let gadTotal = gad2Score;
    gadFollowUpQuestions.forEach((q) => {
      gadTotal += answers[q.id] ?? 0;
    });

    const item9Value = answers['phq_9'] ?? 0;
    const branchedPHQ = activeQuestions.some((q) => q.instrument === 'PHQ-9');
    const branchedGAD = activeQuestions.some((q) => q.instrument === 'GAD-7');

    return {
      phq2: phq2Score,
      gad2: gad2Score,
      phq9: branchedPHQ ? phqTotal : undefined,
      gad7: branchedGAD ? gadTotal : undefined,
      item9SelfHarm: item9Value,
      tierRaised:
        (branchedPHQ && phqTotal >= 15) || (branchedGAD && gadTotal >= 15)
          ? 3
          : (branchedPHQ && phqTotal >= 10) || (branchedGAD && gadTotal >= 10)
          ? 2
          : undefined,
    };
  };

  const handleSelectAnswer = (points: number) => {
    const currentQ = activeQuestions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: points };
    setAnswers(newAnswers);

    // If we are at the end of the initial 4 questions and haven't branched yet
    if (!hasEvaluatedBranching && currentIndex === initialQuestions.length - 1) {
      const p2 = (newAnswers['phq_1'] ?? 0) + (newAnswers['phq_2'] ?? 0);
      const g2 = (newAnswers['gad_1'] ?? 0) + (newAnswers['gad_2'] ?? 0);

      const nextQuestions = [...initialQuestions];
      let needsBranching = false;

      if (p2 >= 3) {
        nextQuestions.push(...phqFollowUpQuestions);
        needsBranching = true;
      }
      if (g2 >= 3) {
        nextQuestions.push(...gadFollowUpQuestions);
        needsBranching = true;
      }

      setHasEvaluatedBranching(true);
      setActiveQuestions(nextQuestions);

      if (needsBranching) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No branching needed; complete now
        finishScreening(newAnswers, false, false);
      }
    } else if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all questions
      finishScreening(
        newAnswers,
        activeQuestions.some((q) => q.instrument === 'PHQ-9'),
        activeQuestions.some((q) => q.instrument === 'GAD-7')
      );
    }
  };

  const finishScreening = (
    finalAnswers: Record<string, number>,
    hasPHQ9: boolean,
    hasGAD7: boolean
  ) => {
    let phqTotal = (finalAnswers['phq_1'] ?? 0) + (finalAnswers['phq_2'] ?? 0);
    if (hasPHQ9) {
      phqFollowUpQuestions.forEach((q) => {
        phqTotal += finalAnswers[q.id] ?? 0;
      });
    }

    let gadTotal = (finalAnswers['gad_1'] ?? 0) + (finalAnswers['gad_2'] ?? 0);
    if (hasGAD7) {
      gadFollowUpQuestions.forEach((q) => {
        gadTotal += finalAnswers[q.id] ?? 0;
      });
    }

    const item9 = finalAnswers['phq_9'] ?? 0;
    const tier =
      (hasPHQ9 && phqTotal >= 15) || (hasGAD7 && gadTotal >= 15)
        ? 3
        : (hasPHQ9 && phqTotal >= 10) || (hasGAD7 && gadTotal >= 10)
        ? 2
        : undefined;

    const screeningData: Omit<Screening, 'id' | 'completedAt'> = {
      userId,
      weekStart: new Date().toISOString().split('T')[0],
      phq2: (finalAnswers['phq_1'] ?? 0) + (finalAnswers['phq_2'] ?? 0),
      gad2: (finalAnswers['gad_1'] ?? 0) + (finalAnswers['gad_2'] ?? 0),
      phq9: hasPHQ9 ? phqTotal : undefined,
      gad7: hasGAD7 ? gadTotal : undefined,
      phq9Item9SelfHarm: item9,
      tierRaised: tier,
    };

    onSaveScreening(screeningData);
    setIsCompleted(true);
  };

  const currentQ = activeQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);
  const results = calculateFullScores();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-700 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Weekly Wellness Screening</h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Standardized PHQ & GAD assessments • Over the last 2 weeks
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

        {!isCompleted ? (
          <div className="p-6 space-y-6">
            {/* Progress Bar & Instrument Tag */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {currentQ.instrument} • Question {currentIndex + 1} of {activeQuestions.length}
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-2 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-[#fbf9f5] border border-[#e7e2d7] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Over the last 2 weeks, how often have you been bothered by:
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.text}
              </h3>

              {currentQ.isItem9SelfHarm && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Your well-being is our highest priority. We provide immediate support if you are experiencing distress.
                  </span>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {answerOptions.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.points;
                return (
                  <button
                    key={opt.points}
                    type="button"
                    onClick={() => handleSelectAnswer(opt.points)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-xs'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      +{opt.points}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Back Navigation */}
            {currentIndex > 0 && (
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Result Screen */
          <div className="p-6 space-y-5 animate-fade-in">
            {/* SAFETY RULE (Section 5.3): Item 9 self-harm > 0 shows emergency card immediately on top */}
            {results.item9SelfHarm > 0 && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 text-rose-900 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-rose-950">Immediate Support Available</h4>
                    <p className="text-xs text-rose-800">
                      You indicated thoughts of distress or self-harm. Please reach out to compassionate professionals right now.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-rose-950">
                    <span>Tele-MANAS (Govt 24/7):</span>
                    <a href="tel:14416" className="text-rose-700 underline font-mono text-sm">
                      14416 / 1800-891-4416
                    </a>
                  </div>
                  <div className="flex justify-between font-bold text-rose-950">
                    <span>Campus Counsellor Desk:</span>
                    <span className="font-mono text-sm text-rose-700">+91 (02563) 286545</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onOpenHelp}
                    className="flex-1 py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold text-center"
                  >
                    View Emergency Contacts
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onBookAppointment();
                    }}
                    className="flex-1 py-2 px-3 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-xl text-xs font-bold text-center"
                  >
                    Book Campus Counsellor
                  </button>
                </div>
              </div>
            )}

            {/* Screening Summary Box */}
            <div className="bg-[#fbf9f5] border border-[#e7e2d7] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-teal-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Screening Complete</h3>
                  <p className="text-xs text-slate-600">
                    Your responses have been privately recorded in accordance with your privacy settings.
                  </p>
                </div>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium">PHQ Depression Index</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {results.phq9 !== undefined ? `${results.phq9} / 27 (PHQ-9)` : `${results.phq2} / 6 (PHQ-2)`}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {results.phq9 !== undefined && results.phq9 >= 10
                      ? 'Elevated mood indicators'
                      : 'Mild or baseline range'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded-xl">
                  <span className="text-slate-500 font-medium">GAD Anxiety Index</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {results.gad7 !== undefined ? `${results.gad7} / 21 (GAD-7)` : `${results.gad2} / 6 (GAD-2)`}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {results.gad7 !== undefined && results.gad7 >= 10
                      ? 'Elevated worry indicators'
                      : 'Manageable anxiety baseline'}
                  </span>
                </div>
              </div>

              {/* Tier Prompt */}
              {results.tierRaised ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-2">
                  <p className="font-semibold">
                    We noticed some heightened stress indicators this week.
                  </p>
                  <p className="text-amber-800">
                    Talking with our campus counsellor or general physician is free, confidential, and can help you develop tailored strategies.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onBookAppointment();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold shadow-xs mt-1"
                  >
                    <Calendar className="w-4 h-4" /> Book a Free Consultation
                  </button>
                </div>
              ) : (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900">
                  <p className="font-semibold text-teal-950">Steady Baseline</p>
                  <p className="text-teal-800 mt-0.5">
                    Your responses indicate manageable stress and healthy resilience this week. Keep up your positive habits!
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-xs"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
