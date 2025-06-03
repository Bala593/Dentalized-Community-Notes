import Header from "../components/header";
import Footer from "../components/footer";
import Image from "next/image";
import landingpageimage1 from "../assets/landingpageimage1.png";
import landingpageimage2 from "../assets/landingpageimage2.png";
import landingpageimage3 from "../assets/landingpageimage3.png";
import BgImage from "../assets/Bg.jpg";
import { Outfit } from "next/font/google";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className={`${outfit.className} min-h-screen flex flex-col`}>
      <div className="fixed inset-0 -z-10">
        <Image
          src={BgImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute inset-0  bg-opacity-70"></div>
      </div>

      <div className="flex-grow">
        <Header />

        <main className="text-white font-sans">
          <section className="flex flex-row items-center justify-center px-24 py-20 gap-6">
            <div className="flex-col gap-5 flex">
              <div>
                {" "}
                <Image
                  src={landingpageimage1}
                  alt="landingpageimage1"
                  className="w-auto"
                />
              </div>

              <p className="text-gray-600 mx-auto lg:mx-0 text-lg max-w-xl">
                Step into a world where transparency meets technology. Empower
                your community to verify news, eliminate misinformation, and
                uphold truth using decentralized voting on blockchain
                technology.
              </p>
              <div className="flex justify-center lg:justify-start space-x-4">
                <button className="bg-[#344047] hover:bg-[#344047] px-6 py-3 rounded-lg transition">
                  <Link href="/profile">Explore NFTs</Link>
                </button>
                <button className="border border-[#344047] hover:bg-[#344047] px-6 py-3 rounded-lg transition">
                  <Link href="/collaborators">Start Minting</Link>
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center relative mb-12 lg:mb-0">
              <div className="flex space-x-4">
                <Image
                  src={landingpageimage2}
                  alt="landingpageimage2"
                  className="w-auto"
                />
              </div>
            </div>
          </section>

          <div className="px-24 py-8">
            <Link href="/collaborators">
              <Image
                src={landingpageimage3}
                alt="landingpageimage3"
                className=""
              />
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
