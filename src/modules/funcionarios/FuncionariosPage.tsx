import React, { useState, useMemo } from 'react';
import { useSystemStore, Employee } from '@/store/systemStore';
import { 
  Users, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  Award, 
  Trash2, 
  Edit2, 
  Calendar, 
  Briefcase, 
  Filter,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function FuncionariosPage() {
  const { employees, addEmployee, updateEmployee, toggleEmployeeStatus, removeEmployee, agenda } = useSystemStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<Employee['role']>('tecnico');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formSpecialties, setFormSpecialties] = useState<string[]>(['Dedetização', 'Desratização']);
  const [formColor, setFormColor] = useState('#2D6A4F');

  const availableSpecialties = [
    'Dedetização',
    'Desratização',
    'Descupinização',
    'Sanitização',
    'Controle de Pombos',
    'Limpeza de Reservatórios'
  ];

  const presetColors = [
    '#2D6A4F', // Verde escuro PestFlow
    '#1B3A2D', // Verde floresta
    '#2563EB', // Azul
    '#D97706', // Âmbar
    '#7C3AED', // Roxo
    '#DC2626', // Vermelho
    '#059669'  // Esmeralda
  ];

  // Open modal for new employee
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormRole('tecnico');
    setFormPhone('');
    setFormEmail('');
    setFormActive(true);
    setFormSpecialties(['Dedetização', 'Desratização']);
    setFormColor('#2D6A4F');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormPhone(emp.phone || '');
    setFormEmail(emp.email || '');
    setFormActive(emp.active);
    setFormSpecialties(emp.specialties || []);
    setFormColor(emp.color || '#2D6A4F');
    setIsModalOpen(true);
  };

  const handleToggleSpecialty = (spec: string) => {
    setFormSpecialties(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Por favor, informe o nome do colaborador.');
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name: formName.trim(),
        role: formRole,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        active: formActive,
        specialties: formSpecialties,
        color: formColor
      });
      toast.success('Dados do colaborador atualizados com sucesso!');
    } else {
      addEmployee({
        name: formName.trim(),
        role: formRole,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        active: formActive,
        specialties: formSpecialties,
        color: formColor
      });
      toast.success('Novo colaborador cadastrado com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o colaborador ${name}?`)) {
      removeEmployee(id);
      toast.success('Colaborador removido.');
    }
  };

  // Service count per employee
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (agenda || []).forEach((ev: any) => {
      if (ev.employeeId) {
        counts[ev.employeeId] = (counts[ev.employeeId] || 0) + 1;
      } else {
        const tech = (ev.scheduledTechnician || ev.technicianName || ev.confirmedBy || ev.notes || '').toLowerCase();
        (employees || []).forEach(emp => {
          if (tech && tech.includes(emp.name.toLowerCase())) {
            counts[emp.id] = (counts[emp.id] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [agenda, employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.phone && emp.phone.includes(searchTerm));
      
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && emp.active) || 
        (statusFilter === 'inactive' && !emp.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  const getRoleBadge = (role: Employee['role']) => {
    switch (role) {
      case 'tecnico':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">Técnico Operacional</span>;
      case 'supervisor':
      case 'gerente':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">Supervisor / Gerência</span>;
      case 'comercial':
      case 'vendedor':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">Consultor Comercial</span>;
      case 'administrativo':
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800">Administrativo / Gestão</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-800">{role}</span>;
    }
  };

  return (
    <div className="space-y-6 pt-2 pb-12 px-6 bg-zinc-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-black font-sans text-zinc-900 tracking-tight flex items-center gap-2">
            <Users className="size-5.5 text-[#1D9E75]" /> Equipe & Técnicos Operacionais
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Gerencie aplicadores credenciados, atribuição de serviços e escala técnica de campo.
          </p>
        </div>
        <button
          id="btn-novo-funcionario"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 h-11 px-5 bg-[#1D9E75] hover:bg-[#157959] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <UserPlus className="size-4" /> Cadastrar Colaborador
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="size-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#1D9E75] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
            <Briefcase className="size-3.5 text-zinc-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-800 outline-none cursor-pointer"
            >
              <option value="all">Todos os Cargos</option>
              <option value="tecnico">Técnico Operacional</option>
              <option value="supervisor">Supervisor Técnico</option>
              <option value="comercial">Consultor Comercial</option>
              <option value="administrativo">Administrativo</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
            <Filter className="size-3.5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-800 outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* EMPLOYEES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const count = serviceCounts[emp.id] || 0;
          return (
            <motion.div
              key={emp.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                emp.active ? 'border-zinc-200' : 'border-zinc-200 opacity-60 bg-zinc-50/50'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs"
                      style={{ backgroundColor: emp.color || '#2D6A4F' }}
                    >
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 leading-tight">{emp.name}</h3>
                      <div className="mt-1">{getRoleBadge(emp.role)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleEmployeeStatus(emp.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      emp.active ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-zinc-500 bg-zinc-100 hover:bg-zinc-200'
                    }`}
                    title={emp.active ? 'Clique para Inativar' : 'Clique para Ativar'}
                  >
                    {emp.active ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-zinc-600 mb-4 pt-2 border-t border-zinc-100">
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-zinc-400" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  {emp.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-zinc-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 text-zinc-400" />
                    <span className="font-semibold text-zinc-800">{count} serviço(s) agendados/executados</span>
                  </div>
                </div>

                {/* Specialties */}
                {emp.specialties && emp.specialties.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                      Especialidades Táticas
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {emp.specialties.map(spec => (
                        <span key={spec} className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-[10px] font-semibold">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(emp)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="size-3.5 text-zinc-500" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(emp.id, emp.name)}
                  className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-zinc-300 rounded-2xl p-12 text-center text-zinc-500">
            <Users className="size-10 mx-auto text-zinc-300 mb-3" />
            <p className="font-bold text-sm text-zinc-700">Nenhum colaborador encontrado</p>
            <p className="text-xs mt-1">Ajuste os filtros de busca ou cadastre um novo membro da equipe.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-zinc-200 max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 bg-[#E3EFE5] text-[#1B3A2D] rounded-xl flex items-center justify-center">
                    <Users className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900">
                      {editingEmployee ? 'Editar Colaborador' : 'Cadastrar Novo Colaborador'}
                    </h3>
                    <p className="text-xs text-zinc-500">Defina atribuições e qualificações operacionais</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Barbosa"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 border border-zinc-200 rounded-xl px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#1D9E75] bg-zinc-50 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1">
                      Cargo / Função
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full h-10 border border-zinc-200 rounded-xl px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#1D9E75] bg-zinc-50 cursor-pointer"
                    >
                      <option value="tecnico">Técnico Operacional</option>
                      <option value="supervisor">Supervisor Técnico</option>
                      <option value="comercial">Consultor Comercial</option>
                      <option value="administrativo">Administrativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="(24) 99999-8888"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full h-10 border border-zinc-200 rounded-xl px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#1D9E75] bg-zinc-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@pestflow.com.br"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full h-10 border border-zinc-200 rounded-xl px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#1D9E75] bg-zinc-50 focus:bg-white transition-all"
                  />
                </div>

                {/* Specialties Multi-select */}
                <div>
                  <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                    Especialidades / Habilitações
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSpecialties.map((spec) => {
                      const isSelected = formSpecialties.includes(spec);
                      return (
                        <button
                          type="button"
                          key={spec}
                          onClick={() => handleToggleSpecialty(spec)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Color Picker */}
                <div>
                  <label className="block text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mb-1.5">
                    Cor de Identificação no Calendário
                  </label>
                  <div className="flex items-center gap-2">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`size-7 rounded-full border-2 transition-transform cursor-pointer ${
                          formColor === color ? 'border-zinc-900 scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="employee-active-checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="size-4 text-[#1D9E75] rounded border-zinc-300 focus:ring-[#1D9E75]"
                  />
                  <label htmlFor="employee-active-checkbox" className="text-xs font-bold text-zinc-800 cursor-pointer">
                    Colaborador Ativo na Escala Tática
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 h-10 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-10 bg-[#1D9E75] hover:bg-[#157959] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {editingEmployee ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
