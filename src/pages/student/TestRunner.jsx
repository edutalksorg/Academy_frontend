import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ConfirmModal } from '../../components/Modal';
import Watermark from '../../components/Watermark';
import { getTest } from '../../api/tests.api';
import { startTest, submitAttempt } from '../../api/attempts.api';

export default function TestRunner() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('showWarningModal state changed:', showWarningModal);
  }, [showWarningModal]);

  // Anti-screenshot and anti-cheat measures
  useEffect(() => {
    if (!attempt) return; // Only apply during active test

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for screenshots and copying
    const handleKeyDown = (e) => {
      // Prevent Print Screen, Ctrl+S, Ctrl+P, Ctrl+C, etc.
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'c')) ||
        (e.metaKey && (e.key === 's' || e.key === 'p' || e.key === 'c'))
      ) {
        e.preventDefault();
        alert('⚠️ Screenshots and copying are disabled during the test.\n\nThis action has been logged and will be reported to your instructor.');

        // Clear clipboard if possible
        if (navigator.clipboard) {
          navigator.clipboard.writeText('Screenshot attempt detected during test').catch(() => { });
        }

        return false;
      }
    };

    // Additional Print Screen detection via keyup
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        // Clear clipboard after Print Screen
        if (navigator.clipboard) {
          navigator.clipboard.writeText('EduTask - Screenshot attempt detected during test by ' + (JSON.parse(localStorage.getItem('auth'))?.user?.name || 'Student')).catch(() => { });
        }
      }
    };

    // Detect tab/window switching
    const handleVisibilityChange = () => {
      console.log('Visibility changed. Hidden:', document.hidden);

      if (document.hidden) {
        console.warn('⚠️ Student switched tabs/windows during test');

        // Record tab switch in backend
        if (attempt?.id) {
          import('../../api/attempts.api').then(({ recordTabSwitch }) => {
            recordTabSwitch(attempt.id).catch(err => console.error('Failed to record tab switch:', err));
          });
        }
      } else {
        // User returned to the tab
        console.log('User returned. Showing warning modal.');
        setShowWarningModal(true);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [attempt]);

  useEffect(() => {
    loadTest();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!attempt || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeLeft]);

  async function loadTest() {
    try {
      const res = await getTest(id);
      setTest(res.data);
    } catch (err) {
      console.error('Failed to load test:', err);
    }
  }

  // Fisher-Yates shuffle algorithm
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async function onStart() {
    try {
      const res = await startTest(id);
      setAttempt(res.data);
      setTimeLeft(test.timeLimit * 60); // Convert minutes to seconds

      // Shuffle questions for this student
      if (test.Questions && test.Questions.length > 0) {
        const shuffledQuestions = shuffleArray(test.Questions);
        setTest({ ...test, Questions: shuffledQuestions });
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to start test');
    }
  }

  function selectOption(qId, optionId) {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  }

  async function handleAutoSubmit() {
    await handleSubmit();
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = Object.keys(answers).map((qid) => ({
      questionId: parseInt(qid, 10),
      selectedOptionId: answers[qid],
    }));

    try {
      const res = await submitAttempt(attempt.id, payload);
      setResult(res.data);
      setShowSubmitConfirm(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!test) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  // Show result screen
  if (result) {
    // Calculate percentage score
    // Calculate percentage based on number of correct answers vs total questions
    const totalQuestions = test.Questions?.length || 0;
    const scorePercentage = totalQuestions > 0
      ? Math.round((result.correctAnswers / totalQuestions) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {scorePercentage >= 70 ? '🎉' : scorePercentage >= 50 ? '👍' : '📚'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
            <p className="text-gray-600 mb-6">Here are your results</p>

            <div className="inline-block bg-blue-50 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{scorePercentage}%</div>
              <div className="text-gray-700">Your Score</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{result.correctAnswers || 0}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers || 0}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">{test.Questions?.length || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${result.tabSwitchCount > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {result.tabSwitchCount || 0}
                </div>
                <div className="text-sm text-gray-600">Tab Switches</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/student/attempts')}>
                View All Results
              </Button>
              <Button variant="secondary" onClick={() => navigate('/student/tests')}>
                Take Another Test
              </Button>
            </div>
          </div>
        </Card>

        {/* Detailed Question Review */}
        {result.questionResults && result.questionResults.length > 0 && (
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Question Review</h3>
            <div className="space-y-4">
              {result.questionResults.map((qResult, index) => (
                <div
                  key={qResult.questionId}
                  className={`border-2 rounded-lg p-4 ${qResult.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${qResult.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {qResult.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}: {qResult.questionText}
                      </h4>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    {qResult.options.map((option) => {
                      const isSelected = option.id === qResult.selectedOptionId;
                      const isCorrectOption = option.id === qResult.correctOptionId;

                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border-2 ${isCorrectOption
                            ? 'border-green-500 bg-green-100'
                            : isSelected && !qResult.isCorrect
                              ? 'border-red-500 bg-red-100'
                              : 'border-gray-200 bg-white'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{option.text}</span>
                            <div className="flex gap-2">
                              {isSelected && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Your Answer
                                </span>
                              )}
                              {isCorrectOption && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-green-500 text-white">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Show test start screen
  if (!attempt) {
    return (
      <div className="space-y-6">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{test.title}</h1>
          <p className="text-gray-600 mb-6">{test.description || 'No description provided'}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{test.Questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{test.timeLimit} min</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{test.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              <li>You have {test.timeLimit} minutes to complete this test</li>
              <li>The test will auto-submit when time runs out</li>
              <li>You can navigate between questions freely</li>
              <li>Make sure to answer all questions before submitting</li>
            </ul>
          </div>

          <Button variant="primary" size="lg" fullWidth onClick={onStart}>
            Start Test Now
          </Button>
        </Card>
      </div>
    );
  }

  // Show test questions
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test.Questions?.length || 0;

  return (
    <div className="space-y-6">
      {/* Watermark for anti-cheating */}
      <Watermark />

      {/* Timer and Progress Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
            <p className="text-sm text-gray-600">
              Progress: {answeredCount} / {totalQuestions} questions answered
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {(test.Questions || []).map((q, index) => (
          <Card key={q.id}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-3">{q.text}</h3>
                <div className="space-y-2">
                  {(q.Options || []).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${answers[q.id] === opt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt.id}
                        onChange={() => selectOption(q.id, opt.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-700">
              {answeredCount === totalQuestions ? (
                <span className="text-green-600 font-medium">✓ All questions answered</span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  ⚠ {totalQuestions - answeredCount} questions remaining
                </span>
              )}
            </p>
          </div>
          <Button
            variant="success"
            size="lg"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
          >
            Submit Test
          </Button>
        </div>
      </Card>

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        title="Submit Test"
        message={`Are you sure you want to submit? You have answered ${answeredCount} out of ${totalQuestions} questions. This action cannot be undone.`}
        confirmText="Submit"
        variant="success"
      />
      {/* Warning Modal for Tab Switching */}
      {/* Warning Modal for Tab Switching */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Warning: Tab Switch Detected</h3>
            </div>

            <p className="text-gray-700 mb-6">
              You switched away from the test window. This action has been recorded and will be reported to your instructor.
              <br /><br />
              <strong>Please stay on this page until you submit the test.</strong>
            </p>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowWarningModal(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              I Understand, Return to Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

