const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da Interface DOM
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score-display');
const finalScore = document.getElementById('final-score');

// Configurações e Variáveis de Estado do Jogo
let gameInterval;
let gameActive = false;
let score = 0;
let gameSpeed = 5;

// Parâmetros das pistas
const laneWidth = canvas.width / 3;

// Objeto do Jogador (Carro Azul)
const player = {
    lane: 1, // Começa na pista do meio (0 = Esquerda, 1 = Centro, 2 = Direita)
    x: 0,
    y: canvas.height - 110,
    width: 50,
    height: 90,
    color: '#3498db'
};

// Array para armazenar os obstáculos (Carros Vermelhos)
let obstacles = [];

// Captura de Teclado
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (player.lane > 0) player.lane--;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (player.lane < 2) player.lane++;
    }
});

// Inicializadores de Eventos dos Botões
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Resetar variáveis
    score = 0;
    gameSpeed = 5;
    player.lane = 1;
    obstacles = [];
    gameActive = true;
    
    scoreDisplay.innerText = score;
    
    // Iniciar loop do jogo rodando a ~60 FPS
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
}

function createObstacle() {
    // Adiciona obstáculo aleatório se o último estiver distante o suficiente
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 220) {
        const randomLane = Math.floor(Math.random() * 3);
        obstacles.push({
            lane: randomLane,
            x: 0,
            y: -100,
            width: 50,
            height: 90,
            color: '#e74c3c'
        });
    }
}

function updateGame() {
    // Limpar o canvas a cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Desenhar a Estrada Retrô
    drawRoad();
    
    // 2. Atualizar e posicionar o jogador de forma suave na pista correta
    const targetX = (player.lane * laneWidth) + (laneWidth / 2) - (player.width / 2);
    player.x += (targetX - player.x) * 0.25; // Efeito de interpolação fluida
    drawCar(player.x, player.y, player.color, true);
    
    // 3. Gerenciar Obstáculos
    createObstacle();
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += gameSpeed;
        obs.x = (obs.lane * laneWidth) + (laneWidth / 2) - (obs.width / 2);
        
        drawCar(obs.x, obs.y, obs.color, false);
        
        // Checar colisões usando AABB
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            endGame();
            return;
        }
        
        // Remove obstáculos que saíram da tela e computa pontuação
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            scoreDisplay.innerText = score;
            
            // Aumenta a velocidade gradativamente a cada 5 pontos
            if (score % 5 === 0) {
                gameSpeed += 0.8;
            }
        }
    }
}

function drawRoad() {
    // Linhas divisórias tracejadas simulando movimento
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 20]);
    // Deslocamento das linhas baseado no frame atual para dar efeito de velocidade
    ctx.lineDashOffset = -((score * 10) + (Date.now() / 20) % 50); 
    
    // Desenha as divisões das 3 pistas
    ctx.beginPath();
    ctx.moveTo(laneWidth, 0);
    ctx.lineTo(laneWidth, canvas.height);
    ctx.moveTo(laneWidth * 2, 0);
    ctx.lineTo(laneWidth * 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]); // Reset do estilo de linha
}

function drawCar(x, y, color, isPlayer) {
    // Corpo do carro
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 50, 90);
    
    // Rodas (Preto)
    ctx.fillStyle = '#111111';
    ctx.fillRect(x - 4, y + 10, 6, 18);  // Superior Esquerda
    ctx.fillRect(x + 48, y + 10, 6, 18); // Superior Direita
    ctx.fillRect(x - 4, y + 60, 6, 18);  // Inferior Esquerda
    ctx.fillRect(x + 48, y + 60, 6, 18); // Inferior Direita
    
    // Parabrisa/Vidros
    ctx.fillStyle = isPlayer ? '#e0f7fa' : '#222222';
    ctx.fillRect(x + 6, y + 30, 38, 15);
    
    // Faróis (Amarelo na frente se for jogador, vermelho atrás se for inimigo)
    ctx.fillStyle = isPlayer ? '#f1c40f' : '#ff3333';
    if (isPlayer) {
        ctx.fillRect(x + 6, y, 8, 4);
        ctx.fillRect(x + 36, y, 8, 4);
    } else {
        ctx.fillRect(x + 6, y + 86, 8, 4);
        ctx.fillRect(x + 36, y + 86, 8, 4);
    }
}

function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    finalScore.innerText = score;
    gameOverScreen.classList.remove('hidden');
}
