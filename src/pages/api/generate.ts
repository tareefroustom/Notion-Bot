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

async function concatenateMessages(json) {
  try {
    const obj = await JSON.parse(json);
    const messages = obj.messages;
    let concatenatedContents = "";

    for (let i = 0; i < messages.length; i++) {
      const content = messages[i].content;
      concatenatedContents += " " + content;
    }

    return concatenatedContents;
  } catch (error) {
    console.error(error);
  }
}

export const post: APIRoute = async (context) => {
  const body = await context.request.json();
  const question = await concatenateMessages(JSON.stringify(body));
  const urlParams = new URLSearchParams(context.request.url.search);
  const userEmail = urlParams.get('User_Email');
  const response = await fetch('https://nnq4xy5uj3.execute-api.eu-west-1.amazonaws.com/dev/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      User_Email: userEmail,
      sheet_name: 'gpt panda',
      Excluded_Sheets: ['Tester'],
      operation: 'Ask_Question',
      Question: question,
      Document_URL: 'https://docs.google.com/spreadsheets/d/1rsEva9HsqHjTOr8yAhXzuHH8VK7y4LwtzmX-KIRjovY/edit?usp=sharing',
      //...body // include any additional data from the original request body
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const urlParamsObj = Object.fromEntries(urlParams); // <-- convert URLSearchParams to plain object
  return new Response(JSON.stringify(urlParamsObj), { // <-- return JSON object containing URL parameters
    headers: {
      'Content-Type': 'application/json'
    }
  });
};





