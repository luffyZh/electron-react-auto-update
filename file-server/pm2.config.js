module.exports = {
  apps: [
    {
      name: 'app',
      script: 'app.js', 
      watch: true,
      env: {
        "PORT": 8099,
      }
    }
  ]
}