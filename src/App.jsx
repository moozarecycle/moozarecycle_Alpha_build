import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Camera,
  Ticket,
  Trophy,
  History,
  Coins,
  ArrowRight,
  Loader2,
  CheckCircle,
  Video,
  MapPin,
  Store,
  X,
  ShieldCheck,
  Check,
  XCircle,
  LogOut,
  Lock,
  Eye,
  Calendar,
  User,
  AlertCircle,
  Gift,
  RefreshCw,
  Plus,
  Trash2,
  Link,
  Cloud,
  ArrowLeft,
  WifiOff,
  BookOpen,
  RotateCcw,
  ChevronDown,
  Play,
  Dices,
  Tag,
  Clock
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  linkWithPopup,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
  collection,
  addDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy,
  runTransaction,
  getDoc,
  writeBatch,
  limit, 
  startAfter, 
  getDocs, 
  getCountFromServer,
  where 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const OWNER_UID = 'LHDmwdqBmicNjl7Vocshm3WUACh1'; 
const CLOUDINARY_CLOUD_NAME = 'dac2zpc0f';
const CLOUDINARY_UPLOAD_PRESET = 'recycle_app';
const MAX_VIDEO_SIZE_MB = 10;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- FIREBASE INIT ---
const firebaseConfig = {
  apiKey: 'AIzaSyDENwAyqj58lIB5SIyGZsOqQVIZcFuejaI',
  authDomain: 'moozarecycle-800c6.firebaseapp.com',
  projectId: 'moozarecycle-800c6',
  storageBucket: 'moozarecycle-800c6.firebasestorage.app',
  messagingSenderId: '1040496708494',
  appId: '1:1040496708494:web:ceeb637555bb29d13f72df',
  measurementId: 'G-Y12P6Q32Z3',
};

let firebaseApp, auth, db;
let firebaseError = null;

try {
  if (firebaseConfig?.apiKey) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } else {
    firebaseError = 'Missing Firebase Keys.';
  }
} catch (e) {
  firebaseError = e.message;
}
// --- SHARED COMPONENTS (Memoized) ---
const MoozaLogo = React.memo(({ className = "w-12 h-12", variant = "filled" }) => {
  // Unique ID to prevent conflicts if multiple logos are on screen
  const maskId = React.useId(); 
  
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Layer: Only show if variant is 'filled' */}
      {variant === 'filled' && (
        <rect width="512" height="512" rx="100" fill="#0F172A"/>
      )}

      {/* GESTALT LOGO GROUP */}
      <g transform="translate(256 256) scale(2.2)">
        <defs>
          <mask id={maskId}>
            {/* Visible area (White = Opaque) */}
            <rect x="-100" y="-100" width="200" height="200" fill="white"/>
            {/* Cutouts (Black = Transparent) */}
            <circle cx="0" cy="0" r="55" fill="black"/>
            <path d="M-40 -35 L-50 -65 L-20 -45 Z" fill="black"/> {/* Left Ear */}
            <path d="M40 -35 L50 -65 L20 -45 Z" fill="black"/>   {/* Right Ear */}
          </mask>
        </defs>

        {/* The Green Token Circle */}
        <circle cx="0" cy="0" r="90" fill="#4ADE80" mask={`url(#${maskId})`}/>
        
        {/* Floating Snout */}
        <ellipse cx="0" cy="10" rx="18" ry="12" fill="#22C55E"/> 
        <circle cx="-6" cy="10" r="3" fill="#052e16"/>
        <circle cx="6" cy="10" r="3" fill="#052e16"/>
        
        {/* Floating Eyes */}
        <circle cx="-20" cy="-10" r="4" fill="#22C55E"/>
        <circle cx="20" cy="-10" r="4" fill="#22C55E"/>
      </g>
    </svg>
  );
});
MoozaLogo.displayName = 'MoozaLogo';

const Button = React.memo(
  ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    size = 'normal',
  }) => {
    const baseStyle =
      'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes = {
      normal: 'px-4 py-3',
      small: 'px-3 py-1.5 text-sm',
    };

    const variants = {
      primary:
        'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200',
      secondary:
        'bg-white text-emerald-800 border-2 border-emerald-100 hover:bg-emerald-50',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100',
      success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
      google:
        'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
      exchange:
        'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200',
      admin: 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg',
      winner: 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200', 
      history: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200',
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

const Card = React.memo(({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-red-600 text-center font-bold bg-slate-50">
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
            <div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-sm mt-2">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- OPTIMIZED SUB-COMPONENTS ---

// 1. RULES VIEW
const RulesView = React.memo(({ setView }) => {
  const steps = [
    { 
      icon: <Video className="w-5 h-5 text-emerald-600" />, 
      title: "1. Record & Upload", 
      desc: "Crush a PET bottle and record a video. Ensure the crushing action is clearly visible." 
    },
    { 
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />, 
      title: "2. Verification", 
      desc: "Admins review proof. Approved = 1 Token. Rejected? Check your profile for the reason." 
    },
    { 
      icon: <RefreshCw className="w-5 h-5 text-purple-600" />, 
      title: "3. Exchange", 
      desc: "Go to Rewards. Swap 5 Verified Tokens for 1 Lucky Ticket to enter active draws." 
    },
    { 
      icon: <Trophy className="w-5 h-5 text-amber-500" />, 
      title: "4. Win Prizes", 
      desc: "Use tickets to enter. Winners are selected randomly by the system." 
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative font-sans text-slate-800 pb-28">
       
       {/* --- HEADER: Matches Dashboard Branding --- */}
       <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 pt-12 pb-24 px-6 rounded-b-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay transform rotate-12 scale-150 pointer-events-none">
             <MoozaLogo className="w-64 h-64" variant="transparent" />
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

          <div className="relative z-10 flex items-center gap-4 mb-4">
             {/* Back Button: Glass Style */}
             <button
               onClick={() => setView('dashboard')}
               className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg group"
             >
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             </button>
             
             <div>
               <h1 className="text-2xl font-black tracking-tight leading-none">How it Works</h1>
               <p className="text-emerald-100 text-xs font-medium opacity-90">Follow the steps</p>
             </div>
          </div>
       </div>

       {/* --- CONTENT CARDS: Overlapping Header --- */}
       <div className="px-6 -mt-16 relative z-10 space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex items-start gap-4 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner flex-shrink-0">
                  {s.icon}
               </div>
               <div>
                 <h3 className="font-bold text-slate-800">{s.title}</h3>
                 <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">{s.desc}</p>
               </div>
            </div>
          ))}
          
          {/* Rules Details Box */}
          <div className="mt-6 p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl shadow-sm">
            <h4 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Game Rules
            </h4>
            <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside font-medium opacity-80">
              <li>Only PET plastic bottles are accepted.</li>
              <li>Bottles must be empty and crushed.</li>
              <li>One bottle per video clip.</li>
              <li>Fake submissions will result in a ban.</li>
            </ul>
          </div>
       </div>

       {/* --- FLOATING NAVIGATION: Keeps the "App" feel --- */}
       <div className="fixed bottom-6 left-6 right-6 z-40">
          <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-2 flex justify-between items-center shadow-2xl border border-slate-700/50 text-slate-400">
            <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-all" onClick={() => setView('dashboard')}>
              <Store className="w-5 h-5" />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-900/20 translate-y-[-4px] transition-all" onClick={() => setView('rules')}>
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-bold">Rules</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-all" onClick={() => setView('draw')}>
              <Ticket className="w-5 h-5" />
              <span className="text-[10px] font-bold">Rewards</span>
            </button>
          </div>
       </div>
    </div>
  );
});
RulesView.displayName = 'RulesView';

// LOCATE THIS COMPONENT (usually above ExchangeView) AND REPLACE IT:
const DrawActivityItem = React.memo(({ draw, userId, onHasEntry, onLoadComplete }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const coll = collection(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id, 'entries');
        const q = query(coll, where('userId', '==', userId));
        const snapshot = await getCountFromServer(q);
        
        if (mounted) {
          const c = snapshot.data().count;
          setCount(c);
          if (c > 0) onHasEntry(); 
        }
      } catch (e) {
        console.error("Activity item error", e);
      } finally {
        if (mounted) {
            setLoading(false);
            if (onLoadComplete) onLoadComplete();
        }
      }
    };
    fetchCount();
    return () => { mounted = false; };
  }, [draw.id, userId, onHasEntry, onLoadComplete]);

  // 1. Loading Skeleton (Pulsing)
  if (loading) return (
    <div className="flex justify-between items-center p-4 bg-white/50 border border-slate-100 rounded-2xl shadow-sm animate-pulse mb-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-6 w-12 bg-slate-200 rounded"></div>
    </div>
  );

  // 2. Hide if no entries (Standard behavior)
  if (count === 0) return null; 

  // 3. Render Item (Glass/Modern Style)
  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-md border border-slate-100 animate-in fade-in slide-in-from-bottom-2 mb-3">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${draw.color || 'bg-slate-200'} flex items-center justify-center text-white text-xs shadow-sm`}>
           <History className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{draw.title}</div>
          <div className="text-[10px] text-slate-500 font-medium">
             {draw.status === 'closed' ? 'Closed' : 'Active'} • {new Date(draw.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-100">
        <Tag className="w-3 h-3" /> {count} Ticket{count !== 1 ? 's' : ''}
      </div>
    </div>
  );
});
DrawActivityItem.displayName = 'DrawActivityItem';

// 2. EXCHANGE VIEW
// Helper Component for "Recent Activity" Items (Only shows if count > 0)
const ExchangeView = React.memo(({ user, userData, setView }) => {
  const [draws, setDraws] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasAnyEntries, setHasAnyEntries] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(0); 
  const unsubDrawRef = useRef(null);

  // Reset loading state when history opens
  useEffect(() => {
    if (showHistory) {
      setItemsLoaded(0);
      setHasAnyEntries(false);
    }
  }, [showHistory]);

  const handleLoadComplete = useCallback(() => {
    setItemsLoaded(prev => prev + 1);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'draws'),
      orderBy('timestamp', 'desc')
    );
    unsubDrawRef.current = onSnapshot(q, (snapshot) => {
      setDraws(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching draws:", error));

    return () => { if (unsubDrawRef.current) unsubDrawRef.current(); };
  }, []);

  const handleConvert = useCallback(async () => {
    if (userData.tokens < 5) return;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User profile does not exist!");
        if ((userDoc.data().tokens || 0) < 5) throw new Error("Insufficient verified tokens.");

        transaction.update(userRef, {
          tokens: increment(-5),
          tickets: increment(1),
        });
      });
    } catch (error) {
      alert(error.message);
    }
  }, [userData.tokens, user.uid]);

  const handleEnterDraw = useCallback(async (draw) => {
      const cost = draw.ticketCost || 1;
      try {
        await runTransaction(db, async (transaction) => {
          const drawRef = doc(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id);
          const drawDoc = await transaction.get(drawRef);
          
          if (!drawDoc.exists()) throw new Error('Draw not found');
          if (drawDoc.data().status === 'closed') throw new Error('This draw is closed.');

          const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
          const userDoc = await transaction.get(userRef);
          
          if ((userDoc.data().tickets || 0) < cost) throw new Error('Not enough tickets!');

          transaction.update(userRef, { tickets: increment(-cost) });
          const newEntryRef = doc(collection(drawRef, 'entries'));

          transaction.set(newEntryRef, {
            userId: user.uid,
            email: user.email || 'Guest',
            timestamp: new Date().toISOString(),
            randomId: Math.random(),
          });
        });
        alert("Entered successfully! Good luck!");
      } catch (e) {
        alert(e.message || 'Entry failed. Try again.');
      }
    }, [user.uid, user.email]);

  const drawsList = useMemo(() =>
      draws.map((draw) => (
        <div key={draw.id} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all relative overflow-hidden ${draw.status === 'closed' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-md'}`}>
           {/* Status Badge */}
           {draw.status === 'closed' && (
              <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-xl uppercase tracking-wider">Closed</div>
           )}
           
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${draw.color || 'bg-blue-500'} flex items-center justify-center text-white shadow-lg`}>
                   {draw.status === 'closed' ? <Lock className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-base leading-tight mb-0.5">{draw.title}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                       Entry: {draw.ticketCost || 1} Ticket
                    </span>
                  </div>
                </div>
            </div>
            
            {!draw.winnerEmail && (
                <Button
                    size="small"
                    // Dynamic styling for the button
                    className={draw.status === 'closed' 
                       ? "bg-slate-200 text-slate-400 border-none shadow-none" 
                       : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"}
                    disabled={userData.tickets < (draw.ticketCost || 1) || draw.status === 'closed'}
                    onClick={() => handleEnterDraw(draw)}
                >
                    {draw.status === 'closed' ? 'Closed' : 'Enter'}
                </Button>
            )}
          </div>

          {/* Winner Display */}
          {draw.winnerEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600 shadow-sm">
                      <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Result</div>
                      <div className="text-sm font-bold text-amber-900">
                        {user.uid === draw.winnerUserId ? "🎉 YOU WON!" : "Winner Announced"}
                      </div>
                  </div>
              </div>
          )}
        </div>
      )),
    [draws, userData.tickets, handleEnterDraw, user.uid]
  );

  // --- HISTORY VIEW RENDER ---
  if (showHistory) {
      const allLoaded = itemsLoaded === draws.length;
      return (
        <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative font-sans text-slate-800 pb-28 animate-in slide-in-from-right">
            {/* Header: History specific */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-12 pb-16 px-6 rounded-b-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay transform rotate-12 scale-150 pointer-events-none">
                   <MoozaLogo className="w-64 h-64" variant="transparent" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <button onClick={() => setShowHistory(false)} className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight leading-none">My Entries</h1>
                    <p className="text-indigo-100 text-xs font-medium opacity-90">Ticket history</p>
                  </div>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-10 space-y-3">
                {draws.map(draw => (
                    <DrawActivityItem 
                        key={draw.id} 
                        draw={draw} 
                        userId={user.uid} 
                        onHasEntry={() => setHasAnyEntries(true)} 
                        onLoadComplete={handleLoadComplete} 
                    />
                ))}
                
                {allLoaded && !hasAnyEntries && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Ticket className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-600 font-bold">No entries yet</h3>
                        <p className="text-slate-400 text-sm mt-1 mb-6">Convert tokens to tickets and enter draws to see them here.</p>
                        <Button variant="secondary" className="w-full" onClick={() => setShowHistory(false)}>Browse Draws</Button>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- MAIN EXCHANGE VIEW RENDER ---
  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative font-sans text-slate-800 pb-28">
      
      {/* 1. HEADER: Consistent Emerald Gradient */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 pt-12 pb-20 px-6 rounded-b-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay transform rotate-12 scale-150 pointer-events-none">
             <MoozaLogo className="w-64 h-64" variant="transparent" />
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

        <div className="relative z-10 flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
             <button onClick={() => setView('dashboard')} className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             </button>
             <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">Rewards</h1>
                <p className="text-emerald-100 text-xs font-medium opacity-90">Spend your earnings</p>
             </div>
           </div>
        </div>

        {/* 2. GLASS STATS: Overlapping Cards */}
        <div className="grid grid-cols-2 gap-4 translate-y-8">
            {/* TOKENS CARD (Source) */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-100 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tokens</span>
                </div>
                <div className="text-3xl font-black text-white drop-shadow-sm">{userData.tokens}</div>
            </div>
            
            {/* TICKETS CARD (Destination) */}
            <div className="bg-gradient-to-br from-indigo-500/80 to-purple-600/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 bg-white/20 w-16 h-16 rounded-full blur-lg"></div>
                <div className="flex items-center gap-2 text-indigo-100 mb-1 z-10">
                    <Ticket className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tickets</span>
                </div>
                <div className="text-3xl font-black text-white drop-shadow-sm z-10">{userData.tickets}</div>
            </div>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="px-6 mt-16 space-y-6 relative z-0">
        
        {/* EXCHANGE MACHINE CARD */}
        <div className="bg-white rounded-3xl p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
           <div className="bg-slate-50 rounded-[1.3rem] p-5 border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                        <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 leading-tight">Token Exchange</h3>
                        <p className="text-xs text-slate-500">5 Tokens = 1 Lucky Ticket</p>
                    </div>
                 </div>
              </div>
              
              <Button 
                variant="exchange" 
                onClick={handleConvert} 
                disabled={userData.tokens < 5} 
                className={`w-full shadow-lg transition-all active:scale-95 ${userData.tokens < 5 ? 'opacity-50 grayscale' : 'shadow-indigo-200'}`}
              >
                {userData.tokens < 5 ? `Need ${5 - userData.tokens} more tokens` : 'Convert to Ticket'}
              </Button>
           </div>
        </div>
        
        {/* DRAWS LIST */}
        <div>
          <div className="flex justify-between items-end mb-3 px-1">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600" /> Active Draws
             </h3>
             {/* Recent Activity Text Button */}
             <button 
                onClick={() => { setHasAnyEntries(false); setShowHistory(true); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
             >
                <History className="w-3 h-3" /> History
             </button>
          </div>

          <div className="space-y-3">
             {draws.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                   No draws active right now.
                </div>
             ) : (
                drawsList
             )}
          </div>
        </div>
      </div>
      
      {/* 4. FLOATING NAVIGATION */}
      <div className="fixed bottom-6 left-6 right-6 z-40">
        <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-2 flex justify-between items-center shadow-2xl border border-slate-700/50 text-slate-400">
          <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-all" onClick={() => setView('dashboard')}>
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-all" onClick={() => setView('rules')}>
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold">Rules</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-900/20 translate-y-[-4px] transition-all" onClick={() => setView('draw')}>
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-bold">Rewards</span>
          </button>
        </div>
      </div>

    </div>
  );
});
ExchangeView.displayName = 'ExchangeView';

// 3. UPLOAD VIEW
const UploadView = React.memo(({ user, setView }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) { alert('Video only!'); return; }
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) { alert('File too large.'); return; }
      setVideoFile(file);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const newUrl = URL.createObjectURL(file);
      previewUrlRef.current = newUrl;
      setPreviewUrl(newUrl);
      setUploadError(null);
      setUploadSuccess(false);
    }
  }, []);

  const uploadVideo = useCallback(async () => {
    if (!videoFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      formData.append('folder', `recycle_app/${user.uid}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error(`Cloudinary Upload Failed: ${response.statusText}`);
      const data = await response.json();
      if (data.secure_url) {
        await saveToDb(data.secure_url);
      } else {
        setUploadError("Upload failed. Cloudinary rejected the file.");
        setUploading(false);
      }
    } catch (e) {
      console.error('Upload error:', e);
      setUploadError("Video upload failed. Please check connection.");
      setUploading(false);
    }
  }, [videoFile, user.uid]);

  const saveToDb = useCallback(async (url) => {
      try {
        const batch = writeBatch(db);
        const timestamp = new Date().toISOString();
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
        const queueRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_queue'));

        batch.update(userRef, {
          pendingTokens: increment(1),
          scanHistory: arrayUnion({ type: 'video_upload', videoUrl: url, timestamp, status: 'pending' }),
        });

        batch.set(queueRef, {
          userId: user.uid,
          videoUrl: url,
          timestamp,
          status: 'pending',
          userDisplay: user.email || `Guest ${user.uid.slice(0, 4)}`,
        });

        await batch.commit();
        setUploading(false);
        setUploadSuccess(true);
      } catch (error) {
        console.error('Save to DB error:', error);
        setUploadError("Upload successful, but saving failed.");
        setUploading(false);
      }
    }, [user.uid, user.email]);

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <button onClick={() => setView('dashboard')} className="hover:opacity-80"><X className="w-6 h-6" /></button>
        <span className="font-semibold">Upload Proof</span><div className="w-6"></div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        {!videoFile ? (
          <label className="block w-full aspect-[3/4] bg-slate-800 rounded-3xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors relative overflow-hidden">
            <Camera className="w-16 h-16 text-slate-400 mb-4" /><p className="text-slate-300 font-medium">Tap to Record</p><p className="text-slate-500 text-xs mt-2">Mobile: Camera | PC: File</p>
            <input type="file" accept="video/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
          </label>
        ) : (
          <div className="w-full max-w-sm">
            {!uploadSuccess ? (
              <>
                <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden mb-6 relative border border-slate-700">
                  <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  {uploading && (<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" /><p className="text-white font-bold mb-2">Uploading...</p></div>)}
                </div>
                {uploadError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-bottom-2"><WifiOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><div><h3 className="text-sm font-bold text-red-800">Upload Failed</h3><p className="text-xs text-red-600">{uploadError}</p></div></div>)}
                <div className="flex gap-3"><Button variant="secondary" onClick={() => { setVideoFile(null); setUploadError(null); }} className="flex-1" disabled={uploading}>Retake</Button><Button onClick={uploadVideo} className="flex-1" disabled={uploading}>Upload Proof</Button></div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-emerald-600" /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Complete!</h2><p className="text-slate-500 text-sm mb-6">Your video has been uploaded for verification.</p><Button onClick={() => setView('dashboard')} className="w-full">Back to Home</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
UploadView.displayName = 'UploadView';

// 4. ADMIN VIEW (Scalable Pagination & Draws)
const AdminView = React.memo(({ setIsAdminMode }) => {
  const [adminTab, setAdminTab] = useState('queue');
  // Changed: queueItems stores our manually fetched list
  const [queueItems, setQueueItems] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [noMoreItems, setNoMoreItems] = useState(false);
  
  const [draws, setDraws] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [newDraw, setNewDraw] = useState({ title: '', color: 'bg-purple-500', ticketCost: '1' });
  const [counts, setCounts] = useState({}); // To store fetched entry counts

  // Draws are still small enough to keep realtime for now, or could paginate similarly
  const unsubDrawsRef = useRef(null);

  // Initial Data Load
  useEffect(() => {
    fetchQueue(true); // Initial fetch

    unsubDrawsRef.current = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'draws'),
      (s) => setDraws(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => console.error("Admin draws error", e)
    );

    return () => {
      if (unsubDrawsRef.current) unsubDrawsRef.current();
    };
  }, []);

  // SOLUTION 1 APPLIED: CURSOR-BASED PAGINATION
  const fetchQueue = async (isReset = false) => {
    if (loadingQueue) return;
    setLoadingQueue(true);
    try {
      const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'admin_queue');
      let q = query(collRef, orderBy('timestamp', 'asc'), limit(10));

      if (!isReset && lastVisible) {
        q = query(collRef, orderBy('timestamp', 'asc'), startAfter(lastVisible), limit(10));
      }

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        const newItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (isReset) {
          setQueueItems(newItems);
        } else {
          setQueueItems(prev => [...prev, ...newItems]);
        }
        setNoMoreItems(false);
      } else {
        if (isReset) setQueueItems([]);
        setNoMoreItems(true);
      }
    } catch (e) {
      console.error("Queue fetch error:", e);
      alert("Error loading queue");
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleFetchCount = async (drawId) => {
    try {
      // SOLUTION 2 APPLIED: SCALABLE COUNT AGGREGATION
      const coll = collection(db, 'artifacts', appId, 'public', 'data', 'draws', drawId, 'entries');
      const snapshot = await getCountFromServer(coll);
      setCounts(prev => ({...prev, [drawId]: snapshot.data().count}));
    } catch (e) {
      console.error("Count error", e);
    }
  };

  const handleVerify = useCallback(async (review, isApproved) => {
    let reason = 'Submission rejected by admin.';
    
    if (!isApproved) {
        const input = prompt("Reason for rejection:", "Invalid submission (e.g. not PET, not crushed).");
        if (input === null) return; // Cancel if user hits cancel
        reason = input || reason;
    }

    try {
      const userRef = doc(db, 'artifacts', appId, 'users', review.userId, 'data', 'profile');
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
          await setDoc(userRef, { tokens: 0, pendingTokens: 0, tickets: 0, scanHistory: [], role: 'user', email: 'Unknown' });
      }

      if (isApproved) {
        await updateDoc(userRef, { pendingTokens: increment(-1), tokens: increment(1) });
      } else {
        await updateDoc(userRef, { pendingTokens: increment(-1), lastRejection: reason });
      }

      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin_queue', review.id));
      
      // Remove from local list to avoid refetching immediately
      setQueueItems(prev => prev.filter(i => i.id !== review.id));
      setSelectedReview(null);
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying. ' + error.message);
    }
  }, []);

  const handleAddDraw = useCallback(async (e) => {
      e.preventDefault();
      if (!newDraw.title.trim()) { alert('Enter a title'); return; }
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'draws'), {
          title: newDraw.title,
          ticketCost: Number(newDraw.ticketCost),
          timestamp: new Date().toISOString(),
          color: newDraw.color,
          status: 'open', // FRAGMENT 1: Initialize as open
        });
        setNewDraw({ title: '', ticketCost: '1', color: 'bg-purple-500' });
      } catch (error) { console.error('Add draw error:', error); }
    }, [newDraw]);

  // FRAGMENT 1: Toggle Status Logic
  const handleToggleStatus = useCallback(async (draw) => {
    try {
       const newStatus = draw.status === 'closed' ? 'open' : 'closed';
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id), {
          status: newStatus
       });
    } catch (e) {
       console.error("Toggle status error", e);
    }
  }, []);
  
  // FRAGMENT 2: Pick Winner Logic (Solution C - Random ID)
  const handlePickWinner = useCallback(async (draw) => {
    if (draw.status !== 'closed') {
        alert("Please close the draw before picking a winner.");
        return;
    }
    if (!confirm("Are you sure? This will permanently pick a winner.")) return;

    try {
        const randomVal = Math.random();
        const entriesRef = collection(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id, 'entries');
        
        // 1. Try to find a ticket with randomId >= randomVal
        let q = query(entriesRef, where('randomId', '>=', randomVal), orderBy('randomId'), limit(1));
        let snapshot = await getDocs(q);

        // 2. Wrap-around Fallback: If no ticket is found (randomVal was too high), pick the first one from start
        if (snapshot.empty) {
            console.log("Wrap around query needed");
            q = query(entriesRef, where('randomId', '>=', 0), orderBy('randomId'), limit(1));
            snapshot = await getDocs(q);
        }

        if (snapshot.empty) {
            alert("No entries found in this draw!");
            return;
        }

        const winnerEntry = snapshot.docs[0].data();
        
        // 3. Update the Draw with Winner info
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id), {
            winnerUserId: winnerEntry.userId,
            winnerEmail: winnerEntry.email,
            winnerTimestamp: new Date().toISOString()
        });

        alert(`Winner Picked: ${winnerEntry.email}`);

    } catch (e) {
        console.error("Pick winner error", e);
        alert("Failed to pick winner. (Note: Old entries might be missing 'randomId')");
    }
  }, []);


  // --- UPDATED DELETE LOGIC: RECURSIVE DELETE (Gap 1 Fix) ---
  const handleDeleteDraw = useCallback(async (id) => {
    if (!confirm('Delete this draw? This will erase all entry data permanently.')) return;
    
    try {
      // 1. Delete Subcollection (Entries)
      // Note: Client-side recursive delete for "entries"
      const entriesRef = collection(db, 'artifacts', appId, 'public', 'data', 'draws', id, 'entries');
      
      // We need to delete in batches of 500 (Firestore limit)
      // Loop until no documents remain
      while (true) {
        // Fetch up to 500 documents
        const snapshot = await getDocs(query(entriesRef, limit(500)));
        
        if (snapshot.empty) break; // Exit loop if no docs left
        
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit(); // Commit batch deletion
      }

      // 2. Delete Parent Doc (The Draw itself)
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'draws', id));
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete draw fully. Check console.');
    }
  }, []);

  const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-500'];

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <div className="bg-slate-800 p-6 pt-10 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck /> Admin Panel</h1>
          <button onClick={() => setIsAdminMode(false)} className="text-xs bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-600">Exit</button>
        </div>
        <div className="flex p-1 bg-slate-700 rounded-xl">
          <button onClick={() => setAdminTab('queue')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${adminTab === 'queue' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Queue ({queueItems.length})</button>
          <button onClick={() => setAdminTab('draws')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${adminTab === 'draws' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Draws</button>
        </div>
      </div>

      {adminTab === 'queue' && (
        <div className="p-4 space-y-2">
          <div className="flex justify-end mb-2">
            <button onClick={() => fetchQueue(true)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600">
               <RotateCcw className="w-3 h-3" /> Refresh List
            </button>
          </div>

          {queueItems.length === 0 && !loadingQueue && (
            <div className="text-center py-10 text-slate-400">Queue is empty</div>
          )}
          
          {queueItems.map((r) => (
            <div key={r.id} onClick={() => setSelectedReview(r)} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={20} /></div>
                <div>
                  <div className="font-semibold text-slate-700 text-sm">{r.userDisplay}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(r.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">Review <ArrowRight className="w-4 h-4" /></div>
            </div>
          ))}

          {/* Load More Button */}
          {!noMoreItems && (
            <button 
              onClick={() => fetchQueue(false)} 
              disabled={loadingQueue}
              className="w-full py-3 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {loadingQueue ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              Load More
            </button>
          )}
        </div>
      )}

      {adminTab === 'draws' && (
        <div className="p-4 space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4">Add Upcoming Draw</h3>
            <form className="space-y-3" onSubmit={handleAddDraw}>
              <div className="flex gap-2 mb-2">
                {colors.map(c => (
                    <button
                    key={c}
                    type="button"
                    onClick={() => setNewDraw({...newDraw, color: c})}
                    className={`w-6 h-6 rounded-full ${c} ${newDraw.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                ))}
              </div>
              <input className="w-full p-2 border rounded-lg text-sm" placeholder="Title" value={newDraw.title} onChange={(e) => setNewDraw({ ...newDraw, title: e.target.value })} />
              <input type="number" className="w-full p-2 border rounded-lg text-sm" placeholder="Cost" value={newDraw.ticketCost} onChange={(e) => setNewDraw({ ...newDraw, ticketCost: e.target.value })} />
              <Button variant="admin" className="w-full" onClick={handleAddDraw}><Plus className="w-4 h-4" /> Add Draw</Button>
            </form>
          </Card>

          <div className="space-y-2">
            {draws.map((d) => (
              <div key={d.id} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${d.color} flex-shrink-0 flex items-center justify-center text-white`}>
                        {d.status === 'closed' ? <Lock className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          {d.title}
                          {d.status === 'closed' && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Closed</span>}
                      </div>
                      <div className="text-xs text-slate-500">Cost: {d.ticketCost}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {/* Toggle Status */}
                     <button 
                        onClick={() => handleToggleStatus(d)}
                        className={`p-2 rounded hover:bg-slate-100 ${d.status === 'closed' ? 'text-emerald-600' : 'text-slate-400'}`}
                        title={d.status === 'closed' ? "Open Draw" : "Close Draw"}
                     >
                        {d.status === 'closed' ? <Play className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                     </button>
                     
                     {/* Delete Button */}
                     <button onClick={() => handleDeleteDraw(d.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                {/* Winner Display (Admin) */}
                {d.winnerEmail && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs text-amber-800 flex items-center gap-2">
                        <Trophy className="w-3 h-3" /> Winner: <strong>{d.winnerEmail}</strong>
                    </div>
                )}

                {/* Draw Controls */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg mt-1">
                   <span className="text-xs text-slate-500 font-medium">Entries: {counts[d.id] !== undefined ? counts[d.id] : '--'}</span>
                   <div className="flex gap-2">
                        {/* Pick Winner Button - Only if closed and no winner yet */}
                        {d.status === 'closed' && !d.winnerEmail && (
                            <button 
                                onClick={() => handlePickWinner(d)}
                                className="text-[10px] bg-indigo-600 text-white border border-indigo-700 px-2 py-1 rounded shadow-sm hover:bg-indigo-700 flex items-center gap-1"
                            >
                                <Dices className="w-3 h-3" /> Pick Winner
                            </button>
                        )}
                        <button 
                            onClick={() => handleFetchCount(d.id)}
                            className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded shadow-sm text-slate-600 hover:text-indigo-600"
                        >
                            Update Count
                        </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-slate-800">Reviewing Proof</h3>
              <button onClick={() => setSelectedReview(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px]">
              <video src={selectedReview.videoUrl.replace(/\.[^/.]+$/, ".mp4")} controls autoPlay className="w-full h-full object-contain max-h-[50vh]" />
            </div>
            <div className="p-6 space-y-4 bg-white">
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1" onClick={() => handleVerify(selectedReview, false)}>Reject</Button>
                <Button variant="success" className="flex-1" onClick={() => handleVerify(selectedReview, true)}>Approve</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
AdminView.displayName = 'AdminView';

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const userUnsubRef = useRef(null);
  const dataUnsubRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      // FIX: Removed the automatic fallback to signInAnonymously(auth) 
      // when no custom token is provided.
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } 
        catch (e) { console.warn('Custom token failed', e); /* Optional: auto-guest if token fails? */ }
      } 
      // Removed "else { await signInAnonymously(auth); }"
    };
    
    initAuth();
    
    userUnsubRef.current = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => { if (userUnsubRef.current) userUnsubRef.current(); };
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
    dataUnsubRef.current = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) { setUserData(docSnap.data()); } 
      else { setDoc(userRef, { tokens: 0, pendingTokens: 0, tickets: 0, scanHistory: [], role: 'user', email: user.email || 'Guest' }); }
    });
    return () => { if (dataUnsubRef.current) dataUnsubRef.current(); };
  }, [user]);

  const handleGoogleLogin = useCallback(async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { alert(`Login error: ${e.code}`); }
  }, []);
  
  const handleGuestLogin = useCallback(async () => {
    try { await signInAnonymously(auth); } catch (e) { console.error(e); }
  }, []);

  const handleLogout = useCallback(async () => {
    try { await signOut(auth); setUserData(null); setView('dashboard'); } catch (e) { console.error(e); }
  }, []);

  const dismissRejection = useCallback(async () => {
    if (!user) return;
    try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile'), { lastRejection: deleteField() }); } catch (e) {}
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/20 to-slate-900 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="w-full max-w-sm relative z-10 flex flex-col items-center text-center">
          {/* NEW LOGO IMPLEMENTATION [cite: 1] */}
          <div className="mb-8 shadow-2xl shadow-emerald-500/20 rounded-[2rem]">
             <MoozaLogo className="w-32 h-32 rounded-[2rem]" variant="filled" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Mooza<span className="text-emerald-400">.Recycle</span></h1>
          <p className="text-slate-400 mb-10 text-lg">Turn plastic into prizes.</p>
          
          <div className="space-y-4 w-full px-4">
          <Button 
  variant="admin" // Changed from 'google' to 'admin' for dark background
  onClick={handleGoogleLogin} 
  className="w-full border border-slate-700 font-bold hover:bg-slate-700 hover:border-emerald-500/50 transition-all mb-4"
>
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
  Continue with Google
</Button>
            
            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700"></span></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-medium">Or</span></div>
            </div>
            
            <Button 
  variant="admin"  // CHANGE: 'secondary' -> 'admin' (This fixes the background color)
  onClick={handleGuestLogin} 
  className="w-full border border-slate-700 font-bold hover:bg-slate-700 hover:border-emerald-500/50 transition-all"
>
   Try as Guest
</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;

  if (isAdminMode) return <AdminView setIsAdminMode={setIsAdminMode} />;
  if (view === 'upload') return <UploadView user={user} setView={setView} />;
  if (view === 'draw') return <ExchangeView user={user} userData={userData} setView={setView} />;
  if (view === 'rules') return <RulesView setView={setView} />;

  // REPLACE THE FINAL return (...) BLOCK IN YOUR App FUNCTION WITH THIS:
  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative font-sans text-slate-800 pb-28">
        
        {/* --- NEW HEADER WITH LOGO --- */}
        {/* --- UPDATED HEADER: Matches Login Branding --- */}
<div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 pt-12 pb-20 px-6 rounded-b-[2.5rem] text-white shadow-2xl relative overflow-hidden">
  
  {/* Background Decor: Keep this transparent so it acts as a subtle watermark */}
  <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-overlay transform rotate-12 scale-150 pointer-events-none">
     <MoozaLogo className="w-64 h-64" variant="transparent" />
  </div>
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

  <div className="relative z-10">
    <div className="flex justify-between items-center mb-8">
      
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-3">
        {/* LOGO: Changed to 'filled' to match Login screen (Dark Slate Box) */}
        <div className="shadow-lg rounded-[1rem] overflow-hidden"> 
           <MoozaLogo className="w-12 h-12" variant="filled" />
        </div>
        
        <div>
          {/* TITLE: Matches Login font and 'dot' styling */}
          <h1 className="text-2xl font-black tracking-tight leading-none text-white">
            Mooza<span className="text-emerald-200">.Recycle</span>
          </h1>
          {/* CAPTION: Matches Login text */}
          <p className="text-emerald-100 text-xs font-medium opacity-90">Turn plastic into prizes.</p>
        </div>
      </div>
      
      {/* Controls (Admin/Logout) - Unchanged */}
      <div className="flex gap-2">
        {user.uid === OWNER_UID && (
          <button onClick={() => setIsAdminMode(true)} className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </button>
        )}
        <button onClick={handleLogout} className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl text-white hover:bg-white/30 transition-all border border-white/10 shadow-lg">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Glass Stats Cards (Unchanged) */}
    <div className="grid grid-cols-2 gap-4 translate-y-8">
      {/* Pending Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 bg-white/10 w-20 h-20 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex items-center gap-2 text-emerald-100 mb-1 z-10">
          <Loader2 className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
        </div>
        <div className="z-10">
          <div className="text-4xl font-black text-white drop-shadow-sm">{userData.pendingTokens}</div>
          <div className="text-[10px] text-emerald-200 mt-1">Video in review</div>
        </div>
      </div>

      {/* Verified Card */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        <div className="flex items-center gap-2 text-emerald-600 mb-1 z-10">
          <Coins className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Balance</span>
        </div>
        <div className="z-10">
          <div className="text-4xl font-black text-emerald-800">{userData.tokens}</div>
          <div className="text-[10px] text-emerald-600/70 mt-1 font-medium">Tokens</div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* --- BODY CONTENT --- */}
        <div className="px-6 mt-16 space-y-6 relative z-0">
          
          {/* Rejection Notice */}
          {userData.lastRejection && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-4 shadow-sm animate-in slide-in-from-top-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                 <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900">Submission Rejected</h3>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">{userData.lastRejection}</p>
              </div>
              <button onClick={dismissRejection} className="text-red-400 hover:text-red-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* New "Record Recycling" Card */}
          <div className="bg-white rounded-3xl p-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
             <div className="bg-slate-50 rounded-[1.3rem] p-6 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md text-emerald-600 border-4 border-emerald-50 relative group cursor-pointer" onClick={() => setView('upload')}>
                   <Video className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                   <div className="absolute inset-0 rounded-full border border-emerald-100 animate-ping opacity-20"></div>
                </div>
                
                <h3 className="font-black text-slate-800 text-xl mb-2">Recycle & Earn</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-[240px] leading-relaxed">
                  Crush a PET bottle, record a video, and get paid in tokens.
                </p>
                
                <Button 
                  className="w-full shadow-emerald-200 shadow-lg transform active:scale-95 transition-all" 
                  onClick={() => setView('upload')}
                >
                  <Camera className="w-5 h-5" /> Start Recording
                </Button>
             </div>
          </div>
        </div>
        
        {/* --- FLOATING NAVIGATION (UPDATED) --- */}
<div className="fixed bottom-6 left-6 right-6 z-40">
  <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-2 flex justify-between items-center shadow-2xl border border-slate-700/50 text-slate-400">
    
    {/* HOME BUTTON */}
    <button 
      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${view === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 translate-y-[-4px]' : 'hover:text-white hover:bg-white/5'}`} 
      onClick={() => setView('dashboard')}
    >
      <Store className="w-5 h-5" />
      {/* Logic removed: Text is always rendered now */}
      <span className="text-[10px] font-bold">Home</span>
    </button>
    
    {/* RULES BUTTON */}
    <button 
      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${view === 'rules' ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/20 translate-y-[-4px]' : 'hover:text-white hover:bg-white/5'}`} 
      onClick={() => setView('rules')}
    >
      <BookOpen className="w-5 h-5" />
      <span className="text-[10px] font-bold">Rules</span>
    </button>
    
    {/* REWARDS BUTTON */}
    <button 
      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${view === 'draw' ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20 translate-y-[-4px]' : 'hover:text-white hover:bg-white/5'}`} 
      onClick={() => setView('draw')}
    >
      <Ticket className="w-5 h-5" />
      <span className="text-[10px] font-bold">Rewards</span>
    </button>
  </div>
</div>

      </div>
    </ErrorBoundary>
  );
}