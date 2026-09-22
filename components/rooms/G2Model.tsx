"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RotateCcw, Plus, Minus, Move, Sun, Moon } from "lucide-react";
type Preset = "overview" | "plan" | "inside";
type ModelApi = {
    preset: (value: Preset) => void;
    zoom: (factor: number) => void;
    rotate: (angle: number) => void;
    lighting: (warm: boolean) => void;
};
const features: Record<string, string> = {
    bed: "Queen bed · positioned against the feature wall, with an upholstered headboard.",
    desk: "Study corner · desk and chair in a recessed nook with its own window.",
    wardrobe: "Wardrobe · wooden storage in the corner recess beside the broad curtains.",
    window: "Window & air conditioning · broad curtained window, separate nook window and AC on the feature wall.",
};
export default function G2Model() {
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
        renderer.domElement.setAttribute("aria-label", "Interactive 3D reconstruction of room G2");
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
        const W = 10 * 0.3048, D = 9.3 * 0.3048, H = 9 * 0.3048;
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
        // Coordinates follow the owner's plan: entry/nook north, broad window south.
        // Main area 10 × 9.3 ft; nook extends 3.1 ft north, storage 2 ft east.
        const floor = material("#dcd8cd", .5), bedding = material("#d3e6e8"), throwMat = material("#777b79"), upholstery = material("#ad9994");
        box(room, 0, -.08, 0, W, .16, D, floor);
        box(room, -.96, -.08, -D / 2 - .47, 1.13, .16, .94, floor);
        box(room, W / 2 + .305, -.08, D / 2 - .46, .61, .16, .92, floor);
        const walls = { left: new THREE.Group(), right: new THREE.Group(), back: new THREE.Group(), front: new THREE.Group() };
        Object.values(walls).forEach(w => room.add(w));
        box(walls.left, -W / 2 - .045, H / 2, -.47, .09, H, D + .94, yellow);
        box(walls.right, W / 2 + .045, H / 2, -.46, .09, H, D - .92, plaster);
        box(walls.right, W / 2 + .35, H / 2, D / 2 - .92, .61, H, .09, plaster);
        box(walls.right, W / 2 + .655, H / 2, D / 2 - .46, .09, H, .92, plaster);
        box(walls.front, .305, H / 2, D / 2 + .045, W + .61, H, .09, plaster);
        // Nook return and window wall, leaving the alcove mouth open.
        box(walls.back, -.96, H / 2, -D / 2 - .985, 1.13, H, .09, plaster);
        box(walls.back, -.395, H / 2, -D / 2 - .47, .09, H, .94, plaster);
        box(walls.back, .12, H / 2, -D / 2 - .045, 1.03, H, .09, plaster);
        box(walls.back, 1.49, H / 2, -D / 2 - .045, .07, H, .09, plaster);
        box(walls.back, 1.05, H - .22, -D / 2 - .045, .82, .44, .09, plaster);
        box(walls.back, 1.05, 1.04, -D / 2, .81, 2.08, .055, wood);
        box(walls.back, 1.05, 1.24, -D / 2 + .035, .48, 1.45, .018, material("#bcc6c2", .15));
        sphere(walls.back, .72, 1, -D / 2 + .07, .03, .03, .035, metal);
        const objects: THREE.Object3D[] = [];
        function feature(name: string) { const group = new THREE.Group(); group.userData.feature = name; room.add(group); objects.push(group); return group; }
        const bed = feature("bed");
        box(bed, -.43, .22, .17, 2.12, .36, 1.53, upholstery, true);
        box(bed, -.43, .47, .17, 2.08, .23, 1.51, bedding, true);
        box(bed, -1.43, .77, .17, .15, 1.34, 1.59, upholstery, true);
        for (let z = -.48; z < .9; z += .25)
            for (let y = .55; y < 1.35; y += .24)
                sphere(bed, -1.348, y, z, .007, .012, .012, white);
        box(bed, -.02, .605, .17, 1.28, .035, 1.53, throwMat, true);
        for (const z of [-.59, .93])
            box(bed, -.02, .39, z, 1.28, .41, .022, throwMat);
        for (const z of [-.20, .53]) {
            const p = box(bed, -1.03, .70, z, .42, .20, .65, bedding, true);
            p.rotation.z = -.2;
        }
        for (const [z, m] of [[-.20, material("#bb943f")], [.53, white]] as const) {
            const p = box(bed, -.96, .83, z, .16, .38, .43, m, true);
            p.rotation.z = .25;
        }
        box(bed, .02, .65, .12, .55, .045, .40, white, true);
        plant(bed, -.10, .68, .09, .85);
        box(bed, .16, .69, .18, .19, .025, .14, linen);
        const desk = feature("desk");
        box(desk, -.96, .76, -2.10, 1.05, .045, .55, paleWood);
        for (const x of [-1.42, -.50])
            for (const z of [-2.31, -1.88])
                box(desk, x, .38, z, .035, .75, .035, white);
        box(desk, -1.15, .80, -2.07, .33, .02, .23, metal, true);
        box(desk, -.72, .80, -2.09, .22, .015, .17, dark, true);
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .045, 24), dark);
        clock.rotation.x = Math.PI / 2;
        clock.position.set(-.62, .91, -2.27);
        desk.add(clock);
        box(desk, -.96, .45, -1.55, .42, .055, .42, white, true);
        box(desk, -.96, .68, -1.33, .43, .40, .055, white, true);
        for (const x of [-1.13, -.79])
            for (const z of [-1.71, -1.37])
                box(desk, x, .23, z, .028, .44, .028, white);
        const wardrobe = feature("wardrobe");
        box(wardrobe, 1.59, .97, 1.10, 1.03, 1.94, .53, wood);
        for (const x of [1.33, 1.85])
            box(wardrobe, x, 1.23, .823, .50, 1.35, .025, paleWood);
        for (let i = 0; i < 3; i++) {
            box(wardrobe, 1.85, .15 + i * .18, .822, .49, .17, .03, paleWood);
            box(wardrobe, 1.85, .15 + i * .18, .80, .13, .015, .022, metal);
        }
        for (const x of [1.53, 1.65])
            box(wardrobe, x, 1.10, .80, .018, .15, .025, metal);
        const windowGroup = feature("window");
        for (let i = 0; i < 37; i++)
            box(windowGroup, -1.46 + i * .078, 1.22, D / 2 - .07 + (i % 2) * .028, .086, 2.40, .07, curtain, true);
        const nookCurtains = new THREE.Group();
        windowGroup.add(nookCurtains);
        for (let i = 0; i < 13; i++)
            box(nookCurtains, -1.45 + i * .079, 1.22, -D / 2 - .89 + (i % 2) * .025, .086, 2.4, .06, curtain, true);
        box(walls.left, -W / 2 + .13, 2.48, -.59, .23, .34, .92, white, true);
        for (let i = 0; i < 5; i++)
            box(walls.left, -W / 2 + .25, 2.38 + i * .025, -.59, .009, .007, .81, metal);
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffebbd, emissive: 0xffbc58, emissiveIntensity: 1.6 });
        materials.add(ropeMat);
        const ropePoints = [[-1.47, 2.05, 1.14], [-1.47, 1.77, .93], [-1.47, 2.02, .72], [-1.47, 1.82, .38], [-1.47, 2.06, .08], [-1.47, 1.88, -.12], [-1.47, 2.18, -.36], [-1.47, 1.64, -.64], [-1.47, 1.72, -.96]].map(p => new THREE.Vector3(...p));
        walls.left.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePoints), 80, .009, 6, false), ropeMat));
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
            nookCurtains.visible = walls.back.visible;
            renderer.render(scene, camera);
        }
        function setPreset(value: Preset) {
            interior = value === "inside";
            if (value === "plan") {
                camera.position.set(0, 7.8, .001);
                controls.target.set(0, 0, 0);
            }
            else if (interior) {
                camera.position.set(1.08, 1.70, -1.15);
                controls.target.set(-.55, .95, .30);
            }
            else {
                camera.position.set(5.0, 5.7, -6.7);
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
    <Translated as="div" className="model-canvas" ref={host} tabIndex={0} aria-label="G2 3D room. Drag to rotate, scroll to zoom, or use arrow keys and plus or minus." onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
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
    <Localized>{failed && <div className="model-unavailable" role="status"><h3><Text>3D isn’t available on this device.</Text></h3><p><Text>You can still explore G2 using the Photos and Floor plan tabs above.</Text></p></div>}</Localized>
    <span className="model-badge"><Text>G2 </Text><span><Text>DESA AMAN</Text></span></span>
    <div className="model-tools"><Translated as="button" title="Zoom in" aria-label="Zoom in" onClick={() => api.current?.zoom(.85)}><Plus size={18}/></Translated><Translated as="button" title="Zoom out" aria-label="Zoom out" onClick={() => api.current?.zoom(1.15)}><Minus size={18}/></Translated><Translated as="button" title="Reset view" aria-label="Reset view" onClick={() => { setPreset("overview"); api.current?.preset("overview"); }}><RotateCcw size={17}/></Translated><Translated as="button" aria-label={warm ? "Use daylight" : "Use warm lighting"} aria-pressed={warm} onClick={() => { setWarm(!warm); api.current?.lighting(!warm); }}><Localized>{warm ? <Sun size={18}/> : <Moon size={18}/>}</Localized></Translated></div>
    <div className="model-help"><Move size={15}/><span><Text>Drag to rotate · Scroll or pinch to zoom</Text></span></div>
    <div className="model-features"><Localized>{Object.keys(features).map(key => <button key={key} onClick={() => setSelected(features[key])}><Localized>{key === "window" ? "Window & AC" : key[0].toUpperCase() + key.slice(1)}</Localized></button>)}</Localized></div>
    <p className="model-selection" aria-live="polite"><Localized>{selected}</Localized></p>
  </div>;
}
