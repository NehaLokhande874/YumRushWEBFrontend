import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:8000/api/admin/login', { email, password })
      localStorage.setItem('adminToken', res.data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className='h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center text-red-500 mb-6'>Admin Login</h2>
        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
        <form onSubmit={handleLogin} className='space-y-4'>
          <input type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} className='w-full border p-3 rounded-lg' required />
          <input type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} className='w-full border p-3 rounded-lg' required />
          <button type='submit' className='w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600'>Login</button>
        </form>
      </div>
    </div>
  )
}
