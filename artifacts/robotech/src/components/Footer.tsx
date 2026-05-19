import type { T } from "../hooks/useLang";

interface FooterProps {
  t: T;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="site-footer-new">
      <div className="footer-grid">
        <div className="footer-col">
          <h4 className="footer-title">{t.footerContact}</h4>
          <div className="footer-contact">
            <a href="tel:+212703098471" className="footer-link">
              <i className="fas fa-phone" /> +212 703 098 471
            </a>
          </div>
        </div>

        <div className="footer-col footer-col-right">
          <h4 className="footer-title">{t.footerFollow}</h4>
          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn" className="footer-social"><i className="fab fa-linkedin-in" /></a>
            <a href="#" aria-label="Instagram" className="footer-social"><i className="fab fa-instagram" /></a>
            <a href="#" aria-label="Facebook" className="footer-social"><i className="fab fa-facebook-f" /></a>
            <a href="#" aria-label="YouTube" className="footer-social"><i className="fab fa-youtube" /></a>
            <a href="#" aria-label="WhatsApp" className="footer-social"><i className="fab fa-whatsapp" /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <i className="fas fa-robot" style={{ marginInlineEnd: 6, color: "var(--accent)" }} />
        {t.footer}
      </div>
    </footer>
  );
}
