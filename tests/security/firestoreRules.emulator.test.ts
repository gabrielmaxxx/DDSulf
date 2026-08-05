import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

describe('Firestore Rules — Isolamento entre Tenants (execução real via emulador)', () => {
  beforeAll(async () => {
    const host = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1';
    const port = Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8080);

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
