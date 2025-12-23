function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.getElementById(tabId).classList.add('active');
}

// PWA install support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
function login() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value;

  if (!name || !email) {
    alert("Please enter your name and email");
    return;
  }

  const user = { name, email, role };
  localStorage.setItem("user", JSON.stringify(user));

  loadUser();
}

function loadUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app-screen").style.display = "block";

  if (user.role === "admin") {
    document.body.classList.add("admin");
  }
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

window.onload = function () {
  loadUser();
  renderServices();
  renderVolunteerSchedules();
};

function addService() {
  console.log("addService fired");

  const input = document.getElementById("serviceInput");
  const text = input.value.trim();

  if (!text) {
    alert("Enter a service time");
    return;
  }

  const services = JSON.parse(localStorage.getItem("services")) || [];
  services.push(text);
  localStorage.setItem("services", JSON.stringify(services));

  input.value = "";
  renderServices();
}

function renderServices() {
  const list = document.getElementById("serviceList");
  list.innerHTML = "";

  const services = JSON.parse(localStorage.getItem("services")) || [];
  services.forEach(service => {
    const li = document.createElement("li");
    li.textContent = service;
    list.appendChild(li);
  });
}
function saveCleaning() {
  const text = document.getElementById("cleaningInput").value.trim();
  localStorage.setItem("cleaningSchedule", text);
  renderVolunteerSchedules();
}

function saveUsher() {
  const text = document.getElementById("usherInput").value.trim();
  localStorage.setItem("usherSchedule", text);
  renderVolunteerSchedules();
}

function renderVolunteerSchedules() {
  const cleaning = localStorage.getItem("cleaningSchedule");
  const usher = localStorage.getItem("usherSchedule");

  document.getElementById("cleaningDisplay").textContent =
    cleaning || "No schedule posted.";

  document.getElementById("usherDisplay").textContent =
    usher || "No schedule posted.";
}
