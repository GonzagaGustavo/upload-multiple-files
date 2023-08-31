import BusBoy from "busboy";
import { createWriteStream } from "node:fs";
import { ServerResponse } from "node:http";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Server } from "socket.io";

export default class UploadHandler {
  private io: Server;
  private socketId: string;

  constructor(io: Server, socketId: string) {
    this.io = io;
    this.socketId = socketId;
  }

  registerEvents(headers: any, onFinish: any) {
    const busboy = BusBoy({ headers });

    busboy.on("file", this.onFile.bind(this));

    busboy.on("finish", onFinish);

    return busboy;
  }

  private handleFileBytes(filename) {
    async function* handleData(data) {
      let totalSize = 0;
      for await (const item of data) {
        const size = item.length;
        totalSize += size;

        this.io.to(this.socketId).emit("file-handler", totalSize);

        yield item;
      }
      console.log(totalSize);
    }

    return handleData.bind(this);
  }

  private async onFile(fieldname: string, file: string, data: any) {
    const saveFileTo = join(
      __dirname,
      "../",
      "download",
      new Date().valueOf() + data.filename
    );
    console.log("Uploading to", saveFileTo);

    await pipeline(
      file,
      this.handleFileBytes.apply(this, [data.filename]),
      createWriteStream(saveFileTo)
    );

    console.log("File " + data.filename + " finished!");
  }
}
