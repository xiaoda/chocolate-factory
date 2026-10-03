'use strict';

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('.process-card').forEach(card => {
      card.hidden = category !== 'all' && category !== card.dataset.category;
      if (!card.hidden) count++;
    });
    document.querySelector('.filter-status').textContent = `${count} 条阅读路线`;
  });
});

const dialog = document.querySelector('#photo-dialog');
let opener = null;
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const caption = link.dataset.caption;
      const image = dialog.querySelector('img');
      image.src = link.href;
      image.alt = caption;
      document.querySelector('#dialog-caption').textContent = caption;
      document.querySelector('#photo-original').href = link.href;
      dialog.showModal();
      document.body.classList.add('dialog-open');
      document.querySelector('#close-photo').focus();
    });
  });
  document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    opener?.focus({preventScroll: true});
  });
}

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...document.querySelectorAll('.sources details')].map(el => [el, el.open]);
  printDetails.forEach(([el]) => { el.open = true; });
  document.querySelectorAll('img[src]').forEach(el => { el.loading = 'eager'; });
});
window.addEventListener('afterprint', () => {
  printDetails.forEach(([el, wasOpen]) => { el.open = wasOpen; });
  printDetails = [];
});
// 支持浏览器“查找”和正文资料锚点：指向折叠来源时先展开。
function revealTarget() {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  const parent = target.closest('details');
  if (parent && !parent.open) {
    parent.open = true;
    target.scrollIntoView();
  }
}
window.addEventListener('hashchange', revealTarget);
revealTarget();

let ticking = false;
function updateReading() {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('#reading-progress').style.width = `${max > 0 ? Math.min(100, scrollY/max*100) : 0}%`;
  const links = [...document.querySelectorAll('.step-nav a')];
  let current = null;
  links.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section && section.getBoundingClientRect().top <= 160) current = link;
  });
  links.forEach(link => {
    if (link === current) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(updateReading); ticking = true; }
}, {passive:true});
window.addEventListener('resize', updateReading);
window.addEventListener('load', updateReading);
