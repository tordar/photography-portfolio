'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid username or password')
    } else {
      router.push('/admin')
    }
  }

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-80">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Sign In</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-2 mb-4 border rounded"
              required
          />
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 mb-4 border rounded"
              required
          />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Sign In
          </button>
        </form>
      </div>
  )
}

