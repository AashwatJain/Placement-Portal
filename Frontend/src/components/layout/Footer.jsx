import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  Heart
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Section: 4 Columns Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 pb-12">

          {/* Column 1: Branding & Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-blue-600">
                <span className="font-bold">N</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Placement Portal
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Bridging the gap between talent and opportunity. The official placement platform for NIT Kurukshetra.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.linkedin.com/school/nit-kurukshetra/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 transition hover:text-blue-600 dark:hover:text-blue-400">
                <Linkedin size={20} />
              </a>
              <a href="https://twitter.com/nitkkr_official" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 transition hover:text-blue-400 dark:hover:text-blue-300">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/nitkkr_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 transition hover:text-pink-600 dark:hover:text-pink-400">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/student" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/student/opportunities" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Opportunities</Link>
              </li>
              <li>
                <Link to="/student/interview-experiences" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Interview Experiences</Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Placement Calendar</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://nitkkr.ac.in/tnp-placement-policy" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Placement Policy</a>
              </li>
              <li>
                <Link to="/student/resume-builder" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Resume Vault</Link>
              </li>
              <li>
                <Link to="/student/company" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Companies</Link>
              </li>
              <li>
                <Link to="/student/coding-profiles" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Coding Profiles</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  Training & Placement Cell,<br />
                  NIT Kurukshetra,<br />
                  Haryana - 136119
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <a href="mailto:tnp@nitkkr.ac.in" className="hover:text-blue-600 transition">tnp@nitkkr.ac.in</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <span>+91-12345-67890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Credit */}
        <div className="border-t border-slate-200 py-6 text-center text-sm dark:border-slate-800 sm:text-left">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p>
              &copy; {currentYear} NIT Kurukshetra. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
              Designed & Developed with <Heart size={14} className="fill-red-500 text-red-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}