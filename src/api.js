export async function generateDocuments(answers) {
  const prompt = buildPrompt(answers)

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  return parseDocuments(text)
}

function buildPrompt(a) {
  return `You are a Dutch legal expert generating startup legal documents. Based on the following business profile, generate a complete legal document package for this Dutch company. The documents must comply with Dutch law (Burgerlijk Wetboek), GDPR, the Dutch GDPR Implementation Act (Uitvoeringswet AVG), EU consumer law, and where relevant the EU AI Act.

BUSINESS PROFILE:
- Company: ${a.company_name || '[Company Name]'} (${a.legal_form || 'BV'})
- KVK: ${a.kvk_number || '[KVK]'}, City: ${a.city || 'Amsterdam'}
- Contact: ${a.email || '[email]'}
- Type: ${a.business_type || 'SaaS'}
- Customers: ${a.customer_type || 'B2B'}
- Online sales: ${a.sells_online}
- Subscription model: ${a.subscription}
- Geographic reach: ${a.operates_in_eu}
- Collects personal data: ${a.collects_personal_data}
- Data types: ${(a.data_types || []).join(', ') || 'none'}
- Legal basis: ${(a.legal_basis || []).join(', ') || 'none'}
- Third-party processors: ${a.processors_list || 'none'}
- Data outside EU: ${a.data_outside_eu}
- Cookies: ${a.uses_cookies}
- Uses AI: ${a.uses_ai}
- AI functions: ${(a.ai_type || []).join(', ') || 'none'}
- AI automated decisions: ${a.ai_makes_decisions || 'N/A'}
- IP types: ${(a.ip_type || []).join(', ') || 'none'}
- User-generated content: ${a.user_generated_content}
- Liability cap preference: ${a.liability_cap}

Generate EXACTLY four documents in this JSON format. Each document has sections. Each section has a title, the actual legal text, AND a plain-language explanation (the "why") in IKEA-manual style — clear, friendly, short.

Return ONLY valid JSON, nothing else:

{
  "documents": [
    {
      "id": "terms",
      "title": "General Terms and Conditions",
      "subtitle": "Algemene Voorwaarden",
      "applicable_law": ["Dutch Civil Code Art. 6:231", "EU Consumer Rights Directive"],
      "sections": [
        {
          "id": "section_id",
          "title": "Section title",
          "legal_text": "The formal legal text of this clause...",
          "why": "Plain English explanation: why this clause exists and what it means for you...",
          "flag": null
        }
      ]
    },
    {
      "id": "privacy",
      "title": "Privacy Policy",
      "subtitle": "Privacybeleid",
      "applicable_law": ["GDPR", "Uitvoeringswet AVG"],
      "sections": [...]
    },
    {
      "id": "ai_obligations",
      "title": "AI Act Compliance Note",
      "subtitle": "Only included because you use AI",
      "applicable_law": ["EU AI Act 2024/1689"],
      "sections": [...]
    },
    {
      "id": "cookies",
      "title": "Cookie Policy",
      "subtitle": "Cookiebeleid",
      "applicable_law": ["ePrivacy Directive", "GDPR"],
      "sections": [...]
    }
  ],
  "alerts": [
    {
      "severity": "warning",
      "title": "Alert title",
      "message": "Something important to flag"
    }
  ],
  "summary": "2-3 sentence plain English summary of what was generated and key things to note"
}

For the "flag" field on sections: use "high-risk" if it's a legally critical clause requiring particular care, "ai-act" if it relates to AI Act obligations, or null for standard clauses.

Make the legal_text complete and usable — not placeholder. Make the "why" explanations genuinely helpful, written as if explaining to a smart non-lawyer. The tone should be: "Here's what this means and why it protects you."

Include relevant Dutch law references. For B2C, include the 14-day right of withdrawal (herroepingsrecht). For AI chatbots, include Article 50 AI Act transparency obligation. For health/medical data, flag the stricter GDPR requirements.`
}

function parseDocuments(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    // Try to extract JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse generated documents. Please try again.')
  }
}
