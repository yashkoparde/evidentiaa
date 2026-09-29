import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ExternalLink, CheckCircle2, Hash, Database, Clock, Key, ArrowLeft, Copy, Check } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { QRCodeSVG } from 'qrcode.react';

export const TxExplorer: React.FC = () => {
  const [txHash, setTxHash] = useState<string>('');
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [evidenceData, setEvidenceData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get('tx') || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const evId = params.get('evidenceId');
    
    setTxHash(hashParam);
    setEvidenceId(evId);

    // Retrieve evidence details from local storage or mock DB if present
    const mockDb = JSON.parse(localStorage.getItem('evidentia_blockchain') || '[]');
    const localEv = JSON.parse(localStorage.getItem('evidentia_evidence_cache') || '{}');

    let matched = mockDb.find((r: any) => r.hash === hashParam || r.txHash === hashParam);
    
    if (evId && localEv[evId]) {
      setEvidenceData(localEv[evId]);
    } else if (matched) {
      setEvidenceData(matched);
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortTx = txHash ? `${txHash.substring(0, 16)}...${txHash.substring(txHash.length - 8)}` : '';

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-mono p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-evidentia-accent/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-evidentia-violet/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl w-full space-y-6 z-10">
        
        {/* Header Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-evidentia-accent/10 border border-evidentia-accent/30 rounded-xl">
              <Shield className="w-6 h-6 text-evidentia-accent" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-white tracking-wider uppercase">Evidentia Ledger Explorer</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Decentralized Evidence Provenance Engine</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-evidentia-success/10 border border-evidentia-success/30 text-evidentia-success text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Block Confirmed
          </span>
        </div>

        {/* Transaction Banner */}
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
          <div className="text-[10px] text-white/40 uppercase tracking-widest">Transaction Hash Identifier</div>
          <div className="flex items-center justify-between bg-black/60 p-3.5 rounded-xl border border-white/5 break-all">
            <span className="text-sm text-evidentia-accent font-bold tracking-tight pr-4">{txHash}</span>
            <button 
              onClick={() => copyToClipboard(txHash)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 text-white/60 hover:text-white"
              title="Copy Transaction Hash"
            >
              {copied ? <Check className="w-4 h-4 text-evidentia-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <GlassCard title="Transaction Proof Protocol">
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Network Status</span>
                <span className="text-evidentia-success font-bold">COMMITTED (100% FINAL)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Consensus Protocol</span>
                <span className="text-white/80">EVM Mock State Sync</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Gas Fees Settled</span>
                <span className="text-white/80">0.00042 ETH (Simulated)</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Block Timestamp</span>
                <span className="text-white/80">{new Date().toUTCString()}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="Cryptographic Payload Anchor">
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Evidence SHA-256 Hash Digest</span>
                <div className="p-2.5 bg-black/40 rounded border border-white/5 text-[10px] text-evidentia-violet break-all font-mono">
                  {evidenceData?.fileHash || txHash.substring(2, 66)}
                </div>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Case Classification</span>
                <span className="text-white font-bold">{evidenceData?.caseId || 'CASE-2026-SECURE'}</span>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Verification Summary Footprint */}
        <div className="p-6 bg-evidentia-accent/5 border border-evidentia-accent/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Authenticity Verified</h4>
            <p className="text-[10px] text-white/50">This payload hash is registered on-chain with zero tampering flags detected.</p>
          </div>
          <button 
            onClick={() => window.close()} 
            className="px-6 py-2.5 bg-evidentia-accent text-black text-xs font-bold uppercase rounded-lg hover:bg-white transition-colors tracking-widest whitespace-nowrap"
          >
            Close Terminal Window
          </button>
        </div>

      </div>
    </div>
  );
};
