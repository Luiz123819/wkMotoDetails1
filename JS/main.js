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

