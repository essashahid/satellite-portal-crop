import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Pakistan Satellite Imagery
            </h3>
            <p className="mb-4">
              Advanced satellite imagery and NDBI analysis for agricultural
              monitoring and optimization across Pakistan.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Data Access
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Satellite Imagery
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  NDBI Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Crop Monitoring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Agricultural Insights
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Custom Reports
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-emerald-500" />
                <a
                  href="mailto:info@paksat-imagery.com"
                  className="hover:text-white transition-colors"
                >
                  info@paksat-imagery.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-emerald-500" />
                <a
                  href="tel:+92123456789"
                  className="hover:text-white transition-colors"
                >
                  +92 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} Pakistan Satellite Crop Imagery
            Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
