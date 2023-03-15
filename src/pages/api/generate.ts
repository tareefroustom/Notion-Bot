import type { APIRoute } from 'astro'
import { generatePayload } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
import { fetch, ProxyAgent } from 'undici'

const apiKey = import.meta.env.OPENAI_API_KEY
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')
const sitePassword = import.meta.env.SITE_PASSWORD

export const post: APIRoute = async (context) => {
  const body = await context.request.json()
  const { sign, time, messages, pass } = body
  if (!messages) {
    return new Response('No input text')
  }
  if (sitePassword && sitePassword !== pass) {
    return new Response('Invalid password')
  }
  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '', }, sign)) {
    return new Response('Invalid signature')
  }
  const initOptions = generatePayload(apiKey, messages)
  if (httpsProxy) {
    initOptions['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions)
  const result = await response.json()
  return new Response(JSON.stringify(result))
}
