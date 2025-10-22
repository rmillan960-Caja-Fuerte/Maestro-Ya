'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(async (userCredential) => {
        // After user is created, check if they should be owner
        const user = userCredential.user;
        const db = getFirestore(authInstance.app);
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        let role = 'employee'; // Default role

        if (snapshot.empty) {
            // This is the first user, make them an owner
            role = 'owner';
            const ownerRoleRef = doc(db, 'roles_owner', user.uid);
            await setDoc(ownerRoleRef, { assignedAt: new Date() });
        }

        const userDocRef = doc(db, 'users', user.uid);
        const nameParts = email.split('@')[0].split('.');
        const firstName = nameParts[0] || 'Nuevo';
        const lastName = nameParts[1] || 'Usuario';

        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            role: role,
            firstName: firstName,
            lastName: lastName,
            phone: '',
            address: ''
        });
    })
    .catch((error) => {
        console.error("Error during sign up and role assignment: ", error);
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
