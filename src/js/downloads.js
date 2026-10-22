(() => {
  'use strict';

  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = name;
    anchor.hidden = true;
    document.body.append(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(href), 30000);
    }
  }

  function downloadJSON(name, data) {
    downloadFile(name, JSON.stringify(data, null, 2), 'application/json');
  }

  function csvCell(value) {
    let text = String(value ?? '');
    // Preserve the spreadsheet-formula guard on user-imported vocabulary.
    if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text)) text = "'" + text;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function csv(rows) {
    return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
  }

  window.MotsDownloads = Object.freeze({ downloadFile, downloadJSON, csv });
})();
