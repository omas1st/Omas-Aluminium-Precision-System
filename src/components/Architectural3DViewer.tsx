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
  Grid,
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
  const [profileFinish, setProfileFinish] = useState<ProfileFinish>('charcoal');
  const [glassTint, setGlassTint] = useState<GlassTint>('clear');
  const [openPercentage, setOpenPercentage] = useState<number>(0);
  const [isAutoAnimating, setIsAutoAnimating] = useState<boolean>(false);
  const [explodedView, setExplodedView] = useState<number>(0);
  const [showWallOpening, setShowWallOpening] = useState<boolean>(true);
  const [showWireframeOverlay, setShowWireframeOverlay] = useState<boolean>(true);
  const [showDimensions3D, setShowDimensions3D] = useState<boolean>(true);
  const [showEnvironmentGrid, setShowEnvironmentGrid] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('perspective');
  const [selectedPartInfo, setSelectedPartInfo] = useState<{
    title: string;
    description: string;
    dimensions: string;
    material: string;
  } | null>(null);

  const { item, cuts, glasses } = itemResult;
  const { width: W, height: H, kind, tag } = item;

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
      showDimensions3D
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

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden shadow-2xl transition-colors duration-300 ${
        effectiveIsDark
          ? 'bg-slate-950 border border-slate-800 text-white'
          : 'bg-slate-50 border border-slate-200 text-slate-900'
      } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full rounded-2xl'}`}
    >
      {/* Top Floating Control Bar */}
      <div
        className={`absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs backdrop-blur-md transition-colors ${
          effectiveIsDark
            ? 'bg-slate-900/85 border-slate-800 text-white shadow-xl'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-md'
        }`}
      >
        {/* Left Unit Title & Type Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              effectiveIsDark
                ? 'bg-blue-600/30 border-blue-500/40 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide">{tag}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                  effectiveIsDark
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/20'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {kind.replace(/_/g, ' ')}
              </span>
            </div>
            <div
              className={`text-[11px] font-mono ${
                effectiveIsDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {W} × {H} mm &bull; Extrusion Depth: 65mm &bull; Qty: {item.quantity}
            </div>
          </div>
        </div>

        {/* Center: Camera Views Quick Selector & Background Theme Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Background Theme Selector: White, Dark, System */}
          <div
            className={`flex items-center p-1 rounded-lg border gap-0.5 ${
              effectiveIsDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 text-slate-400 hidden sm:inline">
              Canvas:
            </span>

            <button
              type="button"
              onClick={() => handleBgThemeChange('white')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                bgTheme === 'white'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="White Architectural Studio Canvas"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>White</span>
            </button>

            <button
              type="button"
              onClick={() => handleBgThemeChange('dark')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                bgTheme === 'dark'
                  ? effectiveIsDark
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-800 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dark Blueprint Night Studio Canvas"
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => handleBgThemeChange('system')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                bgTheme === 'system'
                  ? effectiveIsDark
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="System (Auto Match Device / Browser Theme)"
            >
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>System</span>
              {bgTheme === 'system' && (
                <span className="text-[9px] font-mono opacity-80">
                  ({systemIsDark ? 'Dark' : 'White'})
                </span>
              )}
            </button>
          </div>

          {/* Camera Views Quick Selector */}
          <div
            className={`flex items-center p-1 rounded-lg border gap-1 ${
              effectiveIsDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setCameraPreset('perspective')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCameraPreset === 'perspective'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="3D Perspective Orbit View"
            >
              3D Orbit
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCameraPreset === 'front'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Front Elevation"
            >
              Front
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCameraPreset === 'top'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Plan View (Top-Down)"
            >
              Plan (Top)
            </button>
            <button
              onClick={() => setCameraPreset('side')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCameraPreset === 'side'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Side Section"
            >
              Side
            </button>
            <button
              onClick={() => setCameraPreset('isometric')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeCameraPreset === 'isometric'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : effectiveIsDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Isometric Projection"
            >
              ISO
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetCamera}
            className={`p-1.5 rounded-lg border transition-colors ${
              effectiveIsDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
            title="Reset Camera Target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCaptureSnapshot}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
              effectiveIsDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 hover:text-blue-700 border-slate-200 shadow-xs'
            }`}
            title="Download 3D Architectural Snapshot"
          >
            <Camera className="w-3.5 h-3.5 text-sky-500" />
            <span>Render PNG</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border transition-colors ${
              effectiveIsDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Studio'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full min-h-[500px] sm:min-h-[560px] cursor-grab active:cursor-grabbing"
      />

      {/* Left Floating Material / Architectural Finish Control Palette */}
      <div className="absolute top-18 left-3 z-20 space-y-2 max-w-[240px] pointer-events-auto">
        {/* Powder Coat Finish Selector */}
        <div
          className={`p-3 rounded-xl border shadow-xl space-y-2 backdrop-blur-md ${
            effectiveIsDark
              ? 'bg-slate-900/90 border-slate-800/90 text-white'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              effectiveIsDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Palette className="w-3 h-3 text-blue-500" />
            <span>Aluminium Finish</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
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
                onClick={() => setProfileFinish(fin.id as ProfileFinish)}
                className={`group flex flex-col items-center p-1.5 rounded-lg border text-[9.5px] transition-all ${
                  profileFinish === fin.id
                    ? effectiveIsDark
                      ? 'border-blue-500 bg-blue-500/15 text-white font-bold ring-1 ring-blue-500'
                      : 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500 shadow-xs'
                    : effectiveIsDark
                    ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-black/10 mb-1 shadow-xs"
                  style={{ backgroundColor: fin.color }}
                />
                <span className="truncate w-full text-center">{fin.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Glass Tint Selector */}
        <div
          className={`p-3 rounded-xl border shadow-xl space-y-2 backdrop-blur-md ${
            effectiveIsDark
              ? 'bg-slate-900/90 border-slate-800/90 text-white'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              effectiveIsDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>Glass Infill Tint</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'clear', label: 'Clear 6mm', dot: '#dcf4fc' },
              { id: 'blue_reflective', label: 'Blue Solar', dot: '#38bdf8' },
              { id: 'bronze_tint', label: 'Bronze Tint', dot: '#a3714b' },
              { id: 'green_lowe', label: 'Green Low-E', dot: '#5eead4' },
              { id: 'frosted', label: 'Frosted Sat.', dot: '#cbd5e1' },
            ].map((gt) => (
              <button
                key={gt.id}
                onClick={() => setGlassTint(gt.id as GlassTint)}
                className={`px-2 py-1 rounded-md text-[10px] border flex items-center gap-1.5 transition-all ${
                  glassTint === gt.id
                    ? effectiveIsDark
                      ? 'border-sky-400 bg-sky-500/20 text-white font-bold ring-1 ring-sky-400'
                      : 'border-sky-500 bg-sky-50 text-sky-900 font-bold ring-1 ring-sky-400 shadow-xs'
                    : effectiveIsDark
                    ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: gt.dot }}></span>
                <span>{gt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Floating Architectural Simulation & View Layers */}
      <div className="absolute top-18 right-3 z-20 space-y-2 max-w-[250px] pointer-events-auto">
        {/* Sash Open / Close Slider & Interactive Animation */}
        <div
          className={`p-3.5 rounded-xl border shadow-xl space-y-2.5 backdrop-blur-md ${
            effectiveIsDark
              ? 'bg-slate-900/90 border-slate-800/90 text-white'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                effectiveIsDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <Sliders className="w-3 h-3 text-blue-500" />
              <span>Sash Operability</span>
            </span>
            <button
              onClick={() => setIsAutoAnimating(!isAutoAnimating)}
              className={`p-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                isAutoAnimating
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  : effectiveIsDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Auto Animate Open/Close"
            >
              {isAutoAnimating ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isAutoAnimating ? 'Pause' : 'Play'}</span>
            </button>
          </div>

          <div>
            <div
              className={`flex justify-between text-[11px] font-mono mb-1 ${
                effectiveIsDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <span>Position:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {openPercentage === 0 ? 'Fully Closed (0%)' : `${openPercentage}% Open`}
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
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div
              className={`flex justify-between text-[9px] mt-1 ${
                effectiveIsDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>0° / Closed</span>
              <span>Slide / Swing Angle</span>
              <span>90° / Full</span>
            </div>
          </div>

          {/* Exploded View Assembly Slider */}
          <div
            className={`pt-2 border-t ${
              effectiveIsDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}
          >
            <div
              className={`flex justify-between text-[10px] font-bold uppercase mb-1 ${
                effectiveIsDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-500" />
                <span>Exploded Assembly</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{explodedView}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={explodedView}
              onChange={(e) => setExplodedView(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* View Layer Toggles */}
        <div
          className={`p-3 rounded-xl border shadow-xl space-y-2 backdrop-blur-md ${
            effectiveIsDark
              ? 'bg-slate-900/90 border-slate-800/90 text-white'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`text-[10px] font-bold uppercase tracking-wider ${
              effectiveIsDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Architectural Layers
          </div>
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer py-0.5 hover:text-blue-500">
              <span
                className={`text-[11px] flex items-center gap-1.5 ${
                  effectiveIsDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Building2 className="w-3 h-3 text-slate-400" /> Wall Aperture Opening
              </span>
              <input
                type="checkbox"
                checked={showWallOpening}
                onChange={(e) => setShowWallOpening(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5 hover:text-blue-500">
              <span
                className={`text-[11px] flex items-center gap-1.5 ${
                  effectiveIsDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Grid className="w-3 h-3 text-slate-400" /> Technical Wireframe Edges
              </span>
              <input
                type="checkbox"
                checked={showWireframeOverlay}
                onChange={(e) => setShowWireframeOverlay(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5 hover:text-blue-500">
              <span
                className={`text-[11px] flex items-center gap-1.5 ${
                  effectiveIsDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <Eye className="w-3 h-3 text-slate-400" /> 3D Floating Dimensions
              </span>
              <input
                type="checkbox"
                checked={showDimensions3D}
                onChange={(e) => setShowDimensions3D(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Selected Part HUD Inspector if clicked */}
        {selectedPartInfo && (
          <div
            className={`p-3.5 rounded-xl border shadow-2xl space-y-1.5 animate-in fade-in duration-200 backdrop-blur-md ${
              effectiveIsDark
                ? 'bg-blue-950/90 border-blue-600/70 text-white'
                : 'bg-blue-50/95 border-blue-300 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 flex items-center gap-1">
                <Info className="w-3 h-3" /> Part Inspector
              </span>
              <button
                onClick={() => setSelectedPartInfo(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>
            <div className="font-bold text-xs">{selectedPartInfo.title}</div>
            <div className="text-[11px] text-blue-700 dark:text-blue-200">{selectedPartInfo.description}</div>
            <div
              className={`text-[10px] font-mono pt-1 border-t flex justify-between ${
                effectiveIsDark ? 'border-blue-800/80 text-slate-300' : 'border-blue-200 text-slate-600'
              }`}
            >
              <span>Cut / Size:</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedPartInfo.dimensions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Tips and HUD */}
      <div
        className={`absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] ${
          effectiveIsDark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        <div
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-3 backdrop-blur-md shadow-md ${
            effectiveIsDark
              ? 'bg-slate-900/85 border-slate-800/90 text-slate-300'
              : 'bg-white/90 border-slate-200 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-1 font-medium">
            <Compass className="w-3 h-3 text-blue-500" />
            <strong>Left Drag:</strong> Orbit 3D
          </span>
          <span>•</span>
          <span>
            <strong>Right Drag:</strong> Pan
          </span>
          <span>•</span>
          <span>
            <strong>Scroll:</strong> Zoom
          </span>
          <span>•</span>
          <span>
            <strong>Click Part:</strong> Inspect Cut Dimensions
          </span>
        </div>

        <div
          className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] backdrop-blur-md shadow-md ${
            effectiveIsDark
              ? 'bg-slate-900/85 border-slate-800/90 text-slate-400'
              : 'bg-white/90 border-slate-200 text-slate-500'
          }`}
        >
          WebGL Architectural Core &bull; 60 FPS
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
  showDim3D: boolean
) {
  // Clear any existing children
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
  }

  const { width: W, height: H, kind } = item;
  const frameDepth = 65; // Standard 65mm architectural frame depth
  const sashDepth = 35; // Standard 35mm operable sash thickness
  const glassThickness = 6; // Standard 6mm architectural glass
  const wallThick = 200; // Standard 200mm masonry wall

  const explodeOffset = (explodePct / 100) * 180; // mm

  // Center window around (0, H/2, 0)
  const halfW = W / 2;
  const frameThickness = 45;

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
    'Top Head Profile',
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
    'Bottom Sill Profile',
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
    'Left Side Jamb Profile',
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
    'Right Side Jamb Profile',
    `Outer Frame Right Jamb (${H}mm)`,
    `${frameThickness} × ${H - frameThickness * 2} × ${frameDepth} mm`
  );

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
      // 1-Pane Fixed Casement Picture Window
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

      // Bay 2: Right Operable Casement Leaf (Hinged at outer jamb)
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

      createSashFrameBox(
        leafGroup,
        sashW,
        sashH,
        sashDepth,
        55,
        materials.sash,
        materials.wire,
        materials.glass,
        showWireframe,
        'Casement Operable Vent Sash',
        `${sashW} × ${sashH} mm`
      );

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

        createSashFrameBox(
          leafGroup,
          sashW,
          sashH,
          sashDepth,
          55,
          materials.sash,
          materials.wire,
          materials.glass,
          showWireframe,
          `Casement Operable Sash #${p + 1}`,
          `${sashW} × ${sashH} mm`
        );

        // Handle
        const handleX = isRightHinged ? -sashW / 2 + 15 : sashW / 2 - 15;
        createHandle(leafGroup, handleX, 0, sashDepth / 2 + 4, materials.hardware, 'casement_lever');
      }
    }
  }

  // C. Transom / Top-Hung Windows
  else if (kind.startsWith('transom_')) {
    let panels = 1;
    if (kind === 'transom_2_panel') panels = 2;

    const mullionW = panels > 1 ? 30 : 0;
    const bayW = (innerW - (panels - 1) * mullionW) / panels;
    const bayH = innerH;

    if (panels > 1) {
      createExtrusionBar(
        group,
        mullionW,
        bayH,
        frameDepth,
        0,
        H / 2,
        0,
        materials.frame,
        materials.wire,
        showWireframe,
        'Transom Center Mullion',
        `Mullion Profile (${bayH}mm)`,
        `${mullionW} × ${bayH} × ${frameDepth} mm`
      );
    }

    for (let p = 0; p < panels; p++) {
      const sashW = bayW - 8;
      const sashH = bayH - 8;
      const bayCenterX = -halfW + frameThickness + p * (bayW + mullionW) + bayW / 2;
      const tiltAngle = (openPct / 100) * (Math.PI / 5.5); // Top-hung outwards tilt

      const topHingeGroup = new THREE.Group();
      topHingeGroup.position.set(bayCenterX, H - frameThickness - 4, frameDepth / 2 + explodeOffset * 0.4);
      topHingeGroup.rotation.x = tiltAngle;
      sashesGroup.add(topHingeGroup);

      const leafGroup = new THREE.Group();
      leafGroup.position.set(0, -sashH / 2, 0);
      topHingeGroup.add(leafGroup);

      createSashFrameBox(
        leafGroup,
        sashW,
        sashH,
        sashDepth,
        48,
        materials.sash,
        materials.wire,
        materials.glass,
        showWireframe,
        `Transom Top-Hung Sash #${p + 1}`,
        `${sashW} × ${sashH} mm`
      );

      // Bottom Cockspur Handle
      createHandle(leafGroup, 0, -sashH / 2 + 15, sashDepth / 2 + 4, materials.hardware, 'cockspur');
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

  // 4. 3D Floating Dimension Callouts & Guidelines
  if (showDim3D) {
    create3DDimensionLines(group, W, H, frameDepth, materials.wire);
  }
}

// ==========================================
// 3D GEOMETRY HELPER UTILITIES
// ==========================================

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
  type: 'casement_lever' | 'sliding_latch' | 'cockspur' | 'flush_pull'
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
