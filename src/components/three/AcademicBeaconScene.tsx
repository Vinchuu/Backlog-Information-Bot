import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Compass, RotateCw, Sparkles, ChevronDown, ChevronUp, Eye, Layers } from 'lucide-react';

interface AcademicBeaconSceneProps {
  onBackToApp?: () => void;
  backlogCount?: number;
}

// Pre-allocated scratch objects for zero GC in render loop
const _vec3 = new THREE.Vector3();

export const AcademicBeaconScene: React.FC<AcademicBeaconSceneProps> = ({
  onBackToApp,
  backlogCount = 2,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<'overview' | 'armillary' | 'spire'>('overview');
  const [beaconStatus, setBeaconStatus] = useState<'focused' | 'cleared' | 'exam'>('focused');
  const [isRotating, setIsRotating] = useState(true);

  // Mutable refs for Three.js state
  const stateRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    controls: null as OrbitControls | null,
    armillaryGroup: null as THREE.Group | null,
    coreMesh: null as THREE.Mesh | null,
    outerRing: null as THREE.Mesh | null,
    innerRing: null as THREE.Mesh | null,
    floatingCaps: [] as THREE.Group[],
    isRotating: true,
    targetCamPos: new THREE.Vector3(0, 3.2, 7.5),
    targetLookAt: new THREE.Vector3(0, 1.8, 0),
  });

  stateRef.current.isRotating = isRotating;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const pastelFogColor = new THREE.Color('#f4f4fa');
    scene.background = pastelFogColor;
    scene.fog = new THREE.FogExp2(pastelFogColor, 0.045);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.2, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // --- 2. OrbitControls with Damping ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.target.set(0, 1.8, 0);

    // --- 3. Studio Environment Reflection (RoomEnvironment) ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // --- 4. Lighting Rig ---
    // Warm directional key light
    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    const d = 5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool Hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 1.1);
    scene.add(hemiLight);

    // Soft subtle rim light
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    // --- 5. Contact Shadow Plane (Procedural Canvas) ---
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    sGrad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
    sGrad.addColorStop(0.5, 'rgba(71, 85, 105, 0.18)');
    sGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 6.5),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    scene.add(shadowPlane);

    // Floor ground plane (soft pastel cream)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf1f3f9,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // --- 6. Composite 3D Procedural Beacon Subject (THREE.Group) ---
    // Composite model of 8 distinct parts
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, 0, 0);

    // Part 1: Stepped Octagonal Marble Base (Bottom-center pivoted)
    const baseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.25, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.125;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    beaconGroup.add(baseMesh);

    // Part 2: Inner Stepped Podium Plinth
    const innerPlinthGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.2, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.9,
    });
    const innerPlinth = new THREE.Mesh(innerPlinthGeo, goldMat);
    innerPlinth.position.y = 0.35;
    innerPlinth.castShadow = true;
    beaconGroup.add(innerPlinth);

    // Part 3: Main Classical Architectural Column Shaft
    const columnGeo = new THREE.CylinderGeometry(0.7, 0.85, 1.8, 24);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xede9fe, // pastel lavender
      roughness: 0.4,
      metalness: 0.15,
    });
    const columnMesh = new THREE.Mesh(columnGeo, columnMat);
    columnMesh.position.y = 1.35;
    columnMesh.castShadow = true;
    columnMesh.receiveShadow = true;
    beaconGroup.add(columnMesh);

    // Part 4: Corinthian Capital / Cornice Ring
    const capitalGeo = new THREE.TorusGeometry(0.75, 0.12, 16, 32);
    const capitalMesh = new THREE.Mesh(capitalGeo, goldMat);
    capitalMesh.rotation.x = Math.PI / 2;
    capitalMesh.position.y = 2.25;
    capitalMesh.castShadow = true;
    beaconGroup.add(capitalMesh);

    // Part 5 & 6: Armillary Rings Group (Rotating on dual axes)
    const armillaryGroup = new THREE.Group();
    armillaryGroup.position.y = 3.0;

    // Outer Ring
    const outerRingGeo = new THREE.TorusGeometry(1.15, 0.05, 16, 64);
    const cyanMetalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.25,
      metalness: 0.85,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, cyanMetalMat);
    outerRing.castShadow = true;
    armillaryGroup.add(outerRing);

    // Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(0.9, 0.045, 16, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, goldMat);
    innerRing.rotation.y = Math.PI / 3;
    innerRing.castShadow = true;
    armillaryGroup.add(innerRing);

    // Part 7: Central Floating Credit / Knowledge Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.48, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7, // pastel electric violet
      emissive: 0x6366f1,
      emissiveIntensity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      thickness: 1.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.castShadow = true;
    armillaryGroup.add(coreMesh);

    // Part 8: Top Architectural Spire & Orbital Finial
    const spireGeo = new THREE.ConeGeometry(0.25, 0.8, 16);
    const spireMesh = new THREE.Mesh(spireGeo, goldMat);
    spireMesh.position.y = 4.2;
    spireMesh.castShadow = true;
    beaconGroup.add(spireMesh);

    const finialSphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const finialMesh = new THREE.Mesh(finialSphereGeo, cyanMetalMat);
    finialMesh.position.y = 4.65;
    finialMesh.castShadow = true;
    beaconGroup.add(finialMesh);

    // Satellite Procedural Graduation Caps orbiting
    const floatingCaps: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const capGroup = new THREE.Group();
      // Cap square top
      const capTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.03, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.2 })
      );
      // Skull cap
      const skullCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.1 })
      );
      skullCap.position.y = -0.07;
      capGroup.add(capTop);
      capGroup.add(skullCap);

      const angle = (i * Math.PI * 2) / 3;
      capGroup.position.set(Math.cos(angle) * 2.2, 2.5 + i * 0.4, Math.sin(angle) * 2.2);
      capGroup.scale.set(0.7, 0.7, 0.7);
      beaconGroup.add(capGroup);
      floatingCaps.push(capGroup);
    }

    beaconGroup.add(armillaryGroup);
    scene.add(beaconGroup);

    // Store in stateRef
    stateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      armillaryGroup,
      coreMesh,
      outerRing,
      innerRing,
      floatingCaps,
      isRotating,
      targetCamPos: new THREE.Vector3(0, 3.2, 7.5),
      targetLookAt: new THREE.Vector3(0, 1.8, 0),
    };

    // --- 7. Animation Loop with Exponential Damping ---
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const { isRotating, armillaryGroup, coreMesh, outerRing, innerRing, floatingCaps, camera, controls, targetCamPos, targetLookAt } = stateRef.current;

      if (isRotating && armillaryGroup && coreMesh && outerRing && innerRing) {
        armillaryGroup.rotation.y += dt * 0.4;
        outerRing.rotation.x += dt * 0.35;
        innerRing.rotation.z += dt * 0.5;

        // Gentle bobbing on core
        coreMesh.position.y = Math.sin(currentTime * 0.002) * 0.08;
        coreMesh.rotation.y += dt * 0.8;
      }

      // Orbiting satellite caps
      floatingCaps.forEach((cap, i) => {
        const speed = 0.3 + i * 0.05;
        const currentAngle = (currentTime * 0.001 * speed) + (i * Math.PI * 2) / 3;
        cap.position.x = Math.cos(currentAngle) * 2.3;
        cap.position.z = Math.sin(currentAngle) * 2.3;
        cap.position.y = 2.4 + Math.sin(currentTime * 0.002 + i) * 0.25;
        cap.rotation.y += dt * 0.5;
      });

      // Smooth camera interpolation towards preset
      if (camera && controls) {
        camera.position.lerp(targetCamPos, 1 - Math.exp(-4 * dt));
        controls.target.lerp(targetLookAt, 1 - Math.exp(-4 * dt));
        controls.update();
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate(performance.now());

    // --- 8. Window Resize ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle camera presets
  const handleSelectPreset = (preset: 'overview' | 'armillary' | 'spire') => {
    setActivePreset(preset);
    const { targetCamPos, targetLookAt } = stateRef.current;
    if (preset === 'overview') {
      targetCamPos.set(0, 3.2, 7.5);
      targetLookAt.set(0, 1.8, 0);
    } else if (preset === 'armillary') {
      targetCamPos.set(0, 3.2, 3.8);
      targetLookAt.set(0, 3.0, 0);
    } else if (preset === 'spire') {
      targetCamPos.set(1.5, 4.6, 2.5);
      targetLookAt.set(0, 4.2, 0);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#f4f4fa]">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge (Minimal top-left viewport presence) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-indigo-100 shadow-md shadow-indigo-100/50">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
          <Compass className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800 tracking-tight">Academic Campus Citadel</div>
          <div className="text-[10px] text-slate-500 font-medium">Interactive 3D Study & Progression Beacon</div>
        </div>
        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="ml-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-100 hover:bg-violet-200 text-violet-800 transition-colors"
          >
            Back to Workspace
          </button>
        )}
      </div>

      {/* Viewport-First Collapsible Bottom Dock (<= 15% Viewport Footprint) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-xl transition-all duration-300 ease-out ${
          isControlsOpen ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%-28px)] opacity-95'
        }`}
      >
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-700 border border-indigo-100 shadow-md hover:bg-slate-50 transition-colors"
          >
            {isControlsOpen ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500" /> Hide Controls
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> Show Controls
              </>
            )}
          </button>
        </div>

        {/* Dock Surface (Solid / Soft pastel surface without backdrop-filter) */}
        <div className="p-3.5 rounded-2xl bg-white/95 border border-indigo-100 shadow-xl shadow-indigo-100/60 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* View Camera Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-500" /> View:
              </span>
              {[
                { id: 'overview', label: 'Full Citadel' },
                { id: 'armillary', label: 'Armillary Sphere' },
                { id: 'spire', label: 'Finial Spire' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activePreset === p.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Orbit Rotation Toggle */}
            <button
              onClick={() => setIsRotating((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                isRotating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{isRotating ? 'Rotating' : 'Paused'}</span>
            </button>
          </div>

          {/* Academic Beacon State Banner */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Citadel State:{' '}
                <strong className="text-slate-800">
                  {backlogCount === 0 ? 'All Clear (Golden Glow)' : `${backlogCount} Active Backlogs Audited`}
                </strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Damped 60FPS PBR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
