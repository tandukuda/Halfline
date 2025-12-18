"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sliders } from 'lucide-react';

export default function HalftoneTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [lineCount, setLineCount] = useState(70);
  const [maxThickness, setMaxThickness] = useState(6);
  const [minThickness, setMinThickness] = useState(0.2);
  const [contrast, setContrast] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 800;
      const scale = width / image.width;
      canvas.width = width;
      canvas.height = image.height * scale;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Apply contrast filter to image before sampling
      tempCtx.filter = `contrast(${contrast})`;
      tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixelData = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;

      const spacing = canvas.width / lineCount;
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += 2) {
          const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
          const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 765;
          if (brightness < 0.99) {
            const thickness = (1 - brightness) * (maxThickness - minThickness) + minThickness;
            ctx.fillRect(x - thickness / 2, y, thickness, 2.2);
          }
        }
      }
    }
  }, [image, lineCount, maxThickness, minThickness, contrast]);

  const exportPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'halftone-design.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const exportSVG = () => {
    if (!image || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const spacing = width / lineCount;
    
    let svgParts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
      `<rect width="100%" height="100%" fill="white"/>`
    ];

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.filter = `contrast(${contrast})`;
    tempCtx.drawImage(image, 0, 0, width, height);
    const pixelData = tempCtx.getImageData(0, 0, width, height).data;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += 4) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4;
        const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 765;
        if (brightness < 0.98) {
          const thickness = (1 - brightness) * (maxThickness - minThickness) + minThickness;
          svgParts.push(`<rect x="${(x - thickness / 2).toFixed(2)}" y="${y}" width="${thickness.toFixed(2)}" height="4.2" fill="black"/>`);
        }
      }
    }
    
    svgParts.push(`</svg>`);
    const blob = new Blob([svgParts.join('')], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'halftone-design.svg';
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-10 flex flex-col items-center font-sans">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Controls Sidebar */}
        <div className="w-full md:w-80 p-8 bg-slate-50 border-r border-slate-200 space-y-8">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Halftone Lines</h1>
            <p className="text-sm text-slate-500">Custom thickness vertical tool</p>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 transition-colors bg-white">
            <input type="file" onChange={handleUpload} className="hidden" id="upload" accept="image/*" />
            <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="text-blue-500" size={24} />
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Load Image</span>
            </label>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Density</span><span>{lineCount}</span>
              </div>
              <input type="range" min="20" max="150" value={lineCount} onChange={(e) => setLineCount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Max Thickness</span><span>{maxThickness}px</span>
              </div>
              <input type="range" min="1" max="15" step="0.5" value={maxThickness} onChange={(e) => setMaxThickness(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Contrast</span><span>{contrast}x</span>
              </div>
              <input type="range" min="0.5" max="2.5" step="0.1" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button onClick={exportSVG} disabled={!image} className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-700 disabled:opacity-30 transition-all">
              <Download size={18} /> Export SVG
            </button>
            <button onClick={exportPNG} disabled={!image} className="flex items-center justify-center gap-2 border-2 border-slate-800 text-slate-800 py-2 rounded-lg font-bold hover:bg-slate-100 disabled:opacity-30 transition-all text-sm">
              Download PNG
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-200 p-6 flex items-center justify-center min-h-[500px]">
          {image ? (
            <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl bg-white" />
          ) : (
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Sliders className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Ready for your image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}