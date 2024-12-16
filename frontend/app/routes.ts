import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("board/:id", "routes/board.tsx"),
    route("404", "routes/notfound.tsx"),
] satisfies RouteConfig;
