import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { POP } from '@/types/database';
import { getTenantCollectionPath, getActiveTenantId } from '@/tenant';

export const popService = {
  async getPops(empresaId?: string) {
    const activeEmpresaId = empresaId || getActiveTenantId();
    try {
      const path = getTenantCollectionPath(activeEmpresaId, 'pops');
      const q = query(collection(db, path), orderBy('title', 'asc'));
      const snapshot = await getDocs(q);
      const serverPops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as POP);
      localStorage.setItem('pops', JSON.stringify(serverPops));
      return serverPops;
    } catch (error) {
      console.warn("Operating offline: retrieving POPs from local storage...", error);
      const localPops = JSON.parse(localStorage.getItem('pops') || '[]');
      if (localPops.length === 0) {
        const seedPops: POP[] = [
          {
            id: 'pop_1',
            title: 'POP 01 - Controle Integrado de Insetos (Baratas e Formigas)',
            category: 'Químicos',
            pestType: 'Baratas',
            description: 'Procedimento técnico de controle sistemático para baratas alemãs e americanas, bem como formigas urbanas doceiras.',
            epis: ['Luvas nitrílicas', 'Máscara com carvão ativado', 'Óculos de proteção'],
            checklist: [
              'Inspeção prévia do local identificando focos e espécies de infestação.',
              'Aplicação de Gel Inseticida em frestas, tomadas e locais de manipulação de alimentos.',
              'Pulverização líquida residual de piretroides em áreas externas e ralos.',
              'Orientação ao cliente sobre higiene e saneamento do local.'
            ],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'pop_2',
            title: 'POP 02 - Desratização e Manejo de Roedores',
            category: 'Manejo',
            pestType: 'Ratos',
            description: 'Técnicas de manejo ambiental integrado e iscagem racional para contenção de ratos de telhado, ratazanas e camundongos.',
            epis: ['Luvas nitrílicas', 'Calçado impermeável', 'Máscara N95'],
            checklist: [
              'Mapeamento completo do perímetro interno e externo do estabelecimento.',
              'Instalação de caixas porta-iscas numeradas e fixadas mecanicamente.',
              'Aplicação de raticida bloco extrudado em locais secos e limpos.',
              'Registro visual e físico de consumo em fichas de acompanhamento técnico.'
            ],
            updatedAt: new Date().toISOString()
          },
          {
            id: 'pop_3',
            title: 'POP 03 - Imunização contra Cupins de Madeira Seca e de Solo',
            category: 'Tratamento de Solo',
            pestType: 'Cupins',
            description: 'Injeção de cupinicidas barreira química horizontal e vertical para combate a cupim subterrâneo e cupins arbóreos.',
            epis: ['Luvas nitrílicas', 'Macacão Tyvek', 'Protetor facial', 'Respirador panorâmico'],
            checklist: [
              'Identificação do estágio evolutivo da colônia de cupins.',
              'Furação em marquises ou paredes com espaçamento de 30cm no solo.',
              'Injeção sob sob-pressão da solução cupinicida nas perfurações.',
              'Pulverização pós-tratamento nos condutos de madeira expostos.'
            ],
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('pops', JSON.stringify(seedPops));
        return seedPops;
      }
      return localPops;
    }
  },

  async filterPops(empresaId?: string, category?: string, pestType?: string) {
    const activeEmpresaId = empresaId || getActiveTenantId();
    try {
      const path = getTenantCollectionPath(activeEmpresaId, 'pops');
      let q = query(collection(db, path));
      
      if (category) {
        q = query(q, where('category', '==', category));
      }
      
      if (pestType) {
        q = query(q, where('pestType', '==', pestType));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as POP);
    } catch (error) {
      console.warn("Operating offline: filtering POPs locally...");
      const allPops = await this.getPops(activeEmpresaId);
      return allPops.filter(pop => {
        if (category && pop.category !== category) return false;
        if (pestType && pop.pestType !== pestType) return false;
        return true;
      });
    }
  },

  async getPopById(empresaId: string | undefined, id?: string) {
    const targetId = id || (empresaId as string);
    const activeEmpresaId = id ? empresaId : getActiveTenantId();
    try {
      const path = getTenantCollectionPath(activeEmpresaId, 'pops');
      const docRef = doc(db, path, targetId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as POP;
      }
    } catch (error) {
      console.warn("Operating offline: searching pop by ID locally...");
    }
    const allPops = await this.getPops(activeEmpresaId);
    return allPops.find(p => p.id === targetId) || null;
  }
};
