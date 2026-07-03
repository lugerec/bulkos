import { getAuth } from "firebase/auth";
import { app } from "../config/firebase";

export const auth = getAuth(app);