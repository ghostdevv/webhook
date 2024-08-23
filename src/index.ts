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

async function parseBody(request: Request) {
	const data = await request.json<JSON>().catch(() => null);

	if (typeof data != 'object' || data == null) {
		return null;
	}

	const dataArray = Array.isArray(data) ? data : [data];

	return dataArray.filter(
		(item): item is { [key: string]: JSON } =>
			typeof item == 'object' && item != null && !Array.isArray(item),
	);
}

interface EmbedField {
	name: string;
	value: string;
	inline?: boolean;
}

interface Embed {
	// timestamp?: string;
	// url?: string;
	// footer?: string;
	description?: string;
	author?: string;
	title?: string;
	color?: number;
	fields: EmbedField[];
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

		const data = await parseBody(request);

		if (!data) {
			return reply(400, 'A valid object/array body is required');
		}

		const embeds = data.map(
			(data): Embed => ({
				title:
					typeof data['$title'] == 'string'
						? data['$title']
						: 'New Webhook',
				description:
					typeof data['$description'] == 'string'
						? data['$description']
						: undefined,
				color: parseInt(
					typeof data['$colour'] == 'string'
						? data['$colour'].slice(1)
						: '2160ec',
					16,
				),
				fields: Object.entries(data)
					.filter(([key]) => !key.startsWith('$'))
					.map(
						([key, value]): EmbedField => ({
							name: `${key}`,
							value: `${value}`,
							inline: true,
						}),
					),
			}),
		);

		await fetch(env.HOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				embeds,
			}),
		});

		return reply(200, 'Sent!');
	},
};
