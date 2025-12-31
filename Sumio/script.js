console.log("Let's Write Some JavaScript");

// DOM Elements that are global/static
const editAmount_Win = document.getElementsByClassName("edit-amount-modal")[0];
const totalBalanceDisplay = document.getElementById("total-balance");
const unSectionedBalanceDisplay = document.getElementById("un-sectioned");
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

let partitions;
try {
    partitions = JSON.parse(localStorage.getItem("partitions")) || [];
} catch {
    partitions = [];
}


// Track which partition index the expense modal is currently adding to
let activePartitionIndex = null;
let activeExpenseIndex = null;

let unSectionedBalance;
let appTheme;

// Load data on page load
window.onload = () => {
    appTheme = localStorage.getItem("theme");

    if (!appTheme) {
        appTheme = "dark";
        localStorage.setItem("theme", appTheme);
        document.querySelector(".menu-theme").innerHTML = darkModeIcon;
        document.getElementById("theme-color-meta").setAttribute('content', '#2d2d2d')
    }

    if (appTheme === "ivory") {
        document.getElementById("theme-color-meta").setAttribute('content', '#fbefd5');
        document.querySelector(".menu-theme").innerHTML = lightModeIcon;

    }
    document.getElementById("theme-link").href = `theme-${appTheme}.css`;

    const savedBalance = localStorage.getItem("totalBalance");
    if (savedBalance !== null) {
        totalBalance = parseFloat(savedBalance, 10);
        unSectionedBalance = totalBalance;
        totalBalanceDisplay.innerText = `Total Balance: ₹${(totalBalance).toLocaleString('en-IN')}`;
        unSectionedBalanceDisplay.innerText = `Un-sectioned: ₹${(unSectionedBalance).toLocaleString('en-IN')}`;
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

document.querySelector(".edit-amount-btn").addEventListener("click", () => {
    show_Edit_Amount_Window();
})

// Show edit amount window
function show_Edit_Amount_Window() {
    setTimeout(() => {
        editAmount_Win.classList.remove("hide");
        enteredAmountInput.value = `${(totalBalance)}`
    }, 150)
}

document.getElementById("entered-amount").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
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

document.querySelector(".add-amount-icon").addEventListener("click", (e) => {
    if (e.target.closest(".add-amount-icon")) {
        const addAmountModal = document.querySelector(".add-modal");
        setTimeout(() => {
            addAmountModal.classList.remove("hide");
            document.getElementById("adding-amount").value = "";
        }, 200)
    }
})

document.querySelector(".add-modal")?.addEventListener("click", (e) => {
    if (e.target.closest(".enter-add-btn")) {
        setTimeout(() => {
            addTotalAmount();
        }, 200);
    }

    if (e.target.closest(".cancel-add-btn")) {
        setTimeout(() => {
            document.querySelector(".add-modal").classList.add("hide");
        }, 200)
    }

    if (e.target.classList.contains("add-modal")) {
        document.querySelector(".add-modal").classList.add("hide");
    }

})
document.querySelector(".add-modal")?.addEventListener("keydown", (e) => {
    if (e.target.closest(".enter-add-btn") || e.key == "Enter") {
        setTimeout(() => {
            addTotalAmount();
        }, 200);
    }
})


//add amount 
function addTotalAmount() {
    const amount = Number(document.getElementById("adding-amount").value);

    if (amount == NaN) {
        showToast("❌ Invalid Amount!", "error");
        document.querySelector(".add-modal").classList.add("hide");
        return;
    }

    totalBalance += amount;
    localStorage.setItem("totalBalance", totalBalance);
    renderTotalBalance();

    //close modal
    document.querySelector(".add-modal").classList.add("hide");
}



document.querySelector(".add-partition-section").addEventListener("click", (e) => {
    if (e.target.closest(".add-partition-btn")) {
        setTimeout(() => {
            show_Add_Partition_Modal()
        }, 200)
    }
})

const editAmount = () => {
    let enteredAmount = enteredAmountInput.value;
    if (enteredAmount) {
        totalBalance = parseFloat(enteredAmount, 10);
        if (totalBalance > 99999999999) {
            editAmount_Win.classList.add("hide");
            showToast("❌ Invalid Amount!")
            return;
        }
        totalBalanceDisplay.innerText = `Total Balance: ₹${(totalBalance).toLocaleString('en-IN')}`;
        localStorage.setItem("totalBalance", totalBalance);
        renderTotalBalance()
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
        <div  class="partition-details">
            <h3 class="partition-title" contenteditable="true" >${partitionObj.name}</h3>
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

    ["keydown", "blur"].forEach((evt) => {
        partitionCard.querySelector(".partition-title").addEventListener(evt, (e) => {
            if (evt === "keydown" && e.key == "Enter") {
                e.preventDefault();
                e.target.blur();
                updatePartitionTitle(partitionCard, partIndex);
            }

            if (evt == "blur") {
                updatePartitionTitle(partitionCard, partIndex);
            }
        })
    })

    // Find this card's own expense-container to render its expenses inside it
    const myExpenseContainer = partitionCard.querySelector(".expense-container");


    if (partitionObj.expenses.length === 0) {
        const message = document.createElement("div");
        message.className = "expense-message";
        message.textContent = "Add expenses and allocate amounts";
        myExpenseContainer.appendChild(message);
    }


    // Render each expense belonging to this partition in this container
    partitionObj.expenses.forEach((expense, expenseIndex) => {
        const card = document.createElement("div");

        card.className = "expense-card";
        card.innerHTML = `
            <div class="expense-details"> 
                <h4>${expense.expenseName}</h4>
                <h5>Balance: ₹${(expense.expenseRemainingAmount).toLocaleString('en-IN')}</h5>
            </div>
            
            <svg fill="#33236fe3" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="delete-expense-btn" data-exp-index="${expenseIndex}" viewBox="0 0 560.801 560.801" width="25px" xml:space="preserve" stroke="#000000" stroke-width="0.005608010000000001"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path class="delete-expense-btn-folder" d="M560.801,124.997c0-9.33-7.562-16.891-16.893-16.891H314.182c-9.33,0-22.24-1.971-28.834-8.565l-50.435-47.057 c-6.598-6.597-19.508-11.943-28.834-11.943H16.891C7.561,40.541,0,48.102,0,57.432v371.615c0,9.33,7.561,16.893,16.891,16.893 h225.207c-10.015-22.791-15.75-47.869-15.75-74.322c0-102.449,83.361-185.806,185.806-185.806 c61.004,0,114.75,29.939,148.646,75.484V124.997z"></path> <path class="delete-expense-btn-minus" d="M412.154,222.969c-82.088,0-148.646,66.596-148.646,148.646S330.064,520.26,412.154,520.26 c82.127,0,148.646-66.592,148.646-148.645C560.801,289.561,494.281,222.969,412.154,222.969z M512.143,398.312h-199.98v-50.674 h199.98V398.312z"></path> </g> </g> </g></svg>
        `;

        // When clicking the expense card (not the delete button) show details
        card.addEventListener("click", (e) => {
            if (!e.target.closest(".delete-expense-btn")) {
                openExpense(expense.expenseName, partIndex, expenseIndex);
            }
        });

        // Delete button for the expense (within this partition)
        card.querySelector(".delete-expense-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            const confirmed = await confirmDelete();
            if (confirmed) {
                card.style.transition = "transform 0.5s ease, opacity 0.2s ease";
                card.style.transform = "scale(0.5)";
                card.style.opacity = "0";

                card.addEventListener("transitionend", () => {
                    deleteExpense(partIndex, expenseIndex);
                }, { once: true });
            } else {
                return;
            }

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
    partitionCard.querySelector(".delete-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        const idx = Number(e.currentTarget.dataset.index);

        const confirmed = await confirmDelete();
        if (!confirmed) return;

        partitionCard.style.transition = "transform 0.5s ease, opacity 0.2s ease";
        partitionCard.style.transform = "scale(0.5)";
        partitionCard.style.opacity = "0";
        partitionCard.addEventListener("transitionend", () => {
            deletePartition(idx);
        }, { once: true });



    });
}

function updatePartitionTitle(partitionCard, partIndex) {
    const newName = partitionCard.querySelector(".partition-title").innerText.trim();

    //update data
    partitions[partIndex].name = newName;
    localStorage.setItem("partitions", JSON.stringify(partitions));
}



// Delete a partition
const deletePartition = (partIndex) => {
    partitions.splice(partIndex, 1);
    localStorage.setItem("partitions", JSON.stringify(partitions));
    renderAllPartitions();
};

// Render (clear + create) all partitions
const renderAllPartitions = () => {
    renderTotalBalance()

    // Clear old DOM
    partitionContainer.innerHTML = "";
    // Re-create

    if (partitions.length === 0) { // show initial partitions message
        document.querySelector(".partition-message-outer").classList.remove("hide");
    } else {
        document.querySelector(".partition-message-outer").classList.add("hide");
    }

    partitions.forEach((partitionObj, i) => createPartitionCard(partitionObj, i));
};

const renderTotalBalance = () => {
    totalBalanceDisplay.innerText = `Total Balance: ₹${(totalBalance).toLocaleString('en-IN')}`;

    unSectionedBalance = totalBalance; //reset to totalBalance first
    if (partitions.length !== 0) {
        partitions.forEach((partition) => {
            unSectionedBalance -= partition.remainingAmount;
        })
    } else {
        unSectionedBalance = totalBalance;
    }

    unSectionedBalanceDisplay.innerText = `Un-sectioned: ₹${(unSectionedBalance).toLocaleString('en-IN')}`;

}

function addPartition() {
    const partitionName = partitionInputName.value.trim();
    const partitionAmount = Number(partitionInputAmount.value);
    if (partitionName && partitionAmount >= 0) {
        // check if the allocated amount gets beyond the balance
        let total = 0;
        partitions.forEach((partition) => {
            total += partition.remainingAmount;
        })
        if (partitionAmount + total <= totalBalance) { // intentionally allowed 0 amount allocation
            partitions.push({ name: partitionName, allocatedAmount: partitionAmount, remainingAmount: partitionAmount, expenses: [] });
            localStorage.setItem("partitions", JSON.stringify(partitions));
            renderAllPartitions();
            partitionInputName.value = "";
            partitionInputAmount.value = "";

            setTimeout(() => {   //add a delay for button animation
                partitionModal.classList.add("hide");
            }, 200)
        } else {
            showToast("Opps! No enough balance.", "error");
        }
    }
}

// handle adding partition
partitionModal.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
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
        showToast("Please open the Add button inside a partition to add an expense.", "error");

        setTimeout(() => {
            expenseModal.classList.add("hide");
        }, 200)

        return;
    }
    //check if the allocation exceeds the partition amount
    let total = 0;
    partitions[activePartitionIndex].expenses.forEach((expense) => {
        total += expense.expenseAllocatedAmount
    })
    if (total + expenseAmount <= partitions[activePartitionIndex].allocatedAmount) {
        if (expenseName && expenseAmount >= 0) {  //intentionally allowed 0 amount allocation
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
        showToast("Opps! No enough balance in the current partition.", "error");
    }
}

saveExpenseBtn.addEventListener("click", () => {
    saveExpense()
});

document.querySelector(".modal-content").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
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

    //make the name editable
    document.getElementById("modal-expense-name").addEventListener("blur", () => {
        updateExpenseTitle(expenseIndex);
    }, true)
    document.getElementById("modal-expense-name").addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            updateExpenseTitle(expenseIndex);
            e.target.blur();
        }
    }, true)

    expenseDetails_Model.classList.remove("hide");

    expenseDetails_Model.style.transition = "transform 0.2s ease";
    expenseDetails_Model.style.transform = "translate(350%, -50%)";
    expenseDetails_Model.offsetHeight;
    expenseDetails_Model.style.transform = "translate(50%, -50%)";


    activePartitionIndex = partitionIndex;
    activeExpenseIndex = expenseIndex;
    renderAllExpenseDetails()

    loadProgressionBars()

    history.pushState({ modal: true }, "")

};

function updateExpenseTitle(expenseIndex) {
    const newName = document.getElementById("modal-expense-name").innerText.trim();

    //update in memory
    partitions[activePartitionIndex].expenses[expenseIndex].expenseName = newName;

    localStorage.setItem("partitions", JSON.stringify(partitions));
}


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
    if (!event.state && !expenseDetails_Model.classList.contains("hide")) {
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
        showToast("No active sub detail selected", "error");
        return;
    }
    const spendingAmount = parseFloat(document.getElementById("spending-amount").value);
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
                        <span>-₹${spendingAmount.toLocaleString('en-IN')} (${remarks})</span>
                        <img src="delete.svg" class="clear-detail-btn" width="20px" alt="Clear">
                    </div>
                    <div class="line"></div>`
        );

        //update
        subDetail.subDetailTotal += spendingAmount;
        activeSubDetailElement.querySelector('.sub-detail-total').textContent = `Total: ₹${(subDetail.subDetailTotal).toLocaleString("en-IN")}`

        //save to the local storage back
        localStorage.setItem("partitions", JSON.stringify(partitions));
        localStorage.setItem("totalBalance", totalBalance);


        //Close modal and Clear input fields
        document.querySelector(".spend-modal").classList.add("hide");
        document.getElementById("spending-amount").value = "";
        document.getElementById("remark").value = "";
    } else {
        showToast("Invalid or excessive amount!", "error");
    }
}

// Add expense entry
document.getElementById("enter-spend-btn").addEventListener("click", () => {
    addExpenseEntry();
});

document.querySelector(".spend-modal-inner").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
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
    const currExpense = partitions[activePartitionIndex].expenses[activeExpenseIndex];
    currExpense.expenseAllocatedAmount += creditedAmount;
    currExpense.expenseRemainingAmount += creditedAmount;
    partitions[activePartitionIndex].remainingAmount += creditedAmount;
    partitions[activePartitionIndex].allocatedAmount += creditedAmount;
    totalBalance += creditedAmount;

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
    if (e.key == "Enter") {
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
            document.getElementById("input-sub-detail-name").value = "";
            addSubDetailModal.classList.remove("hide")
        }, 200)
    })
}

function saveSubDetail() {
    if (
        activePartitionIndex === null ||
        activeExpenseIndex === null
    ) {
        showToast("No active expense selected", "error");
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
        document.getElementById("input-sub-detail-name").value = "";
        addSubDetailModal.classList.add("hide");
    }, 100)
}

document.getElementById("input-sub-detail-name").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        e.preventDefault();
        saveSubDetail()
    }
})

enterSubDetailName.addEventListener('click', (e) => {
    saveSubDetail()
})


const svg = `<svg width="20px" height="20px" class="cross" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z" class="cross"></path> </g></svg>`
const createSubExpense = (subDetailObject, subDetailIndex, container) => {

    const subDetailContent = `
        <div class="sub-details" data-sub-index="${subDetailIndex}">
            <div class="sub-detail-name">
                <h4 contenteditable="true" class="sub-detail-title">${subDetailObject.subDetailName}</h4>
                ${svg}
            </div>
            <div class="sub-detail-list"></div>
            <h5 class="sub-detail-total">
                Total: ₹${(subDetailObject.subDetailTotal).toLocaleString('en-IN')}
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
                        <span>-₹${(expenseEntry.amount).toLocaleString('en-IN')} (${expenseEntry.remark})</span>
                        <img src="delete.svg" class="clear-detail-btn" width="20px" alt="Clear">
                    </div> 
                    <div class="line"></div>`
        )
    })

};


// for inline name editing
function updateSubDetailTitle(e) {
    const newName = e.target.innerText.trim();
    const subDetailEl = e.target.closest(".sub-details");
    if (!subDetailEl) return;

    const subIndex = Number(subDetailEl.dataset.subIndex);

    // Update data
    partitions[activePartitionIndex]
        .expenses[activeExpenseIndex]
        .expenseDetails[subIndex]
        .subDetailName = newName;


    localStorage.setItem("partitions", JSON.stringify(partitions));
}

document.querySelector(".detail").addEventListener("blur", (e) => {
    if (!e.target.classList.contains("sub-detail-title")) return;
    updateSubDetailTitle(e);
}, true);// for blur

document.querySelector(".detail").addEventListener("keydown", (e) => {
    if (!e.target.classList.contains("sub-detail-title")) return;
    if (e.key == "Enter") {
        e.preventDefault();
        updateSubDetailTitle(e);
        e.target.blur(); //remve focus
    }
})


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
document.querySelector(".detail").addEventListener("click", async (e) => {
    if (e.target.closest(".cross")) {
        const subDetail = e.target.parentElement.parentElement;
        const subIndex = Number(subDetail.dataset.subIndex);

        const confirmed = await confirmDelete()
        if (!confirmed) return
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

const confirmOverlay = document.querySelector(".confirm-overlay");

function confirmDelete() {
    return new Promise((resolve) => {
        confirmOverlay.classList.remove('hide');

        const onClick = (e) => {
            if (e.target.classList.contains("btn-delete")) {
                cleanup();
                resolve(true);
            }
            else if (e.target.classList.contains("btn-cancel") || e.target === confirmOverlay) {
                cleanup();
                resolve(false);
            }
        };

        function cleanup() {
            confirmOverlay.classList.add("hide");
            confirmOverlay.removeEventListener("click", onClick);
        }

        confirmOverlay.addEventListener("click", onClick);
    })
}


// install as PWA
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    document.getElementById("install-btn").style.display = "block";
});

document.getElementById("install-btn").addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
});



//update version pop up
let newWorker;

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").then(reg => {

        // If there's already a waiting SW on load
        if (reg.waiting) {
            newWorker = reg.waiting;
            showUpdateBanner();
        }

        reg.addEventListener("updatefound", () => {
            newWorker = reg.installing;

            newWorker.addEventListener("statechange", () => {
                if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                ) {
                    showUpdateBanner();
                }
            });
        });
    });

    // important
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("New SW controlling page → reloading");
        window.location.reload();
    });
}

function showUpdateBanner() {
    document.getElementById("update-banner")?.classList.remove("hide");
}


// When user clicks Update
document.getElementById("update-btn")?.addEventListener("click", () => {
    if (newWorker) {
        newWorker.postMessage("SKIP_WAITING");
    }
});


//slide bar (drawer)
const drawerOverlay = document.querySelector(".drawer-overlay");
const drawer = document.querySelector(".drawer");
const hamburger = document.querySelector(".hamburger");
const drawerCloseBtn = document.querySelector(".drawer-cross-btn");

function openDrawer() {
    drawerOverlay.classList.remove("hide");
    drawer.classList.remove("close");
    drawer.classList.add("open");
}

function closeDrawer() {
    drawer.classList.remove("add");
    drawer.classList.add("close");
    drawerOverlay.classList.add("hide");
    if (document.querySelector(".theme-box").classList.contains("open")) {
        document.querySelector(".theme-box").classList.remove("open");
    }
}

drawerOverlay.addEventListener("click", closeDrawer);
hamburger.addEventListener("click", openDrawer);
drawerCloseBtn.addEventListener("click", closeDrawer);



//Export and Import Data functionality
document.getElementById("export-btn").addEventListener("click", () => {
    const data = {
        partitions,
        totalBalance
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sumio-data-backup.json";

    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
        showToast("Data Exported Successfully!", "success");
    }, 1000)
})

document.getElementById("import-btn").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);

                partitions = data.partitions || [];
                totalBalance = data.totalBalance || 0;

                localStorage.setItem("partitions", JSON.stringify(partitions));
                localStorage.setItem("totalBalance", totalBalance);

                // flag for toast after reload
                localStorage.setItem("importSuccess", "true");

                location.reload();
            } catch (err) {
                showToast("Invalid file format ❌");
            }
        }

        reader.readAsText(file);
    }
    input.click();
})

window.addEventListener("load", () => {
    if (localStorage.getItem("importSuccess") === "true") {
        showToast("Data imported successfully!");
        localStorage.removeItem("importSuccess");
    }
});


// reset app data
function clearAllData() {
    const warningModal = document.querySelector(".reset-overlay");
    warningModal.classList.remove("hide");
    const resetModal = document.querySelector(".reset-modal");
    resetModal.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-reset")) {
            setTimeout(() => {
                partitions.splice(0);
                totalBalance = 0;
                localStorage.setItem("partitions", JSON.stringify(partitions));
                localStorage.setItem("totalBalance", totalBalance);
                warningModal.classList.add("hide");
                location.reload();
            }, 100)
        }

        if (e.target.classList.contains("btn-cancel")) {
            setTimeout(() => {
                warningModal.classList.add("hide");
            }, 100)
        }
    })
}

document.getElementById("reset-btn").addEventListener("click", () => {
    clearAllData();
})


// toast logic
let toastTimeout;

function showToast(message, type = "info", duration = 2000) {
    const toast = document.getElementById("toast");

    toast.className = `toast ${type}`;
    toast.innerHTML = `<span id="toast-text">${message}</span>`;
    toast.classList.remove("hide");

    requestAnimationFrame(() => {
        toast.classList.add("show");
    })

    //auto hide
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.classList.add("hide");
        }, 300)
    }, duration)
}


//about section
const aboutModal = document.querySelector(".about-modal");
const aboutClose = document.querySelector(".about-close");

document.getElementById("about-btn").addEventListener("click", () => {
    aboutModal.classList.remove("hide");
})

aboutClose.addEventListener("click", () => {
    aboutModal.classList.add("hide");
})

aboutModal.addEventListener("click", (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.add("hide");
    }
})


//theme change functionality
const drawerItem = document.querySelector(".drawer-item-theme");
const themeBox = document.querySelector(".theme-box");
const themeBtn = document.getElementById("theme-btn");

drawerItem?.addEventListener("click", () => {
    drawerItem.classList.toggle("active");
    if (themeBox.classList.contains("open")) {
        themeBox.classList.remove("open");
        setTimeout(() => {
            themeBtn.style.borderRadius = "8px";
        }, 180);

    } else {
        themeBox.classList.add("open");
        themeBtn.style.borderBottomLeftRadius = "0px";
        themeBtn.style.borderBottomRightRadius = "0px";
    }
});

const lightModeIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="theme-icon"height="24px" viewBox="0 -960 960 960" width="24px" fill="#EFEFEF"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/></svg>`;

const darkModeIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="theme-icon" height="24px" viewBox="0 -960 960 960"
                    width="24px" fill="#EFEFEF">
                    <path
                        d="M600-640 480-760l120-120 120 120-120 120Zm200 120-80-80 80-80 80 80-80 80ZM483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-146 93-257.5T409-880q-18 99 11 193.5T520-521q71 71 165.5 100T879-410q-26 144-138 237T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Z" />
                </svg>`;


document.getElementById("dark").addEventListener("click", () => {
    appTheme = "dark";
    document.getElementById("theme-link").href = "theme-dark.css";
    localStorage.setItem("theme", appTheme);
    document.querySelector(".menu-theme").innerHTML = darkModeIcon;

    document.getElementById("theme-color-meta").setAttribute('content', '#2d2d2d');
});

document.getElementById("ivory").addEventListener("click", () => {
    appTheme = "ivory";
    document.getElementById("theme-link").href = "theme-ivory.css";
    localStorage.setItem("theme", appTheme);
    document.querySelector(".menu-theme").innerHTML = lightModeIcon;

    document.getElementById("theme-color-meta").setAttribute('content', '#fbefd5');
});