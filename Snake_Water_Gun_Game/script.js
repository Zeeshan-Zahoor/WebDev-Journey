const choices = document.querySelectorAll(".choice");
const compChoiceMsg = document.querySelector("#computer-choice");
const popUpMsg = document.querySelector("#pop-up-message");
const resultImage = document.querySelector(".result-image");
let your_score = document.querySelector("#your-score");
let computer_score = document.querySelector("#computer-score");

// Set scores to 0 initially 
let comp_currentScore = 0;
let your_currentScore = 0;


// Generates a random choice for the computer
function playGame() {   
    let choiceList = ["Snake", "Water", "Gun"];
    let idx = Math.floor(Math.random() * 3);
    return choiceList[idx];
}

// decision funcition to for the result of the choices (adding suitable images too)
const result = (myChoice, computerChoice) => {
    //Remove the last result image
    resultImage.classList.remove("snake-won");
    resultImage.classList.remove("water-won");
    resultImage.classList.remove("gun-won");
    resultImage.classList.remove("draw");

    // Game Winning Logic
    let youWon = true;
    if (myChoice === computerChoice) {
        resultImage.classList.remove("hide");
        resultImage.classList.add("draw");
        return null;
    } else {
        if (myChoice === "Snake") {
            if (computerChoice === "Water") {
                resultImage.classList.remove("hide");
                resultImage.classList.add("snake-won");
                return youWon;
            } else {
                resultImage.classList.remove("hide");
                resultImage.classList.add("gun-won");
                return !youWon;
            }
        } else if (myChoice === "Water") {
            if (computerChoice === "Snake") {
                resultImage.classList.remove("hide");
                resultImage.classList.add("snake-won");
                return !youWon;
            } else {
                resultImage.classList.remove("hide");
                resultImage.classList.add("water-won");
                return youWon;
            }
        } else {
            if (computerChoice === "Snake") {
                resultImage.classList.remove("hide");
                resultImage.classList.add("gun-won");
                return youWon;
            } else {
                resultImage.classList.remove("hide");
                resultImage.classList.add("water-won");
                return !youWon;
            }
        }

    }
}
// function to print "You Won!"
const printYouWon = () => {
    popUpMsg.innerText = "You Won!";
    popUpMsg.style.color = "blue";

}

// function to print "You Lost"
const printYouLost = () => {
    popUpMsg.innerText = "You Lost!";
    popUpMsg.style.color = "red";
}

// Display nothing in before the starting of the game.
resultImage.classList.add("hide");  // showing no result image first

// Event Listner to Read the choices made by user
choices.forEach((choice) => {
    choice.addEventListener("click", () => {
        const myChoice = choice.innerText;
        const computerChoice = playGame();
        compChoiceMsg.innerText = `Computer Choosed ${computerChoice}`;
        const gameResult = result(myChoice, computerChoice);

        // display results and scores in every iteration 
        if (gameResult === true) {
            your_currentScore += 1;
            your_score.innerText = `${your_currentScore}`;
            printYouWon();
        } else if (gameResult === false) {
            comp_currentScore += 1;
            computer_score.innerText = `${comp_currentScore}`;
            printYouLost();
        } else {
            popUpMsg.innerText = "Oops! It Was a Draw";
            popUpMsg.style.color = "black";
        }

    });
});