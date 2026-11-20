import { useState, useEffect } from 'react'

export default function useFetch(url) {
  const [result, setResult] = useState({ url: null, data: null, error: null })

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi ${res.status}`)
        return res.json()
      })
      .then((json) => setResult({ url, data: json, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setResult({ url, data: null, error: err })
      })

    return () => controller.abort()
  }, [url])

  const isCurrent = result.url === url
  return {
    data: isCurrent ? result.data : null,
    loading: Boolean(url) && !isCurrent,
    error: isCurrent ? result.error : null,
  }
}