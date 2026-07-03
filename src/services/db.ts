import { getFirestore } from "firebase/firestore";
import { app } from "../config/firebase";

export const db = getFirestore(app);