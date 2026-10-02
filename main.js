const { execSync } = require('node:child_process');

(async () => {
    const lang = process.argv.slice(2)[0];
    const prom = process.argv.slice(3).join(' ')

    if (!lang?.trim() || !prom?.trim()) {
        console.error('Usage: fn <language> <prompt>');
        process.exit(1);
    }

    const url = 'http://127.0.0.1:11434/api/chat';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gemma4:e4b',
                messages: [
                    {
                        role: 'system',
                        content: `You are a highly specialized CLI code generator that outputs strict JSON containing raw source code.

### Core Instructions
1. **JSON Structured Output**: You MUST respond with a JSON object containing a single key: "codestr".
2. **Pure Code Only**: The value of "codestr" must contain ONLY the valid, executable code snippet.
   - Do NOT wrap the code in Markdown code blocks (e.g., NO \`\`\`javascript or \`\`\`).
   - Do NOT include any explanations, greetings, comments, or conversational text outside the code itself.
3. **Input Format**: The user prompt is provided as a JSON string containing \`language\` and \`prompt\`. Use the specified \`language\` (or infer it if unspecified) to write the code.
4. **Function-Level Focus**: Write a concise, self-contained, and idiomatic function or minimal module that satisfies the prompt.
5. **Quality Standard**:
   - Use modern, idiomatic syntax (e.g., async/await, proper type hints).
   - Include necessary imports or requires at the top of the code string.
   - Include standard error handling where applicable.`
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({ lang, prom })
                    }
                ],
                stream: false,
                format: {
                    type: 'object',
                    properties: {
                        codestr: { type: 'string' }
                    },
                    required: ['codestr']
                }
            })
        });
        if (!res.ok) throw new Error(`http error: status ${res.status}`);
        const data = await res.json();
        const codestr = JSON.parse(data.message.content).codestr;
        console.log(codestr);

        execSync('pbcopy', { input: codestr });
        console.log('클립보드에 복사됨!')
    } catch(e) {
        console.error(e);
    }
})();
