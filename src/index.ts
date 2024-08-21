interface Env {
	HOOK_URL: string;
}

function reply(code: number, message: string) {
	return Response.json(
		{ message, error: code < 200 || code > 299 },
		{ status: code },
	);
}

type JSON = string | number | boolean | null | { [key: string]: JSON } | JSON[];

function isRecord(value: JSON): value is { [key: string]: JSON } {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		if (request.method != 'POST') {
			return reply(405, 'Only POST is allowed');
		}

		const url = new URL(request.url);

		if (url.pathname != '/') {
			return reply(404, 'Not found');
		}

		const data = await request.json<JSON>().catch(() => null);

		if (!isRecord(data)) {
			return reply(400, 'Body is required and must be an object');
		}

		const fields = Object.entries(data)
			.filter(([key]) => !key.startsWith('$'))
			.map(([key, value]) => ({
				name: `${key}`,
				value: `${value}`,
				inline: true,
			}));

		const hexColour =
			typeof data['$colour'] == 'string' ? data['$colour'] : '#2160ec';

		await fetch(env.HOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				embeds: [
					{
						color: parseInt(hexColour.slice(1), 16),
						title: data['$title'] ?? 'New Webhook',
						fields,
					},
				],
			}),
		});

		return reply(200, 'Sent!');
	},
};
