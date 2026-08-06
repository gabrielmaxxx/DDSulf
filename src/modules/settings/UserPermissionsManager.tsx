import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Check, 
  RefreshCw, 
  Lock, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  ShieldAlert, 
  Sparkles,
  Calendar,
  FileText,
  Package,
  FileSpreadsheet,
  DollarSign,
  Bot,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { auth } from '@/firebase';
import { ModulePermissionActions } from '@/types/database';

export interface UserItem {
  uid: string;
  name: string;
  login?: string;
  email: string;
  cargo?: string;
  role: string;
  status: string;
  permissions?: Record<string, ModulePermissionActions>;
  createdAt?: string;
}

const MODULE_DEFINITIONS = [
  { id: 'agenda', label: 'Agenda & Calendário', icon: Calendar, description: 'Agendamento e rotas de serviços' },
  { id: 'orcamentos', label: 'Calculadora & Orçamentos', icon: FileText, description: 'Criação e aprovação de propostas' },
  { id: 'estoque', label: 'Estoque & Produtos', icon: Package, description: 'Controle de insumos químicos e EPIs' },
  { id: 'pops', label: 'Procedimentos POPs', icon: FileSpreadsheet, description: 'POPs e fichas técnicas Anvisa' },
  { id: 'financeiro', label: 'Financeiro & DRE', icon: DollarSign, description: 'Faturamento, DRE e custos' },
  { id: 'ia', label: 'I.A. Operacional', icon: Bot, description: 'Assistente e análises de inteligência' },
  { id: 'contratos', label: 'Contratos & Clientes', icon: Briefcase, description: 'Gestão de carteira e clientes' },
] as const;

const DEFAULT_MODULE_PERMISSIONS: ModulePermissionActions = {
  view: false,
  edit: false,
  delete: false
};

export function UserPermissionsManager() {
  const { user: currentUser, role: currentRole, empresaId } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit Permissions Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, ModulePermissionActions>>({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  // New Employee Modal
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    login: '',
    cargo: 'Técnico Operacional',
    senhaTemporaria: '',
    role: 'funcionario'
  });
  const [newUserPermissions, setNewUserPermissions] = useState<Record<string, ModulePermissionActions>>(() => {
    const init: Record<string, ModulePermissionActions> = {};
    MODULE_DEFINITIONS.forEach(m => {
      init[m.id] = { view: true, edit: false, delete: false };
    });
    return init;
  });

  const isMaster = currentRole === 'master' || currentRole === 'admin';

  useEffect(() => {
    if (isMaster) {
      loadUsers();
    }
  }, [isMaster]);

  async function getAuthHeaders() {
    const firebaseUser = auth.currentUser;
    const token = firebaseUser ? await firebaseUser.getIdToken() : '';
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/usuarios', { headers });
      if (!res.ok) {
        throw new Error('Falha ao buscar usuários do backend');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.warn('Usando fallback para lista de usuários:', err);
      // Fallback display currentUser
      if (currentUser) {
        setUsers([
          {
            uid: currentUser.uid,
            name: currentUser.name || 'Gestor Master',
            email: currentUser.email,
            role: currentUser.role || 'master',
            cargo: currentUser.cargo || 'Gestor Geral',
            status: 'active',
            permissions: currentUser.permissions || {}
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEditPermissions(targetUser: UserItem) {
    setSelectedUser(targetUser);
    
    // Initialize permissions state with defaults for missing modules
    const currentPerms = targetUser.permissions || {};
    const filledPerms: Record<string, ModulePermissionActions> = {};

    MODULE_DEFINITIONS.forEach(m => {
      filledPerms[m.id] = {
        view: Boolean(currentPerms[m.id]?.view),
        edit: Boolean(currentPerms[m.id]?.edit),
        delete: Boolean(currentPerms[m.id]?.delete)
      };
    });

    setEditingPermissions(filledPerms);
  }

  function togglePermission(moduleId: string, action: 'view' | 'edit' | 'delete') {
    setEditingPermissions(prev => {
      const currentModule = prev[moduleId] || { ...DEFAULT_MODULE_PERMISSIONS };
      const newValue = !currentModule[action];

      // Logical cascading: if turning off 'view', also turn off 'edit' and 'delete'
      let updatedModule = { ...currentModule, [action]: newValue };
      if (action === 'view' && !newValue) {
        updatedModule.edit = false;
        updatedModule.delete = false;
      }
      // If turning on 'edit' or 'delete', automatically turn on 'view'
      if ((action === 'edit' || action === 'delete') && newValue) {
        updatedModule.view = true;
      }

      return {
        ...prev,
        [moduleId]: updatedModule
      };
    });
  }

  async function handleSavePermissions() {
    if (!selectedUser) return;

    if (selectedUser.uid === currentUser?.uid) {
      toast.error('Operação não permitida: você não pode alterar suas próprias permissões.');
      return;
    }

    setSavingPermissions(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/usuarios/${selectedUser.uid}/permissions`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ permissions: editingPermissions })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar permissões');
      }

      toast.success(`Permissões de ${selectedUser.name} atualizadas com sucesso!`);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error('Erro ao salvar permissões:', err);
      toast.error(err.message || 'Falha ao atualizar permissões do funcionário.');
    } finally {
      setSavingPermissions(false);
    }
  }

  function toggleNewUserPermission(moduleId: string, action: 'view' | 'edit' | 'delete') {
    setNewUserPermissions(prev => {
      const currentModule = prev[moduleId] || { ...DEFAULT_MODULE_PERMISSIONS };
      const newValue = !currentModule[action];

      let updatedModule = { ...currentModule, [action]: newValue };
      if (action === 'view' && !newValue) {
        updatedModule.edit = false;
        updatedModule.delete = false;
      }
      if ((action === 'edit' || action === 'delete') && newValue) {
        updatedModule.view = true;
      }

      return {
        ...prev,
        [moduleId]: updatedModule
      };
    });
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserForm.login || !newUserForm.senhaTemporaria) {
      toast.error('Preencha o login e a senha temporária.');
      return;
    }

    setCreatingUser(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...newUserForm,
          empresaId,
          permissions: newUserPermissions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar funcionário');
      }

      toast.success(`Funcionário ${newUserForm.name || newUserForm.login} cadastrado com sucesso!`);
      setIsNewUserModalOpen(false);
      setNewUserForm({
        name: '',
        login: '',
        cargo: 'Técnico Operacional',
        senhaTemporaria: '',
        role: 'funcionario'
      });
      await loadUsers();
    } catch (err: any) {
      console.error('Erro ao cadastrar funcionário:', err);
      toast.error(err.message || 'Erro ao cadastrar novo funcionário.');
    } finally {
      setCreatingUser(false);
    }
  }

  if (!isMaster) {
    return (
      <Card className="p-6 border-slate-200 bg-slate-50 text-slate-600 rounded-3xl">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-5 text-amber-600" />
          <p className="text-xs font-semibold">
            Esta seção de gerenciamento de permissões é restrita aos gestores com perfil Master.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6" id="user-admin-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1B3A2D] rounded-xl text-white">
            <Shield className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Gestão Granular de Permissões (RBAC)</h3>
            <p className="text-xs text-slate-500">
              Configure livremente o que cada funcionário pode <strong>Ver</strong>, <strong>Editar</strong> e <strong>Excluir</strong> por módulo do sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
            className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            type="button"
            onClick={() => setIsNewUserModalOpen(true)}
            className="h-10 px-4 bg-[#1B3A2D] hover:bg-[#142B21] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="size-4" />
            + Criar Funcionário
          </Button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
          <RefreshCw className="size-4 animate-spin text-slate-400" />
          Carregando colaboradores e perfis de acesso...
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Nenhum colaborador encontrado na empresa.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-3 px-2">Colaborador / Identificação</th>
                <th className="py-3 px-2">Cargo / Função</th>
                <th className="py-3 px-2">Perfil de Acesso</th>
                <th className="py-3 px-2 text-center">Permissões do Módulo</th>
                <th className="py-3 px-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const userIsMaster = u.role === 'master' || u.role === 'admin';
                const isSelf = u.uid === currentUser?.uid;

                return (
                  <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {u.name}
                        {isSelf && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {u.login ? `@${u.login}` : u.email}
                      </div>
                    </td>

                    <td className="py-4 px-2 text-xs font-medium text-slate-600">
                      {u.cargo || 'Colaborador'}
                    </td>

                    <td className="py-4 px-2">
                      {userIsMaster ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Sparkles className="size-3 text-emerald-600" />
                          Gestor Master
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Funcionário
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-2 text-center">
                      {userIsMaster ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
                          Acesso Total Implícito
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {MODULE_DEFINITIONS.map(m => {
                            const p = u.permissions?.[m.id];
                            const hasView = p?.view;
                            const hasEdit = p?.edit;

                            if (!hasView) return null;

                            return (
                              <span 
                                key={m.id} 
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  hasEdit 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                                title={`${m.label}: ${hasEdit ? 'Ver e Editar' : 'Apenas Ver'}`}
                              >
                                {m.label.split(' ')[0]}
                              </span>
                            );
                          })}
                          {(!u.permissions || Object.values(u.permissions).every(p => !p.view)) && (
                            <span className="text-[10px] text-slate-400 italic">Sem permissões ativas</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-2 text-right">
                      {userIsMaster ? (
                        <span className="text-[10px] text-slate-400 font-medium">Inviolável</span>
                      ) : (
                        <Button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleOpenEditPermissions(u)}
                          className="h-8 px-3 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-xl transition-all"
                        >
                          Configurar Permissões
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Edit User Permissions */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Permissões de {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Cargo: {selectedUser.cargo || 'Funcionário'} • Login: @{selectedUser.login || selectedUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
                <Lock className="size-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Regra de Segurança Garantida:</strong> Módulos desmarcados serão estritamente bloqueados para este funcionário no Firestore e nas APIs de backend.
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                {MODULE_DEFINITIONS.map(mod => {
                  const Icon = mod.icon;
                  const perms = editingPermissions[mod.id] || { view: false, edit: false, delete: false };

                  return (
                    <div 
                      key={mod.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        perms.view 
                          ? 'bg-slate-50/80 border-slate-300' 
                          : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${perms.view ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{mod.label}</div>
                            <div className="text-[10px] text-slate-500">{mod.description}</div>
                          </div>
                        </div>

                        {/* Action Switches */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* VIEW */}
                          <button
                            type="button"
                            onClick={() => togglePermission(mod.id, 'view')}
                            className={`h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                              perms.view
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Eye className="size-3.5" />
                            Ver
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() => togglePermission(mod.id, 'edit')}
                            className={`h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                              perms.edit
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Edit3 className="size-3.5" />
                            Editar
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() => togglePermission(mod.id, 'delete')}
                            className={`h-8 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                              perms.delete
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Trash2 className="size-3.5" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="h-11 px-5 rounded-xl text-xs font-bold border-slate-200"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                disabled={savingPermissions}
                onClick={handleSavePermissions}
                className="h-11 px-6 bg-[#1B3A2D] hover:bg-[#142B21] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
              >
                {savingPermissions ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Salvar Permissões
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Create New User */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="p-6 bg-[#1B3A2D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl">
                  <UserPlus className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Cadastrar Novo Funcionário</h3>
                  <p className="text-xs text-emerald-200">Crie o acesso e configure as permissões iniciais</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(false)}
                className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Ex: Carlos Silva"
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Login de Acesso</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.login}
                    onChange={(e) => setNewUserForm({ ...newUserForm, login: e.target.value })}
                    placeholder="Ex: csilva (usado no login)"
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Cargo / Função</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.cargo}
                    onChange={(e) => setNewUserForm({ ...newUserForm, cargo: e.target.value })}
                    placeholder="Ex: Técnico em Dedetização"
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Senha Temporária</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserForm.senhaTemporaria}
                    onChange={(e) => setNewUserForm({ ...newUserForm, senhaTemporaria: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Initial Permissions Grid */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-black uppercase text-slate-700 block border-b border-slate-100 pb-2">
                  Permissões Iniciais do Funcionário
                </label>

                <div className="grid gap-3 sm:grid-cols-1">
                  {MODULE_DEFINITIONS.map(mod => {
                    const perms = newUserPermissions[mod.id] || { view: false, edit: false, delete: false };
                    return (
                      <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                        <span className="text-xs font-bold text-slate-800">{mod.label}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleNewUserPermission(mod.id, 'view')}
                            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                              perms.view ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNewUserPermission(mod.id, 'edit')}
                            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                              perms.edit ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleNewUserPermission(mod.id, 'delete')}
                            className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                              perms.delete ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="h-11 px-5 rounded-xl text-xs font-bold border-slate-200"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={creatingUser}
                  className="h-11 px-6 bg-[#1B3A2D] hover:bg-[#142B21] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  {creatingUser ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Criar Funcionário
                    </>
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </Card>
  );
}
