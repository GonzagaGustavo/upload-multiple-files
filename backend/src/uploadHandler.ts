import BusBoy from "busboy";
import { spawn } from "node:child_process";
import { createWriteStream, unlinkSync } from "node:fs";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import path, { join } from "node:path";
import { Server } from "socket.io";
import internal from "node:stream";
import * as tmp from "tmp";
import { pipeline } from "node:stream/promises";
import progressStream from "ffmpeg-progress-stream";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";

export default class UploadHandler {
  private io: Server;
  private socketId: string;

  constructor(io: Server, socketId: string) {
    this.io = io;
    this.socketId = socketId;
  }

  registerEvents(headers: any, onFinish: any) {
    const busboy = BusBoy({ headers });

    busboy.on("file", this.onFile.bind(this, onFinish));

    // busboy.on("finish", onFinish);

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

  private async onFile(
    onFinish: any,
    name: string,
    stream: internal.Readable,
    info: BusBoy.FileInfo
  ) {
    const saveFileTo = join(
      __dirname,
      "../",
      "download",
      `${new Date().valueOf()}_${name}`
    );

    const tempFilePath = tmp.tmpNameSync({
      postfix: path.extname(info.filename),
    });

    await pipeline(stream, createWriteStream(tempFilePath));

    const frames = await this.getTotalFrames(tempFilePath);

    const ffmpegProcess = spawn(ffmpegPath, [
      `-i`,
      `${tempFilePath}`,
      "-vcodec",
      "libx264",
      "-b:v",
      "200k",
      "-c:a",
      "aac",
      "-vf",
      `scale=-2:480`,
      "-f",
      "mp4",
      `${saveFileTo}.mp4`,
    ]);

    ffmpegProcess.stderr
      .pipe(progressStream(frames))
      .on("data", (data) => console.log(`${data.progress.toFixed(2)}%`));

    ffmpegProcess.stdout.on("end", () => {
      ffmpegProcess.kill();
      unlinkSync(tempFilePath);
      onFinish();
      console.log("File " + info.filename + " finished!");
    });
  }

  private async getTotalFrames(file: string): Promise<number> {
    const info = await ffprobe(file, { path: ffprobeStatic.path });
    const videoStream = info.streams.find(
      (stream) => stream.codec_type === "video"
    );
    // Get the total frame information from the nb_frames property
    const totalFrames = videoStream.nb_frames;

    return Number(totalFrames);
  }
}
