import Upload from "./components/Upload";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="bg-slate-900 p-4">
        <h1 className="text-2xl font-bold">
          Faça o upload de um arquivo grande
        </h1>
        <Upload />
      </div>
    </div>
  );
}
