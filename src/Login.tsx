 import { useState } from 'react'

type LoginProps = {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.token) {
        setError(data.message || 'Invalid email or password.')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('email', data.email)
      localStorage.setItem('role', data.role)

      onLogin()
    } catch (err) {
      console.error(err)
      setError(
        'Unable to connect to the Keystone backend.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            marginBottom: '5px',
            textAlign: 'center',
          }}
        >
          KEYSTONE
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '30px',
          }}
        >
          Field Service Management Platform
        </p>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginTop: '20px' }}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: '#dc2626',
                marginTop: '15px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              border: 'none',
              borderRadius: '7px',
              background: '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login