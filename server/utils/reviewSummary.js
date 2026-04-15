function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripOuterQuotes(value) {
  return value.replace(/^["'`]+|["'`]+$/g, '').trim();
}

function ensureSentence(value) {
  const text = stripOuterQuotes(normalizeWhitespace(value));
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function firstMeaningfulSentence(text) {
  const clean = normalizeWhitespace(text);
  if (!clean) return '';
  const parts = clean.match(/[^.!?]+[.!?]?/g) || [clean];
  const sentence = parts.find((part) => normalizeWhitespace(part).length > 20) || parts[0];
  return ensureSentence(sentence);
}

function fallbackSummaryText({ text, rating, sentiment }) {
  const sentence = firstMeaningfulSentence(text);
  if (sentence) {
    const trimmed = sentence.replace(/^(i|we)\s+/i, '').replace(/^(they|the reviewer)\s+/i, '');
    return ensureSentence(`they thought ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`);
  }

  const ratingText = Number.isFinite(Number(rating)) ? `${rating}/5` : 'their rating';
  const sentimentMap = {
    positive: `they enjoyed it and rated it ${ratingText}`,
    neutral: `they had mixed feelings and rated it ${ratingText}`,
    negative: `they were disappointed and rated it ${ratingText}`,
  };
  return ensureSentence(sentimentMap[sentiment] || `they rated it ${ratingText}`);
}

export function formatReviewSummary(username, summaryText, rating, sentiment, text = '') {
  const name = normalizeWhitespace(username) || 'Someone';
  const summary = ensureSentence(summaryText) || fallbackSummaryText({ text, rating, sentiment });
  const body = summary.replace(/^(they|the reviewer)\s+/i, '');
  return `${name} says they ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
}

export async function generateReviewSummaryText({ text, rating, sentiment, apiKey = process.env.GEMINI_API_KEY }) {
  const cleanText = normalizeWhitespace(text);
  if (!cleanText) {
    return fallbackSummaryText({ text: cleanText, rating, sentiment });
  }

  if (!apiKey) {
    return fallbackSummaryText({ text: cleanText, rating, sentiment });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: [
                    'Summarize this movie review as one short sentence fragment.',
                    'Rules:',
                    '- Return only the fragment, not JSON.',
                    '- Do not mention the reviewer name.',
                    '- Write it so it fits after "Username says they ...".',
                    '- Keep it under 12 words.',
                    '- Keep it factual and single-line.',
                    '',
                    `Rating: ${rating}/5`,
                    `Sentiment: ${sentiment}`,
                    `Review: ${cleanText}`,
                  ].join('\n'),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join(' ')
      .trim();

    const cleaned = ensureSentence(candidateText)
      .replace(/^username says\s+/i, '')
      .replace(/^they\s+/i, 'they ');

    if (!cleaned) {
      throw new Error('Gemini returned empty summary');
    }

    if (/^they\s+/i.test(cleaned)) {
      return cleaned;
    }

    return `they ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  } catch {
    return fallbackSummaryText({ text: cleanText, rating, sentiment });
  }
}
