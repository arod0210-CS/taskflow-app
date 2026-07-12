module.exports = {
  test: {
    include: ["tests/**/*.test.cjs"],
    globals: true,
    coverage: {
      include: ["taskflow-core.js"]
    }
  }
};
