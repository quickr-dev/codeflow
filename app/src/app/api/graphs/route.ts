import { memory } from "@/lib/memory";
import type { NextRequest } from "next/server";

// @codeflow graphs->api
export const POST = async (req: NextRequest) => {
	const data = await req.json();
	memory.graph = data;
	console.log(">>>", data);

	return new Response(null, {
		status: 200,
	});
};
