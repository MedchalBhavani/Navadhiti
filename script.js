let currentData = {};

document.getElementById("employeeForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("email").value.trim();
    const gender = document.getElementById("gender").value;

    if (!firstName || !lastName || !dob || !email || !gender) {
        alert("Please fill all fields.");
        return;
    }

    currentData = { firstName, lastName, dob, email, gender };

    const generatedEmail = `nvd${firstName.toLowerCase()}@gmail.com`;
    currentData.generatedEmail = generatedEmail;

    document.getElementById("generatedEmail").innerText = `Here's your generated email: ${generatedEmail}`;
    new bootstrap.Modal(document.getElementById("emailModal")).show();
});

function showEmpIdForm() {
    bootstrap.Modal.getInstance(document.getElementById("emailModal")).hide();
    new bootstrap.Modal(document.getElementById("empIdModal")).show();
}

function saveEmpId() {
    const empId = document.getElementById("empIdInput").value.trim();
    if (!empId) return alert("Please enter an Employee ID.");

    const savedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
    const exists = savedEmployees.some(emp => emp.empId === empId);

    if (exists) {
        alert("Employee ID already exists. Choose another.");
        return;
    }

    currentData.empId = empId;
    savedEmployees.push(currentData);
    localStorage.setItem("employees", JSON.stringify(savedEmployees));

    alert("Employee saved successfully!");
    bootstrap.Modal.getInstance(document.getElementById("empIdModal")).hide();
    document.getElementById("employeeForm").reset();
    document.getElementById("empIdInput").value = "";
}

function editForm() {
    document.getElementById("firstName").value = currentData.firstName || "";
    document.getElementById("lastName").value = currentData.lastName || "";
    document.getElementById("dob").value = currentData.dob || "";
    document.getElementById("email").value = currentData.email || "";
    document.getElementById("gender").value = currentData.gender || "";
    document.getElementById("empIdInput").value = currentData.empId || "";

    bootstrap.Modal.getInstance(document.getElementById("empIdModal"))?.hide();
}
