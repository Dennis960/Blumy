import type { RequestHandler } from './$types';

export const GET = (async (event) => {
	event.locals.security.allowAll();
	const url = 'http://firmware.blumy.cloud/Board.wrl';

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch VRML file: ${response.statusText}`);
	}
	const data = await response.blob();

	return new Response(data, {
		headers: {
			'Content-Type': 'model/vrml',
			'Content-Disposition': 'inline; filename="Board.wrl"'
		}
	});
}) satisfies RequestHandler;
