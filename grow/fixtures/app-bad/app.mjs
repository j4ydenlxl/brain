// grow/fixtures/app-bad/app.mjs: the same todo logic as app-ok; this fixture is bad by its page and its tests, not its code.
export const STORE_KEY = 'todo-fixture';

/** A new list with text appended as an open item; blank text leaves the list as it was. */
export function addTodo(list, text) {
  const t = String(text ?? '').trim();
  return t ? [...list, { text: t, done: false }] : list.slice();
}

/** A new list with item i's done flag flipped. */
export function toggleTodo(list, i) {
  return list.map((x, j) => (j === i ? { ...x, done: !x.done } : x));
}

/** A new list without item i. */
export function removeTodo(list, i) {
  return list.filter((_, j) => j !== i);
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** The list as HTML text: one <li> per item, or one empty-state item. */
export function render(list) {
  if (!list.length) return '<li class="empty">Nothing to do yet.</li>';
  return list.map((x, i) => '<li' + (x.done ? ' class="done"' : '') + '><label><input type="checkbox" data-action="toggle" data-index="' + i + '"'
    + (x.done ? ' checked' : '') + '> <span>' + escapeHtml(x.text) + '</span></label>'
    + '<button type="button" data-action="remove" data-index="' + i + '" aria-label="Remove">Remove</button></li>').join('');
}

/** Wire the page: the form adds, the list toggles and removes, the viewer's own browser keeps the list. */
export function mount(doc) {
  const view = doc.defaultView;
  const form = doc.getElementById('add-form');
  const input = doc.getElementById('todo-text');
  const ul = doc.getElementById('list');
  let list = [];
  try { list = JSON.parse(view.localStorage.getItem(STORE_KEY) || '[]'); } catch { list = []; }
  if (!Array.isArray(list)) list = [];
  const draw = () => {
    ul.innerHTML = render(list);
    try { view.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch { /* a private window keeps nothing */ }
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); list = addTodo(list, input.value); input.value = ''; draw(); input.focus(); });
  ul.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const i = Number(t.dataset.index);
    list = t.dataset.action === 'toggle' ? toggleTodo(list, i) : removeTodo(list, i);
    draw();
  });
  draw();
  return { get list() { return list; } };
}

if (typeof document !== 'undefined') mount(document);
