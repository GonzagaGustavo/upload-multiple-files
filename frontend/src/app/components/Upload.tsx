"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSearchParams } from "next/navigation";

export default function Upload() {
  const [ioId, setIoId] = useState<string | null>(null);
  const [sizeUploaded, setSizeUploaded] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const msg = useSearchParams().get("msg");

  useEffect(() => {
    const ioClient = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: false,
    });

    ioClient.on("connect", () => {
      console.log("connected!", ioClient.id);
      setIoId(ioClient.id);
    });

    ioClient.on("file-handler", (data) => {
      setSizeUploaded(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      className="mt-5"
      method="POST"
      action={process.env.NEXT_PUBLIC_API_URL + `?socketId=${ioId}`}
      encType="multipart/form-data"
    >
      <p className="my-5">{msg ? msg : "Socket id: " + ioId}</p>
      <input
        type="file"
        className="w-full"
        name="file"
        onChange={(e) => setFileSize(e.target.files![0].size)}
      />
      <p className="mt-5">
        {sizeUploaded
          ? (sizeUploaded / (fileSize / 100)).toFixed(2) + "%"
          : fileSize}
      </p>
      <div className="h-[10px] w-full bg-slate-400 mt-5 rounded-sm overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{
            width: sizeUploaded
              ? (sizeUploaded / (fileSize / 100)).toFixed(2) + "%"
              : "0%",
          }}
        ></div>
      </div>
      <button
        className="h-10 w-full bg-orange-500 mt-5 rounded-b-md"
        type="submit"
      >
        Fazer upload
      </button>
    </form>
  );
}
