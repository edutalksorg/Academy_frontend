import React, { useState } from 'react'
import { createTest, addQuestion } from '../../api/tests.api'
import QuestionEditor from '../../components/QuestionEditor'
import { useNavigate } from 'react-router-dom'

export default function TestBuilder(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [status, setStatus] = useState('draft')
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  function addQuestionBlock(){ setQuestions(prev => [...prev, { text: '', marks: 1, options: [ { text: '', isCorrect: false }, { text: '', isCorrect: false } ] } ]) }
  function updateQuestion(idx, q){ setQuestions(prev => prev.map((p,i) => i===idx ? q : p)) }
  function removeQuestion(idx){ setQuestions(prev => prev.filter((_,i)=>i!==idx)) }

  async function onSave(e){
    e.preventDefault()
    setSaving(true)
    try{
      const res = await createTest({ title, description, timeLimit, status })
      const testId = res.data.id
      for(const q of questions){
        const payload = { questionText: q.text, marks: q.marks, options: q.options.map(o => ({ text: o.text, isCorrect: !!o.isCorrect })) }
        await addQuestion(testId, payload)
      }
      alert('Test created')
      navigate('/instructor')
    }catch(err){
      console.error(err)
      alert(err.message || 'Failed')
    }finally{ setSaving(false) }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Test</h2>
      <form onSubmit={onSave}>
        <div className="mb-3">
          <label className="text-sm text-gray-600">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-2 py-2" required />
        </div>
        <div className="mb-3">
          <label className="text-sm text-gray-600">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-2 py-2" />
        </div>
        <div className="flex gap-3 mb-3">
          <div>
            <label className="text-sm text-gray-600">Time limit (minutes)</label>
            <input type="number" value={timeLimit} onChange={e=>setTimeLimit(parseInt(e.target.value||'0',10))} className="border rounded px-2 py-1 w-36" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-2 py-1">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Questions</h3>
            <button type="button" onClick={addQuestionBlock} className="text-blue-600 text-sm">+ Add question</button>
          </div>
          {questions.length === 0 && <div className="text-sm text-gray-500">No questions yet</div>}
          {questions.map((q, idx) => (
            <QuestionEditor key={idx} value={q} onChange={(val) => updateQuestion(idx, val)} onRemove={() => removeQuestion(idx)} />
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={saving}>{saving? 'Saving...':'Save Test'}</button>
        </div>
      </form>
    </div>
  )
}

