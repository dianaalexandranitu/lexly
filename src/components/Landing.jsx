import styles from './Landing.module.css'

export default function Landing({ onStart }) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>Lexly</span>
        <span className={styles.tagline}>for Dutch startups</span>
      </nav>

      <main className={styles.main}>
        <div className={styles.eyebrow}>Free · No account needed · ~5 minutes</div>
        <h1 className={styles.headline}>
          Your legal docs,<br />
          <em>actually explained.</em>
        </h1>
        <p className={styles.sub}>
          Answer a few questions about your business. Get your Terms & Conditions,
          Privacy Policy, AI Act obligations, and more — generated for Dutch law,
          in plain English, with every clause explained so you know what you're signing.
        </p>

        <button className={styles.cta} onClick={onStart}>
          Generate my documents
          <span className={styles.arrow}>→</span>
        </button>

        <div className={styles.trust}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>⚖️</span>
            <span>Dutch Civil Code compliant</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🇪🇺</span>
            <span>GDPR + AI Act ready</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>📋</span>
            <span>Download as PDF</span>
          </div>
        </div>
      </main>

      <div className={styles.visual}>
        <div className={styles.docPreview}>
          <div className={styles.docHeader}>
            <div className={styles.docDot} style={{background:'#2D5A27'}} />
            <div className={styles.docDot} style={{background:'#C4520A'}} />
            <div className={styles.docDot} style={{background:'#B8B3AC'}} />
          </div>
          <div className={styles.docLine} style={{width:'70%', height:10, background:'#1A1714', borderRadius:4, marginBottom:16}} />
          <div className={styles.docBlock}>
            <div className={styles.docLabel}>📌 Why this clause exists</div>
            <div className={styles.docText}>Under Article 6:231 of the Dutch Civil Code, your T&Cs must be provided before purchase. This protects you in any dispute.</div>
          </div>
          <div className={styles.docLine} style={{width:'90%', height:6, marginBottom:8}} />
          <div className={styles.docLine} style={{width:'75%', height:6, marginBottom:8}} />
          <div className={styles.docBlock} style={{borderColor:'#C4520A', background:'#FDF0E8'}}>
            <div className={styles.docLabel} style={{color:'#C4520A'}}>⚠️ AI Act obligation</div>
            <div className={styles.docText}>Your chatbot falls under limited-risk AI. You must inform users they're interacting with an AI system.</div>
          </div>
          <div className={styles.docLine} style={{width:'85%', height:6, marginBottom:8}} />
          <div className={styles.docLine} style={{width:'60%', height:6}} />
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Lexly generates documents for informational purposes. For complex structures, consult a Dutch lawyer.</p>
      </footer>
    </div>
  )
}
