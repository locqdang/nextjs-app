import Link from 'next/link';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>© {new Date().getFullYear()} Vietpolyglots</p>
        <nav className="footer__links" aria-label="Legal">
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
