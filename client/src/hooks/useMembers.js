// client/src/hooks/useMembers.js
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

//Hook para cargar miembros
export default function useMembers() {
  const { token, user } = useAuth()
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!token || !user.familyId) return
    axios.get(`/api/users?familyId=${user.familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => setMembers(r.data))
    .catch(() => {})
  }, [token, user.familyId])

  return members
}
