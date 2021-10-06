// TODO: Remove me, pm2 is just for local dev

module.exports = {
  apps : [{
    name: 'web',
    script: 'src/index.js',
    watch: ['./src/'],
  }, {
    name: 'worker',
    script: './src/workers/index.js',
    watch: ['./src'],
  }],
};
