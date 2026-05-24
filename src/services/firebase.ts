/**
 * DDSulf — Backwards-Compatible Firebase Connection Bridging
 * Re-exports core singletons from the structured @/firebase backend module.
 */

import { db, auth, app } from '../firebase/config';

export { db, auth, app };
export default { db, auth, app };
