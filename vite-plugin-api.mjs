export default function apiPlugin() {
  return {
    name: 'api-server',
    config() {
      if (process.env.DOCKER_API) {
        return {
          server: {
            proxy: {
              '/api': 'http://localhost:8080',
              '/uploads': 'http://localhost:8080',
            },
          },
        };
      }
      return {
        server: {
          proxy: {
            '/api': false,
            '/uploads': false,
          },
        },
      };
    },
    configureServer(server) {
      if (process.env.DOCKER_API) return;
      import('./server/server.js').then(({ createApp }) => {
        const app = createApp();
        server.middlewares.use(app);
      });
    },
  };
}
