// Tiny JS/HTML highlighter for the guide's code samples (comments, strings, numbers, keywords, THREE).
const TOKENS = new RegExp(
  [
    String.raw`(\/\/[^\n]*)`,
    String.raw`('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\`(?:[^\`\\]|\\.)*\`)`,
    String.raw`\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b`,
    String.raw`\b(import|from|const|let|new|return|function|export|await|async|if|else|npm|cd)\b`,
    String.raw`\b(THREE)\b`,
  ].join('|'),
  'g',
);
const CLASSES = ['tk-c', 'tk-s', 'tk-n', 'tk-k', 'tk-t'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlightAll(root = document) {
  root.querySelectorAll('pre[data-highlight] code').forEach((el) => {
    const src = el.textContent;
    let out = '';
    let last = 0;
    for (const m of src.matchAll(TOKENS)) {
      out += esc(src.slice(last, m.index));
      const group = m.slice(1).findIndex((g) => g !== undefined);
      out += `<span class="${CLASSES[group]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    el.innerHTML = out + esc(src.slice(last));
  });
}
