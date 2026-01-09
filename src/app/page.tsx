

import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Background } from "@/components/ui/background-components";

export default function Home() {
  const words = ["Paz", "Energia", "Bem-estar", "Fluidez", "Realização"];

  return (
    <Background>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
        <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/file.png" alt="Logo" width={40} height={40} />
            <span className="text-xl text-primary">
              <span className="font-bold">Joana</span>
              <span className="italic"> Stecanella Savi</span>
            </span>
          </div>
          <Link href="/login">
            <Button>Ver Horários Disponíveis</Button>
          </Link>
        </header>

        <div className="flex flex-col items-center justify-center h-full text-center z-10">
          <div className="text-4xl mx-auto font-normal text-primary">
            Um novo ciclo de
            <FlipWords words={words} />
          </div>
          <div className="mt-8">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary"
              >
                Ver Horários Disponíveis
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </Background>
  );
}
