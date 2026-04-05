/** @param {string} s */
function shQuote(s) {
  return `"${s.replace(/\\/g, '/').replace(/"/g, '\\"')}"`;
}

export default {
  'backend/**/*.ts': (files) => {
    if (!files.length) return [];
    const rel = files.map((f) => f.replace(/^backend[/\\]/, ''));
    return `eslint --max-warnings 0 ${rel.map(shQuote).join(' ')}`;
  },
};
