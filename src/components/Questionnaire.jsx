import { useState, useEffect } from 'react'
import { QUESTIONS, SECTIONS } from '../questions.js'
import { generateDocuments } from '../api.js'
import styles from './Questionnaire.module.css'

export default function Questionnaire({ onComplete, onBack }) {
  const [answers, setAnswers] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiPrompt, setShowApiPrompt] = useState(false)

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
      setShowApiPrompt(true)
    }
  }

  function prev() {
    if (currentIdx > 0) setCurrentIdx(i => i - 1)
    else onBack()
  }

  async function handleGenerate() {
    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const docs = await generateDocuments(answers, apiKey)
      onComplete(answers, docs)
    } catch (e) {
      setError(e.message || 'Generation failed. Check your API key and try again.')
      setLoading(false)
    }
  }

  if (showApiPrompt) {
    return (
      <div className={styles.page}>
        <div className={styles.apiCard}>
          <div className={styles.apiIcon}>🔑</div>
          <h2>Almost there</h2>
          <p>To generate your documents, Lexly uses the Claude AI API. You need a free Anthropic API key — it takes 2 minutes to get one.</p>
          <ol className={styles.apiSteps}>
            <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a></li>
            <li>Create a free account and verify your email</li>
            <li>Under "API Keys", click "Create Key" and copy it</li>
            <li>Paste it below</li>
          </ol>
          <input
            className={styles.apiInput}
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <p className={styles.apiNote}>Your key is never stored — it's used only for this session in your browser.</p>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.apiButtons}>
            <button className={styles.backBtn} onClick={() => setShowApiPrompt(false)}>← Back</button>
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
