import React from "react";
import { GlobeIcon } from "@radix-ui/react-icons";
import { BsFacebook, BsGithub, BsInstagram, BsLinkedin } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="px-8 py-8 md:px-20 md:py-16 flex flex-col gap-12 w-full ">
      {/* Links Section */}
      <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
        <div>
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32">
            <img src="/imgs/Logo.png" alt="AreoCraft Logo" />
            <span className="font-semibold text-gray-800">AreoCraft</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Get Started</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Weather</li>
              <li>Air Pressure</li>
              <li>Something else</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">About</h4>
            <ul className="space-y-2 text-gray-600">
              <li>IEEE AESS ESPRIT</li>
              <li>What is AreoCraft</li>
              <li>Contributors</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Follow us</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Linkedin</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
        <div className="text-center md:text-left">
          © 2025 IEEE AESS ESPRIT SBC·{" "}
          <a href="https://www.facebook.com/AESSESPRIT" className="underline">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="#" className="underline">
            Terms
          </a>{" "}
          ·{" "}
          <a href="#" className="underline">
            Sitemap
          </a>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-4">
          <div className="flex items-center space-x-2">
            <GlobeIcon className="w-5 h-5" />
            <span>English (US)</span>
          </div>
          <div>
            <span>USD</span>
          </div>
          <div className="flex space-x-4">
            <a 
              href="https://www.facebook.com/AESSESPRIT" 
              aria-label="Facebook" 
              className="hover:underline"
            >
              <BsFacebook className="w-5 h-5" />
            </a>
            <a 
              href="https://www.instagram.com/ieee.aess.esprit/" 
              aria-label="Instagram" 
              className="hover:underline"
            >
              <BsInstagram className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/company/ieee-aess-chapter-esprit-student-branch" 
              aria-label="LinkedIn" 
              className="hover:underline"
            >
              <BsLinkedin className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              aria-label="GitHub" 
              className="hover:underline"
            >
              <BsGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;