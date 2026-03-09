import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export async function getTenantId() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const membershipRef = doc(db, "memberships", user.uid);

  const membershipSnap = await getDoc(membershipRef);

  if (!membershipSnap.exists()) {
    throw new Error("Membership não encontrado");
  }

  const data = membershipSnap.data();

  return data.tenantId;
}