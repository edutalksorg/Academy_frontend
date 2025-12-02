import React from 'react'

export default function FormInput({ label, error, ...props }) {
  return (
    <label className="block mb-3">
      {label && <div className="text-sm text-gray-600 mb-1">{label}</div>}
      <input className={`w-full border ${error ? 'border-red-400' : 'border-gray-200'} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`} {...props} />
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
    </label>
  )
}

