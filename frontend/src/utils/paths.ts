export const routes = {
  start: "/",
  movies: "/filmer",
  movie: "/filmer/:id",
  booking: "/bokning/:showingId",
  bookingConfirmation: "/bekraftelse",
  myPage: "/mina-sidor",
  login: "/logga-in",
  register: "/bli-medlem",
  about: "/om-oss",
  events: "/event",
  admin: "/admin",
  cookies: "/cookies",
  terms: "/villkor",
  notFound: "*",
} as const;

export const oldRoutes = {
  login: "/login",
  bookingConfirmation: "/bookingconfirmation",
} as const;

export const paths = {
  start: routes.start,
  movies: routes.movies,
  movie: (id: number | string) => `/filmer/${id}`,
  booking: (showingId: number | string) => `/bokning/${showingId}`,
  bookingConfirmation: routes.bookingConfirmation,
  myPage: routes.myPage,
  login: routes.login,
  register: routes.register,
  about: routes.about,
  events: routes.events,
  admin: routes.admin,
  cookies: routes.cookies,
  terms: routes.terms,
};
