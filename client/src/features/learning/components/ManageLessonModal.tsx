import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Link2,
  Code,
  Layers,
  Sparkles,
  Play,
  FileCode,
  BookOpen,
  Upload,
  UploadCloud,
  CheckCircle2,
  Loader2,
  FolderUp,
  FileUp,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../services/api.js';
import { ILesson, IModule } from '../../../types/index.js';
import { formatEmbedUrl, isDirectVideoUrl, formatFileSize } from '../../../utils/mediaUtils.js';

interface ManageLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (lesson: ILesson, isNew: boolean) => void;
  modules: IModule[];
  initialModuleId?: string;
  lessonToEdit?: ILesson | null;
}

export const ManageLessonModal: React.FC<ManageLessonModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  modules,
  initialModuleId,
  lessonToEdit,
}) => {
  const isEditing = !!lessonToEdit;

  const [moduleId, setModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'document' | 'pdf' | 'presentation' | 'text' | 'external'>('video');
  const [contentUrl, setContentUrl] = useState('');
  const [videoSourceMode, setVideoSourceMode] = useState<'upload' | 'url'>('upload');
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState<{ fileName: string; sizeBytes?: number } | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [bodyText, setBodyText] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [order, setOrder] = useState(1);
  const [resources, setResources] = useState<{ title: string; url: string; isDeviceUpload?: boolean }[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeTitle, setCodeTitle] = useState('');
  const [previewVideo, setPreviewVideo] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hidden file inputs
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (lessonToEdit) {
      const modId =
        typeof lessonToEdit.module === 'string'
          ? lessonToEdit.module
          : (lessonToEdit.module as any)?._id || '';
      setModuleId(modId);
      setTitle(lessonToEdit.title || '');
      setDescription(lessonToEdit.description || '');
      setContentType(lessonToEdit.contentType || 'video');
      const curUrl = lessonToEdit.contentUrl || '';
      setContentUrl(curUrl);

      // Determine video source mode
      if (curUrl.startsWith('/uploads/videos/')) {
        setVideoSourceMode('upload');
        setUploadedVideoInfo({ fileName: curUrl.split('/').pop() || 'Uploaded Video' });
      } else {
        setVideoSourceMode(curUrl ? 'url' : 'upload');
        setUploadedVideoInfo(null);
      }

      setBodyText(lessonToEdit.bodyText || '');
      setDurationMinutes(lessonToEdit.durationMinutes || 30);
      setOrder(lessonToEdit.order || 1);

      const mappedResources = (lessonToEdit.resources || []).map((r) => ({
        title: r.title,
        url: r.url,
        isDeviceUpload: r.url.startsWith('/uploads/documents/'),
      }));
      setResources(mappedResources);

      if (lessonToEdit.codeSnippets && lessonToEdit.codeSnippets.length > 0) {
        setCodeLanguage(lessonToEdit.codeSnippets[0].language || 'typescript');
        setCodeSnippet(lessonToEdit.codeSnippets[0].code || '');
        setCodeTitle(lessonToEdit.codeSnippets[0].title || '');
      } else {
        setCodeLanguage('typescript');
        setCodeSnippet('');
        setCodeTitle('');
      }
    } else {
      setModuleId(initialModuleId || (modules[0]?._id ?? ''));
      setTitle('');
      setDescription('');
      setContentType('video');
      setContentUrl('');
      setVideoSourceMode('upload');
      setUploadedVideoInfo(null);
      setBodyText('');
      setDurationMinutes(30);
      setOrder(1);
      setResources([]);
      setCodeLanguage('typescript');
      setCodeSnippet('');
      setCodeTitle('');
    }
    setPreviewVideo(false);
  }, [lessonToEdit, initialModuleId, modules, isOpen]);

  if (!isOpen) return null;

  // Handle uploading video file from device
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingVideo(true);
    try {
      const res = await api.post('/curriculum/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        const fileData = res.data.data;
        setContentUrl(fileData.fileUrl);
        setUploadedVideoInfo({
          fileName: file.name,
          sizeBytes: file.size,
        });
        setContentType('video');
        setPreviewVideo(true);
        toast.success(`Video "${file.name}" uploaded successfully from device!`);
      }
    } catch (err: any) {
      console.error('Error uploading video:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload video from device.');
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Handle uploading document file(s) from device
  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingDocs(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/curriculum/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success) {
          const fileData = res.data.data;
          setResources((prev) => [
            ...prev,
            {
              title: file.name,
              url: fileData.fileUrl,
              isDeviceUpload: true,
            },
          ]);
          toast.success(`Document "${file.name}" uploaded from device!`);
        }
      }
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload document from device.');
    } finally {
      setUploadingDocs(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  // Add manual web link row
  const handleAddManualResource = () => {
    setResources([...resources, { title: '', url: '', isDeviceUpload: false }]);
  };

  const handleUpdateResource = (idx: number, field: 'title' | 'url', val: string) => {
    const updated = [...resources];
    updated[idx][field] = val;
    setResources(updated);
  };

  const handleRemoveResource = (idx: number) => {
    setResources(resources.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Topic / Lesson title is required.');
      return;
    }

    if (!moduleId) {
      toast.error('Please select a target module.');
      return;
    }

    setSaving(true);
    try {
      // Filter out empty resources
      const validResources = resources
        .filter((r) => r.title.trim() && r.url.trim())
        .map((r) => ({ title: r.title.trim(), url: r.url.trim() }));

      const payload: any = {
        module: moduleId,
        title: title.trim(),
        description: description.trim(),
        contentType,
        contentUrl: contentUrl.trim(),
        bodyText: bodyText.trim(),
        durationMinutes: Number(durationMinutes) || 30,
        order: Number(order) || 1,
        resources: validResources,
      };

      if (codeSnippet.trim()) {
        payload.codeSnippets = [
          {
            language: codeLanguage,
            code: codeSnippet.trim(),
            title: codeTitle.trim() || `${title} Implementation Example`,
          },
        ];
      }

      let res;
      if (isEditing && lessonToEdit) {
        res = await api.put(`/curriculum/lessons/${lessonToEdit._id}`, payload);
        toast.success(`Topic "${title}" updated successfully!`);
        onSaved(res.data.data, false);
      } else {
        res = await api.post('/curriculum/lessons', payload);
        toast.success(`New Topic "${title}" created and published!`);
        onSaved(res.data.data, true);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      toast.error(err?.response?.data?.message || 'Failed to save lesson content.');
    } finally {
      setSaving(false);
    }
  };

  const embedUrl = formatEmbedUrl(contentUrl);
  const isDirect = isDirectVideoUrl(contentUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Hidden Device Upload Inputs */}
        <input
          type="file"
          ref={videoFileInputRef}
          onChange={handleVideoFileChange}
          accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
          className="hidden"
        />
        <input
          type="file"
          ref={docFileInputRef}
          onChange={handleDocFileChange}
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.zip,.rar,.csv,.xlsx,image/*"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F8F87] text-white flex items-center justify-center shadow-sm">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {isEditing ? 'Edit Topic, Video & Documents' : 'Add New Topic & Learning Materials'}
              </h3>
              <p className="text-xs text-slate-500">
                Upload videos & documents directly from your device, or attach web URLs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Module & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0F8F87]" />
                Target Module / Week <span className="text-rose-500">*</span>
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800 font-medium"
              >
                <option value="" disabled>
                  Select Module / Curriculum Week
                </option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    M{m.monthNumber} • W{m.weekNumber}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Estimated Duration</label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-10 px-3 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Topic Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0F8F87]" />
              Topic / Lesson Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Asynchronous Microservices & RabbitMQ Architecture"
              required
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800 font-semibold"
            />
          </div>

          {/* Summary / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Topic Summary / Learning Goal</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of what students will accomplish in this topic"
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
            />
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              TOPIC VIDEO LECTURE SECTION (Device Upload + URL Mode)
          ══════════════════════════════════════════════════════════════════ */}
          <div className="p-5 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/40 via-white to-slate-50 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0F8F87] text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Topic Video Lecture</h4>
                  <p className="text-[11px] text-slate-500">Upload video from your device or paste a streaming URL</p>
                </div>
              </div>

              {/* Toggle Mode: Upload from Device vs Paste URL */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setVideoSourceMode('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    videoSourceMode === 'upload'
                      ? 'bg-white text-[#0F8F87] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    videoSourceMode === 'url'
                      ? 'bg-white text-[#0F8F87] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Paste URL</span>
                </button>
              </div>
            </div>

            {/* MODE 1: Upload from Device */}
            {videoSourceMode === 'upload' && (
              <div className="space-y-3">
                {contentUrl && isDirect ? (
                  /* Video Already Uploaded State */
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {uploadedVideoInfo?.fileName || contentUrl.split('/').pop()}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                          <span>Video ready on server</span>
                          {uploadedVideoInfo?.sizeBytes && (
                            <span>• {formatFileSize(uploadedVideoInfo.sizeBytes)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(!previewVideo)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{previewVideo ? 'Hide Player' : 'Preview'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setContentUrl('');
                          setUploadedVideoInfo(null);
                          setPreviewVideo(false);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone Box */
                  <div
                    onClick={() => !uploadingVideo && videoFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      uploadingVideo
                        ? 'border-[#0F8F87] bg-teal-50/50 cursor-wait'
                        : 'border-teal-300/80 bg-white hover:border-[#0F8F87] hover:bg-teal-50/30'
                    }`}
                  >
                    {uploadingVideo ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 text-[#0F8F87] animate-spin" />
                        <p className="text-xs font-bold text-[#0F8F87]">
                          Uploading video from your device to server...
                        </p>
                        <p className="text-[11px] text-slate-400">Please keep this window open</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8F87] flex items-center justify-center">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">
                            Click to select a video file from your device
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Supports MP4, WebM, MOV, MKV files up to 500 MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#0F8F87] text-white text-xs font-bold shadow-2xs hover:bg-[#0D7A73] transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Browse Device Files</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: Paste URL */}
            {videoSourceMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => {
                    setContentUrl(e.target.value);
                    setUploadedVideoInfo(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/... or .mp4 URL"
                  className="w-full h-10 px-3.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] text-slate-800"
                />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Supports YouTube, Vimeo, or external cloud video streaming URLs.
                  </span>
                  {contentUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(!previewVideo)}
                      className="font-bold text-[#0F8F87] hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {previewVideo ? 'Hide Preview' : 'Test Video Preview'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live Video Preview Player Box */}
            {previewVideo && contentUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 mt-3 shadow-inner">
                {isDirect ? (
                  <video src={contentUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <iframe
                    src={embedUrl}
                    title="Video Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}
          </div>

          {/* Topic Documentation & Study Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0F8F87]" />
                Topic Documentation & Study Notes
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Rendered below player</span>
            </div>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Provide deep-dive architecture notes, step-by-step walkthroughs, terminal instructions, or mentor insights..."
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800 font-normal leading-relaxed"
            />
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              DOCUMENTS & REFERENCE RESOURCES (Device Upload + Web Links)
          ══════════════════════════════════════════════════════════════════ */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileUp className="w-4 h-4 text-[#0F8F87]" />
                  Documents & Reference Resources
                </h4>
                <p className="text-[11px] text-slate-400">
                  Upload PDF blueprints, slides, or cheatsheets from device, or link GitHub repos.
                </p>
              </div>

              {/* Action Buttons: Device Upload & Add Web Link */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  disabled={uploadingDocs}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-[#0F8F87] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  {uploadingDocs ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingDocs ? 'Uploading...' : 'Upload from Device'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddManualResource}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#0F8F87] text-slate-700 hover:text-[#0F8F87] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Web Link</span>
                </button>
              </div>
            </div>

            {/* Resource Items List */}
            {resources.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">No documents or reference files attached yet</p>
                <p className="text-[11px] text-slate-400">
                  Click &quot;Upload from Device&quot; to pick PDF/DOC files, or &quot;Add Web Link&quot; to link an external repo.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resources.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F8F87] flex items-center justify-center flex-shrink-0">
                        {res.isDeviceUpload ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Document Title (e.g. System Blueprint PDF)"
                        value={res.title}
                        onChange={(e) => handleUpdateResource(idx, 'title', e.target.value)}
                        className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F8F87] text-slate-800 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="File URL or Link"
                        value={res.url}
                        onChange={(e) => handleUpdateResource(idx, 'url', e.target.value)}
                        className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F8F87] text-slate-800"
                      />

                      {res.isDeviceUpload && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                          Device File
                        </span>
                      )}

                      {res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition flex-shrink-0"
                          title="Open Document"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveResource(idx)}
                        className="w-9 h-9 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition flex-shrink-0"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hands-on Code Architecture Example (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#0F8F87]" />
                Hands-on Code Snippet Example (Optional)
              </label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="h-8 px-2 text-[11px] bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash / Shell</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Paste boilerplate, configuration, or schema code here..."
              className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingVideo || uploadingDocs}
              className="px-5 py-2.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Publishing Changes...'
                  : isEditing
                  ? 'Save Topic & Media'
                  : 'Publish New Topic'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
