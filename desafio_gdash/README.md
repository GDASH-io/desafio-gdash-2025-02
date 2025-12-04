# React + Vite

Este template fornece uma configuração mínima para fazer o React funcionar no Vite com HMR e algumas regras ESLint.

Atualmente, dois plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Babel](https://babeljs.io/) (ou [oxc](https://oxc.rs) quando usado em [rolldown-vite](https://vite.dev/guide/rolldown)) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/) para Fast Refresh

## Compilador React

O Compilador React não está habilitado neste template devido ao seu impacto no desempenho de desenvolvimento e build. Para adicioná-lo, veja [esta documentação](https://react.dev/learn/react-compiler/installation).

## Expandindo a configuração do ESLint

Se você está desenvolvendo uma aplicação de produção, recomendamos usar TypeScript com regras de lint com tipagem habilitadas. Confira o [template TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) para informações sobre como integrar TypeScript e [`typescript-eslint`](https://typescript-eslint.io) em seu projeto.
