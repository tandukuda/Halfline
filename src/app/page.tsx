"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Sliders,
  Image as ImageIcon,
  Github,
  Palette,
} from "lucide-react";

export default function HalftoneTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [lineCount, setLineCount] = useState(70);
  const [maxThickness, setMaxThickness] = useState(6);
  const [minThickness, setMinThickness] = useState(0.2);
  const [contrast, setContrast] = useState(1.2);

  const [lineColor, setLineColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = {
    base: "#232136",
    surface: "#2a273f",
    overlay: "#393552",
    muted: "#6e6a86",
    subtle: "#908caa",
    text: "#e0def4",
    love: "#eb6f92",
    gold: "#f6c177",
    rose: "#ea9a97",
    foam: "#9ccfd8",
    pine: "#3e8fb0",
    iris: "#c4a7e7",
  };

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
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = 800;
      const scale = width / image.width;
      canvas.width = width;
      canvas.height = image.height * scale;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = lineColor;

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.filter = `contrast(${contrast}) grayscale(1)`;
      tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixelData = tempCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;

      const spacing = canvas.width / lineCount;
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += 2) {
          const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
          const brightness =
            (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 765;
          if (brightness < 0.99) {
            const thickness =
              (1 - brightness) * (maxThickness - minThickness) + minThickness;
            ctx.fillRect(x - thickness / 2, y, thickness, 2.2);
          }
        }
      }
    }
  }, [
    image,
    lineCount,
    maxThickness,
    minThickness,
    contrast,
    lineColor,
    bgColor,
  ]);

  const exportPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "halfline-art.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const exportSVG = () => {
    if (!image || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const spacing = width / lineCount;

    let svgParts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
      `<rect width="100%" height="100%" fill="${bgColor}"/>`,
    ];

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.filter = `contrast(${contrast}) grayscale(1)`;
    tempCtx.drawImage(image, 0, 0, width, height);
    const pixelData = tempCtx.getImageData(0, 0, width, height).data;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += 4) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4;
        const brightness =
          (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 765;
        if (brightness < 0.98) {
          const thickness =
            (1 - brightness) * (maxThickness - minThickness) + minThickness;
          svgParts.push(
            `<rect x="${(x - thickness / 2).toFixed(2)}" y="${y}" width="${thickness.toFixed(2)}" height="4.2" fill="${lineColor}"/>`,
          );
        }
      }
    }

    svgParts.push(`</svg>`);
    const blob = new Blob([svgParts.join("")], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "halfline-art.svg";
    link.click();
  };

  return (
    <div
      style={{ backgroundColor: colors.base, color: colors.text }}
      className="min-h-screen flex flex-col font-mono text-base"
    >
      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div
          style={{ backgroundColor: colors.surface }}
          className="max-w-7xl w-full rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#393552]"
        >
          {/* Sidebar */}
          <div
            style={{ backgroundColor: colors.overlay }}
            className="w-full md:w-96 p-10 space-y-8 border-r border-[#232136] overflow-y-auto max-h-[90vh]"
          >
            <div>
              <h1
                style={{ color: colors.rose }}
                className="text-3xl font-bold tracking-tighter"
              >
                HALFLINE
              </h1>
              <p
                style={{ color: colors.subtle }}
                className="text-xs uppercase tracking-[0.3em] mt-2"
              >
                Halftone Line Generator
              </p>
            </div>

            <div
              style={{ borderColor: colors.muted }}
              className="p-8 border-2 border-dashed rounded-2xl hover:border-[#ea9a97] transition-all bg-[#232136]/50"
            >
              <input
                type="file"
                onChange={handleUpload}
                className="hidden"
                id="upload"
                accept="image/*"
              />
              <label
                htmlFor="upload"
                className="cursor-pointer flex flex-col items-center gap-4 text-center"
              >
                <Upload style={{ color: colors.foam }} size={32} />
                <span
                  style={{ color: colors.text }}
                  className="text-xs font-bold uppercase tracking-widest"
                >
                  Select Image
                </span>
              </label>
            </div>

            {/* Colors Section */}
            <div className="space-y-4 pt-4">
              <div
                className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
                style={{ color: colors.iris }}
              >
                <Palette size={18} /> Appearance
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Line
                  </span>
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-full h-12 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Background
                  </span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-12 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {[
                {
                  label: "Lines",
                  val: lineCount,
                  set: setLineCount,
                  min: 20,
                  max: 150,
                },
                {
                  label: "Weight",
                  val: maxThickness,
                  set: setMaxThickness,
                  min: 1,
                  max: 15,
                  step: 0.5,
                },
                {
                  label: "Contrast",
                  val: contrast,
                  set: setContrast,
                  min: 0.5,
                  max: 2.5,
                  step: 0.1,
                },
              ].map((slider) => (
                <div key={slider.label} className="space-y-4">
                  <div
                    className="flex justify-between text-xs font-bold uppercase tracking-widest"
                    style={{ color: colors.subtle }}
                  >
                    <span>{slider.label}</span>
                    <span style={{ color: colors.gold }}>{slider.val}</span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step || 1}
                    value={slider.val}
                    onChange={(e) => slider.set(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#eb6f92]"
                    style={{ backgroundColor: colors.base }}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button
                onClick={exportSVG}
                disabled={!image}
                style={{ backgroundColor: colors.pine, color: colors.base }}
                className="w-full py-5 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-20 transition-all text-xs flex items-center justify-center gap-3"
              >
                <Download size={18} /> Export SVG
              </button>
              <button
                onClick={exportPNG}
                disabled={!image}
                style={{ borderColor: colors.pine, color: colors.pine }}
                className="w-full py-5 rounded-xl font-bold uppercase tracking-widest border-2 hover:bg-white/5 disabled:opacity-20 transition-all text-xs flex items-center justify-center gap-3"
              >
                <ImageIcon size={18} /> Export PNG
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-12 flex items-center justify-center bg-[#232136]/40 min-h-[500px]">
            {image ? (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl shadow-2xl border border-black/10"
              />
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <ImageIcon
                  style={{ color: colors.subtle }}
                  size={64}
                  className="mx-auto"
                />
                <p
                  style={{ color: colors.text }}
                  className="text-sm uppercase tracking-[0.5em]"
                >
                  Upload Source
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{ color: colors.muted }}
        className="w-full py-10 text-center text-sm tracking-wide border-t border-[#393552]"
      >
        <div className="flex items-center justify-center gap-3">
          <span>Halfline © 2025</span>
          <span className="opacity-30">|</span>
          <span>
            Made with <span style={{ color: colors.love }}>❤️</span> by{" "}
          </span>
          <a
            href="https://github.com/tandukuda"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ea9a97] transition-colors underline underline-offset-8"
          >
            tandukuda
          </a>
        </div>
      </footer>
    </div>
  );
}
