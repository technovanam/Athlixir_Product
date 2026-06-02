const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const CLAUDE_KEY = env.CLAUDE_API_KEY;
const GEMINI_KEY = env.GEMINI_API_KEY;

async function testClaude(model) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });
    const data = await res.json();
    console.log(`Claude [${model}] status: ${res.status}`, data.error ? data.error.message : 'OK');
  } catch (err) {
    console.error(`Claude [${model}] failed:`, err.message);
  }
}

async function testGemini(model) {
  try {
    // Test both v1 and v1beta
    for (const apiVer of ['v1', 'v1beta']) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${GEMINI_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        }),
      });
      const data = await res.json();
      console.log(`Gemini [${apiVer}/${model}] status: ${res.status}`, data.error ? data.error.message : 'OK');
    }
  } catch (err) {
    console.error(`Gemini [${model}] failed:`, err.message);
  }
}

async function listGeminiModels() {
  try {
    for (const apiVer of ['v1', 'v1beta']) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models?key=${GEMINI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.status === 200 && data.models) {
        console.log(`\nAvailable models in Gemini ${apiVer}:`);
        data.models.forEach(m => console.log(`  - ${m.name}`));
      } else {
        console.log(`\nFailed to list models in Gemini ${apiVer} (status ${res.status}):`, data.error ? data.error.message : data);
      }
    }
  } catch (err) {
    console.error('Failed to list Gemini models:', err.message);
  }
}

async function listClaudeModels() {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
      },
    });
    const data = await res.json();
    if (res.status === 200 && data.data) {
      console.log('\nAvailable Claude models:');
      data.data.forEach(m => console.log(`  - ${m.id}`));
    } else {
      console.log(`\nFailed to list Claude models (status ${res.status}):`, data.error ? data.error.message : data);
    }
  } catch (err) {
    console.error('Failed to list Claude models:', err.message);
  }
}

async function run() {
  console.log('Testing Claude models...');
  await testClaude('claude-3-5-sonnet-20241022');
  await testClaude('claude-3-5-sonnet-20240620');
  await testClaude('claude-3-haiku-20240307');

  console.log('\nTesting Gemini models...');
  await testGemini('gemini-2.5-flash');
  await testGemini('gemini-3.5-flash');
  await testGemini('gemini-2.0-flash-lite');

  console.log('\nListing available Claude models...');
  await listClaudeModels();

  console.log('\nListing available Gemini models...');
  await listGeminiModels();
}

run();
