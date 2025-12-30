function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById(tabId).style.display = "block";

  if (tabId === "volunteer-tab") {
    renderCalendar();
    renderCalendarSummary();
    renderAdminCalendar();
  }
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
renderCalendar();
renderCalendarSummary();
renderAdminCalendar();
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

let currentMonth = new Date();

function renderCalendar() {
  console.log("renderCalender fired");
  
  const calendar = document.getElementById("calendar");
  const label = document.getElementById("monthLabel");
  
  if (!calendar || !label) {
    console.error("Calendar elements not found");
    return;
  }
  calendar.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  label.innerText = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const user = JSON.parse(localStorage.getItem("user"));
  const data = JSON.parse(localStorage.getItem("calendarAvailability")) || {};
  const selected = user && data[user.email] ? data[user.email] : [];

  // Empty slots
  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${month + 1}-${d}`;
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.innerText = d;

    if (selected.includes(dateKey)) {
      div.classList.add("available");
    }

    div.onclick = () => toggleDate(dateKey, div);
    calendar.appendChild(div);
  }
}

function toggleDate(dateKey, el) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  let data = JSON.parse(localStorage.getItem("calendarAvailability")) || {};
  let dates = data[user.email] || [];

  if (dates.includes(dateKey)) {
    dates = dates.filter(d => d !== dateKey);
    el.classList.remove("available");
  } else {
    dates.push(dateKey);
    el.classList.add("available");
  }

  data[user.email] = dates;
  localStorage.setItem("calendarAvailability", JSON.stringify(data));
  renderCalendarSummary();
}

function saveCalendarAvailability() {
  renderCalendarSummary();
  renderAdminCalendar();
}

function renderCalendarSummary() {
  const user = JSON.parse(localStorage.getItem("user"));
  const data = JSON.parse(localStorage.getItem("calendarAvailability")) || {};
  const dates = data[user.email] || [];

  document.getElementById("myCalendarAvailability").innerText =
    dates.length ? dates.join(", ") : "No dates selected";
}

function renderAdminCalendar() {
  const container = document.getElementById("allCalendarAvailability");
  if (!container) return;

  const data = JSON.parse(localStorage.getItem("calendarAvailability")) || {};
  container.innerHTML = "";

  Object.entries(data).forEach(([email, dates]) => {
    const p = document.createElement("p");
    p.innerText = `${email}: ${dates.join(", ")}`;
    container.appendChild(p);
  });
}

function prevMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("user")) {
    renderCalendar();
  }
});
