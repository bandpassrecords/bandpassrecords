/*
 * BandPass Records: site content.
 *
 * Everything in the catalog and project sections is rendered from this file.
 * To add a release or a project, add one entry below; the filters, year
 * groups, artist list and counters update themselves. Interface text (menus,
 * headings, buttons) lives in assets/js/i18n.js.
 *
 * Text a visitor reads in their language is written as { en, pt, es }.
 *
 * Release fields
 *   id        unique slug; also the cover file name, images/releases/<id>.jpg
 *   title     release title
 *   artist    primary artist; must match a name in `artists`
 *   type      "single" | "ep" | "album"
 *   date      release date, YYYY-MM-DD
 *   catalog   catalog number (optional)
 *   tracks    track list; give a track `artist` only when it differs from the
 *             release artist
 *   links     beatport / spotify / soundcloud / youtube URLs (all optional)
 *
 * Project fields
 *   group     "music" (tools for music makers) | "other"
 *   status    "published" | "development" | "archived"
 *   kind      "desktop" | "plugin" | "web" | "mobile"
 *   url       where the card points: the project's own site when it has one,
 *             otherwise its download or source page
 *   live      false while `url` is not online yet: the card shows the address
 *             as "coming soon" instead of linking to it (default true)
 *   icon      image in images/products/; omit for a lettered tile
 *   links     extra buttons, [label, url]; label "source", "download" or
 *             "plugin" is translated, anything else (a store name) is shown
 *             as written
 */
window.BPR = {
  artists: [
    { name: "Audio Crawler", spotify: "https://open.spotify.com/artist/3GXLPRqgPwcXPgJwaZMhEI" },
    { name: "High Sense", spotify: "https://open.spotify.com/artist/4qmp7Oex8NEnN55RUxRlxs" },
    { name: "TetraSound", spotify: "https://open.spotify.com/artist/5inAVDRGEpOKhnfHw2CRiv" },
  ],

  releases: [
    {
      id: "beyond-the-surface",
      title: "Beyond the Surface",
      artist: "Audio Crawler",
      type: "single",
      date: "2026-10-10",
      catalog: "BPSG002",
      tracks: [
        { title: "Beyond the Surface" },
        { title: "Seek More" },
        { title: "Life Trip (Audio Crawler Remix)", artist: "Radioactive Project" },
      ],
      links: { beatport: "https://www.beatport.com/release/beyond-the-surface/7568484" },
    },
    {
      id: "light-and-life",
      title: "Light and Life",
      artist: "Audio Crawler",
      type: "single",
      date: "2024-05-22",
      tracks: [{ title: "Light and Life" }],
      links: { beatport: "https://www.beatport.com/release/light-and-life/4562916" },
    },
    {
      id: "honor",
      title: "Honor",
      artist: "Audio Crawler",
      type: "ep",
      date: "2024-05-03",
      tracks: [{ title: "Honor" }, { title: "Nebula" }, { title: "Witness" }, { title: "Backtrack" }],
      links: { beatport: "https://www.beatport.com/release/honor/4543309" },
    },
    {
      id: "swirlies",
      title: "Swirlies",
      artist: "High Sense",
      type: "single",
      date: "2022-07-23",
      catalog: "BPSG001",
      tracks: [{ title: "Swirlies" }],
      links: {
        beatport: "https://www.beatport.com/release/swirlies/3808013",
        spotify: "https://open.spotify.com/track/3lsQEfQvYLulV8IjzXKI5B",
      },
    },
    {
      id: "dreaming",
      title: "Dreaming",
      artist: "High Sense",
      type: "ep",
      date: "2022-07-09",
      tracks: [{ title: "Dreaming" }, { title: "Feel You" }, { title: "Be Reckless" }],
      links: { spotify: "https://open.spotify.com/album/2jb0f3SykOf36IJZQW0FjY" },
    },
    {
      id: "legacy",
      title: "Legacy",
      artist: "TetraSound",
      type: "ep",
      date: "2022-06-01",
      catalog: "BPEP001",
      tracks: [{ title: "My Car" }, { title: "Fuck the System" }, { title: "Restricted Area" }],
      links: { beatport: "https://www.beatport.com/release/legacy/3775238" },
    },
  ],

  projects: [
    /* ---------- Music projects ---------- */
    {
      id: "dpm",
      name: "DAW Project Manager",
      group: "music",
      status: "published",
      kind: "desktop",
      tagline: {
        en: "Every project, every DAW, one place.",
        pt: "Todos os projetos, todas as DAWs, num só lugar.",
        es: "Todos los proyectos, todos los DAW, en un solo lugar.",
      },
      description: {
        en: "A free, open-source library for your music projects: Ableton Live, Cubase, FL Studio, Logic Pro, REAPER and 20+ more, with phase, tempo, key and deadline at a glance.",
        pt: "Uma biblioteca gratuita e open source para seus projetos musicais: Ableton Live, Cubase, FL Studio, Logic Pro, REAPER e mais de 20 outras, com fase, andamento, tom e prazo à vista.",
        es: "Una biblioteca gratuita y de código abierto para tus proyectos musicales: Ableton Live, Cubase, FL Studio, Logic Pro, REAPER y más de 20 otros, con fase, tempo, tonalidad y fecha límite de un vistazo.",
      },
      platforms: ["Windows", "macOS", "Linux", "Android (beta)"],
      version: "v3.0.1",
      icon: "dpm.png",
      url: "https://dpm.bandpassrecords.com/",
      links: [
        ["Microsoft Store", "https://apps.microsoft.com/detail/9n8hxzd3hwx7"],
        ["Flathub", "https://flathub.org/en/apps/com.bandpassrecords.dpm"],
        // The companion VST3 / AU plugin lives under DPM rather than as its own card.
        ["plugin", "https://github.com/bandpassrecords/daw-project-manager-plugin"],
        ["source", "https://github.com/bandpassrecords/daw-project-manager"],
      ],
    },
    {
      id: "flatq",
      name: "flatQ",
      group: "music",
      status: "published",
      kind: "plugin",
      tagline: {
        en: "Calibrate your headphones and speakers.",
        pt: "Calibre seus fones e monitores.",
        es: "Calibra tus auriculares y monitores.",
      },
      description: {
        en: "A calibration EQ for the master bus. Linear phase, mixed or zero latency, and it reads Sonarworks and RME TotalMix Room EQ profiles.",
        pt: "Um EQ de calibração para o master. Fase linear, mista ou latência zero, e lê perfis do Sonarworks e do RME TotalMix Room EQ.",
        es: "Un EQ de calibración para el bus master. Fase lineal, mixta o latencia cero, y lee perfiles de Sonarworks y RME TotalMix Room EQ.",
      },
      platforms: ["VST3", "AU", "Windows", "macOS", "Linux"],
      version: "v0.1.0",
      icon: "flatq.png",
      url: "https://flatq.bandpassrecords.com/",
      links: [["source", "https://github.com/bandpassrecords/flatQ"]],
    },
    {
      id: "spinclip",
      name: "Spinclip",
      group: "music",
      status: "published",
      kind: "desktop",
      tagline: {
        en: "Promo videos for your releases.",
        pt: "Vídeos de divulgação para seus lançamentos.",
        es: "Vídeos promocionales para tus lanzamientos.",
      },
      description: {
        en: "Turns a cover and a song into an audio-reactive promo video: blurred background, sharp cover, rendered visualizer. GUI and command line.",
        pt: "Transforma uma capa e uma música num vídeo de divulgação que reage ao áudio: fundo desfocado, capa nítida e visualizador renderizado. Interface gráfica e linha de comando.",
        es: "Convierte una portada y una canción en un vídeo promocional que reacciona al audio: fondo desenfocado, portada nítida y visualizador renderizado. Interfaz gráfica y línea de comandos.",
      },
      platforms: ["Windows", "macOS", "Linux"],
      version: "v0.2.0",
      icon: "spinclip.svg",
      url: "https://github.com/bandpassrecords/spinclip/releases/latest",
      links: [["source", "https://github.com/bandpassrecords/spinclip"]],
    },
    {
      id: "sc-download-gating",
      name: "SoundCloud Download Gate",
      group: "music",
      status: "published",
      kind: "web",
      tagline: {
        en: "Free downloads for a like.",
        pt: "Downloads grátis em troca de um like.",
        es: "Descargas gratis a cambio de un like.",
      },
      description: {
        en: "Gate a file behind SoundCloud engagement: fans unlock the download after liking or commenting on your track.",
        pt: "Libere um arquivo em troca de engajamento no SoundCloud: os fãs desbloqueiam o download depois de curtir ou comentar sua faixa.",
        es: "Protege un archivo con interacción en SoundCloud: los fans desbloquean la descarga tras dar like o comentar tu tema.",
      },
      platforms: ["Web"],
      url: "https://download.bandpassrecords.com/",
      links: [["source", "https://github.com/bandpassrecords/sc-download-gating"]],
    },
    {
      id: "synthax1",
      name: "Synthax1",
      group: "music",
      status: "development",
      kind: "plugin",
      tagline: {
        en: "A virtual analog synthesizer.",
        pt: "Um sintetizador analógico virtual.",
        es: "Un sintetizador analógico virtual.",
      },
      description: {
        en: "Two-part VA synth with a preset browser built for libraries of hundreds of thousands of patches, and import of legacy .fxp / .fxb banks.",
        pt: "Sintetizador VA de duas partes, com um navegador de presets feito para bibliotecas de centenas de milhares de patches e importação de bancos .fxp / .fxb legados.",
        es: "Sintetizador VA de dos partes, con un navegador de presets pensado para bibliotecas de cientos de miles de patches e importación de bancos .fxp / .fxb heredados.",
      },
      platforms: ["VST3", "AU", "Standalone"],
      // Not online yet: shown as "site coming soon". Set live: true once it resolves.
      url: "https://synthax1.bandpassrecords.com/",
      live: false,
    },
    {
      id: "daw-macros-hub",
      name: "DAW Macros Hub",
      group: "music",
      status: "archived",
      kind: "web",
      tagline: {
        en: "Share your DAW key commands.",
        pt: "Compartilhe seus atalhos de DAW.",
        es: "Comparte tus atajos de DAW.",
      },
      description: {
        en: "A community hub for uploading key-command files, sharing individual macros and finding popular ones.",
        pt: "Um espaço da comunidade para enviar arquivos de atalhos, compartilhar macros e descobrir as mais populares.",
        es: "Un espacio comunitario para subir archivos de atajos, compartir macros y descubrir las más populares.",
      },
      platforms: ["Web"],
      url: "https://github.com/bandpassrecords/daw-macros-hub",
    },

    /* ---------- Other projects ---------- */
    {
      id: "negativo",
      name: "Negativo",
      group: "other",
      status: "development",
      kind: "mobile",
      tagline: {
        en: "Shoot a roll. Develop it later.",
        pt: "Fotografe o rolo. Revele depois.",
        es: "Dispara el carrete. Revélalo después.",
      },
      description: {
        en: "An analog camera simulator: load a film roll, take your shots, and only see them once the roll is developed.",
        pt: "Um simulador de câmera analógica: coloque um filme, faça as fotos e só as veja quando o rolo for revelado.",
        es: "Un simulador de cámara analógica: carga un carrete, haz tus fotos y solo las verás cuando se revele.",
      },
      platforms: ["Android", "iOS"],
      version: "v0.3.2",
      icon: "negativo.png",
      url: "https://negativo.bandpassrecords.com/",
      links: [["source", "https://github.com/bandpassrecords/negativo"]],
    },
    {
      id: "retro1",
      name: "Retro1",
      group: "other",
      status: "development",
      kind: "mobile",
      tagline: {
        en: "One second a day.",
        pt: "Um segundo por dia.",
        es: "Un segundo al día.",
      },
      description: {
        en: "Record one second every day and get monthly and yearly video timelines, with Google Drive backup.",
        pt: "Grave um segundo por dia e ganhe linhas do tempo em vídeo por mês e por ano, com backup no Google Drive.",
        es: "Graba un segundo cada día y obtén líneas de tiempo en vídeo mensuales y anuales, con copia de seguridad en Google Drive.",
      },
      platforms: ["Android"],
      version: "v0.9.4",
      icon: "retro1.png",
      url: "https://retro1.bandpassrecords.com/",
      links: [["source", "https://github.com/bandpassrecords/retro1"]],
    },
  ],

  social: [
    ["Spotify", "spotify", "https://open.spotify.com/playlist/0gqAkYnaQhZ91Cmv6YzSD7"],
    ["Beatport", "beatport", "https://www.beatport.com/label/bandpass-records/103779"],
    ["SoundCloud", "soundcloud", "https://soundcloud.com/bandpassrecords"],
    ["YouTube Music", "youtube", "https://music.youtube.com/channel/MPREb_4XkGPYWvSdf"],
    ["Instagram", "instagram", "https://www.instagram.com/bandpassrecords/"],
    ["Facebook", "facebook", "https://www.facebook.com/bandpassrecords"],
    ["X", "x", "https://twitter.com/bandpassrecords"],
    ["GitHub", "github", "https://github.com/bandpassrecords"],
  ],
};
