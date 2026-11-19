// ============================================================================
// TRIAL RUNS TAB  (Platform Admin, internal)
// File: apps/web/src/components/admin/superadmin/TrialRunsTab.tsx
//
// Internal tool for spinning up a Trial-plan tenant and running the guided,
// conversational setup end to end. Nobody but Platform Admin sees this. When
// the public website signup goes live later, it kicks off the same
// /trial-setup conversation from the marketing site instead of from here.
//
// Flow: Launch (create a real Trial org) -> Setup (talk it through, settings
// fill live) -> Review (everything that got configured).
//
// Brand note: this uses blue per the current Avolv product direction, not the
// legacy emerald brand token.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import {
  Rocket, Mic, Square, Loader2, Check, ArrowRight, ArrowLeft, Keyboard,
  ShieldCheck, Sparkles, Flag, Volume2, Building2,
} from 'lucide-react';
import { apiClient } from '../../../services/api/client';

type Vertical = { id: string; name: string; slug?: string };
type Member = { name?: string; email?: string; role?: string };
type Msg = { role: 'assistant' | 'user' | 'typed'; content: string };

const TRADES = [
  { key: 'pool', label: 'Pool service' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'lighting', label: 'Lighting' },
];

function genPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function TrialRunsTab() {
  const [view, setView] = useState<'launch' | 'setup' | 'review'>('launch');
  const [runs, setRuns] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);

  const [biz, setBiz] = useState('');
  const [trade, setTrade] = useState('pool');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [teamId, setTeamId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [expectTyped, setExpectTyped] = useState(false);
  const [typed, setTyped] = useState('');
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [applyResult, setApplyResult] = useState<any>(null);
  const [applying, setApplying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => { loadRuns(); loadVerticals(); }, []);
  useEffect(() => { if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight; }, [messages, thinking]);

  // Pick the most natural en-US voice the system has, instead of the robotic
  // default. (The training-video "Adam" voice is an offline Kokoro model and
  // would need to run server-side, so this is the best browser option.)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices();
      const prefer = ['Google US English', 'Samantha', 'Microsoft Aria Online (Natural) - English (United States)', 'Microsoft Jenny Online (Natural) - English (United States)', 'Alex'];
      voiceRef.current = prefer.map(n => vs.find(v => v.name === n)).find(Boolean)
        || vs.find(v => v.lang === 'en-US' && /natural|google|samantha/i.test(v.name))
        || vs.find(v => v.lang === 'en-US') || vs.find(v => v.lang?.startsWith('en')) || null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  async function loadRuns() {
    try { const res = await apiClient.get('/trial-setup/runs'); setRuns(res?.data?.runs || []); } catch { /* list is non-critical */ }
  }
  async function loadVerticals() {
    try {
      // /verticals returns { success, data: [...] }. Accept a bare array or a
      // couple of common wrappers so a shape change can never crash the lookup.
      const res = await apiClient.get('/verticals');
      const d: any = res?.data;
      const list = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : (Array.isArray(d?.verticals) ? d.verticals : []));
      setVerticals(list);
    } catch { setVerticals([]); }
  }

  function verticalIdForTrade(t: string): string | undefined {
    if (!Array.isArray(verticals)) return undefined;
    const v = verticals.find(x => String(x?.slug || x?.name || '').toLowerCase().includes(t));
    return v?.id;
  }

  function browserSpeak(text: string) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch { /* TTS is a nicety, never block on it */ }
  }

  // Use the browser voice in this tool. The Kokoro "Adam" server voice was too
  // slow per question for a live back-and-forth. The /trial-setup/tts endpoint
  // and service stay in the codebase for later if we make it fast (by caching or
  // pre-generating the audio).
  function speak(text: string) {
    browserSpeak(text);
  }

  // ── launch ────────────────────────────────────────────────────────────────
  async function startRun() {
    setError('');
    if (!biz.trim()) { setError('Enter a business name'); return; }
    if (!ownerName.trim()) { setError('Enter the owner name'); return; }
    if (!ownerEmail.trim()) { setError('Enter the owner email'); return; }
    const pw = genPassword();
    setCreating(true);
    try {
      const [firstName, ...rest] = ownerName.trim().split(' ');
      const res = await apiClient.post('/super-admin/teams', {
        name: biz.trim(),
        plan: 'TRIAL',
        trialDays: 14,
        verticalId: verticalIdForTrade(trade),
        adminUser: {
          email: ownerEmail.trim().toLowerCase(),
          password: pw,
          firstName: firstName || biz.trim(),
          lastName: rest.join(' ') || '-',
        },
      });
      const newId = res?.data?.data?.id;
      if (!newId) { setError('Org was created but no id came back. Check Organizations.'); setCreating(false); loadRuns(); return; }
      setTeamId(newId);
      setTempPassword(pw);
      setView('setup');
      // Seed what the launch form already collected so the agent never asks for
      // the business name or the owner email again.
      const seed = { companyName: biz.trim(), ownerEmail: ownerEmail.trim().toLowerCase(), trade };
      setAnswers(seed);
      await converse([], seed);
    } catch (e: any) {
      // Surface the real reason. The server returns a generic message in
      // production, so show the status too and log the full error for the
      // Network/console. The matching server log line is
      // "[SuperAdmin] Create organization FAILED".
      const r = e?.response;
      const raw = r?.data?.error?.message || r?.data?.error || r?.data?.message || e?.message || 'unknown error';
      // eslint-disable-next-line no-console
      console.error('[TrialRuns] create-org failed', { status: r?.status, data: r?.data, error: e });
      const detail = typeof raw === 'string' ? raw : JSON.stringify(raw);
      setError(`Could not create the trial org${r?.status ? ` (HTTP ${r.status})` : ''}: ${detail}`);
    } finally {
      setCreating(false);
    }
  }

  // ── conversation ────────────────────────────────────────────────────────────
  async function converse(history: Msg[], ans: any, depth = 0) {
    setThinking(true);
    try {
      const res = await apiClient.post('/trial-setup/converse', {
        trade,
        messages: history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        answers: ans,
      });
      const d = res?.data || {};
      const say = d.say || 'Let’s keep going.';
      const newAnswers = d.answers || ans;
      const newHistory: Msg[] = [...history, { role: 'assistant', content: say }];
      setAnswers(newAnswers);
      setExpectTyped(!!d.expectTyped);
      setDone(!!d.done);
      setChoices(Array.isArray(d.choices) ? d.choices : []);
      setMessages(newHistory);
      speak(say);
      // Never stall on an acknowledgment-only turn: if it is not done and the
      // assistant did not actually ask anything, keep it moving on its own.
      if (!d.done && depth < 2 && !/\?/.test(say)) {
        await converse(newHistory, newAnswers, depth + 1);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something hiccuped. Try answering again.' }]);
    } finally {
      setThinking(false);
    }
  }

  async function sendAnswer(text: string, typedField: boolean) {
    if (!text.trim()) return;
    const next = [...messages, { role: (typedField ? 'typed' : 'user') as Msg['role'], content: text.trim() }];
    setMessages(next);
    setTyped('');
    setChoices([]); // clear the tapped-choice buttons until the next question
    await converse(next, answers);
  }

  // ── voice capture ────────────────────────────────────────────────────────────
  async function toggleRecord() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick a container the browser actually supports (Chrome/Firefox do webm,
      // Safari does mp4). Falling back to the default avoids a silent failure.
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const mime = candidates.find(t => (window as any).MediaRecorder?.isTypeSupported?.(t)) || '';
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        const type = mr.mimeType || mime || 'audio/webm';
        const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm';
        const blob = new Blob(chunksRef.current, { type });
        const fd = new FormData();
        fd.append('audio', blob, `answer.${ext}`);
        setThinking(true);
        try {
          const res = await apiClient.post('/trial-setup/transcribe', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          const text = res?.data?.text || '';
          setThinking(false);
          if (text.trim()) await sendAnswer(text, false);
        } catch {
          setThinking(false);
          setMessages(prev => [...prev, { role: 'assistant', content: 'I couldn’t hear that. You can type it instead.' }]);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setError('');
      setRecording(true);
    } catch (e: any) {
      setRecording(false);
      setError(`Microphone blocked or unavailable${e?.message ? ': ' + e.message : ''}. Allow the mic for this site in your browser, or type your answer.`);
    }
  }

  // ── apply ────────────────────────────────────────────────────────────────────
  async function applyRun() {
    if (!teamId) return;
    setApplying(true);
    try {
      const res = await apiClient.post('/trial-setup/apply', { teamId, trade, answers });
      setApplyResult(res?.data || {});
      setView('review');
      loadRuns();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Apply failed');
    } finally {
      setApplying(false);
    }
  }

  function resetAll() {
    setView('launch'); setTeamId(null); setTempPassword(''); setMessages([]); setAnswers({});
    setDone(false); setApplyResult(null); setBiz(''); setOwnerName(''); setOwnerEmail(''); setError('');
  }

  // ── derived settings list for the live panel ─────────────────────────────────
  function settingRows(a: any): { sec: string; label: string }[] {
    const rows: { sec: string; label: string }[] = [];
    if (a.companyName) rows.push({ sec: 'Company', label: `Business: ${a.companyName}` });
    if (Array.isArray(a.serviceDays) && a.serviceDays.length) rows.push({ sec: 'Scheduling', label: `Service days: ${a.serviceDays.join(', ')}` });
    if (a.field?.readings) rows.push({ sec: 'Field', label: `Required readings: ${a.field.readings}` });
    if (a.field?.photoProof) rows.push({ sec: 'Field', label: 'Photo proof required' });
    if (a.billing?.type) rows.push({ sec: 'Billing', label: `Billing: ${a.billing.type}${a.billing.rate ? ' · ' + a.billing.rate : ''}` });
    if (a.billing?.invoiceApproval) rows.push({ sec: 'Billing', label: `Invoice approval: ${a.billing.invoiceApproval}` });
    if (a.billing?.collections) rows.push({ sec: 'Billing', label: 'Collections ladder on' });
    if (a.comms?.arrival) rows.push({ sec: 'Phone', label: 'Arrival texts on' });
    if (a.comms?.recap) rows.push({ sec: 'CX', label: 'Service recap on' });
    if (a.comms?.leadAlerts) rows.push({ sec: 'Phone', label: 'Lead alerts on' });
    if (a.reviews) rows.push({ sec: 'Reviews', label: 'Google review requests on' });
    if (a.aiFrontDesk) rows.push({ sec: 'AI', label: 'AI Front Desk on' });
    (Array.isArray(a.teamMembers) ? a.teamMembers : []).forEach((m: Member) => rows.push({ sec: 'Team', label: `${m.name || ''} (${m.role || ''})` }));
    if (a.decisions?.poolHome) rows.push({ sec: 'Decided', label: 'Pool Home on' });
    if (a.decisions?.simpleView) rows.push({ sec: 'Decided', label: 'Simple view on' });
    if (Array.isArray(a.decisions?.newCustomerForm) && a.decisions.newCustomerForm.length) rows.push({ sec: 'Decided', label: `New-customer form: ${a.decisions.newCustomerForm.join(', ')}` });
    return rows;
  }

  // ── render ────────────────────────────────────────────────────────────────────
  const card = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700';
  const input = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <ShieldCheck className="w-4 h-4 text-blue-600" /> Platform Admin
        <span className="opacity-60">&rsaquo; Trial runs</span>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] uppercase tracking-wide">Internal only</span>
      </div>

      {view === 'launch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${card} p-5 lg:col-span-2`}>
            <h2 className="text-xl font-bold mb-1">Start a trial run</h2>
            <p className="text-sm text-gray-500 mb-4">Spin up a sample tenant on the Trial plan and run the guided setup end to end. Nowhere else sees this.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold block mb-1">Business name</label><input className={input} value={biz} onChange={e => setBiz(e.target.value)} placeholder="Coastal Clear Pools" /></div>
              <div><label className="text-xs font-semibold block mb-1">Trade</label>
                <select className={input} value={trade} onChange={e => setTrade(e.target.value)}>
                  {TRADES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold block mb-1">Owner name</label><input className={input} value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Ray Delgado" /></div>
              <div><label className="text-xs font-semibold block mb-1">Owner email (login)</label><input className={input} value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="ray@coastalclearpools.com" /></div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
              Plan: Trial · 14 days · uses the existing trial plan type
            </div>
            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            <div className="mt-4">
              <button onClick={startRun} disabled={creating} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Create trial org &amp; start setup
              </button>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Recent test runs</h3>
            <div className="space-y-2">
              {runs.length === 0 && <div className="text-sm text-gray-400">No runs yet.</div>}
              {runs.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{r.name}</div>
                    <div className="text-[11px] text-gray-400">{r.vertical?.name || 'No vertical'} · {r._count?.users ?? 0} users</div>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 ${r.onboardingConfigRecord?.processedAt ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.onboardingConfigRecord?.processedAt ? 'Configured' : 'New'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Each run is a real Trial tenant you can log into, then expire or delete from Organizations.</p>
          </div>
        </div>
      )}

      {view === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* conversation */}
          <div className={`${card} p-5`}>
            <div className="rounded-2xl p-4 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-3">
                <button onClick={toggleRecord} className={`w-14 h-14 rounded-full grid place-items-center border-2 ${recording ? 'bg-red-500 border-red-300 animate-pulse' : 'bg-white/15 border-white/50'}`}>
                  {recording ? <Square className="w-5 h-5" /> : <Mic className="w-6 h-6" />}
                </button>
                <div>
                  <div className="font-semibold text-[15px]">{thinking ? 'Thinking…' : recording ? 'Listening… tap the mic again to send' : 'Tap the mic to answer by voice'}</div>
                  <div className="text-xs opacity-80 flex items-center gap-1"><Volume2 className="w-3 h-3" /> Avolv speaks each question out loud</div>
                </div>
              </div>
              <div ref={threadRef} className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`max-w-[88%] px-3 py-2 rounded-2xl text-[13.5px] leading-snug ${m.role === 'assistant' ? 'bg-white/15 rounded-bl-sm' : 'bg-white text-gray-900 ml-auto rounded-br-sm font-medium'} ${m.role === 'typed' ? 'font-mono border border-blue-300' : ''}`}>
                    {m.role === 'assistant' ? <span>🔊 {m.content}</span> : m.role === 'typed' ? <span>⌨ {m.content}</span> : <span>“{m.content}”</span>}
                  </div>
                ))}
                {thinking && <div className="text-white/70 text-xs px-1">…</div>}
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            {choices.length > 0 && !done && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Tap one, or answer below</div>
                <div className="flex flex-wrap gap-2">
                  {choices.map((c, i) => (
                    <button key={i} onClick={() => sendAnswer(c, false)} disabled={thinking}
                      className="rounded-full border border-blue-300 bg-blue-50 text-blue-800 text-sm font-semibold px-3.5 py-1.5 hover:bg-blue-100 disabled:opacity-50">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button onClick={toggleRecord} title="Talk your answer" className={`rounded-lg px-3 py-2.5 text-sm font-semibold inline-flex items-center gap-1 flex-shrink-0 ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {recording ? <><Square className="w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> Talk</>}
              </button>
              <input className={input} value={typed} placeholder={expectTyped ? 'Type this one so the spelling is exact…' : 'or type your answer…'} onChange={e => setTyped(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendAnswer(typed, expectTyped); }} />
              <button onClick={() => sendAnswer(typed, expectTyped)} className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2.5 text-sm font-semibold inline-flex items-center gap-1 flex-shrink-0"><Keyboard className="w-4 h-4" /> Send</button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={resetAll} className="text-sm text-gray-500 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Cancel run</button>
              <div className="flex-1" />
              <button onClick={applyRun} disabled={!done || applying} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50">
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Apply &amp; see what was set up
              </button>
            </div>
            {!done && <p className="text-[11px] text-gray-400 mt-2">The Apply button unlocks when Avolv has everything it needs.</p>}
          </div>

          {/* live settings */}
          <div className={`${card} overflow-hidden`}>
            <div className="bg-gray-900 text-white px-4 py-3 text-xs font-bold tracking-wide">ADMIN SETTINGS AVOLV IS TURNING ON</div>
            <div className="p-4 max-h-[560px] overflow-y-auto">
              {settingRows(answers).length === 0 && <div className="text-sm text-gray-400 text-center py-6">Start answering and the settings fill in here.</div>}
              {settingRows(answers).map((row, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0 text-[13px]">
                  <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${row.sec === 'Decided' ? 'bg-violet-100 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{row.sec}</span>
                  <span className="font-medium">{row.label}</span>
                  <Check className="w-4 h-4 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'review' && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white grid place-items-center text-xl">✓</div>
            <div>
              <div className="font-bold">{applyResult?.extras?.applied?.length || 0} settings written live, nothing left for them</div>
              <div className="text-sm text-green-800">They never opened a settings page. Temp owner password: <span className="font-mono font-bold">{tempPassword}</span> (share once, tell them to change it).</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-600" /> Written live</h3>
              <div className="space-y-1.5">
                {(applyResult?.extras?.applied || []).map((a: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> {a}</div>
                ))}
                {(applyResult?.process?.results?.steps || []).filter((s: any) => s.success).map((s: any, i: number) => (
                  <div key={'p' + i} className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-400" /> {s.name}</div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1"><Flag className="w-3.5 h-3.5 text-amber-600" /> Captured &amp; flagged</h3>
              <div className="space-y-1.5">
                {(answers?.openNotes || []).map((n: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-700"><Flag className="w-4 h-4 mt-0.5" /> {n}</div>
                ))}
                {(applyResult?.extras?.skipped || []).map((s: any, i: number) => (
                  <div key={'s' + i} className="flex items-start gap-2 text-sm text-gray-500"><span className="mt-0.5">•</span> {s.setting}: {s.reason}</div>
                ))}
                {((answers?.openNotes || []).length === 0 && (applyResult?.extras?.skipped || []).length === 0) && <div className="text-sm text-gray-400">Nothing flagged.</div>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5"><Rocket className="w-4 h-4" /> Start another run</button>
            {teamId && <span className="text-sm text-gray-500 inline-flex items-center gap-1">Tenant is live in Organizations <ArrowRight className="w-4 h-4" /></span>}
          </div>
        </div>
      )}
    </div>
  );
}
