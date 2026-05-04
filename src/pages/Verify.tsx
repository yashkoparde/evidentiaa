import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, ShieldCheck, Binary, ChevronRight, Fingerprint, 
  Database, Cpu, FileText, Upload as UploadIcon, Box, X, ExternalLink 
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { useApp } from '../context/AppContext';
import { TerminalText } from '../components/TerminalText';
import { cn } from '../utils/utils';
import { blockchainService } from '../services/blockchainService';
import { generateHash } from '../services/hashService';

export const Verify: React.FC<{ onEvidenceClick: (id: string) => void }> = ({ onEvidenceClick } ) => {
  const { evidenceList, verifyEvidenceItem, refreshData } = useApp();
  
  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const [verifyMode, setVerifyMode] = useState<'scan' | 'upload'>('scan');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [scanStep, setScanStep] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [blockchainRecord, setBlockchainRecord] = useState<any>(null);

  // Manual file verification state
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState('');

  const startVerification = async () => {
    if (verifyMode === 'scan' && !selectedId) return;
    if (verifyMode === 'upload' && !manualFile) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setBlockchainRecord(null);
    setLogMessages([]);
    setScanStep(0);

    const steps = [
      "Initializing forensic integrity scan protocol...",
      "Re-computing SHA-256 fingerprint from binary structure...",
      "Requesting record retrieval from blockchain immutable ledger...",
      "Cross-referencing hash with timestamped records...",
      "Analyzing chain-of-custody validity...",
      "Finalizing integrity verdict...",
    ];

    let hashToCheck = '';
    if (verifyMode === 'scan') {
      const selectedEvidence = evidenceList.find(e => e.id === selectedId);
      hashToCheck = selectedEvidence?.fileHash || '';
    }

    for (let i = 0; i < steps.length; i++) {
      setLogMessages(prev => [...prev, steps[i]]);
      setScanStep(i + 1);
      
      if (i === 1 && verifyMode === 'upload' && manualFile) {
        hashToCheck = await generateHash(manualFile);
        setComputedHash(hashToCheck);
      }

      // Add glitch effect during hash comparison (step 3)
      if (i === 3) {
        setIsGlitching(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsGlitching(false);
      } else {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
      }
    }

    const record = await blockchainService.getHash(hashToCheck);
    setBlockchainRecord(record);
    const isValid = !!record;
    
    // If it's a known record being scanned, update its status
    if (verifyMode === 'scan' && selectedId) {
       await verifyEvidenceItem(selectedId);
    }

    setVerificationResult(isValid ? 'success' : 'failed');
    setIsVerifying(false);
  };

  const selectedEvidence = evidenceList.find(e => e.id === selectedId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter uppercase italic">Integrity Verification</h1>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em] mt-1">Blockchain Hash Validation Protocol [Active]</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => { setVerifyMode('scan'); setVerificationResult(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all",
              verifyMode === 'scan' ? "bg-evidentia-accent text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "text-white/40 hover:text-white"
            )}
          >
            Scan Registry
          </button>
          <button 
            onClick={() => { setVerifyMode('upload'); setVerificationResult(null); }}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all",
              verifyMode === 'upload' ? "bg-evidentia-violet text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "text-white/40 hover:text-white"
            )}
          >
            Direct File Check
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Evidence Selection List / File Upload */}
        <div className="lg:col-span-1 space-y-4">
          {verifyMode === 'scan' ? (
            <>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Evidence Pending Verification</div>
              <div className="space-y-3">
                {evidenceList.length === 0 ? (
                  <div className="p-12 glass-panel text-center">
                    <p className="text-[10px] font-mono text-white/30 uppercase">No records found</p>
                  </div>
                ) : (
                  evidenceList.map((ev) => (
                    <motion.div
                      key={ev.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isVerifying && setSelectedId(ev.id)}
                      className={`
                        p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden group
                        ${selectedId === ev.id 
                          ? 'bg-evidentia-accent/10 border-evidentia-accent shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'}
                      `}
                    >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-evidentia-accent font-bold tracking-widest">{ev.caseId}</span>
                        <div className={`w-2 h-2 rounded-full ${ev.status === 'verified' ? 'bg-evidentia-success' : ev.status === 'tampered' ? 'bg-evidentia-danger' : 'bg-white/20'}`} />
                      </div>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-black/40 rounded border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {ev.thumbnail ? <img src={ev.thumbnail} alt="" className="w-full h-full object-cover" /> : <FileText className="w-6 h-6 text-white/10" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-display font-semibold text-white truncate">{ev.title}</h4>
                          <p className="text-[10px] font-mono text-white/30 mt-1 uppercase tracking-tighter truncate">ID: {ev.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Binary Structure Ingestion</div>
              <div 
                onClick={() => document.getElementById('verify-file')?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer",
                  manualFile ? "border-evidentia-violet/40 bg-evidentia-violet/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <div className={cn("p-4 rounded-full", manualFile ? "bg-evidentia-violet/20" : "bg-white/5")}>
                   {manualFile ? <Box className="w-6 h-6 text-evidentia-violet" /> : <UploadIcon className="w-6 h-6 text-white/20" />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono text-white/70 uppercase truncate max-w-[150px]">
                    {manualFile ? manualFile.name : "Drop file to verify"}
                  </p>
                  {manualFile && (
                    <p className="text-[9px] font-mono text-white/20 mt-1">{(manualFile.size / 1024).toFixed(1)} KB</p>
                  )}
                </div>
                <input 
                  type="file" 
                  id="verify-file" 
                  className="hidden" 
                  onChange={(e) => e.target.files && setManualFile(e.target.files[0])} 
                />
              </div>
              {manualFile && !isVerifying && !verificationResult && (
                <GlowButton onClick={startVerification} className="w-full bg-evidentia-violet hover:bg-evidentia-violet/80">
                   Start Forensic Check
                </GlowButton>
              )}
            </div>
          )}
        </div>

        {/* Verification Console */}
        <div className="lg:col-span-2 space-y-6">
          {(verifyMode === 'scan' && selectedEvidence) || (verifyMode === 'upload' && manualFile) ? (
            <div className="space-y-6">
              <GlassCard title={verifyMode === 'scan' ? "Registry Verification" : "Ad-Hoc File Verification"}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg border flex items-center justify-center bg-evidentia-accent/10 border-evidentia-accent/30">
                      {selectedEvidence?.thumbnail ? (
                        <img src={selectedEvidence.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Fingerprint className="w-6 h-6 text-evidentia-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">
                        {verifyMode === 'scan' ? selectedEvidence?.title : manualFile?.name}
                      </h3>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        {verifyMode === 'scan' ? `Global Record ID: ${selectedEvidence?.id}` : "Temporary Binary Analysis Workspace"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isVerifying && !verificationResult && verifyMode === 'scan' && (
                      <GlowButton onClick={startVerification}>Initialize Verification</GlowButton>
                    )}
                    {verificationResult && verifyMode === 'scan' && selectedId && (
                      <GlowButton onClick={() => onEvidenceClick(selectedId)} variant="ghost" className="text-[10px] py-1.5 h-auto">View Report</GlowButton>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "bg-black/60 rounded-xl border border-white/5 p-6 min-h-[300px] font-mono text-xs relative overflow-hidden transition-all duration-300",
                  isGlitching && "bg-evidentia-accent/10 shadow-[inner_0_0_50px_rgba(0,240,255,0.2)] scale-[1.01]",
                  verificationResult === 'failed' && "bg-evidentia-danger/5",
                  verificationResult === 'success' && "bg-evidentia-success/5"
                )}>
                  {isGlitching && (
                    <>
                      <motion.div 
                        animate={{ opacity: [0, 0.4, 0, 0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.08 }}
                        className="absolute inset-0 bg-evidentia-danger/20 pointer-events-none z-20"
                      />
                      <motion.div 
                        animate={{ opacity: [0, 0.3, 0], x: [-20, 20, -10], y: [2, -2, 4] }}
                        transition={{ repeat: Infinity, duration: 0.12 }}
                        className="absolute inset-0 bg-evidentia-success/10 pointer-events-none z-20 mix-blend-screen"
                      />
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none z-30" />
                    </>
                  )}
                  {!isVerifying && !verificationResult && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 space-y-4">
                      <ShieldCheck className="w-16 h-16 opacity-10" />
                      <p className="uppercase tracking-[0.3em] font-mono text-[10px]">Awaiting Manual Initiation</p>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="scanline" />
                  )}

                  <div className="space-y-3">
                    {logMessages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 items-start ${i === logMessages.length - 1 ? 'text-evidentia-accent border-b border-evidentia-accent/10 pb-2' : 'text-white/40'}`}
                      >
                        <span className="text-evidentia-accent/50">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                        <span>{msg}</span>
                        {i === logMessages.length - 1 && <span className="animate-pulse">_</span>}
                      </motion.div>
                    ))}
                  </div>

                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-12 p-8 rounded-xl border flex flex-col items-center text-center space-y-4
                        ${verificationResult === 'success' 
                          ? 'bg-evidentia-success/10 border-evidentia-success text-evidentia-success' 
                          : 'bg-evidentia-danger/10 border-evidentia-danger text-evidentia-danger'}`}
                    >
                      {verificationResult === 'success' ? (
                        <>
                          <ShieldCheck className="w-16 h-16 animate-[pulse_2s_infinite]" />
                          <div>
                            <h2 className="text-2xl font-display font-black tracking-tighter uppercase">VERIFIED: AUTHENTIC</h2>
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mt-1 opacity-80">Evidence matches blockchain ledger exactly</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-16 h-16 animate-[bounce_1s_infinite]" />
                          <div>
                            <h2 className="text-2xl font-display font-black tracking-tighter uppercase">ALERT: TAMPERED</h2>
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mt-1 opacity-80">Local binary hash differs from blockchain record</p>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                        <div className="p-3 bg-black/40 border border-white/5 rounded text-left">
                          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Local Fingerprint (SHA-256)</p>
                          <p className="font-mono text-[10px] truncate text-evidentia-accent">{verifyMode === 'scan' ? selectedEvidence?.fileHash : computedHash}</p>
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded text-left">
                          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Blockchain Record Hash</p>
                          <p className={`font-mono text-[10px] truncate ${verificationResult === 'success' ? 'text-evidentia-success' : 'text-evidentia-danger'}`}>
                            {blockchainRecord ? blockchainRecord.hash : "RECORD_NOT_FOUND"}
                          </p>
                        </div>
                      </div>

                      {blockchainRecord && (
                        <div className="w-full space-y-2 mt-4 px-1">
                           <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest opacity-40">
                              <span>Entry Timestamp</span>
                              <span>Source Node</span>
                           </div>
                           <div className="flex justify-between text-[10px] font-mono text-white/60">
                              <span>{new Date(blockchainRecord.timestamp).toLocaleString()}</span>
                              <span className="text-evidentia-accent">POLYGON_POS_MAINNET</span>
                           </div>
                           <div className="pt-2 text-left">
                              <p className="text-[8px] font-mono uppercase tracking-widest opacity-40 mb-1">Blockchain Authority</p>
                              <a 
                                href={`https://polygonscan.com/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-mono text-evidentia-accent hover:underline flex items-center gap-1"
                              >
                                {import.meta.env.VITE_CONTRACT_ADDRESS} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                           </div>
                        </div>
                      )}

                      <GlowButton 
                        variant={verificationResult === 'success' ? 'success' : 'danger'}
                        onClick={() => {
                          setVerificationResult(null); 
                          setLogMessages([]);
                          if (verifyMode === 'upload') setManualFile(null);
                        }}
                        className="mt-4"
                      >
                        Reset Console
                      </GlowButton>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl min-h-[500px]">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto grayscale opacity-20">
                  <Binary className="w-10 h-10" />
                </div>
                <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.3em]">Select Evidence Node to Verify</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
