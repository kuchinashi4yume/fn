<p align="center">
  <img src="./yume_128x128@2x.png" width="128" alt="yume" />
</p>

<h1 align="center">fn</h1>

<p align="center">
  <strong>A minimalist CLI tool that instantly generates function-level code and copies it to your clipboard using Ollama.</strong>
</p>

<br>

## Table of Contents
- [1. What is this?](#1-what-is-this)
- [2. Requirements](#2-requirements)
- [3. Installation & Usage](#3-installation--usage)
- [4. How to customize](#4-how-to-customize)

<br>

## 1. What is this?
- fn: **F**unctio**n**
- This is a simple CLI that generates code at the function level. Although it utilizes the Ollama API, it is customizable.

<br>

## 2. Requirements
- Node.js 22+
- Ollama

<br>

## 3. Installation & Usage

### Step 1: Add alias to your shell profile (`~/.zshrc` or `~/.bashrc`)
```bash
alias fn="$HOME/path/to/_fn"
```

### Step 2: Generate code!
```bash
$ fn nodejs/javascript 미로 생성
```

```js
function generateMaze(width, height) {
    // Ensure dimensions are odd for clean wall/passage separation
    const gridWidth = (width % 2 === 0) ? width + 1 : width;
    const gridHeight = (height % 2 === 0) ? height + 1 : height;

    // Initialize the grid entirely with walls ('#')
    let maze = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill('#'));

    // Helper function to check if coordinates are within bounds
    const isInBounds = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;

    // Directions: [dr, dc] (Move two steps to jump over a wall)
    const directions = [[0, 2], [0, -2], [2, 0], [-2, 0]];

    // Depth First Search (DFS) algorithm for maze generation
    function carvePath(r, c) {
        // Mark current cell as a path (' ') 
        maze[r][c] = ' '; 

        // Randomize order of directions
        const directionsCopy = [...directions];
        directionsCopy.sort(() => Math.random() - 0.5);

        for (const [dr, dc] of directionsCopy) {
            const nr = r + dr;
            const nc = c + dc;

            // Check if the target cell is valid and still a wall
            if (isInBounds(nr, nc) && maze[nr][nc] === '#') {
                // The wall cell between current (r, c) and next (nr, nc)
                // is located at (r + dr/2, c + dc/2).
                // Since dr and dc are always even, we calculate the intermediate wall.
                const wallR = r + dr / 2;
                const wallC = c + dc / 2;
                
                // 1. Carve the wall passage
                maze[wallR][wallC] = ' '; 
                
                // 2. Recurse into the neighbor cell
                carvePath(nr, nc);
            }
        }
    }

    // Start the generation from a random odd coordinate (r=1, c=1 is standard start)
    // We assume the input dimensions are at least 3x3.
    carvePath(1, 1);

    // Optional: Set entrance and exit points
    maze[1][0] = 'E'; // Entrance
    maze[gridHeight - 2][gridWidth - 1] = 'X'; // Exit

    return maze;
}

// --- Example Usage ---
// Note: The resulting structure is a 2D array representing the grid.
const WIDTH = 20;
const HEIGHT = 10;

const mazeGrid = generateMaze(WIDTH, HEIGHT);

// Function to visualize the maze in console (optional)
function printMaze(maze) {
    console.log("\n--- Generated Maze ---");
    maze.forEach(row => {
        console.log(row.join(' '));
    });
    console.log("----------------------");
}

// Execute and display
printMaze(mazeGrid);
```

```bash
$ node test.js

--- Generated Maze ---
# # # # # # # # # # # # # # # # # # # # #
E   #           #                       #
#   #   # # #   # # # # # # # # # # #   #
#       #   #                   #       #
# # # # #   # # # # # # # # #   #   #   #
#   #           #       #       #   #   #
#   #   #   # # #   #   #   # # #   #   #
#       #       #   #   #   #       #   #
#   # # # # #   #   #   #   # # #   #   #
#           #       #               #   X
# # # # # # # # # # # # # # # # # # # # #
----------------------
```

It is automatically copied to the clipboard, so there is no need to manually drag the terminal text.

<br>

## 4. How to customize

### Modify Ollama Endpoint & Model

You can change the connection URL or the local Ollama model within main.js.

```javascript
const url = 'http://127.0.0.1:11434/api/chat';

const res = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'gemma4:e4b',
    ...
```

### Edit System Prompt

Modify the system prompt to adjust the coding style or output format.

```javascript
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
```

### Clipboard Logic (Non-macOS Users)

Please modify the execSync statement when running in Linux or Windows environments.

```js
// macOS
execSync('pbcopy', { input: result });

// Linux (Need xclip)
execSync('xclip -selection clipboard', { input: result });

// Windows (PowerShell)
execSync('clip', { input: result });
```

### Edit Build Settings

Build a standalone binary using the Node.js SEA feature.

- package.json

```json
"scripts": {
    ...
    "b1": "node --experimental-sea-config sea-config.json",
    "b2": "cp $(command -v node) fn",
    "b3": "codesign --remove-signature fn",
    "b4": "npx postject fn NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA",
    "b5": "codesign --sign - fn",
    ...
},
```

- sea-config.json

```json
{
    "main": "main.js",
    "output": "sea-prep.blob",
    "disableExperimentalSEAWarning": true,
    "execArgv": ["--no-warnings","--max-old-space-size=4096"]
}
```
