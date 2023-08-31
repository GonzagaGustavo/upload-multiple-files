import { ServerResponse } from "http";
import { Server } from "socket.io";
import url from "node:url";
import UploadHandler from "./uploadHandler";
import { pipeline } from "stream/promises";

export default class Routes {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  OPTIONS(req, res: ServerResponse) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST",
    });
  }

  async POST(req: any, res: ServerResponse) {
    const { headers } = req;
    const {
      query: { socketId },
    } = url.parse(req.url, true);

    const uploadHeandler = new UploadHandler(this.io, socketId as string);
    const busboy = uploadHeandler.registerEvents(
      headers,
      this.onFinish(res, headers.origin)
    );

    await pipeline(req, busboy);
  }

  private onFinish(res: ServerResponse, redirectTo: string) {
    return () => {
      res.writeHead(303, {
        Connection: "close",
        Location: redirectTo + "?success=true",
      });

      res.end();
    };
  }
}
