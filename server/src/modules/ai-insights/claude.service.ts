import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';

  /**
   * Generates completions from Claude.
   */
  async generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('Claude API key is missing. Bypassing and letting Orchestrator trigger Gemini or Simulator.');
      throw new Error('Claude API key missing');
    }

    try {
      this.logger.log('Sending message request to Anthropic Claude...');
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Claude API responded with error status ${response.status}: ${errorText}`);
        throw new Error(`Claude API Error: status ${response.status}`);
      }

      const responseData: any = await response.json();
      const content = responseData?.content?.[0]?.text;
      if (!content) {
        throw new Error('Claude response content empty');
      }

      return content;
    } catch (err: any) {
      this.logger.error(`Claude API execution failed: ${err.message}`);
      throw err;
    }
  }
}
