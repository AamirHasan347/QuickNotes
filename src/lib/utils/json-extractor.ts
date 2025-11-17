/**
 * JSON Extraction Utilities
 * Helpers for extracting JSON from AI responses that may contain extra text
 */

/**
 * Extract JSON from a string that may contain other text
 * Handles DeepSeek R1's chain-of-thought reasoning format
 */
export function extractJSON(text: string): any {
  try {
    // First, try to parse the entire string as JSON
    return JSON.parse(text.trim());
  } catch {
    // If that fails, try to find JSON within the text

    // Look for content between triple backticks (markdown code blocks)
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch {
        // Continue to other methods
      }
    }

    // Look for the first complete JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Continue to other methods
      }
    }

    // Look for content after "Output:" or similar markers
    const markers = ['Output:', 'Result:', 'Response:', 'JSON:'];
    for (const marker of markers) {
      const index = text.indexOf(marker);
      if (index !== -1) {
        const afterMarker = text.substring(index + marker.length).trim();
        try {
          return JSON.parse(afterMarker);
        } catch {
          // Try to extract JSON from after marker
          const jsonAfterMarker = afterMarker.match(/\{[\s\S]*\}/);
          if (jsonAfterMarker) {
            try {
              return JSON.parse(jsonAfterMarker[0]);
            } catch {
              // Continue
            }
          }
        }
      }
    }

    // If all else fails, throw the original error
    throw new Error('Could not extract valid JSON from response');
  }
}

/**
 * Extract JSON from DeepSeek R1 response format
 * DeepSeek R1 outputs: <think>reasoning</think>\nJSON
 */
export function extractDeepSeekJSON(text: string): any {
  try {
    // First try standard extraction
    return extractJSON(text);
  } catch {
    // DeepSeek specific: remove <think> tags
    const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Try to parse what's left
    try {
      return JSON.parse(withoutThink);
    } catch {
      // Try to find JSON in what's left
      return extractJSON(withoutThink);
    }
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    return extractJSON(text);
  } catch {
    return fallback;
  }
}

/**
 * Remove DeepSeek R1 thinking tags from text response
 * DeepSeek R1 outputs: <think>reasoning</think>\nActual Response
 */
export function stripThinkingTags(text: string): string {
  console.log('🧹 [JSON EXTRACTOR] stripThinkingTags() called');
  console.log('📏 [JSON EXTRACTOR] Input length:', text?.length || 0);
  console.log('📝 [JSON EXTRACTOR] Input preview:', text?.substring(0, 200));

  // Check if thinking tags are present
  const hasThinkTags = /<think>[\s\S]*?<\/think>/g.test(text);
  console.log('🔍 [JSON EXTRACTOR] Has <think> tags:', hasThinkTags);

  // Remove all <think>...</think> blocks
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .trim();

  console.log('📏 [JSON EXTRACTOR] Output length:', cleaned?.length || 0);
  console.log('📝 [JSON EXTRACTOR] Output preview:', cleaned?.substring(0, 200));
  console.log('✅ [JSON EXTRACTOR] stripThinkingTags() completed\n');

  return cleaned;
}
