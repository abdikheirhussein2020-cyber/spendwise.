```javascript
// ======================================
// SPENDWISE - SMART BUDGET TRACKER
// ======================================

// 1. LOAD SAVED DATA FROM LOCAL STORAGE

let transactions = JSON.parse(
    localStorage.getItem("spendwiseTransactions") || "[]"
);

let monthlyBudget = Number(
    localStorage.getItem("spendwiseBudget") || 0
);

// 2. SELECT HTML ELEMENTS

const transactionForm = document.getElementById("transactionForm");
const budgetForm = document.getElementById("budgetForm");
const transactionList = document.getElementById("transactionList");
const feedback = document.getElementById("feedback");
const filterSelect = document.getElementById("filter");

// 3. SAVE DATA

function saveData() {
    localStorage.setItem(
        "spendwiseTransactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "spendwiseBudget",
        monthlyBudget.toString()
    );
}

// 4. SET MONTHLY BUDGET

budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const budgetInput = Number(
        document.getElementById("budget").value
    );

    if (!Number.isFinite(budgetInput) || budgetInput <= 0) {
        document.getElementById("budgetMessage").textContent =
            "Please enter a valid budget.";
        return;
    }

    monthlyBudget = budgetInput;

    saveData();

    document.getElementById("budgetMessage").textContent =
        "Monthly budget successfully updated!";

    updateDashboard();

    budgetForm.reset();
});

// 5. ADD TRANSACTIONS

transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;

    if (
        description === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        showFeedback(
            "Please enter a valid description and amount.",
            "danger"
        );
        return;
    }

    const transaction = {
        id: Date.now() + Math.random(),
        description: description,
        amount: amount,
        type: type,
        category: category
    };

    transactions.push(transaction);

    saveData();

    if (type === "income") {
        showFeedback("Income added successfully!", "success");
    } else {
        showFeedback("Expense added successfully!", "success");
    }

    updateDashboard();

    transactionForm.reset();
});

// 6. CALCULATE TOTALS

function calculateTotals() {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];

        if (transaction.type === "income") {
            totalIncome += Number(transaction.amount);
        } else if (transaction.type === "expense") {
            totalExpenses += Number(transaction.amount);
        }
    }

    return {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses
    };
}

// 7. UPDATE DASHBOARD

function updateDashboard() {
    const totals = calculateTotals();

    const remainingBudget = monthlyBudget - totals.expenses;

    document.getElementById("balance").textContent =
        "KES " + totals.balance.toFixed(2);

    document.getElementById("income").textContent =
        "KES " + totals.income.toFixed(2);

    document.getElementById("expenses").textContent =
        "KES " + totals.expenses.toFixed(2);

    document.getElementById("remainingBudget").textContent =
        "KES " + remainingBudget.toFixed(2);

    let percentage = 0;

    if (monthlyBudget > 0) {
        percentage = (totals.expenses / monthlyBudget) * 100;
    }

    const progressBar = document.getElementById("progressBar");

    progressBar.style.width = Math.min(percentage, 100) + "%";
    progressBar.className = "";

    const budgetMessage = document.getElementById("budgetMessage");

    if (monthlyBudget <= 0) {
        budgetMessage.textContent =
            "Set your monthly budget to monitor spending.";
    } else if (percentage >= 100) {
        budgetMessage.textContent =
            "Warning! You have exceeded your monthly budget.";
        progressBar.classList.add("danger");
    } else if (percentage >= 80) {
        budgetMessage.textContent =
            "Careful! You have used most of your budget.";
        progressBar.classList.add("warning");
    } else {
        budgetMessage.textContent =
            "Great! Your spending is within your budget.";
        progressBar.classList.add("success");
    }

    document.getElementById("progressText").textContent =
        percentage.toFixed(1) + "% of budget used";

    displayTransactions();
}

// 8. DISPLAY AND FILTER TRANSACTIONS

function displayTransactions() {
    transactionList.replaceChildren();

    const selectedFilter = filterSelect.value;

    const visibleTransactions = transactions.filter(function(transaction) {
        return (
            selectedFilter === "all" ||
            transaction.type === selectedFilter
        );
    });

    visibleTransactions.forEach(function(transaction) {
        const li = document.createElement("li");

        const info = document.createElement("div");
        info.className = "transaction-info";

        const description = document.createElement("strong");
        description.textContent = transaction.description;

        const category = document.createElement("small");
        category.textContent = transaction.category;

        info.appendChild(description);
        info.appendChild(category);

        const amount = document.createElement("strong");
        const numericAmount = Number(transaction.amount);

        if (transaction.type === "income") {
            amount.textContent =
                "+ KES " + numericAmount.toFixed(2);
            amount.className = "income";
        } else {
            amount.textContent =
                "- KES " + numericAmount.toFixed(2);
            amount.className = "expense";
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.setAttribute(
            "aria-label",
            "Delete transaction: " + transaction.description
        );

        deleteButton.addEventListener("click", function() {
            transactions = transactions.filter(function(item) {
                return item.id !== transaction.id;
            });

            saveData();

            showFeedback(
                "Transaction deleted successfully.",
                "success"
            );

            updateDashboard();
        });

        li.appendChild(info);
        li.appendChild(amount);
        li.appendChild(deleteButton);

        transactionList.appendChild(li);
    });

    const emptyMessage = document.getElementById("emptyMessage");

    if (visibleTransactions.length === 0) {
        emptyMessage.textContent =
            selectedFilter === "all"
                ? "No transactions yet. Add your first transaction!"
                : "No " + selectedFilter + " transactions found.";

        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

// 9. FILTER EVENT

filterSelect.addEventListener("change", function() {
    displayTransactions();
});

// 10. DISPLAY FEEDBACK

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = type;
}

// 11. INITIAL DASHBOARD UPDATE

updateDashboard();
```