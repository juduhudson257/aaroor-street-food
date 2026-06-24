import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="hero-sec">
        <div className="container hero-grid">
          <div className="hero-left">
            <h2>Find Peace.<br /><span>Live with Purpose.</span></h2>
            <p>Authentic rituals, pure puja products, and selfless service to bring positivity in your life and society.</p>
            <div className="hero-ctas">
              <Link href="/puja-products" className="primary-btn">Explore Puja Products</Link>
              <Link href="/online-homam" className="secondary-btn">Book Online Homam</Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-img-composition">
              <img src="/hero-pooja.jpg" alt="Divine Pooja Setup" />
            </div>
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <h1 className="section-title">Welcome to The Divine Voice</h1>
            <p className="section-subtitle">A spiritual destination for puja essentials, temple prasadam, and online homam services.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
