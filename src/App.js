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
      const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}');
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
            setMessage("Authentication failed. Cannot collect emails.");
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

      setMessage("You're on the list! 🍑 Launch info coming soon.");
      setEmail('');
    } catch (error) {
      console.error('Error saving email:', error);
      setMessage('Oops! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-inter antialiased flex items-center justify-center p-4" style={{ backgroundColor: colors.deepPeachBackground, color: colors.textDark }}>
      <div className="p-8 md:p-12 rounded-3xl shadow-2xl max-w-xl w-full text-center space-y-8 border-4" style={{ backgroundColor: colors.creamWhite, borderColor: colors.softRosePink }}>
        <div className="flex justify-center mb-4">
          <img
            src="/PeachyPop Logo Design.jpg"
            alt="PeachyPop Logo"
            className="w-40 h-auto object-contain shadow-lg"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold" style={{ color: colors.textDark }}>
          PeachyPop is <br /><span style={{ color: colors.vibrantPeach }}>Coming Soon!</span>
        </h1>

        <p className="text-xl md:text-2xl" style={{ color: colors.warmTaupe }}>Let’s glow together.</p>

        <p className="text-lg md:text-xl" style={{ color: colors.warmTaupe }}>
          Be the first to know when we launch on Amazon — and get early-bird offers, tips, and skin love.
        </p>

        <div className="space-y-6 text-lg md:text-xl" style={{ color: colors.warmTaupe }}>
          <h2 className="text-3xl font-bold mb-4 pt-4 border-t mx-auto max-w-sm" style={{ color: colors.vibrantPeach, borderColor: colors.softRosePink }}>Why We Started PeachyPop</h2>
          <p>
            At a young age, I struggled a lot with acne. Everyone used to say, “You should see a dermatologist,” like it was that easy. But I didn’t like going out… I didn’t even like looking in the mirror sometimes. People kept pointing out what was “wrong” with my skin. No one ever said I looked beautiful. And after a while, I started to believe I wasn’t.
          </p>
          <p>
            It wasn’t just the acne — it was how it made me feel: like I wasn’t allowed to feel confident or seen.
          </p>
          <p>
            So I created something I wish I had back then — not just a pimple patch, but a patch that listens. PeachyPop isn’t here to hide your skin. It’s here to help you heal it — gently, quietly, and confidently.
          </p>
          <p>
            This is for the girls who are still healing. The ones who pop silently, spiral quietly, and just want to feel worthy — even in the healing.
          </p>
          <p className="font-semibold">
            This is PeachyPop.
            <br />
            Tiny patch. Big energy.
          </p>
          <p className="font-semibold text-right">
            – PJ
            <br />
            Founder, PeachyPop Skincare
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-5 mt-8">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-6 py-4 border-2 rounded-xl text-lg shadow-sm"
            style={{ borderColor: colors.vibrantPeach, color: colors.textDark }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !isAuthReady}
            required
          />
          <button
            type="submit"
            className="w-full text-white py-4 rounded-xl font-bold text-xl shadow-lg"
            style={{ backgroundColor: colors.vibrantPeach }}
            disabled={isLoading || !isAuthReady}
          >
            {isLoading ? 'Subscribing...' : 'Notify Me!'}
          </button>
          {message && (
            <p className={`mt-4 text-center font-medium ${message.includes('Error') || message.includes('Please') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </form>

        <p className="text-sm mt-6" style={{ color: colors.warmTaupe }}>
          Follow us: <a href="https://www.instagram.com/peachypopkin/" target="_blank" rel="noopener noreferrer" style={{ color: colors.vibrantPeach }}>@peachypopkin</a><br />
          Contact: <a href="mailto:info@peachypopskincare.com" style={{ color: colors.vibrantPeach }}>info@peachypopskincare.com</a>
        </p>
      </div>
    </div>
  );
}

export default App;
