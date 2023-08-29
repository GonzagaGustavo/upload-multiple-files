import http, { ServerResponse } from "http";
import { Server } from "socket.io";
const PORT = 3001;

const handler = (req, res: ServerResponse) => {
  const defaultRoute = async (req, res: ServerResponse) => res.end("Hello");

  return defaultRoute(req, res);
};

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*", credentials: false } });

io.on("connection", (socket) => console.log(`someone connected`, socket.id));

const startServer = () => {
  console.log(`server runing at http://localhost:${PORT}`);
};

server.listen(PORT, startServer);
