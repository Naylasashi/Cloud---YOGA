/* Efek interaktif bersama: header menempel + elemen muncul saat di-scroll */
(function () {
  document.documentElement.classList.add('js');
  var header = document.querySelector('header');
  function geser() { if (header) header.classList.toggle('menempel', window.scrollY > 8); }
  window.addEventListener('scroll', geser, { passive: true }); geser();
  var target = document.querySelectorAll('.hero, .banner, .pkg, .box, .tentang, .history-tools, .faq details');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add('muncul'); io.unobserve(it.target); } });
  }, { threshold: 0.12 });
  target.forEach(function (n, i) {
    n.classList.add('reveal');
    n.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(n);
  });
})();
