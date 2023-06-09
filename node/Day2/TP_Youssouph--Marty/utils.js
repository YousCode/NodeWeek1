const game = ["pierre", "papier", "ciseaux"];

let playerScore = 0;
let computerScore = 0;

const playGame = (playerChoice) => {
  const computerChoice = game[Math.floor(Math.random() * game.length)];
  console.log(`Vous avez choisi : ${playerChoice}`);
  console.log(`L'ordinateur a choisi : ${computerChoice}`);

  if (playerChoice === computerChoice) {
    console.log("Match nul");
  } else if (
    (playerChoice === "pierre" && computerChoice === "ciseaux") ||
    (playerChoice === "papier" && computerChoice === "pierre") ||
    (playerChoice === "ciseaux" && computerChoice === "papier")
  ) {
    console.log("You win");
    playerScore++;
  } else {
    console.log("Computer win");
    computerScore++;
  }
  console.log(
    ` Player Score : ${playerScore} Computer Score : ${computerScore}`
  );
  return {
    playerScore,
    computerScore,
  };
};

module.exports = { playGame, game };