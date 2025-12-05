import React, { useState } from 'react'
import client from '../services/api'
import { saveToken } from '../services/auth'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  async function submit(e){
    e.preventDefault()
    try{
      // attempt login endpoint; fallback to local demo token
      const res = await client.post('/auth/login', { email, password }).catch(()=>null)
      if(res && res.data && res.data.token){
        saveToken(res.data.token)
        window.location.href = '/'
      } else {
        saveToken('local-demo-token')
        window.location.href = '/'
      }
    }catch(err){
      setError('Login failed')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full p-2 rounded bg-transparent border border-white/10" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="w-full p-2 rounded bg-transparent border border-white/10" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex justify-end">
            <button className="btn" type="submit">Entrar</button>
          </div>
          {error && <div className="text-red-400">{error}</div>}
        </form>
      </div>
    </div>
  )
}
