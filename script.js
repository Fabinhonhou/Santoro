let navbarRevelada = false;

window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar");

  if (!navbarRevelada && window.scrollY > 50) {
    navbar.classList.add("visible");
    navbarRevelada = true; // Garante que não remova mais
  }
});
