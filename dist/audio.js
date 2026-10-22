(() => {
  'use strict';

  // The controller owns playback only. The app supplies the current dictionary,
  // preferences, word lookup and UI targets; there is no shared app state here.
  function create({ player, status, getContext, getWord, getSource, getButtons, onNotice }) {
    let playback = null;
    let playbackToken = 0;
    let playbackTimer;
    // Retain the current utterance for browsers whose speech engine needs it.
    let speechRef = null;

    function refreshButtons() {
      getButtons().forEach((button) => {
        const active = playback?.id === button.dataset.speak;
        button.classList.toggle('is-playing', Boolean(active && playback.state === 'playing'));
        button.classList.toggle('is-loading', Boolean(active && playback.state === 'loading'));
        button.setAttribute('aria-pressed', String(Boolean(active)));
        if (active && playback.state === 'loading') button.setAttribute('aria-busy', 'true');
        else button.removeAttribute('aria-busy');
      });
    }

    function stop(message = '') {
      playbackToken++;
      clearTimeout(playbackTimer);
      player.onplaying = player.onended = player.onerror = null;
      player.pause();
      player.removeAttribute('src');
      player.load();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      speechRef = null;
      playback = null;
      refreshButtons();
      if (message) status.textContent = message;
    }

    function getVoice() {
      const { language, voiceLocale } = getContext();
      const locale = voiceLocale.toLowerCase();
      const pick = () =>
        speechSynthesis
          .getVoices()
          .filter((voice) => voice.lang.toLowerCase().startsWith(language))
          .sort(
            (a, b) =>
              Number(b.lang.toLowerCase() === locale) - Number(a.lang.toLowerCase() === locale) ||
              Number(b.localService) - Number(a.localService),
          )[0];
      const available = pick();
      if (available) return Promise.resolve(available);
      return new Promise((resolve) => {
        let timer;
        const finish = () => {
          clearTimeout(timer);
          speechSynthesis.removeEventListener('voiceschanged', finish);
          resolve(pick());
        };
        speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
        timer = setTimeout(finish, 700);
      });
    }

    async function deviceSpeak(word, token) {
      if (token !== playbackToken) return;
      const unavailable = () => {
        stop('讀音無法播放');
        onNotice(`沒有可用的${getContext().languageName}語音，可在設定切換為 Google 翻譯。`);
      };
      if (!('speechSynthesis' in window)) {
        unavailable();
        return;
      }
      const voice = await getVoice();
      if (token !== playbackToken) return;
      if (!voice) {
        unavailable();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(word.term);
      speechRef = utterance;
      utterance.lang = getContext().voiceLocale;
      utterance.voice = voice;
      utterance.rate = 0.85;
      utterance.onstart = () => {
        if (token !== playbackToken) return;
        clearTimeout(playbackTimer);
        playback.state = 'playing';
        refreshButtons();
        status.textContent = `正在朗讀：${word.term}`;
      };
      utterance.onend = () => {
        if (token === playbackToken) stop('播放完成');
      };
      utterance.onerror = () => {
        if (token === playbackToken) unavailable();
      };
      playbackTimer = setTimeout(() => {
        if (token === playbackToken) unavailable();
      }, 8000);
      speechSynthesis.speak(utterance);
    }

    function speak(id) {
      const word = getWord(id);
      if (!word) return;
      if (playback?.id === id) {
        stop('播放已停止');
        return;
      }
      stop();
      const context = getContext();
      if (context.audioMode === 'google') {
        const target =
          { 'zh-Hant': 'zh-TW', 'zh-Hans': 'zh-CN' }[context.meaningLanguage] ||
          context.meaningLanguage;
        window.open(
          `https://translate.google.com/?sl=${context.language}&tl=${target}&text=${encodeURIComponent(word.term)}&op=translate`,
          '_blank',
          'noopener,noreferrer',
        );
        return;
      }
      const token = playbackToken;
      playback = { id, state: 'loading' };
      refreshButtons();
      const source = getSource(id);
      if (context.audioMode === 'device' || !source) {
        deviceSpeak(word, token);
        return;
      }
      let fallbackStarted = false;
      const fallback = () => {
        if (token !== playbackToken || fallbackStarted) return;
        fallbackStarted = true;
        clearTimeout(playbackTimer);
        player.onplaying = player.onended = player.onerror = null;
        player.pause();
        deviceSpeak(word, token);
      };
      player.src = source;
      player.onplaying = () => {
        if (token !== playbackToken) return;
        clearTimeout(playbackTimer);
        playback.state = 'playing';
        refreshButtons();
        status.textContent = `正在播放：${word.term}`;
      };
      player.onended = () => {
        if (token === playbackToken) stop('播放完成');
      };
      player.onerror = fallback;
      playbackTimer = setTimeout(fallback, 8000);
      // Start directly in the click handler so mobile playback has a user gesture.
      player.play().catch((error) => {
        if (token !== playbackToken) return;
        if (error.name === 'NotAllowedError') {
          stop();
          onNotice('請再點一次揚聲器播放讀音。');
        } else fallback();
      });
    }

    return Object.freeze({ speak, stop, refreshButtons });
  }

  window.MotsAudio = Object.freeze({ create });
})();
