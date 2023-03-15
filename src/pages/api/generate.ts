import type { APIRoute } from 'astro'
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici'
// #vercel-end

const apiKey = import.meta.env.OPENAI_API_KEY
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')
const sitePassword = import.meta.env.SITE_PASSWORD

export const post: APIRoute = async (context) => {
  const body = await context.request.json();
  const response = await fetch('https://nnq4xy5uj3.execute-api.eu-west-1.amazonaws.com/dev/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      User_Email: 'tareef.ramez',
      sheet_name: 'gpt panda',
      Excluded_Sheets: ['Tester'],
      operation: 'Ask_Question',
      Question: "Tell me something about Roche",
      Document_URL: 'https://docs.google.com/spreadsheets/d/1rsEva9HsqHjTOr8yAhXzuHH8VK7y4LwtzmX-KIRjovY/edit?usp=sharing',
      ...body // include any additional data from the original request body
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  return new Response(JSON.stringify(responseData), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

