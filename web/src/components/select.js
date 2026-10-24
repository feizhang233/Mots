// One adapter for native selects. The operating system owns the popup,
// keyboard navigation, typeahead and assistive-technology interaction.
(() => {
  const optionSignatures = new WeakMap();
  const getControl = (target) =>
    typeof target === 'string' ? document.getElementById(target) : target;

  function setValue(target, value) {
    const control = getControl(target);
    if (control) control.value = String(value ?? '');
  }

  function setOptions(target, entries) {
    const control = getControl(target);
    if (!control) return;
    const options = entries.map((entry) => ({
      value: String(entry.value),
      label: String(entry.label ?? entry.value),
      disabled: Boolean(entry.disabled),
      lang: entry.lang ? String(entry.lang) : '',
    }));
    const signature = JSON.stringify(options);
    if (optionSignatures.get(control) === signature) return;
    optionSignatures.set(control, signature);
    const previous = control.value;
    const desired = options.some((option) => option.value === previous && !option.disabled)
      ? previous
      : (options.find((option) => !option.disabled)?.value ?? '');
    const fragment = document.createDocumentFragment();
    for (const entry of options) {
      const option = document.createElement('option');
      option.value = entry.value;
      option.textContent = entry.label;
      option.disabled = entry.disabled;
      if (entry.lang) option.lang = entry.lang;
      fragment.append(option);
    }
    control.replaceChildren(fragment);
    setValue(control, desired);
  }

  // Native controls require no upgrade or authored popup lifecycle.
  const syncAll = () => {};
  const closeAll = () => {};
  window.MotsSelect = Object.freeze({ setOptions, setValue, syncAll, closeAll });
})();
