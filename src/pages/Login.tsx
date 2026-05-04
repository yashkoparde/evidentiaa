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
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">OR</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    disabled={isAuthenticating}
                    className="w-full py-4 text-[10px] font-mono tracking-[0.2em] uppercase text-white bg-transparent border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    CONTINUE WITH GOOGLE
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
