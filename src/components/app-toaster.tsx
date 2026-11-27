import { Toast, ToastClose, ToastDescription, ToastRegion, ToastTitle } from "@ui-sdk/react/toast";
import { CircleCheck, OctagonX } from "lucide-react";
import { toast } from "#/lib/toast";

export function AppToaster() {
	return (
		<ToastRegion toaster={toast} side="bottom" align="end" aria-label="Notifications">
			{() => (
				<Toast className="border-border-subtle bg-surface text-text-primary shadow-lg">
					<CircleCheck
						data-show="success"
						aria-hidden="true"
						className="text-success size-4 self-start"
					/>
					<OctagonX data-show="error" aria-hidden="true" className="text-error size-4 self-start" />
					<div data-slot="stack" className="min-w-0 flex-1">
						<ToastTitle className="text-text-primary text-sm font-semibold" />
						<ToastDescription className="text-text-secondary mt-1 text-sm" />
					</div>
					<ToastClose
						aria-label="Dismiss notification"
						className="text-text-secondary hover:text-text-primary"
					/>
				</Toast>
			)}
		</ToastRegion>
	);
}
