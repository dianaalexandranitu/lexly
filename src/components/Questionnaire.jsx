import { useState } from 'react'
import { QUESTIONS, SECTIONS } from '../questions.js'
import { generateDocuments } from '../api.js'
import styles from './Questionnaire.module.css'

export default function Questionnaire({ onComplete, onBack }) {
  const [answers, setAnswers] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGenerate, setShowGenerate] = useState(false)

  const visibleQuestions = QUESTIONS.filter(q => !q.condition || q.condition(answers))
  const current = visibleQuestions[currentIdx]
  const progress = ((currentIdx) / visibleQuestions.length) * 100

  const answer = answers[current?.id]

  function handleSingle(value) {
    setAnswers(prev => ({ ...prev, [current.id]: value }))
  }

  function handleMulti(value) {
    const prev = answers[current.id] || []
    const next = prev.includes(value)
      ? prev.filter(v => v !== value)
      : [...prev, value]
    setAnswers(a => ({ ...a, [current.id]: next }))
  }

  function handleText(value) {
    setAnswers(prev => ({ ...prev, [current.id]: value }))
  }

  function canProceed() {
    if (current.type === 'text') return answer && answer.trim().length > 0
    if (current.type === 'single') return !!answer
    if (current.type === 'multi') return answer && answer.length > 0
    return false
  }

  function next() {
    if (currentIdx < visibleQuestions.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setShowGenerate(true)
    }
  }

  function prev() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1)
    else onBack()
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const docs = await generateDocuments(answers)
      onComplete(answers, docs)
    } catch (e) {
      setError(e.message || 'Generation failed. Please try again.')
      setLoading(false)
    }
  }

  if (showGenerate) {
    return (
      <div className={styles.page}>
        <div className={styles.apiCard}>
          <h2>Ready to generate</h2>
          <p>All questions answered. Click below to generate your legal documents.</p>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.apiButtons}>
            <button className={styles.backBtn} onClick={() => setShowGenerate(false)}>← Back</button>
            <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} /> Generating your documents…
                </span>
              ) : 'Generate my documents →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const sectionName = current?.section
  const sectionIndex = SECTIONS.indexOf(sectionName)

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <button className={styles.logoBtn} onClick={onBack}>Lexly</button>
        <div className={styles.sectionNav}>
          {SECTIONS.map((s, i) => (
            <div
              key={s}
              className={`${styles.sectionItem} ${s === sectionName ? styles.active : ''} ${i < sectionIndex ? styles.done : ''}`}
            >
              <span className={styles.sectionDot} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.questionWrap}>
          <div className={styles.sectionTag}>{current?.section}</div>
          <h2 className={styles.questionText}>{current?.text}</h2>
          {current?.hint && <p className={styles.hint}>{current.hint}</p>}

          <div className={styles.options}>
            {current?.type === 'single' && current.options.map(opt => (
              <button
                key={opt}
                className={`${styles.option} ${answer === opt ? styles.selected : ''}`}
                onClick={() => handleSingle(opt)}
              >
                <span className={styles.optionRadio}>
                  {answer === opt && <span className={styles.radioFill} />}
                </span>
                {opt}
              </button>
            ))}

            {current?.type === 'multi' && current.options.map(opt => (
              <button
                key={opt}
                className={`${styles.option} ${(answer || []).includes(opt) ? styles.selected : ''}`}
                onClick={() => handleMulti(opt)}
              >
                <span className={styles.optionCheck}>
                  {(answer || []).includes(opt) && '✓'}
                </span>
                {opt}
              </button>
            ))}

            {current?.type === 'text' && (
              <input
                className={styles.textInput}
                type="text"
                placeholder={current.placeholder || ''}
                value={answer || ''}
                onChange={e => handleText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canProceed() && next()}
                autoFocus
              />
            )}
          </div>

          <div className={styles.nav}>
            <button className={styles.backBtn} onClick={prev}>← Back</button>
            <div className={styles.navRight}>
              <span className={styles.counter}>{currentIdx + 1} / {visibleQuestions.length}</span>
              <button
                className={styles.nextBtn}
                onClick={next}
                disabled={!canProceed()}
              >
                {currentIdx === visibleQuestions.length - 1 ? 'Generate documents →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
