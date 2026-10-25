/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game } from './types';

export const defaultGames: Game[] = [
  {
    id: 'tetris',
    title: 'Тетрис (Soviet Tetris)',
    description: 'The legendary brick-matching puzzle game created in Moscow, USSR in 1984. Spin, drop, and clear lines!',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soviet Tetris</title>
  <style>
    body {
      background: #090d16;
      color: #00f5d4;
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      overflow: hidden;
    }
    h2 {
      margin: 5px 0;
      font-size: 1.4rem;
      text-transform: uppercase;
      text-shadow: 0 0 5px #00f5d4;
      color: #e63946;
    }
    #game-container {
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: flex-start;
      background: #111827;
      padding: 15px;
      border: 2px solid #e63946;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(230, 57, 70, 0.3);
    }
    canvas {
      border: 2px solid #00f5d4;
      background: #04060a;
      box-shadow: 0 0 10px rgba(0, 245, 212, 0.2);
    }
    .panel {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 400px;
      min-width: 120px;
    }
    .stat-box {
      background: #020617;
      border: 1px solid #e63946;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      text-align: center;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #ffb703;
      text-transform: uppercase;
    }
    .stat-val {
      font-size: 1.5rem;
      font-weight: bold;
      color: #00f5d4;
      text-shadow: 0 0 5px #00f5d4;
      margin-top: 5px;
    }
    .controls-info {
      font-size: 0.7rem;
      color: #9ca3af;
      line-height: 1.4;
      border-top: 1px solid #374151;
      padding-top: 10px;
    }
    /* Touch controls */
    .touch-controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
      width: 100%;
      max-width: 340px;
    }
    .btn {
      background: #1f2937;
      border: 1px solid #00f5d4;
      color: #00f5d4;
      padding: 12px;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      text-align: center;
    }
    .btn:active {
      background: #00f5d4;
      color: #090d16;
      box-shadow: 0 0 10px #00f5d4;
    }
    .btn-red {
      border-color: #e63946;
      color: #e63946;
    }
    .btn-red:active {
      background: #e63946;
      color: #090d16;
      box-shadow: 0 0 10px #e63946;
    }
    @media (max-width: 500px) {
      #game-container {
        flex-direction: column;
        align-items: center;
        padding: 10px;
      }
      .panel {
        height: auto;
        flex-direction: row;
        width: 100%;
        gap: 10px;
      }
      .stat-box {
        flex: 1;
        margin-bottom: 0;
      }
      .controls-info {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h2>ТЕТРИС USSR 1984</h2>
  <div id="game-container">
    <canvas id="tetris" width="200" height="400"></canvas>
    <div class="panel">
      <div>
        <div class="stat-box">
          <div class="stat-label">Score</div>
          <div id="score" class="stat-val">0</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Lines</div>
          <div id="lines" class="stat-val">0</div>
        </div>
      </div>
      <div class="controls-info">
        <strong>Controls:</strong><br>
        ← / → : Move<br>
        ↑ : Rotate<br>
        ↓ : Soft Drop<br>
        Space : Hard Drop
      </div>
    </div>
  </div>

  <div class="touch-controls">
    <div class="btn" id="btn-left">←</div>
    <div class="btn" id="btn-rotate">↑</div>
    <div class="btn" id="btn-right">→</div>
    <div class="btn btn-red" id="btn-down">↓</div>
    <div class="btn btn-red" id="btn-drop" style="grid-column: span 2;">Hard Drop</div>
  </div>

  <script>
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');

    context.scale(20, 20);

    // Audio synth
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, duration) {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function arenaSweep() {
      let rowCount = 1;
      outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) {
            continue outer;
          }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        player.lines += 1;
        rowCount *= 2;
        playBeep(440, 0.2);
        setTimeout(() => playBeep(554.37, 0.2), 100);
      }
    }

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 &&
             (arena[y + o.y] &&
              arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    function createMatrix(w, h) {
      const matrix = [];
      while (h--) {
        matrix.push(new Array(w).fill(0));
      }
      return matrix;
    }

    function createPiece(type) {
      if (type === 'T') {
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
      } else if (type === 'O') {
        return [
          [2, 2],
          [2, 2],
        ];
      } else if (type === 'L') {
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
      } else if (type === 'J') {
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
      } else if (type === 'I') {
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
        ];
      } else if (type === 'S') {
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      } else if (type === 'Z') {
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
      }
    }

    function draw() {
      context.fillStyle = '#04060a';
      context.fillRect(0, 0, canvas.width, canvas.height);

      drawMatrix(arena, {x: 0, y: 0});
      drawMatrix(player.matrix, player.pos);
    }

    const colors = [
      null,
      '#e63946', // T
      '#ffb703', // O
      '#fb8500', // L
      '#0284c7', // J
      '#00f5d4', // I
      '#22c55e', // S
      '#a855f7', // Z
    ];

    function drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x,
                             y + offset.y,
                             1, 1);
            context.strokeStyle = '#090d16';
            context.lineWidth = 0.05;
            context.strokeRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        playBeep(200, 0.1);
      }
      dropCounter = 0;
    }

    function playerHardDrop() {
      while (!collide(arena, player)) {
        player.pos.y++;
      }
      player.pos.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
      updateScore();
      playBeep(300, 0.15);
      dropCounter = 0;
    }

    function playerMove(dir) {
      player.pos.x += dir;
      if (collide(arena, player)) {
        player.pos.x -= dir;
      } else {
        playBeep(600, 0.05);
      }
    }

    function playerReset() {
      const pieces = 'ILJOTSZ';
      player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
      player.pos.y = 0;
      player.pos.x = (arena[0].length / 2 | 0) -
                     (player.matrix[0].length / 2 | 0);
      if (collide(arena, player)) {
        // Game over: clear arena
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        updateScore();
        playBeep(100, 0.8);
      }
    }

    function playerRotate(dir) {
      const pos = player.pos.x;
      let offset = 1;
      rotate(player.matrix, dir);
      while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
          rotate(player.matrix, -dir);
          player.pos.x = pos;
          return;
        }
      }
      playBeep(800, 0.05);
    }

    function rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [
            matrix[x][y],
            matrix[y][x],
          ] = [
            matrix[y][x],
            matrix[x][y],
          ];
        }
      }

      if (dir > 0) {
        matrix.forEach(row => row.reverse());
      } else {
        matrix.reverse();
      }
    }

    let dropCounter = 0;
    let dropInterval = 1000;

    let lastTime = 0;
    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;

      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }

      draw();
      requestAnimationFrame(update);
    }

    function updateScore() {
      scoreElement.innerText = player.score;
      linesElement.innerText = player.lines;
    }

    const arena = createMatrix(10, 20);

    const player = {
      pos: {x: 0, y: 0},
      matrix: null,
      score: 0,
      lines: 0,
    };

    document.addEventListener('keydown', event => {
      if (event.keyCode === 37) {
        playerMove(-1);
      } else if (event.keyCode === 39) {
        playerMove(1);
      } else if (event.keyCode === 40) {
        playerDrop();
      } else if (event.keyCode === 38) {
        playerRotate(1);
      } else if (event.keyCode === 32) {
        playerHardDrop();
      }
    });

    // Mobile inputs
    document.getElementById('btn-left').addEventListener('click', () => playerMove(-1));
    document.getElementById('btn-right').addEventListener('click', () => playerMove(1));
    document.getElementById('btn-rotate').addEventListener('click', () => playerRotate(1));
    document.getElementById('btn-down').addEventListener('click', () => playerDrop());
    document.getElementById('btn-drop').addEventListener('click', () => playerHardDrop());

    playerReset();
    updateScore();
    update();
  </script>
</body>
</html>`
  },
  {
    id: 'snake',
    title: 'Змейка (Soviet Snake)',
    description: 'A glowing cyber-neon snake game. Slither across the field and gather precious Russian stars, but do not eat your own tail!',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soviet Snake</title>
  <style>
    body {
      background: #060a13;
      color: #ffb703;
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      overflow: hidden;
    }
    h2 {
      margin: 5px 0;
      font-size: 1.4rem;
      text-transform: uppercase;
      text-shadow: 0 0 5px #ffb703;
      color: #00f5d4;
    }
    #game-container {
      position: relative;
      background: #111827;
      padding: 15px;
      border: 2px solid #ffb703;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(255, 183, 3, 0.2);
    }
    canvas {
      border: 2px solid #ffb703;
      background: #020617;
    }
    .hud {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1rem;
      font-weight: bold;
    }
    .controls-info {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 10px;
      text-align: center;
    }
    .touch-controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
      width: 100%;
      max-width: 240px;
    }
    .btn {
      background: #1f2937;
      border: 1px solid #ffb703;
      color: #ffb703;
      padding: 15px;
      border-radius: 50%;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      text-align: center;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }
    .btn:active {
      background: #ffb703;
      color: #060a13;
      box-shadow: 0 0 10px #ffb703;
    }
  </style>
</head>
<body>
  <h2>ЗМЕЙКА RETRO</h2>
  <div id="game-container">
    <div class="hud">
      <div>SCORE: <span id="score">0</span></div>
      <div>HIGH: <span id="high">0</span></div>
    </div>
    <canvas id="snake" width="300" height="300"></canvas>
    <div class="controls-info">Use Arrow keys or WASD</div>
  </div>

  <div class="touch-controls">
    <div></div>
    <div class="btn" id="btn-up">↑</div>
    <div></div>
    <div class="btn" id="btn-left">←</div>
    <div class="btn" id="btn-down">↓</div>
    <div class="btn" id="btn-right">→</div>
  </div>

  <script>
    const canvas = document.getElementById('snake');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highElement = document.getElementById('high');

    const grid = 15;
    let count = 0;
    let score = 0;
    let highScore = localStorage.getItem('snake_high') || 0;
    highElement.innerText = highScore;

    const snake = {
      x: 150,
      y: 150,
      dx: grid,
      dy: 0,
      cells: [],
      maxCells: 4
    };

    const apple = {
      x: 300 - grid * 4,
      y: 300 - grid * 4
    };

    // Audio synth
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, duration, type='sine') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function loop() {
      requestAnimationFrame(loop);

      // Slow game loop to 15 fps
      if (++count < 6) {
        return;
      }
      count = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // move snake
      snake.x += snake.dx;
      snake.y += snake.dy;

      // Wrap snake position horizontally & vertically
      if (snake.x < 0) {
        snake.x = canvas.width - grid;
      } else if (snake.x >= canvas.width) {
        snake.x = 0;
      }
      
      if (snake.y < 0) {
        snake.y = canvas.height - grid;
      } else if (snake.y >= canvas.height) {
        snake.y = 0;
      }

      // Keep track of cells
      snake.cells.unshift({x: snake.x, y: snake.y});

      // Remove cells as we move away from them
      if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
      }

      // Draw apple (Red Soviet Star)
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      const ax = apple.x + grid/2;
      const ay = apple.y + grid/2;
      ctx.arc(ax, ay, grid/2 - 1, 0, 2*Math.PI);
      ctx.fill();
      // Draw star core
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(apple.x + 5, apple.y + 5, grid - 10, grid - 10);

      // Draw snake
      snake.cells.forEach(function(cell, index) {
        ctx.fillStyle = index === 0 ? '#00f5d4' : '#00a896';
        ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);

        // Snake ate apple
        if (cell.x === apple.x && cell.y === apple.y) {
          snake.maxCells++;
          score += 10;
          scoreElement.innerText = score;
          if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_high', highScore);
            highElement.innerText = highScore;
          }
          playBeep(523.25, 0.1, 'triangle'); // C5
          setTimeout(() => playBeep(659.25, 0.15, 'triangle'), 80); // E5

          // Reset apple
          apple.x = getRandomInt(0, canvas.width / grid) * grid;
          apple.y = getRandomInt(0, canvas.height / grid) * grid;
        }

        // Check collision with all cells after this one
        for (let i = index + 1; i < snake.cells.length; i++) {
          if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
            // Game Over
            playBeep(150, 0.5, 'sawtooth');
            snake.x = 150;
            snake.y = 150;
            snake.cells = [];
            snake.maxCells = 4;
            snake.dx = grid;
            snake.dy = 0;
            score = 0;
            scoreElement.innerText = score;
            apple.x = getRandomInt(0, canvas.width / grid) * grid;
            apple.y = getRandomInt(0, canvas.height / grid) * grid;
          }
        }
      });
    }

    // Keyboard controls
    document.addEventListener('keydown', function(e) {
      if ((e.which === 37 || e.which === 65) && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
        playBeep(330, 0.05);
      } else if ((e.which === 38 || e.which === 87) && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
        playBeep(330, 0.05);
      } else if ((e.which === 39 || e.which === 68) && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
        playBeep(330, 0.05);
      } else if ((e.which === 40 || e.which === 83) && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
        playBeep(330, 0.05);
      }
    });

    // Touch button events
    document.getElementById('btn-up').addEventListener('click', () => {
      if (snake.dy === 0) { snake.dy = -grid; snake.dx = 0; playBeep(330, 0.05); }
    });
    document.getElementById('btn-down').addEventListener('click', () => {
      if (snake.dy === 0) { snake.dy = grid; snake.dx = 0; playBeep(330, 0.05); }
    });
    document.getElementById('btn-left').addEventListener('click', () => {
      if (snake.dx === 0) { snake.dx = -grid; snake.dy = 0; playBeep(330, 0.05); }
    });
    document.getElementById('btn-right').addEventListener('click', () => {
      if (snake.dx === 0) { snake.dx = grid; snake.dy = 0; playBeep(330, 0.05); }
    });

    requestAnimationFrame(loop);
  </script>
</body>
</html>`
  },
  {
    id: 'cosmo',
    title: 'Космическая Оборона (Cosmo Defender)',
    description: 'Protect the space station from incoming cyber-asteroids! Move and fire your plasma laser cannon.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmo Defender</title>
  <style>
    body {
      background: #030712;
      color: #ef4444;
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      overflow: hidden;
    }
    h2 {
      margin: 5px 0;
      font-size: 1.4rem;
      text-transform: uppercase;
      text-shadow: 0 0 5px #ef4444;
      color: #ffb703;
    }
    #game-container {
      position: relative;
      background: #111827;
      padding: 15px;
      border: 2px solid #ef4444;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }
    canvas {
      border: 2px solid #ef4444;
      background: #02040a;
    }
    .hud {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1rem;
      font-weight: bold;
    }
    .touch-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
      width: 100%;
      max-width: 320px;
    }
    .btn {
      background: #1f2937;
      border: 1px solid #ef4444;
      color: #ef4444;
      padding: 12px;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      flex: 1;
      text-align: center;
    }
    .btn:active {
      background: #ef4444;
      color: #030712;
      box-shadow: 0 0 10px #ef4444;
    }
    .btn-fire {
      border-color: #ffb703;
      color: #ffb703;
    }
    .btn-fire:active {
      background: #ffb703;
      color: #030712;
      box-shadow: 0 0 10px #ffb703;
    }
  </style>
</head>
<body>
  <h2>КОСМО ЗАЩИТА</h2>
  <div id="game-container">
    <div class="hud">
      <div>SCORE: <span id="score">0</span></div>
      <div>HP: <span id="hp">100</span>%</div>
    </div>
    <canvas id="cosmo" width="300" height="350"></canvas>
  </div>

  <div class="touch-controls">
    <div class="btn" id="btn-left">←</div>
    <div class="btn btn-fire" id="btn-fire">FIRE</div>
    <div class="btn" id="btn-right">→</div>
  </div>

  <script>
    const canvas = document.getElementById('cosmo');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const hpElement = document.getElementById('hp');

    let score = 0;
    let hp = 100;
    let gameOver = false;

    // Player Starship
    const player = {
      x: 135,
      y: 310,
      w: 30,
      h: 20,
      speed: 6
    };

    let lasers = [];
    let asteroids = [];
    let lastSpawn = 0;

    // Audio synthesizer
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, duration, type='sine') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    // Input handlers
    const keys = {};
    document.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'Space' && !gameOver) {
        fireLaser();
        e.preventDefault();
      }
    });
    document.addEventListener('keyup', e => {
      keys[e.code] = false;
    });

    function fireLaser() {
      lasers.push({
        x: player.x + player.w / 2 - 2,
        y: player.y,
        w: 4,
        h: 12,
        speed: 8
      });
      playBeep(880, 0.08, 'sawtooth');
    }

    function spawnAsteroid() {
      const now = Date.now();
      if (now - lastSpawn > 1200) {
        asteroids.push({
          x: Math.random() * (canvas.width - 25),
          y: -25,
          w: 25,
          h: 25,
          speed: 2 + Math.random() * 2
        });
        lastSpawn = now;
      }
    }

    function isColliding(r1, r2) {
      return r1.x < r2.x + r2.w &&
             r1.x + r1.w > r2.x &&
             r1.y < r2.y + r2.h &&
             r1.y + r1.h > r2.y;
    }

    function update() {
      if (gameOver) return;

      // Move player
      if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x = Math.max(0, player.x - player.speed);
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        player.x = Math.min(canvas.width - player.w, player.x + player.speed);
      }

      // Laser updating
      lasers.forEach((laser, lIdx) => {
        laser.y -= laser.speed;
        if (laser.y < 0) {
          lasers.splice(lIdx, 1);
        }
      });

      // Spawn asteroids
      spawnAsteroid();

      // Asteroid updating
      asteroids.forEach((ast, aIdx) => {
        ast.y += ast.speed;

        // Check base collision
        if (ast.y > canvas.height) {
          asteroids.splice(aIdx, 1);
          hp = Math.max(0, hp - 10);
          hpElement.innerText = hp;
          playBeep(180, 0.25, 'triangle');
          if (hp <= 0) {
            gameOver = true;
            playBeep(90, 0.8, 'sawtooth');
          }
        }

        // Check laser collision
        lasers.forEach((laser, lIdx) => {
          if (isColliding(ast, laser)) {
            asteroids.splice(aIdx, 1);
            lasers.splice(lIdx, 1);
            score += 15;
            scoreElement.innerText = score;
            playBeep(400, 0.1, 'sawtooth');
          }
        });

        // Player ship collision
        if (isColliding(ast, player)) {
          asteroids.splice(aIdx, 1);
          hp = Math.max(0, hp - 20);
          hpElement.innerText = hp;
          playBeep(150, 0.3, 'sawtooth');
          if (hp <= 0) {
            gameOver = true;
            playBeep(90, 0.8, 'sawtooth');
          }
        }
      });
    }

    function draw() {
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameOver) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('СИСТЕМА СБОЯ', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '12px "Courier New", monospace';
        ctx.fillStyle = '#ffb703';
        ctx.fillText('Click anywhere to Restart', canvas.width / 2, canvas.height / 2 + 50);
        return;
      }

      // Draw Starship (Soviet-red plasma look)
      ctx.fillStyle = '#ef4444';
      // Triangle body
      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.closePath();
      ctx.fill();
      // Tech core
      ctx.fillStyle = '#ffb703';
      ctx.fillRect(player.x + player.w / 2 - 4, player.y + 10, 8, 8);

      // Draw Lasers
      ctx.fillStyle = '#00f5d4';
      lasers.forEach(laser => {
        ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
      });

      // Draw Asteroids
      ctx.fillStyle = '#ffb703';
      asteroids.forEach(ast => {
        ctx.fillRect(ast.x, ast.y, ast.w, ast.h);
        // Core details
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ast.x + 5, ast.y + 5, ast.w - 10, ast.h - 10);
        ctx.fillStyle = '#ffb703';
      });
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    // Touch listeners
    document.getElementById('btn-left').addEventListener('click', () => {
      player.x = Math.max(0, player.x - 20);
    });
    document.getElementById('btn-right').addEventListener('click', () => {
      player.x = Math.min(canvas.width - player.w, player.x + 20);
    });
    document.getElementById('btn-fire').addEventListener('click', () => {
      if (!gameOver) fireLaser();
    });

    canvas.addEventListener('click', () => {
      if (gameOver) {
        hp = 100;
        score = 0;
        lasers = [];
        asteroids = [];
        gameOver = false;
        hpElement.innerText = hp;
        scoreElement.innerText = score;
        playBeep(440, 0.1);
        setTimeout(() => playBeep(880, 0.15), 100);
      }
    });

    gameLoop();
  </script>
</body>
</html>`
  },
  {
    id: 'bricks',
    title: 'Разрушитель Стен (Brick Breaker)',
    description: 'Destroy the neon cyber bricks using your bounce paddle. Prevent the sphere from falling!',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    htmlCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soviet Brick Breaker</title>
  <style>
    body {
      background: #070312;
      color: #00f5d4;
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      overflow: hidden;
    }
    h2 {
      margin: 5px 0;
      font-size: 1.4rem;
      text-transform: uppercase;
      text-shadow: 0 0 5px #00f5d4;
      color: #ffb703;
    }
    #game-container {
      position: relative;
      background: #111827;
      padding: 15px;
      border: 2px solid #00f5d4;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(0, 245, 212, 0.2);
    }
    canvas {
      border: 2px solid #00f5d4;
      background: #020308;
    }
    .hud {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1rem;
      font-weight: bold;
    }
    .touch-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
      width: 100%;
      max-width: 320px;
    }
    .btn {
      background: #1f2937;
      border: 1px solid #00f5d4;
      color: #00f5d4;
      padding: 12px;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
      flex: 1;
      text-align: center;
    }
    .btn:active {
      background: #00f5d4;
      color: #070312;
      box-shadow: 0 0 10px #00f5d4;
    }
  </style>
</head>
<body>
  <h2>РАЗРУШИТЕЛЬ СТЕН</h2>
  <div id="game-container">
    <div class="hud">
      <div>SCORE: <span id="score">0</span></div>
      <div>LIVES: <span id="lives">3</span></div>
    </div>
    <canvas id="breaker" width="300" height="300"></canvas>
  </div>

  <div class="touch-controls">
    <div class="btn" id="btn-left">← MOVE LEFT</div>
    <div class="btn" id="btn-right">MOVE RIGHT →</div>
  </div>

  <script>
    const canvas = document.getElementById('breaker');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');

    let score = 0;
    let lives = 3;
    let gameOver = false;
    let victory = false;

    // Paddle
    const paddleHeight = 10;
    const paddleWidth = 60;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // Ball
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 2.5;
    let dy = -2.5;
    const ballRadius = 6;

    // Bricks grid
    const brickRowCount = 4;
    const brickColumnCount = 5;
    const brickWidth = 50;
    const brickHeight = 15;
    const brickPadding = 5;
    const brickOffsetTop = 15;
    const brickOffsetLeft = 15;

    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Synth Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, duration, type='sine') {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    // Input hooks
    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener('keydown', e => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    });
    document.addEventListener('keyup', e => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    });

    function collisionDetection() {
      let activeBricks = 0;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            activeBricks++;
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              score += 20;
              scoreElement.innerText = score;
              playBeep(440 + score, 0.1, 'triangle');
              
              if (score === brickRowCount * brickColumnCount * 20) {
                victory = true;
                gameOver = true;
                playBeep(880, 0.2);
                setTimeout(() => playBeep(1100, 0.3), 100);
              }
            }
          }
        }
      }
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#00f5d4';
      ctx.fill();
      ctx.closePath();
    }

    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = '#ffb703';
      ctx.fill();
      ctx.closePath();
    }

    const rowColors = ['#e63946', '#fb8500', '#ffb703', '#a855f7'];

    function drawBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = rowColors[r % rowColors.length];
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameOver) {
        ctx.font = '20px "Courier New", monospace';
        ctx.textAlign = 'center';
        if (victory) {
          ctx.fillStyle = '#00f5d4';
          ctx.fillText('ПОБЕДА (VICTORY!)', canvas.width / 2, canvas.height / 2);
        } else {
          ctx.fillStyle = '#e63946';
          ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 10);
          ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 20);
        }
        ctx.font = '11px "Courier New", monospace';
        ctx.fillStyle = '#ffb703';
        ctx.fillText('Click anywhere to Restart', canvas.width / 2, canvas.height / 2 + 50);
        return;
      }

      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Ball reflection off walls
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        playBeep(300, 0.05);
      }
      if (y + dy < ballRadius) {
        dy = -dy;
        playBeep(300, 0.05);
      } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          // Calculate bounce offset angle
          let hitPt = x - (paddleX + paddleWidth / 2);
          dx = hitPt * 0.15;
          dy = -dy;
          playBeep(450, 0.08, 'triangle');
        } else {
          lives--;
          livesElement.innerText = lives;
          playBeep(150, 0.3);
          if (!lives) {
            gameOver = true;
          } else {
            // Reset ball & paddle
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = 2.5;
            dy = -2.5;
            paddleX = (canvas.width - paddleWidth) / 2;
          }
        }
      }

      // Move paddle
      if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 5;
      }

      x += dx;
      y += dy;

      requestAnimationFrame(draw);
    }

    // Touch listeners
    document.getElementById('btn-left').addEventListener('touchstart', e => { leftPressed = true; e.preventDefault(); });
    document.getElementById('btn-left').addEventListener('touchend', e => { leftPressed = false; e.preventDefault(); });
    document.getElementById('btn-right').addEventListener('touchstart', e => { rightPressed = true; e.preventDefault(); });
    document.getElementById('btn-right').addEventListener('touchend', e => { rightPressed = false; e.preventDefault(); });

    // Mouse helper fallbacks for desktop clicks on buttons
    document.getElementById('btn-left').addEventListener('mousedown', () => { leftPressed = true; });
    document.getElementById('btn-left').addEventListener('mouseup', () => { leftPressed = false; });
    document.getElementById('btn-right').addEventListener('mousedown', () => { rightPressed = true; });
    document.getElementById('btn-right').addEventListener('mouseup', () => { rightPressed = false; });

    canvas.addEventListener('click', () => {
      if (gameOver) {
        score = 0;
        lives = 3;
        gameOver = false;
        victory = false;
        scoreElement.innerText = score;
        livesElement.innerText = lives;
        // Reset bricks
        for (let c = 0; c < brickColumnCount; c++) {
          for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
          }
        }
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2.5;
        dy = -2.5;
        paddleX = (canvas.width - paddleWidth) / 2;
        playBeep(520, 0.1);
      }
    });

    draw();
  </script>
</body>
</html>`
  }
];
