import type { LayoutServerLoad } from "./$types";

export const load = (({ params }) => {
    return {
        id: parseInt(params.id)
    }
}) satisfies LayoutServerLoad;