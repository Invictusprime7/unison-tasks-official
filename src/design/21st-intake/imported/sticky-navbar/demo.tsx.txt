import { FloatingHeader } from "@/components/ui/floating-header";
import { cn } from '@/lib/utils';

export default function DemoOne() {
 return (
		<div className="relative w-full px-4">
			<FloatingHeader />
			<div className="min-h-screen py-10" />

			{/* Dots */}
			<div
				aria-hidden="true"
				className={cn(
					'absolute inset-0 -z-10 size-full',
					'bg-[radial-gradient(color-mix(in_oklab,--theme(--color-foreground/.5)30%,transparent)_2px,transparent_2px)]',
					'bg-[size:12px_12px]',
				)}
			/>
		</div>
	);
}
