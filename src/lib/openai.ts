import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PageData {
  title: string;
  content: string;
  url: string;
  metadata: {
    description?: string;
    keywords?: string;
  };
}

const createSystemMessage = (pageData: PageData): string => {
  // Calculate token estimate (rough approximation: 4 chars = 1 token)
  const estimatedTokensPerChar = 0.25;
  const maxContextTokens = 4000; // Leave room for conversation and response
  const reservedTokens = 1000; // Reserve tokens for system instructions and metadata

  // Calculate available tokens for content
  const availableTokensForContent = maxContextTokens - reservedTokens;
  const maxChars = Math.floor(availableTokensForContent / estimatedTokensPerChar);

  // Smart content truncation
  let relevantContent = '';
  if (pageData.content.length > maxChars) {
    // Take first 60% from the beginning and 40% from the end if content is too long
    const startChars = Math.floor(maxChars * 0.6);
    const endChars = Math.floor(maxChars * 0.4);
    relevantContent =
      pageData.content.slice(0, startChars) + '\n[...content truncated...]\n' + pageData.content.slice(-endChars);
  } else {
    relevantContent = pageData.content;
  }

  return `You are a helpful AI assistant analyzing a webpage.

PAGE CONTEXT:
Title: ${pageData.title}
URL: ${pageData.url}
${pageData.metadata.description ? `Description: ${pageData.metadata.description}` : ''}
${pageData.metadata.keywords ? `Keywords: ${pageData.metadata.keywords}` : ''}

Main content:
${relevantContent}

Instructions:
- Provide accurate, concise answers based on the webpage content
- If information isn't available in the content, say so
- Focus on the main topic and key points
- Keep responses clear and well-structured
${pageData.content.length > maxChars ? '- Note: Content has been truncated to include both beginning and end of the page' : ''}`;
};

export const sendToOpenAI = async (
  messages: Message[],
  apiKey: string,
  pageData: PageData,
  onProgress?: (chunk: string) => void,
): Promise<string> => {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const systemMessage: Message = {
      role: 'system',
      content: createSystemMessage(pageData),
    };

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
      stream: true, // Enable streaming
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;

      // Call the progress callback if provided
      if (content && onProgress) {
        onProgress(content);
      }
    }

    return fullResponse;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(error.message);
    }
    throw new Error('Failed to communicate with OpenAI');
  }
};
