module.exports = {
  semi: false,
  arrowParens: "always",
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  proseWrap: "preserve",
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
