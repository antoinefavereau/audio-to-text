import Image from "next/image";
import Button from "../ui/Button";
import { RefObject } from "react";

interface TopSectionProps {
  scrollRef: RefObject<HTMLDivElement | null>;
}

const TopSection = ({ scrollRef }: TopSectionProps) => {
  const scrollToContent = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-start gap-6 md:gap-8 px-8 md:px-24 py-8">
      <Image
        className="absolute z-[-1] max-w-[1000px] w-2/3 h-auto top-1/2 right-8 transform -translate-y-1/2 hidden md:block"
        src="/sound.png"
        alt="sound background"
        width={1000}
        height={500}
      />
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-semibold leading-snug max-w-[800px]">
        Transformez vos audio en texte facilement
      </h1>
      <p className="text-lg sm-text-xl md:text-2xl max-w-[600px] text-light">
        Convertissez instantanément vos fichiers audio et vidéo en texte pour ne
        jamais manquer l&apos;essentiel.
      </p>
      <Button onClick={scrollToContent}>Transcription audio</Button>
    </div>
  );
};

export default TopSection;
