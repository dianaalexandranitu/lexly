import { useState } from 'react'
import styles from './Result.module.css'

export default function Result({ docs, answers, onRestart }) {
  const [activeDoc, setActiveDoc] = useState(docs?.documents?.[0]?.id || 'terms')
  const [expandedSections, setExpandedSections] = useState({})

  if (!docs) return null

  const { documents, alerts, summary } = docs
  const currentDoc = documents.find(d => d.id === activeDoc)

  function toggleSection(sectionId) {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  function downloadDoc(doc) {
    const text = generatePlainText(doc, answers)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${answers.company_name || 'company'}-${doc.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadAll() {
    documents.forEach(doc => downloadDoc(doc))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.logo} onClick={onRestart}>Lexly</button>
        <div className={styles.headerRight}>
          <span className={styles.companyName}>{answers.company_name}</span>
          <button className={styles.downloadAll} onClick={downloadAll}>↓ Download all</button>
          <button className={styles.restartBtn} onClick={onRestart}>Start over</button>
        </div>
      </div>

      {alerts && alerts.length > 0 && (
        <div className={styles.alerts}>
          {alerts.map((alert, i) => (
            <div key={i} className={`${styles.alert} ${styles[alert.severity]}`}>
              <strong>{alert.title}</strong>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className={styles.summaryBar}>
          <span className={styles.summaryLabel}>Summary</span>
          <p>{summary}</p>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.docNav}>
          {documents.map(doc => (
            <button
              key={doc.id}
              className={`${styles.docNavItem} ${activeDoc === doc.id ? styles.docNavActive : ''}`}
              onClick={() => setActiveDoc(doc.id)}
            >
              <span className={styles.docNavTitle}>{doc.title}</span>
              <span className={styles.docNavSub}>{doc.subtitle}</span>
              <span className={styles.docNavCount}>{doc.sections?.length || 0} clauses</span>
            </button>
          ))}
        </div>

        <div className={styles.docContent}>
          {currentDoc && (
            <>
              <div className={styles.docHeader}>
                <div>
                  <h1 className={styles.docTitle}>{currentDoc.title}</h1>
                  <p className={styles.docSubtitle}>{currentDoc.subtitle}</p>
                  <div className={styles.lawTags}>
                    {currentDoc.applicable_law?.map(law => (
                      <span key={law} className={styles.lawTag}>{law}</span>
                    ))}
                  </div>
                </div>
                <button className={styles.downloadBtn} onClick={() => downloadDoc(currentDoc)}>
                  ↓ Download
                </button>
              </div>

              <div className={styles.sections}>
                {currentDoc.sections?.map((section, i) => (
                  <div
                    key={section.id}
                    className={`${styles.section} ${section.flag ? styles[`flag_${section.flag.replace('-', '_')}`] : ''}`}
                  >
                    <button
                      className={styles.sectionHeader}
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className={styles.sectionLeft}>
                        <span className={styles.sectionNum}>{i + 1}</span>
                        <span className={styles.sectionTitle}>{section.title}</span>
                        {section.flag && (
                          <span className={`${styles.flagBadge} ${styles[`badge_${section.flag.replace('-', '_')}`]}`}>
                            {section.flag === 'high-risk' ? '⚠ Important' : '🤖 AI Act'}
                          </span>
                        )}
                      </div>
                      <span className={styles.chevron}>
                        {expandedSections[section.id] ? '↑' : '↓'}
                      </span>
                    </button>

                    {expandedSections[section.id] && (
                      <div className={styles.sectionBody}>
                        <div className={styles.whyBox}>
                          <div className={styles.whyLabel}>📌 Why this clause exists</div>
                          <p className={styles.whyText}>{section.why}</p>
                        </div>
                        <div className={styles.legalBox}>
                          <div className={styles.legalLabel}>Legal text</div>
                          <p className={styles.legalText}>{section.legal_text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function generatePlainText(doc, answers) {
  const date = new Date().toLocaleDateString('en-NL')
  let text = `${doc.title.toUpperCase()}\n${doc.subtitle}\n`
  text += `Generated by Lexly for ${answers.company_name || 'Company'} | ${date}\n`
  text += `Applicable law: ${doc.applicable_law?.join(', ')}\n`
  text += '─'.repeat(60) + '\n\n'
  doc.sections?.forEach((s, i) => {
    text += `${i + 1}. ${s.title.toUpperCase()}\n\n`
    text += s.legal_text + '\n\n'
    text += '─'.repeat(40) + '\n\n'
  })
  text += '\nThis document was generated by Lexly for informational purposes. For complex structures, consult a qualified Dutch lawyer.\n'
  return text
}
