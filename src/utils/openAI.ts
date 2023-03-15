import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { ChatMessage } from '@/types'

export const generatePayload = (apiKey: string, messages: ChatMessage[]): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.6
  }),
})

export const parseOpenAIStream = (rawResponse: Response): string => {
  const encoder = new TextEncoder()

  const jsonResponse = rawResponse.jsonSync()
  const output = jsonResponse.choices[0].delta?.content || ''

  return output
}
