console.log("Let's Write Some JavaScript (refactor)");

// DOM Elements that are global/static
const editAmount_Win = document.getElementsByClassName("edit-amount-window")[0];
const totalBalanceDisplay = document.getElementById("total-balance");
const enteredAmountInput = document.getElementById("entered-amount");
const partitionContainer = document.getElementsByClassName("partition-container")[0]; // this is the wrapper that holds partition cards
const addPartitionBtn = document.getElementById("add-partition-btn");

// Modal Elements
const expenseModal = document.getElementById("expense-modal");
const expenseInput = document.getElementById("expense-input");
const expenseInputAmount = document.getElementById("expense-input-amount");
const saveExpenseBtn = document.getElementById("save-expense-btn");
const cancelExpenseBtn = document.getElementById("cancel-expense-btn");

const partitionModal = document.getElementById("partition-modal");
const partitionInputName = document.getElementById("partition-input-name");
const partitionInputAmount = document.getElementById("partition-input-amount");
const savePartitionBtn = document.getElementById("save-partition-btn");

// Expense details modal (existing)
const expenseDetails_Model = document.getElementById("modal-content-pad");
const allocatedProgressRing = document.getElementById("progress-ring-allocated");
const remainingProgressionRing = document.getElementById("progress-ring-remaining");

// App state
let totalBalance = 0;

// IMPORTANT: partitions are objects { name: string, allocatedAmount: number, expenses: [objs...] }
let partitions = JSON.parse(localStorage.getItem("partitions")) || [];

// Track which partition index the expense modal is currently adding to
let activePartitionIndex = null;

// Load data on page load
window.onload = () => {
    const savedBalance = localStorage.getItem("totalBalance");
    if (savedBalance !== null) {
        totalBalance = parseInt(savedBalance, 10);
        totalBalanceDisplay.innerText = `Total Balance: ${(totalBalance).toLocaleString('en-IN')}`;
    }

    //Ensure any old-format partitions (strings) become objects
    partitions = partitions.map(p => {

        //Normalize partition name
        const name = p.name ?? p;

        //Normalize allocated amount
        const allocatedAmount = p.allocatedAmount ?? 0;

        //Normalize expenses
        let expenses = [];

        if (Array.isArray(p.expenses)) {
            expenses = p.expenses.map(expense => {

                // Old format: expense is a string
                if (typeof expense === "string") {
                    return {
                        expenseName: expense,
                        expenseAllocatedAmount: 0, 
                        expenseRemainingAmount: 0, 
                        expenseDetails: []  // will be array of objects
                    };
                }

                // New format: expense is an object
                return {
                    expenseName: expense.expenseName ?? "",
                    expenseAllocatedAmount: expense.expenseAllocatedAmount ?? 0, 
                    expenseRemainingAmount: expense.expenseRemainingAmount ?? 0, 
                    expenseDetails : [],
                    expenseDetailsTotal: expense.expenseDetailsTotal ?? 0
                };
            });

            if(Array.isArray(p.expenses.expenseDetails)) {
                expenseDetails = p.expense.expenseDetails.map(detail => {
                    return {
                        subDetailName: detail.subDetailName ?? "",
                        subDetailList: [],  // list of strings
                        subDetailTotal: detail.subDetailTotal ?? 0
                    }
                });
            }
        }
        // Return normalized partition object
        return {
            name,
            allocatedAmount,
            expenses
        };
    });


    renderAllPartitions();
};

// Show/hide partition modal
function show_Add_Partition_Modal() {
    partitionModal.classList.remove("hide");
}
function hide_partition_modal() {
    partitionModal.classList.add("hide");
}

// Show edit amount window
function show_Edit_Amount_Window() {
    editAmount_Win.classList.remove("hide");
}
const editAmount = () => {
    let enteredAmount = enteredAmountInput.value;
    if (enteredAmount) {
        totalBalance = parseInt(enteredAmount, 10);
        totalBalanceDisplay.innerText = `Total Balance: ${(totalBalance).toLocaleString('en-IN')}`;
        localStorage.setItem("totalBalance", totalBalance);
    }
    editAmount_Win.classList.add("hide");
    enteredAmountInput.value = "";
};

// Create partition card (renders the partition and its own expenses)
const createPartitionCard = (partitionObj, partIndex) => {
    const partitionCard = document.createElement("div");
    partitionCard.className = "partition-card";

    //calculate unassingned amount
    let total = 0
    partitionObj.expenses.forEach((expense) => {
        total += expense.expenseAllocatedAmount
    })
    const unassingned = partitionObj.allocatedAmount - total;


    partitionCard.innerHTML = `
        <div class="partition-details">
            <h3>${partitionObj.name}</h3>
            <div class="partition-details-inner">
                <h4>Balance: ${(partitionObj.allocatedAmount).toLocaleString('en-IN')}</h4>
                <h5>Not yet assigned: ${unassingned.toLocaleString('en-IN')}</h5> 
            </div>
        </div>
        <div class="expense-container"></div>
        <div class="partition-card-btns"> 
            <button class="statue-delete-btn" data-index="${partIndex}">Delete</button>
            <button class="add-expense-btn" data-index="${partIndex}">Add</button>
            <button class="delete-btn" data-index="${partIndex}">Delete</button>
        </div>
    `;

    // Append card to the wrapper that holds all partitions
    // NOTE: partitionContainer is the element that contains all partition cards
    partitionContainer.appendChild(partitionCard);

    // Find this card's own expense-container to render its expenses inside it
    const myExpenseContainer = partitionCard.querySelector(".expense-container");

    // Render each expense belonging to this partition in this container
    partitionObj.expenses.forEach((expense, expenseIndex) => {
        const card = document.createElement("div");

        card.className = "expense-card";
        card.innerHTML = `
            <div class="expense-details"> 
                <h4>${expense.expenseName}</h4>
                <h5>Balance: ${(expense.expenseAllocatedAmount).toLocaleString('en-IN')}</h5>
            </div>
            <button class="delete-expense-btn" data-exp-index="${expenseIndex}">Delete</button>
        `;

        // When clicking the expense card (not the delete button) show details
        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains('delete-expense-btn')) {
                handleExpenseCardClick(expense.expenseName, partIndex, expenseIndex);
            }
        });

        // Delete button for the expense (within this partition)
        card.querySelector(".delete-expense-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteExpense(partIndex, expenseIndex);
        });

        myExpenseContainer.appendChild(card);
    });

    // Add-expense button opens modal for THIS partition
    partitionCard.querySelector(".add-expense-btn").addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        activePartitionIndex = idx;
        expenseInput.value = "";
        expenseModal.classList.remove("hide");
        expenseInput.focus();
    });

    // Delete partition button
    partitionCard.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = Number(e.currentTarget.dataset.index);
        deletePartition(idx);
    });
};

// Delete a partition
const deletePartition = (partIndex) => {
    partitions.splice(partIndex, 1);
    localStorage.setItem("partitions", JSON.stringify(partitions));
    renderAllPartitions();
};

// Render (clear + create) all partitions
const renderAllPartitions = () => {
    // Clear old DOM
    partitionContainer.innerHTML = "";
    // Re-create
    partitions.forEach((partitionObj, i) => createPartitionCard(partitionObj, i));
};

// handle adding partition
savePartitionBtn.addEventListener("click", () => {
    const partitionName = partitionInputName.value.trim();
    const partitionAmount = Number(partitionInputAmount.value);
    if (partitionName && partitionAmount) {
        // check if the allocated amount gets beyond the balance
        let total = 0;
        partitions.forEach((partition) => {
            total += partition.allocatedAmount;
        })
        if (partitionAmount + total <= totalBalance) {
            partitions.push({ name: partitionName, allocatedAmount: partitionAmount, expenses: [] });
            localStorage.setItem("partitions", JSON.stringify(partitions));
            renderAllPartitions();
            partitionInputName.value = "";
            partitionInputAmount.value = "";

            partitionModal.classList.add("hide");
        } else {
            window.alert("Opps! No enough balance.")
        }
    }
    // partitionModal.classList.add("hide");
});

// Save expense inside the active partition
saveExpenseBtn.addEventListener("click", () => {
    const expenseName = expenseInput.value.trim();
    const expenseAmount = Number(expenseInputAmount.value)

    if (activePartitionIndex === null || activePartitionIndex < 0 || activePartitionIndex >= partitions.length) {
        // No valid target partition selected
        alert("Please open the Add button inside a partition to add an expense.");
        expenseModal.classList.add("hide");
        return;
    }
    //check if the allocation exceeds the partition amount
    total = 0;
    partitions[activePartitionIndex].expenses.forEach((expense) => {
        total += expense.expenseAllocatedAmount
    })
    if (total + expenseAmount <= partitions[activePartitionIndex].allocatedAmount) {
        if (expenseName && expenseAmount) {
            partitions[activePartitionIndex].expenses.push({
                expenseName: expenseName,
                expenseAllocatedAmount: expenseAmount,
                expenseRemainingAmount: expenseAmount
            });
            localStorage.setItem("partitions", JSON.stringify(partitions));

            renderAllPartitions();
            activePartitionIndex = null;
        }
        expenseInput.value = "";
        expenseInputAmount.value = "";
        expenseModal.classList.add("hide");

    } else {
        window.alert("Opps! No enough balance in the current partition.")
    }

});

// Cancel expense modal
cancelExpenseBtn.addEventListener("click", () => {
    expenseModal.classList.add("hide");
    activePartitionIndex = null;
});

// Delete an expense from a partition
const deleteExpense = (partitionIndex, expenseIndex) => {
    const p = partitions[partitionIndex];
    if (!p) return;
    p.expenses.splice(expenseIndex, 1);
    localStorage.setItem("partitions", JSON.stringify(partitions));
    renderAllPartitions();
};

// Expense details (open modal when expense clicked)
const handleExpenseCardClick = (expenseName, partitionIndex, expenseIndex) => {
    console.log(`Card clicked: ${expenseName} in partition ${partitionIndex} expenseIndex ${expenseIndex}`);

    //In case of allocated ring, there should be no change (both value should be same)
    allocatedProgressRing.setAttribute('data-spent', `${partitions[partitionIndex].expenses[expenseIndex].expenseAllocatedAmount}`)
    allocatedProgressRing.setAttribute('data-total', `${partitions[partitionIndex].expenses[expenseIndex].expenseAllocatedAmount}`)

    //In case of remaining ring, only data-spent should be changed
    remainingProgressionRing.setAttribute('data-total', `${partitions[partitionIndex].expenses[expenseIndex].expenseAllocatedAmount}`)
    remainingProgressionRing.setAttribute('data-spent', `${partitions[partitionIndex].expenses[expenseIndex].expenseRemainingAmount}`)

    if (!expenseDetails_Model) return;
    expenseDetails_Model.classList.remove("hide");
    document.getElementById("modal-expense-name").innerText = `${expenseName}`;
    expenseDetails_Model.classList.remove("hide");

    expenseDetails_Model.style.transition = "transform 0.2s ease";
    expenseDetails_Model.style.transform = "translate(350%, -50%)";
    expenseDetails_Model.offsetHeight;
    expenseDetails_Model.style.transform = "translate(50%, -50%)";

    loadProgressionBars()
};

// close expense-details modal if it exists
const closeModalBtn = document.getElementById("close-modal-btn");
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        if (expenseDetails_Model) {
            expenseDetails_Model.style.transition = "transform 0.2s ease";
            expenseDetails_Model.style.transform = "translate(50%, -50%)";
            expenseDetails_Model.offsetHeight;
            expenseDetails_Model.style.transform = "translate(350%, -50%)";
            setTimeout(() => {
                expenseDetails_Model.classList.add("hide");
            }, 300)
        }

    });
}

// Expense Datails Model 

// circular progress bar 
const loadProgressionBars = () => {
    document.querySelectorAll(".progress-ring").forEach((ring, index) => {
        const circle = ring.querySelector(".progress-ring__circle");
        const text = ring.parentElement.querySelector(".progress-text");

        // Set consistent rotation immediately
        circle.style.transform = "rotate(-90deg)";
        circle.style.transformOrigin = "35px 35px";

        const spent = Number(ring.dataset.spent);
        const total = Number(ring.dataset.total);
        const percent = Math.min((spent / total) * 100, 100);

        const radius = 30;
        const circumference = 2 * Math.PI * radius;

        // Setup
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = circumference;
        text.textContent = "0";

        // Force layout calculation
        void circle.offsetWidth;

        // Start animation
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Animate counter
        let start = null;
        const duration = 500;

        function animateCounter(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            //  Decrease from total → spent
            const current = Math.floor(
                total - easeProgress * (total - spent)
            );

            text.textContent = "₹" + current.toLocaleString('en-IN');

            if (progress < 1) {
                requestAnimationFrame(animateCounter);
            } else {
                text.textContent = "₹" + spent.toLocaleString('en-IN');
            }
        }

        requestAnimationFrame(animateCounter);
    });
}


// Show spend modal
document.getElementById("spend-btn").addEventListener("click", () => {
    const spendModal = document.querySelector(".spend-modal")
    spendModal.classList.remove("hide");
});

// Cancel spend
document.getElementById("cancel-spend-btn").addEventListener("click", () => {
    document.querySelector(".spend-modal").classList.add("hide");
});





// Add expense entry
document.getElementById("enter-spend-btn").addEventListener("click", () => {
    let spendingAmount = parseInt(document.getElementById("spending-amount").value);
    let remarks = document.getElementById("remark").value;
    let detail = document.querySelector(".detail");
    let remaining = Number(remainingProgressionRing.getAttribute('data-spent')) 

    if (!isNaN(spendingAmount) && spendingAmount > 0 && spendingAmount <= remaining) {
        remaining -= spendingAmount;
        remainingProgressionRing.setAttribute('data-spent',`${remaining}`);
        loadProgressionBars()

        let detailText = `<div class="sub-detail">
                            <span>-${spendingAmount} (${remarks})</span>
                            <button id="clear-detail">Clear</button>
                          </div>`;
        detail.innerHTML += detailText;
        document.querySelector(".spend-modal").classList.add("hide");

        // Clear input fields
        document.getElementById("spending-amount").value = "";
        document.getElementById("remark").value = "";
    } else {
        alert("Invalid or excessive amount!");
    }
});

// Clear individual expense (event delegation)
document.querySelector(".detail").addEventListener("click", (e) => {
    if (e.target.classList.contains("clear-detail")) {
        const expenseDiv = e.target.parentElement;
        const text = expenseDiv.querySelector("span").innerText;
        const amount = parseInt(text.match(/-(\d+)/)[1]); // extract number
        totalSpent -= amount;
        remaining += amount;
        document.getElementById("remaining-amount").innerText = remaining;
        expenseDiv.remove();
    }
});

