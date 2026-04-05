/** @param {string} s */
function shQuote(s) {
  return `"${s.replace(/\\/g, '/').replace(/"/g, '\\"')}"`;
}

const config = {
  'frontend/**/*.{ts,tsx,js,jsx,mjs}': (files) => {
    if (!files.length) return [];
    const rel = files.map((f) => f.replace(/^frontend[/\\]/, ''));
    return `eslint --max-warnings 0 ${rel.map(shQuote).join(' ')}`;
  },
};

export default config;
