/** @type {import('tailwindcss').Config} */
function withOpacity(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './ontology.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        'surface-hover': withOpacity('--color-surface-hover'),
        border: withOpacity('--color-border'),
        border2: withOpacity('--color-border2'),
        accent: withOpacity('--color-accent'),
        accent2: withOpacity('--color-accent2'),
        ink: withOpacity('--color-text'),
        muted: withOpacity('--color-muted'),

        tag: {
          bg: withOpacity('--color-tag-bg'),
          text: withOpacity('--color-tag-text'),
          border: withOpacity('--color-tag-border'),
        },
        colab: {
          text: withOpacity('--color-colab-text'),
          border: withOpacity('--color-colab-border'),
          'hover-bg': withOpacity('--color-colab-hover-bg'),
          'hover-text': withOpacity('--color-colab-hover-text'),
        },

        plo5: { bg: withOpacity('--color-plo5-bg'), text: withOpacity('--color-plo5-text') },
        plo4: { bg: withOpacity('--color-plo4-bg'), text: withOpacity('--color-plo4-text') },
        plo9: { bg: withOpacity('--color-plo9-bg'), text: withOpacity('--color-plo9-text') },
        plo2: { bg: withOpacity('--color-plo2-bg'), text: withOpacity('--color-plo2-text') },

        'level-low': {
          bg: withOpacity('--color-level-low-bg'),
          text: withOpacity('--color-level-low-text'),
          border: withOpacity('--color-level-low-border'),
        },
        'level-med': {
          bg: withOpacity('--color-level-med-bg'),
          text: withOpacity('--color-level-med-text'),
          border: withOpacity('--color-level-med-border'),
        },
        'level-high': {
          bg: withOpacity('--color-level-high-bg'),
          text: withOpacity('--color-level-high-text'),
          border: withOpacity('--color-level-high-border'),
        },
      },
    },
  },
  plugins: [],
};
