const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(
  path.join(__dirname, process.env.MOTS_TEST_SOURCE ? '../src/js/audio.js' : '../dist/audio.js'),
  'utf8',
);
const settle = () => new Promise((resolve) => setImmediate(resolve));

function setup({
  sources = { first: 'audio/first.m4a', second: 'audio/second.m4a' },
  language = 'fr',
  audioMode = 'auto',
} = {}) {
  const requests = [];
  const utterances = [];
  const notices = [];
  const opened = [];
  const timers = new Map();
  let timerID = 0;
  const status = { textContent: '' };
  const voiceLocale = { fr: 'fr-FR', de: 'de-DE', ja: 'ja-JP' }[language];
  const voice = { lang: voiceLocale, localService: true };
  const words = new Map([
    ['first', { id: 'first', term: 'bonjour' }],
    ['second', { id: 'second', term: 'maison' }],
  ]);
  const buttons = [...words.keys()].map((id) => {
    const classes = new Set();
    return {
      dataset: { speak: id },
      attributes: {},
      classes,
      classList: {
        toggle(name, enabled) {
          enabled ? classes.add(name) : classes.delete(name);
        },
      },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
    };
  });
  const player = {
    paused: true,
    pause() {
      this.paused = true;
    },
    load() {},
    removeAttribute(name) {
      delete this[name];
    },
    play() {
      this.paused = false;
      return new Promise((resolve, reject) => {
        requests.push({ resolve, reject });
      });
    },
  };
  const speechSynthesis = {
    getVoices: () => [voice],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak(utterance) {
      utterances.push(utterance);
    },
  };
  const window = { speechSynthesis, open: (...args) => opened.push(args) };
  vm.runInNewContext(source, {
    window,
    speechSynthesis,
    SpeechSynthesisUtterance: function (text) {
      this.text = text;
    },
    setTimeout(callback) {
      timers.set(++timerID, callback);
      return timerID;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  });
  const controller = window.MotsAudio.create({
    player,
    status,
    getContext: () => ({
      audioMode,
      language,
      voiceLocale,
      languageName: '法語',
      meaningLanguage: 'zh-Hant',
    }),
    getWord: (id) => words.get(id),
    getSource: (id) => sources[id],
    getButtons: () => buttons,
    onNotice: (message) => notices.push(message),
  });
  return { controller, player, status, buttons, requests, utterances, notices, timers, words, opened };
}

async function run() {
  const playback = setup();
  playback.controller.speak('first');
  assert.equal(playback.player.src, 'audio/first.m4a');
  assert.equal(playback.requests.length, 1, 'Click starts media playback immediately');
  assert.equal(playback.buttons[0].attributes['aria-busy'], 'true');
  assert(playback.buttons[0].classes.has('is-loading'));
  playback.player.onplaying();
  assert(playback.buttons[0].classes.has('is-playing'));
  assert.equal(playback.buttons[0].attributes['aria-busy'], undefined);
  assert.equal(playback.status.textContent, '正在播放：bonjour');
  playback.controller.speak('first');
  assert.equal(playback.player.paused, true);
  assert.equal(playback.player.src, undefined);
  assert.equal(
    playback.requests.length,
    1,
    'Repeated click stops instead of starting a second player',
  );
  assert.equal(playback.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(playback.status.textContent, '播放已停止');

  const switched = setup();
  switched.controller.speak('first');
  const oldPlaying = switched.player.onplaying;
  const oldEnded = switched.player.onended;
  const oldError = switched.player.onerror;
  switched.controller.speak('second');
  switched.player.onplaying();
  oldPlaying();
  oldEnded();
  oldError();
  switched.requests[0].reject(new Error('An old request failed after the switch'));
  await settle();
  assert.equal(switched.player.src, 'audio/second.m4a');
  assert.equal(switched.status.textContent, '正在播放：maison');
  assert.equal(switched.buttons[1].attributes['aria-pressed'], 'true');
  assert.equal(switched.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(
    switched.utterances.length,
    0,
    'Old failures cannot start device speech for another word',
  );
  assert.equal(switched.notices.length, 0);

  const fallback = setup();
  fallback.controller.speak('first');
  const timeout = [...fallback.timers.values()][0];
  const mediaError = fallback.player.onerror;
  mediaError();
  timeout();
  mediaError();
  fallback.requests[0].reject(new Error('Media request rejected as well'));
  await settle();
  assert.equal(
    fallback.utterances.length,
    1,
    'Media error, timeout, and rejection share one fallback',
  );
  assert.equal(fallback.utterances[0].text, 'bonjour');
  assert.equal(fallback.player.paused, true);
  fallback.utterances[0].onstart();
  assert.equal(fallback.status.textContent, '正在朗讀：bonjour');
  assert(fallback.buttons[0].classes.has('is-playing'));
  fallback.utterances[0].onend();
  assert.equal(fallback.status.textContent, '播放完成');
  assert.equal(fallback.buttons[0].attributes['aria-pressed'], 'false');

  const denied = setup();
  denied.controller.speak('first');
  denied.requests[0].reject(
    Object.assign(new Error('Gesture required'), { name: 'NotAllowedError' }),
  );
  await settle();
  assert.equal(denied.notices.length, 1);
  assert(denied.notices[0].includes('再點一次'));
  assert.equal(
    denied.utterances.length,
    0,
    'Autoplay permission failure must not silently switch to device speech',
  );
  assert.equal(denied.timers.size, 0);
  assert.equal(denied.buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(denied.player.src, undefined);

  const noBuiltInAudio = setup({ sources: {} });
  noBuiltInAudio.controller.speak('first');
  await settle();
  assert.equal(
    noBuiltInAudio.requests.length,
    0,
    'A dictionary without a supplied audio source never requests built-in audio',
  );
  assert.equal(noBuiltInAudio.player.src, undefined);
  assert.equal(noBuiltInAudio.utterances.length, 1);
  assert.equal(noBuiltInAudio.utterances[0].text, 'bonjour');
  const obsoleteSpeech = noBuiltInAudio.utterances[0];
  noBuiltInAudio.controller.speak('second');
  await settle();
  noBuiltInAudio.utterances[1].onstart();
  obsoleteSpeech.onstart();
  obsoleteSpeech.onend();
  obsoleteSpeech.onerror();
  assert.equal(noBuiltInAudio.status.textContent, '正在朗讀：maison');
  assert.equal(noBuiltInAudio.buttons[1].attributes['aria-pressed'], 'true');
  assert.equal(noBuiltInAudio.notices.length, 0);

  const japanese = setup({ sources: {}, language: 'ja' });
  for (const [term, expected] of [
    ['～かと思うと／～かと思ったら', 'かと思うと かと思ったら'],
    ['～を通じて/～を通して', 'を通じて を通して'],
    ['  〜やら～やら ~ / ／ ～  ', 'やらやら'],
    ['コーヒー', 'コーヒー'],
  ]) {
    japanese.controller.stop();
    japanese.words.get('first').term = term;
    japanese.controller.speak('first');
    await settle();
    const utterance = japanese.utterances.at(-1);
    assert.equal(utterance.text, expected);
    assert.equal(utterance.lang, 'ja-JP');
    utterance.onstart();
    assert.equal(japanese.status.textContent, `正在朗讀：${term}`);
    assert.equal(japanese.words.get('first').term, term, 'Display text stays intact');
  }

  const japaneseFallback = setup({ language: 'ja' });
  japaneseFallback.words.get('first').term = '～わけではない／～というわけではない';
  japaneseFallback.controller.speak('first');
  japaneseFallback.player.onerror();
  await settle();
  assert.equal(japaneseFallback.utterances[0].text, 'わけではない というわけではない');

  const google = setup({ language: 'ja', audioMode: 'google' });
  google.words.get('first').term = '～に伴って/～とともに';
  google.controller.speak('first');
  assert.equal(new URL(google.opened[0][0]).searchParams.get('text'), 'に伴って とともに');
  assert.equal(google.utterances.length, 0);

  for (const audioMode of ['auto', 'device', 'google']) {
    const symbols = setup({ language: 'ja', audioMode });
    symbols.words.get('first').term = ' /／～〜~ ';
    symbols.controller.speak('first');
    await settle();
    assert.equal(symbols.utterances.length, 0, 'Symbol-only text never starts speech');
    assert.equal(symbols.requests.length, 0);
    assert.equal(symbols.opened.length, 0);
    assert.equal(symbols.timers.size, 0);
    assert.equal(symbols.buttons[0].attributes['aria-pressed'], 'false');
  }

  for (const language of ['fr', 'de']) {
    const other = setup({ sources: {}, language });
    const term = 'un/deux ～ 〜 ~';
    other.words.get('first').term = term;
    other.controller.speak('first');
    await settle();
    assert.equal(other.utterances[0].text, term, 'Other languages keep their original speech');
  }
  console.log(
    'Audio playback, cancellation, stale callbacks, fallback, permission errors, and Japanese speech text passed.',
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
