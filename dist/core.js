(() => {
  'use strict';

  // Small, side-effect-free helpers shared by validation and view modules.
  const escapeHTML = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );

  const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

  // Keep the established code-point FNV algorithm: imported word IDs use it.
  function hash(value) {
    let result = 2166136261;
    for (const character of value) {
      result ^= character.codePointAt(0);
      result = Math.imul(result, 16777619);
    }
    return (result >>> 0).toString(36);
  }

  window.MotsCore = Object.freeze({ escapeHTML, isObject, hash });
})();
