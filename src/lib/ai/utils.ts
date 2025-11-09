/**
 * AI Utility Functions
 * Helper functions for AI services
 */

/**
 * Clean JSON response from AI models
 * Removes markdown code blocks (```json) and extracts pure JSON
 */
export function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json\n?/i, '');
  cleaned = cleaned.replace(/^```\n?/i, '');
  cleaned = cleaned.replace(/\n?```$/i, '');

  // Remove any leading/trailing whitespace again
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Safely parse JSON from AI response
 */
export function parseAIJson<T = any>(response: string): T {
  const cleaned = cleanJsonResponse(response);
  return JSON.parse(cleaned);
}
