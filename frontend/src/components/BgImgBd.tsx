import type { ReactNode } from "react";
import Biodukbg from "../assets/img/biodukbg.webp";

type BgImageProps = {
  children: ReactNode;
};

export default function BgImage({ children }: BgImageProps) {
  return (
    <div
      className="bg-image min-vh-100"
      style={{
        backgroundImage: `url(${Biodukbg})`,
      }}
    >
      {children}
    </div>
  );
}
