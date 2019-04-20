module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "commonjs": true,
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "extends": [
    "@nuxtjs",
    "plugin:vue/recommended"
  ],
  "plugins": [
    "vue"
  ],
  "rules": {
    "semi": [2, "always"]
  }
}
