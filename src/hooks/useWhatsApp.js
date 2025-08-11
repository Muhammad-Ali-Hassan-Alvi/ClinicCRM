import { useState, useEffect, useCallback } from "react"

export const useWhatsApp = () => {
  const [connected, setConnected] = useState(false)
  const [qr, setQr] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Poll QR code until connected
  useEffect(() => {
    if (connected) return

    const checkConnection = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("https://clinic-backend-production-fdd5.up.railway.app/qr")
        const data = await res.json()

        if (data.message === "Client already authenticated.") {
          setConnected(true)
          setQr(null)
        } else if (data.qr) {
          setQr(data.qr)
        } else if (data.error) {
          setError(data.error)
        }
      } catch (err) {
        setError("Failed to connect to server")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 3000)
    return () => clearInterval(interval)
  }, [connected])

  // Fetch chats when connected
  useEffect(() => {
    if (!connected) return

    const fetchChats = async () => {
      try {
        setLoading(true)
        const res = await fetch("https://clinic-backend-production-fdd5.up.railway.app/chats")
        const data = await res.json()
        setChats(data.chats || [])
      } catch (e) {
        console.error("Failed to fetch chats:", e)
        setError("Failed to fetch chats")
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [connected])

  // Fetch messages when chat changes
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const res = await fetch(`https://clinic-backend-production-fdd5.up.railway.app/messages?chatId=${selectedChatId}`)
        const data = await res.json()
        setMessages(data.messages || [])
      } catch (e) {
        console.error("Error fetching messages:", e)
        setError("Failed to fetch messages")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [selectedChatId])

  const sendMessage = useCallback(
    async (number, message) => {
      if (!selectedChatId || !message.trim()) return

      try {
        const chatId = selectedChatId
        const res = await fetch("https://clinic-backend-production-fdd5.up.railway.app/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message }),
        })

        const data = await res.json()
        if (!data.success) {
          throw new Error(data.error || "Failed to send message")
        }

        // Refresh messages after sending
        const messagesRes = await fetch(`https://clinic-backend-production-fdd5.up.railway.app/messages?chatId=${selectedChatId}`)
        const messagesData = await messagesRes.json()
        setMessages(messagesData.messages || [])
      } catch (err) {
        console.error("Failed to send message:", err)
        setError("Failed to send message")
      }
    },
    [selectedChatId],
  )

  return {
    connected,
    qr,
    chats,
    selectedChatId,
    setSelectedChatId,
    messages,
    sendMessage,
    loading,
    error,
  }
}
