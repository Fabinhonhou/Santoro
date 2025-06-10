// Função para alternar o menu (abrir/fechar)
function alterarMenu() {
  const menu = document.getElementById("menu");
  const menuButton = document.querySelector(".menu-btn");
  
  // Verifica se o menu está visível ou não
  if (menu.style.display === "block") {
      menu.style.display = "none"; // Esconde o menu
  } else {
      menu.style.display = "block"; // Exibe o menu
  }
}

// Função para verificar o scroll e mudar a cor do botão do menu
window.onscroll = function() {
  var menuButton = document.querySelector('.menu-btn');
  if (window.scrollY > 50) {
      menuButton.classList.add('scrolled');
  } else {
      menuButton.classList.remove('scrolled');
  }
};



function alternarMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("aberto");
}

// Mudança de cor do botão ao rolar a página
window.onscroll = function() {
  var menuButton = document.querySelector('.menu-btn');
  if (window.scrollY > 50) {
      menuButton.classList.add('scrolled');
  } else {
      menuButton.classList.remove('scrolled');
  }
};

















