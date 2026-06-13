import { logProviderHttpResponse } from "@/lib/diagnostics";

export async function callOpenAIChat(params: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
}): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    logProviderHttpResponse("OpenAI", response.status, rawBody);
    throw new Error(`OpenAI API error ${response.status}: ${rawBody}`);
  }

  logProviderHttpResponse("OpenAI", response.status, rawBody);

  const data = JSON.parse(rawBody) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI API returned no message content");
  }

  return text;
}
