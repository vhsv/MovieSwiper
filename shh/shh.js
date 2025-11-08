const currentUser = sessionStorage.getItem('currentUser') || 'guest';
console.log("Zalogowany użytkownik:", currentUser);

// Wyświetlenie nazwy użytkownika
document.getElementById("profileName").textContent = currentUser;

document.getElementById("profilePicture").innerHTML = '<img src="../img/avatar'+currentUser+'.jpg" alt="">'

// Toggle dropdown
const profileBtn = document.getElementById("profileBtn");
const dropdown = document.getElementById("dropdown");

profileBtn.addEventListener("click", () => {
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

document.getElementById("sharedListBtn").addEventListener("click", () => {

  window.location.href = "shared.html";

});

document.getElementById("logoutBtn").addEventListener("click", () => {

  sessionStorage.removeItem("currentUser");
  // przekieruj na stronę logowania
  window.location.href = "../index.html"; // lub "login.html" jeśli masz osobną stronę logowania
});


// Zamknij dropdown jeśli klikniesz poza nim
window.addEventListener("click", (e) => {
  if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});
const footer = document.getElementById("footer");
const footerToggle = document.getElementById("footerToggle");

footerToggle.addEventListener("click", () => {
  footer.classList.toggle("open");
  footerToggle.classList.toggle("open");
});