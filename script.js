

let employees = [];
let currentUser = null;

// Fetch employees from JSON Server on load
fetch('http://localhost:3000/employees')
    .then(res => res.json())
    .then(data => {
        employees = data;
    });

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const user = employees.find(u => u.email === email && u.password === password);
    if (!user) return alert("Invalid credentials");

    currentUser = user;
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    document.getElementById("loginSection").classList.add("d-none");
    document.getElementById("dashboardSection").classList.remove("d-none");
    document.getElementById("userName").textContent = user.name;

    if (currentUser.role === "admin") {
        document.getElementById("adminControls").classList.remove("d-none");
    }

    if (currentUser.role === "employee") {
        document.getElementById("passwordChangeSection").classList.remove("d-none");
    } else {
        document.getElementById("passwordChangeSection").classList.add("d-none");
    }

    renderTable(employees);
    showProfile(user);
});

// Show profile
function showProfile(user) {
    document.getElementById("profileSection").innerHTML = `
      <h5>Your Profile</h5>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Emp ID:</strong> ${user.empId}</p>
    `;
}

// Render employee table
function renderTable(data) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = "";

    data.forEach((emp, index) => {
        const isSelf = currentUser.email === emp.email;
        const isAdmin = currentUser.role === "admin";
        if (!isAdmin && !isSelf) return;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td><span>${emp.name}</span><input class="form-control d-none" value="${emp.name}" ${!isAdmin ? "disabled" : ""}></td>
        <td><span>${emp.email}</span><input class="form-control d-none" value="${emp.email}" ${!isAdmin ? "disabled" : ""}></td>
        <td><span>${emp.phone}</span><input class="form-control d-none" value="${emp.phone}" ${!isAdmin ? "disabled" : ""}></td>
        <td><span>${emp.empId}</span><input class="form-control d-none" value="${emp.empId}" ${!isAdmin ? "disabled" : ""}></td>
        <td>
          ${isAdmin ? `
            <button class="btn btn-sm btn-warning" onclick="enableEdit(${index}, this)">Edit</button>
            <button class="btn btn-sm btn-success d-none" onclick="saveEdit(${index}, this)">Save</button>
            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">Delete</button>
          ` : ""}
        </td>
      `;
        tbody.appendChild(row);
    });
}

// Enable edit
function enableEdit(index, btn) {
    const row = btn.closest("tr");
    const spans = row.querySelectorAll("span");
    const inputs = row.querySelectorAll("input");
    spans.forEach(span => span.classList.add("d-none"));
    inputs.forEach(input => input.classList.remove("d-none"));
    btn.classList.add("d-none");
    btn.nextElementSibling.classList.remove("d-none");
}

// Save edit
function saveEdit(index, btn) {
    const row = btn.closest("tr");
    const inputs = row.querySelectorAll("input");
    employees[index].name = inputs[0].value;
    employees[index].email = inputs[1].value;
    employees[index].phone = inputs[2].value;
    employees[index].empId = inputs[3].value;
    renderTable(employees);
}

// Delete employee
function deleteEmployee(index) {
    if (!confirm("Are you sure?")) return;
    employees.splice(index, 1);
    renderTable(employees);
}

// Add employee (admin only)
document.getElementById("addForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const newEmp = {
        name: document.getElementById("newName").value,
        email: document.getElementById("newEmail").value,
        phone: document.getElementById("newPhone").value,
        empId: document.getElementById("newEmpId").value,
        password: "emp123",
        role: "employee",
        id: String(employees.length + 1)
    };
    employees.push(newEmp);
    this.reset();
    renderTable(employees);
});

// Search
const search = document.getElementById("search");
if (search) {
    search.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query) ||
            emp.empId.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });
}

// Auto-login from localStorage
const savedUser = localStorage.getItem("loggedInUser");
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById("loginSection").classList.add("d-none");
    document.getElementById("dashboardSection").classList.remove("d-none");
    document.getElementById("userName").textContent = currentUser.name;

    if (currentUser.role === "admin") {
        document.getElementById("adminControls").classList.remove("d-none");
    }

    if (currentUser.role === "employee") {
        document.getElementById("passwordChangeSection").classList.remove("d-none");
    } else {
        document.getElementById("passwordChangeSection").classList.add("d-none");
    }

    renderTable(employees);
    showProfile(currentUser);
}

// Change password (for employee)
function changePassword() {
    const newPassword = document.getElementById("newPassword").value.trim();
    if (!newPassword) return alert("Password cannot be empty");

    const userIndex = employees.findIndex(emp => emp.email === currentUser.email);
    if (userIndex !== -1) {
        // Update local data
        employees[userIndex].password = newPassword;
        currentUser.password = newPassword;

        // Send update to JSON server
        const userId = currentUser.id;
        fetch(`http://localhost:3000/employees/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser)
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to update password in backend");
                return res.json();
            })
            .then(updated => {
                // Reflect changes in localStorage and confirm
                currentUser = updated;
                localStorage.setItem("loggedInUser", JSON.stringify(updated));
                alert("Password updated successfully!");
                document.getElementById("newPassword").value = "";
            })
            .catch(err => {
                console.error(err);
                alert("Error: " + err.message);
            });
    }
}


// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}
