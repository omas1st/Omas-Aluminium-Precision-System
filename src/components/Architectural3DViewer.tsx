import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  FabricationItemInput,
  ConstantProfilesConfig,
  ItemCalculationResult,
} from '../types';
import {
  Box,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Eye,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Camera,
  Play,
  Pause,
  Sliders,
  Compass,
  Check,
  Info,
  Palette,
  Building2,
  ShieldCheck,
  Shield,
  Columns,
  Grid,
  MousePointerClick,
} from 'lucide-react';
import './Architectural3DViewer.css';

interface Architectural3DViewerProps {
  itemResult: ItemCalculationResult;
  constants: ConstantProfilesConfig;
}

export type ProfileFinish = 'black' | 'charcoal' | 'white' | 'bronze' | 'silver' | 'woodgrain';
export type GlassTint = 'clear' | 'blue_reflective' | 'bronze_tint' | 'green_lowe' | 'frosted';
export type CameraPreset = 'perspective' | 'front' | 'top' | 'side' | 'isometric';
export type BackgroundTheme = 'white' | 'dark' | 'system';

export const Architectural3DViewer: React.FC<Architectural3DViewerProps> = ({
  itemResult,
  constants,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const windowGroupRef = useRef<THREE.Group | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background Theme State (White, Dark, System)
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omas_3d_bg_theme');
      if (saved === 'dark' || saved === 'white' || saved === 'system') {
        return saved as BackgroundTheme;
      }
    }
    return 'white';
  });

  // Track OS system theme
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const handleBgThemeChange = (theme: BackgroundTheme) => {
    setBgTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omas_3d_bg_theme', theme);
    }
  };

  const effectiveIsDark = bgTheme === 'system' ? systemIsDark : bgTheme === 'dark';

  // Dynamic state
  const { item, cuts, glasses } = itemResult;
  const { width: W, height: H, kind, tag } = item;

  const [profileFinish, setProfileFinish] = useState<ProfileFinish>('charcoal');
  const [glassTint, setGlassTint] = useState<GlassTint>('clear');
  const [openPercentage, setOpenPercentage] = useState<number>(0);
  const [isAutoAnimating, setIsAutoAnimating] = useState<boolean>(false);
  const [explodedView, setExplodedView] = useState<number>(0);
  const [showWallOpening, setShowWallOpening] = useState<boolean>(true);
  const [showWireframeOverlay, setShowWireframeOverlay] = useState<boolean>(true);
  const [showDimensions3D, setShowDimensions3D] = useState<boolean>(true);
  const [showEnvironmentGrid, setShowEnvironmentGrid] = useState<boolean>(true);
  const [showBurglary, setShowBurglary] = useState<boolean>(item.hasBurglary !== false);
  const [showNet, setShowNet] = useState<boolean>(item.hasNet !== false);
  const [showDividers, setShowDividers] = useState<boolean>((item.dividerCount ?? 1) > 0);
  const [showIronCleats, setShowIronCleats] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('perspective');
  const [selectedPartInfo, setSelectedPartInfo] = useState<{
    title: string;
    description: string;
    dimensions: string;
    material: string;
  } | null>(null);

  // Open animation loop
  useEffect(() => {
    let forward = true;
    let interval: any;
    if (isAutoAnimating) {
      interval = setInterval(() => {
        setOpenPercentage((prev) => {
          if (forward) {
            if (prev >= 90) {
              forward = false;
              return 90;
            }
            return prev + 2;
          } else {
            if (prev <= 0) {
              forward = true;
              return 0;
            }
            return prev - 2;
          }
        });
      }, 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoAnimating]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Material builder helper
  const materials = useMemo(() => {
    // Aluminium Finish Colors & Properties
    let aluColor = 0x24272c;
    let aluRoughness = 0.35;
    let aluMetalness = 0.85;

    switch (profileFinish) {
      case 'black':
        aluColor = 0x111317;
        aluRoughness = 0.45;
        aluMetalness = 0.7;
        break;
      case 'charcoal':
        aluColor = 0x2b303a;
        aluRoughness = 0.35;
        aluMetalness = 0.85;
        break;
      case 'white':
        aluColor = 0xf0f2f5;
        aluRoughness = 0.25;
        aluMetalness = 0.2;
        break;
      case 'bronze':
        aluColor = 0x3d2b1f;
        aluRoughness = 0.3;
        aluMetalness = 0.85;
        break;
      case 'silver':
        aluColor = 0xc5cdd6;
        aluRoughness = 0.25;
        aluMetalness = 0.92;
        break;
      case 'woodgrain':
        aluColor = 0x7c4928;
        aluRoughness = 0.6;
        aluMetalness = 0.15;
        break;
    }

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: aluColor,
      roughness: aluRoughness,
      metalness: aluMetalness,
      envMapIntensity: 1.2,
    });

    const sashMaterial = new THREE.MeshStandardMaterial({
      color: aluColor,
      roughness: aluRoughness,
      metalness: aluMetalness,
      envMapIntensity: 1.3,
    });

    const hardwareMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.95,
    });

    const lockGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.9,
    });

    // Glass Material Properties
    let glassColor = 0xd4f1f9;
    let glassOpacity = 0.32;
    let glassRoughness = 0.05;
    let glassTransmission = 0.9;

    switch (glassTint) {
      case 'clear':
        glassColor = 0xdcf4fc;
        glassOpacity = 0.28;
        glassRoughness = 0.05;
        glassTransmission = 0.92;
        break;
      case 'blue_reflective':
        glassColor = 0x38bdf8;
        glassOpacity = 0.45;
        glassRoughness = 0.02;
        glassTransmission = 0.85;
        break;
      case 'bronze_tint':
        glassColor = 0xa3714b;
        glassOpacity = 0.42;
        glassRoughness = 0.08;
        glassTransmission = 0.82;
        break;
      case 'green_lowe':
        glassColor = 0x5eead4;
        glassOpacity = 0.35;
        glassRoughness = 0.05;
        glassTransmission = 0.88;
        break;
      case 'frosted':
        glassColor = 0xffffff;
        glassOpacity = 0.65;
        glassRoughness = 0.65;
        glassTransmission = 0.4;
        break;
    }

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      transparent: true,
      opacity: glassOpacity,
      roughness: glassRoughness,
      metalness: 0.1,
      transmission: glassTransmission,
      ior: 1.52,
      reflectivity: 0.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: effectiveIsDark ? 0xdbe2ea : 0xe2e8f0,
      roughness: 0.85,
      metalness: 0.05,
    });

    const wallSillMaterial = new THREE.MeshStandardMaterial({
      color: effectiveIsDark ? 0x94a3b8 : 0x64748b,
      roughness: 0.4,
      metalness: 0.2,
    });

    const gasketMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505,
    });

    // Galvanised Iron Angle Cleat Material (35mm corner connectors)
    const ironAngleMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.88,
    });

    // Burglary Proofing Rod & Frame Material (Ballo Straight Rods)
    const burglaryMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.85,
    });

    // Insect / Mosquito Mesh Screen (Translucent fine weave)
    const netMeshMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });

    const lineWireMaterial = new THREE.LineBasicMaterial({
      color: effectiveIsDark ? 0x38bdf8 : 0x0284c7,
      linewidth: 1.5,
      transparent: true,
      opacity: effectiveIsDark ? 0.75 : 0.85,
    });

    return {
      frame: frameMaterial,
      sash: sashMaterial,
      hardware: hardwareMaterial,
      lockGold: lockGoldMaterial,
      glass: glassMaterial,
      wall: wallMaterial,
      wallSill: wallSillMaterial,
      gasket: gasketMaterial,
      wire: lineWireMaterial,
      ironAngle: ironAngleMaterial,
      burglary: burglaryMaterial,
      netMesh: netMeshMaterial,
    };
  }, [profileFinish, glassTint, effectiveIsDark]);

  // Main ThreeJS Scene Setup & Re-render Loop
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const sceneBgColor = effectiveIsDark ? 0x0b1120 : 0xf8fafc;
    scene.background = new THREE.Color(sceneBgColor);
    scene.fog = new THREE.FogExp2(sceneBgColor, 0.00035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 10, 20000);
    cameraRef.current = camera;

    // Initial camera position scaled to window size
    const maxDim = Math.max(W, H, 1000);
    camera.position.set(maxDim * 0.9, maxDim * 0.45, maxDim * 1.6);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = effectiveIsDark ? 1.1 : 1.05;

    // Clear previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = maxDim * 6;
    controls.minDistance = maxDim * 0.2;
    controls.target.set(0, H / 2, 0);
    controls.update();

    // 5. Lighting Rig (Studio Architectural Quality adjusted for dark vs white backgrounds)
    const ambientLight = new THREE.AmbientLight(0xffffff, effectiveIsDark ? 0.9 : 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, effectiveIsDark ? 2.2 : 1.85);
    keyLight.position.set(maxDim * 1.5, maxDim * 2.2, maxDim * 1.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = maxDim * 8;
    const d = maxDim * 1.8;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      effectiveIsDark ? 0xcde8ff : 0xdbeafe,
      effectiveIsDark ? 1.3 : 1.0
    );
    fillLight.position.set(-maxDim * 1.5, maxDim * 1.2, maxDim * 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      effectiveIsDark ? 0x38bdf8 : 0x94a3b8,
      effectiveIsDark ? 1.4 : 0.85
    );
    rimLight.position.set(0, maxDim * 1.5, -maxDim * 2);
    scene.add(rimLight);

    const groundBounce = new THREE.DirectionalLight(
      effectiveIsDark ? 0x64748b : 0xcfdbe8,
      effectiveIsDark ? 0.6 : 0.45
    );
    groundBounce.position.set(0, -maxDim, 0);
    scene.add(groundBounce);

    // Ground Grid & Shadow Receiver
    if (showEnvironmentGrid) {
      const gridHelper = new THREE.GridHelper(
        maxDim * 4,
        30,
        effectiveIsDark ? 0x38bdf8 : 0x0284c7,
        effectiveIsDark ? 0x1e293b : 0xdbe2ea
      );
      gridHelper.position.y = -5;
      scene.add(gridHelper);

      const shadowPlaneGeo = new THREE.PlaneGeometry(maxDim * 5, maxDim * 5);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: effectiveIsDark ? 0.35 : 0.18 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -6;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);
    }

    // Window Root Assembly Group
    const windowGroup = new THREE.Group();
    windowGroupRef.current = windowGroup;
    scene.add(windowGroup);

    // 6. Build the 3D Window Mesh Structure
    buildWindow3DModel(
      windowGroup,
      item,
      constants,
      materials,
      openPercentage,
      explodedView,
      showWallOpening,
      showWireframeOverlay,
      showDimensions3D,
      showBurglary,
      showNet,
      showDividers,
      showIronCleats
    );

    // Raycaster for part inspection on click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(windowGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData && hit.userData.title) {
          setSelectedPartInfo({
            title: hit.userData.title,
            description: hit.userData.description || 'Aluminium Architectural Component',
            dimensions: hit.userData.dimensions || `${W} × ${H} mm`,
            material: hit.userData.material || profileFinish,
          });
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Resize Observer for responsive canvas sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height || 520;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.dispose();
    };
  }, [
    W,
    H,
    kind,
    constants,
    materials,
    openPercentage,
    explodedView,
    showWallOpening,
    showWireframeOverlay,
    showDimensions3D,
    showBurglary,
    showNet,
    showDividers,
    showIronCleats,
    showEnvironmentGrid,
    effectiveIsDark,
  ]);

  // Set Camera Preset handler
  const setCameraPreset = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const maxDim = Math.max(W, H, 1000);
    const target = new THREE.Vector3(0, H / 2, 0);

    setActiveCameraPreset(preset);
    controls.target.copy(target);

    switch (preset) {
      case 'front':
        camera.position.set(0, H / 2, maxDim * 2.2);
        break;
      case 'perspective':
        camera.position.set(maxDim * 0.9, maxDim * 0.5, maxDim * 1.7);
        break;
      case 'top':
        camera.position.set(0, maxDim * 2.4, 10);
        break;
      case 'side':
        camera.position.set(maxDim * 2.2, H / 2, 0);
        break;
      case 'isometric':
        camera.position.set(maxDim * 1.3, maxDim * 1.1, maxDim * 1.3);
        break;
    }
    controls.update();
  };

  // Reset Camera View
  const handleResetCamera = () => {
    setCameraPreset('perspective');
  };

  // Take high resolution snapshot PNG
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3D-Arch-${tag.replace(/\s+/g, '_')}-${W}x${H}.png`;
    link.href = dataUrl;
    link.click();
  };

  const isSliding = kind.startsWith('sliding_');

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col gap-4 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-3 sm:p-5 overflow-y-auto' : ''
      }`}
    >
      {/* ========================================================================= */}
      {/* SECTION 1: 3D ARCHITECTURAL STUDIO CANVAS (100% VISIBLE & UNOBSTRUCTED)   */}
      {/* ========================================================================= */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden shadow-lg border transition-colors duration-300 flex flex-col ${
          effectiveIsDark
            ? 'bg-slate-950 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header & Camera Control Toolbar */}
        <div
          className={`px-3 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
            effectiveIsDark
              ? 'bg-slate-900/95 border-slate-800 text-white'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          {/* Left: Unit Tag & Type Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                effectiveIsDark
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base tracking-tight truncate">{tag}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                    effectiveIsDark
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {kind.replace(/_/g, ' ')}
                </span>
              </div>
              <div
                className={`text-xs font-mono mt-0.5 ${
                  effectiveIsDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {W} × {H} mm &bull; Extrusion Depth: 65mm &bull; Qty: {item.quantity}
              </div>
            </div>
          </div>

          {/* Center/Right: View Presets, Canvas Themes, and Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Background Theme Selector: White, Dark, System */}
            <div
              className={`flex items-center p-0.5 sm:p-1 rounded-xl border gap-0.5 ${
                effectiveIsDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={() => handleBgThemeChange('white')}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  bgTheme === 'white'
                    ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200 shadow-xs'
                    : effectiveIsDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="White Architectural Canvas"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">White</span>
              </button>

              <button
                type="button"
                onClick={() => handleBgThemeChange('dark')}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  bgTheme === 'dark'
                    ? effectiveIsDark
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-800 text-white font-bold shadow-xs'
                    : effectiveIsDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dark Blueprint Night Canvas"
              >
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleBgThemeChange('system')}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  bgTheme === 'system'
                    ? effectiveIsDark
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-900 font-bold border border-slate-300'
                    : effectiveIsDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="System Theme (Auto Device Match)"
              >
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">System</span>
              </button>
            </div>

            {/* Camera View Quick Presets */}
            <div
              className={`flex items-center p-0.5 sm:p-1 rounded-xl border gap-0.5 overflow-x-auto ${
                effectiveIsDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {[
                { id: 'perspective', label: '3D Orbit', title: '3D Perspective Orbit' },
                { id: 'front', label: 'Front', title: 'Front Elevation' },
                { id: 'top', label: 'Plan', title: 'Plan View (Top-Down)' },
                { id: 'side', label: 'Side', title: 'Side Section' },
                { id: 'isometric', label: 'ISO', title: 'Isometric Projection' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCameraPreset(p.id as CameraPreset)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeCameraPreset === p.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : effectiveIsDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={p.title}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Action Buttons: Reset, Render PNG, Fullscreen */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetCamera}
                className={`p-1.5 rounded-lg border transition-colors ${
                  effectiveIsDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
                }`}
                title="Reset Camera Target"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  effectiveIsDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 hover:text-blue-700 border-slate-200 shadow-xs'
                }`}
                title="Download 3D Architectural Snapshot"
              >
                <Camera className="w-4 h-4 text-sky-500" />
                <span className="hidden sm:inline">Render PNG</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className={`p-1.5 rounded-lg border transition-colors ${
                  effectiveIsDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
                }`}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Studio'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport (100% UNCLUTTERED) */}
        <div className="relative w-full">
          <div
            ref={mountRef}
            className="w-full h-[360px] sm:h-[460px] md:h-[520px] lg:h-[580px] cursor-grab active:cursor-grabbing"
          />

          {/* Bottom Gestures and Tech Spec HUD */}
          <div
            className={`absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-xs`}
          >
            <div
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-sm ${
                effectiveIsDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                  : 'bg-white/95 border-slate-200 text-slate-700'
              }`}
            >
              <span className="flex items-center gap-1 font-semibold text-[11px]">
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>Left Drag: Orbit 3D</span>
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-[11px] hidden sm:inline">Right Drag: Pan</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-[11px] hidden sm:inline">Scroll: Zoom</span>
              <span className="text-slate-400 hidden xs:inline">•</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Click Part to Inspect</span>
            </div>

            <div
              className={`px-2.5 py-1 rounded-xl border font-mono text-[10px] backdrop-blur-md shadow-sm ${
                effectiveIsDark
                  ? 'bg-slate-900/90 border-slate-800 text-slate-400'
                  : 'bg-white/95 border-slate-200 text-slate-500'
              }`}
            >
              WebGL Architectural Studio &bull; 60 FPS
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: ARCHITECTURAL FEATURES, FINISHES & SIMULATION CONTROLS GRID   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {/* ------------------------------------------------------------- */}
        {/* CARD 1: Aluminium Powder Coat & Glass Infill Finishes        */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-4 transition-colors ${
            effectiveIsDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Powder Coat Finish */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Palette className="w-4 h-4 text-blue-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Aluminium Finish
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'charcoal', label: 'Charcoal', color: '#2b303a' },
                { id: 'black', label: 'Matte Black', color: '#111317' },
                { id: 'white', label: 'Pure White', color: '#f0f2f5' },
                { id: 'bronze', label: 'Bronze', color: '#3d2b1f' },
                { id: 'silver', label: 'Silver Anod.', color: '#c5cdd6' },
                { id: 'woodgrain', label: 'Woodgrain', color: '#7c4928' },
              ].map((fin) => (
                <button
                  key={fin.id}
                  type="button"
                  onClick={() => setProfileFinish(fin.id as ProfileFinish)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-medium transition-all ${
                    profileFinish === fin.id
                      ? effectiveIsDark
                        ? 'border-blue-500 bg-blue-600/20 text-white font-bold ring-2 ring-blue-500/40'
                        : 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/30 shadow-xs'
                      : effectiveIsDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 mb-1.5 shadow-xs shrink-0"
                    style={{ backgroundColor: fin.color }}
                  />
                  <span className="truncate w-full text-center leading-tight">{fin.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Glass Infill Tint */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Glass Infill Tint
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'clear', label: 'Clear 6mm', dot: '#dcf4fc' },
                { id: 'blue_reflective', label: 'Blue Solar', dot: '#38bdf8' },
                { id: 'bronze_tint', label: 'Bronze Tint', dot: '#a3714b' },
                { id: 'green_lowe', label: 'Green Low-E', dot: '#5eead4' },
                { id: 'frosted', label: 'Frosted Sat.', dot: '#cbd5e1' },
              ].map((gt) => (
                <button
                  key={gt.id}
                  type="button"
                  onClick={() => setGlassTint(gt.id as GlassTint)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border flex items-center gap-1.5 transition-all ${
                    glassTint === gt.id
                      ? effectiveIsDark
                        ? 'border-sky-400 bg-sky-500/20 text-white font-bold ring-1 ring-sky-400'
                        : 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-400 shadow-xs'
                      : effectiveIsDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: gt.dot }}
                  />
                  <span>{gt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 2: Sash Operability & Exploded Assembly View            */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-4 transition-colors ${
            effectiveIsDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Sash Operability Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Sash Operability
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoAnimating(!isAutoAnimating)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isAutoAnimating
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 animate-pulse'
                    : effectiveIsDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Auto-animate open and close cycle"
              >
                {isAutoAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoAnimating ? 'Pause' : 'Auto Play'}</span>
              </button>
            </div>

            <div
              className={`flex justify-between text-xs font-mono mb-1.5 ${
                effectiveIsDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <span>Position:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {openPercentage === 0 ? 'Fully Closed (0°)' : `${openPercentage}° Open (${Math.round((openPercentage / 90) * 100)}%)`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="90"
              value={openPercentage}
              onChange={(e) => {
                setIsAutoAnimating(false);
                setOpenPercentage(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div
              className={`flex justify-between text-[10px] mt-1 ${
                effectiveIsDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>0° Closed</span>
              <span>Slide / Swing Angle</span>
              <span>90° Full Open</span>
            </div>
          </div>

          {/* Exploded View Assembly Slider */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Exploded Assembly
                </h4>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                {explodedView}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={explodedView}
              onChange={(e) => setExplodedView(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div
              className={`flex justify-between text-[10px] mt-1 ${
                effectiveIsDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>0% Assembled</span>
              <span>Component Spacing</span>
              <span>100% Exploded</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 3: Architectural Simulation Layers                      */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-2.5 transition-colors ${
            effectiveIsDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider">
              Architectural Layers
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Wall Aperture Opening</span>
              </span>
              <input
                type="checkbox"
                checked={showWallOpening}
                onChange={(e) => setShowWallOpening(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Grid className="w-4 h-4 text-slate-400" />
                <span>Technical Wireframe Edges</span>
              </span>
              <input
                type="checkbox"
                checked={showWireframeOverlay}
                onChange={(e) => setShowWireframeOverlay(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>3D Floating Dimensions</span>
              </span>
              <input
                type="checkbox"
                checked={showDimensions3D}
                onChange={(e) => setShowDimensions3D(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Box className="w-4 h-4 text-amber-500" />
                <span>35mm Iron Angle Cleats</span>
              </span>
              <input
                type="checkbox"
                checked={showIronCleats}
                onChange={(e) => setShowIronCleats(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>

            {!isSliding && (
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                <span className="flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Burglary Proofing Bars</span>
                </span>
                <input
                  type="checkbox"
                  checked={showBurglary}
                  onChange={(e) => setShowBurglary(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>
            )}

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Layers className="w-4 h-4 text-teal-500" />
                <span>Insect / Mosquito Net Screen</span>
              </span>
              <input
                type="checkbox"
                checked={showNet}
                onChange={(e) => setShowNet(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 font-medium">
                <Columns className="w-4 h-4 text-indigo-500" />
                <span>Glazing Dividers (Colonial Grid)</span>
              </span>
              <input
                type="checkbox"
                checked={showDividers}
                onChange={(e) => setShowDividers(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 4: Live 3D Part Inspector & Diagnostics                 */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between transition-colors ${
            selectedPartInfo
              ? effectiveIsDark
                ? 'bg-blue-950/40 border-blue-600/70 text-white'
                : 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-sm'
              : effectiveIsDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Live Part Inspector
                </h4>
              </div>
              {selectedPartInfo && (
                <button
                  type="button"
                  onClick={() => setSelectedPartInfo(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white font-mono px-1 py-0.5 rounded"
                  title="Clear inspector selection"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {selectedPartInfo ? (
              <div className="space-y-2.5 animate-inspector">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Component Title
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedPartInfo.title}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Description & Role
                  </span>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {selectedPartInfo.description}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Cut Size:</span>
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                    {selectedPartInfo.dimensions}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 px-3 text-center space-y-2">
                <MousePointerClick className="w-7 h-7 text-blue-500 mx-auto opacity-70" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Click on any aluminium extrusion, sash bar, glass pane, or fastener directly on the 3D model above to inspect its fabrication cut length.
                </p>
              </div>
            )}
          </div>

          <div
            className={`mt-4 pt-2.5 border-t text-[10px] font-mono flex items-center justify-between ${
              effectiveIsDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            <span>Interactive Raycaster</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3D GEOMETRY COMPOSER FOR ALUMINIUM SYSTEMS
// ==========================================
function buildWindow3DModel(
  group: THREE.Group,
  item: FabricationItemInput,
  constants: ConstantProfilesConfig,
  materials: any,
  openPct: number,
  explodePct: number,
  showWall: boolean,
  showWireframe: boolean,
  showDim3D: boolean,
  showBurglary: boolean,
  showNet: boolean,
  showDividers: boolean,
  showIronCleats: boolean
) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
  }

  const { width: W, height: H, kind } = item;
  const frameDepth = 65; // Standard 65mm architectural frame depth
  const sashDepth = 38; // Standard 38mm operable sash thickness
  const glassThickness = 6; // Standard 6mm architectural glass
  const wallThick = 200; // Standard 200mm masonry wall

  const explodeOffset = (explodePct / 100) * 180; // mm

  // Center window around (0, H/2, 0)
  const halfW = W / 2;
  const isTransom = kind.startsWith('transom_');
  const frameThickness = isTransom ? 60 : 45;

  // 1. Architectural Wall Opening Infill (Surrounding Masonry Reveal)
  if (showWall) {
    const wallMargin = 300;
    const wallHeight = H + wallMargin * 2;
    const wallWidth = W + wallMargin * 2;

    const wallShape = new THREE.Shape();
    wallShape.moveTo(-wallWidth / 2, -wallMargin);
    wallShape.lineTo(wallWidth / 2, -wallMargin);
    wallShape.lineTo(wallWidth / 2, H + wallMargin);
    wallShape.lineTo(-wallWidth / 2, H + wallMargin);
    wallShape.lineTo(-wallWidth / 2, -wallMargin);

    // Cutout hole for window frame
    const hole = new THREE.Path();
    hole.moveTo(-halfW, 0);
    hole.lineTo(halfW, 0);
    hole.lineTo(halfW, H);
    hole.lineTo(-halfW, H);
    hole.lineTo(-halfW, 0);
    wallShape.holes.push(hole);

    const wallExtrudeSettings = {
      depth: wallThick,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 4,
      bevelThickness: 4,
    };

    const wallGeo = new THREE.ExtrudeGeometry(wallShape, wallExtrudeSettings);
    const wallMesh = new THREE.Mesh(wallGeo, materials.wall);
    wallMesh.position.z = -wallThick / 2;
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = false;
    group.add(wallMesh);

    // Add concrete sub-sill reveal
    const sillGeo = new THREE.BoxGeometry(W + 120, 25, wallThick + 60);
    const sillMesh = new THREE.Mesh(sillGeo, materials.wallSill);
    sillMesh.position.set(0, -12.5, 0);
    sillMesh.receiveShadow = true;
    sillMesh.castShadow = true;
    group.add(sillMesh);
  }

  // 2. Outer Frame Profiles (Head, Sill, Left Jamb, Right Jamb)
  const outerFrameGroup = new THREE.Group();
  outerFrameGroup.position.z = -explodeOffset * 0.5;
  group.add(outerFrameGroup);

  if (isTransom) {
    // Transom Outer Frame: 90° Square Cut with Top Width sitting on Jambs, Jambs sitting on Bottom Width + 55mm Iron Angle Cleats
    createTransomOuterFrame(
      outerFrameGroup,
      W,
      H,
      frameThickness,
      frameDepth,
      materials,
      showWireframe,
      showIronCleats
    );
  } else if (kind.startsWith('casement_')) {
    // Casement Outer Frame: 45° Miter Cuts for Top/Bottom (Outer Width) & Sides (Outer Height) + 35mm Iron Angle Cleats
    createCasementMiterOuterFrame(
      outerFrameGroup,
      W,
      H,
      frameThickness,
      frameDepth,
      materials,
      showWireframe,
      showIronCleats
    );
  } else {
    // Standard Square-Cut Sliding Outer Frame
    // Top Head Profile
    createExtrusionBar(
      outerFrameGroup,
      W,
      frameThickness,
      frameDepth,
      0,
      H - frameThickness / 2,
      0,
      materials.frame,
      materials.wire,
      showWireframe,
      'Top Head Profile (Sliding)',
      `Outer Frame Head Extrusion (${W}mm)`,
      `${W} × ${frameThickness} × ${frameDepth} mm`
    );

    // Bottom Sill Profile
    createExtrusionBar(
      outerFrameGroup,
      W,
      frameThickness,
      frameDepth,
      0,
      frameThickness / 2,
      0,
      materials.frame,
      materials.wire,
      showWireframe,
      'Bottom Sill Profile (Sliding)',
      `Outer Frame Sill Track (${W}mm)`,
      `${W} × ${frameThickness} × ${frameDepth} mm`
    );

    // Left Jamb Profile
    createExtrusionBar(
      outerFrameGroup,
      frameThickness,
      H - frameThickness * 2,
      frameDepth,
      -halfW + frameThickness / 2,
      H / 2,
      0,
      materials.frame,
      materials.wire,
      showWireframe,
      'Left Side Jamb Profile (Sliding)',
      `Outer Frame Left Jamb (${H}mm)`,
      `${frameThickness} × ${H - frameThickness * 2} × ${frameDepth} mm`
    );

    // Right Jamb Profile
    createExtrusionBar(
      outerFrameGroup,
      frameThickness,
      H - frameThickness * 2,
      frameDepth,
      halfW - frameThickness / 2,
      H / 2,
      0,
      materials.frame,
      materials.wire,
      showWireframe,
      'Right Side Jamb Profile (Sliding)',
      `Outer Frame Right Jamb (${H}mm)`,
      `${frameThickness} × ${H - frameThickness * 2} × ${frameDepth} mm`
    );
  }

  // 3. Type-Specific Interior Profiles, Sashes, Glass, and Hardware
  const sashesGroup = new THREE.Group();
  group.add(sashesGroup);

  const innerW = W - frameThickness * 2;
  const innerH = H - frameThickness * 2;

  // A. Sliding Window Systems
  if (kind.startsWith('sliding_')) {
    let panelsCount = 2;
    if (kind === 'sliding_3_panel') panelsCount = 3;
    if (kind === 'sliding_4_panel') panelsCount = 4;

    if (kind === 'sliding_fixed_window') {
      // 1-Pane Fixed Sliding Frame
      createGlassPane(
        sashesGroup,
        innerW - 10,
        innerH - 10,
        glassThickness,
        0,
        H / 2,
        0,
        materials.glass,
        'Sliding Fixed Glass Pane',
        `${innerW - 10} × ${innerH - 10} mm (6mm Float/Laminated)`
      );
    } else if (kind === 'sliding_1_fixed_1_sliding') {
      // 1 Fixed Pane + 1 Sliding Sash ("OX")
      const bayW = innerW / 2;

      // Left Fixed Glass
      createGlassPane(
        sashesGroup,
        bayW - 10,
        innerH - 10,
        glassThickness,
        -bayW / 2,
        H / 2,
        -10 - explodeOffset * 0.2,
        materials.glass,
        'Left Fixed Pane (O)',
        `${bayW - 10} × ${innerH - 10} mm`
      );

      // Right Sliding Sash
      const sashW = bayW + 12;
      const sashH = innerH - 6;
      const slideDist = (openPct / 100) * (bayW - 40);

      const rightSashGroup = new THREE.Group();
      rightSashGroup.position.set(bayW / 2 - slideDist, H / 2, 10 + explodeOffset * 0.4);
      sashesGroup.add(rightSashGroup);

      createSashFrameBox(
        rightSashGroup,
        sashW,
        sashH,
        sashDepth,
        50,
        materials.sash,
        materials.wire,
        materials.glass,
        showWireframe,
        'Operable Sliding Sash (X)',
        `${sashW} × ${sashH} mm`
      );

      // Sliding Flush Pull Handle
      createHandle(rightSashGroup, sashW / 2 - 12, 0, sashDepth / 2 + 3, materials.hardware, 'flush_pull');
    } else {
      // Standard 2, 3, 4 Panel Sliders
      const panelWidth = innerW / panelsCount + 15;
      const panelHeight = innerH - 6;

      for (let i = 0; i < panelsCount; i++) {
        const defaultX = -halfW + frameThickness + (i + 0.5) * (innerW / panelsCount);
        const isFrontTrack = i % 2 === 1;
        const trackZ = isFrontTrack ? 12 : -12;

        // Slide movement direction
        let slideOffset = 0;
        if (panelsCount === 2) {
          slideOffset = i === 0 ? (openPct / 100) * (panelWidth - 50) : -(openPct / 100) * (panelWidth - 50);
        } else if (panelsCount === 4) {
          if (i === 1) slideOffset = -(openPct / 100) * (panelWidth - 40);
          if (i === 2) slideOffset = (openPct / 100) * (panelWidth - 40);
        } else {
          if (i === 0) slideOffset = (openPct / 100) * (panelWidth - 40);
        }

        const sashGroup = new THREE.Group();
        sashGroup.position.set(
          defaultX + slideOffset,
          H / 2,
          trackZ + (isFrontTrack ? explodeOffset * 0.3 : -explodeOffset * 0.3)
        );
        sashesGroup.add(sashGroup);

        createSashFrameBox(
          sashGroup,
          panelWidth,
          panelHeight,
          sashDepth,
          48,
          materials.sash,
          materials.wire,
          materials.glass,
          showWireframe,
          `Sliding Sash Panel #${i + 1}`,
          `${panelWidth} × ${panelHeight} mm`
        );

        // Hardware Handle / Flush latch
        const handleX = i % 2 === 0 ? panelWidth / 2 - 14 : -panelWidth / 2 + 14;
        createHandle(sashGroup, handleX, 0, sashDepth / 2 + 3, materials.hardware, 'sliding_latch');
      }
    }
  }

  // B. Casement Window Systems
  else if (kind.startsWith('casement_')) {
    if (kind === 'casement_fixed_window') {
      // 1-Pane Fixed Casement Picture Window with Snap-in Bead
      createGlassPane(
        sashesGroup,
        innerW - 15,
        innerH - 15,
        glassThickness,
        0,
        H / 2,
        0,
        materials.glass,
        'Casement Fixed Picture Glass',
        `${innerW - 15} × ${innerH - 15} mm`
      );

      // Glazing Dividers if enabled
      if (showDividers && (item.dividerCount ?? 0) > 0) {
        createGlazingDividers(
          sashesGroup,
          innerW - 15,
          innerH - 15,
          0,
          H / 2,
          0,
          item.dividerCount ?? 1,
          materials.frame,
          materials.wire,
          showWireframe
        );
      }
    } else if (kind === 'casement_1_fixed_1_open') {
      // 1 Fixed Bay + 1 Openable Casement Sash with Center Mullion
      const mullionW = 30;
      const bayW = (innerW - mullionW) / 2;

      // Center Mullion T-Bar
      createExtrusionBar(
        group,
        mullionW,
        innerH,
        frameDepth,
        0,
        H / 2,
        0,
        materials.frame,
        materials.wire,
        showWireframe,
        'Center Casement Mullion T-Bar',
        `Vertical Mullion Profile (${innerH}mm)`,
        `${mullionW} × ${innerH} × ${frameDepth} mm`
      );

      // Bay 1: Left Fixed Glass
      createGlassPane(
        sashesGroup,
        bayW - 16,
        innerH - 16,
        glassThickness,
        -bayW / 2 - mullionW / 2,
        H / 2,
        0,
        materials.glass,
        'Fixed Light Glass Pane',
        `${bayW - 16} × ${innerH - 16} mm`
      );

      if (showDividers && (item.dividerCount ?? 0) > 0) {
        createGlazingDividers(
          sashesGroup,
          bayW - 16,
          innerH - 16,
          -bayW / 2 - mullionW / 2,
          H / 2,
          0,
          item.dividerCount ?? 1,
          materials.frame,
          materials.wire,
          showWireframe
        );
      }

      // Bay 2: Right Operable Casement Leaf (Hinged at outer jamb with 45° miter sash cuts & cleats)
      const sashW = bayW - 8;
      const sashH = innerH - 8;
      const hingeX = halfW - frameThickness;
      const openAngle = -(openPct / 100) * (Math.PI / 2.2); // Swing open outward

      const hingeGroup = new THREE.Group();
      hingeGroup.position.set(hingeX, H / 2, frameDepth / 2 + explodeOffset * 0.4);
      hingeGroup.rotation.y = openAngle;
      sashesGroup.add(hingeGroup);

      const leafGroup = new THREE.Group();
      leafGroup.position.set(-sashW / 2, 0, 0);
      hingeGroup.add(leafGroup);

      createCasementMiterSashFrame(
        leafGroup,
        sashW,
        sashH,
        sashDepth,
        55,
        materials.sash,
        materials.wire,
        materials.glass,
        materials.ironAngle,
        showWireframe,
        showIronCleats,
        'Casement Operable Vent Sash (De-Curve)',
        `${sashW} × ${sashH} mm`
      );

      if (showDividers && (item.dividerCount ?? 0) > 0) {
        createGlazingDividers(
          leafGroup,
          sashW - 110,
          sashH - 110,
          0,
          0,
          0,
          item.dividerCount ?? 1,
          materials.sash,
          materials.wire,
          showWireframe
        );
      }

      // Cockspur / Espag handle
      createHandle(leafGroup, -sashW / 2 + 15, 0, sashDepth / 2 + 4, materials.hardware, 'casement_lever');
    } else {
      // Casement Multi-Panel (1, 2, 3, 4 Operable Bays)
      let bays = 1;
      if (kind.includes('2_panel')) bays = 2;
      if (kind.includes('3_panel')) bays = 3;
      if (kind.includes('4_panel')) bays = 4;

      const mullionW = 30;
      const mullionsCount = bays - 1;
      const bayW = (innerW - mullionsCount * mullionW) / bays;
      const bayH = innerH;

      // Mullions
      for (let m = 0; m < mullionsCount; m++) {
        const mx = -halfW + frameThickness + (m + 1) * bayW + m * mullionW + mullionW / 2;
        createExtrusionBar(
          group,
          mullionW,
          bayH,
          frameDepth,
          mx,
          H / 2,
          0,
          materials.frame,
          materials.wire,
          showWireframe,
          `Dividing Mullion T-Bar #${m + 1}`,
          `Vertical Mullion Profile (${bayH}mm)`,
          `${mullionW} × ${bayH} × ${frameDepth} mm`
        );
      }

      // Sashes
      for (let p = 0; p < bays; p++) {
        const sashW = bayW - 8;
        const sashH = bayH - 8;
        const bayCenterX = -halfW + frameThickness + p * (bayW + mullionW) + bayW / 2;
        const isRightHinged = p % 2 === 1;
        const hingeX = isRightHinged ? bayCenterX + sashW / 2 : bayCenterX - sashW / 2;
        const openAngle = isRightHinged
          ? -(openPct / 100) * (Math.PI / 2.2)
          : (openPct / 100) * (Math.PI / 2.2);

        const hingeGroup = new THREE.Group();
        hingeGroup.position.set(hingeX, H / 2, frameDepth / 2 + explodeOffset * 0.4);
        hingeGroup.rotation.y = openAngle;
        sashesGroup.add(hingeGroup);

        const leafGroup = new THREE.Group();
        leafGroup.position.set(isRightHinged ? -sashW / 2 : sashW / 2, 0, 0);
        hingeGroup.add(leafGroup);

        createCasementMiterSashFrame(
          leafGroup,
          sashW,
          sashH,
          sashDepth,
          55,
          materials.sash,
          materials.wire,
          materials.glass,
          materials.ironAngle,
          showWireframe,
          showIronCleats,
          `Casement Operable Sash #${p + 1} (45° Miter)`,
          `${sashW} × ${sashH} mm`
        );

        if (showDividers && (item.dividerCount ?? 0) > 0) {
          createGlazingDividers(
            leafGroup,
            sashW - 110,
            sashH - 110,
            0,
            0,
            0,
            item.dividerCount ?? 1,
            materials.sash,
            materials.wire,
            showWireframe
          );
        }

        // Handle
        const handleX = isRightHinged ? -sashW / 2 + 15 : sashW / 2 - 15;
        createHandle(leafGroup, handleX, 0, sashDepth / 2 + 4, materials.hardware, 'casement_lever');
      }
    }
  }

  // C. Transom Windows (Side-opening single panel or 2-panel)
  else if (kind.startsWith('transom_')) {
    let panels = 1;
    if (kind === 'transom_2_panel') panels = 2;

    const transomOuterProfileSize = 60; // 60mm outer transom profile
    const mullionW = panels > 1 ? transomOuterProfileSize : 0; // Same 60mm outer transom profile used as mullion
    const bayW = panels > 1 ? (innerW - mullionW) / panels : innerW;
    const bayH = innerH; // H - 120mm

    if (panels > 1) {
      // Central Mullion: uses Outer Transom Profile (60mm), length H - 120
      createExtrusionBar(
        outerFrameGroup,
        mullionW,
        bayH,
        frameDepth,
        0,
        H / 2,
        0,
        materials.frame,
        materials.wire,
        showWireframe,
        'Outer Transom Center Mullion Profile (60mm)',
        `Dividing Mullion using Outer Transom Profile (${bayH}mm, 90° Square Cut)`,
        `${mullionW} × ${bayH} × ${frameDepth} mm`
      );

      // 55mm Iron Angle Cleats for Mullion connection at top and bottom
      if (showIronCleats) {
        createCornerIronAngleCleat(
          outerFrameGroup,
          0,
          H - transomOuterProfileSize,
          0,
          180,
          materials,
          showWireframe,
          55,
          '55mm Outer Transom Mullion Angle Cleat (Unified Transom Iron Angle Profile)'
        );
        createCornerIronAngleCleat(
          outerFrameGroup,
          0,
          transomOuterProfileSize,
          0,
          0,
          materials,
          showWireframe,
          55,
          '55mm Outer Transom Mullion Angle Cleat (Unified Transom Iron Angle Profile)'
        );
      }
    }

    for (let p = 0; p < panels; p++) {
      // Inner structural transom panel opens to the side like casement
      const sashW = bayW - 8;
      const sashH = bayH - 8;
      const bayCenterX = panels > 1
        ? (p === 0 ? -halfW + transomOuterProfileSize + bayW / 2 : halfW - transomOuterProfileSize - bayW / 2)
        : 0;

      // Hinging: for 2-panel, left hinges on left, right hinges on right
      const isRightHinged = panels > 1 ? p === 1 : false;
      const hingeX = isRightHinged ? bayCenterX + sashW / 2 : bayCenterX - sashW / 2;
      const openAngle = isRightHinged
        ? -(openPct / 100) * (Math.PI / 2.2)
        : (openPct / 100) * (Math.PI / 2.2);

      const hingeGroup = new THREE.Group();
      hingeGroup.position.set(hingeX, H / 2, frameDepth / 2 + explodeOffset * 0.4);
      hingeGroup.rotation.y = openAngle; // Side opening like casement!
      sashesGroup.add(hingeGroup);

      const leafGroup = new THREE.Group();
      leafGroup.position.set(isRightHinged ? -sashW / 2 : sashW / 2, 0, 0);
      hingeGroup.add(leafGroup);

      // Inner structural frame: 45° miter cuts on all corners
      createCasementMiterSashFrame(
        leafGroup,
        sashW,
        sashH,
        sashDepth,
        45, // 45mm inner structural transom profile
        materials.sash,
        materials.wire,
        materials.glass,
        materials.ironAngle,
        showWireframe,
        showIronCleats,
        `Inner Structural Transom Sash #${p + 1} (45° Miter)`,
        `${sashW} × ${sashH} mm`
      );

      // 45mm Inner Structural Corner Iron Angles (4 corners - Unified Transom Iron Angle Profile)
      if (showIronCleats) {
        const halfSW = sashW / 2;
        const halfSH = sashH / 2;
        createCornerIronAngleCleat(leafGroup, -halfSW + 6, -halfSH + 6, 0, 0, materials, showWireframe, 45, '45mm Inner Structural Transom Iron Angle Cleat (Unified Profile)');
        createCornerIronAngleCleat(leafGroup, halfSW - 6, -halfSH + 6, 0, 90, materials, showWireframe, 45, '45mm Inner Structural Transom Iron Angle Cleat (Unified Profile)');
        createCornerIronAngleCleat(leafGroup, halfSW - 6, halfSH - 6, 0, 180, materials, showWireframe, 45, '45mm Inner Structural Transom Iron Angle Cleat (Unified Profile)');
        createCornerIronAngleCleat(leafGroup, -halfSW + 6, halfSH - 6, 0, 270, materials, showWireframe, 45, '45mm Inner Structural Transom Iron Angle Cleat (Unified Profile)');
      }

      // Transom Stoppers: Top & Bottom articulated friction stays connecting the opening panel to the outer frame
      createTransomConnectedFrictionStopper(
        sashesGroup,
        true, // isTop
        isRightHinged,
        bayCenterX,
        bayW,
        hingeX,
        hingeGroup.position,
        openAngle,
        sashW,
        sashH,
        sashDepth,
        H,
        transomOuterProfileSize,
        materials,
        showWireframe
      );

      createTransomConnectedFrictionStopper(
        sashesGroup,
        false, // isBottom
        isRightHinged,
        bayCenterX,
        bayW,
        hingeX,
        hingeGroup.position,
        openAngle,
        sashW,
        sashH,
        sashDepth,
        H,
        transomOuterProfileSize,
        materials,
        showWireframe
      );

      // Transom Pressing Handle (1 per panel, locks window panel to outer frame)
      const handleX = isRightHinged ? -sashW / 2 + 16 : sashW / 2 - 16;
      createHandle(leafGroup, handleX, 0, sashDepth / 2 + 4, materials.hardware, 'transom_pressing');
    }
  }

  // D. Hinged Doors & Fixed Picture Windows
  else {
    // 1-Pane Large Fixed Window / Hinged Door
    createGlassPane(
      sashesGroup,
      innerW - 15,
      innerH - 15,
      glassThickness,
      0,
      H / 2,
      0,
      materials.glass,
      'Fixed Architectural Glass Light',
      `${innerW - 15} × ${innerH - 15} mm`
    );
  }

  // 4. Burglary Proofing Bars & Security Frame (Casement & Transom only)
  const isSlidingWindow = kind.startsWith('sliding_');
  if (!isSlidingWindow && showBurglary && item.hasBurglary !== false) {
    createBurglaryBarsAndFrame(
      group,
      W,
      H,
      innerW,
      innerH,
      frameThickness,
      frameDepth,
      materials,
      showWireframe,
      explodeOffset
    );
  }

  // 5. 11:32 Insect / Mosquito Screen Net (Slidable 2-Panel System)
  if (showNet && item.hasNet !== false) {
    createInsectNetFrameAndMesh(
      group,
      innerW,
      innerH,
      H,
      frameDepth,
      materials,
      showWireframe,
      explodeOffset
    );
  }

  // 6. 3D Floating Dimension Callouts & Guidelines
  if (showDim3D) {
    create3DDimensionLines(group, W, H, frameDepth, materials.wire);
  }
}

// ==========================================
// 3D GEOMETRY HELPER UTILITIES
// ==========================================

function createMiterShapeExtrusion(
  parent: THREE.Group,
  points: [number, number][],
  depth: number,
  zPos: number,
  material: THREE.Material,
  wireMaterial: THREE.Material,
  showWireframe: boolean,
  title: string,
  desc: string,
  dims: string
) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.z = zPos;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    title,
    description: desc,
    dimensions: dims,
    material: 'Architectural Aluminium Extrusion (6063-T5) - 45° Miter Cut',
  };

  if (showWireframe) {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, wireMaterial);
    mesh.add(line);
  }

  parent.add(mesh);
  return mesh;
}

function createCornerIronAngleCleat(
  parent: THREE.Group,
  cornerX: number,
  cornerY: number,
  cornerZ: number,
  rotationAngleDeg: number,
  materials: any,
  showWireframe: boolean,
  customCleatSize: number = 35,
  customTitle?: string
) {
  const cleatGroup = new THREE.Group();
  cleatGroup.position.set(cornerX, cornerY, cornerZ);
  cleatGroup.rotation.z = (rotationAngleDeg * Math.PI) / 180;

  const cleatSize = customCleatSize; // 35mm casement or 45mm/55mm transom angle cleats
  const cleatThick = 4;
  const cleatWidth = 24;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(cleatSize, 0);
  shape.lineTo(cleatSize, cleatThick);
  shape.lineTo(cleatThick, cleatThick);
  shape.lineTo(cleatThick, cleatSize);
  shape.lineTo(0, cleatSize);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: cleatWidth, bevelEnabled: false });
  const mesh = new THREE.Mesh(geo, materials.ironAngle);
  mesh.position.z = -cleatWidth / 2;
  mesh.castShadow = true;

  mesh.userData = {
    title: customTitle || `${cleatSize}mm Corner Iron Angle Cleat`,
    description: `Internal galvanized iron angle bracket (${cleatSize}mm cut) reinforcing corner joint`,
    dimensions: `${cleatSize} × ${cleatSize} × ${cleatWidth} mm`,
    material: `Galvanized Iron Cleat (${cleatSize}mm)`,
  };

  if (showWireframe) {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, materials.wire);
    mesh.add(line);
  }

  cleatGroup.add(mesh);

  // Fastener screw heads
  const screwGeo = new THREE.CylinderGeometry(2.5, 2.5, 3, 8);
  const screw1 = new THREE.Mesh(screwGeo, materials.hardware);
  screw1.rotation.x = Math.PI / 2;
  screw1.position.set(cleatSize * 0.6, cleatThick / 2, 0);
  cleatGroup.add(screw1);

  const screw2 = new THREE.Mesh(screwGeo, materials.hardware);
  screw2.rotation.y = Math.PI / 2;
  screw2.position.set(cleatThick / 2, cleatSize * 0.6, 0);
  cleatGroup.add(screw2);

  parent.add(cleatGroup);
}

function createTransomOuterFrame(
  parent: THREE.Group,
  W: number,
  H: number,
  thickness: number, // 60mm outer transom profile
  depth: number,
  materials: any,
  showWireframe: boolean,
  showIronCleats: boolean
) {
  const halfW = W / 2;
  const jambH = H - thickness * 2; // H - 120mm

  // 1. Top Head Profile (Transom Outer Profile - Full Width W, sits on top of jambs)
  createExtrusionBar(
    parent,
    W,
    thickness,
    depth,
    0,
    H - thickness / 2,
    0,
    materials.frame,
    materials.wire,
    showWireframe,
    'Transom / Outer Transom Profile (Top Width)',
    `Horizontal Top Rail Full Width W (${W}mm, 90° Square Cut)`,
    `${W} × ${thickness} × ${depth} mm`
  );

  // 2. Bottom Sill Profile (Transom Outer Profile - Full Width W, jambs sit on top of it)
  createExtrusionBar(
    parent,
    W,
    thickness,
    depth,
    0,
    thickness / 2,
    0,
    materials.frame,
    materials.wire,
    showWireframe,
    'Transom / Outer Transom Profile (Bottom Width)',
    `Horizontal Bottom Rail Full Width W (${W}mm, 90° Square Cut)`,
    `${W} × ${thickness} × ${depth} mm`
  );

  // 3. Left Side Jamb (Transom Outer Profile - Sits on Bottom Width, H - 120mm)
  createExtrusionBar(
    parent,
    thickness,
    jambH,
    depth,
    -halfW + thickness / 2,
    H / 2,
    0,
    materials.frame,
    materials.wire,
    showWireframe,
    'Transom / Outer Transom Profile (Left Height Jamb)',
    `Vertical Left Jamb (H - 120mm = ${jambH}mm, 90° Square Cut)`,
    `${thickness} × ${jambH} × ${depth} mm`
  );

  // 4. Right Side Jamb (Transom Outer Profile - Sits on Bottom Width, H - 120mm)
  createExtrusionBar(
    parent,
    thickness,
    jambH,
    depth,
    halfW - thickness / 2,
    H / 2,
    0,
    materials.frame,
    materials.wire,
    showWireframe,
    'Transom / Outer Transom Profile (Right Height Jamb)',
    `Vertical Right Jamb (H - 120mm = ${jambH}mm, 90° Square Cut)`,
    `${thickness} × ${jambH} × ${depth} mm`
  );

  // 5. 55mm Outer Transom Iron Angle Cleats at 4 corner joints
  if (showIronCleats) {
    const cleatSize = 55;
    const cleatInset = thickness;
    // Bottom-Left
    createCornerIronAngleCleat(
      parent,
      -halfW + cleatInset,
      cleatInset,
      0,
      0,
      materials,
      showWireframe,
      cleatSize,
      '55mm Outer Transom Iron Angle Cleat (Unified Transom Iron Angle Profile)'
    );
    // Bottom-Right
    createCornerIronAngleCleat(
      parent,
      halfW - cleatInset,
      cleatInset,
      0,
      90,
      materials,
      showWireframe,
      cleatSize,
      '55mm Outer Transom Iron Angle Cleat (Unified Transom Iron Angle Profile)'
    );
    // Top-Right
    createCornerIronAngleCleat(
      parent,
      halfW - cleatInset,
      H - cleatInset,
      0,
      180,
      materials,
      showWireframe,
      cleatSize,
      '55mm Outer Transom Iron Angle Cleat (Unified Transom Iron Angle Profile)'
    );
    // Top-Left
    createCornerIronAngleCleat(
      parent,
      -halfW + cleatInset,
      H - cleatInset,
      0,
      270,
      materials,
      showWireframe,
      cleatSize,
      '55mm Outer Transom Iron Angle Cleat (Unified Transom Iron Angle Profile)'
    );
  }
}

function createConnectingStayArm(
  parent: THREE.Group,
  pA: THREE.Vector3,
  pB: THREE.Vector3,
  width: number,
  thickness: number,
  material: THREE.Material,
  userData: any
) {
  const dir = new THREE.Vector3().subVectors(pB, pA);
  const len = dir.length();
  if (len < 0.5) return null;

  const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
  const geo = new THREE.BoxGeometry(width, thickness, len);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(mid);
  mesh.lookAt(pB);
  mesh.userData = userData;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createPivotPin(
  parent: THREE.Group,
  pos: THREE.Vector3,
  radius: number,
  height: number,
  material: THREE.Material,
  userData: any
) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 12);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(pos);
  mesh.userData = userData;
  parent.add(mesh);
  return mesh;
}

function createTransomConnectedFrictionStopper(
  parent: THREE.Group,
  isTop: boolean,
  isRightHinged: boolean,
  bayCenterX: number,
  bayW: number,
  hingeX: number,
  hingeGroupPos: THREE.Vector3,
  openAngle: number,
  sashW: number,
  sashH: number,
  sashDepth: number,
  H: number,
  transomOuterProfileSize: number,
  materials: any,
  showWireframe: boolean
) {
  const stopperGroup = new THREE.Group();
  const dir = isRightHinged ? -1 : 1;

  // Track length based on panel opening size
  const trackLen = Math.min(260, Math.max(130, sashW * 0.52));
  const outerRailY = isTop ? (H - transomOuterProfileSize - 2) : (transomOuterProfileSize + 2);
  const trackZ = hingeGroupPos.z - sashDepth / 2;

  // 1. Outer Frame Track Channel (fixed to outer frame rail)
  const trackStartX = hingeX + dir * 14;
  const trackEndX = trackStartX + dir * trackLen;
  const trackMidX = (trackStartX + trackEndX) / 2;

  const trackGeo = new THREE.BoxGeometry(trackLen, 3.5, 14);
  const trackMesh = new THREE.Mesh(trackGeo, materials.hardware);
  trackMesh.position.set(trackMidX, outerRailY, trackZ);
  trackMesh.userData = {
    title: isTop ? 'Transom Top Stopper Track' : 'Transom Bottom Stopper Track',
    description: 'Fixed stainless steel guide channel on outer transom frame for friction stopper',
    dimensions: `${Math.round(trackLen)} × 14 × 3.5 mm`,
    material: 'Grade 304 Stainless Steel Track',
  };
  stopperGroup.add(trackMesh);

  // 2. Fixed Outer Track Pivot
  const outerPivot = new THREE.Vector3(trackStartX + dir * 18, outerRailY + (isTop ? -2 : 2), trackZ);
  createPivotPin(stopperGroup, outerPivot, 3.2, 5, materials.hardware, {
    title: 'Transom Stopper Frame Pivot',
    description: 'Stainless steel anchor pivot securing stay arm to outer frame channel',
    dimensions: 'Ø6.4 × 5 mm',
    material: 'Stainless Steel Pivot Pin',
  });

  // 3. Sliding Friction Block on Outer Track
  const openRatio = Math.min(1, Math.abs(openAngle) / (Math.PI / 2.2));
  const sliderTravel = (trackLen - 45) * (1 - openRatio * 0.52);
  const sliderPos = new THREE.Vector3(outerPivot.x + dir * sliderTravel, outerRailY + (isTop ? -2 : 2), trackZ);

  const sliderGeo = new THREE.BoxGeometry(16, 4, 10);
  const sliderMesh = new THREE.Mesh(sliderGeo, materials.hardware);
  sliderMesh.position.copy(sliderPos);
  sliderMesh.userData = {
    title: 'Transom Stopper Friction Slider',
    description: 'Sliding friction shoe with nylon/brass pad that holds the opening panel at desired angle',
    dimensions: '16 × 10 × 4 mm',
    material: 'Brass & Stainless Steel Friction Slider',
  };
  stopperGroup.add(sliderMesh);

  // 4. Sash Attachment Point (mounted on rotating opening panel)
  const sashAttachDist = Math.min(210, Math.max(110, sashW * 0.46));
  const localVec = new THREE.Vector3(dir * sashAttachDist, 0, -2);
  localVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), openAngle);

  const sashPivotY = isTop ? (H / 2 + sashH / 2 - 2) : (H / 2 - sashH / 2 + 2);
  const sashPivot = new THREE.Vector3(
    hingeGroupPos.x + localVec.x,
    sashPivotY,
    hingeGroupPos.z + localVec.z
  );

  createPivotPin(stopperGroup, sashPivot, 3.2, 5, materials.hardware, {
    title: 'Transom Stopper Sash Pivot',
    description: 'Connecting pivot securing stopper arm to the opening structural sash panel',
    dimensions: 'Ø6.4 × 5 mm',
    material: 'Stainless Steel Sash Pivot Pin',
  });

  // 5. Primary Articulated Stay Arm (physically connecting Outer Frame Track to Opening Panel)
  const primaryArmData = {
    title: isTop ? 'Transom Top Stopper (Stay Arm)' : 'Transom Bottom Stopper (Stay Arm)',
    description: 'Heavy-duty stainless steel stay arm physically connecting the opening panel to the outer frame',
    dimensions: `${Math.round(outerPivot.distanceTo(sashPivot))} × 8 × 3 mm`,
    material: 'Grade 304 Stainless Steel Stay Arm',
  };
  createConnectingStayArm(stopperGroup, outerPivot, sashPivot, 8, 2.8, materials.hardware, primaryArmData);

  // 6. Secondary Scissor Link Arm (connecting Slider to Primary Arm Midpoint)
  const mid1 = new THREE.Vector3().addVectors(outerPivot, sashPivot).multiplyScalar(0.5);
  createPivotPin(stopperGroup, mid1, 2.5, 4.5, materials.hardware, {
    title: 'Transom Stopper Scissor Knuckle',
    description: 'Central articulated scissor joint connecting primary stay arm and guide link',
    dimensions: 'Ø5 × 4.5 mm',
    material: 'Stainless Steel Rivet Knuckle',
  });

  const secondaryArmData = {
    title: 'Transom Stopper Scissor Guide Link',
    description: 'Articulated guide link connecting track friction slider to primary stay arm',
    dimensions: `${Math.round(sliderPos.distanceTo(mid1))} × 7 × 2.5 mm`,
    material: 'Grade 304 Stainless Steel Link',
  };
  createConnectingStayArm(stopperGroup, sliderPos, mid1, 7, 2.5, materials.hardware, secondaryArmData);

  parent.add(stopperGroup);
}

function createCasementMiterOuterFrame(
  parent: THREE.Group,
  W: number,
  H: number,
  thickness: number,
  depth: number,
  materials: any,
  showWireframe: boolean,
  showIronCleats: boolean
) {
  const halfW = W / 2;
  const zPos = -depth / 2;

  // 1. Top Head Profile (Casement Outer Width - 45° Miter on both ends)
  const topPoints: [number, number][] = [
    [-halfW, H],
    [halfW, H],
    [halfW - thickness, H - thickness],
    [-halfW + thickness, H - thickness],
  ];
  createMiterShapeExtrusion(
    parent,
    topPoints,
    depth,
    zPos,
    materials.frame,
    materials.wire,
    showWireframe,
    'Casement Outer Width Profile (Top Head)',
    `Horizontal Top Rail with 45° Miter Cut (${W}mm)`,
    `${W} × ${thickness} × ${depth} mm`
  );

  // 2. Bottom Sill Profile (Casement Outer Width - 45° Miter on both ends)
  const bottomPoints: [number, number][] = [
    [-halfW, 0],
    [halfW, 0],
    [halfW - thickness, thickness],
    [-halfW + thickness, thickness],
  ];
  createMiterShapeExtrusion(
    parent,
    bottomPoints,
    depth,
    zPos,
    materials.frame,
    materials.wire,
    showWireframe,
    'Casement Outer Width Profile (Bottom Sill)',
    `Horizontal Bottom Rail with 45° Miter Cut (${W}mm)`,
    `${W} × ${thickness} × ${depth} mm`
  );

  // 3. Left Side Jamb (Casement Outer Height - 45° Miter on both ends)
  const leftPoints: [number, number][] = [
    [-halfW, 0],
    [-halfW + thickness, thickness],
    [-halfW + thickness, H - thickness],
    [-halfW, H],
  ];
  createMiterShapeExtrusion(
    parent,
    leftPoints,
    depth,
    zPos,
    materials.frame,
    materials.wire,
    showWireframe,
    'Casement Outer Height Profile (Left Side Jamb)',
    `Vertical Side Jamb with 45° Miter Cut (${H}mm)`,
    `${thickness} × ${H} × ${depth} mm`
  );

  // 4. Right Side Jamb (Casement Outer Height - 45° Miter on both ends)
  const rightPoints: [number, number][] = [
    [halfW, 0],
    [halfW - thickness, thickness],
    [halfW - thickness, H - thickness],
    [halfW, H],
  ];
  createMiterShapeExtrusion(
    parent,
    rightPoints,
    depth,
    zPos,
    materials.frame,
    materials.wire,
    showWireframe,
    'Casement Outer Height Profile (Right Side Jamb)',
    `Vertical Side Jamb with 45° Miter Cut (${H}mm)`,
    `${thickness} × ${H} × ${depth} mm`
  );

  // 5. 35mm Corner Iron Angle Cleats at all 4 miter corners
  if (showIronCleats) {
    const cleatInset = 6;
    // Bottom-Left (Angle 0°)
    createCornerIronAngleCleat(
      parent,
      -halfW + cleatInset,
      cleatInset,
      0,
      0,
      materials,
      showWireframe
    );
    // Bottom-Right (Angle 90°)
    createCornerIronAngleCleat(
      parent,
      halfW - cleatInset,
      cleatInset,
      0,
      90,
      materials,
      showWireframe
    );
    // Top-Right (Angle 180°)
    createCornerIronAngleCleat(
      parent,
      halfW - cleatInset,
      H - cleatInset,
      0,
      180,
      materials,
      showWireframe
    );
    // Top-Left (Angle 270°)
    createCornerIronAngleCleat(
      parent,
      -halfW + cleatInset,
      H - cleatInset,
      0,
      270,
      materials,
      showWireframe
    );
  }
}

function createCasementMiterSashFrame(
  parent: THREE.Group,
  width: number,
  height: number,
  depth: number,
  borderWidth: number,
  sashMat: THREE.Material,
  wireMat: THREE.Material,
  glassMat: THREE.Material,
  ironAngleMat: THREE.Material,
  showWireframe: boolean,
  showIronCleats: boolean,
  title: string,
  dims: string
) {
  const halfW = width / 2;
  const halfH = height / 2;
  const zPos = -depth / 2;

  // Sash Top Rail (45° Miter)
  const topPoints: [number, number][] = [
    [-halfW, halfH],
    [halfW, halfH],
    [halfW - borderWidth, halfH - borderWidth],
    [-halfW + borderWidth, halfH - borderWidth],
  ];
  createMiterShapeExtrusion(
    parent,
    topPoints,
    depth,
    zPos,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Top Rail`,
    `Casement De-Curve Sash Top Bar (${width}mm)`,
    `${width} × ${borderWidth} mm`
  );

  // Sash Bottom Rail (45° Miter)
  const bottomPoints: [number, number][] = [
    [-halfW, -halfH],
    [halfW, -halfH],
    [halfW - borderWidth, -halfH + borderWidth],
    [-halfW + borderWidth, -halfH + borderWidth],
  ];
  createMiterShapeExtrusion(
    parent,
    bottomPoints,
    depth,
    zPos,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Bottom Rail`,
    `Casement De-Curve Sash Bottom Bar (${width}mm)`,
    `${width} × ${borderWidth} mm`
  );

  // Sash Left Stile (45° Miter)
  const leftPoints: [number, number][] = [
    [-halfW, -halfH],
    [-halfW + borderWidth, -halfH + borderWidth],
    [-halfW + borderWidth, halfH - borderWidth],
    [-halfW, halfH],
  ];
  createMiterShapeExtrusion(
    parent,
    leftPoints,
    depth,
    zPos,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Left Stile`,
    `Casement De-Curve Sash Left Stile (${height}mm)`,
    `${borderWidth} × ${height} mm`
  );

  // Sash Right Stile (45° Miter)
  const rightPoints: [number, number][] = [
    [halfW, -halfH],
    [halfW - borderWidth, -halfH + borderWidth],
    [halfW - borderWidth, halfH - borderWidth],
    [halfW, halfH],
  ];
  createMiterShapeExtrusion(
    parent,
    rightPoints,
    depth,
    zPos,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Right Stile`,
    `Casement De-Curve Sash Right Stile (${height}mm)`,
    `${borderWidth} × ${height} mm`
  );

  // Infill Glass Pane
  const glassW = width - borderWidth * 2 + 12;
  const glassH = height - borderWidth * 2 + 12;
  createGlassPane(
    parent,
    glassW,
    glassH,
    6,
    0,
    0,
    0,
    glassMat,
    `${title} Glass Pane`,
    `${glassW} × ${glassH} mm`
  );
}

function createBurglaryBarsAndFrame(
  parent: THREE.Group,
  W: number,
  H: number,
  innerW: number,
  innerH: number,
  frameThickness: number,
  frameDepth: number,
  materials: any,
  showWireframe: boolean,
  explodeOffset: number
) {
  const burglaryGroup = new THREE.Group();
  burglaryGroup.position.z = frameDepth / 2 + 25 + explodeOffset * 0.6;
  const halfW = W / 2;
  const bThick = 25; // 25mm burglary framing profile

  // Burglary Top Frame
  createExtrusionBar(
    burglaryGroup,
    W - 10,
    bThick,
    20,
    0,
    H - frameThickness + bThick / 2 - 5,
    0,
    materials.burglary,
    materials.wire,
    showWireframe,
    'Burglary Top Security Frame Profile',
    `Top Security Channel Profile (${W}mm)`,
    `${W} × ${bThick} × 20 mm`
  );

  // Burglary Bottom Frame
  createExtrusionBar(
    burglaryGroup,
    W - 10,
    bThick,
    20,
    0,
    frameThickness - bThick / 2 + 5,
    0,
    materials.burglary,
    materials.wire,
    showWireframe,
    'Burglary Bottom Security Frame Profile',
    `Bottom Security Channel Profile (${W}mm)`,
    `${W} × ${bThick} × 20 mm`
  );

  // Burglary Left Frame
  createExtrusionBar(
    burglaryGroup,
    bThick,
    H - frameThickness * 2,
    20,
    -halfW + frameThickness - bThick / 2 + 5,
    H / 2,
    0,
    materials.burglary,
    materials.wire,
    showWireframe,
    'Burglary Left Side Frame Profile',
    `Vertical Side Security Channel (${H}mm)`,
    `${bThick} × ${H} × 20 mm`
  );

  // Burglary Right Frame
  createExtrusionBar(
    burglaryGroup,
    bThick,
    H - frameThickness * 2,
    20,
    halfW - frameThickness + bThick / 2 - 5,
    H / 2,
    0,
    materials.burglary,
    materials.wire,
    showWireframe,
    'Burglary Right Side Frame Profile',
    `Vertical Side Security Channel (${H}mm)`,
    `${bThick} × ${H} × 20 mm`
  );

  // Ballo Straight Burglary Iron Rods (Horizontal steel rods with 50mm pressed end tabs, spaced 120-140mm)
  const targetSpacing = 125;
  const numDivisions = Math.max(2, Math.round(innerH / targetSpacing));
  const rodSpacing = innerH / numDivisions;
  const numRods = Math.max(1, numDivisions - 1);
  const rodLength = W + 40;

  for (let r = 1; r <= numRods; r++) {
    const rodY = frameThickness + r * rodSpacing;
    const rodGeo = new THREE.CylinderGeometry(6, 6, rodLength, 12);
    const rodMesh = new THREE.Mesh(rodGeo, materials.burglary);
    rodMesh.rotation.z = Math.PI / 2;
    rodMesh.position.set(0, rodY, 0);
    rodMesh.castShadow = true;

    rodMesh.userData = {
      title: `Ballo Straight Iron Rod #${r}`,
      description: `Solid steel security bar with 50mm pressed end tabs embedded into burglary frame (${rodLength}mm)`,
      dimensions: `Ø12mm × ${rodLength}mm (50mm end tab)`,
      material: 'Hardened Solid Iron / Steel Rod (Ballo Straight)',
    };

    if (showWireframe) {
      const edges = new THREE.EdgesGeometry(rodGeo);
      const line = new THREE.LineSegments(edges, materials.wire);
      rodMesh.add(line);
    }

    burglaryGroup.add(rodMesh);
  }

  parent.add(burglaryGroup);
}

function createInsectNetFrameAndMesh(
  parent: THREE.Group,
  innerW: number,
  innerH: number,
  H: number,
  frameDepth: number,
  materials: any,
  showWireframe: boolean,
  explodeOffset: number
) {
  const netGroup = new THREE.Group();
  // Set Y to H / 2 to center the net screen inside the window opening (prevent hanging below the window)
  netGroup.position.set(0, H / 2, frameDepth / 2 + 12 + explodeOffset * 0.5);

  const netFrameWidth = 20; // 20mm 11:32 face width
  const netDepth = 12; // 11:32 profile depth

  // Divide normal width by 2 so it separates and is slidable:
  const panelW = (innerW - 4) / 2;
  const panelH = innerH - 6;

  // Panel #1 (Left Slidable Screen)
  const leftPanelGroup = new THREE.Group();
  leftPanelGroup.position.set(-innerW / 4, 0, -2);
  netGroup.add(leftPanelGroup);

  createSashFrameBox(
    leftPanelGroup,
    panelW,
    panelH,
    netDepth,
    netFrameWidth,
    materials.frame,
    materials.wire,
    materials.netMesh,
    showWireframe,
    '11:32 Slidable Net Screen (Left Panel)',
    `${panelW.toFixed(0)} × ${panelH.toFixed(0)} mm`
  );

  // Panel #2 (Right Slidable Screen with separate meeting stile and sliding track offset)
  const rightPanelGroup = new THREE.Group();
  rightPanelGroup.position.set(innerW / 4, 0, 2);
  netGroup.add(rightPanelGroup);

  createSashFrameBox(
    rightPanelGroup,
    panelW,
    panelH,
    netDepth,
    netFrameWidth,
    materials.frame,
    materials.wire,
    materials.netMesh,
    showWireframe,
    '11:32 Slidable Net Screen (Right Panel)',
    `${panelW.toFixed(0)} × ${panelH.toFixed(0)} mm`
  );

  parent.add(netGroup);
}

function createGlazingDividers(
  parent: THREE.Group,
  spanW: number,
  spanH: number,
  centerX: number,
  centerY: number,
  centerZ: number,
  dividerCount: number,
  barMaterial: THREE.Material,
  wireMaterial: THREE.Material,
  showWireframe: boolean
) {
  const dividerGroup = new THREE.Group();
  dividerGroup.position.set(centerX, centerY, centerZ);

  const barThick = 18; // 18mm Georgian divider bar
  const barDepth = 8;

  // Vertical dividers
  const vCols = dividerCount + 1;
  const colSpacing = spanW / vCols;
  for (let c = 1; c < vCols; c++) {
    const x = -spanW / 2 + c * colSpacing;
    createExtrusionBar(
      dividerGroup,
      barThick,
      spanH,
      barDepth,
      x,
      0,
      0,
      barMaterial,
      wireMaterial,
      showWireframe,
      `Vertical Glazing Divider Bar #${c}`,
      `Colonial/Georgian Architectural Bar (${spanH}mm)`,
      `${barThick} × ${spanH} mm`
    );
  }

  // Horizontal dividers
  const hRows = Math.max(2, dividerCount + 1);
  const rowSpacing = spanH / hRows;
  for (let r = 1; r < hRows; r++) {
    const y = -spanH / 2 + r * rowSpacing;
    createExtrusionBar(
      dividerGroup,
      spanW,
      barThick,
      barDepth,
      0,
      y,
      0,
      barMaterial,
      wireMaterial,
      showWireframe,
      `Horizontal Glazing Divider Bar #${r}`,
      `Colonial/Georgian Architectural Bar (${spanW}mm)`,
      `${spanW} × ${barThick} mm`
    );
  }

  parent.add(dividerGroup);
}

function createExtrusionBar(
  parent: THREE.Group,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  wireMaterial: THREE.Material,
  showWireframe: boolean,
  title: string,
  desc: string,
  dims: string
) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    title,
    description: desc,
    dimensions: dims,
    material: 'Architectural Aluminium Extrusion (6063-T5)',
  };

  if (showWireframe) {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, wireMaterial);
    mesh.add(line);
  }

  parent.add(mesh);
  return mesh;
}

function createSashFrameBox(
  parent: THREE.Group,
  width: number,
  height: number,
  depth: number,
  borderWidth: number,
  sashMat: THREE.Material,
  wireMat: THREE.Material,
  glassMat: THREE.Material,
  showWireframe: boolean,
  title: string,
  dims: string
) {
  // Sash Top Rail
  createExtrusionBar(
    parent,
    width,
    borderWidth,
    depth,
    0,
    height / 2 - borderWidth / 2,
    0,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Top Rail`,
    `Horizontal Top Sash Bar (${width}mm)`,
    `${width} × ${borderWidth} mm`
  );

  // Sash Bottom Rail
  createExtrusionBar(
    parent,
    width,
    borderWidth,
    depth,
    0,
    -height / 2 + borderWidth / 2,
    0,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Bottom Rail`,
    `Horizontal Bottom Sash Bar (${width}mm)`,
    `${width} × ${borderWidth} mm`
  );

  // Sash Left Stile
  createExtrusionBar(
    parent,
    borderWidth,
    height - borderWidth * 2,
    depth,
    -width / 2 + borderWidth / 2,
    0,
    0,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Left Stile`,
    `Vertical Sash Stile (${height}mm)`,
    `${borderWidth} × ${height - borderWidth * 2} mm`
  );

  // Sash Right Stile
  createExtrusionBar(
    parent,
    borderWidth,
    height - borderWidth * 2,
    depth,
    width / 2 - borderWidth / 2,
    0,
    0,
    sashMat,
    wireMat,
    showWireframe,
    `${title} - Right Stile`,
    `Vertical Sash Stile (${height}mm)`,
    `${borderWidth} × ${height - borderWidth * 2} mm`
  );

  // Infill Glass Pane inside Sash
  const glassW = width - borderWidth * 2 + 10;
  const glassH = height - borderWidth * 2 + 10;
  createGlassPane(
    parent,
    glassW,
    glassH,
    6,
    0,
    0,
    0,
    glassMat,
    `${title} Glass Pane`,
    `${glassW} × ${glassH} mm`
  );
}

function createGlassPane(
  parent: THREE.Group,
  width: number,
  height: number,
  thickness: number,
  x: number,
  y: number,
  z: number,
  glassMaterial: THREE.Material,
  title: string,
  dims: string
) {
  const geo = new THREE.BoxGeometry(width, height, thickness);
  const glassMesh = new THREE.Mesh(geo, glassMaterial);
  glassMesh.position.set(x, y, z);
  glassMesh.castShadow = false;
  glassMesh.receiveShadow = true;

  glassMesh.userData = {
    title,
    description: 'Glazing Pane Unit with EPDM perimeter gaskets',
    dimensions: dims,
    material: 'Float/Tempered Glass (6mm)',
  };

  parent.add(glassMesh);
  return glassMesh;
}

function createHandle(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  hardwareMat: THREE.Material,
  type: 'casement_lever' | 'sliding_latch' | 'cockspur' | 'flush_pull' | 'transom_pressing'
) {
  const handleGroup = new THREE.Group();
  handleGroup.position.set(x, y, z);

  if (type === 'casement_lever') {
    // Escutcheon plate
    const baseGeo = new THREE.BoxGeometry(16, 60, 6);
    const baseMesh = new THREE.Mesh(baseGeo, hardwareMat);
    handleGroup.add(baseMesh);

    // Lever arm
    const leverGeo = new THREE.BoxGeometry(8, 12, 65);
    const leverMesh = new THREE.Mesh(leverGeo, hardwareMat);
    leverMesh.position.set(0, -20, 35);
    leverMesh.rotation.x = Math.PI / 2;
    handleGroup.add(leverMesh);
  } else if (type === 'transom_pressing') {
    // Transom Pressing Handle (locks window panel to outer frame)
    const baseGeo = new THREE.BoxGeometry(18, 52, 8);
    const baseMesh = new THREE.Mesh(baseGeo, hardwareMat);
    handleGroup.add(baseMesh);

    const pressLeverGeo = new THREE.BoxGeometry(10, 14, 50);
    const pressLeverMesh = new THREE.Mesh(pressLeverGeo, hardwareMat);
    pressLeverMesh.position.set(0, -14, 26);
    pressLeverMesh.rotation.x = Math.PI / 2.3;
    handleGroup.add(pressLeverMesh);

    const camGeo = new THREE.BoxGeometry(12, 10, 14);
    const camMesh = new THREE.Mesh(camGeo, hardwareMat);
    camMesh.position.set(0, 8, -6);
    handleGroup.add(camMesh);

    handleGroup.userData = {
      title: 'Transom Pressing Handle',
      description: 'Pressing handle used to lock the structural window panel securely to the outer frame',
      dimensions: '18 × 52 × 50 mm',
      material: 'Architectural Transom Pressing Locking Handle',
    };
  } else if (type === 'cockspur') {
    const baseGeo = new THREE.BoxGeometry(20, 45, 8);
    const baseMesh = new THREE.Mesh(baseGeo, hardwareMat);
    handleGroup.add(baseMesh);

    const spurGeo = new THREE.BoxGeometry(10, 10, 30);
    const spurMesh = new THREE.Mesh(spurGeo, hardwareMat);
    spurMesh.position.set(0, 0, 15);
    handleGroup.add(spurMesh);
  } else {
    // Flush pull / sliding latch
    const pullGeo = new THREE.BoxGeometry(22, 90, 4);
    const pullMesh = new THREE.Mesh(pullGeo, hardwareMat);
    handleGroup.add(pullMesh);
  }

  parent.add(handleGroup);
}

function create3DDimensionLines(
  parent: THREE.Group,
  W: number,
  H: number,
  D: number,
  wireMat: THREE.Material
) {
  const dimGroup = new THREE.Group();
  const halfW = W / 2;

  // Top Width Line
  const topPoints = [
    new THREE.Vector3(-halfW, H + 60, 0),
    new THREE.Vector3(halfW, H + 60, 0),
  ];
  const topGeo = new THREE.BufferGeometry().setFromPoints(topPoints);
  const topLine = new THREE.Line(topGeo, wireMat);
  dimGroup.add(topLine);

  // Top End Ticks
  const tick1 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfW, H + 40, 0),
      new THREE.Vector3(-halfW, H + 80, 0),
    ]),
    wireMat
  );
  const tick2 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(halfW, H + 40, 0),
      new THREE.Vector3(halfW, H + 80, 0),
    ]),
    wireMat
  );
  dimGroup.add(tick1);
  dimGroup.add(tick2);

  // Left Height Line
  const leftPoints = [
    new THREE.Vector3(-halfW - 60, 0, 0),
    new THREE.Vector3(-halfW - 60, H, 0),
  ];
  const leftGeo = new THREE.BufferGeometry().setFromPoints(leftPoints);
  const leftLine = new THREE.Line(leftGeo, wireMat);
  dimGroup.add(leftLine);

  // Left End Ticks
  const tick3 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfW - 80, 0, 0),
      new THREE.Vector3(-halfW - 40, 0, 0),
    ]),
    wireMat
  );
  const tick4 = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfW - 80, H, 0),
      new THREE.Vector3(-halfW - 40, H, 0),
    ]),
    wireMat
  );
  dimGroup.add(tick3);
  dimGroup.add(tick4);

  parent.add(dimGroup);
}
