import React, { useState, useId } from 'react'

export default function QuestionEditor({ value, onChange, onRemove }) {
  const [type, setType] = useState(value?.type || 'MCQ')
  const [text, setText] = useState(value?.text || '')
  const [marks, setMarks] = useState(value?.marks || 1)
  const [options, setOptions] = useState(value?.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }])

  // Coding fields
  const [description, setDescription] = useState(value?.description || '')
  const [constraints, setConstraints] = useState(value?.constraints || '')
  const [codeTemplate, setCodeTemplate] = useState(value?.codeTemplate || '// Write your code here\n')
  const [testCases, setTestCases] = useState(value?.testCases || [{ input: '', expectedOutput: '', explanation: '', isPublic: true }])

  const id = useId()

  function triggerChange(updates = {}) {
    const current = { type, text, marks, options, description, constraints, codeTemplate, testCases }
    onChange && onChange({ ...current, ...updates })
  }

  function updateOptions(newOpts) {
    setOptions(newOpts)
    triggerChange({ options: newOpts })
  }

  function updateTestCases(newTCs) {
    setTestCases(newTCs)
    triggerChange({ testCases: newTCs })
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

  // Test Case handlers
  function addTestCase() { updateTestCases([...testCases, { input: '', expectedOutput: '', explanation: '', isPublic: true }]) }
  function removeTestCase(idx) { updateTestCases(testCases.filter((_, i) => i !== idx)) }
  function updateTestCase(idx, field, val) {
    const next = testCases.slice()
    next[idx][field] = val
    updateTestCases(next)
  }

  function onTypeChange(e) {
    setType(e.target.value)
    triggerChange({ type: e.target.value })
  }

  function onTextChange(e) { setText(e.target.value); triggerChange({ text: e.target.value }) }
  function onMarksChange(e) { const m = parseInt(e.target.value || '1', 10); setMarks(m); triggerChange({ marks: m }) }

  // Coding specific handlers
  function onDescriptionChange(e) { setDescription(e.target.value); triggerChange({ description: e.target.value }) }
  function onConstraintsChange(e) { setConstraints(e.target.value); triggerChange({ constraints: e.target.value }) }
  function onCodeTemplateChange(e) { setCodeTemplate(e.target.value); triggerChange({ codeTemplate: e.target.value }) }

  return (
    <div className="mb-4 border-b pb-6">
      <div className="flex justify-between items-center bg-gray-50 p-2 rounded mb-2">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">Type</label>
          <select value={type} onChange={onTypeChange} className="border rounded px-2 py-1 bg-white">
            <option value="MCQ">Multiple Choice</option>
            <option value="CODING">Coding Challenge</option>
          </select>
        </div>
        <button type="button" onClick={onRemove} className="text-red-600 text-sm hover:underline">Remove Question</button>
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 uppercase font-semibold">Question Title / Summary</label>
        <input value={text} onChange={onTextChange} placeholder="e.g. Sum of Two Numbers" className="w-full border rounded p-2 mt-1" />
      </div>

      <div className="flex gap-3 items-center mb-3">
        <label className="text-sm text-gray-600">Marks</label>
        <input type="number" value={marks} onChange={onMarksChange} className="w-20 border rounded px-2 py-1" />
      </div>

      {type === 'MCQ' && (
        <div className="mt-3 bg-white p-3 border rounded">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm font-semibold">Options</div>
            <div className="text-xs text-blue-600 font-medium">Select the correct answer</div>
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
              <button type="button" onClick={() => removeOption(idx)} className="text-sm text-red-500 hover:text-red-700">×</button>
            </div>
          ))}
          <button type="button" onClick={addOption} className="text-sm text-blue-600 hover:underline">+ Add option</button>
        </div>
      )}

      {type === 'CODING' && (
        <div className="mt-3 space-y-4 bg-slate-50 p-4 rounded border">
          <div>
            <label className="text-sm font-semibold text-slate-700">Problem Description</label>
            <textarea value={description} onChange={onDescriptionChange} placeholder="Detailed problem statement..." className="w-full border rounded p-2 mt-1 h-24" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Constraints</label>
              <textarea value={constraints} onChange={onConstraintsChange} placeholder="e.g. 1 <= N <= 100" className="w-full border rounded p-2 mt-1 h-20" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Starter Code</label>
              <textarea value={codeTemplate} onChange={onCodeTemplateChange} className="w-full border rounded p-2 mt-1 h-20 font-mono text-sm bg-slate-800 text-white" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Test Cases</label>
            </div>
            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border shadow-sm">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={tc.input} onChange={e => updateTestCase(idx, 'input', e.target.value)} placeholder="Input" className="border rounded px-2 py-1 text-sm font-mono col-span-2 md:col-span-1" />
                      <input value={tc.expectedOutput} onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)} placeholder="Expected Output" className="border rounded px-2 py-1 text-sm font-mono col-span-2 md:col-span-1" />
                      <input value={tc.explanation || ''} onChange={e => updateTestCase(idx, 'explanation', e.target.value)} placeholder="Explanation (Optional)" className="border rounded px-2 py-1 text-sm col-span-2" />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input type="checkbox" checked={tc.isPublic} onChange={e => updateTestCase(idx, 'isPublic', e.target.checked)} />
                      Visible to student (Sample Case)
                    </label>
                  </div>
                  <button type="button" onClick={() => removeTestCase(idx)} className="text-red-500 hover:text-red-700">×</button>
                </div>
              ))}
              <button type="button" onClick={addTestCase} className="text-sm text-blue-600 hover:underline font-medium">+ Add Test Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

