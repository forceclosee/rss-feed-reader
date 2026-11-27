import {
	type AnyRoute,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

export async function renderWithRouter(
	ui: ReactNode,
	options: { routes?: AnyRoute[]; paths?: string[]; initialEntry?: string } = {},
) {
	const { routes = [], paths = [], initialEntry = "/" } = options;
	const rootRoute = createRootRoute({ component: () => <>{ui}</> });
	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
	});
	const pathRoutes = paths.map((path) => createRoute({ getParentRoute: () => rootRoute, path }));
	const router = createRouter({
		routeTree: rootRoute.addChildren([indexRoute, ...pathRoutes, ...routes]),
		history: createMemoryHistory({ initialEntries: [initialEntry] }),
	});

	await router.load();

	return { ...render(<RouterProvider router={router} />), router };
}
