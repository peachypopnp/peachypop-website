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
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';

      if (Object.keys(firebaseConfig).length === 0) {
        console.warn("Firebase config missing. Running in local preview.");
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
            console.error("Auth failed:", authError);
            setMessage("Authentication failed. Cannot collect emails.");
            setIsAuthReady(true);
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase init error:", error);
      setMessage("Service init error. Try again later.");
    }
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email.');
      return;
    }
    if (!db || !auth || !userId || !isAuthReady) {
      setMessage('Service not ready. Please wait and try again.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const emailsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/comingSoonEmails`);

      await addDoc(emailsCollectionRef, {
        email: email,
        timestamp: serverTimestamp(),
        userId: userId
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
            className="w-full text-white py-4 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center"
            style={{ backgroundColor: colors.vibrantPeach }}
            disabled={isLoading || !isAuthReady}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Subscribing...</span>
              </span>
            ) : (
              'Notify Me!'
            )}
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
