module.exports = {
  apps: [
    {
      name: 'thaihelp',
      script: 'server.js',
      cwd: '/home/admin/domains/thaihelp.xman4289.com/app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
