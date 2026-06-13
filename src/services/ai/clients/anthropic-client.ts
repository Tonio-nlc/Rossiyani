import { logProviderHttpResponse } from "@/lib/diagnostics";

export async function callAnthropicMessages(params: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
}): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: 16384,
      system: params.system,
      messages: [{ role: "user", content: params.user }],
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    logProviderHttpResponse("Anthropic", response.status, rawBody);
    throw new Error(`Anthropic API error ${response.status}: ${rawBody}`);
  }

  logProviderHttpResponse("Anthropic", response.status, rawBody);

  const data = JSON.parse(rawBody) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Anthropic API returned no message content");
  }

  return text;
}
