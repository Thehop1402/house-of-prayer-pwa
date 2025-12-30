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
  renderVolunteerSchedules(); // 🔑 THIS WAS MISSING
}

function loadUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("app-screen").style.display = "block";

  // Reset admin state first
  document.body.classList.remove("admin");

  if (user.role === "admin") {
    document.body.classList.add("admin");
  }

  // 🔑 ALWAYS render shared content
  renderVolunteerSchedules();
}

function logout() {
  localStorage.removeItem("user");
  document.body.classList.remove("admin");
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
  console.log("saveCleaning fired");
  const text = document.getElementById("cleaningInput").value.trim();
  localStorage.setItem("cleaningSchedule", text);
  renderVolunteerSchedules();
}

function saveUsher() {
  console.log("saveUsher fired");
  const text = document.getElementById("usherInput").value.trim();
  localStorage.setItem("usherSchedule", text);
  renderVolunteerSchedules();
}

function renderVolunteerSchedules() {
  const cleaning = localStorage.getItem("cleaningSchedule") || "No schedule posted";
  const usher = localStorage.getItem("usherSchedule") || "No schedule posted";

  document.getElementById("cleaningDisplay").innerText = cleaning;
  document.getElementById("usherDisplay").innerText = usher;
}

function saveAvailability() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const checked = document.querySelectorAll(
    '#availability-section input[type="checkbox"]:checked'
  );

  const days = Array.from(checked).map(cb => cb.value);

  let availability = JSON.parse(localStorage.getItem("availability")) || {};
  availability[user.email] = {
    name: user.name,
    days
  };

  localStorage.setItem("availability", JSON.stringify(availability));

  renderAvailability();
}

function renderAvailability() {
  const user = JSON.parse(localStorage.getItem("user"));
  const availability = JSON.parse(localStorage.getItem("availability")) || {};

  // Member view
  if (user && availability[user.email]) {
    document.getElementById("myAvailability").innerText =
      availability[user.email].days.join(", ") || "None selected";
  }

  // Admin view
  const allDiv = document.getElementById("allAvailability");
  if (!allDiv) return;

  allDiv.innerHTML = "";

  Object.values(availability).forEach(v => {
    const p = document.createElement("p");
    p.innerText = `${v.name}: ${v.days.join(", ")}`;
    allDiv.appendChild(p);
  });
}
