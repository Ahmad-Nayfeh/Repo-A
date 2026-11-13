import tseslint from 'typescript-eslint';

// Determinism rule (ARCHITECTURE §5): engine state code must not use implementation-approximated Math functions.
const forbiddenMath = ['exp', 'log', 'log10', 'log2', 'log1p', 'expm1', 'pow', 'sin', 'cos', 'tan', 'atan', 'atan2', 'asin', 'acos', 'hypot', 'cbrt', 'sinh', 'cosh', 'tanh', 'random']
  .map((property) => ({ object: 'Math', property, message: 'Non-deterministic across engines (ECMAScript implementation-approximated). Use engine/math/dmath or engine/rng.' }));

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-properties': ['error', ...forbiddenMath],
      'no-restricted-syntax': ['error', { selector: "BinaryExpression[operator='**']", message: 'Use dmath.pow (deterministic).' }],
    },
  },
);
