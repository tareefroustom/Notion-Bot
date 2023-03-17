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
  console.log(context);
  const body = await context.request.json();
  const question = await concatenateMessages(JSON.stringify(body));
  
  
  const referer = await context.request.headers.get('referer');
  const searchParams = new URLSearchParams(referer.split('?')[1]);
  const documentUrl = searchParams.get('Document_URL');
  
  //const params = new URLSearchParams(context.request.headers.referer.split('?')[0]);
  //const documentUrl = params.get('Document_URL');
  
  
  console.log(documentUrl);
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
      Question: question,
      Document_URL: documentUrl,
      //...body // include any additional data from the original request body
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();  

  // Modify the response object before returning it
  const results = responseData.results.replace(/\n/g, '\n');
  const modifiedResponse = {
    results
  };

  return new Response(JSON.stringify(modifiedResponse), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
