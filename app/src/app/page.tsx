import { memory } from "@/lib/memory";

export default function Home() {
	return <div>{JSON.stringify(memory)}</div>;
}
