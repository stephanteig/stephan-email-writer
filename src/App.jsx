import { useState } from 'react';
import { Send, Copy, Check, Mail, Sparkles, MessageSquare } from 'lucide-react';

const STYLE_PROFILE = `Write in the style of Stephan Teig. The tone is semi-formal, polite, and direct. Use "Hei [Name]," for Norwegian or "Hello [Name]," for English openings. Messages should be concise and purpose-driven. Common Norwegian phrases include "Høres bra ut," "Si ifra hvis," "Gi gjerne beskjed om," and "Jeg tenkte å...". Common English phrases include "I was wondering if..." and "Please let me know if...". Structure emails by giving brief context first, followed by the main request or information, and end with a proactive offer to help. Norwegian closing: "Mvh Stephan Teig". English closing: "Kind regards, Stephan Teig". Always end with a professional signature block: full name, phone (+47 921 24 207), and email (teig.stephan@gmail.com). Keep replies short and purposeful — avoid fluff.`;

const tones = [
  { value: 'professional', label: 'Professional', labelNo: 'Profesjonell', description: 'Clear and business-appropriate' },
  { value: 'warm', label: 'Warm', labelNo: 'Vennlig', description: 'Friendly and approachable' },
  { value: 'concise', label: 'Concise', labelNo: 'Kortfattet', description: 'Brief and to the point' },
  { value: 'formal', label: 'Formal', labelNo: 'Formell', description: 'Traditional and respectful' },
  { value: 'persuasive', label: 'Persuasive', labelNo: 'Overbevisende', description: 'Compelling and convincing' },
  { value: 'follow-up', label: 'Follow-up', labelNo: 'Oppfølging', description: 'Short acknowledgment or update' },
];

export default function EmailWriter() {
  const [thoughts, setThoughts] = useState('');
  const [tone, setTone] = useState('professional');
  const [lang, setLang] = useState('no');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!thoughts.trim()) return;
    setLoading(true);
    try {
      const contextPart = context.trim()
        ? `\n\nI am replying to this email:\n"${context}"\n`
        : '';

      const prompt = `${STYLE_PROFILE}

Now write an email in ${lang === 'no' ? 'Norwegian (Bokmål)' : 'English'} with a ${tone} tone.

My raw thoughts: "${thoughts}"${contextPart}

Respond with ONLY the email body. No explanations, no subject line.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      setGenerated(data.content?.[0]?.text?.trim() || 'Error generating email.');
    } catch (e) {
      setGenerated('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Stephan's Email Writer</h1>
          <p className="text-slate-500 mt-2">Emails written in your voice, your way</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left: Input */}
          <div className="space-y-5">

            {/* Thoughts */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-slate-800">Your Thoughts</h2>
              </div>
              <textarea
                value={thoughts}
                onChange={e => setThoughts(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && generate()}
                placeholder="Just write what you want to say — rough is fine..."
                className="w-full h-36 p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-700 placeholder-slate-400 bg-white/60 text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">💡 Cmd/Ctrl + Enter to generate</p>
            </div>

            {/* Language + Tone */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-slate-800">Language & Tone</h2>
              </div>

              {/* Language toggle */}
              <div className="flex gap-2 mb-4">
                {[{ val: 'no', label: '🇳🇴 Norsk' }, { val: 'en', label: '🇬🇧 English' }].map(l => (
                  <button
                    key={l.val}
                    onClick={() => setLang(l.val)}
                    className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                      lang === l.val
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >{l.label}</button>
                ))}
              </div>

              {/* Tone grid */}
              <div className="grid grid-cols-2 gap-2">
                {tones.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      tone === t.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-800 text-sm">{lang === 'no' ? t.labelNo : t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Context (collapsible) */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-slate-800">Replying to an email?</h2>
                <button onClick={() => setShowContext(!showContext)} className="text-blue-500 text-sm font-medium">
                  {showContext ? 'Hide' : 'Paste it here'}
                </button>
              </div>
              {showContext && (
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Paste the original email for better context..."
                  className="mt-4 w-full h-28 p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-700 placeholder-slate-400 bg-white/60 text-sm"
                />
              )}
            </div>

            {/* Generate */}
            <button
              onClick={generate}
              disabled={loading || !thoughts.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Writing your email...</>
              ) : (
                <><Send className="w-4 h-4" /> Generate Email</>
              )}
            </button>
          </div>

          {/* Right: Output */}
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-white/30 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                <h2 className="font-semibold text-slate-800">Generated Email</h2>
              </div>
              {generated && (
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium transition-colors">
                  {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              )}
            </div>

            {generated ? (
              <div className="flex-1 bg-white rounded-xl p-5 border border-slate-200 overflow-auto">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm leading-relaxed">{generated}</pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                <Mail className="w-14 h-14 mb-3 opacity-30" />
                <p className="font-medium">Your email will appear here</p>
                <p className="text-sm mt-1">Written in your style — direct, polite, purposeful</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}