import { RefObject, useState } from "react";

interface GenerateProps {
  scrollRef: RefObject<HTMLDivElement>;
}

const Generate = ({ scrollRef }: GenerateProps) => {
  const [activeTab, setActiveTab] = useState("file");

  return (
    <section
      className="w-full flex flex-col gap-12 px-16 py-24"
      ref={scrollRef}
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-5xl">Commencez votre transcription</h2>
        <p>Choisissez un fichier depuis votre appareil ou entrez une URL</p>
      </div>
      <div className="w-full flex flex-col bg-dark rounded-xl">
        <div role="tablist" className="flex bg-lightDark rounded-t-xl">
          <button
            type="button"
            role="tab"
            className={`p-6 grow rounded-t-xl ${activeTab === "file" ? "bg-dark" : ""}`}
            onClick={() => setActiveTab("file")}
          >
            Depuis votre appareil
          </button>
          <button
            type="button"
            role="tab"
            className={`p-6 grow rounded-t-xl ${activeTab === "url" ? "bg-dark" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            Depuis une URL
          </button>
        </div>
        <div
          role="tabpanel"
          className={`px-8 py-12 ${activeTab === "file" ? "" : "hidden"}`}
        >
          file
        </div>
        <div
          role="tabpanel"
          className={`${activeTab === "url" ? "" : "hidden"}`}
        >
          url
        </div>
      </div>
    </section>
  );
};

export default Generate;
