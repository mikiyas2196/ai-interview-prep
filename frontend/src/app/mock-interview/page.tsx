'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { InterviewSession, InterviewQuestion } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Brain,
  Video,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Clock,
  Briefcase
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function MockInterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdParam = searchParams?.get('session_id');

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [followUpAnswerText, setFollowUpAnswerText] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  useEffect(() => {
    if (sessionIdParam) {
      fetchSession(parseInt(sessionIdParam));
    } else {
      setLoading(false);
    }
  }, [sessionIdParam]);

  const fetchSession = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/interviews/${id}`);
      setSession(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewMock = async () => {
    setSessionStarting(true);
    try {
      const res = await api.post('/interviews/start', {
        category: 'Technical',
        mode: 'mock',
        difficulty: 'intermediate',
      });
      const newId = res.data.data.id;
      router.push(`/mock-interview?session_id=${newId}`);
      fetchSession(newId);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionStarting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !currentQuestion || !answerText) return;
    setSubmitting(true);
    try {
      await api.post(`/interviews/${session.id}/questions/${currentQuestion.id}/answer`, {
        answer_text: answerText,
      });
      await fetchSession(session.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !currentQuestion || !followUpAnswerText) return;
    setSubmitting(true);
    try {
      await api.post(`/interviews/${session.id}/questions/${currentQuestion.id}/follow-up`, {
        follow_up_answer: followUpAnswerText,
      });
      setFollowUpAnswerText('');
      await fetchSession(session.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await api.post(`/interviews/${session.id}/complete`);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const questions = session?.questions || [];
  const currentQuestion: InterviewQuestion | undefined = questions[currentQuestionIndex];
  const existingAnswer = currentQuestion?.answer;

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
        <div className="inline-flex bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl text-indigo-400">
          <Video className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Realistic Live Mock Interview</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          Simulate a real 4-question technical & behavioral interview. AI will evaluate your answers internally and generate dynamic follow-up questions.
        </p>

        <button
          onClick={handleStartNewMock}
          disabled={sessionStarting}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-flex items-center space-x-2 text-sm shadow-lg shadow-indigo-600/25"
        >
          <Sparkles className="w-4 h-4" />
          <span>{sessionStarting ? 'Initializing Interviewer...' : 'Start Live Mock Interview'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* LEFT COLUMN: INTERVIEW PROGRESS & CATEGORY INFO */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5">
        <div>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {session.mode === 'mock' ? 'Realistic Mock' : 'Practice Mode'}
          </span>
          <h3 className="font-bold text-slate-100 text-base mt-1.5">{session.title}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {session.job_posting?.job_title || 'Software Engineer'}
          </p>
        </div>

        {/* Question Stepper Progress */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Interview Questions</span>
            <span>{currentQuestionIndex + 1} / {questions.length}</span>
          </div>

          <div className="space-y-1.5">
            {questions.map((q, i) => {
              const isCurrent = i === currentQuestionIndex;
              const isAnswered = !!q.answer;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-md'
                      : isAnswered
                      ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                      : 'bg-slate-950/20 border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[140px]">Q{i + 1}: {q.category}</span>
                  {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="pt-2 border-t border-slate-800 flex flex-col space-y-2">
          <button
            onClick={handleCompleteInterview}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2 rounded-xl text-xs transition-colors"
          >
            Finish & Generate Report
          </button>
        </div>
      </div>

      {/* CENTER COLUMN: AI INTERVIEWER & QUESTION AREA */}
      <div className="lg:col-span-3 space-y-6">
        {/* AI Interviewer Avatar Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
                <Brain className="w-6 h-6" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-100 text-base">AI Senior Interviewer</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Live Session
                </span>
              </div>
              <p className="text-xs text-slate-400">Asking questions tailored to your profile & job requirements</p>
            </div>
          </div>

          {/* Current Question Box */}
          {currentQuestion ? (
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-400 font-bold uppercase tracking-wider">
                  Question #{currentQuestion.question_number} • {currentQuestion.category}
                </span>
                <span className="text-slate-500 capitalize">{currentQuestion.difficulty}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-100 leading-snug">
                &quot;{currentQuestion.question_text}&quot;
              </h2>

              {currentQuestion.context_note && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-lg text-indigo-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{currentQuestion.context_note}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Candidate Answer Submission Area */}
        {currentQuestion && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Your Answer Response:</span>
              <button
                type="button"
                onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                  isVoiceRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isVoiceRecording ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isVoiceRecording ? 'Voice Listening...' : 'Voice Input Mode'}</span>
              </button>
            </div>

            {!existingAnswer ? (
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <textarea
                  rows={5}
                  required
                  placeholder="Type your structured response here... (For behavioral answers, use Situation, Task, Action, and Result structure)"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Press Submit Answer to send to AI interviewer</span>
                  <button
                    type="submit"
                    disabled={submitting || !answerText}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Answer'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Recorded Primary Answer */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Submitted Answer
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans text-sm">{existingAnswer.answer_text}</p>
                </div>

                {/* AI Dynamic Probing Follow-Up Question */}
                {existingAnswer.follow_up_question && (
                  <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-xl space-y-3">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Follow-Up Question:</span>
                    </div>
                    <p className="text-slate-100 font-semibold text-sm">&quot;{existingAnswer.follow_up_question}&quot;</p>

                    {!existingAnswer.follow_up_answer ? (
                      <form onSubmit={handleFollowUpSubmit} className="space-y-3 pt-2">
                        <textarea
                          rows={3}
                          required
                          placeholder="Answer the AI follow-up question..."
                          value={followUpAnswerText}
                          onChange={(e) => setFollowUpAnswerText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                          >
                            <span>Submit Follow-Up Answer</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                        <span className="font-semibold text-indigo-300 block mb-1">Your Follow-Up Answer:</span>
                        {existingAnswer.follow_up_answer}
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Navigation */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40"
                  >
                    Previous Question
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAnswerText('');
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteInterview}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <span>Finish & Complete Interview</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockInterviewPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <MockInterviewContent />
      </Suspense>
    </DashboardLayout>
  );
}
