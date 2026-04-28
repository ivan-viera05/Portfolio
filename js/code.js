function abrirPDF() {
    var urlPDF = 'others/IvanCV.pdf'; // Reemplaza 'ruta/del/archivo.pdf' con la URL del archivo PDF
    window.open(urlPDF, '_blank');
}



document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('header.site-header, section');
    const navLinks = document.querySelectorAll('nav a');

    function highlightNavLink() {
        let scrollPosition = window.scrollY;
        let windowHeight = window.innerHeight;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const center = top + height / 2;

            // Verificar si el centro de la sección está dentro del área visible de la ventana
            if (center >= scrollPosition && center <= scrollPosition + windowHeight) {
                let targetId = section.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${targetId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink();

    // Navbar effects: shadow on scroll and mobile menu toggle (supports both designs)
    const navbar = document.querySelector('nav.navbar-floating') || document.querySelector('nav.navbar-glass');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    const updateNavShadow = () => {
        if (!navbar) return;
        if (window.scrollY > 10) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    };
    updateNavShadow();
    window.addEventListener('scroll', updateNavShadow);

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('nav-open', isOpen);
        });

        // Close menu on link click (mobile)
        navMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('nav-open');
                }
            });
        });
    }

    // Projects: filter controls
    const controlsWrap = document.querySelector('.projects-controls');
    const filterBtns = document.querySelectorAll('.projects-controls .filter-btn');
    const projectItems = document.querySelectorAll('.projects-grid .project-item');
    const setActiveBtn = (btn) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
    const applyFilter = (filter) => {
        projectItems.forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('is-hidden', !match);
            // Also control display to collapse layout immediately
            item.style.display = match ? '' : 'none';
        });
    };
    // Delegate clicks to handle dynamic changes safely
    if (controlsWrap) {
        controlsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            setActiveBtn(btn);
            applyFilter(btn.dataset.filter || 'all');
        });
    }
    // Default filter
    if (filterBtns.length) {
        const active = document.querySelector('.projects-controls .filter-btn.active');
        applyFilter(active ? active.dataset.filter : 'all');
    }

    // Reveal on scroll for project cards
    const revealEls = document.querySelectorAll('.project-item');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal', 'in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));

    // Video modal: set/unset YouTube src on open/close
    const videoModal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoModal && videoPlayer) {
        videoModal.addEventListener('show.bs.modal', (event) => {
            const trigger = event.relatedTarget;
            const baseUrl = trigger?.getAttribute('data-video-src');
            if (baseUrl) {
                const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'autoplay=1';
                videoPlayer.src = url;
            }
        });
        videoModal.addEventListener('hidden.bs.modal', () => {
            videoPlayer.src = '';
        });
    }

    // Skills: filter controls and meters
    const skillsControls = document.querySelector('.skills-controls');
    const skillBtns = document.querySelectorAll('.skills-controls .skill-btn');
    const skillItems = document.querySelectorAll('.skills-grid .skill-item');

    const setActiveSkillBtn = (btn) => {
        skillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
    const applySkillsFilter = (filter) => {
        skillItems.forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('is-hidden', !match);
            item.style.display = match ? '' : 'none';
        });
    };
    // no level bars; nothing to initialize
    if (skillsControls) {
        skillsControls.addEventListener('click', (e) => {
            const btn = e.target.closest('.skill-btn');
            if (!btn) return;
            setActiveSkillBtn(btn);
            applySkillsFilter(btn.dataset.skillFilter || 'all');
        });
        // default filter
        const activeBtn = document.querySelector('.skills-controls .skill-btn.active');
        applySkillsFilter(activeBtn ? activeBtn.dataset.skillFilter : 'all');
        // safety: ensure after any late DOM changes (e.g., translations), everything shows
        setTimeout(() => applySkillsFilter('all'), 0);
    }

    // Header tech marquee: load from JSON and render icons dynamically
    const marqueeTrack = document.querySelector('.tech-marquee .marquee-track');
    const renderMarquee = (techs) => {
        if (!marqueeTrack) return;
        const container = document.querySelector('.tech-marquee');
        const baseHTML = techs.map(t => `<span class="tech-icon"><img src="${t.icon}" alt="${t.name}" loading="lazy"/></span>`).join('');
        // Build one group that is at least the width of the container, then duplicate the group
        if (!container) {
            marqueeTrack.innerHTML = baseHTML + baseHTML;
            return;
        }
        let groupHTML = baseHTML;
        marqueeTrack.innerHTML = groupHTML;
        // Ensure the group fills at least one viewport width (to avoid blank gap)
        let safety = 0;
        while (marqueeTrack.scrollWidth < container.clientWidth && safety < 10) {
            groupHTML += baseHTML;
            marqueeTrack.innerHTML = groupHTML;
            safety++;
        }
        marqueeTrack.innerHTML = groupHTML + groupHTML; // two equal halves for seamless -50% loop
    };
    // Full embedded list for file:// usage (when fetch is blocked)
    const embeddedTechs = [
        { name: '.NET', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
        { name: 'C#', icon: 'https://cdn.icon-icons.com/icons2/2415/PNG/512/csharp_plain_logo_icon_146577.png' },
        { name: 'ASP.NET Core', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
        { name: 'Entity Framework', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg' },
        { name: 'Angular', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/240px-Angular_full_color_logo.svg.png' },
        { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
        { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
        { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
        { name: 'Vue.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
        { name: 'Next.js', icon: 'https://www.vectorlogo.zone/logos/nextjs/nextjs-icon.svg' },
        { name: 'Sass', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg' },
        { name: 'Tailwind CSS', icon: 'https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg' },
        { name: 'Material UI', icon: 'https://www.vectorlogo.zone/logos/mui/mui-icon.svg' },
        { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
        { name: 'Express', icon: 'https://www.vectorlogo.zone/logos/expressjs/expressjs-icon.svg' },
        { name: 'NestJS', icon: 'https://www.vectorlogo.zone/logos/nestjs/nestjs-icon.svg' },
        { name: 'GraphQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg' },
        { name: 'Apollo', icon: 'https://avatars.githubusercontent.com/u/17189275?s=200&v=4' },
        { name: 'SQL Server', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968364.png' },
        { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
        { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
        { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
        { name: 'Prisma', icon: 'https://www.vectorlogo.zone/logos/prismaio/prismaio-icon.svg' },
        { name: 'Sequelize', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg' },
        { name: 'Redis', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
        { name: 'Kafka', icon: 'https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-icon.svg' },
        { name: 'RabbitMQ', icon: 'https://www.vectorlogo.zone/logos/rabbitmq/rabbitmq-icon.svg' },
        { name: 'Nginx', icon: 'https://www.vectorlogo.zone/logos/nginx/nginx-icon.svg' },
        { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
        { name: 'Kubernetes', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
        { name: 'Azure', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
        { name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg' },
        { name: 'Firebase', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg' },
        { name: 'Azure DevOps', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
        { name: 'Jenkins', icon: 'https://www.vectorlogo.zone/logos/jenkins/jenkins-icon.svg' },
        { name: 'GitLab CI', icon: 'https://www.vectorlogo.zone/logos/gitlab/gitlab-icon.svg' },
        { name: 'Jest', icon: 'https://www.vectorlogo.zone/logos/jestjsio/jestjsio-icon.svg' },
        { name: 'Cypress', icon: 'https://www.vectorlogo.zone/logos/cypressio/cypressio-icon.svg' },
        { name: 'Playwright', icon: 'https://playwright.dev/img/playwright-logo.svg' },
        { name: 'Vitest', icon: 'https://vitest.dev/logo.svg' },
        { name: 'Vite', icon: 'https://www.vectorlogo.zone/logos/vitejsdev/vitejsdev-icon.svg' },
        { name: 'Webpack', icon: 'https://www.vectorlogo.zone/logos/js_webpack/js_webpack-icon.svg' },
        { name: 'Babel', icon: 'https://www.vectorlogo.zone/logos/babeljs/babeljs-icon.svg' },
        { name: 'ESLint', icon: 'https://www.vectorlogo.zone/logos/eslint/eslint-icon.svg' },
        { name: 'Prettier', icon: 'https://prettier.io/icon.png' },
        { name: 'Camunda BPM', icon: 'https://camunda.com/wp-content/uploads/camunda/blog-images/Social-Media-Favicon.jpg' },
        { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
        { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
        { name: 'Postman', icon: 'https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg' }
    ];
    (async () => {
        try {
            const isHttp = /^https?:/.test(location.protocol);
            if (isHttp) {
                const res = await fetch('assets/techs.json', { cache: 'no-cache' });
                if (!res.ok) throw new Error('Failed to load techs.json');
                const techs = await res.json();
                renderMarquee(Array.isArray(techs) && techs.length ? techs : embeddedTechs);
            } else {
                // When opened as file://, use the embedded list
                renderMarquee(embeddedTechs);
            }
        } catch (e) {
            renderMarquee(embeddedTechs);
        }
    })();
});

// Mobile: inject a small "more info" button on project cards that toggles the info panel
(function initProjectMobileToggles() {
    const mq = () => window.matchMedia('(max-width: 768px)').matches;

    function updateButtonIcon(btn, isOpen) {
        const icon = btn.querySelector('i');
        if (icon) {
            if (isOpen) {
                icon.className = 'bi bi-x-lg';
                btn.setAttribute('aria-label', 'Cerrar información');
            } else {
                icon.className = 'bi bi-info-lg';
                btn.setAttribute('aria-label', 'Más información');
            }
        }
    }

    function addButtons() {
        document.querySelectorAll('.project-card.v4').forEach(card => {
            // already has a button?
            if (card.querySelector('.pc-more-btn')) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pc-more-btn';
            btn.setAttribute('aria-label', 'Más información');
            btn.innerHTML = '<i class="bi bi-info-lg"></i>';
            card.appendChild(btn);

            // Update icon based on initial state
            updateButtonIcon(btn, card.classList.contains('is-open'));

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const isCurrentlyOpen = card.classList.contains('is-open');
                if (isCurrentlyOpen) {
                    card.classList.remove('is-open');
                    updateButtonIcon(btn, false);
                } else {
                    card.classList.add('is-open');
                    updateButtonIcon(btn, true);
                }
            });
        });
    }

    function removeButtons() {
        document.querySelectorAll('.pc-more-btn').forEach(b => b.remove());
        document.querySelectorAll('.project-card.v4.is-open').forEach(c => c.classList.remove('is-open'));
    }

    // debounce helper
    function debounce(fn, ms) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    function manage() {
        if (mq()) addButtons(); else removeButtons();
    }

    // run on load and when resizing/orientation change
    document.addEventListener('DOMContentLoaded', manage);
    window.addEventListener('resize', debounce(manage, 150));
    window.addEventListener('orientationchange', debounce(manage, 150));
})();










// Attach game controls safely (guard for scripts running before DOM ready)
(function attachGameListeners() {
    const mibotonEl = document.getElementById("miboton");
    if (mibotonEl) {
        mibotonEl.addEventListener("click", function () {
            if (document.readyState === "complete" || document.readyState === "interactive") {
                Init();
            } else {
                document.addEventListener("DOMContentLoaded", Init);
            }
        });
    } else {
        // Fallback: attach after DOMContentLoaded if element appears later
        document.addEventListener("DOMContentLoaded", function () {
            const el = document.getElementById("miboton");
            if (el) el.addEventListener("click", Init);
        });
    }

    const reiniciarEl = document.getElementById("reiniciarBoton");
    if (reiniciarEl) {
        reiniciarEl.addEventListener("click", function () {
            score = 0;
            ReiniciarJuego();
        });
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            const el = document.getElementById("reiniciarBoton");
            if (el) el.addEventListener("click", function () {
                score = 0;
                ReiniciarJuego();
            });
        });
    }

    // Global input handlers (safe to register now)
    document.addEventListener("keydown", HandleKeyDown);
    document.addEventListener("touchstart", HandleTouchStart);
})();

function HandleTouchStart(ev) {
    Saltar();
}

var contadorReinicios = 0;

//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

function Init() {
    if (!contenedor) {
        gameOver = document.querySelector(".game-over");
        suelo = document.querySelector(".suelo");
        contenedor = document.querySelector(".contenedor");
        textoScore = document.querySelector(".score");
        dino = document.querySelector(".dino");
    }
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280 / 3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if (parado) return;

    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev) {
    if (ev.keyCode == 32) {
        Saltar();
    }
}

function Saltar() {
    if (dinoPosY === sueloY) {
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if (dinoPosY < sueloY) {
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY + "px";
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if (saltando) {
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if (Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";

    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if (score == 5) {
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    } else if (score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if (score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3 / gameVel) + "s";
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            break;
        } else {
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function ReiniciarJuego() {
    time = new Date();
    velY = 0;
    dinoPosX = 42;
    dinoPosY = sueloY;
    sueloX = 0;
    gameVel = 1;
    score = 0;
    parado = false;
    saltando = false;
    tiempoHastaObstaculo = 2;
    tiempoHastaNube = 0.5;

    for (var i = 0; i < obstaculos.length; i++) {
        contenedor.removeChild(obstaculos[i]);
    }
    obstaculos = [];
    for (var i = 0; i < nubes.length; i++) {
        contenedor.removeChild(nubes[i]);
    }
    nubes = [];

    gameOver.style.display = "none";
    suelo.style.left = "0px";
    suelo.style.animationDuration = "3s";
    contenedor.classList.remove("mediodia", "tarde", "noche");

    Init();
}

//Proyectos
function changeImage(src) {
    document.getElementById('mainImage').src = src;
}



// Controlar velocidad del carrusel de bomberos - Versión simplificada y robusta
(function initBomberosCarousel() {
    const bomberosModal = document.getElementById('bomberosCarouselModal');
    const bomberosCarousel = document.getElementById('bomberosCarousel');

    if (!bomberosModal || !bomberosCarousel) return;

    let carouselInstance = null;
    let transitionInterval = null;

    // Función para aplicar transición más rápida
    function applySlowTransition() {
        const carouselInner = bomberosCarousel.querySelector('.carousel-inner');
        const carouselItems = bomberosCarousel.querySelectorAll('.carousel-item');

        if (carouselInner) {
            carouselInner.style.transition = 'transform 0.5s ease-in-out';
        }

        carouselItems.forEach(item => {
            item.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
        });
    }

    // Función para aplicar transición lenta de forma forzada
    function forceSlowTransition() {
        const carouselInner = bomberosCarousel.querySelector('.carousel-inner');
        const carouselItems = bomberosCarousel.querySelectorAll('.carousel-item');

        if (carouselInner) {
            carouselInner.style.transition = 'transform 0.5s ease-in-out !important';
            carouselInner.style.setProperty('transition', 'transform 0.5s ease-in-out', '!important');
        }

        carouselItems.forEach(item => {
            item.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out !important';
            item.style.setProperty('transition', 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out', '!important');
        });
    }

    // Inicializar carrusel cuando se abre el modal
    bomberosModal.addEventListener('shown.bs.modal', function () {
        // Inicializar carrusel de Bootstrap
        if (!carouselInstance) {
            carouselInstance = new bootstrap.Carousel(bomberosCarousel, {
                interval: false,
                ride: false,
                touch: true,
                wrap: true
            });
        }

        applySlowTransition();

        // Aplicar transición lenta periódicamente
        transitionInterval = setInterval(applySlowTransition, 50);
    });

    // Limpiar cuando se cierra el modal
    bomberosModal.addEventListener('hidden.bs.modal', function () {
        if (transitionInterval) {
            clearInterval(transitionInterval);
            transitionInterval = null;
        }
    });

    // Aplicar transición lenta en eventos del carrusel
    bomberosCarousel.addEventListener('slide.bs.carousel', applySlowTransition);
    bomberosCarousel.addEventListener('slid.bs.carousel', function () {
        applySlowTransition();
        setTimeout(applySlowTransition, 10);
    });

    // Aplicar a controles e indicadores
    const prevBtn = bomberosCarousel.querySelector('.carousel-control-prev');
    const nextBtn = bomberosCarousel.querySelector('.carousel-control-next');
    const indicators = bomberosCarousel.querySelectorAll('.carousel-indicators button');

    [prevBtn, nextBtn, ...indicators].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', applySlowTransition);
        }
    });
})();

