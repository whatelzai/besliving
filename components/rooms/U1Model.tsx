"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RotateCcw, Plus, Minus, Move, Sun, Moon } from "lucide-react";
import { u1Dimensions } from "@/lib/catalogue/desa-aman";
type Preset = "overview" | "plan" | "inside";
type ModelApi = {
    preset: (value: Preset) => void;
    zoom: (factor: number) => void;
    rotate: (angle: number) => void;
    lighting: (warm: boolean) => void;
};
const features: Record<string, string> = {
    bed: "Queen bed · positioned against the feature wall, with an upholstered headboard.",
    desk: "Study corner · desk and chair beside the curtained window.",
    wardrobe: "Wardrobe · freestanding storage opposite the study corner.",
    window: "Window & air conditioning · shown with the curtains drawn, as photographed.",
};
export default function U1Model() {
    const host = useRef<HTMLDivElement>(null);
    const api = useRef<ModelApi | null>(null);
    const [failed, setFailed] = useState(false);
    const [selected, setSelected] = useState("Drag to look around. Select a feature to learn more.");
    const [warm, setWarm] = useState(false);
    const [preset, setPreset] = useState<Preset>("overview");
    useEffect(() => {
        const container = host.current;
        if (!container)
            return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        }
        catch {
            // Renderer initialization is an external-system failure, not derived state.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFailed(true);
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-label", "Interactive 3D reconstruction of room U1");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 50);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false; // Render only when the user interacts.
        controls.enablePan = false;
        controls.minDistance = 0.7;
        controls.maxDistance = 10;
        controls.maxPolarAngle = Math.PI / 2 - 0.025;
        controls.target.set(0, 0.7, 0);
        const ambient = new THREE.HemisphereLight(0xfff9eb, 0xa7a18f, 2.4);
        scene.add(ambient);
        const sunlight = new THREE.DirectionalLight(0xfff2d9, 3.2);
        sunlight.position.set(2, 6, 3);
        sunlight.castShadow = true;
        sunlight.shadow.mapSize.set(1024, 1024);
        sunlight.shadow.camera.left = -4;
        sunlight.shadow.camera.right = 4;
        sunlight.shadow.camera.top = 4;
        sunlight.shadow.camera.bottom = -4;
        sunlight.shadow.bias = -0.001;
        scene.add(sunlight);
        const lamp = new THREE.PointLight(0xffc274, 0, 5);
        lamp.position.set(-1, 1.6, 0.3);
        scene.add(lamp);
        const W = u1Dimensions.widthFeet * 0.3048, D = u1Dimensions.lengthFeet * 0.3048, H = u1Dimensions.ceilingFeet * 0.3048;
        const materials = new Set<THREE.Material>();
        const material = (color: string, roughness = 0.8) => { const m = new THREE.MeshStandardMaterial({ color, roughness }); materials.add(m); return m; };
        const plaster = material("#f5eee2"), yellow = material("#d7b77a"), wood = material("#b88b53"), paleWood = material("#cda363"), white = material("#f4f0e6"), dark = material("#353731"), linen = material("#c7b29f"), curtain = material("#a0998c"), green = material("#46623c"), metal = material("#5a5146", 0.45);
        const room = new THREE.Group();
        scene.add(room);
        function box(parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, m: THREE.Material, rounded = false) {
            const geometry = rounded ? new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.15) : new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geometry, m);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            parent.add(mesh);
            return mesh;
        }
        function sphere(parent: THREE.Object3D, x: number, y: number, z: number, rx: number, ry: number, rz: number, m: THREE.Material) {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), m);
            mesh.position.set(x, y, z);
            mesh.scale.set(rx, ry, rz);
            mesh.castShadow = true;
            parent.add(mesh);
            return mesh;
        }
        function plant(parent: THREE.Object3D, x: number, y: number, z: number, scale = 1) {
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(.065 * scale, .048 * scale, .12 * scale, 16), white);
            pot.position.set(x, y + .06 * scale, z);
            parent.add(pot);
            for (let i = 0; i < 7; i++) {
                const a = i * Math.PI * 2 / 7;
                const leaf = sphere(parent, x + Math.cos(a) * .07 * scale, y + .18 * scale + (i % 2) * .045 * scale, z + Math.sin(a) * .07 * scale, .045 * scale, .10 * scale, .02 * scale, green);
                leaf.rotation.z = Math.cos(a) * .6;
                leaf.rotation.y = -a;
            }
        }
        box(room, 0, -.09, 0, W + .15, .16, D + .15, material("#d3c9b5"), true);
        const tile = material("#c6c0af", .35), grout = material("#e8e2d4");
        box(room, 0, 0, 0, W, .015, D, tile);
        for (let x = -W / 2; x < W / 2; x += .6)
            box(room, x, .012, 0, .007, .002, D, grout);
        for (let z = -D / 2; z < D / 2; z += .6)
            box(room, 0, .012, z, W, .002, .007, grout);
        const walls = { left: new THREE.Group(), right: new THREE.Group(), back: new THREE.Group(), front: new THREE.Group() };
        Object.values(walls).forEach(w => room.add(w));
        box(walls.left, -W / 2 - .045, H / 2, 0, .09, H, D + .12, yellow);
        box(walls.right, W / 2 + .045, H / 2, 0, .09, H, D + .12, plaster);
        box(walls.back, 0, H / 2, -D / 2 - .045, W, H, .09, plaster);
        // Entry opening on the right of the near wall, matching the owner's plan.
        box(walls.front, -.47, H / 2, D / 2 + .045, W - 1, .09 + H, .09, plaster);
        box(walls.front, W / 2 - .04, H / 2, D / 2 + .045, .08, H, .09, plaster);
        box(walls.front, W / 2 - .49, H - .25, D / 2 + .045, .9, .5, .09, plaster);
        box(walls.front, W / 2 - .48, 1.04, D / 2, .84, 2.08, .055, material("#533b28"));
        box(walls.front, W / 2 - .48, 1.27, D / 2 - .033, .52, 1.35, .015, material("#c5ceca", .15));
        sphere(walls.front, W / 2 - .82, 1, D / 2 - .075, .035, .035, .04, metal);
        box(walls.left, -W / 2 + .005, .06, 0, .022, .12, D, linen);
        box(walls.back, 0, .06, -D / 2 + .005, W, .12, .022, linen);
        box(walls.right, W / 2 - .005, .06, 0, .022, .12, D, linen);
        const objects: THREE.Object3D[] = [];
        function feature(name: string) { const group = new THREE.Group(); group.userData.feature = name; room.add(group); objects.push(group); return group; }
        const bed = feature("bed");
        box(bed, -.64, .22, .50, 1.54, .36, 2.1, linen, true);
        box(bed, -.64, .47, .49, 1.52, .23, 2.04, white, true);
        box(bed, -.64, .74, D / 2 - .13, 1.57, 1.25, .15, linen, true);
        // Tufted headboard buttons and seams.
        for (let x = -1.26; x < .1; x += .25) {
            for (let y = .55; y < 1.25; y += .24)
                sphere(bed, x, y, D / 2 - .218, .013, .013, .007, white);
        }
        box(bed, -.64, .599, .08, 1.53, .035, 1.25, dark, true);
        box(bed, -1.385, .39, .08, .023, .41, 1.25, dark);
        box(bed, .105, .39, .08, .023, .41, 1.25, dark);
        for (const x of [-1.01, -.29]) {
            const p = box(bed, x, .72, 1.19, .66, .22, .43, white, true);
            p.rotation.x = .25;
        }
        const cushion = box(bed, -.63, .81, .97, .44, .36, .14, material("#b38a47"), true);
        cushion.rotation.x = -.25;
        box(bed, -.55, .64, .12, .57, .04, .38, white, true);
        box(bed, -.65, .67, .08, .22, .035, .15, material("#2a7778"));
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(.037, .033, .07, 18), white);
        cup.position.set(-.4, .695, .15);
        bed.add(cup);
        const desk = feature("desk");
        box(desk, -.99, .77, -1.06, .77, .055, 1.00, paleWood);
        for (const x of [-1.31, -.67])
            for (const z of [-1.48, -.64])
                box(desk, x, .38, z, .045, .76, .045, white);
        box(desk, -.98, .81, -.95, .38, .023, .27, material("#8b9090", .4), true);
        box(desk, -1.03, .81, -1.34, .25, .018, .18, dark, true);
        plant(desk, -1.20, .80, -1.42, .75);
        const chair = box(desk, -.40, .45, -1.03, .43, .07, .43, white, true);
        chair.rotation.y = -.15;
        box(desk, -.17, .69, -1.03, .06, .47, .45, white, true);
        for (const x of [-.56, -.25])
            for (const z of [-1.19, -.88])
                box(desk, x, .23, z, .035, .44, .035, white);
        const wardrobe = feature("wardrobe");
        box(wardrobe, .92, .95, -1.28, .96, 1.90, .52, wood);
        for (let i = 0; i < 3; i++) {
            box(wardrobe, .60 + i * .32, .98, -1.006, .31, 1.79, .035, paleWood);
            box(wardrobe, .71 + i * .25, .91, -.976, .017, .18, .022, metal, true);
        }
        plant(wardrobe, .68, 1.91, -1.26, 1.05);
        const windowGroup = feature("window");
        // Draped curtains use alternating folds instead of a flat panel.
        for (let i = 0; i < 23; i++) {
            const fold = box(windowGroup, -1.30 + i * .064, 1.13, -1.54 + (i % 2) * .035, .076, 2.18, .09, curtain, true);
            fold.rotation.y = (i % 2 ? .16 : -.16);
        }
        box(windowGroup, -.57, 2.27, -1.52, 1.60, .045, .055, metal, true);
        box(windowGroup, -.57, 2.52, -1.47, 1.12, .35, .23, white, true);
        for (let i = 0; i < 8; i++)
            box(windowGroup, -.57, 2.42 + i * .026, -1.341, 1, .007, .008, metal);
        // Shelves and plants from the room photos, attached to the feature wall.
        for (const y of [1.42, 1.95]) {
            box(walls.left, -1.30, y, -.93, .28, .032, .67, white);
            plant(walls.left, -1.25, y + .02, -1.1, .8);
            plant(walls.left, -1.26, y + .02, -.75, .65);
        }
        // Warm rope-light accent along the yellow wall.
        const ropePoints = [[-1.389, 1.70, 1.20], [-1.389, 1.61, .98], [-1.389, 2.13, .70], [-1.389, 2.04, .42], [-1.389, 1.97, .18], [-1.389, 2.03, -.05], [-1.389, 1.91, -.30], [-1.389, 2.2, -.50]].map(p => new THREE.Vector3(...p));
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffebbd, emissive: 0xffbc58, emissiveIntensity: 1.6 });
        materials.add(ropeMat);
        const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePoints), 64, .009, 6, false), ropeMat);
        walls.left.add(rope);
        const shadowGround = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material("#e8e5dc"));
        shadowGround.rotation.x = -Math.PI / 2;
        shadowGround.position.y = -.18;
        shadowGround.receiveShadow = true;
        scene.add(shadowGround);
        let interior = false;
        function render() {
            walls.left.visible = interior || camera.position.x > -W / 2;
            walls.right.visible = interior || camera.position.x < W / 2;
            walls.front.visible = interior || camera.position.z < D / 2;
            walls.back.visible = interior || camera.position.z > -D / 2;
            renderer.render(scene, camera);
        }
        function setPreset(value: Preset) {
            interior = value === "inside";
            if (value === "plan") {
                camera.position.set(0, 7.8, .001);
                controls.target.set(0, 0, 0);
            }
            else if (interior) {
                camera.position.set(1.05, 1.70, 1.22);
                controls.target.set(-.3, 1.1, -.6);
            }
            else {
                camera.position.set(4.6, 4.7, 5.7);
                controls.target.set(0, .75, 0);
            }
            controls.update();
            render();
        }
        api.current = { preset: setPreset, zoom: (factor) => { const delta = camera.position.clone().sub(controls.target); delta.setLength(THREE.MathUtils.clamp(delta.length() * factor, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(delta); controls.update(); render(); }, rotate: (angle) => { const delta = camera.position.clone().sub(controls.target); delta.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); camera.position.copy(controls.target).add(delta); controls.update(); render(); }, lighting: (isWarm) => { ambient.intensity = isWarm ? 1.1 : 2.4; sunlight.intensity = isWarm ? 1.2 : 3.2; lamp.intensity = isWarm ? 4 : 0; render(); } };
        controls.addEventListener("change", render);
        const resize = new ResizeObserver(() => {
            const w = container.clientWidth, h = container.clientHeight;
            if (w && h) {
                renderer.setSize(w, h);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                render();
            }
        });
        resize.observe(container);
        let startX = 0, startY = 0;
        const pointerDown = (e: PointerEvent) => { startX = e.clientX; startY = e.clientY; };
        const pointerUp = (e: PointerEvent) => {
            if (Math.hypot(e.clientX - startX, e.clientY - startY) > 6)
                return;
            const r = renderer.domElement.getBoundingClientRect();
            const ray = new THREE.Raycaster();
            ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
            const hit = ray.intersectObjects(objects, true)[0];
            if (hit) {
                let o: THREE.Object3D | null = hit.object;
                while (o && !o.userData.feature)
                    o = o.parent;
                if (o)
                    setSelected(features[o.userData.feature]);
            }
        };
        const lost = (e: Event) => { e.preventDefault(); setFailed(true); };
        renderer.domElement.addEventListener("pointerdown", pointerDown);
        renderer.domElement.addEventListener("pointerup", pointerUp);
        renderer.domElement.addEventListener("webglcontextlost", lost);
        setPreset("overview");
        return () => {
            api.current = null;
            resize.disconnect();
            controls.dispose();
            renderer.domElement.removeEventListener("pointerdown", pointerDown);
            renderer.domElement.removeEventListener("pointerup", pointerUp);
            renderer.domElement.removeEventListener("webglcontextlost", lost);
            scene.traverse(o => {
                if (o instanceof THREE.Mesh)
                    o.geometry.dispose();
            });
            materials.forEach(m => m.dispose());
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);
    return <div className="model-shell">
    <Translated as="div" className="model-presets" aria-label="Camera views"><Localized>{([['overview', 'Dollhouse'], ['plan', 'Top view'], ['inside', 'Inside']] as const).map(([value, label]) => <button key={value} aria-pressed={preset === value} onClick={() => { setPreset(value); api.current?.preset(value); }}><Localized>{label}</Localized></button>)}</Localized></Translated>
    <Translated as="div" className="model-canvas" ref={host} tabIndex={0} aria-label="U1 3D room. Drag to rotate, scroll to zoom, or use arrow keys and plus or minus." onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (['ArrowLeft', 'ArrowRight', '+', '-'].includes(e.key)) {
                e.preventDefault();
                if (e.key === 'ArrowLeft')
                    api.current?.rotate(-.15);
                if (e.key === 'ArrowRight')
                    api.current?.rotate(.15);
                if (e.key === '+')
                    api.current?.zoom(.85);
                if (e.key === '-')
                    api.current?.zoom(1.15);
            }
        }}/>
    <Localized>{failed && <div className="model-unavailable" role="status"><h3><Text>3D isn’t available on this device.</Text></h3><p><Text>You can still explore U1 using the Photos and Floor plan tabs above.</Text></p></div>}</Localized>
    <span className="model-badge"><Text>U1 </Text><span><Text>DESA AMAN</Text></span></span>
    <div className="model-tools"><Translated as="button" title="Zoom in" aria-label="Zoom in" onClick={() => api.current?.zoom(.85)}><Plus size={18}/></Translated><Translated as="button" title="Zoom out" aria-label="Zoom out" onClick={() => api.current?.zoom(1.15)}><Minus size={18}/></Translated><Translated as="button" title="Reset view" aria-label="Reset view" onClick={() => { setPreset("overview"); api.current?.preset("overview"); }}><RotateCcw size={17}/></Translated><Translated as="button" aria-label={warm ? "Use daylight" : "Use warm lighting"} aria-pressed={warm} onClick={() => { setWarm(!warm); api.current?.lighting(!warm); }}><Localized>{warm ? <Sun size={18}/> : <Moon size={18}/>}</Localized></Translated></div>
    <div className="model-help"><Move size={15}/><span><Text>Drag to rotate · Scroll or pinch to zoom</Text></span></div>
    <div className="model-features"><Localized>{Object.keys(features).map(key => <button key={key} onClick={() => setSelected(features[key])}><Localized>{key === "window" ? "Window & AC" : key[0].toUpperCase() + key.slice(1)}</Localized></button>)}</Localized></div>
    <p className="model-selection" aria-live="polite"><Localized>{selected}</Localized></p>
  </div>;
}
