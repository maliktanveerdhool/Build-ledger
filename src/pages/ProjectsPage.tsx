import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  ChevronRight,
  Filter,
  X,
  Sparkles
} from 'lucide-react';
import { projectsApi, clientsApi, settingsApi } from '../lib/api';
import { Project, Client } from '../types';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  clientId: z.string().min(1, 'Please select a client'),
  location: z.string().min(2, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  contractValue: z.number().min(0, 'Contract value must be non-negative'),
  status: z.enum(['Active', 'Completed', 'On Hold']),
  description: z.string().optional()
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete dialog states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      clientId: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      contractValue: 0,
      status: 'Active',
      description: ''
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projData, cliData] = await Promise.all([
        projectsApi.getAll(),
        clientsApi.getAll()
      ]);
      setProjects(projData);
      setClients(cliData);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      const res = await settingsApi.seedDemo();
      toast.success(res.message || 'Sample demo data loaded successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to load sample demo data');
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    reset({
      name: '',
      clientId: clients[0]?.id || '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      contractValue: 0,
      status: 'Active',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    reset({
      name: project.name,
      clientId: project.clientId,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate || '',
      contractValue: project.contractValue,
      status: project.status,
      description: project.description || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, data);
        toast.success('Project updated successfully');
      } else {
        await projectsApi.create(data);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(deleteId);
      toast.success('Project deleted');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Construction Projects</h1>
          <p className="text-sm text-slate-500">Manage job sites, budgets, contracts, and status</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, location, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
          {['All', 'Active', 'Completed', 'On Hold'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid / Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search terms or status filters.'
              : 'Get started by adding your first construction project.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
            {!search && statusFilter === 'All' && (
              <button
                onClick={handleSeedDemo}
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Demo Data</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <Badge status={project.status} />
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-2">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => openEditModal(project, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(project.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  <span className="truncate">{project.location}</span>
                </p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Contract Value</span>
                    <span className="font-bold text-slate-900">${project.contractValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Expenses</span>
                    <span className="font-semibold text-amber-700">${(project.totalExpenses || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Remaining Budget</span>
                    <span className={`font-semibold ${(project.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ${(project.remainingBudget || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {project.startDate}
                </span>
                <span className="font-semibold text-blue-600 flex items-center group-hover:translate-x-0.5 transition-transform">
                  Job Costing <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProject ? 'Edit Construction Project' : 'New Construction Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Project Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g., Oakridge Commercial Center"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Client *</label>
                <select
                  {...register('clientId')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-rose-600 mt-1">{errors.clientId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Job Location / Address *</label>
                <input
                  type="text"
                  {...register('location')}
                  placeholder="e.g., 450 E Grand Ave, Chicago, IL"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contract Value ($) *</label>
                  <input
                    type="number"
                    step="1000"
                    {...register('contractValue', { valueAsNumber: true })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.contractValue && <p className="text-xs text-rose-600 mt-1">{errors.contractValue.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Est. Completion Date</label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Scope of Work / Description</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  placeholder="Enter project specifications, phase details, or notes..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Construction Project"
        description="Are you sure you want to delete this project? All associated job costing calculations will be removed."
        confirmLabel="Delete Project"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
