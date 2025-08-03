// tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brandPurple: '#7765DA',
        brandBlue:   '#5767D0',
        brandDeep:   '#4F0DCE',
        bgLight:     '#F2F2F2',
        textDark:    '#373737',
        textGray:    '#6E6E6E',
      },
    },
  },
  plugins: [],
}
