import { useRef, useState, type DragEvent } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onSave: (dataUrl: string) => void;
  size?: number;
}

export default function AvatarUpload({ currentAvatar, userName, onSave, size = 96 }: AvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSave = () => {
    if (preview) {
      onSave(preview);
      setPreview(null);
    }
  };

  const imageSrc = preview || currentAvatar;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: dragOver ? 'rgba(168,255,96,.12)' : 'rgba(255,255,255,.06)',
          border: `2px dashed ${dragOver ? '#a8ff60' : imageSrc ? 'transparent' : 'rgba(245,240,231,.24)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', cursor: 'pointer', position: 'relative',
          transition: 'border-color .2s, background .2s',
        }}
        title="Click or drag to upload a profile image"
      >
        {imageSrc ? (
          <>
            <img src={imageSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {preview && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={20} style={{ color: '#a8ff60' }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(245,240,231,.4)' }}>
            <Upload size={20} style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', display: 'block' }}>{initials}</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />

      {preview && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="vp-btn sm primary" type="button" onClick={handleSave}>Save image</button>
          <button className="vp-btn sm" type="button" onClick={() => setPreview(null)}><X size={14} /></button>
        </div>
      )}

      <span className="text-body-xs" style={{ color: 'rgba(245,240,231,.36)', fontFamily: 'monospace' }}>
        Click or drag · PNG, JPG up to 2 MB
      </span>
    </div>
  );
}
