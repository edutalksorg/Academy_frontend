import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ConfirmModal } from '../../components/Modal';
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
  const navigate = useNavigate();

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

  async function onStart() {
    try {
      const res = await startTest(id);
      setAttempt(res.data);
      setTimeLeft(test.timeLimit * 60); // Convert minutes to seconds
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
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {result.totalScore >= 70 ? '🎉' : result.totalScore >= 50 ? '👍' : '📚'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
            <p className="text-gray-600 mb-6">Here are your results</p>

            <div className="inline-block bg-blue-50 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{result.totalScore}%</div>
              <div className="text-gray-700">Your Score</div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
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
      {/* Timer and Progress Header */}
      <Card className="sticky top-20 z-10">
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
    </div>
  );
}

