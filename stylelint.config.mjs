/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-high-performance-animation'],
  rules: {
    'plugin/no-low-performance-animation-properties': true,
    'selector-class-pattern': null,
    'no-descending-specificity': null,
  },
};
