import React from 'react';
import { Image as ImageIcon, Upload, Save } from 'lucide-react';

export default function AvatarCard({
  handleAvatarFileUpload,
  avatarInputUrl,
  setAvatarInputUrl,
  handleSaveAvatarUrl,
  settings
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
      <div className="border-b border-[#30363d] pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#3fb950]" />
          Avatar / Profile Picture
        </h2>
        {settings.showHeadlines && (
          <p className="text-xs text-[#8b949e] mt-1">Upload profile image file directly to Docker storage or link via image URL.</p>
        )}
      </div>

      <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl space-y-3.5">
        <p className="text-xs text-[#8b949e]">Upload an image file directly to Docker storage or link via image URL.</p>
        
        {/* Option 1: File Upload */}
        <div>
          <label className="w-full cursor-pointer bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-[#30363d] flex items-center justify-center gap-2 transition shadow-sm">
            <Upload className="w-4 h-4 text-[#3fb950]" /> Upload Image File (.png, .jpg, .webp)
            <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
          </label>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-semibold">
          <div className="flex-1 h-px bg-[#30363d]"></div>
          <span>OR PASTE IMAGE URL</span>
          <div className="flex-1 h-px bg-[#30363d]"></div>
        </div>

        {/* Option 2: Image URL with Save Link Button */}
        <div className="flex items-center gap-2">
          <input 
            type="url"
            placeholder="https://example.com/avatar.png"
            value={avatarInputUrl}
            onChange={e => setAvatarInputUrl(e.target.value)}
            className="flex-1 min-w-0 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
          />
          <button 
            type="button"
            onClick={handleSaveAvatarUrl}
            className="whitespace-nowrap bg-[#238636] hover:bg-[#2ea043] text-white text-xs px-4 py-2 rounded-lg border border-[#238636] transition font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Link
          </button>
        </div>
      </div>
    </div>
  );
}
