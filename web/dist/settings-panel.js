(() => {
  'use strict';
  // Settings owns presentation and transient disclosure/code state, never saved study data.
  const { escapeHTML: esc } = window.MotsCore;
  const { MotsSelect } = window;
  const groupIDs = Object.freeze([
    'settings-learning',
    'settings-sync',
    'settings-library',
    'settings-backup',
  ]);
  function create({
    getPreferences,
    getExport,
    getDeleted,
    getMeaning,
    getSync,
    beforeOpen,
    onRestore,
    onSyncStatus,
  }) {
    const $ = (id) => document.getElementById(id);
    let deletedPage = 1;
    function renderPreferences() {
      const model = getPreferences();
      for (const [id, value] of Object.entries({
        'study-language': model.studyLanguage,
        'meaning-language': model.meaningLanguage,
        'audio-mode': model.audioMode,
        'page-size': String(model.pageSize),
      }))
        MotsSelect.setValue(id, value);
      $('default-hide-mastered').checked = model.defaultHideMastered;
      $('show-example-translations').checked = model.showExampleTranslations;
      $('grammar-book-type').hidden = model.studyKind !== 'grammar';
      $('grammar-book-type').textContent = model.grammarGrouping
        ? '目前為主題語法書：依二級分類展開小卡片，內容與普通語法書分開保存。'
        : '目前為普通語法書：使用獨立條目與原有的兩級分類。';
      $('vocabulary-extension-section').hidden = !model.canExtend;
      $('settings-bank-note').textContent =
        `目前辭典：${model.dictionaryTitle} · ${model.wordCount} 詞${model.customCount ? `，含 ${model.customCount} 個擴充單字` : ''}`;
      $('settings-learning-summary').textContent =
        `${model.studyLanguageName} · ${model.meaningLanguageName} · 每頁 ${model.pageSize} ${model.studyKind === 'grammar' ? '項' : '詞'}${model.studyKind === 'grammar' ? ` · ${model.grammarGrouping ? '主題語法' : '普通語法'}` : ''}`;
      $('settings-source-note').textContent =
        `法語手冊 ${model.frenchSourceCount} 詞，其中 ${model.sourcedCount} 詞含原書頁碼。德語與日語初始各提供 12 個示例。每部辭典有獨立進度，可在設定中切換；繁體中文釋義僅在顯示時轉換。`;
    }
    function renderExport() {
      const model = getExport();
      MotsSelect.setOptions('export-unit', model.options);
      MotsSelect.setValue('export-unit', model.scope);
      $('export-vocabulary-count').textContent = `(${model.count} 詞)`;
      $('export-vocabulary').setAttribute(
        'aria-label',
        `匯出 ${model.scopeName} 的生詞（${model.count} 詞，未掌握）`,
      );
    }
    function render() {
      renderPreferences();
      renderExport();
      renderSync();
      renderDeleted();
    }
    function renderSync(snapshot = getSync()?.state()) {
      if (!snapshot) return;
      const messages = {
        disconnected: '尚未配對。進度仍儲存在這個瀏覽器。',
        unavailable:
          '離線檔案及非 HTTPS 頁面無法同步。請開啟正式網站 mots.feizhang233.com 使用配對。',
        connecting: '正在驗證配對，請稍候。',
        syncing: '正在同步進度…',
        pending: '本機已儲存，等待同步。',
        synced: '進度已同步。',
        offline: '暫時無法連線，進度保留在本機，稍後會自動重試。',
        unauthorized: '配對碼無效或已失效。請檢查配對碼後重新加入。',
        invalid: '伺服器回傳的資料無法驗證。本機進度未被覆蓋，稍後重試。',
        'invalid-code': '請輸入完整的 mots- 配對碼，再按「加入同步」。',
        error: '進度尚未完整儲存，請釋放瀏覽器儲存空間或下載備份後重試。',
        unsupported: '同步服務尚未支援刪除同步。本機資料已保留，請稍後重試。',
      };
      $('sync-status').textContent = messages[snapshot.phase] || messages.disconnected;
      const summaries = {
        disconnected: '尚未配對',
        unavailable: '請在正式網站使用',
        connecting: '正在配對',
        syncing: '正在同步',
        pending: '等待同步',
        synced: '已同步',
        offline: '離線，稍後重試',
        unauthorized: '請重新配對',
        invalid: '資料待驗證',
        'invalid-code': '請檢查配對碼',
        error: '尚未完整儲存',
        unsupported: '同步服務待更新',
      };
      $('settings-sync-summary').textContent = summaries[snapshot.phase] || '尚未配對';
      $('sync-unpaired').hidden = snapshot.connected;
      $('sync-paired').hidden = !snapshot.connected;
      for (const id of ['sync-create', 'sync-join'])
        $(id).disabled = snapshot.busy || !snapshot.available;
      $('sync-now').disabled = snapshot.busy || !snapshot.available;
      $('sync-private-code').value = getSync()?.getCode() || '';
      $('sync-join-code').setAttribute(
        'aria-invalid',
        String(['invalid-code', 'unauthorized'].includes(snapshot.phase)),
      );
      onSyncStatus(snapshot);
    }
    function renderDeleted() {
      const { entries: removed, language, meaningLanguage } = getDeleted();
      const pages = Math.max(1, Math.ceil(removed.length / 20));
      deletedPage = Math.min(deletedPage, pages);
      $('deleted-word-count').textContent = `（${removed.length}）`;
      $('deleted-word-list').innerHTML = removed.length
        ? `<div class="deleted-words" role="list">${removed
            .slice((deletedPage - 1) * 20, deletedPage * 20)
            .map(
              (word) =>
                `<div class="deleted-word" role="listitem"><div><span lang="${language}">${esc(word.term)}</span><small lang="${meaningLanguage}">${esc(getMeaning(word))}</small></div><button class="button button-outline" type="button" data-restore="${esc(word.id)}" aria-label="恢復「${esc(word.term)}」">恢復</button></div>`,
            )
            .join(
              '',
            )}</div>${pages > 1 ? `<div class="deleted-pagination"><button class="text-button" type="button" data-deleted-page="-1" ${deletedPage === 1 ? 'disabled' : ''}>上一頁</button><span>${deletedPage}/${pages}</span><button class="text-button" type="button" data-deleted-page="1" ${deletedPage === pages ? 'disabled' : ''}>下一頁</button></div>` : ''}`
        : '<p class="settings-note">目前沒有已刪除的單字。</p>';
    }
    function hideCode() {
      for (const id of ['sync-private-code', 'sync-join-code']) {
        $(id).type = 'password';
        $(id).classList.remove('sync-code-visible');
      }
      $('sync-join-code').value = '';
      for (const id of ['sync-reveal', 'sync-join-reveal']) {
        $(id).textContent = '顯示';
        $(id).setAttribute('aria-pressed', 'false');
      }
      $('sync-reveal').setAttribute('aria-label', '顯示本組配對碼');
      $('sync-join-reveal').setAttribute('aria-label', '顯示輸入的配對碼');
    }
    function closeGroups(except = null) {
      for (const id of groupIDs)
        if (id !== except) {
          if (id === 'settings-sync' && $(id).open) hideCode();
          $(id).open = false;
        }
    }
    function openGroup(id, focus = false) {
      if (!groupIDs.includes(id)) return;
      closeGroups(id);
      $(id).open = true;
      if (focus) {
        $(id).querySelector('summary')?.focus({ preventScroll: true });
        $(id).scrollIntoView({ block: 'nearest' });
      }
    }
    function notice(id, message) {
      $(id).textContent = message;
      const group =
        id === 'backup-message'
          ? 'settings-backup'
          : id === 'sync-status'
            ? 'settings-sync'
            : 'settings-library';
      // Background sync rendering never calls this user-action feedback path.
      if ($('settings-dialog').open) {
        openGroup(group);
        $(id).scrollIntoView({ block: 'nearest' });
      }
    }
    function open(group = null) {
      beforeOpen();
      render();
      for (const id of [
        'backup-message',
        'vocabulary-message',
        'dictionary-message',
        'export-message',
      ])
        $(id).textContent = '';
      closeGroups();
      hideCode();
      $('settings-dialog').showModal();
      $('settings-dialog').scrollTop = 0;
      if (groupIDs.includes(group)) openGroup(group, true);
    }
    function toggleSyncCode(inputID, buttonID, description) {
      const input = $(inputID),
        button = $(buttonID),
        reveal = input.type !== 'text';
      input.type = reveal ? 'text' : 'password';
      input.classList.toggle('sync-code-visible', reveal);
      button.textContent = reveal ? '隱藏' : '顯示';
      button.setAttribute('aria-pressed', String(reveal));
      button.setAttribute('aria-label', `${reveal ? '隱藏' : '顯示'}${description}`);
    }
    $('sync-join-reveal').addEventListener('click', () =>
      toggleSyncCode('sync-join-code', 'sync-join-reveal', '輸入的配對碼'),
    );
    $('sync-reveal').addEventListener('click', () =>
      toggleSyncCode('sync-private-code', 'sync-reveal', '本組配對碼'),
    );
    $('sync-create').addEventListener('click', async () => {
      await getSync().createPairing();
      renderSync();
      notice('sync-status', $('sync-status').textContent);
    });
    $('sync-join').addEventListener('click', async () => {
      const joined = await getSync().join($('sync-join-code').value);
      if (joined) {
        hideCode();
      }
      renderSync();
      notice('sync-status', $('sync-status').textContent);
      if (!joined && $('settings-dialog').open) $('sync-join-code').focus();
    });
    $('sync-now').addEventListener('click', async () => {
      await getSync().syncNow();
      renderSync();
      notice('sync-status', $('sync-status').textContent);
    });
    $('sync-disconnect').addEventListener('click', () => {
      getSync().disconnect();
      hideCode();
      $('sync-private-code').value = '';
      renderSync();
      notice('sync-status', $('sync-status').textContent);
    });
    $('sync-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getSync().getCode());
        notice('sync-status', '配對碼已複製，請只貼到自己的另一部裝置。');
      } catch {
        notice('sync-status', '無法複製。請按「顯示」後手動選取配對碼。');
      }
    });
    $('settings-dialog').addEventListener('click', (event) => {
      const restore = event.target.closest('[data-restore]');
      if (restore) {
        onRestore(restore.dataset.restore);
        return;
      }
      const page = event.target.closest('[data-deleted-page]');
      if (page) {
        deletedPage = Math.max(1, deletedPage + Number(page.dataset.deletedPage));
        renderDeleted();
        $('deleted-word-list').scrollIntoView({ block: 'nearest' });
      }
    });
    for (const id of groupIDs)
      $(id).addEventListener('toggle', () => {
        // Native name= exclusivity is supplemented for browsers without that support.
        if ($(id).open) closeGroups(id);
        else if (id === 'settings-sync') hideCode();
      });
    $('settings-dialog').addEventListener('close', () => {
      closeGroups();
      hideCode();
    });
    $('settings-button').addEventListener('click', () => open());
    $('close-settings').addEventListener('click', () => $('settings-dialog').close());
    return Object.freeze({
      render,
      renderSync,
      renderExport,
      renderDeleted,
      open,
      openGroup,
      notice,
      resetDeletedPage: () => {
        deletedPage = 1;
      },
    });
  }
  window.MotsSettingsPanel = Object.freeze({ create, groupIDs });
})();
