import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, AlertTriangle, Fingerprint, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';

export const Login: React.FC = () => {
  const { login, addNotification } = useApp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<'intro' | 'form'>('intro');

  React.useEffect(() => {
    // Cinematic slow reveal
    const timer = setTimeout(() => {
      setPhase('form');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password || (isSignUp && !username)) return;
    
    setIsAuthenticating(true);
    setAuthError(null);
    setSuccessMessage(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        
        setIsSignUp(false);
        setPassword('');
        setSuccessMessage("Your account has been created. Please check your email and verify your address before logging in.");
        setIsAuthenticating(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.session) {
          login(email);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    addNotification("Initiating Secure Federated Authentication...", "violet");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Federated Authentication failed');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[100] overflow-hidden">
      <div className="vignette pointer-events-none" />
      <div className="crt-noise pointer-events-none opacity-[0.03]" />
      
      {/* Slow, eerie atmospheric lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/5 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center text-center space-y-6"
          >
            <h2 className="text-xs font-serif tracking-[0.4em] text-white/40 uppercase">
              Department of Justice
            </h2>
            <div className="h-[1px] w-16 bg-white/20" />
            <h1 className="text-2xl md:text-4xl font-serif tracking-[0.5em] text-white/90 uppercase pl-[0.5em]">
              Evidence Vault
            </h1>
          </motion.div>
        )}

        {phase === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full max-w-sm px-8 z-10 flex flex-col items-center"
          >
            <div className="w-full mb-12 flex flex-col items-center">
              <Fingerprint className="w-8 h-8 text-white/30 mb-6 stroke-[1]" />
              <h1 className="text-2xl font-serif tracking-[0.3em] text-white/90 uppercase pl-[0.3em] mb-2">
                Evidentia
              </h1>
              <p className="text-[9px] font-mono tracking-[0.3em] text-white/40 uppercase">
                Restricted Access
              </p>
            </div>

            <div className="w-full">
              {successMessage && !isSignUp && (
                <div className="mb-6 flex items-start gap-3 text-green-400/80 text-xs font-mono bg-green-950/20 p-4 border-l border-green-900/50">
                  <span className="opacity-90">{successMessage}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase">
                        Agent Alias (Username)
                      </label>
                      <div className="relative group/input">
                        <Hash className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 transition-colors group-focus-within/input:text-white/60 stroke-[1.5]" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="OPERATIVE_NAME"
                          className="w-full bg-transparent border-b border-white/10 px-8 py-3 text-sm font-mono tracking-[0.1em] text-white/80 focus:border-white/40 outline-none transition-all placeholder:text-white/10"
                          required={isSignUp}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase">
                    Identification (Email)
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 transition-colors group-focus-within/input:text-white/60 stroke-[1.5]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="NAME@JUSTICE.GOV"
                      className="w-full bg-transparent border-b border-white/10 px-8 py-3 text-sm font-mono tracking-[0.1em] text-white/80 focus:border-white/40 outline-none transition-all placeholder:text-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 tracking-[0.2em] uppercase">
                    Clearance Code
                  </label>
                  <div className="relative group/input">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 transition-colors group-focus-within/input:text-white/60 stroke-[1.5]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent border-b border-white/10 px-8 py-3 text-sm font-mono tracking-[0.1em] text-white/80 focus:border-white/40 outline-none transition-all placeholder:text-white/10"
                      required
                    />
                  </div>
                </div>

                {authError && (
                  <div className="flex items-start gap-3 text-red-400/80 text-xs font-mono bg-red-950/20 p-4 border-l border-red-900/50">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 stroke-[1.5]" />
                    <span className="opacity-90">{authError}</span>
                  </div>
                )}

                <div className="pt-6 flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={isAuthenticating}
                    className="w-full py-4 text-[10px] font-mono tracking-[0.3em] uppercase text-black bg-white/90 hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isAuthenticating ? 'VERIFYING...' : (isSignUp ? 'REGISTER DOSSIER' : 'AUTHORIZE')}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[9px] font-mono text-white/30 hover:text-white/60 uppercase tracking-[0.2em] py-2 transition-colors mt-2"
                  >
                    {isSignUp ? 'RETURN TO AUTHORIZATION' : 'REQUEST NEW CLEARANCE'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
