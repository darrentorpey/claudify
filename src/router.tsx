import {
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import HomeComponent from "./components/Home";
import SongDetailComponent from "./components/SongDetail";

const rootRoute = createRootRoute({
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: HomeComponent,
});

const songDetailRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/song/$trackId",
	component: SongDetailComponent,
});

const routeTree = rootRoute.addChildren([indexRoute, songDetailRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
