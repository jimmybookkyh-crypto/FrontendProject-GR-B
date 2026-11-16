import { createElement, type ComponentType } from "react";
import LegacyRedirect from "./components/LegacyRedirect.tsx";
import { legacyRoutes, paths } from "./utils/paths.ts";

type PageComponent = ComponentType & {
  route: {
    path?: string;
    order: number;
  };
};

const pages = import.meta.glob("./pages/*.tsx", { eager: true });

const pageRoutes = Object.values(pages)
  .map((page) => (page as { default: PageComponent }).default)
  .map((page) => ({ ...page.route, element: createElement(page) }))
  .sort((a, b) => a.order - b.order);

const legacyRedirects = [
  {
    path: legacyRoutes.login,
    element: createElement(LegacyRedirect, { to: paths.login }),
  },
  {
    path: legacyRoutes.myPage,
    element: createElement(LegacyRedirect, { to: paths.myPage }),
  },
  {
    path: legacyRoutes.bookingConfirmation,
    element: createElement(LegacyRedirect, { to: paths.bookingConfirmation }),
  },
];

const routes = [...pageRoutes, ...legacyRedirects];

export default routes;
