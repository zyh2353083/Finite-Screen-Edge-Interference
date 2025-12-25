
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { Settings, Info, ShieldAlert, Box, Ruler, Waves, ZapOff } from 'lucide-react';
import { simulateDiffraction } from './services/physicsEngine';
import { getPythonScript } from './services/pythonScriptGenerator';
import { SimParams, DataPoint } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SimParams>({
    wavelength: 32.0,
    hornAperture: 140,
    distL1: 600,
    distL2: 600,
    slitWidth: 40,
    screenWidth: 300, // 30cm 板宽
    enableEdges: true // 默认开启边缘效应
  });

  const [simData, setSimData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const angles = Array.from({ length: 121 }, (_, i) => -60 + i * 1);
    const data = simulateDiffraction(params, angles);
    setSimData(data);
  }, [params]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-900 text-white px-8 py-6 shadow-xl border-b border-indigo-500/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Box className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">有限尺寸屏绕射模拟系统</h1>
              <p className="text-[10px] text-indigo-300 font-mono tracking-widest uppercase">Finite Screen Edge Interference Model v2.0</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${params.enableEdges ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}>
              {params.enableEdges ? "⚠️ 边缘绕射干扰已激活" : "✅ 边缘已屏蔽 (理想模式)"}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 grid grid-cols-12 gap-6">
        {/* 控制面板 */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Settings size={14} className="text-indigo-500" /> 实验装置调节
            </h2>
            
            <div className="space-y-6">
              <ParamControl 
                label="单缝宽度 a (mm)" value={params.slitWidth} min={10} max={150} step={1}
                onChange={v => setParams({...params, slitWidth: v})} 
              />
              <ParamControl 
                label="遮挡板总宽 W (mm)" value={params.screenWidth} min={100} max={600} step={10}
                onChange={v => setParams({...params, screenWidth: v})} 
              />
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">边缘波屏蔽 (验证 1)</span>
                  <button 
                    onClick={() => setParams({...params, enableEdges: !params.enableEdges})}
                    className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${!params.enableEdges ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {!params.enableEdges ? "已覆盖吸波材料" : "裸露板边缘"}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 italic">模拟在板边缘包裹吸波材料，消除边缘绕射波。</p>
              </div>
            </div>
          </section>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-indigo-400">
                <ShieldAlert size={16} /> 物理现象诊断
              </h3>
              <div className="text-[11px] space-y-3 text-slate-300 leading-relaxed">
                <p>
                  <span className="text-white font-bold">40mm 凹陷之谜：</span> 
                  此时通过缝隙的能量较弱，与绕过板边缘（{params.screenWidth}mm）的绕射波振幅接近。若两者相位相反，轴线将出现深凹陷。
                </p>
                <p>
                  <span className="text-white font-bold">80mm 回归单峰：</span> 
                  缝隙宽度增加后，主波束能量占据绝对优势，掩盖了边缘干扰，图样向 sinc² 函数回归。
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Waves size={120} />
            </div>
          </div>
        </aside>

        {/* 主绘图区 */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                衍射强度分布分布 
                {params.slitWidth === 40 && params.enableEdges && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-3 py-1 rounded-full animate-pulse font-bold">检测到干涉凹陷</span>
                )}
              </h2>
            </div>

            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simData}>
                  <defs>
                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="theta" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} label={{value: '探测器转角 (deg)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px'}}
                  />
                  <ReferenceLine x={0} stroke="#e2e8f0" strokeDasharray="5 5" />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorIntensity)" 
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <ZapOff className="text-indigo-600 mb-3" size={24} />
              <h4 className="font-bold text-sm text-indigo-900 mb-2">验证 1：屏蔽效应</h4>
              <p className="text-[10px] text-indigo-700/70 leading-relaxed">尝试“关闭边缘绕射”，你会发现 40mm 的凹陷立即消失。这证明了凹陷不是来自缝隙，而是边缘。 </p>
            </div>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
              <Ruler className="text-amber-600 mb-3" size={24} />
              <h4 className="font-bold text-sm text-amber-900 mb-2">验证 2：板尺寸调节</h4>
              <p className="text-[10px] text-amber-700/70 leading-relaxed">改变板宽 W，干涉相位会随程差移动。你会观察到中心点强度随 W 剧烈摆动。 </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <Info className="text-slate-600 mb-3" size={24} />
              <h4 className="font-bold text-sm text-slate-900 mb-2">研究价值</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">该模拟揭示了真实工程中“有限大遮挡物”带来的边缘干扰，是傅里叶光学与微波天线交叉的典型案例。 </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ParamControl: React.FC<{label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void}> = ({label, value, min, max, step, onChange}) => (
  <div className="group">
    <div className="flex justify-between items-center mb-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 group-hover:bg-slate-200 transition-colors"
    />
  </div>
);

export default App;
