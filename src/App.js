import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Main App Component for Coming Soon page
function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To ensure Firestore ops only after auth

  // Define your new color palette with a vibrant peach accent
  const colors = {
    // Re-evaluating palette for richer, more peachy feel as per user's latest feedback
    deepPeachBackground: '#FF9248', // Deeper, more saturated peach for main background
    peachBlush: '#FFE5DC',          // Lighter peach for accents or containers
    softRosePink: '#FADADD',        // Accent text, gentle CTA buttons
    creamWhite: '#FFFDF9',          // Main text background or section (inner container)
    sageGreen: '#CDE0D1',           // Natural/clean highlight
    dustyLavender: '#E3D5E5',       // Calm headlines, neutral vibe
    warmTaupe: '#A28D85',           // Body text or soft contrast (used carefully)
    textDark: '#333333',            // A slightly softer dark for primary text (use for body text)
    vibrantPeach: '#FF7043',        // Even more vibrant peach/orange for key highlights (e.g., button, main "Coming Soon")
    darkGreen: '#4F7C4E'            // From your logo, for strong contrast on white/peach
  };

  // --- Firebase Initialization and Auth ---
  // This useEffect hook must be directly inside the App component, not inside any other function.
  useEffect(() => {
    try {
      // Safely access global variables, providing fallbacks for local build environment
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : ''; // Define here for useEffect

      // If running locally (outside Canvas) and firebaseConfig is empty, skip Firebase init
      // This will prevent "not defined" errors and allow local build to complete.
      if (Object.keys(firebaseConfig).length === 0) {
        console.warn("Running locally: Firebase config is missing. Email collection will not work.");
        setMessage("Note: Email collection is disabled in local preview.");
        setIsAuthReady(true); // Still set to true to allow rest of UI to load
        return; // Exit useEffect early
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
          // If no user, try to sign in anonymously
          try {
            if (initialAuthToken) { // Use the safely defined initialAuthToken
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
  }, []); // Run once on component mount

  // --- Email Submission Handler ---
  const handleSubscribe = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    // Check if services are ready, especially if running locally without Firebase config
    if (!db || !auth || !userId || !isAuthReady) {
      setMessage('Services not ready. Please wait a moment and try again. (Email collection disabled if running locally without Firebase config)');
      console.warn("Attempted subscribe before Firestore/Auth ready or no Firebase config in local build.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Safely access appId within this function too, though it should be defined from useEffect
      const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const emailsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/comingSoonEmails`);

      await addDoc(emailsCollectionRef, {
        email: email,
        timestamp: serverTimestamp(),
        userId: userId, // Store the anonymous user ID
      });

      setMessage('Awesome! You\'re on the list for exclusive early access and launch discounts. Get ready for something peachy! 🍑');
      setEmail(''); // Clear input on success
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
      setMessage('Oops! Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-inter antialiased flex items-center justify-center p-4" style={{ backgroundColor: colors.deepPeachBackground, color: colors.textDark }}>
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Google Fonts - Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Main Coming Soon Container */}
      <div className="p-8 md:p-12 rounded-3xl shadow-2xl max-w-xl w-full text-center space-y-8 border-4" style={{ backgroundColor: colors.creamWhite, borderColor: colors.softRosePink }}>
        <div className="flex justify-center mb-4">
          {/* Logo is now linked to the file in the public folder */}
          <img
            src="/PeachyPop Logo Design.jpg" // IMPORTANT: Use this exact path!
            alt="PeachyPop Logo"
            className="w-40 h-auto object-contain shadow-lg" // Increased size, adjusted for logo aspect ratio
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight" style={{ color: colors.textDark }}>
          PeachyPop is <br /><span style={{ color: colors.vibrantPeach }}>Coming Soon!</span>
        </h1>

        <p className="text-xl md:text-2xl leading-relaxed max-w-md mx-auto" style={{ color: colors.warmTaupe }}>
          Let’s glow together.
        </p>

        {/* Story section with Warm Taupe text */}
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
                <br/>
                Tiny patch. Big energy.
            </p>
            <p className="font-semibold text-right">
                – PJ
                <br/>
                Founder, PeachyPop Skincare
            </p>
        </div>
        {/* End of new section */}

        <p className="text-lg md:text-xl" style={{ color: colors.warmTaupe }}>
          Be the first to know when we launch on Amazon — and get exclusive early-bird offers, skincare tips, and gentle reminders to love your skin.
        </p>


        {/* Email Opt-in Form */}
        <form onSubmit={handleSubscribe} className="space-y-5 mt-8">
          <input
            type="email"
            placeholder="Enter your email for exclusive launch offers!"
            className="w-full px-6 py-4 border-2 rounded-xl focus:ring-[#FADADD] focus:border-[#FADADD] text-lg shadow-sm transition-all duration-300"
            style={{ borderColor: colors.vibrantPeach, color: colors.textDark }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || !isAuthReady}
            required
          />
          <button
            type="submit"
            className="w-full text-white py-4 rounded-xl hover:opacity-90 transition-all duration-300 ease-in-out font-bold text-xl shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: colors.vibrantPeach }}
            disabled={isLoading || !isAuthReady}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <p