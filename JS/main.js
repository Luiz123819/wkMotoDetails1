const navButton = document.querySelector('.nav_button_mobile');
const navMenu = document.querySelector('.nav_menu');
const overlay = document.querySelector('.overlay');
const navIcon = navButton.querySelector('i'); // pega o ícone dentro do botão

// Abre/fecha menu e overlay
navButton.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  overlay.classList.toggle('active');

  // Troca ícone
  if (navMenu.classList.contains('active')) {
    navIcon.classList.remove('fa-bars');
    navIcon.classList.add('fa-x');
  } else {
    navIcon.classList.remove('fa-x');
    navIcon.classList.add('fa-bars');
  }
});

// Fecha ao clicar fora (overlay)
overlay.addEventListener('click', () => {
  navMenu.classList.remove('active');
  overlay.classList.remove('active');

  // Volta ícone para hambúrguer
  navIcon.classList.remove('fa-x');
  navIcon.classList.add('fa-bars');
});


const swiper = new Swiper('.swiper', {
  slidesPerView: 3,
  spaceBetween: 20,
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
  breakpoints: {
    320: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});

const btn = document.querySelector(".verMaisBTN"); const hiddenLine = document.querySelector(".lineHidden"); btn.addEventListener("click", function () { hiddenLine.classList.toggle("show"); if (hiddenLine.classList.contains("show")) { btn.textContent = "Ver Menos"; } else { btn.textContent = "Ver Mais"; } });



const hearts = document.querySelectorAll(".fotoCard i");

hearts.forEach((heart, index) => {
  // Verifica se já estava salvo como ativo
  if (localStorage.getItem("heart-" + index) === "active") {
    heart.classList.add("active");
  }

  // Corrigido: evento no próprio coração
  heart.addEventListener("click", function () {
    this.classList.toggle("active");

    if (this.classList.contains("active")) {
      localStorage.setItem("heart-" + index, "active");
    } else {
      localStorage.removeItem("heart-" + index);
    }
  });
});
