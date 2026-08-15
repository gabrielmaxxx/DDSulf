import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import net from 'net';

let testEnv: RulesTestEnvironment | null = null;
let emulatorAvailable = false;

async function isEmulatorRunning(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

beforeAll(async () => {
  const host = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1';
  const port = Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8088);

  emulatorAvailable = await isEmulatorRunning(host, port);

  if (!emulatorAvailable) {
    console.warn(`[Firestore Emulator Test] Emulador de Firestore não detectado em ${host}:${port} (Java/Emulador ausente neste ambiente de contêiner). Testes do emulador serão ignorados e executados quando o emulador estiver rodando.`);
    return;
  }

  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'pestflow-rules-test',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host,
        port
      },
    });
  } catch (err) {
    console.warn('[Firestore Emulator Test] Erro ao inicializar ambiente do emulador:', err);
    emulatorAvailable = false;
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

describe('Firestore Rules — Isolamento entre Tenants (execução real via emulador)', () => {
  test('usuário da empresa A não pode ler dados da empresa B', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }
    const userA = testEnv.authenticatedContext('user-a', { empresaId: 'empresa-a' });
    const docRef = doc(userA.firestore(), 'empresas/empresa-b/users/algum-uid');
    await assertFails(getDoc(docRef));
  });

  test('usuário da empresa A pode ler dados da própria empresa A', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(doc(adminCtx.firestore(), 'empresas/empresa-a/users/user-a'), { nome: 'Teste' });
    });
    const userA = testEnv.authenticatedContext('user-a', { empresaId: 'empresa-a' });
    const docRef = doc(userA.firestore(), 'empresas/empresa-a/users/user-a');
    await assertSucceeds(getDoc(docRef));
  });

  test('usuário não autenticado não pode ler nenhum dado de nenhuma empresa', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }
    const anon = testEnv.unauthenticatedContext();
    const docRef = doc(anon.firestore(), 'empresas/empresa-a/users/user-a');
    await assertFails(getDoc(docRef));
  });

  test('usuário da empresa A não pode escrever em dados da empresa B', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }
    const userA = testEnv.authenticatedContext('user-a', { empresaId: 'empresa-a' });
    const docRef = doc(userA.firestore(), 'empresas/empresa-b/pops/pop-1');
    await assertFails(setDoc(docRef, { titulo: 'Invasão' }));
  });
});

describe('Firestore Rules — RBAC Granular & Permissões por Módulo (hasPermission / checkModulePermission)', () => {
  const EMPRESA_A = 'empresa-a';
  const EMPRESA_B = 'empresa-b';

  // Cenário 1: Master sem objeto de permissões preenchido consegue tudo (bypass de master)
  test('1. Master sem objeto de permissões preenchido consegue ler e escrever em múltiplos módulos (bypass de master)', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const masterUid = 'master-user-1';
    // Garante que o documento do usuário master não tem permissões ou está com objeto vazio
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${masterUid}`), {
        uid: masterUid,
        nome: 'Gestor Master',
        role: 'master',
        permissions: {} // Sem permissões explícitas por módulo
      });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/services/srv-1`), { title: 'Dedetização Predial' });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/products/prod-1`), { name: 'K-Othrine 1L', stock: 10 });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/financial_costs/cost-1`), { description: 'Aluguel', amount: 3500 });
    });

    const masterUser = testEnv.authenticatedContext(masterUid, {
      empresaId: EMPRESA_A,
      role: 'master'
    });
    const userDb = masterUser.firestore();

    // Leitura em múltiplos módulos
    await assertSucceeds(getDoc(doc(userDb, `empresas/${EMPRESA_A}/services/srv-1`)));
    await assertSucceeds(getDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-1`)));
    await assertSucceeds(getDoc(doc(userDb, `empresas/${EMPRESA_A}/financial_costs/cost-1`)));

    // Escrita e criação em múltiplos módulos
    await assertSucceeds(setDoc(doc(userDb, `empresas/${EMPRESA_A}/services/srv-new`), { title: 'Novo Serviço Master' }));
    await assertSucceeds(setDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-new`), { name: 'Gel Barata', stock: 5 }));
    await assertSucceeds(setDoc(doc(userDb, `empresas/${EMPRESA_A}/financial_costs/cost-new`), { description: 'Energia', amount: 450 }));
  });

  // Cenário 2: Funcionário sem view no módulo (ou view: false) é bloqueado na leitura
  test('2. Funcionário sem view no módulo (view: false) é bloqueado na leitura', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const funcUid = 'func-sem-view';
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${funcUid}`), {
        uid: funcUid,
        nome: 'Funcionário Sem Estoque',
        role: 'funcionario',
        permissions: {
          estoque: { view: false, edit: false, delete: false }
        }
      });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/products/prod-estoque-segredo`), {
        name: 'Produto Controlado',
        stock: 100
      });
    });

    const funcUser = testEnv.authenticatedContext(funcUid, {
      empresaId: EMPRESA_A,
      role: 'funcionario'
    });
    const userDb = funcUser.firestore();

    // Leitura bloqueada em products
    await assertFails(getDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-estoque-segredo`)));
  });

  // Cenário 3: Funcionário com view: true mas sem edit é bloqueado na escrita
  test('3. Funcionário com view: true mas sem edit é bloqueado na escrita (leitura permitida, escrita negada)', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const funcUid = 'func-view-only';
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${funcUid}`), {
        uid: funcUid,
        nome: 'Funcionário Consulta Estoque',
        role: 'funcionario',
        permissions: {
          estoque: { view: true, edit: false, delete: false }
        }
      });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/products/prod-existente`), {
        name: 'Produto Existente',
        stock: 50
      });
    });

    const funcUser = testEnv.authenticatedContext(funcUid, {
      empresaId: EMPRESA_A,
      role: 'funcionario'
    });
    const userDb = funcUser.firestore();

    // Leitura permitida
    await assertSucceeds(getDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-existente`)));

    // Escrita/Criação negada
    await assertFails(setDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-novo`), {
      name: 'Tentativa de Criar Produto',
      stock: 10
    }));

    // Atualização negada
    await assertFails(updateDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-existente`), {
      stock: 60
    }));
  });

  // Cenário 4: Funcionário com edit: true consegue escrever, mas delete: false bloqueia exclusão
  test('4. Funcionário com edit: true consegue escrever, mas delete: false bloqueia exclusão (deleteDoc)', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const funcUid = 'func-edit-no-delete';
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${funcUid}`), {
        uid: funcUid,
        nome: 'Funcionário Editor Sem Delete',
        role: 'funcionario',
        permissions: {
          estoque: { view: true, edit: true, delete: false }
        }
      });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/products/prod-para-editar`), {
        name: 'Produto Base',
        stock: 20
      });
    });

    const funcUser = testEnv.authenticatedContext(funcUid, {
      empresaId: EMPRESA_A,
      role: 'funcionario'
    });
    const userDb = funcUser.firestore();

    // Escrita e Atualização permitidas
    await assertSucceeds(setDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-criado-por-editor`), {
      name: 'Novo Produto Cadastrado',
      stock: 30
    }));
    await assertSucceeds(updateDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-para-editar`), {
      stock: 25
    }));

    // Exclusão negada
    await assertFails(deleteDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-para-editar`)));
  });

  // Cenário 5: Módulo inteiramente ausente do objeto permissions nega tudo
  test('5. Módulo inteiramente ausente do objeto permissions nega leitura, escrita e exclusão', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const funcUid = 'func-agenda-only';
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${funcUid}`), {
        uid: funcUid,
        nome: 'Funcionário Apenas Agenda',
        role: 'funcionario',
        permissions: {
          agenda: { view: true, edit: true, delete: true }
          // Módulo "estoque" está 100% ausente do objeto
        }
      });
      await setDoc(doc(db, `empresas/${EMPRESA_A}/products/prod-ausente-teste`), {
        name: 'Produto Qualquer',
        stock: 10
      });
    });

    const funcUser = testEnv.authenticatedContext(funcUid, {
      empresaId: EMPRESA_A,
      role: 'funcionario'
    });
    const userDb = funcUser.firestore();

    // Nenhuma ação permitida em produtos (módulo estoque ausente)
    await assertFails(getDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-ausente-teste`)));
    await assertFails(setDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-novo-ausente`), { name: 'Proibido' }));
    await assertFails(deleteDoc(doc(userDb, `empresas/${EMPRESA_A}/products/prod-ausente-teste`)));

    // Confirma que no módulo "agenda" (onde tem permissão total) as operações funcionam
    await assertSucceeds(setDoc(doc(userDb, `empresas/${EMPRESA_A}/services/srv-agenda-ok`), {
      title: 'Atendimento Agendado'
    }));
  });

  // Cenário 6: Funcionário de uma empresa não acessa módulo de outra empresa mesmo com permissão concedida
  test('6. Funcionário de uma empresa não acessa módulo de outra empresa mesmo com permissão concedida (belongsToTenant inviolável)', async (ctx) => {
    if (!emulatorAvailable || !testEnv) {
      ctx.skip();
      return;
    }

    const funcUid = 'func-empresa-a';
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      const db = adminCtx.firestore();
      await setDoc(doc(db, `empresas/${EMPRESA_A}/usuarios/${funcUid}`), {
        uid: funcUid,
        nome: 'Funcionário Empresa A',
        role: 'funcionario',
        permissions: {
          estoque: { view: true, edit: true, delete: true }
        }
      });
      await setDoc(doc(db, `empresas/${EMPRESA_B}/products/prod-empresa-b`), {
        name: 'Produto Secreto Empresa B',
        stock: 999
      });
    });

    // Usuário autenticado na EMPRESA_A com permissão total em estoque
    const funcUser = testEnv.authenticatedContext(funcUid, {
      empresaId: EMPRESA_A,
      role: 'funcionario'
    });
    const userDb = funcUser.firestore();

    // Tentativa de ler ou escrever dados da EMPRESA_B é bloqueada
    await assertFails(getDoc(doc(userDb, `empresas/${EMPRESA_B}/products/prod-empresa-b`)));
    await assertFails(setDoc(doc(userDb, `empresas/${EMPRESA_B}/products/prod-empresa-b-hack`), {
      name: 'Invasão Empresa B'
    }));
  });
});
