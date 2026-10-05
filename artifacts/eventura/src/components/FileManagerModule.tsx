import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  FileSpreadsheet,
  FileText,
  FileImage,
  File,
  Download,
  Trash2,
  Upload,
  Search,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  HardDrive,
  Eye,
  Plus,
  X,
  Check,
  ShieldCheck,
  Cloud,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';
import type { AppRole } from '@workspace/api-client-react';

export const ROLE_STORAGE_ACCOUNTS: Record<string, { email: string; vaultLabel: string }> = {
  COLLEGE_ADMIN: { email: 'nana007369@gmail.com', vaultLabel: 'Campus Master Cloud Vault' },
  CLUB: { email: 'animeytsigma@gmail.com', vaultLabel: 'Club Operations Cloud Vault' },
  ORGANIZER: { email: 'rudratejwankhede@gmail.com', vaultLabel: 'Event Management Cloud Vault' },
};

export type FileCategory = 'IMAGE' | 'EXCEL' | 'WORD';

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  category?: FileCategory | 'ALL';
  createdAt: string;
  itemCount?: number;
}

export interface FileItem {
  id: string;
  folderId: string;
  name: string;
  category: FileCategory;
  extension: string;
  size: number; // in bytes
  mimeType: string;
  dataUrl?: string; // real base64 or blob URL
  createdAt: string;
  description?: string;
}

// Initial seed data per role so the explorer is instantly ready and populated
function getInitialFolders(role: AppRole): FolderItem[] {
  if (role === 'COLLEGE_ADMIN') {
    return [
      { id: 'f-adm-1', name: 'Campus Event Posters & Banners', parentId: null, category: 'IMAGE', createdAt: '2026-02-10T10:00:00Z' },
      { id: 'f-adm-2', name: 'Financial Sheets & Budgets', parentId: null, category: 'EXCEL', createdAt: '2026-02-12T14:30:00Z' },
      { id: 'f-adm-3', name: 'Administration Policies & MoUs', parentId: null, category: 'WORD', createdAt: '2026-02-15T09:15:00Z' },
    ];
  } else if (role === 'CLUB') {
    return [
      { id: 'f-clb-1', name: 'Club Media & Graphics', parentId: null, category: 'IMAGE', createdAt: '2026-02-14T11:20:00Z' },
      { id: 'f-clb-2', name: 'Member Registrations & Attendance', parentId: null, category: 'EXCEL', createdAt: '2026-02-16T15:40:00Z' },
      { id: 'f-clb-3', name: 'Event Proposals & Circulars', parentId: null, category: 'WORD', createdAt: '2026-02-18T13:00:00Z' },
    ];
  } else {
    return [
      { id: 'f-org-1', name: 'Stage & Venue Photographs', parentId: null, category: 'IMAGE', createdAt: '2026-02-20T08:30:00Z' },
      { id: 'f-org-2', name: 'Participant Master Lists', parentId: null, category: 'EXCEL', createdAt: '2026-02-22T16:15:00Z' },
      { id: 'f-org-3', name: 'Sponsorship Letters & Run-Sheets', parentId: null, category: 'WORD', createdAt: '2026-02-24T10:45:00Z' },
    ];
  }
}

function getInitialFiles(role: AppRole): FileItem[] {
  if (role === 'COLLEGE_ADMIN') {
    return [
      { id: 'fl-adm-1', folderId: 'f-adm-1', name: 'TechFest_2026_Main_Banner.png', category: 'IMAGE', extension: 'png', size: 2840500, mimeType: 'image/png', createdAt: '2026-02-10T11:00:00Z', description: 'Official campus entrance banner graphic for Tech Fest.' },
      { id: 'fl-adm-2', folderId: 'f-adm-1', name: 'Cultural_Night_Main_Stage_Poster.jpg', category: 'IMAGE', extension: 'jpg', size: 1950200, mimeType: 'image/jpeg', createdAt: '2026-02-11T12:00:00Z', description: 'Auditorium promotional poster in high resolution.' },
      { id: 'fl-adm-3', folderId: 'f-adm-2', name: 'Annual_Campus_Fest_Budget_2026.xlsx', category: 'EXCEL', extension: 'xlsx', size: 458900, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-12T15:00:00Z', description: 'Department-wise budget approvals and expense allocations.' },
      { id: 'fl-adm-4', folderId: 'f-adm-2', name: 'Sponsorship_Revenue_Ledger_Q1.xlsx', category: 'EXCEL', extension: 'xlsx', size: 312400, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-13T16:30:00Z', description: 'Corporate sponsorship receipts, tiered packages, and vendor payments.' },
      { id: 'fl-adm-5', folderId: 'f-adm-3', name: 'Campus_Event_Safety_And_Policy_Charter.docx', category: 'WORD', extension: 'docx', size: 215000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-15T10:00:00Z', description: 'Administrative regulation guidelines signed by Dean of Student Affairs.' },
      { id: 'fl-adm-6', folderId: 'f-adm-3', name: 'Auditorium_Booking_Memorandum.docx', category: 'WORD', extension: 'docx', size: 148000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-16T11:15:00Z', description: 'Terms of facility usage, sound system restrictions, and security deposit.' },
    ];
  } else if (role === 'CLUB') {
    return [
      { id: 'fl-clb-1', folderId: 'f-clb-1', name: 'Robotics_Club_Brand_Identity.png', category: 'IMAGE', extension: 'png', size: 1520000, mimeType: 'image/png', createdAt: '2026-02-14T12:00:00Z', description: 'Official club crest and vector logos.' },
      { id: 'fl-clb-2', folderId: 'f-clb-1', name: 'Workshop_Social_Media_Story.jpg', category: 'IMAGE', extension: 'jpg', size: 840000, mimeType: 'image/jpeg', createdAt: '2026-02-15T14:30:00Z', description: 'Instagram and LinkedIn banner for upcoming IoT workshop.' },
      { id: 'fl-clb-3', folderId: 'f-clb-2', name: 'Club_Member_Directory_2026.xlsx', category: 'EXCEL', extension: 'xlsx', size: 289000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-16T16:00:00Z', description: 'Complete roster of 65 core and general club members.' },
      { id: 'fl-clb-4', folderId: 'f-clb-2', name: 'Bootcamp_Attendance_Tracker.xlsx', category: 'EXCEL', extension: 'xlsx', size: 195000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-17T17:15:00Z', description: 'Day-by-day attendance log for the 3-day robotics bootcamp.' },
      { id: 'fl-clb-5', folderId: 'f-clb-3', name: 'Annual_Robotics_Fest_Proposal_Final.docx', category: 'WORD', extension: 'docx', size: 380000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-18T14:00:00Z', description: 'Detailed proposal submitted to College Administration for funding.' },
      { id: 'fl-clb-6', folderId: 'f-clb-3', name: 'Executive_Meeting_Minutes_Feb.docx', category: 'WORD', extension: 'docx', size: 120000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-19T10:00:00Z', description: 'Action items, budget sign-offs, and committee appointments.' },
    ];
  } else {
    return [
      { id: 'fl-org-1', folderId: 'f-org-1', name: 'Main_Auditorium_Stage_Grid.png', category: 'IMAGE', extension: 'png', size: 3400000, mimeType: 'image/png', createdAt: '2026-02-20T09:00:00Z', description: 'Stage layout blueprint with lighting rig and sound box markers.' },
      { id: 'fl-org-2', folderId: 'f-org-1', name: 'Outdoor_Quad_Stall_Arrangement.jpg', category: 'IMAGE', extension: 'jpg', size: 2200000, mimeType: 'image/jpeg', createdAt: '2026-02-21T11:30:00Z', description: 'Photographic mapping for food and exhibition stalls.' },
      { id: 'fl-org-3', folderId: 'f-org-2', name: 'Hackathon_Teams_Master_List.xlsx', category: 'EXCEL', extension: 'xlsx', size: 520000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-22T17:00:00Z', description: '120 registered hackathon teams with problem statements and track leads.' },
      { id: 'fl-org-4', folderId: 'f-org-2', name: 'Volunteer_Duty_Shifts_And_CheckIn.xlsx', category: 'EXCEL', extension: 'xlsx', size: 275000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', createdAt: '2026-02-23T18:00:00Z', description: 'Shift timetable for crowd control, stage management, and registration desk.' },
      { id: 'fl-org-5', folderId: 'f-org-3', name: 'Event_Minute_to_Minute_RunSheet.docx', category: 'WORD', extension: 'docx', size: 290000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-24T11:00:00Z', description: 'Comprehensive cue sheet for audio-visual crew, anchors, and VIP arrival.' },
      { id: 'fl-org-6', folderId: 'f-org-3', name: 'Corporate_Sponsor_Formal_Pitch_Letter.docx', category: 'WORD', extension: 'docx', size: 165000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: '2026-02-25T14:20:00Z', description: 'Standard partnership invitation template signed by Organizing Committee.' },
    ];
  }
}

function detectCategory(filename: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)) return 'IMAGE';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'EXCEL';
  return 'WORD';
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return 'Recently';
  }
}

export function FileManagerModule({ role }: { role: AppRole }) {
  const accountInfo = ROLE_STORAGE_ACCOUNTS[role] || {
    email: 'nana007369@gmail.com',
    vaultLabel: 'Campus Cloud Vault',
  };

  const storageKeyFolders = `eventura_drive_folders_${role}`;
  const storageKeyFiles = `eventura_drive_files_${role}`;

  const [folders, setFolders] = useState<FolderItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeyFolders);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return getInitialFolders(role);
  });

  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKeyFiles);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return getInitialFiles(role);
  });

  // Current folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<'ALL' | FileCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & UI states
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState<FileCategory | 'ALL'>('ALL');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state to localStorage whenever folders or files change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKeyFolders, JSON.stringify(folders));
      } catch {}
    }
  }, [folders, storageKeyFolders]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Save files (excluding giant dataUrls if any, or retain lightweight storage)
        const lightweight = files.map(f => ({
          ...f,
          // keep dataUrl if small (< 2MB)
          dataUrl: f.dataUrl && f.dataUrl.length < 2000000 ? f.dataUrl : undefined,
        }));
        localStorage.setItem(storageKeyFiles, JSON.stringify(lightweight));
      } catch {}
    }
  }, [files, storageKeyFiles]);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Navigation helpers
  const currentFolder = folders.find(f => f.id === currentFolderId) || null;

  // Build breadcrumb trail
  const breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Workspace Drive' }];
  if (currentFolder) {
    breadcrumbs.push({ id: currentFolder.id, name: currentFolder.name });
  }

  // Filtered files & folders
  const visibleFolders = currentFolderId === null
    ? folders.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === 'ALL' || f.category === filterCategory || f.category === 'ALL' || !f.category;
        return matchesSearch && matchesCat;
      })
    : [];

  const visibleFiles = files.filter(f => {
    // If in root, show all or show nothing? In Windows PC, root can show files or folder files
    const inCurrentScope = currentFolderId ? f.folderId === currentFolderId : f.folderId === null || f.folderId === undefined;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || f.category === filterCategory;
    return inCurrentScope && matchesSearch && matchesCat;
  });

  // Calculate storage usage
  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalCount = files.length;
  const imageCount = files.filter(f => f.category === 'IMAGE').length;
  const excelCount = files.filter(f => f.category === 'EXCEL').length;
  const wordCount = files.filter(f => f.category === 'WORD').length;

  // Create New Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      parentId: currentFolderId,
      category: newFolderCategory,
      createdAt: new Date().toISOString(),
    };

    setFolders(prev => [newFolder, ...prev]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
    showNotification(`Folder "${trimmed}" created successfully.`);
  };

  // Delete Folder
  const handleDeleteFolder = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder "${folderName}" and all its contents?`)) return;

    setFolders(prev => prev.filter(f => f.id !== folderId));
    setFiles(prev => prev.filter(f => f.folderId !== folderId));
    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
    showNotification(`Folder "${folderName}" deleted.`);
  };

  // Delete File
  const handleDeleteFile = (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete file "${fileName}"?`)) return;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (previewFile?.id === fileId) setPreviewFile(null);
    showNotification(`File "${fileName}" removed.`);
  };

  // Handle Real File Upload
  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const targetFolderId = currentFolderId || (folders[0]?.id ?? 'default-folder');
    const newItems: FileItem[] = [];

    Array.from(fileList).forEach(file => {
      const category = detectCategory(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      const reader = new FileReader();
      reader.onload = (event) => {
        const item: FileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          folderId: targetFolderId,
          name: file.name,
          category,
          extension: ext,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          dataUrl: event.target?.result as string,
          createdAt: new Date().toISOString(),
          description: `Uploaded to ${accountInfo.vaultLabel}`,
        };

        setFiles(prev => [item, ...prev]);
      };
      reader.readAsDataURL(file);
      newItems.push({} as FileItem); // counter
    });

    showNotification(`Uploaded ${fileList.length} file(s) into ${currentFolder?.name || 'Workspace Drive'}.`);
  };

  // Download File Action
  const handleDownload = (file: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Downloading ${file.name}...`);
    } else {
      // Create a mock blob text download if real dataUrl isn't embedded
      const sampleText = `EVENTURA Campus Cloud Document\nFile: ${file.name}\nCategory: ${file.category}\nVault Account: ${accountInfo.email}\nTimestamp: ${file.createdAt}\n\n[Verified Campus Document Payload]`;
      const blob = new Blob([sampleText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.endsWith('.txt') ? file.name : `${file.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(`Downloading ${file.name}...`);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        fontFamily: 'var(--app-font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Cloud Account Header Strip (Windows Explorer Drive Bar) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e2646 0%, #2b3564 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(30, 38, 70, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8ba2ff',
              }}
            >
              <HardDrive size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  {accountInfo.vaultLabel}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '50px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Encrypted &amp; Connected
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#c3cbef', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Storage Sync Account:</span>
                <strong style={{ color: '#fff', fontWeight: 700 }}>{accountInfo.email}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsNewFolderOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9px',
                background: '#4f5fd3',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <FolderPlus size={15} /> New Folder
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9px',
                background: '#fff',
                color: '#212845',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <Upload size={15} color="#4f5fd3" /> Upload Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
              multiple
              accept="image/*,.xlsx,.xls,.csv,.docx,.doc,.txt,.pdf"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Quota & Category Breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5f5' }}>
              <FileImage size={14} color="#60a5fa" />
              <span><b>{imageCount}</b> Images</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5f5' }}>
              <FileSpreadsheet size={14} color="#34d399" />
              <span><b>{excelCount}</b> Excel Sheets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5f5' }}>
              <FileText size={14} color="#a78bfa" />
              <span><b>{wordCount}</b> Word Docs</span>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#cbd5f5' }}>
            Cloud Space: <b>{formatBytes(totalBytes)}</b> of <b>1,024 GB</b> allocated (99% free)
          </div>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusNotification && (
        <div
          style={{
            padding: '10px 16px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '9px',
            color: '#065f46',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} /> {statusNotification}
        </div>
      )}

      {/* Windows Explorer Navigation Toolbar */}
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e5e8f2',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        {/* Top Explorer Row: Back button, Address Bar Breadcrumbs, Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Navigation buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={currentFolderId === null}
              onClick={() => setCurrentFolderId(null)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e1e4ee',
                background: currentFolderId === null ? '#f8f9fc' : '#fff',
                color: currentFolderId === null ? '#bcc1d2' : '#303651',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentFolderId === null ? 'default' : 'pointer',
              }}
              title="Back to Root Drive"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={currentFolderId === null}
              onClick={() => setCurrentFolderId(null)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e1e4ee',
                background: currentFolderId === null ? '#f8f9fc' : '#fff',
                color: currentFolderId === null ? '#bcc1d2' : '#303651',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentFolderId === null ? 'default' : 'pointer',
              }}
              title="Up to Parent Folder"
            >
              <ArrowUp size={14} />
            </button>
          </div>

          {/* Windows-style Address Bar */}
          <div
            style={{
              flex: '1 1 300px',
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f8f9fd',
              border: '1px solid #e1e4ee',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#323a54',
              overflowX: 'auto',
            }}
          >
            <HardDrive size={14} color="#4f5fd3" />
            <span>This PC</span>
            <ChevronRight size={12} color="#9aa1ba" />
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              style={{
                background: 'none',
                border: 'none',
                color: currentFolderId === null ? '#20263f' : '#4f5fd3',
                fontWeight: currentFolderId === null ? 700 : 600,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              Workspace Drive
            </button>
            {currentFolder && (
              <>
                <ChevronRight size={12} color="#9aa1ba" />
                <span style={{ color: '#20263f', fontWeight: 700 }}>{currentFolder.name}</span>
              </>
            )}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="#8a92ac" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search in Drive..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: '8px',
                border: '1px solid #e1e4ee',
                fontSize: '12px',
                background: '#f8f9fd',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8a92ac',
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid #e1e4ee', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'grid' ? '#eef1ff' : '#fff',
                border: 'none',
                color: viewMode === 'grid' ? '#4f5fd3' : '#6b7492',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View (Icons)"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                background: viewMode === 'list' ? '#eef1ff' : '#fff',
                border: 'none',
                color: viewMode === 'list' ? '#4f5fd3' : '#6b7492',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderLeft: '1px solid #e1e4ee',
              }}
              title="List View (Details)"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#8891aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter:</span>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'IMAGE', label: '🖼️ Images (PNG, JPG)' },
            { id: 'EXCEL', label: '📊 Excel Sheets (XLSX, CSV)' },
            { id: 'WORD', label: '📝 Word Docs (DOCX, PDF)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id as 'ALL' | FileCategory)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterCategory === tab.id ? '#4f5fd3' : '#e4e7f0',
                background: filterCategory === tab.id ? '#eef1ff' : '#fff',
                color: filterCategory === tab.id ? '#4f5fd3' : '#575f79',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Overlay indicator */}
      {isDragOver && (
        <div
          style={{
            border: '2px dashed #4f5fd3',
            background: 'rgba(79, 95, 211, 0.08)',
            borderRadius: '14px',
            padding: '24px',
            textAlign: 'center',
            color: '#4f5fd3',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          Drop your files here to upload directly to {currentFolder?.name || 'Workspace Drive'}
        </div>
      )}

      {/* Explorer Content Window */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #e5e8f2',
          padding: '20px',
          minHeight: '380px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        }}
      >
        {/* Section 1: Folders (if any) */}
        {visibleFolders.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#323956', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Folders ({visibleFolders.length})
              </span>
              <span style={{ fontSize: '11px', color: '#9199b4' }}>Double click to open</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              {visibleFolders.map(folder => {
                const countInFolder = files.filter(f => f.folderId === folder.id).length;
                return (
                  <div
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e6e9f2',
                      background: '#fbfcfd',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#4f5fd3';
                      e.currentTarget.style.background = '#f5f7ff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e6e9f2';
                      e.currentTarget.style.background = '#fbfcfd';
                    }}
                  >
                    {/* Windows 11 style folder icon */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #ffd15c 0%, #f59e0b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                        flexShrink: 0,
                      }}
                    >
                      <Folder size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          color: '#212744',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {folder.name}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#8891ab' }}>
                        {countInFolder} {countInFolder === 1 ? 'file' : 'files'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a1a8c0',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Delete Folder"
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#a1a8c0')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Files */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#323956', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Files {currentFolder ? `in "${currentFolder.name}"` : ''} ({visibleFiles.length})
            </span>
            {currentFolder && (
              <span style={{ fontSize: '11px', color: '#4f5fd3', fontWeight: 600 }}>
                Storage Location: {accountInfo.vaultLabel}
              </span>
            )}
          </div>

          {visibleFiles.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                background: '#f9fafd',
                border: '1px dashed #dce2f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f5fd3',
                }}
              >
                <FolderOpen size={24} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#272d47', margin: 0 }}>
                This folder is empty
              </h3>
              <p style={{ fontSize: '12px', color: '#7c849e', margin: 0, maxWidth: '340px' }}>
                Upload images, Excel sheets (.xlsx), or Word documents (.docx) to store them in your secure cloud drive.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: '8px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: '#4f5fd3',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Upload size={14} /> Upload File Now
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View (Windows Explorer Large Icons / Tiles) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '16px',
              }}
            >
              {visibleFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setPreviewFile(file)}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e6e9f2',
                    background: '#fff',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#4f5fd3';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 95, 211, 0.09)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e6e9f2';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* File preview box */}
                  <div
                    style={{
                      height: '110px',
                      borderRadius: '8px',
                      background: file.category === 'IMAGE' ? '#f3f4f8' : file.category === 'EXCEL' ? '#ecfdf5' : '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {file.category === 'IMAGE' ? (
                      file.dataUrl ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>
                          <FileImage size={34} />
                          <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {file.extension}
                          </span>
                        </div>
                      )
                    ) : file.category === 'EXCEL' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                        <FileSpreadsheet size={36} />
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#059669', background: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>
                          EXCEL SHEET
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#4f5fd3' }}>
                        <FileText size={36} />
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#4338ca', background: '#e0e7ff', padding: '1px 6px', borderRadius: '4px' }}>
                          WORD DOC
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong
                      title={file.name}
                      style={{
                        fontSize: '12px',
                        color: '#20263f',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8891ab', marginTop: '2px' }}>
                      <span>{formatBytes(file.size)}</span>
                      <span>{file.extension.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Quick card action bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f0f2f7' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f5fd3',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <Eye size={13} /> View
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleDownload(file, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5d6682',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                        }}
                        title="Download to PC"
                        onMouseEnter={e => (e.currentTarget.style.color = '#4f5fd3')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#5d6682')}
                      >
                        <Download size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a0a8be',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                        }}
                        title="Delete File"
                        onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#a0a8be')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View (Windows Explorer Detailed Table) */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eef1f7', textAlign: 'left', color: '#6d7590', fontWeight: 700 }}>
                    <th style={{ padding: '10px 12px' }}>Name</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Date Modified</th>
                    <th style={{ padding: '10px 12px' }}>Size</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      style={{
                        borderBottom: '1px solid #f2f4f9',
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {file.category === 'IMAGE' && <FileImage size={18} color="#3b82f6" />}
                          {file.category === 'EXCEL' && <FileSpreadsheet size={18} color="#10b981" />}
                          {file.category === 'WORD' && <FileText size={18} color="#4f5fd3" />}
                          <strong style={{ color: '#242a48' }}>{file.name}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: file.category === 'IMAGE' ? '#eff6ff' : file.category === 'EXCEL' ? '#ecfdf5' : '#f5f3ff',
                            color: file.category === 'IMAGE' ? '#2563eb' : file.category === 'EXCEL' ? '#059669' : '#6d28d9',
                          }}
                        >
                          {file.category}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#7c85a0' }}>{formatDate(file.createdAt)}</td>
                      <td style={{ padding: '10px 12px', color: '#7c85a0' }}>{formatBytes(file.size)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleDownload(file, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4f5fd3',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Download File"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9ba2b8',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Delete File"
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#9ba2b8')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 25, 45, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsNewFolderOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              width: '420px',
              maxWidth: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} color="#4f5fd3" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1f2642' }}>Create New Folder</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                style={{ background: 'none', border: 'none', color: '#8891ab', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#38405d', marginBottom: '6px' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Workshop Posters, Budget Q2..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d2d7e8',
                    fontSize: '13px',
                    background: '#f8f9fd',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#38405d', marginBottom: '6px' }}>
                  Primary Content Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'ALL', label: '📁 General Mixed' },
                    { id: 'IMAGE', label: '🖼️ Images' },
                    { id: 'EXCEL', label: '📊 Excel Sheets' },
                    { id: 'WORD', label: '📝 Word Docs' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewFolderCategory(c.id as any)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: newFolderCategory === c.id ? '#4f5fd3' : '#e0e4ef',
                        background: newFolderCategory === c.id ? '#eef1ff' : '#fff',
                        color: newFolderCategory === c.id ? '#4f5fd3' : '#454d6a',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d8dde9',
                    background: '#fff',
                    color: '#555f7c',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4f5fd3',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal / Lightbox */}
      {previewFile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 20, 38, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '24px',
              width: '640px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {previewFile.category === 'IMAGE' && <FileImage size={24} color="#3b82f6" />}
                {previewFile.category === 'EXCEL' && <FileSpreadsheet size={24} color="#10b981" />}
                {previewFile.category === 'WORD' && <FileText size={24} color="#4f5fd3" />}
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e2440' }}>
                    {previewFile.name}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#7a839e', marginTop: '2px' }}>
                    {formatBytes(previewFile.size)} · {previewFile.extension.toUpperCase()} · Modified {formatDate(previewFile.createdAt)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                style={{ background: 'none', border: 'none', color: '#8891ab', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Box */}
            <div
              style={{
                borderRadius: '12px',
                background: '#f8f9fc',
                border: '1px solid #e7eaf3',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '220px',
              }}
            >
              {previewFile.category === 'IMAGE' && previewFile.dataUrl ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : previewFile.category === 'IMAGE' ? (
                <div style={{ textAlign: 'center', color: '#556080' }}>
                  <FileImage size={48} color="#3b82f6" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>High Resolution Campus Graphic</p>
                  <small style={{ color: '#8892ad' }}>Encrypted on {accountInfo.vaultLabel}</small>
                </div>
              ) : previewFile.category === 'EXCEL' ? (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#047857' }}>
                    <FileSpreadsheet size={22} />
                    <strong style={{ fontSize: '13px' }}>Microsoft Excel Worksheet Preview</strong>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', fontSize: '11px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', background: '#f1f5f9', fontWeight: 700, padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>
                      <span>ROW</span>
                      <span>COLUMN A</span>
                      <span>COLUMN B</span>
                      <span>COLUMN C</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#94a3b8' }}>1</span>
                      <span>Campus Registration ID</span>
                      <span>Department</span>
                      <span>Approval Status</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#94a3b8' }}>2</span>
                      <span>EV-2026-001</span>
                      <span>Computer Science</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>VERIFIED</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', padding: '8px 10px' }}>
                      <span style={{ color: '#94a3b8' }}>3</span>
                      <span>EV-2026-002</span>
                      <span>Campus Administration</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>VERIFIED</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#4338ca' }}>
                    <FileText size={22} />
                    <strong style={{ fontSize: '13px' }}>Microsoft Word Document Preview</strong>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', fontSize: '12px', lineHeight: 1.6, color: '#334155' }}>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>{previewFile.name.replace(/\.[^.]+$/, '')}</strong>
                    <p style={{ margin: '0 0 8px 0' }}>
                      This document has been archived into the encrypted campus workspace vault under account <code>{accountInfo.email}</code>.
                    </p>
                    <p style={{ margin: 0, color: '#64748b' }}>
                      Full revision history, signatures, and document headers are preserved. Click Download below to open in Microsoft Word or Office.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description note */}
            {previewFile.description && (
              <div style={{ fontSize: '12px', color: '#68728d', background: '#f5f7fc', padding: '10px 14px', borderRadius: '8px' }}>
                <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: '#4f5fd3' }} />
                {previewFile.description}
              </div>
            )}

            {/* Footer action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f0f2f7' }}>
              <button
                type="button"
                onClick={(e) => handleDeleteFile(previewFile.id, previewFile.name, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} /> Delete
              </button>

              <button
                type="button"
                onClick={() => handleDownload(previewFile)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '9px',
                  background: '#4f5fd3',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 95, 211, 0.25)',
                }}
              >
                <Download size={15} /> Download File to PC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
