const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shoe = document.querySelector("#floating-shoe");
const story = document.querySelector(".story-shell");
const dottedSurface = document.querySelector("#dotted-surface");
const cursorSpotlight = document.querySelector("#cursor-spotlight");
const splineStage = document.querySelector(".spline-stage");
const splineFrame = document.querySelector(".spline-frame");

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function updateStoryMotion() {
  if (!shoe || !story || prefersReducedMotion) return;

  const rect = story.getBoundingClientRect();
  const available = rect.height - window.innerHeight;
  const progress = clamp((rect.top * -1) / available, 0, 1);
  const rotate = -7 + progress * 13;
  const scale = 0.92 + progress * 0.1;
  const lift = Math.sin(progress * Math.PI) * -26;

  shoe.style.setProperty("--shoe-rotate", `${rotate}deg`);
  shoe.style.setProperty("--shoe-scale", scale.toFixed(3));
  shoe.style.translate = `0 ${lift.toFixed(1)}px`;
}

let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateStoryMotion();
      ticking = false;
    });
  },
  { passive: true }
);

window.addEventListener("resize", updateStoryMotion);
updateStoryMotion();

if (cursorSpotlight && !prefersReducedMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      cursorSpotlight.style.setProperty("--spot-x", x);
      cursorSpotlight.style.setProperty("--spot-y", y);
      cursorSpotlight.style.setProperty("--spot-opacity", "1");
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    cursorSpotlight.style.setProperty("--spot-opacity", "0");
  });
}

if (splineStage && !prefersReducedMotion) {
  splineStage.addEventListener(
    "pointermove",
    (event) => {
      const rect = splineStage.getBoundingClientRect();
      splineStage.style.setProperty("--stage-x", `${event.clientX - rect.left}px`);
      splineStage.style.setProperty("--stage-y", `${rect.bottom - event.clientY}px`);
    },
    { passive: true }
  );
}

if (splineFrame && !prefersReducedMotion) {
  splineFrame.addEventListener(
    "pointermove",
    (event) => {
      const rect = splineFrame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      splineFrame.style.setProperty("--spline-tilt-x", `${(x * 7).toFixed(2)}deg`);
      splineFrame.style.setProperty("--spline-tilt-y", `${(y * -5).toFixed(2)}deg`);
    },
    { passive: true }
  );

  splineFrame.addEventListener("pointerleave", () => {
    splineFrame.style.setProperty("--spline-tilt-x", "0deg");
    splineFrame.style.setProperty("--spline-tilt-y", "0deg");
  });
}

function initDottedSurface() {
  if (!(dottedSurface instanceof HTMLElement) || prefersReducedMotion) return;
  if (!window.THREE) return;

  const separation = 150;
  const amountX = 40;
  const amountY = 60;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 2000, 10000);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 355, 1220);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color, 0);
  dottedSurface.appendChild(renderer.domElement);

  const positions = [];
  const colors = [];
  const geometry = new THREE.BufferGeometry();

  for (let ix = 0; ix < amountX; ix += 1) {
    for (let iy = 0; iy < amountY; iy += 1) {
      const x = ix * separation - (amountX * separation) / 2;
      const y = 0;
      const z = iy * separation - (amountY * separation) / 2;

      positions.push(x, y, z);
      colors.push(0.56, 1, 0.12);
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 8,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let count = 0;
  let animationId = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const positionAttribute = geometry.attributes.position;
    const positionArray = positionAttribute.array;
    let i = 0;

    for (let ix = 0; ix < amountX; ix += 1) {
      for (let iy = 0; iy < amountY; iy += 1) {
        const index = i * 3;
        positionArray[index + 1] =
          Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;
        i += 1;
      }
    }

    positionAttribute.needsUpdate = true;
    points.rotation.x = -0.18;
    points.rotation.z = Math.sin(count * 0.04) * 0.018;
    renderer.render(scene, camera);
    count += 0.1;
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", handleResize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  });

  animate();
}

initDottedSurface();
