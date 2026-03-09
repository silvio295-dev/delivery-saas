import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseClient";

export type Membership = {
  tenantId: string;
  role: string; // depois tipamos melhor (owner/admin/staff)
};

export async function getMyMembership(): Promise<Membership> {
  const user = auth.currentUser;
  if (!user) throw new Error("not-authenticated");

  const ref = doc(db, "memberships", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("no-membership");

  const data = snap.data() as any;

  if (!data.tenantId) throw new Error("invalid-membership");

  return { tenantId: data.tenantId, role: data.role ?? "staff" };
}