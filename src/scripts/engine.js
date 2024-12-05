// Obtém o elemento do player de áudio
const audioPlayer = document.getElementById("audio-player");

// Adiciona um evento de clique no player de áudio
audioPlayer.addEventListener("click", () => {
  var bgm = document.getElementById("bgm");
  state.audio.backgroundAudio = !state.audio.backgroundAudio;

  // Verifica o estado do áudio e atualiza o player
  if (state.audio.backgroundAudio) {
    audioPlayer.classList.add("active");
    audioPlayer.classList.remove("inactive");

    bgm.play(); // Toca o áudio
  } else {
    audioPlayer.classList.add("inactive");
    audioPlayer.classList.remove("active");

    bgm.pause(); // Pausa o áudio
  }
});

// Define o estado inicial da aplicação
const state = {
  audio: {
    backgroundAudio: false,
  },
  score: {
    playerScore: 0,
    computerScore: 0,
    scoreBox: document.getElementById("score_points"),
  },
  cardSprites: {
    avatar: document.getElementById("card-image"),
    name: document.getElementById("card-name"),
    type: document.getElementById("card-type"),
  },
  playerSides: {
    player1: "player-cards",
    player1Box: document.querySelector("#player-cards"),
    player2: "computer-cards",
    player2Box: document.querySelector("#computer-cards"),
  },
  fieldCards: {
    player: document.getElementById("player-field-card"),
    computer: document.getElementById("computer-field-card"),
  },
  actions: {
    button: document.getElementById("next-duel"),
  },
};

// Caminho para os ícones das cartas
const pathImages = "./src/assets/icons/";

// Dados das cartas
const cardData = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Paper",
    img: `${pathImages}dragon.png`,
    winOf: [1], // Vence de "Rock"
    loseOf: [2], // Perde para "Scissors"
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Rock",
    img: `${pathImages}magician.png`,
    winOf: [2], // Vence de "Scissors"
    loseOf: [0], // Perde para "Paper"
  },
  {
    id: 2,
    name: "Exodia",
    type: "Scissors",
    img: `${pathImages}exodia.png`,
    winOf: [0], // Vence de "Paper"
    loseOf: [1], // Perde para "Rock"
  },
];

// Função de inicialização do jogo
function init() {
  state.fieldCards.player.style.display = "none";
  state.fieldCards.computer.style.display = "none";

  // Desenha cartas para os dois lados
  drawCards(5, state.playerSides.player1);
  drawCards(5, state.playerSides.player2);
}

// Desenha um número específico de cartas para um dos lados
async function drawCards(cardsNumber, fieldSide) {
  for (let i = 0; i < cardsNumber; i++) {
    const randomCard = await getRandomCard(); // Obtém uma carta aleatória
    const cardImage = await createCardImage(randomCard, fieldSide); // Cria a imagem da carta

    document.getElementById(fieldSide).appendChild(cardImage); // Adiciona a carta ao campo
  }
}

// Cria a imagem de uma carta
async function createCardImage(card, fieldSide) {
  const cardImage = document.createElement("img");

  cardImage.setAttribute("height", "100px");
  cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
  cardImage.setAttribute("data-id", card.id);
  cardImage.classList.add("card");

  // Adiciona eventos de clique e mouseover para cartas do jogador
  if (fieldSide === state.playerSides.player1) {
    cardImage.addEventListener("click", async () => {
      await setCardsField(cardImage.getAttribute("data-id"));
    });

    cardImage.addEventListener("mouseover", async () => {
      await drawSelectedCard(card.id);
    });
  }

  return cardImage;
}

// Configura as cartas no campo
async function setCardsField(cardId) {
  await removeAllCardsImages(); // Remove as cartas anteriores
  const computerCard = await getRandomCard(); // Carta aleatória para o computador
  const playerCard = cardData[cardId]; // Carta escolhida pelo jogador

  state.fieldCards.player.style.display = "block";
  state.fieldCards.computer.style.display = "block";

  state.fieldCards.player.src = playerCard.img;
  state.fieldCards.computer.src = computerCard.img;

  const duelResult = await checkDuelResult(playerCard, computerCard); // Checa o resultado do duelo

  await updateScore(); // Atualiza a pontuação
  await drawButton(duelResult); // Exibe o botão com o resultado
}

// Reinicia o duelo
async function resetDuel() {
  state.cardSprites.name.innerText = "Selecione";
  state.cardSprites.type.innerText = "uma carta";
  state.cardSprites.avatar.src = "";

  state.actions.button.style.display = "none";

  state.fieldCards.player.style.display = "none";
  state.fieldCards.computer.style.display = "none";

  init(); // Recomeça o jogo
}

// Atualiza a pontuação na tela
async function updateScore() {
  state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

// Exibe o botão com o resultado do duelo
async function drawButton(result) {
  state.actions.button.innerText = result.toUpperCase();
  state.actions.button.style.display = "block";
}

// Determina o resultado do duelo
async function checkDuelResult(playerCard, computerCard) {
  let duelResult = "draw"; // Empate como padrão

  if (playerCard.winOf.includes(computerCard.id)) {
    duelResult = "win";
    state.score.playerScore++; // Incrementa a pontuação do jogador
  }

  if (playerCard.loseOf.includes(computerCard.id)) {
    duelResult = "lose";
    state.score.computerScore++; // Incrementa a pontuação do computador
  }

  await playAudio(duelResult); // Toca o som correspondente
  return duelResult;
}

// Remove todas as imagens das cartas do campo
async function removeAllCardsImages() {
  let { player1Box, player2Box } = state.playerSides;

  let imgElements = player1Box.querySelectorAll("img");
  imgElements.forEach((img) => img.remove());

  imgElements = player2Box.querySelectorAll("img");
  imgElements.forEach((img) => img.remove());
}

// Exibe os detalhes da carta selecionada
async function drawSelectedCard(cardId) {
  const selectedCard = cardData[cardId];

  state.cardSprites.avatar.src = selectedCard.img;
  state.cardSprites.name.innerText = selectedCard.name;
  state.cardSprites.type.innerText = `Attribute: ${selectedCard.type}`;
}

// Obtém uma carta aleatória
async function getRandomCard() {
  const randomIndex = Math.floor(Math.random() * cardData.length);
  return cardData[randomIndex];
}

// Toca o áudio correspondente ao resultado
async function playAudio(status) {
  const audio = new Audio(`./src/assets/audios/${status}.wav`);
  audio.play();
}

// Inicializa o jogo
init();