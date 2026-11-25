import { ApprovalGate } from "@/components/ApprovalGate";
import { RequireSignIn } from "@/components/InternetIdentity";
import { Layout } from "@/components/Layout";
import { SignInScreen } from "@/components/SignInScreen";
import AdminPage from "@/pages/AdminPage";
import SorteoPage from "@/pages/SorteoPage";
import TeamsPage from "@/pages/TeamsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <RequireSignIn fallback={<SignInScreen />}>
      <ApprovalGate>
        <Layout>
          <Outlet />
        </Layout>
      </ApprovalGate>
    </RequireSignIn>
  ),
});

const sorteoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SorteoPage,
});

const equiposRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equipos",
  component: TeamsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  sorteoRoute,
  equiposRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
