/**
 * Technical Instant Messaging parameters
 */

export interface InstantMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: number;
  carrierId?: string; // e.g. connected to an active route
}

export const INSTANT_MESSAGES_MOCK: InstantMessage[] = [
  {
    id: 'msg_1',
    senderId: 'user_tech_1',
    senderName: 'Carlos Silva',
    senderRole: 'Técnico Senior',
    text: 'Aplicação finalizada no reservatório sul da indústria alimentícia.',
    timestamp: Date.now() - 120000
  },
  {
    id: 'msg_2',
    senderId: 'user_supervisor',
    senderName: 'Fernanda Lemos',
    senderRole: 'Supervisora de Operações',
    text: 'Ciente, Carlos. Por favor, lembre-se de registrar a assinatura do termo técnico da Anvisa ante de sair.',
    timestamp: Date.now() - 60000
  }
];
