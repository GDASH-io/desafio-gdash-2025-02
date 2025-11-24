import globals from 'globals'

import baseConfig from './base.js'

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
