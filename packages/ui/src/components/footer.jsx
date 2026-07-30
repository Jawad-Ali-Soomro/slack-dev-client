import { Link } from 'react-router-dom'
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import AnimateOnScroll from './animate-on-scroll'

const footerLinks = {
  solutions: [
    { label: 'Explore', to: '/explore' },
    { label: 'Hotels', to: '/hotels' },
    { label: 'Hostels', to: '/hostels' },
    { label: 'Pharmacy', to: '/pharmacy' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Career', to: '/contact' },
    { label: 'Contact', to: '/contact' },
  ],
  learn: [
    { label: 'Blog', to: '/about' },
    { label: 'Guides', to: '/about' },
    { label: 'Documentation', to: '/about' },
    { label: 'Templates', to: '/about' },
  ],
}

const socialLinks = [
  { label: 'Twitter', icon: FaXTwitter, href: '#' },
  { label: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
  { label: 'Facebook', icon: FaFacebookF, href: '#' },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-[#f9fafb] pt-16">
      <div className="mx-auto max-w-7xl px-6 md:max-w-7xl">
        <AnimateOnScroll>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Link to="/" className="text-xl font-bold text-gray-900">
              <img src="./logo.png" className='w-50' alt="" />
              </Link>
            </div>

            <div>
              <h4 className="font-bold text-gray-900">Solutions</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.solutions.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="footer-link text-sm text-gray-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900">Company</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="footer-link text-sm text-gray-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900">Learn</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.learn.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="footer-link text-sm text-gray-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900">Follow us on</h4>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="social-icon flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition"
                    >
                      <Icon className="icon" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={120}>
          <div className="mt-12 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            © Multi-Tenants 2026. All Rights Reserved.
          </div>
        </AnimateOnScroll>
      </div>
    </footer>
  )
}
