// Ultimate Cricket Academy — shared site behavior
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Loading screen ---------- */
  var loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () { loader.classList.add('hide'); }, 350);
    });
    // Fallback in case 'load' already fired
    setTimeout(function () { loader.classList.add('hide'); }, 1800);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var scrim = document.querySelector('.nav-scrim');
  function closeNav () {
    links && links.classList.remove('open');
    scrim && scrim.classList.remove('show');
    toggle && toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      scrim && scrim.classList.toggle('show', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    scrim && scrim.addEventListener('click', closeNav);
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ---------- Active nav link ---------- */
  var current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Counter animation (scoreboard stats) ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;
    function step (ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 500);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Gallery filter ---------- */
  var tabs = document.querySelectorAll('.filter-tabs button');
  var tiles = document.querySelectorAll('[data-category]');
  if (tabs.length && tiles.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var filter = tab.getAttribute('data-filter');
        tiles.forEach(function (tile) {
          var show = (filter === 'all' || tile.getAttribute('data-category') === filter);
          tile.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Testimonial slider (simple) ---------- */
  var slider = document.querySelector('.testi-slider');
  if (slider) {
    var track = slider.querySelector('.testi-track');
    var slides = slider.querySelectorAll('.testi-slide');
    var prev = slider.querySelector('.testi-prev');
    var next = slider.querySelector('.testi-next');
    var dotsWrap = slider.querySelector('.testi-dots');
    var index = 0;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }
    function updateDots () {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('button').forEach(function (d, i) {
        d.classList.toggle('active', i === index);
      });
    }
    function goTo (i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      updateDots();
    }
    prev && prev.addEventListener('click', function () { goTo(index - 1); });
    next && next.addEventListener('click', function () { goTo(index + 1); });
    updateDots();
  }

  /* ---------- Form validation (Admissions + Contact) ---------- */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var success = form.querySelector('.form-success');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var ok = input.value.trim().length > 0;
        if (input.type === 'email' && ok) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        }
        if (input.type === 'tel' && ok) {
          ok = /^[0-9+\-\s()]{7,}$/.test(input.value.trim());
        }
        if (field) field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (valid) {
        var waNumber = form.getAttribute('data-whatsapp');
        if (waNumber) {
          var lines = [];
          form.querySelectorAll('[data-wa-label]').forEach(function (input) {
            var val = input.value.trim();
            if (val) lines.push(input.getAttribute('data-wa-label') + ': ' + val);
          });
          var pageSource = document.title.replace(/\s*\|.*$/, '');
          var text = 'New enquiry from website (' + pageSource + ')%0A%0A' +
            lines.map(function (l) { return encodeURIComponent(l); }).join('%0A');
          var waUrl = 'https://wa.me/' + waNumber + '?text=' + text;
          window.open(waUrl, '_blank');
        }
        form.reset();
        if (success) {
          success.classList.add('show');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
    form.querySelectorAll('[required]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});
