import { getAccessToken } from '@haifeng/shared/utils/auth'

export interface SseEvent {
  stage: string
  recordId?: number
  current?: number
  total?: number
  university?: string
  status?: string
  message?: string
  code?: number
}

interface SsePostOptions {
  signal?: AbortSignal
}

/**
 * POST + SSE via fetch + ReadableStream.
 * Returns an async generator that yields parsed SseEvent objects.
 */
export async function* ssePost(
  url: string,
  options: SsePostOptions = {}
): AsyncGenerator<SseEvent> {
  const token = getAccessToken()
  if (!token) throw new Error('未登录')

  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({}),
    signal: options.signal,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let msg = `请求失败 (${response.status})`
    try {
      const json = JSON.parse(text)
      msg = json.msg || msg
    } catch {}
    throw new Error(msg)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()!

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue
          try {
            const data: SseEvent = JSON.parse(jsonStr)
            yield data
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
