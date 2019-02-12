module.exports = function (api) {
  api.cache(true)

  return {
    presets: [['@babel/env', { targets: { node: "6", esmodules: true } }]],
    plugins: ['syntax-async-functions']
  }
}
