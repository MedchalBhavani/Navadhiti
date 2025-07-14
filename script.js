let admins = [];
let employees = [];
let currentUser = null;

Promise.all([
    fetch("http://localhost:3001/admin").then(res => res.json()),
    fetch("http://localhost:3001/employees").then(res => res.json())
])
    .then(([adminList, employeeList]) => {
        admins = adminList;
        employees = employeeList;

        const savedUser = localStorage.getItem("loggedInUser");
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showDashboard(currentUser);
        }

        document.getElementById("loginForm").addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            const user = [...admins, ...employees].find(
                u => u.email === email && u.password === password
            );

            if (!user) return alert("Invalid credentials");

            currentUser = user;
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            showDashboard(user);
        });
    })
    .catch(err => {
        console.error(err);
        alert("Error loading data. Make sure JSON Server is running.");
    });

function showDashboard(user) {
    document.getElementById("loginSection").classList.add("d-none");
    document.getElementById("dashboardSection").classList.remove("d-none");
    document.getElementById("userName").textContent = user.name;

    const isAdmin = user.role === "admin";
    document.getElementById("adminControls").classList.toggle("d-none", !isAdmin);
    document.getElementById("passwordChangeSection").classList.toggle("d-none", isAdmin);

    showProfile(user);
    renderTable(isAdmin ? employees : [user]);
}

function showProfile(user) {
    document.getElementById("profileSection").innerHTML = `
        <h5 class="mb-3">Your Profile</h5>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <p><strong>Emp ID:</strong> ${user.empId}</p>
        <p><strong>Role:</strong> ${user.role}</p>
    `;
}

function renderTable(data) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = "";

    data.forEach((emp, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><span>${emp.name}</span><input class="form-control d-none" value="${emp.name}"></td>
            <td><span>${emp.email}</span><input class="form-control d-none" value="${emp.email}"></td>
            <td><span>${emp.phone}</span><input class="form-control d-none" value="${emp.phone}"></td>
            <td><span>${emp.empId}</span><input class="form-control d-none" value="${emp.empId}"></td>
            <td><span>${emp.role}</span></td>
            <td>
                ${currentUser.role === "admin" ? `
                <button class="btn btn-sm btn-warning" onclick="enableEdit(${index}, this)">Edit</button>
                <button class="btn btn-sm btn-success d-none" onclick="saveEdit(${index}, this)">Save</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">Delete</button>
                ` : ""}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function enableEdit(index, btn) {
    const row = btn.closest("tr");
    row.querySelectorAll("span").forEach(el => el.classList.add("d-none"));
    row.querySelectorAll("input").forEach(el => el.classList.remove("d-none"));
    btn.classList.add("d-none");
    btn.nextElementSibling.classList.remove("d-none");
}

function saveEdit(index, btn) {
    const row = btn.closest("tr");
    const inputs = row.querySelectorAll("input");

    employees[index].name = inputs[0].value;
    employees[index].email = inputs[1].value;
    employees[index].phone = inputs[2].value;
    employees[index].empId = inputs[3].value;

    fetch(`http://localhost:3001/employees/${employees[index].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employees[index])
    }).then(() => renderTable(employees));
}

function deleteEmployee(index) {
    if (!confirm("Delete this employee?")) return;

    fetch(`http://localhost:3001/employees/${employees[index].id}`, {
        method: "DELETE"
    })
        .then(() => {
            employees.splice(index, 1);
            renderTable(employees);
        });
}

document.getElementById("addForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("newRole").value;
    const newUser = {
        name: document.getElementById("newName").value,
        email: document.getElementById("newEmail").value,
        phone: document.getElementById("newPhone").value,
        empId: document.getElementById("newEmpId").value,
        password: "emp123",
        role,
        id: String(Date.now())
    };

    const url = role === "admin" ? "admin" : "employees";
    fetch(`http://localhost:3001/${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
    })
        .then(res => res.json())
        .then(data => {
            if (role === "admin") admins.push(data);
            else employees.push(data);
            renderTable(employees);
            this.reset();
        });
});

document.getElementById("search")?.addEventListener("input", function () {
    const q = this.value.toLowerCase();
    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.empId.toLowerCase().includes(q)
    );
    renderTable(filtered);
});

function changePassword() {
    const newPass = document.getElementById("newPassword").value.trim();
    if (!newPass) return alert("Password required");

    const idx = employees.findIndex(emp => emp.email === currentUser.email);
    if (idx !== -1) {
        employees[idx].password = newPass;
        currentUser.password = newPass;
        localStorage.setItem("loggedInUser", JSON.stringify(currentUser));

        fetch(`http://localhost:3001/employees/${currentUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentUser)
        }).then(() => {
            alert("Password updated successfully");
            document.getElementById("newPassword").value = "";
        });
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    location.reload();
}

const adminModal = new bootstrap.Modal(document.getElementById('adminInfoModal'));
const editEmpModal = new bootstrap.Modal(document.getElementById('editEmpModal'));
document.getElementById('adminIconBtn').addEventListener('click', () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    document.getElementById('adminInfoContent').innerHTML = `
      <p><strong>Name:</strong> ${currentUser.name}</p>
      <p><strong>Email:</strong> ${currentUser.email}</p>
      <p><strong>Phone:</strong> ${currentUser.phone}</p>
      <p><strong>Emp ID:</strong> ${currentUser.empId}</p>
    `;
    adminModal.show();
});
function openEditModal(index) {
    const emp = employees[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editName').value = emp.name;
    document.getElementById('editEmail').value = emp.email;
    document.getElementById('editPhone').value = emp.phone;
    document.getElementById('editEmpId').value = emp.empId;
    document.getElementById('editRole').value = emp.role;
    editEmpModal.show();
}

// ✅ Place THIS block below the above function
document.getElementById('empEditForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = parseInt(document.getElementById('editIndex').value, 10);
    const emp = employees[i];
    emp.name = editName.value;
    emp.email = editEmail.value;
    emp.phone = editPhone.value;
    emp.empId = editEmpId.value;
    emp.role = editRole.value;

    fetch(`http://localhost:3001/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
    }).then(() => {
        editEmpModal.hide();
        renderTable(employees);
    });
});



