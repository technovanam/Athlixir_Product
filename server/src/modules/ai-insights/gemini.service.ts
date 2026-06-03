import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  // Use Gemini 1.5 Flash for high performance and strict JSON mode
  private readonly apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  /**
   * Generates completions from Gemini.
   */
  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    forceJson = true,
  ): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn(
        'Gemini API key is missing. Bypassing and letting Orchestrator fallback.',
      );
      throw new Error('Gemini API key missing');
    }

    try {
      this.logger.log('Sending message request to Google Gemini...');
      const url = `${this.apiUrl}?key=${this.apiKey}`;

      const payload: any = {
        contents: [
          {
            parts: [
              {
                text: userPrompt,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      };

      if (forceJson) {
        payload.generationConfig = {
          responseMimeType: 'application/json',
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Gemini API responded with error status ${response.status}: ${errorText}`,
        );
        throw new Error(`Gemini API Error: status ${response.status}`);
      }

      const responseData: any = await response.json();
      const content = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini response content empty');
      }

      return content;
    } catch (err: any) {
      this.logger.error(`Gemini API execution failed: ${err.message}`);
      throw err;
    }
  }
}
