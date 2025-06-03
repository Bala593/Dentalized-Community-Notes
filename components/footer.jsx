import {
  FaFacebookF,
  FaPinterestP,
  FaDiscord,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import Image from "next/image";
import logo from "../assets/logo.png";
import Link from "next/link";
export default function Footer() {
  return (
    <div className=" text-white px-24 py-8 bg-transparent">
      <div className="border p-4 rounded-2xl pt-24  px-16  border-dashed border-gray-700 hover:border-[#344047] transition-all duration-300 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center ">
              <Image src={logo} alt={logo} className="w-40" />
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Step into a world where transparency meets technology. Empower
              your community to verify news, eliminate misinformation, and
              uphold truth using decentralized voting on blockchain technology.
            </p>
            <div className="flex space-x-3 text-lg">
              <Link href="#" className="hover:text-[#344047]">
                <FaFacebookF />
              </Link>
              <Link href="#" className="hover:text-[#344047]">
                <FaPinterestP />
              </Link>
              <Link href="#" className="hover:text-[#344047]">
                <FaDiscord />
              </Link>
              <Link href="#" className="hover:text-[#344047]">
                <FaYoutube />
              </Link>
              <Link href="#" className="hover:text-[#344047]">
                <FaTiktok />
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="bg-[#344047] text-white px-8 py-3 rounded-full font-semibold hover:[#344047] transition">
              Try Now
            </button>
          </div>

          <div className="text-sm text-left ">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#344047]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/News" className="hover:text-[#344047]">
                  News
                </Link>
              </li>
              <li>
                <Link href="/CommunityChat" className="hover:text-[#344047]">
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 border-t border-gray-800 pt-6">
          <p>2025 © Copyright Truthly. All Rights Reserved</p>
          <div className="space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">
              Terms Of Service
            </a>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
