import type { ReactNode } from "react";

interface AuthCardProps {
	title: string;
	description: string;
	children: ReactNode;
	footer: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
	return (
		<div className="mx-auto w-full max-w-(--page-max-width) px-4 py-12 sm:px-6 sm:py-20">
			<div className="border-border-subtle bg-surface mx-auto w-full max-w-md rounded-lg border p-6 shadow-sm sm:p-8">
				<p className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
					Account
				</p>
				<h1 className="text-text-primary mt-1 text-xl font-semibold tracking-tight">{title}</h1>
				<p className="text-text-secondary mt-3 text-sm">{description}</p>
				<div className="mt-6">{children}</div>
				<p className="border-border-subtle text-text-secondary mt-6 border-t pt-4 text-sm">
					{footer}
				</p>
			</div>
		</div>
	);
}
