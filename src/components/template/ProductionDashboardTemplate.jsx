import React from 'react';
import { Activity, ArrowUpRight, CircleCheck, Cpu, FolderPlus, RefreshCw, ShieldAlert, Sparkles, Zap, Radio } from 'lucide-react';

/**
 * Distinctive AnyShare dashboard masthead and metric strip.
 * Data and actions are supplied by App; this template contains presentation only.
 */
export default function ProductionDashboardTemplate({
  items = [],
  currentUser,
  bridge,
  isAdmin,
  onNewProduction,
  onOpenTeam,
  onPairDesktop,
  onScan
}) {
  const ready = items.filter((item) => item.status === 'ready_to_render').length;
  const rendering = items.filter((item) => item.status === 'rendering').length;
  const needsReview = items.filter((item) => item.status === 'correction_needed').length;

  return (
    <section className="production-masthead">
      <div className="masthead-orb masthead-orb-one" />
      <div className="masthead-orb masthead-orb-two" />

      <div className="masthead-main">
        <div className="masthead-copy">
          <div className="eyebrow-row">
            <span className="eyebrow-mark"><Activity size={13} /></span>
            <span className="eyebrow-label">Anything Share · Safar production slate</span>
            <span className="live-chip"><i /> One Tap linked</span>
          </div>

          <h2>From first cut<br />to <em>final handoff.</em></h2>
          <p className="masthead-description">
            Every Safar, edit pass, render, and upload—tracked from the workstation that makes it.
          </p>

          <div className="masthead-actions">
            <button type="button" className="action-primary" onClick={onNewProduction}>
              <FolderPlus size={16} /> New production
              <ArrowUpRight size={14} className="action-arrow" />
            </button>
            <button type="button" className="action-secondary" onClick={onScan}>
              <RefreshCw size={15} /> Scan One Tap
            </button>
            {isAdmin && (
              <button type="button" className="action-text" onClick={onOpenTeam}>
                Team overview <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>

        <aside className={`film-console ${bridge?.is_online ? 'is-online' : 'is-offline'}`}>
          <div className="console-heading"><span>WORKSTATION LINK</span><span className="console-index">NODE / 01</span></div>
          <div className="console-visual" aria-hidden="true">
            <div className="film-reel"><i /><i /><i /><i /><b /></div>
            <div className="console-wave">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ '--bar': 18 + ((index * 19 + 7) % 67) }} />)}</div>
            <div className="console-signal"><Radio size={14} /><span>{bridge?.is_online ? 'SYNC' : 'NO LINK'}</span></div>
          </div>
          <div className="console-node-name" title={bridge?.label || 'No workstation paired'}>
            {bridge?.label?.split(' (')[0] || 'No workstation paired'}
          </div>
          <div className="console-footer">
            <span>{bridge?.last_scan_at ? `LAST SCAN · ${new Date(bridge.last_scan_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'WAITING FOR FIRST SCAN'}</span>
            <button type="button" onClick={onPairDesktop} aria-label="Pair One Tap workstation" title="Pair One Tap workstation"><Zap size={13} /> PAIR</button>
          </div>
        </aside>
      </div>

      <div className="metric-strip" aria-label="Production summary">
        <div className="metric-cell">
          <span className="metric-caption">All productions</span>
          <div className="metric-value">{items.length.toString().padStart(2, '0')}<span> sessions</span></div>
          <span className="metric-note">Across your workspace</span>
        </div>
        <div className="metric-cell metric-ready">
          <span className="metric-caption"><Zap size={13} /> Ready for render</span>
          <div className="metric-value">{ready.toString().padStart(2, '0')}<span> waiting</span></div>
          <span className="metric-note">Preflight eligible</span>
        </div>
        <div className="metric-cell metric-rendering">
          <span className="metric-caption"><Activity size={13} /> Rendering now</span>
          <div className="metric-value">{rendering.toString().padStart(2, '0')}<span> active</span></div>
          <span className="metric-note">On the local workstation</span>
        </div>
        <div className="metric-cell metric-review">
          <span className="metric-caption"><ShieldAlert size={13} /> Needs attention</span>
          <div className="metric-value">{needsReview.toString().padStart(2, '0')}<span> to review</span></div>
          <span className="metric-note">{needsReview ? 'Admin review required' : 'No corrections waiting'}</span>
        </div>
        <div className="metric-footnote"><CircleCheck size={13} /> Signed in as {currentUser?.name || 'User'}</div>
      </div>

      <div className="masthead-signature"><Sparkles size={13} /> A live slate · status by One Tap</div>
    </section>
  );
}
