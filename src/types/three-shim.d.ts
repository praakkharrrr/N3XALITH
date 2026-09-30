declare module "three" {
  const THREE: any;
  export = THREE;
}

declare module "three/examples/jsm/controls/OrbitControls.js" {
  export class OrbitControls {
    constructor(object: any, domElement?: HTMLElement);
    enableDamping: boolean;
    dampingFactor: number;
    maxPolarAngle: number;
    minDistance: number;
    maxDistance: number;
    target: { set: (x: number, y: number, z: number) => void };
    update: () => void;
    dispose: () => void;
  }
}
