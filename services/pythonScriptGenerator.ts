
export const getPythonScript = () => {
  return `import numpy as np
import matplotlib.pyplot as plt

def solve_finite_screen_diffraction():
    """
    有限尺寸遮挡屏微波干涉模拟 (Slit Wave + Edge Waves)
    """
    # --- 参数设置 ---
    WL = 32.0          # 波长 (mm)
    A = 40.0           # 缝宽 (mm)
    W = 300.0          # 板宽 (mm)
    L1 = 600.0         # 喇叭到板 (mm)
    L2 = 600.0         # 板到接收器 (mm)
    ENABLE_EDGES = True
    
    K = 2 * np.pi / WL
    ANGLES = np.linspace(-60, 60, 241)
    
    # 缝隙采样
    x_slit = np.linspace(-A/2, A/2, 200)
    # 边缘位置
    x_edges = np.array([-W/2, W/2])
    
    intensities = []
    
    for deg in ANGLES:
        rad = np.deg2rad(deg)
        det_x = L2 * np.sin(rad)
        det_z = L2 * np.cos(rad)
        
        # 1. 计算缝隙波 E_slit
        r1_s = np.sqrt(L1**2 + x_slit**2)
        r2_s = np.sqrt(det_z**2 + (det_x - x_slit)**2)
        phase_s = K * (r1_s + r2_s)
        amp_s = 1.0 / (np.sqrt(r1_s) * np.sqrt(r2_s))
        e_slit = np.sum(amp_s * np.exp(1j * phase_s))
        
        # 2. 计算边缘波 E_edge
        e_edge = 0
        if ENABLE_EDGES:
            r1_e = np.sqrt(L1**2 + x_edges**2)
            r2_e = np.sqrt(det_z**2 + (det_x - x_edges)**2)
            # 边缘相位偏移 pi*0.85 (根据实验拟合)
            phase_e = K * (r1_e + r2_e) + np.pi * 0.85
            amp_e = 1.8 / (np.sqrt(r1_e) * np.sqrt(r2_e))
            e_edge = np.sum(amp_e * np.exp(1j * phase_e))
            
        total_field = e_slit + e_edge
        intensities.append(np.abs(total_field)**2)
        
    # 绘图
    y = np.array(intensities) / np.max(intensities)
    plt.figure(figsize=(10, 5), dpi=100)
    plt.plot(ANGLES, y, color='#6366f1', lw=2)
    plt.title(f'Finite Screen Interference (a={A}mm, W={W}mm)')
    plt.xlabel('Angle (deg)')
    plt.ylabel('Normalized Intensity')
    plt.grid(True, alpha=0.3)
    plt.show()

if __name__ == "__main__":
    solve_finite_screen_diffraction()
`;
};
