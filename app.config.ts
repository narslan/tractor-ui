// file: app.config.ts
// compare: https://docs.solidjs.com/solid-start/advanced/websocket
//
import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
	ssr: false,
	server: {
		experimental: {
			websocket: true,
		},
	},
}).addRouter({
	name: '_ws',
	type: 'http',
	handler: './src/server/ws.ts',
	target: 'server',
	base: '/_ws',
});
