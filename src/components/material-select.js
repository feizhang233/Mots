// Shared Material 3 select entry. Bundle with the pinned @material/web version.
// Material Web owns popup, keyboard, typeahead, focus, ARIA and collision handling.
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

const pendingValues = new WeakMap();
const optionSignatures = new WeakMap();
const registered = new WeakSet();
const getControl = (target) =>
  typeof target === 'string' ? document.getElementById(target) : target;
const controls = () => [...document.querySelectorAll('md-outlined-select')];
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function configure(control) {
  if (!control) return;
  control.menuPositioning = 'popover';
  control.clampMenuWidth = true;
  control.quick = prefersReducedMotion();
  if (registered.has(control)) return;
  registered.add(control);
  // A user choice supersedes a queued first-render programmatic update.
  control.addEventListener('change', () => pendingValues.delete(control));
}

function setValue(target, value) {
  const control = getControl(target);
  if (!control) return;
  configure(control);
  const desired = String(value ?? '');
  const request = { value: desired };
  pendingValues.set(control, request);
  control.value = desired;
  // On first render, options and the internal menu may still be upgrading.
  // Reapply only this latest request after Material's own update has settled.
  Promise.all([...control.children].map((option) => option.updateComplete))
    .then(() => control.updateComplete)
    .then(() => {
      if (pendingValues.get(control) !== request || !control.isConnected) return;
      control.value = desired;
    });
}

function setOptions(target, entries) {
  const control = getControl(target);
  if (!control) return;
  configure(control);
  const options = entries.map((entry) => ({
    value: String(entry.value),
    label: String(entry.label ?? entry.value),
    disabled: Boolean(entry.disabled),
    lang: entry.lang ? String(entry.lang) : '',
  }));
  const signature = JSON.stringify(options);
  if (optionSignatures.get(control) === signature) return;
  optionSignatures.set(control, signature);
  const previous = pendingValues.get(control)?.value ?? control.value;
  const desired = options.some((option) => option.value === previous && !option.disabled)
    ? previous
    : (options.find((option) => !option.disabled)?.value ?? '');
  const fragment = document.createDocumentFragment();
  for (const entry of options) {
    const option = document.createElement('md-select-option');
    option.value = entry.value;
    option.disabled = entry.disabled;
    option.displayText = entry.label;
    option.typeaheadText = entry.label;
    option.selected = entry.value === desired;
    const label = document.createElement('div');
    label.slot = 'headline';
    label.textContent = entry.label;
    if (entry.lang) label.lang = entry.lang;
    option.append(label);
    fragment.append(option);
  }
  control.replaceChildren(fragment);
  setValue(control, desired);
}

function syncAll() {
  controls().forEach(configure);
}

function closeAll() {
  // Closing through Material's own menu keeps its focus/expanded state coherent.
  for (const control of controls()) {
    const menu = control.shadowRoot?.querySelector('md-menu');
    if (menu?.open) menu.close();
  }
}

window.MotsSelect = Object.freeze({ setOptions, setValue, syncAll, closeAll });
syncAll();
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('close', closeAll));
// A popup opened before a viewport change retains its measured desktop width.
// Close it through Material so reopening measures the current trigger again.
window.addEventListener('resize', closeAll);
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', syncAll);
