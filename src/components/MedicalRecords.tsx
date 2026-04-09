import React from 'react';
import { FileText, Upload, Download, Trash2, X, File, Loader2, Plus, StickyNote, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

interface MedicalFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
  notes?: string;
  aiSummary?: string;
  storagePath?: string;
}

interface MedicalRecordsProps {
  petName?: string | null;
  onClose: () => void;
}

export default function MedicalRecords({ petName, onClose }: MedicalRecordsProps) {
  const { user } = useAuth();
  const [files, setFiles] = React.useState<MedicalFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<MedicalFile | null>(null);
  const [noteText, setNoteText] = React.useState('');
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!user) return;

    const filesRef = collection(db, 'users', user.uid, 'files');
    const q = petName 
      ? query(filesRef, where('petName', '==', petName))
      : query(filesRef);
      
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData: MedicalFile[] = [];
      snapshot.forEach((doc) => {
        filesData.push({ id: doc.id, ...doc.data() } as MedicalFile);
      });
      // Sort by date descending
      setFiles(filesData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      }));
    }, (error) => {
      console.error("MedicalRecords listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log('No file selected or user not logged in');
      return;
    }

    console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `user_upload/${user.uid}/${fileName}`;
      console.log('Uploading to path:', storagePath);
      
      const storageRef = ref(storage, storagePath);
      
      const metadata = {
        contentType: file.type,
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            setUploadProgress(progress);
          }, 
          (error) => {
            console.error('Upload task failed:', error);
            reject(error);
          }, 
          () => {
            console.log('Upload task completed successfully');
            resolve(null);
          }
        );
      });
      
      const url = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', url);

      const docData = {
        name: file.name,
        storagePath: storagePath,
        url,
        type: file.type,
        size: file.size,
        petName: petName || 'General',
        createdAt: serverTimestamp(),
        notes: '',
        aiSummary: 'AI analysis pending...'
      };
      
      console.log('Adding document to Firestore:', docData);
      const userFileRef = await addDoc(collection(db, 'users', user.uid, 'files'), docData);
      
      // Sync to global files collection
      await setDoc(doc(db, 'files', userFileRef.id), {
        ...docData,
        userId: user.uid
      });
      
      console.log('Firestore documents added successfully');

    } catch (error: any) {
      console.error('Detailed error uploading file:', error);
      if (error.code === 'storage/unauthorized') {
        alert("Permission Denied: Your Firebase Storage rules are blocking the upload. Please update your rules in the Firebase Console to allow access to 'user_upload/{userId}/'.");
      } else {
        alert(`Failed to upload file: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (file: MedicalFile) => {
    if (!user || !window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      // Delete from Storage if path exists
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'users', user.uid, 'files', file.id));
      
      // Delete from global files collection
      try {
        await deleteDoc(doc(db, 'files', file.id));
      } catch (e) {
        console.warn('Global file record not found or could not be deleted');
      }
      
      if (selectedFile?.id === file.id) setSelectedFile(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file.');
    }
  };

  const handleSaveNote = async () => {
    if (!user || !selectedFile) return;
    setIsSavingNote(true);
    try {
      // Update user-specific file
      await updateDoc(doc(db, 'users', user.uid, 'files', selectedFile.id), {
        notes: noteText
      });
      
      // Update global file
      try {
        await updateDoc(doc(db, 'files', selectedFile.id), {
          notes: noteText
        });
      } catch (e) {
        console.warn('Global file record not found or could not be updated');
      }

      setSelectedFile({ ...selectedFile, notes: noteText });
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy">
                {petName ? 'Medical Records' : 'File History'}
              </h2>
              <p className="text-stone-400 text-sm">
                {petName ? (
                  <>Managing records for <span className="text-accent font-bold">{petName}</span></>
                ) : (
                  'View and manage all your uploaded documents'
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-full md:w-1/2 border-r border-stone-100 flex flex-col bg-white">
            <div className="p-6">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full btn-primary py-4 flex items-center justify-center gap-3 shadow-lg shadow-navy/10"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-xs font-mono">{Math.round(uploadProgress)}%</span>
                  </div>
                ) : (
                  <Plus size={20} />
                )}
                {isUploading ? 'Uploading...' : 'Upload New Record'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
              <h3 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-4">History</h3>
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-200">
                    <File size={32} />
                  </div>
                  <p className="text-stone-400 text-sm">No records found for {petName}</p>
                </div>
              ) : (
                files.map((file) => (
                  <div 
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                      setNoteText(file.notes || '');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedFile?.id === file.id 
                        ? 'border-navy bg-navy/5 shadow-sm' 
                        : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        file.type.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-navy truncate">{file.name}</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-2">
                          <span>{formatSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.createdAt?.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="hidden md:flex flex-1 bg-stone-50/30 flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div 
                  key={selectedFile.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-navy">
                        <FileText size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-navy">{selectedFile.name}</h3>
                        <p className="text-stone-400 text-sm">{formatSize(selectedFile.size)} • {selectedFile.type}</p>
                      </div>
                    </div>
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* AI Summary */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 text-accent">
                        <Sparkles size={18} />
                        <h4 className="font-bold text-sm uppercase tracking-wider">AI Summary</h4>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        {selectedFile.aiSummary || 'AI analysis is currently unavailable for this file type.'}
                      </p>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 text-navy">
                        <StickyNote size={18} />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Personal Notes</h4>
                      </div>
                      <textarea 
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your own notes about this record..."
                        className="w-full h-32 p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-navy/10 text-sm resize-none mb-4"
                      />
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSavingNote || noteText === selectedFile.notes}
                        className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingNote ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        Save Notes
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-stone-200 mb-6">
                    <FileText size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Select a Record</h3>
                  <p className="text-stone-400 max-w-xs">
                    Choose a file from the history to view its AI summary and manage your notes.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Save({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
