import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
const container = document.getElementById('container');
const component_name_element = document.getElementById('component_name');
const selected_components_element = document.getElementById('selected_components');
renderer.setSize(container.innerWidth, container.innerHeight);
container.innerHTML = '';
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

const loader = new GLTFLoader();
function loadModel() {
    loader.load(glb_path, function (gltf) {
        /**
         * @type {THREE.Mesh}
         */
        const model = gltf.scene;
        const board = model.children[0];
        const components = board.children

        components.forEach(component => {
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const meshes = component.children[0].children;
            meshes.forEach(mesh => {
                mesh.material = material;
            });
        });
        console.log(model);
        scene.add(model);

        // center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxDimension / (2 * Math.atan(Math.PI * camera.fov / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = Math.max(fitHeightDistance, fitWidthDistance);

        camera.position.z = distance;

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onMouseClick, false);

        /**
         * @type {THREE.Mesh}
         */
        let highlightedComponent = undefined;

        /**
         * @param {THREE.Mesh} component
         */
        function setHighlightedComponent(component) {
            if (highlightedComponent !== undefined) {
                highlightedComponent.material.color.set(0xffffff);
            }
            highlightedComponent = component;
            component.material.color.set(0xff0000);
            component_name_element.innerHTML = component.name;
        }

        function unhighlightHighlightedComponent() {
            if (highlightedComponent !== undefined) {
                highlightedComponent.material.color.set(0xffffff);
            }
            highlightedComponent = undefined;
            component_name_element.innerHTML = 'No component highlighted';
        }

        function onMouseMove(event) {
            event.preventDefault();

            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = {
                x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((event.clientY - rect.top) / rect.height) * 2 + 1
            };


            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(components, true);
            if (intersects.length > 0) {
                const raycastHit = intersects[0].object;
                if (raycastHit !== highlightedComponent) {
                    setHighlightedComponent(raycastHit);
                }
            } else {
                unhighlightHighlightedComponent();
            }
        }

        let selectedComponents = {};

        function onMouseClick(event) {
            if (highlightedComponent !== undefined) {
                const component = highlightedComponent.parent.parent;
                if (selectedComponents[component.name] !== undefined) {
                    scene.remove(selectedComponents[component.name]);
                    delete selectedComponents[component.name];
                } else {
                    // Get bounding box of component and add it to the scene, show only the edges
                    const bbox = new THREE.Box3().setFromObject(component);
                    const bboxHelper = new THREE.Box3Helper(bbox, 0xffff00);
                    scene.add(bboxHelper);
                    selectedComponents[component.name] = bboxHelper;
                }
                // Update the string of selected components
                let selectedComponentsString = Object.keys(selectedComponents).join(', ');
                selected_components_element.innerHTML = selectedComponentsString;
            }
        }

    }, undefined, function (error) {
        console.error(error);
        setTimeout(loadModel, 1000); // retry
    });
}

loadModel();

function animate() {
    updateSize();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

function updateSize() {
    const canvas = container;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}