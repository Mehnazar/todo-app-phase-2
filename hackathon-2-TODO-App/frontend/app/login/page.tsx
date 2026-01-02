'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, CheckSquare } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login({ email, password })

      // Store token and user data
      auth.setToken(response.token)
      auth.setUser(response.user)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.detail?.error?.message || 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 shadow-lg">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Evolution of Todo
          </p>
        </div>

        <Card variant="elevated">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Card variant="bordered" className="bg-red-50 border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </Card>
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
            >
              {!loading && 'Sign in'}
            </Button>

            <div className="text-sm text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Register here
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
