document.addEventListener('DOMContentLoaded', async function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Fetch and display categories
    await fetchAndDisplayCategories(user.Id);

    // Fetch and display transactions
    try {
        const transactionsResponse = await fetch(`http://localhost:3000/api/transactions/${user.Id}`);
        if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            const transactionTable = document.getElementById('transactionTable');

            transactions.forEach(transaction => {
                const newRow = transactionTable.insertRow();
                newRow.innerHTML = `
                    <td>${transaction.CategoryType === 'Income' ? 'Thu nhập' : 'Chi tiêu'}</td>
                    <td>${transaction.CategoryName}</td>
                    <td>${transaction.Description}</td>
                    <td>${transaction.Amount}</td>
                    <td>${new Date(transaction.Date).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editRow(this, '${transaction.Id}')">Sửa</button>
                        <button class="btn btn-success btn-sm d-none" onclick="saveRow(this, '${transaction.Id}')">Lưu</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteRow('${transaction.Id}', this)">Xóa</button>
                    </td>
                `;
            });

            updateTotals();
        } else {
            const error = await transactionsResponse.text();
            alert('Lấy giao dịch thất bại: ' + error);
        }
    } catch (error) {
        alert('Lấy giao dịch thất bại: ' + error.message);
    }

    // Add event listener for logout button
    document.getElementById('logoutButton').addEventListener('click', function () {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Add event listener for category type change
    document.getElementById('type').addEventListener('change', async function () {
        await fetchAndDisplayCategories(user.Id);
    });
});

// Fetch and display categories
async function fetchAndDisplayCategories(userId) {
    try {
        const categoriesResponse = await fetch(`http://localhost:3000/api/categories/${userId}`);
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            const incomeCategories = categories.filter(category => category.Type === 'Income');
            const expenseCategories = categories.filter(category => category.Type === 'Expense');

            const incomeCategoriesList = document.getElementById('incomeCategories');
            const expenseCategoriesList = document.getElementById('expenseCategories');

            incomeCategoriesList.innerHTML = ''; // Clear existing categories
            expenseCategoriesList.innerHTML = ''; // Clear existing categories

            incomeCategories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.dataset.id = category.Id;
                li.innerHTML = `
                    ${category.Name}
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.Id}', 'income')">Xóa</button>
                `;
                incomeCategoriesList.appendChild(li);
            });

            expenseCategories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.dataset.id = category.Id;
                li.innerHTML = `
                    ${category.Name}
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.Id}', 'expense')">Xóa</button>
                `;
                expenseCategoriesList.appendChild(li);
            });

            updateCategoryDropdown(categories);
        } else {
            const error = await categoriesResponse.text();
            alert('Lấy danh mục thất bại: ' + error);
        }
    } catch (error) {
        alert('Lấy danh mục thất bại: ' + error.message);
    }
}

// Populate category dropdowns
function updateCategoryDropdown(categories) {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');

    // Clear current options
    categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';

    const categoryType = typeSelect.value;
    const filteredCategories = categories.filter(category => category.Type.toLowerCase() === categoryType);

    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.Id;
        option.textContent = category.Name;
        categorySelect.appendChild(option);
    });
}

// Update totals function
function updateTotals() {
    let totalIncome = 0, totalExpense = 0;
    document.querySelectorAll("#transactionTable tr").forEach(row => {
        let type = row.cells[0].textContent;
        let amount = parseFloat(row.cells[3].textContent) || 0;
        if (type === "Thu nhập") totalIncome += amount;
        else if (type === "Chi tiêu") totalExpense += amount;
    });
    let balance = totalIncome - totalExpense;
    document.getElementById("totalIncome").textContent = totalIncome;
    document.getElementById("totalExpense").textContent = totalExpense;
    document.getElementById("balance").textContent = balance;
}

// Add transaction
document.getElementById('financeForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    let type = document.getElementById('type').value;
    let category = document.getElementById('category').value;
    let description = document.getElementById('description').value;
    let amount = document.getElementById('amount').value;
    let user = JSON.parse(localStorage.getItem('user'));

    if (!category) {
        alert('Vui lòng chọn danh mục');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.Id, categoryId: category, amount, description })
        });

        if (response.ok) {
            const transaction = await response.json();
            let table = document.getElementById('transactionTable');
            let newRow = table.insertRow();
            newRow.innerHTML = `
                        <td>${type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</td>
                        <td contenteditable="false">${document.querySelector(`#category option[value="${category}"]`).textContent}</td>
                        <td contenteditable="false">${description}</td>
                        <td contenteditable="false">${amount}</td>
                        <td>${new Date().toLocaleString()}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editRow(this, '${transaction.Id}')">Sửa</button>
                            <button class="btn btn-success btn-sm d-none" onclick="saveRow(this, '${transaction.Id}')">Lưu</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteRow('${transaction.Id}', this)">Xóa</button>
                        </td>
                    `;
            updateTotals();
            document.getElementById('financeForm').reset();
        } else {
            const error = await response.text();
            alert('Thêm giao dịch thất bại: ' + error);
        }
    } catch (error) {
        alert('Thêm giao dịch thất bại: ' + error.message);
    }
});

// Delete transaction row
function deleteRow(transactionId, button) {
    fetch(`http://localhost:3000/api/transactions/${transactionId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            let row = button.parentElement.parentElement;
            row.remove();
            updateTotals();
        } else {
            alert('Xóa giao dịch thất bại');
        }
    }).catch(error => {
        alert('Xóa giao dịch thất bại: ' + error.message);
    });
}

// Edit transaction row
function editRow(button, transactionId) {
    let row = button.parentElement.parentElement;
    row.cells[2].contentEditable = "true";
    row.cells[3].contentEditable = "true";
    row.cells[2].focus();
    button.classList.add("d-none");
    row.cells[5].querySelector(".btn-success").classList.remove("d-none");
}

// Save transaction row
function saveRow(button, transactionId) {
    let row = button.parentElement.parentElement;
    let category = row.cells[1].dataset.id;
    let description = row.cells[2].textContent;
    let amount = parseFloat(row.cells[3].textContent);

    fetch(`http://localhost:3000/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId: category, amount, description })
    }).then(response => {
        if (response.ok) {
            row.cells[2].contentEditable = "false";
            row.cells[3].contentEditable = "false";
            button.classList.add("d-none");
            row.cells[5].querySelector(".btn-warning").classList.remove("d-none");
            updateTotals();
        } else {
            alert('Lưu giao dịch thất bại');
        }
    }).catch(error => {
        alert('Lưu giao dịch thất bại: ' + error.message);
    });
}

// Add category
document.getElementById('categoryForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    let categoryType = document.getElementById('categoryType').value;
    let categoryName = document.getElementById('categoryName').value;
    let user = JSON.parse(localStorage.getItem('user'));

    if (!categoryName.trim()) {
        alert('Vui lòng nhập tên danh mục');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.Id, name: categoryName, type: categoryType })
        });

        if (response.ok) {
            await fetchAndDisplayCategories(user.Id);
            document.getElementById('categoryForm').reset();
        } else {
            const error = await response.text();
            alert('Thêm danh mục thất bại: ' + error);
        }
    } catch (error) {
        alert('Thêm danh mục thất bại: ' + error.message);
    }
});

// Delete category
function deleteCategory(categoryId, type) {
    fetch(`http://localhost:3000/api/categories/${categoryId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            const categoryItem = document.querySelector(`button[onclick="deleteCategory('${categoryId}', '${type}')"]`).parentElement;
            categoryItem.remove();
            updateCategoryDropdown();
        } else {
            alert('Xóa dsanh mục thất bại');
        }
    }).catch(error => {
        alert('Xóa danh mục thất bại: ' + error.message);
    });
}