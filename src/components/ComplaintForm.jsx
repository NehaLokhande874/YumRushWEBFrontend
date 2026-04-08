import axios from 'axios'
import React, { useState } from 'react'
import { serverUrl } from '../App'

function ComplaintForm({ orderId, shopId, onSubmitted }) {
  const [form, setForm] = useState({ type: 'Food', message: '' })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.message) return setStatus({ type: 'error', text: 'Message is required' })

    try {
      await axios.post(`${serverUrl}/api/complaint/create`, {
        orderId,
        shopId,
        type: form.type,
        message: form.message
      }, { withCredentials: true })

      setStatus({ type: 'success', text: 'Complaint submitted successfully' })
      setForm({ type: 'Food', message: '' })
      onSubmitted && onSubmitted()
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', text: 'Failed to submit complaint' })
    }
  }

  return (
    <div className='bg-white p-4 border border-orange-100 rounded-xl shadow-sm'>
      <h3 className='text-lg font-semibold mb-2'>File a complaint</h3>
      <form onSubmit={handleSubmit} className='space-y-2'>
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className='input input-bordered w-full'>
          <option value='Food'>Food</option>
          <option value='Service'>Service</option>
        </select>
        <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder='Describe your issue' className='input input-bordered w-full h-24' />

        <button type='submit' className='bg-[#ff4d2d] text-white py-2 rounded-lg w-full'>Submit Complaint</button>
      </form>
      {status && <p className={`text-sm mt-2 ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{status.text}</p>}
    </div>
  )
}

export default ComplaintForm
