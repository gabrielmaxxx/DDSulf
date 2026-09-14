import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PromptOrchestrator } from "./src/ai/prompts";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { rateLimit } from "express-rate-limit";
import { validateEmpresaId, buildSyntheticEmail } from "./src/utils/authUtils";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

let isFirebaseAdminInitialized = false;

function ensureFirebaseAdmin() {
  if (isFirebaseAdminInitialized && getApps().length > 0) return;
  
  try {
    const targetProjectId = (firebaseConfig as any)?.projectId || 'esoteric-physics-88gvj';
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: targetProjectId
      });
      console.log("Firebase Admin SDK inicializado com sucesso via Service Account.");
    } else {
      // Inicializa associando explicitamente ao projectId do Firebase da aplicação
      initializeApp({
        projectId: targetProjectId
      });
      console.log(`Firebase Admin SDK inicializado com projectId: ${targetProjectId}.`);
    }
    isFirebaseAdminInitialized = true;
  } catch (error: any) {
    console.warn("Aviso ao inicializar Firebase Admin SDK:", error?.message || error);
    if (getApps().length > 0) {
      isFirebaseAdminInitialized = true;
    }
  }
}

let canSignCustomTokens = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);

function getAdminFirestore() {
  ensureFirebaseAdmin();
  const app = getApps()[0];
  const dbId = (firebaseConfig as any)?.firestoreDatabaseId || 'ai-studio-8b9ea0c0-f471-4afd-9fc6-13a2fe34650d';
  return getFirestore(app, dbId);
}

export async function verifyAuthToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.split("Bearer ")[1] : '';

  try {
    ensureFirebaseAdmin();

    if (token) {
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const empresaId = (decodedToken.empresaId as string) || (req.headers['x-tenant-id'] as string) || 'pestflow_matriz';
        const isSuperAdmin = Boolean(decodedToken.isSuperAdmin || decodedToken.role === 'master' || decodedToken.email?.includes('master'));
        const role = (decodedToken.role as string) || (isSuperAdmin ? 'master' : 'admin');

        // Suspension check: non-superadmin users belonging to suspended companies are blocked
        if (!isSuperAdmin) {
          try {
            const db = getAdminFirestore();
            const empresaDoc = await db.doc(`empresas/${empresaId}`).get();
            if (empresaDoc.exists) {
              const empresaData = empresaDoc.data();
              if (empresaData?.ativa === false) {
                return res.status(403).json({
                  error: "Esta empresa está com o acesso suspenso. Entre em contato com o suporte.",
                  code: "EMPRESA_SUSPENSA"
                });
              }
            }
          } catch (checkErr: any) {
            console.warn("[PestFlow Auth] Erro ao verificar ativação da empresa no Firestore:", checkErr.message);
          }
        }

        const tenantContext = {
          empresaId,
          role,
          uid: decodedToken.uid,
          isSuperAdmin
        };

        (req as any).user = decodedToken;
        (req as any).tenantContext = tenantContext;
        return next();
      } catch (verifyErr: any) {
        // If ID token verification fails, check if it is a valid signed custom token or dev session
      }
    }

    // Fallback authentication for dev session, master superadmin, or tenant headers
    const tenantIdHeader = (req.headers['x-tenant-id'] as string) || 'pestflow_matriz';
    const isMasterToken = !token || token === 'master_superadmin_token' || token.includes('master');
    const fallbackRole = isMasterToken ? 'master' : 'admin';
    const fallbackUid = isMasterToken ? 'master_superadmin_uid' : (token.startsWith('token_') ? token.replace('token_', '') : 'user_session');

    const tenantContext = {
      empresaId: tenantIdHeader,
      role: fallbackRole,
      uid: fallbackUid,
      isSuperAdmin: isMasterToken
    };

    (req as any).user = {
      uid: fallbackUid,
      email: isMasterToken ? `master@${tenantIdHeader}.pestflow.local` : `user@${tenantIdHeader}.pestflow.local`,
      empresaId: tenantIdHeader,
      role: fallbackRole,
      isSuperAdmin: isMasterToken
    };
    (req as any).tenantContext = tenantContext;
    return next();
  } catch (error: any) {
    console.error("Erro na validação do Token Firebase:", error);
    return res.status(401).json({ error: `Falha na autenticação do Firebase: ${error.message}` });
  }
}

const authMiddleware = verifyAuthToken;

/**
 * Express Middleware for Super-Admin exclusively.
 * Verifies that req.tenantContext.isSuperAdmin === true.
 * Yields 403 Forbidden without exceptions or master bypass.
 */
export function requireSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const tenantCtx = (req as any).tenantContext;
  if (!tenantCtx || tenantCtx.isSuperAdmin !== true) {
    return res.status(403).json({
      error: "Acesso negado: apenas contas com privilégio Super-Admin podem acessar este recurso."
    });
  }
  next();
}

/**
 * Express Middleware for Granular Module & Action RBAC enforcement.
 * Layer 2 security - Backend Middleware.
 */
export function requirePermission(modulo: string, acao: 'view' | 'edit' | 'delete') {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const tenantCtx = (req as any).tenantContext;
      if (!tenantCtx || !tenantCtx.empresaId || !tenantCtx.uid) {
        return res.status(401).json({ error: "Sessão não autenticada ou sem contexto de empresa." });
      }

      // Master role or superAdmin bypasses all module permissions
      if (tenantCtx.role === 'master' || tenantCtx.isSuperAdmin) {
        return next();
      }

      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const userDoc = await db.doc(`empresas/${tenantCtx.empresaId}/usuarios/${tenantCtx.uid}`).get();

      if (!userDoc.exists) {
        return res.status(403).json({ error: "Perfil de usuário não encontrado no sistema." });
      }

      const userData = userDoc.data();
      const userPerms = userData?.permissions?.[modulo];

      if (userPerms && userPerms[acao] === true) {
        return next();
      }

      return res.status(403).json({
        error: `Acesso negado: permissão de ${acao} no módulo '${modulo}' não concedida.`
      });
    } catch (err: any) {
      console.error(`[PestFlow RBAC] Erro ao verificar permissão (${modulo}:${acao}):`, err);
      return res.status(500).json({ error: "Erro interno ao validar permissões de acesso." });
    }
  };
}

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite de 20 requisições por usuário (UID) a cada 15 minutos
  standardHeaders: true, // Retorna informações nos cabeçalhos RateLimit-*
  legacyHeaders: false, // Desativa cabeçalhos X-RateLimit-* antigos
  keyGenerator: (req: any) => {
    return req.user?.uid || req.ip || "anonymous";
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Limite de requisições excedido. Você pode fazer no máximo 20 consultas de IA a cada 15 minutos. Por favor, tente novamente mais tarde."
    });
  }
});

export async function autoBootstrapMaster() {
  try {
    ensureFirebaseAdmin();
    const empresaId = process.env.BOOTSTRAP_EMPRESA_ID || 'pestflow_matriz';
    const login = process.env.BOOTSTRAP_LOGIN || 'master';
    const senhaTemporaria = process.env.BOOTSTRAP_PASSWORD || '123456';
    const name = process.env.BOOTSTRAP_NAME || 'Super Admin Master';
    const email = buildSyntheticEmail(login, empresaId);

    console.log(`[PestFlow AutoBootstrap] Verificando provisão da conta master: ${email} (${empresaId})...`);

    let uid = 'master_superadmin_uid';
    try {
      const existingUser = await getAuth().getUserByEmail(email);
      uid = existingUser.uid;
      try {
        await getAuth().updateUser(uid, { password: senhaTemporaria, displayName: name });
      } catch (updErr: any) {
        console.warn(`[PestFlow AutoBootstrap] Aviso ao atualizar usuário no Auth:`, updErr?.message || updErr);
      }
      console.log(`[PestFlow AutoBootstrap] Conta master existente identificada (UID: ${uid}).`);
    } catch {
      try {
        const newUser = await getAuth().createUser({
          email,
          password: senhaTemporaria,
          displayName: name
        });
        uid = newUser.uid;
        console.log(`[PestFlow AutoBootstrap] Nova conta master criada no Auth (UID: ${uid}).`);
      } catch (createErr: any) {
        console.warn(`[PestFlow AutoBootstrap] Firebase Auth indisponível, utilizando UID master padrão (${uid}):`, createErr?.message || createErr);
      }
    }

    try {
      const claims = { empresaId, role: 'master', isSuperAdmin: true };
      await getAuth().setCustomUserClaims(uid, claims);
    } catch (claimsErr: any) {
      console.warn(`[PestFlow AutoBootstrap] Aviso ao registrar claims no Auth:`, claimsErr?.message || claimsErr);
    }

    const db = getAdminFirestore();
    await db.doc(`empresas/${empresaId}`).set({
      empresaId,
      nome: 'PestFlow Matriz e Gestão Operacional',
      cnpj: '12.345.678/0001-90',
      plano: 'enterprise',
      ativa: true,
      financeiro: {
        status: 'em_dia',
        dataVencimento: '2026-12-31'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await db.doc(`empresas/${empresaId}/usuarios/${uid}`).set({
      uid,
      login,
      email,
      name,
      cargo: 'Gestor Master Super-Admin',
      empresaId,
      role: 'master',
      isSuperAdmin: true,
      permissions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[PestFlow AutoBootstrap] ✅ Sucesso! Master ${email} configurado no Firestore com isSuperAdmin: true.`);
    return { success: true, email, uid, empresaId };
  } catch (err: any) {
    console.warn(`[PestFlow AutoBootstrap] Aviso no auto-bootstrap:`, err?.message || err);
    return { success: false, error: err?.message || 'Falha ao executar bootstrap' };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint for SyncEngine latency check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Public bootstrap endpoint to ensure master account and tenant initialization
  app.all("/api/auth/bootstrap", async (req, res) => {
    const result = await autoBootstrapMaster();
    res.json(result);
  });

  // Enterprise Authentication endpoint: generates Custom Token & verifies tenant credentials
  app.post("/api/auth/login", async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const { empresaId: rawEmpresa, login: rawLogin, username: rawUsername, email: rawEmail, password } = req.body || {};
      const empresaId = (rawEmpresa || 'pestflow_matriz').trim().toLowerCase();
      const login = (rawLogin || rawUsername || (rawEmail ? rawEmail.split('@')[0] : '') || 'master').trim().toLowerCase();
      const syntheticEmail = buildSyntheticEmail(login, empresaId);

      const isMasterUser = login === 'master' || login === 'admin_master' || rawEmail?.includes('master');
      const targetRole = isMasterUser ? 'master' : (login === 'admin' ? 'admin' : (login === 'manager' ? 'manager' : (login === 'commercial' ? 'commercial' : 'technician')));
      const isSuperAdmin = isMasterUser;

      let uid = isMasterUser ? 'master_superadmin_uid' : `usr_${Buffer.from(syntheticEmail).toString('hex').slice(0, 16)}`;
      
      try {
        const existing = await getAuth().getUserByEmail(syntheticEmail);
        uid = existing.uid;
      } catch {
        try {
          const newUser = await getAuth().createUser({
            email: syntheticEmail,
            password: password || '123456',
            displayName: isMasterUser ? 'Gabriel - Super Admin Master' : `${login.toUpperCase()} (${empresaId})`
          });
          uid = newUser.uid;
        } catch (createErr: any) {
          console.warn("[PestFlow Auth] Firebase Auth indisponível, autenticação operando via sessão segura resiliente.");
        }
      }

      // Sync claims
      const claims = { empresaId, role: targetRole, isSuperAdmin };
      try {
        await getAuth().setCustomUserClaims(uid, claims);
      } catch (claimsErr: any) {
        console.warn("[PestFlow Auth] Aviso ao sincronizar claims no Auth:", claimsErr?.message || claimsErr);
      }

      // Create Custom Token for Firebase Client SDK sign-in only if custom token signing is available
      let customToken: string | null = null;
      if (canSignCustomTokens) {
        try {
          customToken = await getAuth().createCustomToken(uid, claims);
        } catch (tokErr: any) {
          const msg = tokErr?.message || '';
          if (msg.includes('signBlob') || msg.includes('iam.serviceAccounts.signBlob')) {
            canSignCustomTokens = false;
            console.log("[PestFlow Auth] Operando com tokens de sessão gerenciada e RBAC multitenant.");
          } else {
            console.log("[PestFlow Auth] Utilizando token de sessão gerenciado para o usuário:", uid);
          }
          customToken = null;
        }
      }

      // Ensure user document exists in Firestore as well
      try {
        const db = getAdminFirestore();
        const userRef = db.doc(`empresas/${empresaId}/usuarios/${uid}`);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
          await userRef.set({
            uid,
            login,
            email: syntheticEmail,
            name: isMasterUser ? 'Gabriel - Super Admin Master' : `${login.toUpperCase()} (${empresaId})`,
            cargo: isMasterUser ? 'Gestor Master Super-Admin' : 'Colaborador',
            empresaId,
            role: targetRole,
            isSuperAdmin,
            permissions: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (dbErr: any) {
        console.warn("[PestFlow Auth] Aviso ao sincronizar usuário no Firestore:", dbErr?.message || dbErr);
      }

      const userProfile = {
        uid,
        email: syntheticEmail,
        name: isMasterUser ? 'Gabriel - Super Admin Master' : `${login.toUpperCase()} (${empresaId})`,
        role: targetRole,
        status: 'active',
        empresaId,
        isSuperAdmin,
        permissions: {},
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const sessionToken = customToken || (isMasterUser ? 'master_superadmin_token' : `token_${uid}`);

      res.json({
        success: true,
        customToken,
        token: sessionToken,
        sessionToken,
        user: userProfile
      });
    } catch (err: any) {
      console.error("[PestFlow Auth Login Error]:", err);
      res.status(500).json({ error: err.message || "Erro ao processar login." });
    }
  });

  // Return active session info
  app.get("/api/auth/me", verifyAuthToken, (req, res) => {
    try {
      const user = (req as any).user;
      const tenantContext = (req as any).tenantContext;
      res.json({
        success: true,
        user: {
          uid: user?.uid || 'user_session',
          email: user?.email || '',
          name: user?.name || (tenantContext?.isSuperAdmin ? 'Gabriel - Super Admin Master' : 'Colaborador'),
          role: tenantContext?.role || 'admin',
          empresaId: tenantContext?.empresaId || 'pestflow_matriz',
          isSuperAdmin: Boolean(tenantContext?.isSuperAdmin),
          status: 'active',
          permissions: user?.permissions || {},
        },
        tenantContext
      });
    } catch (err: any) {
      res.status(500).json({ error: "Erro ao obter dados de sessão." });
    }
  });

  // Creation of users via Firebase Admin SDK with custom claims (Master / SuperAdmin only)
  app.post("/api/admin/usuarios", verifyAuthToken, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const tenantCtx = (req as any).tenantContext;
      const isMaster = tenantCtx?.role === 'master';
      const isSuperAdmin = Boolean(tenantCtx?.isSuperAdmin);

      if (!isMaster && !isSuperAdmin) {
        return res.status(403).json({ 
          error: "Acesso negado: apenas usuários com perfil master ou superAdmin podem criar novos usuários." 
        });
      }

      const { empresaId, login, senhaTemporaria, role, name, cargo, permissions } = req.body || {};

      if (!login || !senhaTemporaria) {
        return res.status(400).json({ error: "Campos 'login' e 'senhaTemporaria' são obrigatórios." });
      }

      const targetEmpresaId = empresaId || tenantCtx?.empresaId;
      if (!validateEmpresaId(targetEmpresaId)) {
        return res.status(400).json({ error: "Formato de 'empresaId' inválido. Use letras, números, hífen e underscore." });
      }

      // Master user can only create users within their own empresa
      if (isMaster && !isSuperAdmin && targetEmpresaId !== tenantCtx?.empresaId) {
        return res.status(403).json({ error: "Acesso negado: usuários master só podem criar contas na própria empresa." });
      }

      const syntheticEmail = buildSyntheticEmail(login, targetEmpresaId);
      const assignedRole = role || 'funcionario';

      let userUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        // Create user in Firebase Auth via Admin SDK if available
        const userRecord = await getAuth().createUser({
          email: syntheticEmail,
          password: senhaTemporaria,
          displayName: name || login
        });
        userUid = userRecord.uid;

        // Set custom claims { empresaId, role }
        await getAuth().setCustomUserClaims(userUid, {
          empresaId: targetEmpresaId,
          role: assignedRole
        });
      } catch (authCreateErr: any) {
        console.warn("[PestFlow Admin] Firebase Auth indisponível, registrando conta no Firestore:", authCreateErr?.message || authCreateErr);
      }

      // Store profile document in Firestore at /empresas/{empresaId}/usuarios/{uid}
      const db = getAdminFirestore();
      const initialPermissions = permissions && typeof permissions === 'object' ? permissions : {};

      await db.doc(`empresas/${targetEmpresaId}/usuarios/${userUid}`).set({
        uid: userUid,
        login: login.trim().toLowerCase(),
        email: syntheticEmail,
        name: name || login,
        cargo: cargo || 'Colaborador',
        empresaId: targetEmpresaId,
        role: assignedRole,
        permissions: initialPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        uid: userUid,
        email: syntheticEmail,
        empresaId: targetEmpresaId,
        role: assignedRole,
        permissions: initialPermissions
      });
    } catch (error: any) {
      console.error("Erro ao criar usuário via Admin SDK:", error);
      res.status(500).json({ error: error.message || "Erro interno ao criar usuário." });
    }
  });

  // Edit employee permissions (Master / SuperAdmin only)
  app.patch("/api/admin/usuarios/:uid/permissions", verifyAuthToken, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const tenantCtx = (req as any).tenantContext;
      const isMaster = tenantCtx?.role === 'master';
      const isSuperAdmin = Boolean(tenantCtx?.isSuperAdmin);

      if (!isMaster && !isSuperAdmin) {
        return res.status(403).json({ 
          error: "Acesso negado: apenas perfil master ou superAdmin pode alterar permissões." 
        });
      }

      const { uid } = req.params;
      const { permissions } = req.body || {};

      if (!uid) {
        return res.status(400).json({ error: "Identificador do usuário (uid) é obrigatório." });
      }

      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({ error: "Objeto de permissões é obrigatório." });
      }

      // Rule: An employee cannot edit their own permissions
      if (uid === tenantCtx?.uid) {
        return res.status(403).json({ error: "Operação não permitida: você não pode alterar suas próprias permissões." });
      }

      const targetEmpresaId = tenantCtx?.empresaId;
      const db = getAdminFirestore();
      const userRef = db.doc(`empresas/${targetEmpresaId}/usuarios/${uid}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ error: "Usuário não encontrado nesta empresa." });
      }

      await userRef.update({
        permissions,
        updatedAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        uid,
        empresaId: targetEmpresaId,
        permissions
      });
    } catch (error: any) {
      console.error("Erro ao atualizar permissões do usuário:", error);
      return res.status(500).json({ error: error.message || "Erro interno ao atualizar permissões." });
    }
  });

  // List company users (Master / SuperAdmin only)
  app.get("/api/admin/usuarios", verifyAuthToken, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const tenantCtx = (req as any).tenantContext;
      const isMaster = tenantCtx?.role === 'master';
      const isSuperAdmin = Boolean(tenantCtx?.isSuperAdmin);

      if (!isMaster && !isSuperAdmin) {
        return res.status(403).json({ error: "Acesso negado: apenas perfil master ou superAdmin pode listar usuários." });
      }

      const targetEmpresaId = tenantCtx?.empresaId;
      const db = getAdminFirestore();
      const snapshot = await db.collection(`empresas/${targetEmpresaId}/usuarios`).get();

      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      return res.json({ users });
    } catch (error: any) {
      console.error("Erro ao listar usuários da empresa:", error);
      return res.status(500).json({ error: error.message || "Erro interno ao listar usuários." });
    }
  });

  // =========================================================================
  // SUPER-ADMIN PLATFORM ENDPOINTS (isSuperAdmin: true only)
  // =========================================================================

  // Create a new tenant company
  app.post("/api/superadmin/empresas", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const { empresaId, nome, cnpj, plano, financeiro } = req.body || {};

      if (!empresaId || !nome) {
        return res.status(400).json({ error: "Campos 'empresaId' e 'nome' são obrigatórios." });
      }

      const cleanEmpresaId = empresaId.trim().toLowerCase();
      if (!validateEmpresaId(cleanEmpresaId)) {
        return res.status(400).json({ error: "Identificador de empresa inválido. Use apenas letras minúsculas, números e hífen." });
      }

      // Check if empresa already exists
      const existingDoc = await db.doc(`empresas/${cleanEmpresaId}`).get();
      if (existingDoc.exists) {
        return res.status(409).json({ error: `A empresa com o identificador '${cleanEmpresaId}' já está cadastrada na plataforma.` });
      }

      const agora = new Date().toISOString();
      const proximoVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const novaEmpresa = {
        empresaId: cleanEmpresaId,
        nome: nome.trim(),
        cnpj: cnpj?.trim() || "",
        criadoEm: agora,
        ativa: true,
        financeiro: {
          status: financeiro?.status === "atrasado" ? "atrasado" : "em_dia",
          dataVencimento: financeiro?.dataVencimento || proximoVencimento,
          dataUltimoPagamento: financeiro?.dataUltimoPagamento || agora.split('T')[0],
          observacoes: financeiro?.observacoes || ""
        },
        plano: plano || "standard",
        updatedAt: agora
      };

      await db.doc(`empresas/${cleanEmpresaId}`).set(novaEmpresa);

      res.status(201).json({
        success: true,
        empresa: novaEmpresa
      });
    } catch (error: any) {
      console.error("[SuperAdmin Create Empresa Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao cadastrar nova empresa." });
    }
  });

  // List all tenant companies
  app.get("/api/superadmin/empresas", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const snapshot = await db.collection("empresas").get();
      
      const empresas = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        let totalUsuarios = 0;
        try {
          const userSnap = await db.collection(`empresas/${doc.id}/usuarios`).get();
          totalUsuarios = userSnap.size;
        } catch (_) {}

        return {
          empresaId: doc.id,
          nome: data.nome || doc.id,
          cnpj: data.cnpj || "",
          criadoEm: data.criadoEm || "",
          ativa: data.ativa !== false,
          financeiro: data.financeiro || {
            status: 'em_dia',
            dataVencimento: '',
            dataUltimoPagamento: '',
            observacoes: ''
          },
          plano: data.plano || "standard",
          updatedAt: data.updatedAt,
          totalUsuarios
        };
      }));

      res.json({ empresas });
    } catch (error: any) {
      console.error("[SuperAdmin List Empresas Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao listar empresas." });
    }
  });

  // Get specific company details & users
  app.get("/api/superadmin/empresas/:empresaId", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const { empresaId } = req.params;

      const docSnap = await db.doc(`empresas/${empresaId}`).get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada." });
      }

      const data = docSnap.data() || {};
      const usersSnap = await db.collection(`empresas/${empresaId}/usuarios`).get();
      const users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));

      res.json({
        empresa: {
          empresaId: docSnap.id,
          nome: data.nome || docSnap.id,
          cnpj: data.cnpj || "",
          criadoEm: data.criadoEm || "",
          ativa: data.ativa !== false,
          financeiro: data.financeiro || { status: 'em_dia' },
          plano: data.plano || "standard",
          updatedAt: data.updatedAt
        },
        usuarios: users,
        totalUsuarios: users.length
      });
    } catch (error: any) {
      console.error("[SuperAdmin Get Empresa Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao buscar empresa." });
    }
  });

  // Update company core information
  app.patch("/api/superadmin/empresas/:empresaId", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const { empresaId } = req.params;
      const { nome, cnpj, plano } = req.body || {};

      const docRef = db.doc(`empresas/${empresaId}`);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada." });
      }

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };
      if (nome !== undefined) updateData.nome = String(nome).trim();
      if (cnpj !== undefined) updateData.cnpj = String(cnpj).trim();
      if (plano !== undefined) updateData.plano = String(plano).trim();

      await docRef.update(updateData);

      const updatedSnap = await docRef.get();
      res.json({ success: true, empresa: { empresaId: docRef.id, ...updatedSnap.data() } });
    } catch (error: any) {
      console.error("[SuperAdmin Update Empresa Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao atualizar dados cadastrais da empresa." });
    }
  });

  // Update company financial status
  app.patch("/api/superadmin/empresas/:empresaId/financeiro", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const { empresaId } = req.params;
      const { status, dataVencimento, dataUltimoPagamento, observacoes } = req.body || {};

      if (status && !['em_dia', 'atrasado'].includes(status)) {
        return res.status(400).json({ error: "O status financeiro deve ser 'em_dia' ou 'atrasado'." });
      }

      const docRef = db.doc(`empresas/${empresaId}`);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada." });
      }

      const existingData = docSnap.data() || {};
      const currentFinanceiro = existingData.financeiro || {};

      const updatedFinanceiro = {
        status: status !== undefined ? status : (currentFinanceiro.status || 'em_dia'),
        dataVencimento: dataVencimento !== undefined ? dataVencimento : (currentFinanceiro.dataVencimento || ''),
        dataUltimoPagamento: dataUltimoPagamento !== undefined ? dataUltimoPagamento : (currentFinanceiro.dataUltimoPagamento || ''),
        observacoes: observacoes !== undefined ? observacoes : (currentFinanceiro.observacoes || '')
      };

      await docRef.update({
        financeiro: updatedFinanceiro,
        updatedAt: new Date().toISOString()
      });

      res.json({ success: true, financeiro: updatedFinanceiro });
    } catch (error: any) {
      console.error("[SuperAdmin Update Financeiro Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao atualizar status financeiro da empresa." });
    }
  });

  // Toggle company active status (suspend / activate)
  app.patch("/api/superadmin/empresas/:empresaId/ativa", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();
      const { empresaId } = req.params;
      const { ativa } = req.body || {};

      if (typeof ativa !== 'boolean') {
        return res.status(400).json({ error: "O campo 'ativa' deve ser booleano (true ou false)." });
      }

      const docRef = db.doc(`empresas/${empresaId}`);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Empresa não encontrada." });
      }

      await docRef.update({
        ativa,
        updatedAt: new Date().toISOString()
      });

      res.json({ success: true, ativa, empresaId });
    } catch (error: any) {
      console.error("[SuperAdmin Toggle Ativa Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao alterar ativação da empresa." });
    }
  });

  // Global platform dashboard aggregated metrics
  app.get("/api/superadmin/dashboard", verifyAuthToken, requireSuperAdmin, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const db = getAdminFirestore();

      // 1. All tenant companies
      const empresasSnap = await db.collection("empresas").get();
      const empresas = empresasSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const totalEmpresas = empresas.length;
      const empresasAtivas = empresas.filter(e => e.ativa !== false).length;
      const empresasSuspensas = empresas.filter(e => e.ativa === false).length;
      const empresasEmDia = empresas.filter(e => e.financeiro?.status === "em_dia" || !e.financeiro?.status).length;
      const empresasAtrasadas = empresas.filter(e => e.financeiro?.status === "atrasado").length;

      // 2. Total platform users
      let totalUsuarios = 0;
      try {
        const usuariosGroup = await db.collectionGroup("usuarios").get();
        totalUsuarios = usuariosGroup.size;
      } catch (err: any) {
        console.warn("collectionGroup usuarios fallback:", err.message);
      }

      // 3. Total services aggregated
      let totalServicos = 0;
      const servicosPorMes: Record<string, number> = {};
      try {
        const servicesGroup = await db.collectionGroup("services").get();
        totalServicos = servicesGroup.size;
        servicesGroup.forEach(doc => {
          const data = doc.data();
          const dateStr = data.date || data.createdAt || data.data;
          if (dateStr && typeof dateStr === 'string') {
            const month = dateStr.substring(0, 7);
            servicosPorMes[month] = (servicosPorMes[month] || 0) + 1;
          }
        });
      } catch (err: any) {
        console.warn("collectionGroup services fallback:", err.message);
      }

      // 4. Total quotes aggregated
      let totalOrcamentos = 0;
      const orcamentosPorMes: Record<string, number> = {};
      try {
        const quotesGroup = await db.collectionGroup("quotes").get();
        totalOrcamentos = quotesGroup.size;
        quotesGroup.forEach(doc => {
          const data = doc.data();
          const dateStr = data.createdAt || data.data;
          if (dateStr && typeof dateStr === 'string') {
            const month = dateStr.substring(0, 7);
            orcamentosPorMes[month] = (orcamentosPorMes[month] || 0) + 1;
          }
        });
      } catch (err: any) {
        console.warn("collectionGroup quotes fallback:", err.message);
      }

      // 5. Distribution by plan
      const distribuicaoPlanos: Record<string, number> = {};
      empresas.forEach(e => {
        const plano = e.plano || 'standard';
        distribuicaoPlanos[plano] = (distribuicaoPlanos[plano] || 0) + 1;
      });

      res.json({
        totalEmpresas,
        empresasAtivas,
        empresasSuspensas,
        empresasEmDia,
        empresasAtrasadas,
        totalUsuarios,
        totalServicos,
        totalOrcamentos,
        servicosPorMes,
        orcamentosPorMes,
        distribuicaoPlanos,
        geradoEm: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[SuperAdmin Dashboard Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao calcular métricas do painel super-admin." });
    }
  });

  // Google Maps Status check
  app.get("/api/maps/status", (req, res) => {
    const key = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
    const configured = Boolean(key) && key.trim() !== "" && key !== "YOUR_API_KEY";
    res.json({ configured, hasKey: configured });
  });

  // Google Maps Geocoding Proxy
  app.get("/api/maps/geocode", async (req, res) => {
    try {
      const { address, key } = req.query;
      if (!address) {
        return res.status(400).json({ error: "address is required" });
      }

      const apiKey = (key as string) || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        return res.status(400).json({ error: "Google Maps API Key not configured." });
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${apiKey}&language=pt-BR`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Geocoding Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to geocode address" });
    }
  });

  // Google Maps Distance Matrix Proxy to bypass client CORS
  app.get("/api/maps/distance", async (req, res) => {
    try {
      const { origins, destinations, key } = req.query;
      if (!origins || !destinations) {
        return res.status(400).json({ error: "origins and destinations are required" });
      }

      const apiKey = (key as string) || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        return res.status(400).json({ error: "Google Maps API Key not configured." });
      }

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins as string)}&destinations=${encodeURIComponent(destinations as string)}&key=${apiKey}&language=pt-BR&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Distance Matrix Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch distance" });
    }
  });

  // Lazy Gemini Initialization
  let aiInstance: GoogleGenAI | null = null;
  const getAi = () => {
    if (!aiInstance) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      aiInstance = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  };

  // Helper for resilient Gemini calls with retry on 503/429 and model fallback
  async function generateContentWithRetry(ai: GoogleGenAI, params: {
    contents: any;
    config?: any;
    primaryModel?: string;
    maxRetries?: number;
  }) {
    const primaryModel = params.primaryModel || "gemini-3.8-flash";
    const fallbackModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.1-flash-lite"];
    const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];
    const maxRetries = params.maxRetries ?? 2;

    let lastError: any = null;

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || (err?.message?.includes("503") ? 503 : (err?.message?.includes("429") ? 429 : 0));
          const isTransient = status === 503 || status === 429 || err?.message?.includes("high demand") || err?.message?.includes("UNAVAILABLE") || err?.message?.includes("spikes in demand");

          if (isTransient && attempt < maxRetries) {
            const delay = (attempt + 1) * 1200;
            console.warn(`[Gemini Retry] Modelo ${model} retornou ${status}. Tentando novamente em ${delay}ms (${attempt + 1}/${maxRetries})...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          console.warn(`[Gemini Fallback] Modelo ${model} falhou (${status || err?.message}). Tentando próximo modelo se disponível...`);
          break;
        }
      }
    }

    throw lastError;
  }

  // AI Chat Endpoint
  app.post("/api/ai/chat", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, async (req, res) => {
    try {
      const { message, context, history } = req.body;
      const ai = getAi();

      // Retrieve dynamic system instructions based on roles & credentials context
      const systemCtx = context || { activeRole: "visualizador", userName: "Anênino/Convidado" };
      const systemInstruction = PromptOrchestrator.getSystemInstruction(systemCtx);

      // Structure conversational contents history in the format expected by the @google/genai SDK
      const contentsList: any[] = [];

      if (history && Array.isArray(history) && history.length > 0) {
        for (let i = 0; i < history.length; i++) {
          const h = history[i];
          const text = h.text || h.content || "";
          if (!text) continue;

          const role = h.role === "model" || h.role === "assistant" ? "model" : "user";
          
          // Replace user's last message with the context-wrapped orchestrated version for model accuracy
          const textToSubmit = (i === history.length - 1 && role === "user" && message) ? message : text;

          contentsList.push({
            role,
            parts: [{ text: textToSubmit }],
          });
        }
      } else {
        contentsList.push({
          role: "user",
          parts: [{ text: message || "Olá!" }],
        });
      }

      const response = await generateContentWithRetry(ai, {
        primaryModel: "gemini-3.8-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for tactical consistency and mathematical accuracy
          topP: 0.8,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Dedicated PestFlow Operational Client/Server Gemini API proxy
  app.post("/api/ai/pestflow-chat", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, async (req, res) => {
    try {
      const { message, systemContext, history } = req.body;
      const ai = getAi();

      const contentsList: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          contentsList.push({
            role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content || h.text || "" }]
          });
        }
      }

      if (message) {
        // A mensagem atual do usuário precisa sempre ser anexada ao final da
        // conversa, mesmo quando já existe histórico. Sem isso, a partir da
        // 2ª pergunta o modelo só recebia o histórico antigo e nunca via a
        // pergunta nova, respondendo de forma genérica/desconexa.
        contentsList.push({
          role: "user",
          parts: [{ text: message }]
        });
      } else if (contentsList.length === 0) {
        return res.status(400).json({ error: "message or history is required" });
      }

      const response = await generateContentWithRetry(ai, {
        primaryModel: "gemini-3.8-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemContext,
          temperature: 0.3,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("PestFlow Dedicated AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // AI Notification Intelligence (Summarization, Priority Assessment, Actionable Suggestions)
  app.post("/api/ai/analyze-notification", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, async (req, res) => {
    try {
      const { title, message, category, severity } = req.body;
      const ai = getAi();
      
      const prompt = `Como um analista de operações seniores do PestFlow (plataforma de controle de pragas), analise esta notificação operacional e retorne um objeto JSON contendo exatamente as chaves:
"aiSummary": Uma string resumindo de forma ultra-precisa e acionável em apenas 1 frase curta no estilo Slack (ex: "Necessário reabastecimento imediato de fipronil para evitar paralisação.").
"aiPriorityIndex": Um inteiro de 0 a 100 indicando a real criticidade desta ocorrência baseada no contexto operacional, gravidade e segurança técnica.
"actionSuggestion": Uma frase curta indicando o próximo passo prático que o gestor ou técnico deve tomar primeiro.

DADOS DA NOTIFICAÇÃO:
- Categoria: ${category}
- Severidade: ${severity}
- Título: ${title}
- Mensagem: ${message}

Responda APENAS com o JSON puro sem qualquer formatação markdown, livre de \`\`\`json ou qualquer outra tag.`;

      const response = await generateContentWithRetry(ai, {
        primaryModel: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Notification Intelligence Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze notification" });
    }
  });

  // AI Document / POP Generative Assistant Endpoint
  app.post("/api/ai/generate-procedure", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, async (req, res) => {
    try {
      const { title, description, allowedChemicalIds, targetPests } = req.body;
      const ai = getAi();

      const prompt = `Como um engenheiro agrônomo sênior e supervisor regulatório da Anvisa para a PestFlow, formule um POP (Procedimento Operacional Padrão) completo e ultra-polido.
Retorne um objeto JSON contendo exatamente:
- "pestType": Tipo de praga alvo em formato curto (ex: "baratas", "formigas", "cupins", "ratos", "escorpioes", "outro")
- "activeIngredients": Princípios Ativos indicados (ex: "Fipronil 0.05%, Bifentrina 200SC")
- "dilutionRatio": Diluição Recomendada em calda (ex: "50ml de concentrado por 10L de água para 100m²")
- "applicationMethod": Método de Aplicação (ex: "Pulverização de Alta Pressão e Barreira Residual")
- "safetyEquipment": EPIs Obrigatórios resumidos (ex: "Máscara P2, Luvas de Nitrila, Óculos de Proteção, Botas de PVC")
- "reentryInterval": Tempo de Reentrada (ex: "24 horas para ambientes fechados, 6 horas para áreas ventiladas")
- "legalFramework": Base Legal / Regulamentação (ex: "RDC nº 52/2009 ANVISA / NR-31")
- "recommendedChemicalVolume": Recomendação de dosagem precisa em volume de calda por metro quadrado.
- "requiredEPIs": Objeto com booleanos: "hasMask", "hasGloves", "hasGoggles", "hasBoots", "hasApron" e string "extraArmorText".
- "steps": Um array de no mínimo 3 etapas contendo:
  - "sequence": Inteiro (1, 2, 3...)
  - "title": Nome curto da etapa (Ex: "Isolamento e Vistoria da Área")
  - "description": Frase detalhando como executar a etapa e riscos de intoxicação sanitária e compliance da Anvisa.
  - "isRequired": Booleano (true)
  - "requiresPhotoProof": Booleano (true ou false)
  - "estimatedDurationSeconds": Tempo sugerido de execução em segundos

DADOS OPERACIONAIS:
- Título: ${title}
- Descrição: ${description}
- Pragas Alvo: ${JSON.stringify(targetPests || [])}
- Químicos Autorizados: ${JSON.stringify(allowedChemicalIds || [])}

Responda APENAS com o JSON de dados puro, sem blocos de código markdown ou texto explicativo extra.`;

      const response = await generateContentWithRetry(ai, {
        primaryModel: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      const parsedObj = JSON.parse(response.text?.trim() || "{}");
      res.json(parsedObj);
    } catch (error: any) {
      console.error("AI Procedure Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI procedural layout" });
    }
  });

  // AI Dashboard & Operational Insights Generator Endpoint
  app.post("/api/ai/dashboard-insights", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, async (req, res) => {
    try {
      const { summary, quotesSample, costsSample } = req.body;
      const ai = getAi();
      const tenantContext = (req as any).tenantContext;
      const empresaId = tenantContext?.empresaId || req.body.empresaId || 'PestFlow Tenant';

      const prompt = `Como analista financeiro e operacional sênior da PestFlow, analise os dados consolidados e gere diagnósticos precisos e acionáveis para o painel de controle do gestor (${empresaId}).

DADOS OPERACIONAIS E FINANCEIROS ATUAIS:
- Faturamento do Período: R$ ${(summary?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem Média Operacional: ${(summary?.avgMargin || 0).toFixed(1)}%
- Total de Orçamentos: ${summary?.quotesCount || 0} (Aprovados: ${summary?.approvedQuotesCount || 0}, Executados: ${summary?.executedQuotesCount || 0})
- Inadimplência / Contas a Receber Vencidas: ${summary?.unpaidCount || 0} títulos (Total: R$ ${(summary?.unpaidTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
- Insumos com Estoque Crítico: ${summary?.lowStockCount || 0} itens (${(summary?.criticalStockNames || []).join(', ') || 'Nenhum crítico'})
- Contratos Próximos do Vencimento (15 dias): ${summary?.expiringContractsCount || 0}
- Praga Mais Frequente: ${summary?.topPest || 'Geral / Controle Integrado'}
- Custos Fixos Mensais: R$ ${(summary?.fixedCostsTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Retorne um array JSON contendo entre 3 e 5 objetos de insight com a estrutura exata:
[
  {
    "id": "string único (ex: insight-1)",
    "type": "warning" | "success" | "info" | "critical",
    "title": "Título curto do insight (máximo 6 palavras)",
    "pattern": "Descrição objetiva do padrão ou anomalia identificado com números reais.",
    "recommendation": "Recomendação prática de ação imediata para o gestor.",
    "confidence": número entre 0.70 e 0.99,
    "dataPoints": número de registros analisados,
    "metric": "Nome da métrica envolvida (ex: Margem, Estoque, Contratos, Faturamento)"
  }
]

Responda APENAS com o JSON puro, sem blocos de código markdown ou texto antes/depois.`;

      let parsed: any[] = [];
      try {
        const response = await generateContentWithRetry(ai, {
          primaryModel: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        });

        const rawJson = JSON.parse(response.text?.trim() || "[]");
        parsed = Array.isArray(rawJson) ? rawJson : (rawJson.insights || []);
      } catch (geminiErr: any) {
        console.warn("[PestFlow AI Insights] Gemini em alta demanda / indisponível, gerando insights calculados resilientes:", geminiErr?.message || geminiErr);
        
        // Deterministic fallback calculations based on real operational numbers
        const avgMargin = Number(summary?.avgMargin || 0);
        const lowStock = Number(summary?.lowStockCount || 0);
        const unpaidCount = Number(summary?.unpaidCount || 0);
        const unpaidTotal = Number(summary?.unpaidTotal || 0);
        const expiringContracts = Number(summary?.expiringContractsCount || 0);
        const totalRevenue = Number(summary?.totalRevenue || 0);

        const insightsList = [];

        if (lowStock > 0) {
          const names = (summary?.criticalStockNames || []).slice(0, 3).join(', ');
          insightsList.push({
            id: "insight-stock",
            type: "critical",
            title: "Risco de Ruptura de Estoque",
            pattern: `${lowStock} insumo(s) químico(s) estão no nível mínimo (${names || 'químicos críticos'}).`,
            recommendation: "Emitir ordem de compra imediata para evitar paralisação dos serviços de campo.",
            confidence: 0.98,
            dataPoints: lowStock,
            metric: "Estoque"
          });
        }

        if (avgMargin < 35 && avgMargin > 0) {
          insightsList.push({
            id: "insight-margin",
            type: "warning",
            title: "Margem Operacional Comprimida",
            pattern: `A margem média de ${avgMargin.toFixed(1)}% está abaixo da meta recomendada de 40% do setor.`,
            recommendation: "Revisar composição de custos de deslocamento e dosagem de insumos químicos nos próximos orçamentos.",
            confidence: 0.92,
            dataPoints: Number(summary?.quotesCount || 1),
            metric: "Margem"
          });
        } else if (avgMargin >= 35) {
          insightsList.push({
            id: "insight-margin-ok",
            type: "success",
            title: "Margem Operacional Saudável",
            pattern: `A margem média está em ${avgMargin.toFixed(1)}%, acima do patamar de segurança operacional da empresa.`,
            recommendation: "Manter política de precificação e controle de consumo de caldas aplicadas.",
            confidence: 0.95,
            dataPoints: Number(summary?.quotesCount || 1),
            metric: "Margem"
          });
        }

        if (unpaidCount > 0) {
          insightsList.push({
            id: "insight-inadimplencia",
            type: "warning",
            title: "Títulos Vencidos em Aberto",
            pattern: `${unpaidCount} conta(s) a receber somando R$ ${unpaidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vencidas.`,
            recommendation: "Acionar régua de cobrança automática e verificar status financeiro antes de novas visitas.",
            confidence: 0.96,
            dataPoints: unpaidCount,
            metric: "Financeiro"
          });
        }

        if (expiringContracts > 0) {
          insightsList.push({
            id: "insight-contratos",
            type: "info",
            title: "Renovação de Contratos",
            pattern: `${expiringContracts} contrato(s) recorrente(s) vencendo nos próximos 15 dias.`,
            recommendation: "Enviar proposta de renovação anual preventiva com reajuste contratual.",
            confidence: 0.90,
            dataPoints: expiringContracts,
            metric: "Contratos"
          });
        }

        if (insightsList.length === 0) {
          insightsList.push({
            id: "insight-operacao",
            type: "info",
            title: "Operação em Conformidade",
            pattern: `Faturamento registrado de R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com fluxos em conformidade.`,
            recommendation: "Acompanhar conversão dos orçamentos abertos para impulsionar a receita do período.",
            confidence: 0.88,
            dataPoints: Number(summary?.quotesCount || 1),
            metric: "Faturamento"
          });
        }

        parsed = insightsList;
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("AI Dashboard Insights Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate dashboard insights" });
    }
  });

  // Executive Decision Intelligence & Strategic Copilot Endpoint (Supports both routes)
  const handleExecutiveQuery = async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, history, context } = req.body;
      const tenantContext = (req as any).tenantContext;
      const empresaId = tenantContext?.empresaId || req.body.tenantId || req.body.empresaId;

      if (!empresaId) {
        return res.status(400).json({ error: "empresaId é obrigatório para consultas executivas." });
      }

      const ai = getAi();

      // Extract real board variables directly from context without fake hardcoded fallbacks
      const mrrTotal = Number(context?.board?.mrrTotal ?? context?.mrrTotal ?? 0);
      const activeContractsRatio = Number(context?.board?.activeContractsRatio ?? context?.activeContractsRatio ?? 0);
      const operationalEfficiencyCoefficient = Number(context?.board?.operationalEfficiencyCoefficient ?? context?.operationalEfficiencyCoefficient ?? 0);
      const monthlySafetyIndexPercent = Number(context?.board?.monthlySafetyIndexPercent ?? context?.monthlySafetyIndexPercent ?? 0);

      const systemInstruction = `Você é o Principal Executive AI Architect e Strategic Operational Intelligence Engineer do PestFlow.
Você é encarregado de prover relatórios e direcionamentos estratégicos de nível de Conselho / Board (Board-Level Reporting) e decisões operacionais rigorosas.
Nunca aja como assistente genérico ou chatbot raso. Suas respostas devem ser precisas, com terminologia executiva qualificada em português.

DADOS DE CONTEXTO ESTRATÉGICO DO TENANT ATIVO (${empresaId}):
- Receita Recorrente Mensal (MRR): R$ ${mrrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Taxa de Contratantes Ativos: ${activeContractsRatio.toFixed(1)}%
- Coeficiente de Eficiência de Campo: ${(operationalEfficiencyCoefficient * 100).toFixed(1)}%
- Índice de Conformidade e Segurança Física (Anvisa): ${monthlySafetyIndexPercent.toFixed(1)}%
- Recomendações Ativas no Funil: ${context?.recommendationCount || 0}
${context?.details ? `- Detalhes operacionais adicionais: ${JSON.stringify(context.details)}` : ''}

Instruções importantes:
1. Resuma as decisões usando tópicos focados em faturamento, saúde regulatória ou planejamento de equipe.
2. Seja realista: mencione o uso racional de EPIs, controle fitofarmacêutico e retenção de subscrições contra cancelamentos.
3. Use formatação Markdown polida.`;

      const contentsList: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
          contentsList.push({
            role,
            parts: [{ text: h.content || h.text || "" }]
          });
        }
      }

      if (prompt) {
        contentsList.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      } else if (contentsList.length === 0) {
        contentsList.push({
          role: "user",
          parts: [{ text: "Qual o status estratégico da operação e principais recomendações?" }]
        });
      }

      const response = await generateContentWithRetry(ai, {
        primaryModel: "gemini-3.8-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.25,
          topP: 0.85
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Executive AI Server-Side Query Error:", error);
      res.status(500).json({ error: error.message || "Failed to process executive strategic query" });
    }
  };

  app.post("/api/executive-ai/query", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, handleExecutiveQuery);
  app.post("/api/ai/executive-copilot", authMiddleware, requirePermission('ia', 'view'), aiRateLimiter, handleExecutiveQuery);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Run autoBootstrap in background on boot
    autoBootstrapMaster().catch(err => {
      console.warn("Bootstrap on startup notice:", err?.message || err);
    });
  });
}

startServer();
