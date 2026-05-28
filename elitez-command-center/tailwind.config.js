/** Tailwind v3 build config — replaces the cdn.tailwindcss.com Play CDN.
 *  The Play CDN ships a ~400KB in-browser compiler and is render-blocking;
 *  this produces a small purged static stylesheet instead.
 *
 *  Rebuild after adding/removing utility classes in any page or app.js:
 *    npx -y tailwindcss@3 -c tailwind.config.js -i tailwind.src.css -o tailwind.css --minify
 */
module.exports = {
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      colors: {
        ink: '#14233b', ink2: '#0f1b2d', blue: '#00337a', blued: '#002356',
        bluel: '#1e5fa8', steel: '#5a6b85', paper: '#eef1f5',
        notice: '#d8232a', line: '#d4dae3',
      },
      fontFamily: { sans: ['Barlow', 'system-ui', 'sans-serif'] },
    },
  },
};
