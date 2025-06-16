import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const colors = {
    deepPeachBackground: '#FF9248',
    peachBlush: '#FFE5DC',
    softRosePink: '#FADADD',
    creamWhite: '#FFFDF9',
    sageGreen: '#CDE0D1',
    dustyLavender: '#E3D5E5',
    warmTaupe: '#A28D85',
    textDark: '#333333',
    vibrantPeach: '#FF7043',
    darkGreen: '#4F7C4E'
  };

  useEffect(() => {
    try {
      const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {};
      const initialAuthToken = process.env.REACT_APP_INITIAL_AUTH_TOKEN || '';

      if (Object.keys(firebaseConfig).length === 0) {
        console.warn("Running locally: Firebase config is missing. Email collection will not work.");
        setMessage("Note: Email collection is disabled in local preview.");
        setIsAuthReady(true);
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              setUserId(firebaseAuth.currentUser?.uid);
            } else {
              await signInAnonymously(firebaseAuth);
              setUserId(firebaseAuth.currentUser?.uid);
            }
            setIsAuthReady(true);
          } catch (authError) {
            console.error("Firebase Anonymous Auth Failed:", authError);
            setMessage("Error: Authentication failed. Cannot collect emails.");
            setIsAuthReady(true);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
      setMessage("Error initializing services. Please try again later.");
    }
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    if (!db || !auth || !userId || !isAuthReady) {
      setMessage('Services not ready. Please wait a moment and try again.');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const currentAppId = process.env.REACT_APP_APP_ID || 'default-app-id';
      const emailsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/comingSoonEmails`);

      await addDoc(emailsCollectionRef, {
        email: email,
        timestamp: serverTimestamp(),
        userId: userId,
      });

      setMessage("You're on the list for exclusive early access and launch discounts! 🍑");
      setEmail('');
    } catch (error) {
      console.error('Error adding email:', error);
      setMessage('Oops! Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-inter flex items-center justify-center p-6 md:p-12" style={{ backgroundColor: colors.deepPeachBackground, color: colors.textDark }}>
      <div className="w-full max-w-3xl rounded-3xl shadow-2xl border-4 text-center p-8 md:p-12 space-y-8" style={{ backgroundColor: colors.creamWhite, borderColor: colors.softRosePink }}>
        <div className="flex justify-center">
          <img src="/PeachyPop Logo Design.jpg" alt="PeachyPop Logo" className="w-40 h-auto object-contain shadow-lg mx-auto" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">PeachyPop is <br /><span style={{ color: colors.vibrantPeach }}>Coming Soon!</span></h1>

        <p className="text-xl md:text-2xl" style={{ color: colors.warmTaupe }}>
          Let’s glow together.
        </p>

        <h2 className="text-3xl font-bold pt-4 border-t mx-auto max-w-sm" style={{ color: colors.vibrantPeach, borderColor: colors.softRosePink }}>Why We Started PeachyPop</h2>

        <div className="space-y-4 text-lg md:text-xl" style={{ color: colors.warmTaupe }}>
          <p>At a young age, I struggled a lot with acne. Everyone used to say, “You should see a dermatologist,” like it was that easy. But I didn’t like going out… I didn’t even like looking in the mirror sometimes. People kept pointing out what was “wrong” with my skin. No one ever said I looked beautiful. And after a while, I started to believe I wasn’t.</p>
          <p>It wasn’t just the acne — it was how it made me feel: like I wasn’t allowed to feel confident or seen.</p>
          <p>So I created something I wish I had back then — not just a pimple patch, but a patch that listens. PeachyPop isn’t here to hide your skin. It’s here to help you heal it — gently, quietly, and confidently.</p>
          <p>This is for the girls who are still healing. The ones who pop silently, spiral quietly, and just want to feel worthy — even in the healing.</p>
          <p className="font-semibold">This is PeachyPop. <br/> Tiny patch. Big energy.</p>
          <p className="font-semibold text-right">– PJ<br/>Founder, PeachyPop Skincare</p>
        </div>

        <p className="text-lg md:text-xl" style={{ color: colors.warmTaupe }}>
          Be the first to know when we launch on Amazon — and get exclusive early-bird offers, skincare tips, and gentle reminders to love your skin.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email for exclusive launch offers!"
            className="w-full px-6 py-4 border-2 rounded-xl text-lg shadow-sm"
            style={{ borderColor: colors.vibrantPeach, color: colors.textDark }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !isAuthReady}
            required
          />
          <button
            type="submit"
            className="w-full text-white py-4 rounded-xl font-bold text-xl shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.vibrantPeach }}
            disabled={isLoading || !isAuthReady}
          >
            {isLoading ? 'Subscribing...' : 'Notify Me!'}
          </button>
          {message && <p className={`mt-4 text-center font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
        </form>

        <p className="text-sm mt-6" style={{ color: colors.warmTaupe }}>
          Follow us: <a href="https://www.instagram.com/peachypopkin/" className="hover:underline" style={{ color: colors.vibrantPeach }}>@peachypopkin</a><br />
          Contact: <a href="mailto:info@peachypopskincare.com" className="hover:underline" style={{ color: colors.vibrantPeach }}>info@peachypopskincare.com</a>
        </p>
      </div>
    </div>
  );
}

export default App;
