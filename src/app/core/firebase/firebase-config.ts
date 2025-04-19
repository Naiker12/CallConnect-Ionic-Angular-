
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';


const app = getApps().length === 0
  ? initializeApp(environment.firebaseConfig)
  : getApp();

const auth = getAuth(app);

export { app, auth };
