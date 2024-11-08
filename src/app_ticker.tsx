// file: src/app_ticker.tsx
import { MetaProvider, Title } from '@solidjs/meta';
import { createStore } from 'solid-js/store';
import { For, onMount } from 'solid-js';

// Custom types
type Message = {
	text: string;
	user: string;
	createdAt: string;
};

type WsContext = {
	ws: WebSocket | undefined;
	href: string;
	onMessage: (event: MessageEvent<string>) => void;
	log: (user: string, ...args: Array<string>) => void;
	clear: () => void;
	send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
};

const APPLICATION_ID = 'app_ticker';

// Top level helpers
const gravatarSuffix = Math.random().toString();
const gravatarHref = (user: string) =>
	`https://www.gravatar.com/avatar/${encodeURIComponent(user + gravatarSuffix)}?s=512&d=monsterid`;

const hrefToWs = `ws://localhost:8080`;

// WebSocket related
function wsConnect(ctx: WsContext) {
	if (ctx.ws) {
		ctx.log('ws', 'Closing previous connection before reconnecting…');
		ctx.ws.close();
		ctx.ws = undefined;
		ctx.clear();
	}

	ctx.log('ws', 'Connecting to', ctx.href, '…');
	const ws = new WebSocket(ctx.href);

	ws.addEventListener('message', ctx.onMessage);
	ws.addEventListener('open', () => {
		ctx.ws = ws;
		ctx.log('ws', 'Connected!');
	});
}

export default function AppTicker() {
	// Message scrolling
	let messageList: HTMLDivElement | undefined;
	const scrollToEnd = () => {
		if (!messageList) return;

		messageList.scrollIntoView({
			block: 'end',
			inline: 'start',
			behavior: 'smooth',
		});
	};
	const scroll = () => requestAnimationFrame(scrollToEnd);

	// Store of messages to be displayed; adding and clearing
	const [messages, setMessages] = createStore<Array<Message>>([]);

	const log = (user: string, ...args: Array<string>) => {
		console.log('[ws]', user, ...args);
		const message = {
			text: args.join(' '),
			user,
			createdAt: new Date().toLocaleString(),
		};
		const index = messages.length;
		setMessages(index, message);
		scroll();
	};

	const clear = () => {
		setMessages([]);
		log(APPLICATION_ID, 'previous messages cleared');
	};
  
	// Websocket message handler & support
	const onMessage = (event: MessageEvent<string>) => {
		const { symbol, currency,  open, high, low } = event.data.startsWith('{')
			? (JSON.parse(event.data) as 
      { currency: string, symbol: string,  open: number, high: number, low: number
       })
			: { currency: "", symbol: "",  open:0, high: 0, low: 0 };

		log(currency, symbol,  `${open}, ${high}, ${low}`);
	};

	let wsContext: WsContext;
	const connect = () => wsConnect(wsContext);
	const ping = () => {
		if (!wsContext.ws) return;

		log('ws', 'Sending ping');
		wsContext.send('ping');
	};

	onMount(() => {
		// Initialize once monted client side
		wsContext = {
			ws: undefined,
			href: hrefToWs,
			onMessage,
			log,
			clear,
			send: (data) => wsContext.ws?.send(data),
		};
		connect();
	});

	// Chatbox
	let chatMessage: HTMLInputElement | undefined;
	const send = () => {
		if (!chatMessage || !chatMessage.value || !wsContext.ws) return;

		console.log('sending message…');
		wsContext.send(chatMessage.value);
		chatMessage.value = '';
	};
	const sendMessage = (event: KeyboardEvent) => {
		if (event.key === 'Enter') send();
	};

	return (
		<MetaProvider>
			<Title>Ticker</Title>
			<main>
				<div id="messages" ref={messageList}>
					<For each={messages}>
						{(message) => (
							<div class="c-message">
								<div>
									<p class="c-message__annotation">{message.symbol}</p>
									<div class="c-message__card">
										<img src={gravatarHref(message.user)} alt="Avatar" />
										<div>
											<p>{message.text}</p>
										</div>
									</div>
									<p class="c-message__annotation">{message.createdAt}</p>
								</div>
							</div>
						)}
					</For>
				</div>
				<div class="c-chatbox">
					<div class="c-chatbox__message">
						<input
							type="text"
							placeholder="Type your message…"
							ref={chatMessage}
							onKeyDown={sendMessage}
						/>
					</div>
					<div class="c-chatbox__menu">
						<button onClick={send}>Send</button>
						<button onClick={ping}>Ping</button>
						<button onClick={connect}>Reconnect</button>
						<button onClick={clear}>Clear</button>
					</div>
				</div>
			</main>
		</MetaProvider>
	);
}
