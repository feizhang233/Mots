(() => {
  'use strict';

  const key = 'mots.vocabulary-columns.v1';
  const columns = [
    { id: 'term', label: '單字', min: 120 },
    { id: 'example', label: '例句', min: 160 },
    { id: 'meaning', label: '釋義', min: 100 },
  ];
  const maximum = 1600;
  const allColumns = [
    ...columns,
    { id: 'status', label: '熟悉程度' },
    { id: 'delete', label: '刪除' },
  ];
  function sanitize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (
      !columns.every(
        ({ id, min }) => Number.isFinite(value[id]) && value[id] >= min && value[id] <= maximum,
      )
    )
      return null;
    return Object.fromEntries(columns.map(({ id }) => [id, Math.round(value[id])]));
  }
  function controls() {
    return `<div class="vocabulary-width-toolbar"><span>拖曳分隔線調整欄寬</span><details class="vocabulary-width-settings"><summary>欄寬設定</summary><div class="vocabulary-width-fields">${columns.map(({ id, label, min }) => `<label>${label}<input type="number" data-column-width="${id}" min="${min}" max="${maximum}" step="1" inputmode="numeric" aria-label="${label}欄寬（像素）"></label>`).join('')}<button id="reset-column-widths" type="button" class="text-button">還原預設</button></div></details></div>`;
  }
  function definitions() {
    return `<div class="vocabulary-column-definitions" aria-hidden="true">${allColumns.map(({ id }) => `<div class="vocabulary-column" data-column="${id}"></div>`).join('')}</div>`;
  }
  function resizer(id) {
    const column = columns.find((column) => column.id === id);
    if (!column) return '';
    return `<button type="button" class="vocabulary-column-resizer" data-column="${id}" role="separator" aria-label="調整${column.label}欄寬" aria-orientation="vertical" aria-controls="vocabulary-rows" aria-valuemin="${column.min}" aria-valuemax="${maximum}" aria-valuenow="${column.min}" title="拖曳調整${column.label}欄寬；左右鍵微調，Shift 加速"></button>`;
  }
  function create({ root, read, write, notice }) {
    let widths = sanitize(read(key, null));
    let drag = null;
    const table = () => root.querySelector('.vocabulary-entry-list');
    const dimensions = (list) =>
      Object.fromEntries(
        allColumns.map(({ id }) => [
          id,
          Math.round(
            list.querySelector(`.vocabulary-entry > .list-${id}`).getBoundingClientRect().width,
          ),
        ]),
      );
    function updateControls(list) {
      const measured = dimensions(list);
      for (const { id } of columns) {
        const value = widths?.[id] ?? measured[id];
        const handle = list.querySelector(`.vocabulary-column-resizer[data-column="${id}"]`);
        handle.setAttribute('aria-valuenow', value);
        handle.setAttribute('aria-valuetext', `${value} 像素`);
        const field = root.querySelector(`[data-column-width="${id}"]`);
        if (field && document.activeElement !== field) field.value = value;
      }
      for (const cell of list.querySelectorAll('.vocabulary-cell-content')) {
        const hidden = cell.closest('[hidden]');
        if (!hidden && cell.scrollWidth > cell.clientWidth + 1) cell.setAttribute('tabindex', '0');
        else cell.removeAttribute('tabindex');
      }
    }
    function apply(list) {
      if (widths) {
        const measured = dimensions(list);
        const sizes = {
          ...widths,
          status: measured.status,
          delete: measured.delete,
        };
        list.classList.add('has-custom-widths');
        const total = Object.values(sizes).reduce((sum, value) => sum + value, 0);
        list.style.width = `${total}px`;
        list.closest('.vocabulary-list-canvas').style.width = `${total + 2}px`;
        for (const { id } of allColumns)
          list.querySelector(`.vocabulary-column[data-column="${id}"]`).style.width =
            `${sizes[id]}px`;
      }
      updateControls(list);
    }
    function refresh() {
      if (drag && !drag.handle.isConnected) {
        drag = null;
        root.classList.remove('is-resizing-columns');
        persist();
      }
      const list = table();
      // Refresh only after the vocabulary controls have been mounted.
      if (!list?.querySelector('.vocabulary-column')?.dataset.column) return;
      apply(list);
    }
    function persist() {
      if (!write(key, widths)) notice('欄寬尚未儲存；請稍後重試。');
    }
    function setWidth(list, id, value) {
      const column = columns.find((column) => column.id === id);
      if (!column || !Number.isFinite(value)) return;
      if (!widths) {
        const measured = dimensions(list);
        widths = Object.fromEntries(
          columns.map(({ id, min }) => [id, Math.max(min, Math.min(maximum, measured[id]))]),
        );
      }
      widths[id] = Math.max(column.min, Math.min(maximum, Math.round(value)));
      apply(list);
    }
    root.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest('.vocabulary-column-resizer');
      const list = table();
      if (!handle || !list || event.button !== 0 || drag) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      drag = {
        handle,
        list,
        id: handle.dataset.column,
        pointer: event.pointerId,
        x: event.clientX,
        width: dimensions(list)[handle.dataset.column],
        total: list.getBoundingClientRect().width + 2,
        available: list.closest('.vocabulary-list-canvas').parentElement.clientWidth,
        previous: widths ? { ...widths } : null,
      };
      handle.setPointerCapture(event.pointerId);
      root.classList.add('is-resizing-columns');
    });
    root.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      // A centered canvas moves by half the width change. Account for that
      // movement so the separator stays under the pointer while resizing.
      const spare = drag.available - drag.total;
      const offset = Math.max(0, spare / 2);
      const delta = event.clientX - drag.x;
      const widthDelta = delta <= spare - offset ? 2 * delta - spare + 2 * offset : delta + offset;
      setWidth(drag.list, drag.id, drag.width + widthDelta);
    });
    function finish(event, cancel = false) {
      if (!drag || event.pointerId !== drag.pointer) return;
      const previous = drag.previous;
      drag = null;
      root.classList.remove('is-resizing-columns');
      if (cancel) {
        widths = previous;
        resetPresentation();
      } else persist();
    }
    root.addEventListener('pointerup', (event) => finish(event));
    root.addEventListener('pointercancel', (event) => finish(event, true));
    root.addEventListener('lostpointercapture', (event) => finish(event));
    root.addEventListener('keydown', (event) => {
      const handle = event.target.closest('.vocabulary-column-resizer');
      if (!handle || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      const column = columns.find(({ id }) => id === handle.dataset.column);
      const list = table();
      if (!column || !list || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return;
      event.preventDefault();
      const current = widths?.[column.id] ?? dimensions(list)[column.id];
      const step = event.shiftKey ? 40 : 10;
      setWidth(
        list,
        column.id,
        event.key === 'Home'
          ? column.min
          : event.key === 'End'
            ? maximum
            : current + (event.key === 'ArrowRight' ? step : -step),
      );
      persist();
    });
    root.addEventListener('change', (event) => {
      const field = event.target.closest('[data-column-width]');
      const list = table();
      if (!field || !list) return;
      if (field.value.trim() && Number.isFinite(Number(field.value))) {
        setWidth(list, field.dataset.columnWidth, Number(field.value));
        persist();
      }
      field.value =
        widths?.[field.dataset.columnWidth] ?? dimensions(list)[field.dataset.columnWidth];
    });
    function resetPresentation() {
      const list = table();
      if (!list) return;
      list.classList.remove('has-custom-widths');
      list.style.width = '';
      const canvas = list.closest('.vocabulary-list-canvas');
      if (canvas) canvas.style.width = '';
      for (const cell of list.querySelectorAll('.vocabulary-column')) cell.style.width = '';
      refresh();
    }
    root.addEventListener('click', (event) => {
      if (!event.target.closest('#reset-column-widths')) return;
      widths = null;
      resetPresentation();
      persist();
    });
    function handleStorage(event) {
      if (event.key !== key && event.key !== null) return false;
      if (drag) return true;
      widths = sanitize(read(key, null));
      resetPresentation();
      return event.key === key;
    }
    window.addEventListener('resize', refresh);
    return { refresh, handleStorage };
  }
  window.MotsColumnWidths = { controls, definitions, resizer, create };
})();
