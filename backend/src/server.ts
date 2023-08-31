import http, { ServerResponse } from "http";
import { Server } from "socket.io";
import Routes from "./routes";
const PORT = 3001;

const handler = (req, res: ServerResponse) => {
  const defaultRoute = async (req, res: ServerResponse) => res.end("Hello");

  const routes = new Routes(io);
  const chosen = routes[req.method] || defaultRoute;

  return chosen.apply(routes, [req, res]);
};

const server = http.createServer(handler);
const io = new Server(server, { cors: { origin: "*", credentials: false } });

io.on("connection", (socket) => console.log(`someone connected`, socket.id));

const startServer = () => {
  console.log(`server runing at http://localhost:${PORT}`);
};

server.listen(PORT, startServer);
