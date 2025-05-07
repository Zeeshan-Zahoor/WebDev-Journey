console.log("Let's Write Some JavaScript");

// DOM Elements
const editAmount_Win = document.getElementsByClassName("edit-amount-window")[0];
const totalBalanceDisplay = document.getElementById("total-balance");
const enteredAmountInput = document.getElementById("entered-amount");
const expenseContainer = document.getElementById("expense-card");
const addExpenseBtn = document.getElementById("add-expense-btn");

// Modal Elements
const expenseModal = document.getElementById("expense-modal");
const expenseInput = document.getElementById("expense-input");
const saveExpenseBtn = document.getElementById("save-expense-btn");
const cancelExpenseBtn = document.getElementById("cancel-expense-btn");

let totalBalance = 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Load data on page load
window.onload = () => {
    const savedBalance = localStorage.getItem("totalBalance");
    if (savedBalance !== null) {
        totalBalance = parseInt(savedBalance);
        totalBalanceDisplay.innerText = `Total Balance: ${totalBalance}`;
    }

    // Load saved expenses
    expenses.forEach((expense, index) => createExpenseCard(expense, index));
};

// Show Edit Amount Window
const show_Edit_Amount_Window = () => {
    editAmount_Win.classList.remove("hide");
};

// Update balance
const editAmount = () => {
    let enteredAmount = enteredAmountInput.value;
    if (enteredAmount) {
        totalBalance = parseInt(enteredAmount);
        totalBalanceDisplay.innerText = `Total Balance: ${totalBalance}`;
        localStorage.setItem("totalBalance", totalBalance); // Save to localStorage
    }

    editAmount_Win.classList.add("hide");
    enteredAmountInput.value = ""; // Clear input
};

// Create expense card
// Create expense card
const createExpenseCard = (expenseName, index) => {
    const card = document.createElement("div");
    card.className = "expense-card";

    card.innerHTML = `
        <h3>${expenseName}</h3>
        <button class="delete-btn" data-index="${index}">Delete</button>
    `;

    // Make the entire card clickable
    card.addEventListener("click", (e) => {
        // Check if the click was on the delete button (we don't want to trigger both actions)
        if (!e.target.classList.contains('delete-btn')) {
            handleExpenseCardClick(expenseName, index);
        }
    });

    expenseContainer.appendChild(card);

    // Add delete functionality
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the card click event from firing
        deleteExpense(index);
    });
};

const expenseDetails_Model = document.getElementById("expense-details-modal");
// Handle what happens when an expense card is clicked
const handleExpenseCardClick = (expenseName, index) => {
    console.log(`Card clicked: ${expenseName} at index ${index}`);
    // - Open a modal with expense details
    expenseDetails_Model.classList.remove("hide");
    document.getElementById("modal-expense-name").innerText = `${expenseName}`;
};

//Closing the expense-detals-model
document.getElementById("close-modal").addEventListener("click", ()=> {
    expenseDetails_Model.classList.add("hide");
});




// Show modal on Add click
addExpenseBtn.addEventListener("click", () => {
    expenseModal.classList.remove("hide");
    expenseInput.value = "";
    expenseInput.focus();
});

// Save expense and close modal
saveExpenseBtn.addEventListener("click", () => {
    const expenseName = expenseInput.value.trim();
    if (expenseName) {
        expenses.push(expenseName);
localStorage.setItem("expenses", JSON.stringify(expenses));

// Clear and re-render all expense cards
renderAllExpenses();

    }
    expenseModal.classList.add("hide");
});

// Cancel modal
cancelExpenseBtn.addEventListener("click", () => {
    expenseModal.classList.add("hide");
});


const renderAllExpenses = () => {
    expenseContainer.innerHTML = ""; // Clear old cards
    expenses.forEach((expense, index) => createExpenseCard(expense, index));
};

const deleteExpense = (index) => {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderAllExpenses();
};

