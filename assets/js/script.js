const tTrack = document.getElementById('tTrack');
const tTotal = tTrack.children.length;
let tCurrent = 0;

function tGoTo(n) {
    tCurrent = (n + tTotal) % tTotal;
    tTrack.style.transform = 'translateX(-' + (tCurrent * 100) + '%)';
}

function tMove(dir) {
    tGoTo(tCurrent + dir);
}

const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileDropdownBtn = document.getElementById('mobileDropdownBtn');
const mobileSubmenu = document.getElementById('mobileSubmenu');

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

hamburger.addEventListener('click', openMenu);
mobileMenuClose.addEventListener('click', closeMenu);
mobileMenuOverlay.addEventListener('click', closeMenu);

mobileDropdownBtn.addEventListener('click', () => {
    const parent = mobileDropdownBtn.closest('.mobile-dropdown');
    const isOpen = parent.classList.contains('open');
    parent.classList.toggle('open', !isOpen);
    mobileSubmenu.classList.toggle('open', !isOpen);
});

const CHAR_DELAY = 0.018;
const LINE_OFFSET = 0.055;

function buildCharLine(lineEl, baseDelay) {
    const rawText = lineEl.dataset.text ?? lineEl.textContent;
    lineEl.textContent = '';
    [...rawText].forEach((char, i) => {
        const isSpace = char === ' ';
        const clip = document.createElement('span');
        clip.className = 'char-clip' + (isSpace ? ' is-space' : '');
        const inner = document.createElement('span');
        inner.className = 'char';
        inner.textContent = isSpace ? '\u00A0' : char;
        inner.style.transitionDelay = `${(baseDelay + i * CHAR_DELAY).toFixed(3)}s`;
        clip.appendChild(inner);
        lineEl.appendChild(clip);
    });
}

function processLines(lines) {
    lines.forEach((el, lineIdx) => buildCharLine(el, lineIdx * LINE_OFFSET));
}

const parentMap = new Map();
document.querySelectorAll('.char-line').forEach(el => {
    if (!parentMap.has(el.parentElement))
        parentMap.set(el.parentElement, []);
    parentMap.get(el.parentElement).push(el);
});
parentMap.forEach(lines => processLines(lines));

const style = document.createElement('style');
style.textContent = `
.sr {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1),
                transform 0.65s cubic-bezier(0.16,1,0.3,1);
    will-change: transform, opacity;
}
.sr.sr-img {
    transform: translateY(48px) scale(0.97);
    transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1),
                transform 0.75s cubic-bezier(0.16,1,0.3,1);
}
.sr.sr-card {
    transform: translateY(56px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.sr.in-view {
    opacity: var(--sr-opacity, 1);
    transform: translateY(0) scale(1) !important;
}
`;
document.head.appendChild(style);

const REVEAL_SELECTORS = [
    'main img',
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
    'main .t-arrows',
    'main #pengantar .p-r-1 .p-c-2 > div:first-child',
];

const STAGGER_PARENTS = [
    '.p-r-2',
    '.p-c-1-text-container',
    '#nilai-nilai .n-n-2 ul',
];

const STAGGER_DELAY = 0.10;

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
} else {
    initReveal();
}