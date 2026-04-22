// ==========================================
// Variables de control
// ==========================================
const currentPage = window.location.pathname.split("/").pop(); // nombre del archivo actual
const isInPages = window.location.pathname.includes("/pages/"); // detecta si estamos en carpeta pages
const headerPath = isInPages ? "../header.html" : "header.html"; // ruta relativa correcta
const loaderPath = isInPages ? "../loader.html" : "loader.html"; // ruta para loader

// Prevenir animaciones mientras carga el loader
document.body.classList.add('loading');

// ==========================================
// Cargar loader global (optimizado) - CON TIEMPO MÍNIMO DE 1.5 SEGUNDOS
// ==========================================
let loaderHidden = false;
const MIN_LOADER_TIME = 1000; // 1.5 segundos mínimo
const startTime = Date.now();

const hideLoader = () => {
  if (loaderHidden) return;
  
  const elapsed = Date.now() - startTime;
  const remaining = MIN_LOADER_TIME - elapsed;
  
  if (remaining > 0) {
    // Esperar el tiempo restante para llegar al mínimo
    setTimeout(() => {
      if (loaderHidden) return;
      loaderHidden = true;
      const loader = document.getElementById('global-loader');
      if (!loader) return;
      loader.style.opacity = '0';
      document.body.classList.remove('loading');
      setTimeout(() => loader.remove(), 500);
    }, remaining);
  } else {
    // Ya pasó el tiempo mínimo, ocultar ahora
    loaderHidden = true;
    const loader = document.getElementById('global-loader');
    if (!loader) return;
    loader.style.opacity = '0';
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), 500);
  }
};

fetch(loaderPath)
  .then(response => (response.ok ? response.text() : null))
  .then(loaderHtml => {
    if (!loaderHtml) return;

    document.body.insertAdjacentHTML('afterbegin', loaderHtml);

    document.addEventListener('DOMContentLoaded', () => {
      hideLoader();
    });

    window.addEventListener('load', () => {
      hideLoader();
    });

    // Fallback: quitar loader después de 2 segundos (por si acaso)
    setTimeout(() => {
      hideLoader();
    }, 2000);
  })
  .catch(err => console.error('Error al cargar el loader:', err));

// ==========================================
// Cargar header global - CÓDIGO FINAL CORREGIDO
// ==========================================
fetch(headerPath)
  .then((response) => {
    if (!response.ok) throw new Error("Header no encontrado");
    return response.text();
  })
  .then((data) => {
    document.getElementById("header-placeholder").innerHTML = data;

    // ==========================================
    // Marcar enlace activo según página
    // ==========================================
    const links = document.querySelectorAll(".nav__link");
    links.forEach((link) => {
      const linkHref = link.getAttribute("href").split("/").pop();
      if (linkHref === currentPage) {
        link.classList.add("nav__link--active");
      }
    });

    // ==========================================
    // Inicializar menú móvil - CÓDIGO CORREGIDO
    // ==========================================
    const $checkbox = document.querySelector("#menu-toggle");
    const $hamburger = document.querySelector(".nav__hamburger");
    const $navList = document.querySelector(".nav__list");
    const $body = document.querySelector("body");

    if ($checkbox && $hamburger && $navList) {
      
      let resizeTimeout;
      let isResizing = false;

      // Función para abrir/cerrar menú
      const toggleMenu = (open) => {
        if (window.innerWidth <= 950) {
          if (open) {
            $hamburger.classList.add('menu-open');
            $navList.classList.add('menu-open');
            $body.setAttribute("not-scroll", "true");
          } else {
            $hamburger.classList.remove('menu-open');
            $navList.classList.remove('menu-open');
            $body.setAttribute("not-scroll", "false");
          }
          $checkbox.checked = open;
        }
      };

      // Función para resetear a estado desktop
      const resetToDesktop = () => {
        $hamburger.classList.remove('menu-open');
        $navList.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
        
        // Asegurar que el menú esté oculto en desktop
        $navList.style.display = 'none';
        $hamburger.style.display = 'none';
      };

      // Función para preparar estado móvil
      const prepareForMobile = () => {
        $hamburger.style.display = 'flex';
        $navList.style.display = 'flex';
        $navList.classList.remove('menu-open');
        $hamburger.classList.remove('menu-open');
        $checkbox.checked = false;
        $body.setAttribute("not-scroll", "false");
      };

      // Controlar menú al hacer clic en hamburguesa
      $hamburger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.innerWidth <= 950) {
          const isOpen = $navList.classList.contains('menu-open');
          toggleMenu(!isOpen);
        }
      });

      // Cerrar menú al hacer clic en enlaces (solo en móvil)
      const navLinks = document.querySelectorAll(".nav__link");
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 950) {
            toggleMenu(false);
          }
        });
      });

      // Cerrar menú al hacer clic fuera (solo en móvil)
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 950 && $navList.classList.contains('menu-open')) {
          const isClickInsideNav = e.target.closest('.nav');
          const isClickOnHamburger = e.target.closest('.nav__hamburger');
          
          if (!isClickInsideNav && !isClickOnHamburger) {
            toggleMenu(false);
          }
        }
      });

      // Manejar resize con debounce mejorado
      window.addEventListener('resize', () => {
        if (!isResizing) {
          isResizing = true;
          
          // Ocultar menú inmediatamente durante el resize
          if (window.innerWidth <= 950) {
            $navList.style.display = 'none';
          }
        }
        
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
          isResizing = false;
          
          if (window.innerWidth > 950) {
            resetToDesktop();
          } else {
            prepareForMobile();
            // Asegurar que el menú esté cerrado después del resize
            toggleMenu(false);
          }
        }, 100);
      });

      // Inicializar estado del menú
      const initializeMenu = () => {
        // Forzar el estado inicial correcto
        if (window.innerWidth <= 950) {
          prepareForMobile();
          // Asegurar que el menú empiece cerrado
          setTimeout(() => {
            $navList.style.display = 'flex';
            toggleMenu(false);
          }, 10);
        } else {
          resetToDesktop();
          // En desktop, asegurar que el menú esté visible
          setTimeout(() => {
            $navList.style.display = 'flex';
          }, 10);
        }
      };

      // Inicializar después de que todo esté cargado
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
      } else {
        initializeMenu();
      }

      // También inicializar cuando la ventana se carga completamente
      window.addEventListener('load', initializeMenu);
    }

  // ==========================================
    // Inicializar fondo de ondas
    // ==========================================
    initWaves();

  })

  .catch((err) => console.error("Error cargando el header:", err));


 // Cargar footer global (AFUERA del fetch del header)
const footerPath = isInPages ? "../footer.html" : "footer.html";
fetch(footerPath)
  .then(response => response.ok ? response.text() : null)
  .then(footerHtml => {
    if (footerHtml) {
      document.body.insertAdjacentHTML('beforeend', footerHtml);
    }
  });


// ==========================================
// Funciones de modales
// ==========================================
function openModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  $modal.setAttribute("isOpen", true);
  $body.setAttribute("not-scroll", true);
}

function closeModal(modalId) {
  const $body = document.querySelector("body");
  const $modal = document.querySelector(`.n-modal-${modalId}`);
  $modal.setAttribute("isOpen", false);
  $body.setAttribute("not-scroll", false);
}

// ==========================================
// Manejar tecla ESC para cerrar menú - ACTUALIZADO
// ==========================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const $hamburger = document.querySelector(".nav__hamburger");
    const $navList = document.querySelector(".nav__list");
    const $body = document.querySelector("body");

    if ($navList && $navList.classList.contains('menu-open') && window.innerWidth <= 950) {
      $hamburger.classList.remove('menu-open');
      $navList.classList.remove('menu-open');
      $body.setAttribute("not-scroll", "false");
    }
  }
});

/// ==========================================
// Fondo #303232 con partículas grises + amarillas sutiles
// ==========================================
function initWaves() {
  const canvas = document.getElementById('bg-waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;
  let mouseX = 0.5;
  let mouseY = 0.5;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  let particles = [];
  const PARTICLE_COUNT = 120; // Aumentado a 120

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 2.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.speedY = (Math.random() - 0.5) * 0.2;
      
      // 20% de probabilidad de ser amarilla, 80% gris
      const isYellow = Math.random() < 0.2;
      
      if (isYellow) {
        // Amarilla muy sutil (baja saturación y alpha bajo)
        this.r = 254;
        this.g = 209;
        this.b = 56;
        this.alpha = Math.random() * 0.12 + 0.04; // Muy bajo (4-16%)
      } else {
        // Gris normal
        this.r = Math.floor(Math.random() * 60 + 160);
        this.g = this.r;
        this.b = this.r + 10;
        this.alpha = Math.random() * 0.3 + 0.1;
      }
      
      this.baseAlpha = this.alpha;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      const dx = (mouseX * window.innerWidth) - this.x;
      const dy = (mouseY * window.innerHeight) - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 120) {
        this.alpha = Math.min(this.baseAlpha + 0.15, 0.35);
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * 2.5;
        this.y -= Math.sin(angle) * 2.5;
      } else {
        this.alpha = this.baseAlpha;
      }
      
      if (this.x < -50) this.x = window.innerWidth + 50;
      if (this.x > window.innerWidth + 50) this.x = -50;
      if (this.y < -50) this.y = window.innerHeight + 50;
      if (this.y > window.innerHeight + 50) this.y = -50;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
      ctx.fill();
      
      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(200, 200, 210, 0.2)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    ctx.fillStyle = '#303232';
    ctx.fillRect(0, 0, w, h);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    animId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });
  draw();
}