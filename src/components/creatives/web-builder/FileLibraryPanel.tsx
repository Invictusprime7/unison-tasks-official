/**
 * File Library Panel for Web Builder
 * Browse, upload, and insert files into the canvas with one click
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Image as ImageIcon,
  File,
  FileText,
  FileVideo,
  FileAudio,
  Search,
  Star,
  FolderOpen,
  X,
  Download,
  Trash2,
  Plus,
  Loader2,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { formatDistance } from 'date-fns';

// Define file type based on database schema
type FileRecord = {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  folder_path: string;
  user_id: string | null;
  is_favorite?: boolean;
  created_at: string;
};

interface FileLibraryPanelProps {
  onFileInsert?: (fileUrl: string, fileName: string, mimeType: string) => void;
  onClose?: () => void;
}

export const FileLibraryPanel: React.FC<FileLibraryPanelProps> = ({
  onFileInsert,
  onClose
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents'>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);

  // Fetch files from database
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['file-library', searchQuery, activeTab],
    queryFn: async () => {
      let query = supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })
        .neq('mime_type', 'folder');

      // Filter by search
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Filter by type
      if (activeTab === 'images') {
        query = query.like('mime_type', 'image/%');
      } else if (activeTab === 'videos') {
        query = query.like('mime_type', 'video/%');
      } else if (activeTab === 'documents') {
        query = query.or('mime_type.like.application/%,mime_type.like.text/%');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const filePath = `${userId}/${Date.now()}-${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase.from('files').insert({
          user_id: user?.id || null,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          folder_path: '/web-builder'
        });

        if (dbError) throw dbError;

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast({
        title: 'Upload Complete! 📁',
        description: `${selectedFiles.length} file(s) uploaded successfully`
      });

      setSelectedFiles([]);
      setUploadProgress(0);
      refetch();
    } catch (error) {
      console.error('[FileLibrary] Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file insertion into canvas
  const handleInsertFile = async (file: FileRecord) => {
    try {
      // Get signed URL for the file
      const { data: urlData } = await supabase.storage
        .from('user-files')
        .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get file URL');
      }

      onFileInsert?.(urlData.signedUrl, file.name, file.mime_type);

      toast({
        title: 'File Inserted! ✨',
        description: `${file.name} added to canvas`
      });
    } catch (error) {
      console.error('[FileLibrary] Insert error:', error);
      toast({
        title: 'Insert Failed',
        description: error instanceof Error ? error.message : 'Failed to insert file',
        variant: 'destructive'
      });
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${file.name}"?`)) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('user-files')
        .remove([file.storage_path]);

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      toast({
        title: 'File Deleted',
        description: `${file.name} has been removed`
      });

      refetch();
    } catch (error) {
      console.error('[FileLibrary] Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive'
      });
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (file: FileRecord, e: React.MouseEvent) => {
    e.stopPropagation();

    const { error } = await supabase
      .from('files')
      .update({ is_favorite: !file.is_favorite })
      .eq('id', file.id);

    if (!error) {
      refetch();
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get file type badge color
  const getFileTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Image</Badge>;
    if (mimeType.startsWith('video/')) return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Video</Badge>;
    if (mimeType.startsWith('audio/')) return <Badge variant="secondary" className="bg-green-100 text-green-700">Audio</Badge>;
    return <Badge variant="secondary">Document</Badge>;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">File Library</h2>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700 text-slate-100"
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-4 border-b border-slate-800">
        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files to Upload
              </span>
            </Button>
          </label>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{selectedFiles.length} file(s) selected</span>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              
              {uploading && (
                <Progress value={uploadProgress} className="h-2" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'images' | 'videos' | 'documents')} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 bg-slate-900 border-b border-slate-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-800">All</TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-slate-800">Images</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-slate-800">Videos</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-slate-800">Docs</TabsTrigger>
        </TabsList>

        {/* File Grid */}
        <TabsContent value={activeTab} className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : files && files.length > 0 ? (
                files.map((file) => (
                  <div
                    key={file.id}
                    onMouseEnter={() => setHoveredFileId(file.id)}
                    onMouseLeave={() => setHoveredFileId(null)}
                    onClick={() => handleInsertFile(file)}
                    className="group relative bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg p-3 cursor-pointer transition-all"
                  >
                    {/* Favorite star */}
                    {file.is_favorite && (
                      <Star className="absolute top-2 right-2 w-4 h-4 fill-yellow-400 text-yellow-400" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* File preview or icon */}
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.mime_type.startsWith('image/') ? (
                          <img
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-files/${file.storage_path}`}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-12 h-12 text-slate-400"><svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="text-slate-400">
                            {getFileIcon(file.mime_type)}
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {file.name}
                          </p>
                          {getFileTypeBadge(file.mime_type)}
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDistance(new Date(file.created_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Hover actions */}
                    {hoveredFileId === file.id && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-950/90 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-yellow-400"
                          onClick={(e) => handleToggleFavorite(file, e)}
                          title={file.is_favorite ? 'Unfavorite' : 'Favorite'}
                        >
                          <Star className={`w-4 h-4 ${file.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-400"
                          onClick={(e) => handleDeleteFile(file, e)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-green-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertFile(file);
                          }}
                          title="Insert to canvas"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Insert indicator */}
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none flex items-center justify-center">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to Insert
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400 mb-2">No files found</p>
                  <p className="text-sm text-slate-500">Upload some files to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <p className="text-xs text-slate-500 text-center">
          {files?.length || 0} file{files?.length !== 1 ? 's' : ''} • Click any file to insert into canvas
        </p>
      </div>
    </div>
  );
};
