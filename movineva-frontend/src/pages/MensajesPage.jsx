import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function MensajesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    apiClient.get('/users/messages')
      .then(res => {
        if (res.success) setMessages(res.data)
      })
      .catch(err => toast('No se pudieron cargar los mensajes', 'error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '0 20px' }}>
      <PageHeader
        title="📩 Buzón Pro"
        subtitle="Mensajes exclusivos para el equipo MoviNeiva"
      />

      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <EmptyState
          icon="📬"
          message="Tu buzón está vacío. ¡Pronto recibirás noticias!"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
          {messages.map(msg => (
            <Card key={msg.id} accent={msg.type === 'SYSTEM' ? 'var(--brand)' : 'var(--info)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontWeight: 800,
                  color: msg.type === 'SYSTEM' ? 'var(--brand)' : 'var(--info)',
                  fontSize: 14
                }}>
                  {msg.title}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
