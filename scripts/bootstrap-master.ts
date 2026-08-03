import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { validateEmpresaId, buildSyntheticEmail } from '../src/utils/authUtils';

dotenv.config();

async function runBootstrapMaster() {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountVar) {
    const serviceAccount = JSON.parse(serviceAccountVar);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin SDK inicializado via FIREBASE_SERVICE_ACCOUNT.');
  } else {
    initializeApp();
    console.log('Firebase Admin SDK inicializado com credenciais padrão.');
  }

  const empresaId = process.env.BOOTSTRAP_EMPRESA_ID || 'ddsulf';
  const login = process.env.BOOTSTRAP_LOGIN || 'master';
  const senhaTemporaria = process.env.BOOTSTRAP_PASSWORD || '123456';
  const name = process.env.BOOTSTRAP_NAME || 'Master DDSulf';

  if (!validateEmpresaId(empresaId)) {
    throw new Error(`EmpresaId inválido: ${empresaId}`);
  }

  const email = buildSyntheticEmail(login, empresaId);
  console.log(`Iniciando bootstrap da conta master: ${email} (${empresaId})...`);

  let uid: string;
  try {
    const existingUser = await getAuth().getUserByEmail(email);
    uid = existingUser.uid;
    console.log(`Usuário existente encontrado (UID: ${uid}). Atualizando perfil master sem sobrescrever senha desnecessariamente...`);
  } catch {
    const newUser = await getAuth().createUser({ email, password: senhaTemporaria, displayName: name });
    uid = newUser.uid;
    console.log(`Novo usuário master criado (UID: ${uid}).`);
  }

  const claims = { empresaId, role: 'master', isSuperAdmin: true };
  await getAuth().setCustomUserClaims(uid, claims);

  const db = getFirestore();
  await db.doc(`empresas/${empresaId}/usuarios/${uid}`).set({
    uid,
    login: login.trim().toLowerCase(),
    email,
    name,
    cargo: 'Gestor Master',
    empresaId,
    role: 'master',
    isSuperAdmin: true,
    permissions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log(`✅ Bootstrap concluído com sucesso! Claims aplicados:`, claims);
}

runBootstrapMaster().catch((err) => {
  console.error('❌ Erro no script de bootstrap-master:', err);
  process.exit(1);
});
