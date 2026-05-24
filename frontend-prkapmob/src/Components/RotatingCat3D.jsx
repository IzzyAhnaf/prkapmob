import { useEffect, useRef } from "react";
import * as THREE from "three";

export function RotatingCat3D({ size = 180 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const W = size;
    const H = size;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.2, 4.5);
    camera.lookAt(0, 0.5, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfff0e0, 1.2);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    // Materials
    const furMat = new THREE.MeshStandardMaterial({ color: 0x7a6652, roughness: 0.85, metalness: 0.05 });
    const darkFurMat = new THREE.MeshStandardMaterial({ color: 0x3d2e22, roughness: 0.9 });
    const whiteFurMat = new THREE.MeshStandardMaterial({ color: 0xf0ebe4, roughness: 0.8 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xe8a0b0, roughness: 0.5 });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfafafa });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1008 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0xd4a020, roughness: 0.3, metalness: 0.1 });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xe8909a, roughness: 0.7 });
    const pawMat = new THREE.MeshStandardMaterial({ color: 0x8a7060, roughness: 0.8 });

    const cat = new THREE.Group();

    // ── Body ──
    const bodyGeo = new THREE.SphereGeometry(0.72, 16, 12);
    bodyGeo.scale(1, 0.88, 0.95);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.set(0, 0, 0);
    cat.add(body);

    // Belly patch
    const bellyGeo = new THREE.SphereGeometry(0.45, 12, 10);
    bellyGeo.scale(0.9, 0.75, 0.4);
    const belly = new THREE.Mesh(bellyGeo, whiteFurMat);
    belly.position.set(0, -0.05, 0.5);
    cat.add(belly);

    // ── Head ──
    const headGeo = new THREE.SphereGeometry(0.52, 16, 12);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0, 0.95, 0.2);
    cat.add(head);

    // Cheek puffs
    for (const sx of [-1, 1]) {
      const cheekGeo = new THREE.SphereGeometry(0.22, 10, 8);
      const cheek = new THREE.Mesh(cheekGeo, whiteFurMat);
      cheek.position.set(sx * 0.32, 0.82, 0.44);
      cat.add(cheek);
    }

    // Forehead stripe
    const stripeGeo = new THREE.SphereGeometry(0.12, 8, 6);
    stripeGeo.scale(0.5, 1.6, 0.3);
    const stripe = new THREE.Mesh(stripeGeo, darkFurMat);
    stripe.position.set(0, 1.3, 0.42);
    cat.add(stripe);

    // ── Ears ──
    for (const sx of [-1, 1]) {
      const earShape = new THREE.ConeGeometry(0.2, 0.35, 3);
      const ear = new THREE.Mesh(earShape, furMat);
      ear.position.set(sx * 0.33, 1.48, 0.08);
      ear.rotation.z = sx * 0.18;
      ear.rotation.x = -0.15;
      cat.add(ear);

      const innerEarShape = new THREE.ConeGeometry(0.11, 0.22, 3);
      const innerEar = new THREE.Mesh(innerEarShape, innerEarMat);
      innerEar.position.set(sx * 0.33, 1.48, 0.14);
      innerEar.rotation.z = sx * 0.18;
      innerEar.rotation.x = -0.15;
      cat.add(innerEar);
    }

    // ── Eyes ──
    for (const sx of [-1, 1]) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(sx * 0.2, 1.0, 0.47);

      const white = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), eyeWhiteMat);
      eyeGroup.add(white);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), irisMat);
      iris.position.z = 0.04;
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), pupilMat);
      pupil.position.z = 0.075;
      eyeGroup.add(pupil);

      // Shine
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 }));
      shine.position.set(0.025, 0.025, 0.092);
      eyeGroup.add(shine);

      cat.add(eyeGroup);
    }

    // ── Nose ──
    const noseGeo = new THREE.SphereGeometry(0.055, 8, 6);
    noseGeo.scale(1.2, 0.7, 0.6);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.88, 0.52);
    cat.add(nose);

    // ── Tail ──
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.3, -0.65),
      new THREE.Vector3(0.5, -0.1, -0.9),
      new THREE.Vector3(0.85, 0.3, -0.7),
      new THREE.Vector3(0.75, 0.65, -0.4),
      new THREE.Vector3(0.5, 0.72, -0.15),
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.095, 8, false);
    const tail = new THREE.Mesh(tailGeo, furMat);
    cat.add(tail);

    // Tail tip
    const tipGeo = new THREE.SphereGeometry(0.14, 8, 6);
    const tip = new THREE.Mesh(tipGeo, darkFurMat);
    tip.position.set(0.5, 0.72, -0.15);
    cat.add(tip);

    // ── Front Paws ──
    for (const sx of [-1, 1]) {
      const pawGeo = new THREE.SphereGeometry(0.2, 10, 8);
      pawGeo.scale(1, 0.55, 1.15);
      const paw = new THREE.Mesh(pawGeo, pawMat);
      paw.position.set(sx * 0.32, -0.62, 0.42);
      cat.add(paw);

      // Toe beans
      for (let t = 0; t < 3; t++) {
        const toeGeo = new THREE.SphereGeometry(0.055, 6, 5);
        const toe = new THREE.Mesh(toeGeo, noseMat);
        toe.position.set(sx * 0.32 + (t - 1) * 0.08, -0.68, 0.56);
        cat.add(toe);
      }
    }

    // ── Back haunches ──
    for (const sx of [-1, 1]) {
      const haunchGeo = new THREE.SphereGeometry(0.35, 10, 8);
      haunchGeo.scale(0.9, 1, 0.85);
      const haunch = new THREE.Mesh(haunchGeo, furMat);
      haunch.position.set(sx * 0.48, -0.32, -0.38);
      cat.add(haunch);
    }

    // Center & elevate cat
    cat.position.y = -0.1;
    scene.add(cat);

    // Ground shadow disc
    const shadowGeo = new THREE.CircleGeometry(0.7, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.72;
    scene.add(shadow);

    // ── Animation ──
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow continuous spin
      cat.rotation.y = t * 0.65;

      // Gentle floating bob
      cat.position.y = -0.1 + Math.sin(t * 1.4) * 0.06;

      // Tail sway (relative to body rotation)
      tail.rotation.y = Math.sin(t * 2.2) * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-block",
      }}
    />
  );
}
