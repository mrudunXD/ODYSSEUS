import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RoleGuard } from '../components/layout/RoleGuard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { apiClient } from '../api/client';
import { Search, Plus, Upload, Eye, Trash2, X, RefreshCw } from 'lucide-react';
import { Student } from '../types';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export const Students: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);

  // Form State
  const [stuName, setStuName] = useState('');
  const [stuCode, setStuCode] = useState('');
  const [stuClass, setStuClass] = useState('Class 10');
  const [stuParent, setStuParent] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPhone, setStuPhone] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/students');
      if (res.data?.data) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.warn('Students fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/students', {
        studentCode: stuCode || `2025-${Math.floor(100 + Math.random() * 900)}`,
        name: stuName,
        parentName: stuParent || 'Parent',
        parentEmail: stuEmail || 'parent@springfield.edu',
        parentPhone: stuPhone || '+91 98765 43210',
      });

      if (res.data?.success) {
        fetchStudents();
        setIsAddModalOpen(false);
        setStuName('');
        setStuCode('');
      }
    } catch (err) {
      alert('Failed to add student to database');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          for (const row of results.data as any[]) {
            if (row.Name) {
              await apiClient.post('/students', {
                studentCode: row.StudentCode || `2025-${Math.floor(100 + Math.random() * 900)}`,
                name: row.Name,
                parentName: row.ParentName || 'Parent',
                parentEmail: row.ParentEmail || 'parent@springfield.edu',
                parentPhone: row.ParentPhone || '+91 98765 43210',
              });
            }
          }
          fetchStudents();
          alert('CSV batch import completed successfully into database!');
        },
      });
    }
  };

  return (
    <PageWrapper>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] card-shadow mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
            Student Roster & Directory Management
          </h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Search student accounts, view ledgers, and perform CSV bulk imports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStudents}
            className="p-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-2xl text-xs font-bold text-[#6B7280] hover:text-[#E85D04]"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F5F0] border border-[#E5E7EB] rounded-2xl text-xs font-bold text-[#1A1A1A] hover:border-[#E85D04] transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[#E85D04]" />
            <span>Bulk CSV Import</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>

          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#C44D00] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-[#E85D04]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
            Enrolled Students Roster ({students.length})
          </h3>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name or Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#E85D04]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="pb-3 pl-2">Student Code</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Class</th>
                <th className="pb-3">Parent Contact</th>
                <th className="pb-3">Assigned Fee</th>
                <th className="pb-3">Balance Due</th>
                <th className="pb-3">Fee Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs">
              {students
                .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentCode.includes(searchTerm))
                .map((s) => (
                  <tr key={s.id} className="hover:bg-[#F5F5F0] transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-[#1A1A1A]">{s.studentCode}</td>
                    <td className="py-3.5 font-bold text-[#1A1A1A]">{s.name}</td>
                    <td className="py-3.5 font-semibold text-[#6B7280]">
                      {s.class?.name || 'Class 11'} - {s.class?.section || 'A'}
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-[#1A1A1A] block">{s.parentName}</span>
                      <span className="text-[10px] text-[#6B7280]">{s.parentPhone}</span>
                    </td>
                    <td className="py-3.5 font-semibold">{formatCurrency(s.totalAssigned || 15000)}</td>
                    <td className="py-3.5 font-extrabold text-[#E85D04]">{formatCurrency(s.balanceDue || 0)}</td>
                    <td className="py-3.5">
                      <StatusBadge status={s.status || 'UNPAID'} />
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="p-1.5 text-[#6B7280] hover:text-[#E85D04] hover:bg-[#FFF0E6] rounded-lg transition-colors"
                          title="View Student Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h3 className="font-extrabold text-[#1A1A1A] text-base">Enroll New Student</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 pt-4 text-xs">
              <div>
                <label className="font-bold text-[#1A1A1A] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  placeholder="Vikramaditya Singh"
                  className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 font-semibold text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Student Code</label>
                  <input
                    type="text"
                    required
                    value={stuCode}
                    onChange={(e) => setStuCode(e.target.value)}
                    placeholder="2025-109"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 font-mono font-bold text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Class</label>
                  <select
                    value={stuClass}
                    onChange={(e) => setStuClass(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 font-semibold text-[#1A1A1A]"
                  >
                    {['Class 1', 'Class 2', 'Class 5', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={stuParent}
                    onChange={(e) => setStuParent(e.target.value)}
                    placeholder="Parent Full Name"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 font-semibold text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1A1A1A] block mb-1">Parent Phone</label>
                  <input
                    type="text"
                    value={stuPhone}
                    onChange={(e) => setStuPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5F5F0] border border-[#E5E7EB] rounded-xl p-2 font-semibold text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#F5F5F0] border border-[#E5E7EB] text-[#1A1A1A] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E85D04] text-white font-bold rounded-xl hover:bg-[#C44D00] shadow-md shadow-[#E85D04]/20"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
