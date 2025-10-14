/**
 * AudioVisualizer - Audio-reactive icosahedron with perlin noise
 * Clean implementation from scratch
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAppState, APP_STATES } from './StateManager';
import * as THREE from 'three';

const TEMPLATE_COLORS = {
  knee: '#007AFF',
  shoulder: '#5856D6',
  back: '#34C759',
  hip: '#FF9500',
  'ankle-foot': '#5AC8FA',
  neck: '#FF2D55',
  default: '#00CED1' // Cyan like reference
};

function AudioReactiveIcosahedron({ audioFrequency, templateColor }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useEffect(() => {
    if (!meshRef.current) return;

    // Create icosahedron geometry
    const geometry = new THREE.IcosahedronGeometry(2, 30);
    
    // Create shader material with perlin noise
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_frequency: { value: 0 },
        u_color: { value: new THREE.Color(templateColor) }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_frequency;
        
        // Perlin noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
        
        float pnoise(vec3 P, vec3 rep) {
          vec3 Pi0 = mod(floor(P), rep);
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P);
          vec3 Pf1 = Pf0 - vec3(1.0);
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;
          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);
          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);
          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);
          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;
          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);
          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }
        
        void main() {
          float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
          float displacement = (u_frequency / 30.0) * (noise / 10.0);
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        
        void main() {
          vec3 glowColor = u_color * 2.0;
          gl_FragColor = vec4(glowColor, 1.0);
        }
      `,
      wireframe: true,
      side: THREE.DoubleSide
    });

    meshRef.current.geometry = geometry;
    meshRef.current.material = material;
    materialRef.current = material;

  }, [templateColor]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.getElapsedTime();

    // Update uniforms
    materialRef.current.uniforms.u_time.value = time;
    materialRef.current.uniforms.u_frequency.value = audioFrequency;
    materialRef.current.uniforms.u_color.value = new THREE.Color(templateColor);

    // Rotate
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.001;
  });

  return <mesh ref={meshRef} />;
}

export default function AudioVisualizer() {
  const { appState, selectedTemplate } = useAppState();
  const [audioFrequency, setAudioFrequency] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const color = selectedTemplate ? TEMPLATE_COLORS[selectedTemplate] : TEMPLATE_COLORS.default;

  // Audio setup
  useEffect(() => {
    if (appState === APP_STATES.RECORDING) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const updateFrequency = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioFrequency(average);
            animationFrameRef.current = requestAnimationFrame(updateFrequency);
          };
          
          updateFrequency();
        })
        .catch(err => console.log('Mic access denied:', err));
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setAudioFrequency(0);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [appState]);

  return (
    <div className="relative w-full h-80 flex items-center justify-center bg-black">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={3} distance={15} decay={1.5} color={color} />
        
        <AudioReactiveIcosahedron audioFrequency={audioFrequency} templateColor={color} />
      </Canvas>

      <div className="absolute bottom-0 text-center pointer-events-none">
        <p className="text-sm font-medium text-white">
          {appState === APP_STATES.IDLE && 'Ready to begin'}
          {appState === APP_STATES.TEMPLATE_SELECTED && 'Template selected'}
          {appState === APP_STATES.RECORDING && 'Recording...'}
          {appState === APP_STATES.PROCESSING && 'Processing...'}
        </p>
      </div>
    </div>
  );
}
