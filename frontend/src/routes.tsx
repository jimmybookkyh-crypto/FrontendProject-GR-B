import { createElement, type ComponentType } from "react";

type PageComponent = ComponentType & {
  route: {
    path?: string;
    order: number;
  };
};

const pages = import.meta.glob("./pages/*.tsx", { eager: true });

const routes = Object.values(pages)
  .map((page) => (page as { default: PageComponent }).default)
  .map((page) => ({ ...page.route, element: createElement(page) }))
  .sort((a, b) => a.order - b.order);

export default routes;
