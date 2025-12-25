
export interface SimParams {
  wavelength: number;    // 波长 λ (mm)
  hornAperture: number;  // 喇叭口径 Dx (mm)
  distL1: number;        // 喇叭到缝距离 L1 (mm)
  distL2: number;        // 缝到接收器距离 L2 (mm)
  slitWidth: number;     // 缝宽 a (mm)
  screenWidth: number;   // 遮挡屏总宽度 W (mm)
  enableEdges: boolean;  // 是否考虑板边缘绕射 (验证实验)
}

export interface DataPoint {
  theta: number;
  intensity: number;
}
