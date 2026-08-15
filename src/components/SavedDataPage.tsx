import React, { useState } from 'react';
import { SavedProject, ConstantProfilesConfig } from '../types';
import { getSavedProjects, deleteProject, saveProject } from '../utils/storage';
import {
  FolderOpen,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Copy,
  Plus,
  Eye,
  PackageCheck,
  Ruler,
  Download,
  Upload,
} from 'lucide-react';

interface SavedDataPageProps {
  onOpenProject: (
    project: SavedProject,
    initialTab: 'preview' | 'profiles' | 'frames'
  ) => void;
  onEditProjectItems: (project: SavedProject) => void;
  onNewCalculation: () => void;
}

export const SavedDataPage: React.FC<SavedDataPageProps> = ({
  onOpenProject,
  onEditProjectItems,
  onNewCalculation,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>(getSavedProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<SavedProject | null>(null);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProject(id);
      setProjects(getSavedProjects());
      if (selectedProjectForModal?.id === id) {
        setSelectedProjectForModal(null);
      }
    }
  };

  const handleDuplicate = (project: SavedProject) => {
    const duplicated: SavedProject = {
      ...project,
      id: `project-${Date.now()}`,
      name: `${project.name} (Copy)`,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    saveProject(duplicated);
    setProjects(getSavedProjects());
  };

  const handleExportJson = (project: SavedProject) => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Saved Fabrication Measurements & Projects
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Access previously recorded window/door measurements, cut sheets, and material bills
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onNewCalculation}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Fabrication Calculation
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved projects by job name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredProjects.length} saved project(s)
        </span>
      </div>

      {/* Projects Grid / List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No saved projects found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a new calculation to save your aluminum profiles, frames, and glass cut specifications.
          </p>
          <button
            onClick={onNewCalculation}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Start New Calculation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const totalUnits = project.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDuplicate(project)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="Duplicate project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>Saved: {new Date(project.dateCreated).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{project.items.length} line item(s) ({totalUnits} units)</span>
                  </div>

                  {/* Preview Items Snippet */}
                  <div className="space-y-1.5 mb-5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-h-[100px] overflow-y-auto">
                    {project.items.slice(0, 3).map((it, i) => (
                      <div key={i} className="text-[11px] text-slate-700 flex items-center justify-between">
                        <span className="truncate max-w-[170px] font-medium">
                          {it.tag || `Unit #${i + 1}`} ({it.kind.replace(/_/g, ' ')})
                        </span>
                        <span className="font-mono text-slate-500">
                          {it.width}×{it.height}mm (×{it.quantity})
                        </span>
                      </div>
                    ))}
                    {project.items.length > 3 && (
                      <div className="text-[10px] text-slate-400 text-center italic">
                        +{project.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Select Output View to Access:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onOpenProject(project, 'preview')}
                      className="inline-flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      title="View Skeleton Wireframe Preview"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => onOpenProject(project, 'profiles')}
                      className="inline-flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      title="View Profiles & Materials Output"
                    >
                      <PackageCheck className="w-3 h-3 text-emerald-600" />
                      <span>Profiles</span>
                    </button>

                    <button
                      onClick={() => onOpenProject(project, 'frames')}
                      className="inline-flex items-center justify-center gap-1 py-2 px-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                      title="View Frame Cut Measurements"
                    >
                      <Ruler className="w-3 h-3 text-indigo-600" />
                      <span>Frames</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onEditProjectItems(project)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                      Edit Measurements & Items &rarr;
                    </button>
                    <button
                      onClick={() => handleExportJson(project)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> JSON
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
