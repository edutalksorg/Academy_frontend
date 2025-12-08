import React, { useState, useEffect } from 'react'
import { createTest, addQuestion, getTest, updateTest } from '../../api/tests.api'
import QuestionEditor from '../../components/QuestionEditor'
import { useNavigate, useParams } from 'react-router-dom'

export default function TestBuilder() {
  const { id } = useParams()
  const isEdit = !!id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [status, setStatus] = useState('draft')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isEdit) {
      loadTest()
    }
  }, [id])

  async function loadTest() {
    setLoading(true)
    try {
      const res = await getTest(id)
      if (res.success) {
        const t = res.data
        setTitle(t.title)
        setDescription(t.description || '')
        setTimeLimit(t.timeLimit)
        setStatus(t.status)
        setStartTime(t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '')
        setEndTime(t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : '')
        // Transform questions if needed, or just set them
        if (t.Questions) {
          setQuestions(t.Questions.map(q => ({
            text: q.text,
            marks: q.marks,
            options: q.Options ? q.Options.map(o => ({ text: o.text, isCorrect: o.isCorrect })) : [],
            id: q.id // keep track of existing questions
          })))
        }
      }
    } catch (err) {
      console.error(err)
      alert('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  function addQuestionBlock() { setQuestions(prev => [...prev, { text: '', marks: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] }]) }
  function updateQuestion(idx, q) { setQuestions(prev => prev.map((p, i) => i === idx ? q : p)) }
  function removeQuestion(idx) { setQuestions(prev => prev.filter((_, i) => i !== idx)) }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title,
        description,
        timeLimit,
        status,
        startTime: startTime || null,
        endTime: endTime || null
      }

      let testId = id
      if (isEdit) {
        await updateTest(id, payload)
        // For now, we don't update questions in edit mode to avoid complexity
        // Only add NEW questions if they don't have an ID
        const newQuestions = questions.filter(q => !q.id)
        for (const q of newQuestions) {
          const qPayload = { questionText: q.text, marks: q.marks, options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) }
          await addQuestion(id, qPayload)
        }
        alert('Test updated')
      } else {
        const res = await createTest(payload)
        testId = res.data.id
        for (const q of questions) {
          const qPayload = { questionText: q.text, marks: q.marks, options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) }
          await addQuestion(testId, qPayload)
        }
        alert('Test created')
      }
      navigate('/instructor/tests')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 text-center">Loading test...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Test' : 'Create Test'}</h2>
      <form onSubmit={onSave}>
        <div className="mb-3">
          <label className="text-sm text-gray-600">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-2 py-2" required />
        </div>
        <div className="mb-3">
          <label className="text-sm text-gray-600">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-2 py-2" />
        </div>
        <div className="flex gap-3 mb-3">
          <div>
            <label className="text-sm text-gray-600">Time limit (minutes)</label>
            <input type="number" value={timeLimit} onChange={e => setTimeLimit(parseInt(e.target.value || '0', 10))} className="border rounded px-2 py-1 w-36" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Start Time (Optional)</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">End Time (Optional)</label>
            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
          </div>
        </div>

        <div className="mb-4">
          <div className="sticky top-0 bg-white z-10 pb-3 border-b mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Questions</h3>
              <button
                type="button"
                onClick={addQuestionBlock}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">+</span> Add question
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.length === 0 && <div className="text-sm text-gray-500 text-center py-8">No questions yet. Click "Add question" to get started.</div>}
            {questions.map((q, idx) => (
              <div key={idx} className={q.id ? 'opacity-75 pointer-events-none' : ''}>
                {q.id && <div className="text-xs text-gray-500 mb-1">Existing Question (Cannot edit)</div>}
                <QuestionEditor value={q} onChange={(val) => updateQuestion(idx, val)} onRemove={() => removeQuestion(idx)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors" disabled={saving}>{saving ? 'Saving...' : (isEdit ? 'Update Test' : 'Save Test')}</button>
        </div>
      </form>
    </div>
  )
}

