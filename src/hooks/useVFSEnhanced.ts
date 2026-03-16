/**
 * useVFSEnhanced — Unified hook wrapping VFS with event bus, snapshots, 
 * import graph, and Monaco sync
 * 
 * Drop-in enhancement for useVirtualFileSystem that adds:
 * - Event bus emissions on all VFS mutations
 * - Automatic snapshot creation before AI edits
 * - Undo/redo support
 * - Import graph analysis (lazy, on-demand)
 * - Monaco model sync triggers
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useVirtualFileSystem, type VirtualNode, type VirtualFile } from '@/hooks/useVirtualFileSystem';
import { vfsEventBus, type FileEvent, type BatchEvent, type SnapshotEvent } from '@/services/vfsEventBus';
import { vfsSnapshotManager, type DiffSummary } from '@/services/vfsSnapshotManager';
import { analyzeImportGraph, getAffectedFiles, getGraphSummaryForAI, type ImportGraph, type AffectedFiles } from '@/services/importGraphAnalyzer';
import { monacoVFSSync, type MonacoAPI } from '@/services/monacoVFSSync';

// ============================================================================
// Types
// ============================================================================

export interface UseVFSEnhancedReturn extends ReturnType<typeof useVirtualFileSystem> {
  // Event Bus
  eventBus: typeof vfsEventBus;

  // Snapshots / Undo-Redo
  createSnapshot: (label: string, source?: 'manual' | 'ai' | 'import' | 'system') => string;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  getDiff: (snapshotId?: string) => DiffSummary | null;
  snapshotHistory: { id: string; label: string; timestamp: number; source: string }[];

  // Import Graph
  getImportGraph: () => ImportGraph;
  getAffected: (path: string) => AffectedFiles;
  getGraphSummary: () => string;

  // Monaco Sync
  syncMonaco: (monaco: MonacoAPI) => void;
  monacoSync: typeof monacoVFSSync;

  // Enhanced file operations (with event emissions)
  updateFileContentTracked: (id: string, content: string, source?: 'user' | 'ai') => void;
  importFilesTracked: (files: Record<string, string>, source?: 'ai' | 'import' | 'template') => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useVFSEnhanced(): UseVFSEnhancedReturn {
  const vfs = useVirtualFileSystem();
  const prevNodesRef = useRef<VirtualNode[]>([]);
  const graphCacheRef = useRef<{ files: Record<string, string>; graph: ImportGraph } | null>(null);

  // --- Event-emitting wrappers ---

  const updateFileContentTracked = useCallback((id: string, content: string, source: 'user' | 'ai' = 'user') => {
    // Find current content for diff
    const file = vfs.nodes.find(n => n.id === id && n.type === 'file') as VirtualFile | undefined;
    const previousContent = file?.content;
    const path = file?.path || '';

    vfs.updateFileContent(id, content);

    vfsEventBus.emit<FileEvent>('file:updated', {
      path,
      content,
      previousContent,
      source,
    });
  }, [vfs]);

  const importFilesTracked = useCallback((files: Record<string, string>, source: 'ai' | 'import' | 'template' = 'import') => {
    const filePaths = Object.keys(files);

    // Create snapshot before AI edits
    if (source === 'ai') {
      const currentFiles = vfs.getSandpackFiles();
      vfsSnapshotManager.createSnapshot(currentFiles, `Before AI edit (${filePaths.length} files)`, 'ai');
      vfsEventBus.emit('ai:apply:start', { files: filePaths });
    }

    vfsEventBus.emit<BatchEvent>('batch:import', {
      files: filePaths,
      source,
      totalFiles: filePaths.length,
    });

    // Pause events during batch import to avoid flooding
    vfsEventBus.pause();
    vfs.importFiles(files);
    vfsEventBus.resume();

    vfsEventBus.emit<BatchEvent>('batch:complete', {
      files: filePaths,
      source,
      totalFiles: filePaths.length,
    });

    if (source === 'ai') {
      vfsEventBus.emit('ai:apply:complete', { filesWritten: filePaths });
    }

    // Invalidate graph cache
    graphCacheRef.current = null;
  }, [vfs]);

  // --- Snapshot / Undo-Redo ---

  const createSnapshot = useCallback((label: string, source: 'manual' | 'ai' | 'import' | 'system' = 'manual') => {
    const files = vfs.getSandpackFiles();
    const snap = vfsSnapshotManager.createSnapshot(files, label, source);
    vfsEventBus.emit<SnapshotEvent>('snapshot:created', {
      snapshotId: snap.id,
      label,
      fileCount: Object.keys(files).length,
    });
    return snap.id;
  }, [vfs]);

  const undo = useCallback((): boolean => {
    const snapshot = vfsSnapshotManager.undo();
    if (!snapshot) return false;

    vfs.importFiles(snapshot.files);
    vfsEventBus.emit<SnapshotEvent>('snapshot:restored', {
      snapshotId: snapshot.id,
      label: snapshot.label,
      fileCount: Object.keys(snapshot.files).length,
    });
    graphCacheRef.current = null;
    return true;
  }, [vfs]);

  const redo = useCallback((): boolean => {
    const snapshot = vfsSnapshotManager.redo();
    if (!snapshot) return false;

    vfs.importFiles(snapshot.files);
    vfsEventBus.emit<SnapshotEvent>('snapshot:restored', {
      snapshotId: snapshot.id,
      label: snapshot.label,
      fileCount: Object.keys(snapshot.files).length,
    });
    graphCacheRef.current = null;
    return true;
  }, [vfs]);

  const getDiff = useCallback((snapshotId?: string): DiffSummary | null => {
    const currentFiles = vfs.getSandpackFiles();
    if (snapshotId) {
      return vfsSnapshotManager.diffFromSnapshot(snapshotId, currentFiles);
    }
    return vfsSnapshotManager.diffFromPrevious(currentFiles);
  }, [vfs]);

  const snapshotHistory = useMemo(() => {
    return vfsSnapshotManager.listSnapshots().map(s => ({
      id: s.id,
      label: s.label,
      timestamp: s.timestamp,
      source: s.source,
    }));
  }, [vfs.nodes]);

  // --- Import Graph (cached) ---

  const getImportGraph = useCallback((): ImportGraph => {
    const files = vfs.getSandpackFiles();
    // Use cache if files haven't changed
    if (graphCacheRef.current && JSON.stringify(Object.keys(files)) === JSON.stringify(Object.keys(graphCacheRef.current.files))) {
      return graphCacheRef.current.graph;
    }
    const graph = analyzeImportGraph(files);
    graphCacheRef.current = { files, graph };
    return graph;
  }, [vfs]);

  const getAffected = useCallback((path: string): AffectedFiles => {
    return getAffectedFiles(path, vfs.getSandpackFiles());
  }, [vfs]);

  const getGraphSummary = useCallback((): string => {
    return getGraphSummaryForAI(vfs.getSandpackFiles());
  }, [vfs]);

  // --- Monaco Sync ---

  const syncMonaco = useCallback((monaco: MonacoAPI) => {
    const files = vfs.getSandpackFiles();
    monacoVFSSync.syncAll(files, monaco);
  }, [vfs]);

  // --- Track node changes for event emissions ---
  useEffect(() => {
    const prevNodes = prevNodesRef.current;
    const currentNodes = vfs.nodes;

    if (prevNodes !== currentNodes && prevNodes.length > 0) {
      // Detect individual file changes
      const prevFiles = new Map(prevNodes.filter(n => n.type === 'file').map(n => [(n as VirtualFile).path, n as VirtualFile]));
      const currFiles = new Map(currentNodes.filter(n => n.type === 'file').map(n => [(n as VirtualFile).path, n as VirtualFile]));

      // New files
      for (const [path, file] of currFiles) {
        if (path && !prevFiles.has(path)) {
          vfsEventBus.emit<FileEvent>('file:created', { path, content: file.content, source: 'system' });
        }
      }

      // Deleted files
      for (const [path] of prevFiles) {
        if (path && !currFiles.has(path)) {
          vfsEventBus.emit<FileEvent>('file:deleted', { path, source: 'system' });
        }
      }
    }

    prevNodesRef.current = currentNodes;
  }, [vfs.nodes]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      monacoVFSSync.dispose();
    };
  }, []);

  return useMemo(() => ({
    ...vfs,

    // Event Bus
    eventBus: vfsEventBus,

    // Snapshots
    createSnapshot,
    undo,
    redo,
    canUndo: vfsSnapshotManager.canUndo,
    canRedo: vfsSnapshotManager.canRedo,
    undoCount: vfsSnapshotManager.undoCount,
    redoCount: vfsSnapshotManager.redoCount,
    getDiff,
    snapshotHistory,

    // Import Graph
    getImportGraph,
    getAffected,
    getGraphSummary,

    // Monaco Sync
    syncMonaco,
    monacoSync: monacoVFSSync,

    // Enhanced operations
    updateFileContentTracked,
    importFilesTracked,
  }), [
    vfs,
    createSnapshot, undo, redo, getDiff, snapshotHistory,
    getImportGraph, getAffected, getGraphSummary,
    syncMonaco,
    updateFileContentTracked, importFilesTracked,
  ]);
}
