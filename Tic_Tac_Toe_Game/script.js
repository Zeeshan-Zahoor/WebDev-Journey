let boxes = document.querySelectorAll("#box");
let reset_btn = document.querySelector("#reset-btn");
let msg = document.querySelector("#winner-msg");
let gameEnd = document.querySelector(".game-end");
let newGameBtn = document.querySelector("#new-game-btn");
let turn_X = true;
const winPatterns = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [0, 3, 6],
                    [1, 4, 7],
                    [2, 5, 8],
                    [0, 4, 8],
                    [2, 4, 6]];

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (turn_X) {
            box.innerText = "X";
            box.style.color = "#ae0000";
            turn_X = false;
        } else {
            box.innerText = "O";
            box.style.color = "#000000";
            turn_X = true;
        }
        box.disabled = true;
        checkWinner();
    });
});

// reset the game by reset button 
const resetGame = ()=> {
    turn_X = true;
    enableBoxes();
    gameEnd.classList.add("hide");
}

reset_btn.addEventListener("click", () => {
    resetGame();
    return;
});

const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
}

const enableBoxes = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerText = "";
    }
}

const showWinner = (winner)=> {
    disableBoxes();
    msg.innerText =`Congratulations! \nThe Winner is ${winner}`;
    setTimeout(() => {
        gameEnd.classList.remove("hide");
    }, 400);
} 

// check the winner 
const checkWinner = ()=> {
    for (let pattern of winPatterns) {
        let pos1Val = boxes[pattern[0]].innerText;      
        let pos2Val = boxes[pattern[1]].innerText;      
        let pos3Val = boxes[pattern[2]].innerText;      

        if (pos1Val != "" && pos2Val != "" && pos3Val != "") {
        if (pos1Val === pos2Val && pos2Val === pos3Val) {
            showWinner(pos1Val);
        }
        }
}
}

// functionality for new game button
newGameBtn.addEventListener ("click", resetGame);