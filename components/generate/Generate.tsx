import { RefObject, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button, { baseButtonClasses, variantButtonClasses } from "../ui/Button";

interface GenerateProps {
  scrollRef: RefObject<HTMLDivElement | null>;
}

const Generate = ({ scrollRef }: GenerateProps) => {
  const [activeTab, setActiveTab] = useState("file");
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [textResult, setTextResult] = useState("");

  const changeTab = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setStep(1);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setFileName(acceptedFiles[0].name.replace(/\.\w+$/, ".txt"));
      setStep(2);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [] },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) return;

    setStep(3);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setTextResult(data.transcription);
      setFileName(file.name.replace(/\.\w+$/, ".txt"));
      setStep(4);
    } catch (error) {
      setStep(1);
      alert("Une erreur est survenue lors de la transcription : " + error);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([textResult], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section
      className="w-full flex flex-col items-center gap-24 px-16 py-24"
      ref={scrollRef}
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-5xl">Commencez votre transcription</h2>
        <p>Choisissez un fichier depuis votre appareil ou entrez une URL</p>
      </div>
      <div className="w-full max-w-4xl flex flex-col bg-dark rounded-xl">
        <div role="tablist" className="flex bg-lightDark rounded-t-xl">
          <button
            type="button"
            role="tab"
            className={`p-6 grow rounded-t-xl ${
              activeTab === "file" ? "bg-dark" : ""
            }`}
            onClick={() => changeTab("file")}
          >
            Depuis votre appareil
          </button>
          <button
            type="button"
            role="tab"
            className={`p-6 grow rounded-t-xl ${
              activeTab === "url" ? "bg-dark" : ""
            }`}
            onClick={() => changeTab("url")}
          >
            Depuis une URL
          </button>
        </div>
        <div
          role="tabpanel"
          className={`px-8 py-12 ${activeTab !== "file" && "hidden"}`}
        >
          <div
            className={`flex flex-col items-center gap-8 rounded ${
              step === 1
                ? "border-2 border-dashed border-light px-8 py-16"
                : "p-4"
            } ${isDragActive ? "bg-transparent" : ""}`}
            {...(step === 1 ? getRootProps() : {})}
          >
            <form
              className="contents"
              onSubmit={handleSubmit}
              encType="multipart/form-data"
            >
              {step === 1 && (
                <>
                  <input {...getInputProps()} />
                  <p className="text-light">
                    {isDragActive
                      ? "Déposez le fichier ici..."
                      : "Glissez-déposez votre fichier audio ou cliquez pour sélectionner depuis votre appareil."}
                  </p>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    onChange={(event) => {
                      setStep(2);
                      setFile(event.currentTarget.files?.[0] || null);
                    }}
                    hidden
                  />
                  <label
                    htmlFor="file"
                    className={
                      baseButtonClasses + " " + variantButtonClasses.secondary
                    }
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 56 55"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M41.75 13.75H46.3333M46.3333 13.75H50.9167M46.3333 13.75V9.16667M46.3333 13.75V18.3333"
                        stroke="currentcolor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M49.5417 45.8333H6.45837C5.69898 45.8333 5.08337 45.2178 5.08337 44.4583V25.2083H49.5417C50.3012 25.2083 50.9167 25.8239 50.9167 26.5833V44.4583C50.9167 45.2178 50.3012 45.8333 49.5417 45.8333Z"
                        stroke="currentcolor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.08337 25.2083V10.5417C5.08337 9.78228 5.69898 9.16667 6.45837 9.16667H20.6164C20.9446 9.16667 21.262 9.2841 21.5112 9.4977L28.7597 15.7106C29.0088 15.9242 29.3262 16.0417 29.6546 16.0417H32.5834"
                        stroke="currentcolor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Choisir le fichier</span>
                  </label>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="flex justify-between items-center flex-wrap gap-6 bg-white text-black px-8 py-3 rounded-xl w-full">
                    <span>{file?.name}</span>
                    <input
                      hidden
                      type="file"
                      name="file"
                      id="file"
                      onChange={(event) => {
                        setFile(event.currentTarget.files?.[0] || null);
                      }}
                    />
                    <label
                      htmlFor="file"
                      className={
                        baseButtonClasses + " " + variantButtonClasses.secondary
                      }
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 56 55"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M41.75 13.75H46.3333M46.3333 13.75H50.9167M46.3333 13.75V9.16667M46.3333 13.75V18.3333"
                          stroke="currentcolor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M49.5417 45.8333H6.45837C5.69898 45.8333 5.08337 45.2178 5.08337 44.4583V25.2083H49.5417C50.3012 25.2083 50.9167 25.8239 50.9167 26.5833V44.4583C50.9167 45.2178 50.3012 45.8333 49.5417 45.8333Z"
                          stroke="currentcolor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.08337 25.2083V10.5417C5.08337 9.78228 5.69898 9.16667 6.45837 9.16667H20.6164C20.9446 9.16667 21.262 9.2841 21.5112 9.4977L28.7597 15.7106C29.0088 15.9242 29.3262 16.0417 29.6546 16.0417H32.5834"
                          stroke="currentcolor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Choisir le fichier</span>
                    </label>
                  </div>
                  <div className="flex flex-col w-full">
                    {/* liste d'informations sur le fichier */}
                    <span>Taille du fichier : {file?.size} octets</span>
                    <span>Type de fichier : {file?.type}</span>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                    >
                      Retour
                    </Button>
                    <Button type="submit" variant="tertiary">
                      Transcrire
                    </Button>
                  </div>
                </>
              )}
            </form>
            {step === 3 && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-light">Transcription en cours...</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  width="100"
                  height="100"
                >
                  <g>
                    <circle
                      strokeDasharray="164.93361431346415 56.97787143782138"
                      r="35"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="none"
                      cy="50"
                      cx="50"
                    >
                      <animateTransform
                        keyTimes="0;1"
                        values="0 50 50;360 50 50"
                        dur="1s"
                        repeatCount="indefinite"
                        type="rotate"
                        attributeName="transform"
                      ></animateTransform>
                    </circle>
                    <g></g>
                  </g>
                </svg>
              </div>
            )}
            {step === 4 && (
              <>
                <Button variant="transparent" onClick={handleDownload}>
                  {fileName}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 43.5835V25.9585M24 25.9585L30.8542 32.8127M24 25.9585L17.1459 32.8127"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M39.6667 34.9808C42.5919 33.8348 45.5417 31.2239 45.5417 25.9582C45.5417 18.1248 39.014 16.1665 35.75 16.1665C35.75 12.2498 35.75 4.4165 24 4.4165C12.25 4.4165 12.25 12.2498 12.25 16.1665C8.98615 16.1665 2.45837 18.1248 2.45837 25.9582C2.45837 31.2239 5.40817 33.8348 8.33337 34.9808"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
                <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button variant="tertiary" onClick={handleDownload}>
                    Télécharger
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div role="tabpanel" className={`${activeTab !== "url" && "hidden"}`}>
          <div className="flex flex-col items-center gap-8 px-12 py-16 rounded">
            <form
              className="contents"
              onSubmit={() =>
                alert("La transcription par URL n'est pas encore disponible.")
              }
            >
              {step === 1 && (
                <>
                  <p className="text-light">
                    {
                      "Collez l'URL de votre fichier en ligne pour commencer la transcription."
                    }
                  </p>
                  <label htmlFor="url" className="hidden">
                    URL
                  </label>
                  <input
                    type="text"
                    name="url"
                    id="url"
                    className="flex gap-4 items-center duration-100 p-4 rounded-xl px-6 py-4 bg-transparent hover:bg-transparentLight w-full max-w-[600px]"
                    placeholder="https://antoinefavereau.fr"
                  />
                  <Button type="submit" variant="tertiary">
                    Transcrire
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Generate;
