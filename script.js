// admins are stored in line2, employees in line3, and the currentuser is set to null because when the page is loaded no one is logged in 
let admins = [];
let employees = [];
let currentUser = null;

// Fetch admin and employee data from JSON Server, we should fetch for the link that is diaplayedd in the terminal , promise.all is a function and it is loading both simutaneously, when  both fetchedds are succesfull it gives an array once it loads it will assign admin details to admins and employee details to emloyees 

Promise.all([
    fetch("http://localhost:3001/admin").then(res => res.json()),
    fetch("http://localhost:3001/employees").then(res => res.json())
])
    .then(([adminList, employeeList]) => {
        admins = adminList;
        employees = employeeList;

        // Check if user is already loggedd in previously and if the data is  in the local storage , if saved user is existing it means that a userr is alreday logged in , we convert the savedd json string into an object using parsee , then we call showDashboard function to directy show the dashboard without asking for login 
        const savedUser = localStorage.getItem("loggedInUser");
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showDashboard(currentUser);
        }

        // Login form submission , we are getting the id of the form which has mail and password and adding an event to the form , saaying when submit event is occured (when clicked on login button or presses enter , function should run , where e is the event object and pevt deft prevents default action of form submission (which will page reload ))
        document.getElementById("loginForm").addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            // Check user in both admin and employee lists and adds themto user using spread operator , find will search the combined list for a user with matching email and password , It checks each user object (u) and returns the first one that matches both email and password.



            const user = [...admins, ...employees].find(
                u => u.email === email && u.password === password
            );

            if (!user) return alert("Invalid credentials");

            //The matched user is saved in a global variable called currentUser.This can be used elsewhere in your app to track the currently logged -in user.





            currentUser = user;


            localStorage.setItem("loggedInUser", JSON.stringify(user));
            showDashboard(user);
        });

        //The user info is stored in the browser's local storage so it persists even after a page refresh.JSON.stringify() converts the user object into a string(localStorage can only store strings).

        //    //This calls a function (defined elsewhere) to update the UI.Based on the user’s role(admin or employee), it displays the correct dashboard.



    })
    .catch(err => {
        console.error(err);
        alert("Error loading data. Make sure JSON Server is running.");
    });


//Logs the error in the console Shows an alert to the user: "Error loading data. Make sure JSON Server is running."





function showDashboard(user) {
    document.getElementById("loginSection").classList.add("d-none");
    document.getElementById("dashboardSection").classList.remove("d-none");
    document.getElementById("userName").textContent = user.name;

    const isAdmin = user.role === "admin";
    document.getElementById("adminControls").classList.toggle("d-none", !isAdmin);
    document.getElementById("passwordChangeSection").classList.toggle("d-none", isAdmin);

    document.getElementById("adminIconBtn")?.classList.toggle("d-none", !isAdmin);

    if (user.role === "admin") {
        fillAdminModal(user);
    }

    //showProfile(user);
    if (user.role !== "admin") {
        showProfile(user);
    } else {
        document.getElementById("profileSection").classList.add("d-none");
    }



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
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>${emp.empId}</td>
            <td>
                ${currentUser.role === "admin" ? `
                    <button class="btn btn-sm btn-primary" onclick="openEditModal(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">Delete</button>
                ` : ""}
            </td>
        `;
        tbody.appendChild(row);
    });
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

function fillAdminModal(user) {
    document.getElementById("adminModalBody").innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <p><strong>Emp ID:</strong> ${user.empId}</p>
        <p><strong>Role:</strong> ${user.role}</p>
    `;
}

// Admin icon modal trigger
const adminModal = new bootstrap.Modal(document.getElementById("adminModal"));
document.getElementById("adminIconBtn")?.addEventListener("click", () => {
    if (currentUser && currentUser.role === "admin") {
        fillAdminModal(currentUser);
        adminModal.show();
    }
});
