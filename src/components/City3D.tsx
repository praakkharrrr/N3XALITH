"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ParcelFeature, SceneBuilding } from "@/lib/types";
import { LAND_USE_COLORS } from "@/lib/colors";

export type ViewMode = "city" | "building" | "floor" | "unit";

export type CitySelect = {
  kind: "parcel" | "building" | "floor" | "unit";
  parcelId?: number;
  buildingId?: number;
  floorId?: number;
  unitId?: number;
};

type Props = {
  buildings: SceneBuilding[];
  parcels: ParcelFeature[];
  selectedBuildingId?: number | null;
  selectedFloorId?: number | null;
  selectedUnitId?: number | null;
  viewMode: ViewMode;
  onSelect: (sel: CitySelect) => void;
  className?: string;
};

type PickData = CitySelect & { objectType: string };

function facadeTexture(hex: string, floors: number, seed: number) {
  const cols = 5;
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = Math.max(96, floors * 28);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, canvas.width, 8);
  let n = seed;
  const rand = () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
  const fh = canvas.height / Math.max(floors, 1);
  for (let r = 0; r < floors; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = rand() > 0.32;
      ctx.fillStyle = lit ? "rgba(255, 214, 140, 0.88)" : "rgba(8, 16, 32, 0.55)";
      const x = 10 + c * 30;
      const y = 8 + r * fh;
      ctx.fillRect(x, y + 4, 14, Math.max(10, fh - 12));
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 512, 96);
    ctx.fillStyle = "rgba(6,16,28,0.72)";
    ctx.fillRect(8, 16, 496, 64);
    ctx.strokeStyle = "rgba(45,212,191,0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 16, 496, 64);
    ctx.fillStyle = "#e8f1fb";
    ctx.font = "600 32px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 48);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(10, 1.9, 1);
  sprite.position.y = 2;
  return sprite;
}

export function City3D({
  buildings,
  parcels,
  selectedBuildingId,
  selectedFloorId,
  selectedUnitId,
  viewMode,
  onSelect,
  className,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const stateRef = useRef({
    selectedBuildingId,
    selectedFloorId,
    selectedUnitId,
    viewMode,
  });
  stateRef.current = { selectedBuildingId, selectedFloorId, selectedUnitId, viewMode };

  const apiRef = useRef<{
    apply: () => void;
    focus: (x: number, y: number, z: number) => void;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071422);
    scene.fog = new THREE.Fog(0x071422, 70, 180);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
    camera.position.set(48, 36, 52);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.1));
    // Keep the 3D view responsive on laptops and integrated GPUs.
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 8;
    controls.maxDistance = 120;
    controls.target.set(0, 4, 0);

    scene.add(new THREE.HemisphereLight(0xbcd6ff, 0x1a2a1a, 0.85));
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.15);
    sun.position.set(40, 55, 20);
    sun.castShadow = false;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x5eead4, 0.35);
    rim.position.set(-30, 20, -40);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({ color: 0x0b1c2c, roughness: 0.95, metalness: 0.02 }),
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const grid = new THREE.GridHelper(160, 32, 0x134e4a, 0x0f2a3a);
    grid.position.y = 0.02;
    scene.add(grid);

    const river = new THREE.Mesh(
      new THREE.BoxGeometry(180, 0.2, 14),
      new THREE.MeshStandardMaterial({
        color: 0x0e7490,
        roughness: 0.18,
        metalness: 0.4,
        emissive: 0x083344,
        emissiveIntensity: 0.4,
      }),
    );
    river.position.set(0, 0.05, -52);
    scene.add(river);

    const world = new THREE.Group();
    scene.add(world);

    type Rec = {
      group: any;
      floors: { id: number; mesh: any; baseY: number }[];
      units: { id: number; floorId: number; mesh: any }[];
      unitGroups: Map<number, THREE.Group>;
      edges: any;
      building: SceneBuilding;
    };
    const records = new Map<number, Rec>();
    const pickables: any[] = [];
    const unitMaterials = {
      occupied: new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.45, metalness: 0.05 }),
      rented: new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.45, metalness: 0.05 }),
      vacant: new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.45, metalness: 0.05 }),
    };

    const addTree = (x: number, z: number, scale = 1) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, 1.2 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x5b3a24 }),
      );
      trunk.position.set(x, 0.6 * scale, z);
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(1.1 * scale, 2.4 * scale, 7),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 }),
      );
      crown.position.set(x, 2.1 * scale, z);
      world.add(trunk, crown);
    };

    parcels.forEach((p) => {
      const color = new THREE.Color(LAND_USE_COLORS[p.landUse] ?? "#64748b");
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.16, 18),
        new THREE.MeshStandardMaterial({
          color,
          transparent: true,
          opacity: 0.35,
          roughness: 0.9,
        }),
      );
      pad.position.set(p.posX, 0.08, p.posZ);
      pad.userData = {
        objectType: "parcel",
        kind: "parcel",
        parcelId: p.id,
      } satisfies PickData;
      pickables.push(pad);
      world.add(pad);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(18.05, 0.18, 18.05)),
        new THREE.LineBasicMaterial({ color }),
      );
      edge.position.copy(pad.position);
      world.add(edge);
      if (p.buildingCount === 0) {
        addTree(p.posX - 3, p.posZ - 2, 1.1);
        addTree(p.posX + 2.5, p.posZ + 3, 0.85);
        addTree(p.posX + 4, p.posZ - 3.5, 1);
      }
    });

    buildings.forEach((b) => {
      const group = new THREE.Group();
      group.position.set(b.posX, 0, b.posZ);
      const floorH = Math.max(2.4, b.heightM / Math.max(b.floorsCount, 1));
      const tex = facadeTexture(b.color, b.floorsCount, b.id * 97);
      const floors: Rec["floors"] = [];
      const units: Rec["units"] = [];
      const unitGroups = new Map<number, THREE.Group>();

      b.floors.forEach((f) => {
        const y = f.floorNumber * floorH + floorH / 2;
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xffffff,
          roughness: 0.45,
          metalness: 0.08,
        });
        const floorGeometry = new THREE.BoxGeometry(b.width, floorH * 0.92, b.depth);
        const mesh = new THREE.Mesh(floorGeometry, mat);
        mesh.position.y = y;
        mesh.userData = {
          objectType: "floor",
          kind: "floor",
          parcelId: b.parcelId,
          buildingId: b.id,
          floorId: f.id,
        } satisfies PickData;
        group.add(mesh);
        pickables.push(mesh);
        floors.push({ id: f.id, mesh, baseY: y });

        // Unit meshes are created lazily only when their floor is opened.
        // This keeps the initial city scene light and avoids raycasting hidden meshes.
        const unitGroup = new THREE.Group();
        unitGroup.visible = false;
        unitGroups.set(f.id, unitGroup);
        group.add(unitGroup);
      });

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(b.width * 1.04, 0.35, b.depth * 1.04),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
      );
      roof.position.y = b.floorsCount * floorH + 0.2;
      group.add(roof);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(b.width + 0.2, b.heightM + 0.4, b.depth + 0.2)),
        new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0 }),
      );
      edges.position.y = b.heightM / 2;
      group.add(edges);

      const label = makeLabel(b.name);
      label.position.y = b.heightM + 3.2;
      group.add(label);

      world.add(group);
      records.set(b.id, { group, floors, units, unitGroups, edges, building: b });
    });

    let renderNow = () => renderer.render(scene, camera);
    let frame = 0;
    let interacting = false;

    const startRenderLoop = () => {
      if (interacting) return;
      interacting = true;
      const tick = () => {
        if (!interacting) return;
        controls.update();
        renderNow();
        frame = requestAnimationFrame(tick);
      };
      tick();
    };

    const stopRenderLoop = () => {
      interacting = false;
      cancelAnimationFrame(frame);
      controls.update();
      renderNow();
    };

    controls.addEventListener("start", startRenderLoop);
    controls.addEventListener("end", stopRenderLoop);

    const apply = () => {
      const { selectedBuildingId: bid, selectedFloorId: fid, selectedUnitId: uid, viewMode: mode } =
        stateRef.current;
      records.forEach((rec, id) => {
        const selectedB = bid === id;
        const explode = mode === "floor" && selectedB;
        rec.floors.forEach((fl, idx) => {
          const gap = explode ? 2.4 : 0;
          fl.mesh.position.y = fl.baseY + idx * gap;
          const selectedF = fid === fl.id;
          const mat = fl.mesh.material as any;
          mat.transparent = true;
          if (!bid) {
            mat.opacity = 1;
            mat.emissive = new THREE.Color(0x000000);
          } else if (!selectedB) {
            mat.opacity = 0.18;
            mat.emissive = new THREE.Color(0x000000);
          } else if (mode === "unit" && fid && !selectedF) {
            mat.opacity = 0.15;
          } else if (selectedF) {
            mat.opacity = mode === "unit" ? 0.22 : 1;
            mat.emissive = new THREE.Color(0x134e4a);
            mat.emissiveIntensity = 0.35;
          } else {
            mat.opacity = 1;
            mat.emissive = new THREE.Color(0x000000);
          }
          fl.mesh.visible = !(mode === "unit" && selectedB && selectedF);
        });
        // Only materialize unit meshes for the currently opened floor.
        rec.unitGroups.forEach((unitGroup, floorId) => {
          const shouldShow = mode === "unit" && selectedB && floorId === fid;
          unitGroup.visible = shouldShow;
          if (shouldShow && unitGroup.children.length === 0) {
            const floor = rec.building.floors.find((f) => f.id === floorId);
            const fl = rec.floors.find((f) => f.id === floorId);
            if (floor && fl) {
              const n = Math.max(floor.units.length, 1);
              const cols = Math.ceil(Math.sqrt(n));
              const rows = Math.ceil(n / cols);
              const cellW = (rec.building.width * 0.86) / cols;
              const cellD = (rec.building.depth * 0.86) / rows;
              floor.units.forEach((u, i) => {
                const c = i % cols;
                const r = Math.floor(i / cols);
                const occupancyMaterial = u.occupancy === "vacant" ? unitMaterials.vacant : u.occupancy === "rented" ? unitMaterials.rented : unitMaterials.occupied;
                const um = new THREE.Mesh(new THREE.BoxGeometry(cellW * 0.88, Math.max(0.7, (rec.building.heightM / Math.max(rec.building.floorsCount, 1)) * 0.7), cellD * 0.88), occupancyMaterial);
                um.position.set(-rec.building.width * 0.38 + cellW * (c + 0.5), fl.baseY + (explode ? rec.floors.findIndex((x) => x.id === floorId) * 2.4 : 0), -rec.building.depth * 0.38 + cellD * (r + 0.5));
                um.userData = { objectType: "unit", kind: "unit", parcelId: rec.building.parcelId, buildingId: rec.building.id, floorId, unitId: u.id } satisfies PickData;
                unitGroup.add(um);
                pickables.push(um);
                rec.units.push({ id: u.id, floorId, mesh: um });
              });
            }
          }
        });
        rec.units.forEach((u) => {
          const show = mode === "unit" && selectedB && u.floorId === fid;
          u.mesh.visible = show;
          const mat = u.mesh.material as any;
          mat.emissive = new THREE.Color(uid === u.id ? 0xfbbf24 : 0x000000);
          mat.emissiveIntensity = uid === u.id ? 0.6 : 0;
          const fl = rec.floors.find((f) => f.id === u.floorId);
          if (fl) u.mesh.position.y = fl.baseY + (explode ? rec.floors.findIndex((x) => x.id === u.floorId) * 2.4 : 0);
        });
        const edgeMat = rec.edges.material as any;
        edgeMat.opacity = selectedB ? 0.95 : 0;
      });
      renderNow();
    };

    const focus = (x: number, y: number, z: number) => {
      controls.target.set(x, y, z);
    };

    apiRef.current = { apply, focus };
    apply();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables.filter((obj) => obj.visible), false) as any[];
      const hit = hits.find((h: any) => h.object.userData && h.object.userData.kind);
      if (!hit) return;
      const data = hit.object.userData as PickData;
      onSelectRef.current({
        kind: data.kind,
        parcelId: data.parcelId,
        buildingId: data.buildingId,
        floorId: data.floorId,
        unitId: data.unitId,
      });
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    renderNow();

    return () => {
      interacting = false;
      cancelAnimationFrame(frame);
      controls.removeEventListener("start", startRenderLoop);
      controls.removeEventListener("end", stopRenderLoop);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((obj: any) => {
        if (obj.geometry && obj.material) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x: any) => { if (x.map) x.map.dispose(); x.dispose(); });
          else { if (m.map) m.map.dispose(); m.dispose(); }
        }
      });
    };
  }, [buildings, parcels]);

  useEffect(() => {
    apiRef.current?.apply();
    const b = buildings.find((x) => x.id === selectedBuildingId);
    if (b) apiRef.current?.focus(b.posX, 6, b.posZ);
  }, [buildings, selectedBuildingId, selectedFloorId, selectedUnitId, viewMode]);

  return (
    <div className={`relative overflow-hidden ${className ?? "h-full w-full"}`}>
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-teal-400/20 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-300">
        Drag to orbit · Scroll to zoom · Click a parcel, floor or unit
      </div>
    </div>
  );
}
