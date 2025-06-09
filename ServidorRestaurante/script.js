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










const mesas = document.querySelectorAll('.container div');  /* Captura todas as divs dentro do .container */
const modal = document.getElementById("modal");  /* Captura o modal */
const modalImage = document.getElementById("modal-image");  /* Captura a imagem dentro do modal */
const closeButton = document.getElementById("close");  /* Captura o botão de fechar */


mesas.forEach(mesa => {
  mesa.addEventListener("click", function() {
    const imageSrc = mesa.getAttribute('data-image');  /* Obtém o valor do atributo 'data-image' da mesa */
    modalImage.src = imageSrc;  /* Define o atributo 'src' da imagem dentro do modal */
    modal.style.display = "flex";  /* Exibe o modal (fica visível) */
  });
});


closeButton.addEventListener("click", function() {
  modal.style.display = "none";  /* Esconde o modal ao clicar no 'X' */
});


window.addEventListener("click", function(event) {
  if (event.target == modal) {  /* Verifica se o clique foi fora da imagem */
    modal.style.display = "none";  /* Esconde o modal */
  }
});

