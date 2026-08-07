import type { T } from "../hooks/useLang";
import { useSiteSettings } from "../hooks/useSiteSettings";

interface FooterProps {
  t: T;
}

export default function Footer({ t }: FooterProps) {
  const s = useSiteSettings();
  const phone = s.footerPhone || "+212 703 098 471";
  const socials = [
    { url: s.socialFacebook, icon: "fa-facebook-f", label: "Facebook" },
    { url: s.socialInstagram, icon: "fa-instagram", label: "Instagram" },
    { url: s.socialYoutube, icon: "fa-youtube", label: "YouTube" },
    { url: s.socialWhatsapp, icon: "fa-whatsapp", label: "WhatsApp" },
  ].filter(x => x.url);

  return (
    <footer className="site-footer-new">
      <div className="footer-grid">
        <div className="footer-col">
          <h4 className="footer-title">{t.footerContact}</h4>
          <div className="footer-contact">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="footer-link">
              <i className="fas fa-phone" /> <span dir="ltr">{phone}</span>
            </a>
          </div>
        </div>

        <div className="footer-col footer-col-right">
          <h4 className="footer-title">{t.footerFollow}</h4>
          <div className="footer-socials">
            {socials.length > 0 ? socials.map(x => (
              <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="footer-social">
                <i className={`fab ${x.icon}`} />
              </a>
            )) : (
              <>
                <a href="#" aria-label="LinkedIn" className="footer-social"><i className="fab fa-linkedin-in" /></a>
                <a href="#" aria-label="Instagram" className="footer-social"><i className="fab fa-instagram" /></a>
                <a href="#" aria-label="Facebook" className="footer-social"><i className="fab fa-facebook-f" /></a>
                <a href="#" aria-label="YouTube" className="footer-social"><i className="fab fa-youtube" /></a>
                <a href="#" aria-label="WhatsApp" className="footer-social"><i className="fab fa-whatsapp" /></a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <i className="fas fa-robot" style={{ marginInlineEnd: 6, color: "var(--accent)" }} />
        {s.footerText || t.footer}
      </div>
    </footer>
  );
}
