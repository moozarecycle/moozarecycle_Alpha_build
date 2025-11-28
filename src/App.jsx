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
      desc: "Admins review proof. Approved = 1 Token. Rejected? Check your profile for the specific reason." 
    },
    { 
      icon: <RefreshCw className="w-5 h-5 text-purple-600" />, 
      title: "3. Exchange", 
      desc: "Go to Rewards. Swap 5 Verified Tokens for 1 Lucky Ticket to enter active draws." 
    },
    { 
      icon: <Trophy className="w-5 h-5 text-amber-500" />, 
      title: "4. Win Prizes", 
      desc: "Use tickets to enter. Winners are selected randomly by the system and announced on the card." 
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-y-auto relative font-sans text-slate-800 pb-24">
       <div className="bg-emerald-600 pt-4 pb-2 px-6 flex items-center gap-3 text-white">
        <button
          onClick={() => setView('dashboard')}
          className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
       <div className="bg-emerald-600 pt-2 pb-8 px-6 rounded-b-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen size={128} />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">How it Works</h1>
            <p className="text-emerald-100 text-sm">Follow these simple steps to earn rewards.</p>
          </div>
       </div>
       <div className="p-6 space-y-4 -mt-4 relative z-10">
          {steps.map((s, i) => (
            <Card key={i} className="flex items-start gap-4 p-4 shadow-md border-none">
               <div className="bg-slate-100 p-3 rounded-full flex-shrink-0">{s.icon}</div>
               <div>
                 <h3 className="font-bold text-slate-800">{s.title}</h3>
                 <p className="text-sm text-slate-500 leading-relaxed mt-1">{s.desc}</p>
               </div>
            </Card>
          ))}
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Rules
            </h4>
            <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside opacity-80">
              <li>Only PET plastic bottles are accepted.</li>
              <li>Bottles must be empty and crushed.</li>
              <li>One bottle per video clip.</li>
              <li>Fake submissions will result in a ban.</li>
              <li><strong>Pro Tip:</strong> Enter multiple times to increase your chances!</li>
            </ul>
          </div>
       </div>
    </div>
  );
});
RulesView.displayName = 'RulesView';

// 2. EXCHANGE VIEW
// Helper Component for "Recent Activity" Items (Only shows if count > 0)
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
          setLoading(false);
          if (c > 0) onHasEntry(); // Notify parent that this draw has entries
        }
      } catch (e) {
        console.error("Activity item error", e);
        if (mounted) setLoading(false);
      } finally {
        if (mounted && onLoadComplete) onLoadComplete(); // ISSUE 3 FIX: Notify load complete
      }
    };
    fetchCount();
    return () => { mounted = false; };
  }, [draw.id, userId, onHasEntry, onLoadComplete]);

  if (loading) return (
    <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-6 w-12 bg-slate-200 rounded"></div>
    </div>
  );

  if (count === 0) return null; // Don't show if no tickets

  return (
    <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${draw.color || 'bg-slate-200'} flex items-center justify-center text-white text-xs`}>
           <History className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-700">{draw.title}</div>
          <div className="text-[10px] text-slate-400">
             {draw.status === 'closed' ? 'Closed' : 'Active'} • {new Date(draw.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
        <Tag className="w-3 h-3" /> {count} Ticket{count !== 1 ? 's' : ''}
      </div>
    </div>
  );
});
DrawActivityItem.displayName = 'DrawActivityItem';

const ExchangeView = React.memo(({ user, userData, setView }) => {
  const [draws, setDraws] = useState([]);
  const [showHistory, setShowHistory] = useState(false); // Controls the "Recent Activity" card view
  const [hasAnyEntries, setHasAnyEntries] = useState(false); // Tracks if we found any entries at all
  
  // ISSUE 3 FIX: Track loading state of history items
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
    }, (error) => {
        console.error("Error fetching draws:", error);
    });

    return () => {
      if (unsubDrawRef.current) unsubDrawRef.current();
    };
  }, []);

  const handleConvert = useCallback(async () => {
    if (userData.tokens < 5) return;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User profile does not exist!");
        
        const currentTokens = userDoc.data().tokens || 0;
        if (currentTokens < 5) throw new Error("Insufficient verified tokens.");

        transaction.update(userRef, {
          tokens: increment(-5),
          tickets: increment(1),
        });
      });
    } catch (error) {
      console.error('Conversion error:', error);
      alert(error.message);
    }
  }, [userData.tokens, user.uid]);

  const handleEnterDraw = useCallback(
    async (draw) => {
      const cost = draw.ticketCost || 1;
      try {
        await runTransaction(db, async (transaction) => {
          const drawRef = doc(db, 'artifacts', appId, 'public', 'data', 'draws', draw.id);
          const drawDoc = await transaction.get(drawRef);
          
          if (!drawDoc.exists()) throw new Error('Draw not found');
          if (drawDoc.data().status === 'closed') {
             throw new Error('This draw is closed for new entries.');
          }

          const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'profile');
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists()) throw new Error('User not found');
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
        console.error('Draw entry error:', e);
        alert(e.message || 'Entry failed. Try again.');
      }
    },
    [user.uid, user.email]
  );

  const drawsList = useMemo(
    () =>
      draws.map((draw) => (
        <div
          key={draw.id}
          className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${draw.status === 'closed' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div
                className={`w-10 h-10 rounded-full ${draw.color || 'bg-blue-500'} flex items-center justify-center text-white shadow-md`}
                >
                {draw.status === 'closed' ? <Lock className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
                <div>
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {draw.title}
                    {draw.status === 'closed' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Closed</span>}
                </div>
                <div className="text-xs text-slate-400">
                    {draw.ticketCost || 1} Ticket(s) Required
                </div>
                </div>
            </div>
            
            {!draw.winnerEmail && (
                <Button
                    size="small"
                    variant={draw.status === 'closed' ? 'secondary' : 'secondary'}
                    disabled={userData.tickets < (draw.ticketCost || 1) || draw.status === 'closed'}
                    onClick={() => handleEnterDraw(draw)}
                >
                    {draw.status === 'closed' ? 'Closed' : 'Enter'}
                </Button>
            )}
          </div>

          {/* Winner Display for Users (Privacy Protected) */}
          {draw.winnerEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                      <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Result</div>
                      <div className="text-sm font-bold text-amber-900">
                        {/* PRIVACY FIX: Only show email if it matches current user, else generic msg */}
                        {user.uid === draw.winnerUserId ? "🎉 YOU WON!" : "Winner Announced"}
                      </div>
                  </div>
              </div>
          )}
        </div>
      )),
    [draws, userData.tickets, handleEnterDraw, user.uid] // added user.uid dep
  );

  // --- HISTORY VIEW RENDER ---
  if (showHistory) {
      // ISSUE 3 FIX: Only show empty state if ALL items have reported back
      const allLoaded = itemsLoaded === draws.length;

      return (
        <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-y-auto relative font-sans text-slate-800 pb-24 animate-in slide-in-from-right">
            <div className="bg-indigo-600 pt-4 pb-4 px-6 flex items-center gap-3 text-white sticky top-0 z-10 shadow-md">
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-indigo-700 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h2 className="font-bold text-lg">My Entries</h2>
            </div>
            <div className="p-6 space-y-3">
                {draws.map(draw => (
                    <DrawActivityItem 
                        key={draw.id} 
                        draw={draw} 
                        userId={user.uid} 
                        onHasEntry={() => setHasAnyEntries(true)} 
                        onLoadComplete={handleLoadComplete} // Pass callback
                    />
                ))}
                
                {/* Safe Empty State - Prevents Flashing */}
                {allLoaded && !hasAnyEntries && (
                    <div className="text-center py-12 animate-in fade-in">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Ticket className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-600 font-bold">No entries yet</h3>
                        <p className="text-slate-400 text-sm mt-1">Convert tokens to tickets and enter draws to see them here.</p>
                        <Button variant="secondary" className="mt-6 w-full" onClick={() => setShowHistory(false)}>Browse Draws</Button>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- MAIN EXCHANGE VIEW RENDER ---
  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-y-auto relative font-sans text-slate-800 pb-24">
      {/* ... header code ... */}
      <div className="bg-indigo-600 pt-4 pb-2 px-6 flex items-center gap-3 text-white">
        <button onClick={() => setView('dashboard')} className="p-2 hover:bg-indigo-700 rounded-full transition-colors"><ArrowLeft className="w-6 h-6" /></button>
      </div>
      <div className="bg-indigo-600 pt-4 pb-8 px-6 rounded-b-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Ticket size={128} /></div>
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div><h1 className="text-2xl font-bold">Exchange</h1><p className="text-sm opacity-90 text-indigo-100">Get tickets</p></div>
          <div className="flex gap-2">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 px-3 flex items-center gap-1 border border-white/20 text-sm"><Coins className="w-4 h-4 text-amber-300" /><span className="font-bold">{userData.tokens}</span></div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 px-3 flex items-center gap-1 border border-white/20 text-sm"><Ticket className="w-4 h-4 text-purple-300" /><span className="font-bold">{userData.tickets}</span></div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 -mt-6 relative z-20">
        <Card className="border-indigo-100 shadow-indigo-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3"><div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><RefreshCw className="w-6 h-6" /></div><div><h3 className="font-bold text-slate-800">Token Exchange</h3><p className="text-xs text-slate-500">5 Tokens = 1 Lucky Ticket</p></div></div>
          </div>
          <Button variant="exchange" onClick={handleConvert} disabled={userData.tokens < 5} className="w-full">
            {userData.tokens < 5 ? `Need ${5 - userData.tokens} more tokens` : 'Convert to Ticket'}
          </Button>
        </Card>
        
        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-purple-600" /> Upcoming Draws</h3>
          <div className="space-y-3">{draws.length === 0 ? (<div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">No draws active yet.</div>) : (drawsList)}</div>
        </div>

        {/* RECENT ACTIVITY BUTTON (Gap #1 Fix) */}
        <div className="pt-2">
             <Button variant="history" onClick={() => { setHasAnyEntries(false); setShowHistory(true); }} className="w-full flex justify-between items-center group">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /> Recent Activity</span>
                <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 group-active:rotate-0 transition-transform" />
             </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 flex flex-col items-center justify-center p-6">
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><Video className="w-10 h-10 text-emerald-600" /></div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Mooza.Recycle</h1><p className="text-slate-500 mb-8 text-sm">Recycle plastic, earn cash.</p>
          <div className="space-y-3">
            <Button variant="google" onClick={handleGoogleLogin} className="w-full">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>
            <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or</span></div></div>
            <Button variant="secondary" onClick={handleGuestLogin} className="w-full">Try as Guest</Button>
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

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-y-auto relative font-sans text-slate-800 pb-24">
        <div className="bg-emerald-600 pt-8 pb-12 px-6 rounded-b-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Video className="w-32 h-32" /></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div><h1 className="text-2xl font-bold">Mooza.Recycle</h1><p className="text-emerald-100 text-sm">Welcome, {user.isAnonymous ? 'Guest' : user.email?.split('@')[0]}</p></div>
              <div className="flex gap-2">
                {user.uid === OWNER_UID && <button onClick={() => setIsAdminMode(true)} className="bg-emerald-800/40 p-2 rounded-full text-emerald-100 hover:bg-emerald-800/60"><ShieldCheck className="w-4 h-4" /></button>}
                <button onClick={handleLogout} className="bg-emerald-800/40 p-2 rounded-full text-emerald-100 hover:bg-emerald-800/60"><LogOut className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"><div className="flex items-center gap-2 text-emerald-100 mb-1"><Store className="w-4 h-4" /><span className="text-xs font-medium uppercase">Pending</span></div><div className="text-3xl font-bold text-amber-300">{userData.pendingTokens}</div></div>
              <div className="bg-white rounded-2xl p-4 border border-white/20 text-emerald-900 shadow-lg"><div className="flex items-center gap-2 text-emerald-600 mb-1"><Coins className="w-4 h-4" /><span className="text-xs font-bold uppercase">Verified</span></div><div className="text-3xl font-bold">{userData.tokens}</div></div>
            </div>
          </div>
        </div>

        {userData.lastRejection && (
          <div className="px-6 -mt-4 mb-2 relative z-20 animate-in slide-in-from-top">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><div className="flex-1"><h3 className="text-sm font-bold text-red-800">Rejected</h3><p className="text-xs text-red-600">{userData.lastRejection}</p></div><button onClick={dismissRejection} className="text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        <div className="px-6 relative z-20 mt-[-1.5rem]">
          <Card className="flex flex-col items-center justify-center text-center py-8 border-2 border-dashed border-emerald-300 bg-emerald-50/50">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600"><Video className="w-8 h-8" /></div>
            <h3 className="font-bold text-slate-800 text-lg">Record Recycling</h3>
            <p className="text-sm text-slate-500 mb-4">Crush it, capture it on video, and claim your token! Trade tokens for tickets and win rewards. <strong>(Only PET bottles)</strong></p>
            <Button className="w-full max-w-xs" onClick={() => setView('upload')}>Open Camera</Button>
          </Card>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 pb-6">
          <button className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'} hover:opacity-80`} onClick={() => setView('dashboard')}><Store className="w-6 h-6" /><span className="text-[10px] font-medium">Home</span></button>
          <button className={`flex flex-col items-center gap-1 ${view === 'rules' ? 'text-emerald-600' : 'text-slate-400'} hover:opacity-80`} onClick={() => setView('rules')}><BookOpen className="w-6 h-6" /><span className="text-[10px] font-medium">Rules</span></button>
          <button className={`flex flex-col items-center gap-1 ${view === 'draw' ? 'text-emerald-600' : 'text-slate-400'} hover:opacity-80`} onClick={() => setView('draw')}><Ticket className="w-6 h-6" /><span className="text-[10px] font-medium">Rewards</span></button>
        </div>
      </div>
    </ErrorBoundary>
  );
}