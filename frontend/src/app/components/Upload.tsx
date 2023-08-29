"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Upload() {
  useEffect(() => {
    const ioClient = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: false,
    });

    ioClient.on("connect", () => {
      console.log("connected!", ioClient.id);
    });
  }, []);

  return (
    <div className="mt-5">
      <input type="file" className="w-full" />
      <button className="h-10 w-full bg-orange-500 mt-5 rounded-b-md">
        Fazer upload
      </button>
    </div>
  );
}
