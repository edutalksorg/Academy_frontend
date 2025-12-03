import React, { useState, useId } from 'react'

export default function QuestionEditor({ value, onChange, onRemove }) {
  const [text, setText] = useState(value?.text || '')
  const [marks, setMarks] = useState(value?.marks || 1)
  const [options, setOptions] = useState(value?.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }])
  const id = useId()

  function updateOptions(newOpts) {
    setOptions(newOpts)
    onChange && onChange({ text, marks, options: newOpts })
  }

  function toggleCorrect(idx) {
    const next = options.map((o, i) => ({ ...o, isCorrect: i === idx }))
    updateOptions(next)
  }

  function setOptionText(idx, val) {
    const next = options.slice(); next[idx].text = val
    updateOptions(next)
  }

  function addOption() { updateOptions([...options, { text: '', isCorrect: false }]) }
  function removeOption(idx) { updateOptions(options.filter((_, i) => i !== idx)) }

  function onTextChange(e) { setText(e.target.value); onChange && onChange({ text: e.target.value, marks, options }) }
  function onMarksChange(e) { const m = parseInt(e.target.value || '1', 10); setMarks(m); onChange && onChange({ text, marks: m, options }) }

  return (
    <div className="mb-4 border-b pb-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Question</div>
        <div>
          <button type="button" onClick={onRemove} className="text-red-600 text-sm">Remove</button>
        </div>
      </div>

      <textarea value={text} onChange={onTextChange} placeholder="Enter question text" className="w-full border rounded p-2 mt-2" />

      <div className="flex gap-3 items-center mt-2">
        <label className="text-sm text-gray-600">Marks</label>
        <input type="number" value={marks} onChange={onMarksChange} className="w-20 border rounded px-2 py-1" />
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-end mb-2">
          <div className="text-sm font-semibold">Options</div>
          <div className="text-xs text-blue-600 font-medium">Click the circle to mark the correct answer</div>
        </div>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name={`correct-${id}`}
              checked={opt.isCorrect}
              onChange={() => toggleCorrect(idx)}
              title="Mark as correct"
              className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
            />
            <input value={opt.text} onChange={e => setOptionText(idx, e.target.value)} placeholder={`Option ${idx + 1}`} className="flex-1 border rounded px-2 py-1" />
            <button type="button" onClick={() => removeOption(idx)} className="text-sm text-red-500">×</button>
          </div>
        ))}
        <button type="button" onClick={addOption} className="text-sm text-blue-600">+ Add option</button>
      </div>
    </div>
  )
}

