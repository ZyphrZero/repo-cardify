import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. 忽略文件
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', '.git/**'],
  },

  // 2. JavaScript 基础推荐配置
  js.configs.recommended,

  // 3. 浏览器/Node 全局变量
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 4. TypeScript 配置
  ...tseslint.configs.recommended,

  // 5. Next.js 特定规则
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  }
);
