class AssetLoader {
    constructor() {
        this.totalAssets  = 0;
        this.loadedAssets = 0;
        this.progressBar    = document.getElementById('progress-bar');
        this.progressText   = document.getElementById('progress-text');
        this.loadingScreen  = document.getElementById('loading-screen');

        this.imageSources = [
            ...document.querySelectorAll('img')
        ].map(img => img.src).filter(Boolean);

        this.fontFamilies = ['Poppins-Regular', 'Poppins-SemiBold'];
    }

    updateProgress() {
        const pct = Math.round((this.loadedAssets / this.totalAssets) * 100);
        if (this.progressBar)  this.progressBar.style.width  = pct + '%';
        if (this.progressText) this.progressText.textContent = pct + '%';
    }

    async loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve();
            };
            img.src = src;
        });
    }

    async loadFont(fontFamily) {
        return new Promise(resolve => {
            if (!document.fonts) {
                this.loadedAssets++;
                this.updateProgress();
                return resolve();
            }
            document.fonts.ready
                .then(() => {
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve();
                })
                .catch(() => {
                    this.loadedAssets++;
                    this.updateProgress();
                    resolve();
                });
        });
    }

    async loadStylesheets() {
        const sheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of sheets) {
            await new Promise(resolve => {
                if (link.sheet) {
                    this.loadedAssets++;
                    this.updateProgress();
                    return resolve();
                }
                link.addEventListener('load',  () => { this.loadedAssets++; this.updateProgress(); resolve(); });
                link.addEventListener('error', () => { this.loadedAssets++; this.updateProgress(); resolve(); });
            });
        }
    }

    async loadAllAssets() {
        const sheetCount = document.querySelectorAll('link[rel="stylesheet"]').length;
        this.totalAssets = this.imageSources.length + this.fontFamilies.length + sheetCount;

        if (this.totalAssets === 0) { this.totalAssets = 1; this.loadedAssets = 1; this.updateProgress(); return; }

        await this.loadStylesheets();
        for (const font of this.fontFamilies) await this.loadFont(font);
        await Promise.all(this.imageSources.map(src => this.loadImage(src)));
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        this.loadingScreen.classList.add('hidden');
        document.body.classList.remove('loading');
        setTimeout(() => { this.loadingScreen.style.display = 'none'; }, 500);
    }

    async init() {
        try {
            await this.loadAllAssets();
        } catch (err) {
            console.error('AssetLoader error:', err);
        } finally {
            this.hideLoadingScreen();
            initPage();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AssetLoader().init());
} else {
    new AssetLoader().init();
}

function initPage() {

    const tTrack = document.getElementById('tTrack');
    if (tTrack) {
        const slides = Array.from(tTrack.children);
        const tTotal = slides.length;
        let tCurrent = 0;

        slides[0].classList.add('active');

        window.tGoTo = function(n) {
            slides[tCurrent].classList.remove('active');
            tCurrent = (n + tTotal) % tTotal;
            slides[tCurrent].classList.add('active');
        };
        window.tMove = function(dir) { tGoTo(tCurrent + dir); };
    }

    const hamburger         = document.getElementById('navHamburger');
    const mobileMenu        = document.getElementById('mobileMenu');
    const mobileMenuClose   = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileDropdownBtn = document.getElementById('mobileDropdownBtn');
    const mobileSubmenu     = document.getElementById('mobileSubmenu');

    function openMenu() {
        mobileMenu.classList.add('open');
        mobileMenuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        mobileMenu.classList.remove('open');
        mobileMenuOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (hamburger)         hamburger.addEventListener('click', openMenu);
    if (mobileMenuClose)   mobileMenuClose.addEventListener('click', closeMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);

    if (mobileDropdownBtn && mobileSubmenu) {
        mobileDropdownBtn.addEventListener('click', () => {
            const parent = mobileDropdownBtn.closest('.mobile-dropdown');
            const isOpen = parent.classList.contains('open');
            parent.classList.toggle('open', !isOpen);
            mobileSubmenu.classList.toggle('open', !isOpen);
        });
    }

    const CHAR_DELAY  = 0.018;
    const LINE_OFFSET = 0.055;

    function buildCharLine(lineEl, baseDelay) {
        const rawText = lineEl.dataset.text ?? lineEl.textContent;
        lineEl.textContent = '';
        [...rawText].forEach((char, i) => {
            const isSpace = char === ' ';
            const clip    = document.createElement('span');
            clip.className = 'char-clip' + (isSpace ? ' is-space' : '');
            const inner   = document.createElement('span');
            inner.className = 'char';
            inner.textContent = isSpace ? '\u00A0' : char;
            inner.style.transitionDelay = `${(baseDelay + i * CHAR_DELAY).toFixed(3)}s`;
            clip.appendChild(inner);
            lineEl.appendChild(clip);
        });
    }

    function processLines(lines) {
        lines.forEach((el, idx) => buildCharLine(el, idx * LINE_OFFSET));
    }

    const parentMap = new Map();
    document.querySelectorAll('.char-line').forEach(el => {
        if (!parentMap.has(el.parentElement)) parentMap.set(el.parentElement, []);
        parentMap.get(el.parentElement).push(el);
    });
    parentMap.forEach(lines => processLines(lines));

    const REVEAL_SELECTORS = [
        'main img:not(.badge-img):not(.no-reveal)',
        'main .p-r-2-card',
        'main .p-c-1-text-container > div',
        'main .p-c-1-img-container',
        'main .p-c-2-img-container',
        'main .n-n-1-left .img-container',
        'main .n-n-1-right .img-container',
        'main h2',
        'main h3',
        'main p:not(.t-name):not(.t-role):not(.t-quote):not(.t-title)',
        'main .a-button',
        'main #nilai-nilai .n-n-2 li',
        'main .t-title',
        'main .t-quote',
        'main .t-author',
        'main .rounded',
        'main #pengantar .p-r-1 .p-c-2 > div:first-child',
    ];

    const STAGGER_PARENTS = ['.p-r-2', '.p-c-1-text-container', '#nilai-nilai .n-n-2 ul'];
    const STAGGER_DELAY   = 0.10;

    function initReveal() {
        const seen = new Set();
        document.querySelectorAll('.char-line').forEach(el => seen.add(el));

        const revealEls = [];

        REVEAL_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (seen.has(el)) return;
                if (el.closest('nav') || el.closest('footer')) return;
                if (el.classList.contains('char-line') || el.closest('.char-line')) return;
                if (el.closest('#jumbotron') && el.classList.contains('a-button')) return;
                if (el.closest('.p-r-2-card') && !el.classList.contains('p-r-2-card')) return;
                if (el.closest('.t-slide') && !el.classList.contains('t-slide')) return;
                if (el.closest('.cc-image') && !el.classList.contains('cc-image')) return;
                if (el.classList.contains('scroll-zoom-img')) return;

                seen.add(el);
                el.classList.add('sr');
                if (el.tagName === 'IMG') el.classList.add('sr-img');
                if (el.classList.contains('p-r-2-card')) el.classList.add('sr-card');
                revealEls.push(el);
            });
        });

        STAGGER_PARENTS.forEach(parentSel => {
            document.querySelectorAll(parentSel).forEach(parent => {
                [...parent.children]
                    .filter(c => c.classList.contains('sr'))
                    .forEach((child, i) => {
                        child.style.transitionDelay = `${(i * STAGGER_DELAY).toFixed(2)}s`;
                    });
            });
        });

        const charObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    charObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

        document.querySelectorAll('.char-line').forEach(el => charObserver.observe(el));

        const srObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    srObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        revealEls.forEach(el => srObserver.observe(el));
    }

    initReveal();

    const zoomWraps = document.querySelectorAll('.scroll-zoom-wrap');

    const zoomBase = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--zoom-base') || '1'
    );
    const zoomIn = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--zoom-in') || '1.12'
    );

    function updateZoom() {
        const vh = window.innerHeight;

        zoomWraps.forEach(wrap => {
            const img = wrap.querySelector('.scroll-zoom-img');
            if (!img) return;

            const rect = wrap.getBoundingClientRect();
            /* progress: 0 = element bottom just entered viewport bottom,
                         1 = element top has reached viewport top */
            const progress = 1 - (rect.top / vh);
            const clamped  = Math.min(Math.max(progress, 0), 1);
            const scale    = zoomBase + (zoomIn - zoomBase) * clamped;

            img.style.transform = `scale(${scale.toFixed(4)})`;
        });
    }

    const PARALLAX_SPEED = 0.15;

    const parallaxLeftContainers  = document.querySelectorAll('#nilai-nilai .n-n-1-left .img-container');
    const parallaxRightContainers = document.querySelectorAll('#nilai-nilai .n-n-1-right .img-container');

    function updateParallax() {
        const section = document.querySelector('#nilai-nilai .n-n-1');
        if (!section) return;

        const rect     = section.getBoundingClientRect();
        const vh       = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset   = (progress - 0.5) * vh * PARALLAX_SPEED;

        parallaxLeftContainers.forEach(el  => { el.style.transform = `translateY(${offset}px)`; });
        parallaxRightContainers.forEach(el => { el.style.transform = `translateY(${-offset}px)`; });
    }

    window.addEventListener('scroll', () => { updateZoom(); updateParallax(); }, { passive: true });
    window.addEventListener('resize', () => { updateZoom(); updateParallax(); }, { passive: true });
    updateZoom();
    updateParallax();
}