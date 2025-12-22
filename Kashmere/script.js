console.log("Let's Write Some JavaScript");

// DOM Elements that are global/static
const editAmount_Win = document.getElementsByClassName("edit-amount-modal")[0];
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

// Expense details modal (existing)
const expenseDetails_Model = document.getElementById("modal-content-pad");
const allocatedProgressRing = document.getElementById("progress-ring-allocated");
const remainingProgressionRing = document.getElementById("progress-ring-remaining");

const enterSubDetailName = document.getElementById('enter-sub-detail-name-btn')
const cancelSubDetailName = document.getElementById('cancel-sub-detail-name-btn')

// App state
let totalBalance = 0;

// IMPORTANT: partitions are objects {}
let partitions = JSON.parse(localStorage.getItem("partitions")) || [];

// Track which partition index the expense modal is currently adding to
let activePartitionIndex = null;
let activeExpenseIndex = null;

// Load data on page load
window.onload = () => {
    const savedBalance = localStorage.getItem("totalBalance");
    if (savedBalance !== null) {
        totalBalance = parseInt(savedBalance, 10);
        totalBalanceDisplay.innerText = `Total Balance: ₹${(totalBalance).toLocaleString('en-IN')}`;
    }

    // Ensure partitions become objects
    partitions = partitions.map(p => {

        // Normalize partition name
        const name = p.name ?? p;

        // Normalize allocated amount
        const allocatedAmount = p.allocatedAmount ?? 0;

        const remainingAmount = p.remainingAmount ?? 0;

        // Normalize expenses
        let expenses = [];

        if (Array.isArray(p.expenses)) {
            expenses = p.expenses.map(expense => {

                // Normalize expense details
                let expenseDetails = [];

                if (Array.isArray(expense.expenseDetails)) {
                    expenseDetails = expense.expenseDetails.map(detail => ({
                        subDetailName: detail.subDetailName ?? "",
                        subDetailList: Array.isArray(detail.subDetailList)
                            ? detail.subDetailList
                            : [],
                        subDetailTotal: detail.subDetailTotal ?? 0
                    }));
                }

                // New format: expense is already an object
                return {
                    expenseName: expense.expenseName ?? "",
                    expenseAllocatedAmount: expense.expenseAllocatedAmount ?? 0,
                    expenseRemainingAmount: expense.expenseRemainingAmount ?? 0,
                    expenseDetails: expenseDetails,
                    expenseDetailsTotal: expense.expenseDetailsTotal ?? 0
                };
            });
        }

        // Return normalized partition object
        return {
            name,
            allocatedAmount,
            remainingAmount,
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
    setTimeout(() => {
        editAmount_Win.classList.remove("hide");
        enteredAmountInput.value = `${totalBalance}`
    }, 150)
}

document.getElementById("entered-amount").addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        editAmount()
        editAmount_Win.classList.add("hide")
    }
})

document.querySelector(".edit-amount-modal").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-amount-modal")) {
            editAmount_Win.classList.add("hide")
    }
    setTimeout(() => {
        if (e.target.classList.contains("enter-btn")) {
            editAmount()
        }
        if (e.target.classList.contains("cancel-btn")) {
            editAmount_Win.classList.add("hide")
        }

    }, 200)
})

document.querySelector(".add-partition-section").addEventListener("click", (e) => {
    if (e.target.classList.contains("add-partition-btn")) {
        setTimeout(() => {
            show_Add_Partition_Modal()
        }, 200)
    }
})

const editAmount = () => {
    let enteredAmount = enteredAmountInput.value;
    if (enteredAmount) {
        totalBalance = parseInt(enteredAmount, 10);
        totalBalanceDisplay.innerText = `Total Balance: ₹${(totalBalance).toLocaleString('en-IN')}`;
        localStorage.setItem("totalBalance", totalBalance);
    }
    editAmount_Win.classList.add("hide");
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
    const unassingned = partitionObj.remainingAmount - total;


    partitionCard.innerHTML = `
        <div class="partition-details">
            <h3>${partitionObj.name}</h3>
            <div class="partition-details-inner">
                <h4>Balance: ₹${(partitionObj.remainingAmount).toLocaleString('en-IN')}</h4>
                <h5>Not yet assigned: ₹${(unassingned > 0 ? unassingned : 0).toLocaleString('en-IN')}</h5> 
            </div>
        </div>
        <div class="expense-container"></div>
        <div class="partition-card-btns"> 
            <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="40px" class="add-expense-btn" data-index="${partIndex}" viewBox="0 0 20 20" width="48px" fill="#000451c5"><g><rect fill="none" height="20" width="20"/></g><g><g><rect height="1.5" width="9" x="3" y="5"/><rect height="1.5" width="6" x="3" y="11.25"/><rect height="1.5" width="9" x="3" y="8.12"/><polygon points="14.75,11.25 14.75,8 13.25,8 13.25,11.25 10,11.25 10,12.75 13.25,12.75 13.25,16 14.75,16 14.75,12.75 18,12.75 18,11.25"/></g></g></svg>

            
            <svg xmlns="http://www.w3.org/2000/svg" height="30px" class="delete-btn" data-index="${partIndex}" viewBox="0 0 24 24" width="30px" fill="#000451a6"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zm2-8h6v8H5v-8zm5-6H6L5 5H2v2h12V5h-3z"/></svg>
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
                <h5>Balance: ₹${(expense.expenseRemainingAmount).toLocaleString('en-IN')}</h5>
            </div>
            
            <svg fill="#33236fe3" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="delete-expense-btn" data-exp-index="${expenseIndex}" viewBox="0 0 560.801 560.801" width="25px" xml:space="preserve" stroke="#000000" stroke-width="0.005608010000000001"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M560.801,124.997c0-9.33-7.562-16.891-16.893-16.891H314.182c-9.33,0-22.24-1.971-28.834-8.565l-50.435-47.057 c-6.598-6.597-19.508-11.943-28.834-11.943H16.891C7.561,40.541,0,48.102,0,57.432v371.615c0,9.33,7.561,16.893,16.891,16.893 h225.207c-10.015-22.791-15.75-47.869-15.75-74.322c0-102.449,83.361-185.806,185.806-185.806 c61.004,0,114.75,29.939,148.646,75.484V124.997z"></path> <path d="M412.154,222.969c-82.088,0-148.646,66.596-148.646,148.646S330.064,520.26,412.154,520.26 c82.127,0,148.646-66.592,148.646-148.645C560.801,289.561,494.281,222.969,412.154,222.969z M512.143,398.312h-199.98v-50.674 h199.98V398.312z"></path> </g> </g> </g></svg>
        `;

        // When clicking the expense card (not the delete button) show details
        card.addEventListener("click", (e) => {
            if (!e.target.classList.contains('delete-expense-btn')) {
                openExpense(expense.expenseName, partIndex, expenseIndex);
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
        setTimeout(() => {
            expenseInput.value = "";
            expenseModal.classList.remove("hide");
            expenseInput.focus();
        }, 200)
    });

    // Delete partition button
    partitionCard.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = Number(e.currentTarget.dataset.index);
        deletePartition(idx);
    });
}

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

const renderTotalBalance = () => {
    document.getElementById("total-balance").innerText = `Total Balance: ₹${totalBalance}`
}

function addPartition() {
    const partitionName = partitionInputName.value.trim();
        const partitionAmount = Number(partitionInputAmount.value);
        if (partitionName && partitionAmount) {
            // check if the allocated amount gets beyond the balance
            let total = 0;
            partitions.forEach((partition) => {
                total += partition.allocatedAmount;
            })
            if (partitionAmount + total <= totalBalance) {
                partitions.push({ name: partitionName, allocatedAmount: partitionAmount, remainingAmount: partitionAmount, expenses: [] });
                localStorage.setItem("partitions", JSON.stringify(partitions));
                renderAllPartitions();
                partitionInputName.value = "";
                partitionInputAmount.value = "";

                setTimeout(() => {   //add a delay for button animation
                    partitionModal.classList.add("hide");
                }, 200)
            } else {
                window.alert("Opps! No enough balance.")
            }
        }
}

// handle adding partition
partitionModal.addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        addPartition()
    }
})

partitionModal.addEventListener("click", (e) => {
    if (e.target.classList.contains("save-partition-btn")) {
        addPartition()
    }

    if (e.target.classList.contains("cancel-partition-btn")) {
        setTimeout(() => {   //add a delay for button animation
            partitionModal.classList.add("hide");
        }, 200)
    }
});

// Save expense inside the active partition
function saveExpense() {
    const expenseName = expenseInput.value.trim();
    const expenseAmount = Number(expenseInputAmount.value)

    if (activePartitionIndex === null || activePartitionIndex < 0 || activePartitionIndex >= partitions.length) {
        // No valid target partition selected
        alert("Please open the Add button inside a partition to add an expense.");

        setTimeout(() => {
            expenseModal.classList.add("hide");
        }, 200)

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
                expenseRemainingAmount: expenseAmount,
                expenseDetails: [],
                expenseDetailsTotal: 0
            });
            localStorage.setItem("partitions", JSON.stringify(partitions));

            renderAllPartitions();
            activePartitionIndex = null;
        }
        expenseInput.value = "";
        expenseInputAmount.value = "";
        setTimeout(() => {
            expenseModal.classList.add("hide");
        }, 200)

    } else {
        window.alert("Opps! No enough balance in the current partition.")
    }
}

saveExpenseBtn.addEventListener("click", () => {
    saveExpense()
});

document.querySelector(".modal-content").addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        saveExpense()
    }
})


// Cancel expense modal
cancelExpenseBtn.addEventListener("click", () => {
    setTimeout(() => {
        expenseModal.classList.add("hide");
    }, 200)
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
const openExpense = (expenseName, partitionIndex, expenseIndex) => {
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


    activePartitionIndex = partitionIndex;
    activeExpenseIndex = expenseIndex;
    renderAllExpenseDetails()

    loadProgressionBars()

    history.pushState({modal: true}, "")

};


function closeExpense() {
    if (expenseDetails_Model) {
            setTimeout(() => {
                expenseDetails_Model.style.transition = "transform 0.8s ease";
                expenseDetails_Model.style.transform = "translate(50%, -50%)";
                expenseDetails_Model.offsetHeight;
                expenseDetails_Model.style.transform = "translate(350%, -50%)";
                renderTotalBalance()
                renderAllPartitions()
                setTimeout(() => {
                    expenseDetails_Model.classList.add("hide");
                }, 500)
            }, 100)
        }
}

//close on mobiles back navigation
window.addEventListener("popstate", (event) => {
    event.preventDefault()
    if(!event.state && !expenseDetails_Model.classList.contains("hide")) {
        closeExpense()
    }
})

// close expense-details modal if it exists
const closeModalBtn = document.getElementById("close-modal-btn");
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        closeExpense()
        history.back()
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

//globals
let activeSubDetailIndex = null;
let activeSubDetailElement = null;

// Show spend modal (evenmt delegation)
document.querySelector(".detail").addEventListener("click", (e) => {
    const subDetailEl = e.target.closest(".sub-details");
    if (!subDetailEl) return;

    const subIndex = Number(subDetailEl.dataset.subIndex);

    if (e.target.classList.contains("spend-btn")) {
        console.log("Spend clicked on subDetail:", subIndex);
        activeSubDetailIndex = subIndex;
        activeSubDetailElement = subDetailEl;
        document.querySelector(".spend-modal").classList.remove("hide");

    }

    if (e.target.classList.contains("credit-btn")) {
        console.log("Credit clicked on subDetail:", subIndex);
        activeSubDetailIndex = subIndex;
        activeSubDetailElement = subDetailEl;
        document.querySelector(".credit-modal").classList.remove("hide");
    }
});

function addExpenseEntry() {
    if (
        activePartitionIndex === null ||
        activeExpenseIndex === null ||
        activeSubDetailIndex === null
    ) {
        alert("No active sub detail selected");
        return;
    }
    const spendingAmount = parseInt(document.getElementById("spending-amount").value);
    const remarks = document.getElementById("remark").value;
    let remaining = Number(remainingProgressionRing.getAttribute('data-spent'))
    const listContainer = activeSubDetailElement.querySelector(".sub-detail-list")

    if (!isNaN(spendingAmount) && spendingAmount > 0 && spendingAmount <= remaining) {
        remaining -= spendingAmount;

        //subtract from totalBalance
        totalBalance -= spendingAmount

        // add to total of expense details
        partitions[activePartitionIndex].expenses[activeExpenseIndex].expenseDetailsTotal += spendingAmount;

        //subtract from partition remaining amount
        partitions[activePartitionIndex].remainingAmount -= spendingAmount

        partitions[activePartitionIndex]
            .expenses[activeExpenseIndex].expenseRemainingAmount = remaining
        remainingProgressionRing.setAttribute('data-spent', `${remaining}`);
        loadProgressionBars()


        const subDetail = partitions[activePartitionIndex]
            .expenses[activeExpenseIndex]
            .expenseDetails[activeSubDetailIndex];
        subDetail.subDetailList.push(
            {
                amount: spendingAmount,
                remark: remarks
            }
        )

        listContainer.insertAdjacentHTML(
            "beforeend", `<div class="individual-detail" data-spent-index = "${(subDetail.subDetailList.length) - 1}">
                        <span>-₹${spendingAmount} (${remarks})</span>
                        <img src="delete.svg" class="clear-detail-btn" width="20px" alt="Clear">
                    </div>
                    <div class="line"></div>`
        );

        //update
        subDetail.subDetailTotal += spendingAmount;
        activeSubDetailElement.querySelector('.sub-detail-total').textContent = `Total: ₹${subDetail.subDetailTotal}`

        //save to the local storage back
        localStorage.setItem("partitions", JSON.stringify(partitions));
        localStorage.setItem("totalBalance", totalBalance);


        //Close modal and Clear input fields
        document.querySelector(".spend-modal").classList.add("hide");
        document.getElementById("spending-amount").value = "";
        document.getElementById("remark").value = "";
    } else {
        alert("Invalid or excessive amount!");
    }
}

// Add expense entry
document.getElementById("enter-spend-btn").addEventListener("click", () => {
    addExpenseEntry();
});

document.querySelector(".spend-modal-inner").addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        addExpenseEntry();
    }
})

function addCreditAmount() {
    const creditedAmount = Number(document.getElementById("crediting-amount").value)
    const previousAllocatedAmount = Number(allocatedProgressRing.getAttribute("data-total"))
    const previousRemainingAmount = Number(remainingProgressionRing.getAttribute("data-spent"))
    allocatedProgressRing.setAttribute('data-total', `${previousAllocatedAmount + creditedAmount}`)
    allocatedProgressRing.setAttribute('data-spent', `${previousAllocatedAmount + creditedAmount}`)

    remainingProgressionRing.setAttribute('data-spent', `${previousRemainingAmount + creditedAmount}`)
    remainingProgressionRing.setAttribute('data-total', `${previousAllocatedAmount + creditedAmount}`)

    //update in storage data
    const currExpense = partitions[activePartitionIndex].expenses[activeExpenseIndex]
    currExpense.expenseAllocatedAmount += creditedAmount
    currExpense.expenseRemainingAmount += creditedAmount
    partitions[activePartitionIndex].remainingAmount += creditedAmount
    totalBalance += creditedAmount

    loadProgressionBars()

    //save back to storage
    localStorage.setItem("partitions", JSON.stringify(partitions))
    localStorage.setItem("totalBalance", totalBalance)

    document.querySelector(".credit-modal").classList.add("hide");
}

//Add credit amount
document.getElementById("enter-credit-btn").addEventListener("click", () => {
    addCreditAmount();
})
document.querySelector(".credit-modal-inner").addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        addCreditAmount();
    }
})


// Cancel spend
document.getElementById("cancel-spend-btn").addEventListener("click", () => {
    document.querySelector(".spend-modal").classList.add("hide");
});
// Cancel credit
document.getElementById("cancel-credit-btn").addEventListener("click", () => {
    document.querySelector(".credit-modal").classList.add("hide");
});


// Add-subdetail button
const addSubDetailModal = document.querySelector(".add-sub-detail-modal")
const addSubDetailBtn = document.querySelector(".add-sub-detail-btn")
const detail = document.querySelector(".detail")

if (addSubDetailBtn) {
    addSubDetailBtn.addEventListener("click", () => {
        setTimeout(() => {
            addSubDetailModal.classList.remove("hide")
        }, 200)
    })
}

function saveSubDetail() {
    if (
        activePartitionIndex === null ||
        activeExpenseIndex === null
    ) {
        alert("No active expense selected");
        return;
    }
    const subDetailName = document.getElementById("input-sub-detail-name").value

    //save in the storage
    const subDetailObject = {
        subDetailName: `${subDetailName}`,
        subDetailList: [],
        subDetailTotal: 0
    }
    partitions[activePartitionIndex].expenses[activeExpenseIndex].expenseDetails.push(subDetailObject)

    //save to the local storage back
    localStorage.setItem("partitions", JSON.stringify(partitions));

    const expense =
        partitions[activePartitionIndex].expenses[activeExpenseIndex];

    const subDetailIndex = expense.expenseDetails.length - 1;
    const detailContainer = document.querySelector(".detail");
    createSubExpense(subDetailObject, subDetailIndex, detailContainer);

    setTimeout(() => {
        addSubDetailModal.classList.add("hide");
    }, 100)
}

document.getElementById("input-sub-detail-name").addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        saveSubDetail()
    }
})

enterSubDetailName.addEventListener('click', (e) => {
        saveSubDetail()
})


const svg = `<svg width="20px" height="20px" class="cross" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" fill="#1306747e"></path> </g></svg>`
const createSubExpense = (subDetailObject, subDetailIndex, container) => {

    const subDetailContent = `
        <div class="sub-details" data-sub-index="${subDetailIndex}">
            <div class="sub-detail-name">
                <h4>${subDetailObject.subDetailName}</h4>
                ${svg}
            </div>
            <div class="sub-detail-list"></div>
            <h5 class="sub-detail-total">
                Total: ₹${subDetailObject.subDetailTotal}
            </h5>
            <div class="sub-detail-btns">
                <button class="spend-btn">Spend</button>
                <button class="credit-btn">Credit</button>
            </div>
        </div>
    `;

    // console.log(container)
    container.insertAdjacentHTML("beforeend", subDetailContent);

    const subDetailEl = container.querySelector(`.sub-details[data-sub-index="${subDetailIndex}"]`)

    const listContainer = subDetailEl.querySelector(".sub-detail-list")

    let idx = 0

    subDetailObject.subDetailList.forEach((expenseEntry) => {
        listContainer.insertAdjacentHTML(
            "beforeend", `<div class="individual-detail" data-spent-index = "${idx++}">
                        <span>-₹${expenseEntry.amount} (${expenseEntry.remark})</span>
                        <img src="delete.svg" class="clear-detail-btn" width="20px" alt="Clear">
                    </div> 
                    <div class="line"></div>`
        )
    })

};


const renderAllExpenseDetails = () => {
    const detailContainer = document.querySelector(".detail");
    detailContainer.innerHTML = ""; // clear old

    const expenseDetails = partitions[activePartitionIndex]
        .expenses[activeExpenseIndex]
        .expenseDetails

    if (expenseDetails) {
        expenseDetails.forEach((subDetailObject, i) => {
            createSubExpense(subDetailObject, i, detailContainer);
        });
    }
    loadProgressionBars()
};


cancelSubDetailName.addEventListener("click", () => {
    setTimeout(() => {
        addSubDetailModal.classList.add("hide");
    }, 200);
})


// Clear individual expense (event delegation)
document.querySelector(".detail").addEventListener("click", (e) => {
    if (e.target.classList.contains("clear-detail-btn")) {
        console.log("press clear")
        const subDetailIndex = Number(e.target.parentElement.parentElement.parentElement.getAttribute('data-sub-index'))
        const currSubListIndex = Number(e.target.parentElement.getAttribute('data-spent-index'))
        const currSubDetail = partitions[activePartitionIndex].expenses[activeExpenseIndex].expenseDetails[subDetailIndex]

        const deletableAmount = currSubDetail.subDetailList[currSubListIndex].amount

        //subtract from sub detail total
        currSubDetail.subDetailTotal -= deletableAmount

        //add to partition balance
        partitions[activePartitionIndex].remainingAmount += deletableAmount

        //add to active expense balance
        partitions[activePartitionIndex].expenses[activeExpenseIndex].expenseRemainingAmount += deletableAmount

        //update progression ring
        const remaining = Number(remainingProgressionRing.getAttribute('data-spent'))
        remainingProgressionRing.setAttribute('data-spent', `${remaining + deletableAmount}`)

        totalBalance += deletableAmount

        // remove from the list
        currSubDetail.subDetailList.splice(currSubListIndex, 1)

        //save back to storage
        localStorage.setItem("partitions", JSON.stringify(partitions))
        localStorage.setItem("totalBalance", totalBalance)

        setTimeout(() => {
            loadProgressionBars()
            renderAllPartitions()
            renderAllExpenseDetails()
            renderTotalBalance()
        }, 200)

    }
});


// delete sub-details
document.querySelector(".detail").addEventListener("click", (e) => {
    if (e.target.classList.contains("cross")) {
        const subDetail = e.target.parentElement.parentElement;
        const subIndex = Number(subDetail.dataset.subIndex);

        // remove from data
        partitions[activePartitionIndex]
            .expenses[activeExpenseIndex]
            .expenseDetails.splice(subIndex, 1);

        subDetail.style.transition = "transform 0.2s ease, opacity 0.2s ease";
        subDetail.style.transform = "scale(0.5)";
        subDetail.style.opacity = "0";

        subDetail.addEventListener("transitionend", () => {
            localStorage.setItem("partitions", JSON.stringify(partitions));
            renderAllExpenseDetails()
        }, { once: true });

    }
});
