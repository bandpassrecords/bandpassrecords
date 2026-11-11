/*
 * Renders the site from data.js in the language picked from i18n.js.
 *
 * One script for every page: it fills whichever containers the page has.
 *   every page         the nav's drop-down menus ([data-menu-panel]), #social
 *   home               #hero-news, #stats, #pillars, #latest, #featured
 *   discography/       #artists, #years, #releases (filters kept in the URL:
 *                      ?artist=high-sense&year=2022, so a view can be shared)
 *   software/          [data-projects="music"], [data-projects="other"]
 *
 * <html data-base> is the path from the page back to the site root ("" on
 * the home page, "../" one folder down); every image and page link is built
 * from it. <body data-page> names the page for its title and description.
 * Language and palette are remembered in this browser.
 */
(function () {
  'use strict';

  var DATA = window.BPR;
  var STRINGS = window.BPR_I18N;
  var LANGS = ['en', 'pt', 'es'];
  var STATUS_ORDER = ['published', 'development', 'archived'];
  var root = document.documentElement;
  var BASE = root.dataset.base || '';
  var PAGE = document.body.dataset.page || 'home';

  var state = { lang: 'en', artist: '', year: '' };

  /* ---------- helpers ---------- */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function recall(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* Translate a key; {name} placeholders come from vars, and vars.n === 1
     picks the key's _one form when there is one. */
  function t(key, vars) {
    vars = vars || {};
    var table = STRINGS[state.lang] || STRINGS.en;
    var k = vars.n === 1 && (key + '_one') in table ? key + '_one' : key;
    var s = k in table ? table[k] : k in STRINGS.en ? STRINGS.en[k] : key;
    return s.replace(/\{(\w+)\}/g, function (_, v) { return v in vars ? vars[v] : ''; });
  }

  /* Text written as { en, pt, es } in data.js, or a plain string. */
  function loc(value) {
    if (!value || typeof value === 'string') return value || '';
    return value[state.lang] || value.en || '';
  }

  function list(items) {
    try {
      return new Intl.ListFormat(state.lang, { type: 'conjunction' }).format(items);
    } catch (e) {
      return items.join(', ');
    }
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T12:00:00');
    try {
      return new Intl.DateTimeFormat(state.lang, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
    } catch (e) {
      return iso;
    }
  }

  /* Brand marks from icons.js, drawn inline in the text colour. (Not CSS
     masks or <img>: a page opened as a file may not load those.) */
  function icon(name) {
    var d = (window.BPR_ICONS || {})[name];
    return d ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>' : '';
  }

  /* Opened as a file (file://), a link to "discography/" shows the folder
     instead of its page, so point folder links at their index.html. Served
     over http(s), as on GitHub Pages, links stay as written. */
  var AS_FILE = location.protocol === 'file:';

  function fixFileLinks() {
    if (!AS_FILE) return;
    $$('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (/^[a-z]+:|^\/\//i.test(href)) return; // external, mailto:
      var m = href.match(/^([^?#]*)(.*)$/);
      var path = m[1];
      if (path === '' || path === '.' || path === './') path = './';
      if (path.slice(-1) === '/') a.setAttribute('href', path + 'index.html' + m[2]);
    });
  }

  function cover(r) { return BASE + 'images/releases/' + r.id + '.jpg'; }

  function yearOf(r) { return r.date.slice(0, 4); }

  var releases = DATA.releases.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });

  function releasesBy(artistSlug) {
    return releases.filter(function (r) { return !artistSlug || slug(r.artist) === artistSlug; });
  }

  function yearSpan(items) {
    var years = items.map(yearOf);
    if (!years.length) return '';
    var first = years[years.length - 1], last = years[0];
    return first === last ? first : first + '–' + last;
  }

  function projectsIn(group) {
    return DATA.projects.filter(function (p) { return p.group === group; });
  }

  /* Where a project leads: its own site (or download page) when it is
     online, otherwise its card on the software page. */
  function projectHref(p) {
    return p.url && p.live !== false ? p.url : BASE + 'software/#' + p.id;
  }

  function projectIcon(p, cls) {
    if (p.icon) return '<img class="' + cls + '" src="' + BASE + 'images/products/' + esc(p.icon) + '" alt="" loading="lazy" width="56" height="56">';
    var initials = p.name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2);
    return '<span class="' + cls + ' project-icon--letter" aria-hidden="true">' + esc(initials) + '</span>';
  }

  /* ---------- language ---------- */

  function pickLanguage() {
    var asked = new URLSearchParams(location.search).get('lang') || recall('bpr-lang');
    if (LANGS.indexOf(asked) !== -1) return asked;
    var nav = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < nav.length; i++) {
      var base = String(nav[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(base) !== -1) return base;
    }
    return 'en';
  }

  function applyStaticText() {
    root.lang = state.lang;
    var suffix = PAGE === 'home' ? '' : '.' + PAGE;
    document.title = t('meta.title' + suffix);
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description' + suffix));

    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(',').forEach(function (pair) {
        var parts = pair.split(':');
        el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
    $$('[data-lang-choice]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.langChoice === state.lang));
    });
  }

  /* ---------- nav menus ---------- */

  function menuRow(href, media, title, sub) {
    return '<a class="menu-row" href="' + esc(href) + '">' + media +
      '<span><b>' + esc(title) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></a>';
  }

  function renderMenus() {
    var disc = $('[data-menu-panel="discography"]');
    if (disc) {
      disc.innerHTML =
        '<div class="menu-col">' +
          menuRow(BASE + 'discography/', '<span class="menu-media menu-media--logo"><img src="' + BASE + 'images/logo.svg" alt=""></span>',
            t('menu.allReleases'), t('artist.releases', { n: releases.length }) + ' · ' + yearSpan(releases)) +
          DATA.artists.map(function (a) {
            var own = releasesBy(slug(a.name));
            return menuRow(BASE + 'discography/?artist=' + slug(a.name),
              own[0] ? '<img class="menu-media" src="' + cover(own[0]) + '" alt="" loading="lazy">' : '',
              a.name, t('artist.releases', { n: own.length }) + ' · ' + yearSpan(own));
          }).join('') +
        '</div>';
    }

    var soft = $('[data-menu-panel="software"]');
    if (soft) {
      var col = function (group, titleKey) {
        return '<div class="menu-col"><p class="menu-label">' + esc(t(titleKey)) + '</p>' +
          projectsIn(group).map(function (p) {
            return menuRow(projectHref(p), projectIcon(p, 'menu-media'), p.name, loc(p.tagline));
          }).join('') + '</div>';
      };
      soft.innerHTML =
        '<div class="menu-cols">' + col('music', 'menu.forMusic') + col('other', 'menu.beyond') + '</div>' +
        '<a class="menu-foot" href="' + BASE + 'software/">' + esc(t('menu.allSoftware')) + ' →</a>';
    }
  }

  function closeMenus(except) {
    $$('.nav-item.open').forEach(function (item) {
      if (item === except) return;
      item.classList.remove('open');
      item.querySelector('.nav-caret').setAttribute('aria-expanded', 'false');
    });
  }

  function setMobileMenu(open) {
    var nav = $('.navbar');
    var toggle = $('.menu-toggle');
    if (!nav || !toggle) return;
    // The panel fills the screen below the bar, and the page behind stays put.
    nav.style.setProperty('--nav-bottom', nav.getBoundingClientRect().bottom + 'px');
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
  }

  /* ---------- home ---------- */

  function renderHero() {
    var latest = releases[0];
    var news = $('#hero-news');
    if (latest && news) {
      news.querySelector('span').textContent = latest.title + ' · ' + latest.artist;
      news.href = BASE + 'discography/?artist=' + slug(latest.artist);
      news.hidden = false;
    }

    var stats = $('#stats');
    if (!stats) return;
    var tracks = releases.reduce(function (n, r) { return n + r.tracks.length; }, 0);
    stats.innerHTML = [
      [releases.length, 'stat.releases'],
      [DATA.artists.length, 'stat.artists'],
      [tracks, 'stat.tracks'],
      [DATA.projects.length, 'stat.projects'],
    ].map(function (s) {
      return '<div><dt>' + esc(t(s[1])) + '</dt><dd>' + s[0] + '</dd></div>';
    }).join('');
  }

  function renderPillars() {
    var host = $('#pillars');
    if (!host) return;
    var music = projectsIn('music');
    var other = projectsIn('other');
    var pillar = function (href, media, titleKey, text, ctaKey) {
      return '<a class="tile pillar" href="' + href + '">' +
        '<div class="pillar-media" aria-hidden="true">' + media + '</div>' +
        '<div><h3>' + esc(t(titleKey)) + '</h3><p>' + esc(text) + '</p>' +
        '<span class="pillar-cta">' + esc(t(ctaKey)) + ' <span aria-hidden="true">→</span></span></div></a>';
    };
    host.innerHTML =
      pillar(BASE + 'discography/',
        releases.slice(0, 3).map(function (r) { return '<img src="' + cover(r) + '" alt="" loading="lazy">'; }).join(''),
        'pillar.label', t('home.disc.text', { n: releases.length, artists: list(DATA.artists.map(function (a) { return a.name; })) }), 'pillar.label.cta') +
      pillar(BASE + 'software/#music',
        music.slice(0, 3).map(function (p) { return projectIcon(p, 'pillar-icon'); }).join(''),
        'pillar.music', t('pillar.music.text', { n: music.length }), 'pillar.music.cta') +
      pillar(BASE + 'software/#other',
        other.slice(0, 3).map(function (p) { return projectIcon(p, 'pillar-icon'); }).join(''),
        'pillar.apps', t('pillar.apps.text', { n: other.length }), 'pillar.apps.cta');
  }

  function renderLatest() {
    var host = $('#latest');
    if (!host || !releases[0]) return;
    var r = releases[0];
    $('#latest-title').textContent = r.title;
    host.innerHTML =
      '<article class="latest">' +
        '<img class="latest-cover" src="' + cover(r) + '" alt="' + esc(t('release.cover', { title: r.title, artist: r.artist })) + '" width="480" height="480">' +
        '<div class="latest-body">' +
          '<p class="release-meta">' + esc(t('release.' + r.type)) + ' · <time datetime="' + r.date + '">' + esc(formatDate(r.date)) + '</time>' + (r.catalog ? ' · ' + esc(r.catalog) : '') + '</p>' +
          '<p class="latest-artist">' + esc(r.artist) + '</p>' +
          '<ol class="tracklist latest-tracks" aria-label="' + esc(t('release.tracklist')) + '">' +
            r.tracks.map(function (tr) { return '<li>' + esc(tr.title) + (tr.artist ? ' <small>· ' + esc(tr.artist) + '</small>' : '') + '</li>'; }).join('') +
          '</ol>' +
          '<div class="latest-listen">' + listenLinks(r, true) + '</div>' +
        '</div>' +
      '</article>';
  }

  function renderFeatured() {
    var host = $('#featured');
    if (!host) return;
    // Everything not archived that has a page of its own to visit.
    var shown = DATA.projects.filter(function (p) {
      return p.status !== 'archived' && p.url && p.live !== false && !/github\.com/.test(p.url);
    });
    host.innerHTML = shown.map(function (p) {
      return '<a class="tile feat" href="' + esc(projectHref(p)) + '">' + projectIcon(p, 'feat-icon') +
        '<span><b>' + esc(p.name) + '</b><small>' + esc(loc(p.tagline)) + '</small></span></a>';
    }).join('');
  }

  /* ---------- discography ---------- */

  function listenLinks(r, labelled) {
    var out = [];
    [['beatport', 'Beatport'], ['spotify', 'Spotify'], ['soundcloud', 'SoundCloud'], ['youtube', 'YouTube']].forEach(function (s) {
      var url = r.links && r.links[s[0]];
      if (!url) return;
      var label = t('release.listenOn', { title: r.title, service: s[1] });
      out.push(labelled
        ? '<a class="btn btn-secondary btn-small" href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="' + esc(label) + '">' + icon(s[0]) + esc(s[1]) + '</a>'
        : '<a class="icon-btn" href="' + esc(url) + '" target="_blank" rel="noopener" title="' + esc(s[1]) + '" aria-label="' + esc(label) + '">' + icon(s[0]) + '</a>');
    });
    return out.join('');
  }

  function renderArtists() {
    var cards = [
      '<div class="tile artist" data-active="' + (state.artist === '') + '">' +
        '<button type="button" class="artist-pick" data-artist="" aria-pressed="' + (state.artist === '') + '">' +
          '<span class="artist-all"><img src="' + BASE + 'images/logo.svg" alt=""></span>' +
          '<span><span class="artist-name">' + esc(t('filter.allArtists')) + '</span>' +
          '<span class="artist-meta">' + esc(t('artist.releases', { n: releases.length })) + '</span></span>' +
        '</button>' +
      '</div>',
    ];

    DATA.artists.forEach(function (a) {
      var id = slug(a.name);
      var own = releasesBy(id);
      var span = yearSpan(own);
      var active = state.artist === id;
      var spotify = t('artist.spotify', { name: a.name });
      cards.push(
        '<div class="tile artist" data-active="' + active + '">' +
          '<button type="button" class="artist-pick" data-artist="' + id + '" aria-pressed="' + active + '">' +
            (own[0] ? '<img src="' + cover(own[0]) + '" alt="" loading="lazy" width="48" height="48">' : '') +
            '<span><span class="artist-name">' + esc(a.name) + '</span>' +
            '<span class="artist-meta">' + esc(t('artist.releases', { n: own.length })) + (span ? ' · ' + span : '') + '</span></span>' +
          '</button>' +
          (a.spotify
            ? '<a class="icon-btn" href="' + esc(a.spotify) + '" target="_blank" rel="noopener" title="' + esc(spotify) + '" aria-label="' + esc(spotify) + '">' + icon('spotify') + '</a>'
            : '') +
        '</div>'
      );
    });

    $('#artists').innerHTML = cards.join('');
  }

  function renderYears() {
    var all = [];
    releases.forEach(function (r) { if (all.indexOf(yearOf(r)) === -1) all.push(yearOf(r)); });
    var available = releasesBy(state.artist).map(yearOf);

    var chips = ['<button type="button" class="chip" data-year="" aria-pressed="' + (state.year === '') + '">' + esc(t('filter.allYears')) + '</button>'];
    all.forEach(function (y) {
      chips.push(
        '<button type="button" class="chip" data-year="' + y + '" aria-pressed="' + (state.year === y) + '"' +
          (available.indexOf(y) === -1 ? ' disabled' : '') + '>' + y + '</button>'
      );
    });
    $('#years').innerHTML = chips.join('');
  }

  function releaseCard(r) {
    var onlyTitleTrack = r.tracks.length === 1 && r.tracks[0].title === r.title && !r.tracks[0].artist;
    var tracks = onlyTitleTrack
      ? '<p class="release-single">' + esc(t('release.tracks', { n: 1 })) + '</p>'
      : '<details><summary>' + esc(t('release.tracks', { n: r.tracks.length })) + '</summary>' +
          '<ol class="tracklist" aria-label="' + esc(t('release.tracklist')) + '">' +
          r.tracks.map(function (tr) {
            return '<li>' + esc(tr.title) + (tr.artist ? ' <small>· ' + esc(tr.artist) + '</small>' : '') + '</li>';
          }).join('') +
          '</ol></details>';

    return (
      '<article class="tile release">' +
        '<div class="release-cover"><img src="' + cover(r) + '" alt="' + esc(t('release.cover', { title: r.title, artist: r.artist })) + '" loading="lazy" width="480" height="480"></div>' +
        '<div class="release-body">' +
          '<p class="release-meta">' + esc(t('release.' + r.type)) + ' · <time datetime="' + r.date + '">' + esc(formatDate(r.date)) + '</time></p>' +
          '<h3 class="release-title">' + esc(r.title) + '</h3>' +
          '<p class="release-artist">' + esc(r.artist) + '</p>' +
          tracks +
          '<div class="release-foot">' +
            (r.catalog ? '<span class="catalog">' + esc(r.catalog) + '</span>' : '') +
            '<div class="listen">' + listenLinks(r, false) + '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderReleases() {
    var shown = releasesBy(state.artist).filter(function (r) { return !state.year || yearOf(r) === state.year; });
    $('#release-count').textContent = t('filter.count', { n: shown.length });

    if (!shown.length) {
      $('#releases').innerHTML =
        '<div class="empty"><p>' + esc(t('filter.empty')) + '</p>' +
        '<button type="button" data-reset>' + esc(t('filter.reset')) + '</button></div>';
      return;
    }

    var groups = [];
    shown.forEach(function (r) {
      var last = groups[groups.length - 1];
      if (!last || last.year !== yearOf(r)) groups.push((last = { year: yearOf(r), items: [] }));
      last.items.push(r);
    });

    $('#releases').innerHTML = groups.map(function (g) {
      return (
        '<section class="year-group" aria-label="' + g.year + '">' +
          '<h2 class="year-label">' + g.year + '</h2>' +
          '<div class="release-grid">' + g.items.map(releaseCard).join('') + '</div>' +
        '</section>'
      );
    }).join('');
  }

  function renderDiscography() {
    if (!$('#releases')) return;
    renderArtists();
    renderYears();
    renderReleases();
  }

  function setFilter(next) {
    if ('artist' in next) {
      state.artist = next.artist;
      // A year the newly picked artist has nothing in would show an empty page.
      if (state.year && releasesBy(state.artist).map(yearOf).indexOf(state.year) === -1) state.year = '';
    }
    if ('year' in next) state.year = next.year;

    var q = new URLSearchParams(location.search);
    q.delete('lang');
    state.artist ? q.set('artist', state.artist) : q.delete('artist');
    state.year ? q.set('year', state.year) : q.delete('year');
    var qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);

    renderDiscography();
  }

  /* ---------- software ---------- */

  function projectAction(p) {
    if (!p.url) return '';
    var url = new URL(p.url);
    if (p.live === false) {
      return '<span class="project-go project-go--soon">' + esc(t('action.soon')) + ' <small>' + esc(url.host) + '</small></span>';
    }
    if (url.host === 'github.com') {
      var label = /\/releases/.test(url.pathname) ? t('action.download') : t('action.github');
      return '<span class="project-go" aria-hidden="true">' + esc(label) + ' ↗</span>';
    }
    return '<span class="project-go" aria-hidden="true">' + esc(t('action.site')) + ' ↗ <small>' + esc(url.host) + '</small></span>';
  }

  function projectCard(p) {
    var linked = p.url && p.live !== false;
    var name = linked
      ? '<a class="project-main" href="' + esc(p.url) + '">' + esc(p.name) + '</a>'
      : esc(p.name);

    var extra = (p.links || []).map(function (l) {
      var label = ['source', 'download', 'plugin'].indexOf(l[0]) !== -1 ? t(l[0]) : l[0];
      return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
    }).join('');

    var kind = t('kind.' + p.kind) + (p.version ? ' · ' + p.version : '');

    return (
      '<article class="tile project" id="' + esc(p.id) + '" data-status="' + p.status + '">' +
        '<div class="project-head">' + projectIcon(p, 'project-icon') +
          '<div><h4 class="project-name">' + name + '</h4><p class="project-kind">' + esc(kind) + '</p></div>' +
        '</div>' +
        '<p class="project-tagline">' + esc(loc(p.tagline)) + '</p>' +
        '<p class="project-desc">' + esc(loc(p.description)) + '</p>' +
        (p.platforms && p.platforms.length
          ? '<ul class="tags">' + p.platforms.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'
          : '') +
        '<div class="project-foot">' + projectAction(p) +
          (extra ? '<div class="project-links">' + extra + '</div>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects() {
    $$('[data-projects]').forEach(function (host) {
      var mine = projectsIn(host.dataset.projects);
      host.innerHTML = STATUS_ORDER.map(function (status) {
        var items = mine.filter(function (p) { return p.status === status; });
        if (!items.length) return '';
        return (
          '<section class="status-group" data-status="' + status + '">' +
            '<h3 class="status-label"><span class="dot" aria-hidden="true"></span>' + esc(t('status.' + status)) +
              ' <span class="count">' + items.length + '</span></h3>' +
            '<div class="project-grid">' + items.map(projectCard).join('') + '</div>' +
          '</section>'
        );
      }).join('');
    });
  }

  /* ---------- footer ---------- */

  function renderSocial() {
    var host = $('#social');
    if (!host) return;
    host.innerHTML = DATA.social.map(function (s) {
      return '<li><a href="' + esc(s[2]) + '" target="_blank" rel="noopener" title="' + esc(s[0]) + '" aria-label="' + esc(s[0]) + '">' + icon(s[1]) + '</a></li>';
    }).join('') +
      '<li><a href="mailto:info@bandpassrecords.com" title="Email" aria-label="Email">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>' +
      '</a></li>';
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------- switches ---------- */

  function showPalette() {
    var current = root.dataset.palette || 'neon';
    $$('[data-palette-choice]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.paletteChoice === current));
    });
  }

  function renderAll() {
    applyStaticText();
    renderMenus();
    renderHero();
    renderPillars();
    renderLatest();
    renderFeatured();
    renderDiscography();
    renderProjects();
    fixFileLinks();
  }

  /* ---------- start ---------- */

  function start() {
    var q = new URLSearchParams(location.search);
    state.lang = pickLanguage();
    store('bpr-lang', state.lang);

    var a = q.get('artist');
    if (a && DATA.artists.some(function (x) { return slug(x.name) === a; })) state.artist = a;
    var y = q.get('year');
    if (y && releases.some(function (r) { return yearOf(r) === y; })) state.year = y;

    renderAll();
    renderSocial();
    showPalette();

    // Cards rendered after load: scroll to the one a link like software/#flatq names.
    if (location.hash.length > 1) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }

    document.addEventListener('click', function (e) {
      var caret = e.target.closest('.nav-caret');
      if (caret) {
        var item = caret.closest('.nav-item');
        var open = !item.classList.contains('open');
        closeMenus(item);
        item.classList.toggle('open', open);
        caret.setAttribute('aria-expanded', String(open));
        return;
      }
      if (e.target.closest('.menu-toggle')) {
        setMobileMenu(!$('.navbar').classList.contains('menu-open'));
        return;
      }
      if (!e.target.closest('.nav-item')) closeMenus();
      if (e.target.closest('.nav-links a')) setMobileMenu(false);

      var el = e.target.closest('[data-artist], [data-year], [data-reset], [data-lang-choice], [data-palette-choice]');
      if (!el) return;

      if (el.hasAttribute('data-artist')) {
        var id = el.dataset.artist;
        setFilter({ artist: state.artist === id ? '' : id });
      } else if (el.hasAttribute('data-year')) {
        setFilter({ year: el.dataset.year });
      } else if (el.hasAttribute('data-reset')) {
        setFilter({ artist: '', year: '' });
      } else if (el.hasAttribute('data-lang-choice')) {
        state.lang = el.dataset.langChoice;
        store('bpr-lang', state.lang);
        renderAll();
      } else if (el.hasAttribute('data-palette-choice')) {
        root.dataset.palette = el.dataset.paletteChoice;
        store('bpr-palette', el.dataset.paletteChoice);
        showPalette();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = $('.nav-item.open');
      closeMenus();
      setMobileMenu(false);
      if (open) open.querySelector('.nav-caret').focus();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
