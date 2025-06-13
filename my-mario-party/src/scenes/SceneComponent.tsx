import React, { useEffect, useRef, useState } from 'react'; // Added useState
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader, Nullable, AbstractMesh } from '@babylonjs/core'; // Added Nullable, AbstractMesh

interface SceneComponentProps {
  playerPosition: number;
  pathData: Vector3[];
}

const SceneComponent: React.FC<SceneComponentProps> = ({ playerPosition, pathData }) => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);
    const [capybaraMesh, setCapybaraMesh] = useState<Nullable<AbstractMesh>>(null);

    useEffect(() => {
        if (reactCanvas.current) {
            const engine = new Engine(reactCanvas.current, true);
            const scene = new Scene(engine);

            // Camera
            const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 30, new Vector3(10.5, 0, 0), scene); // Adjusted for isometric view and to see full board
            camera.attachControl(reactCanvas.current, true);

            // Light
            new HemisphericLight("light", new Vector3(0, 1, 0), scene);

            // Materials
            const greenMaterial = new StandardMaterial("greenMaterial", scene);
            greenMaterial.diffuseColor = new Color3(0, 1, 0); // Green

            const blueMaterial = new StandardMaterial("blueMaterial", scene);
            blueMaterial.diffuseColor = new Color3(0, 0, 1); // Blue

            // Create board game path - pathData is now a prop
            const boxSize = { width: 1, height: 0.2, depth: 1 }; // Spacing and currentPosition also removed as path is from props
            // Path itself is rendered based on pathData prop

            // Render the path from pathData prop
            pathData.forEach((point, index) => {
                const box = MeshBuilder.CreateBox(`box${index}`, boxSize, scene);
                box.position = point;
                if (index === 0) { // First box
                    box.material = greenMaterial;
                } else { // Other boxes
                    box.material = blueMaterial;
                }
            });

            // The old loop for creating boxes based on local pathData generation is removed.
            // The old currentPosition.x += spacing is also removed.
            // Old console.log for local pathData is removed.

            // Old box creation loop:
            // for (let i = 0; i < 15; i++) {
            //     const box = MeshBuilder.CreateBox(`box${i}`, boxSize, scene);
            //     box.position = currentPosition.clone();
            //     // pathData.push(currentPosition.clone()); // Removed: pathData is a prop

            //     if (i === 0) {
            //         box.material = greenMaterial;
                } else {
                    box.material = blueMaterial;
                }
            });
            // End of new path rendering based on prop


            const loadPlayerModel = async () => {
                try {
                    const result = await SceneLoader.ImportMeshAsync('', '/assets/', 'capybara.glb', scene);
                    if (result.meshes.length > 0) {
                        const mainMesh = result.meshes[0]; // Renamed to mainMesh to avoid conflict
                        setCapybaraMesh(mainMesh); // Set state
                        mainMesh.name = 'capybara';
                        if (pathData && pathData.length > 0) { // Check prop pathData
                            mainMesh.position = pathData[0]; // Initial position from prop
                            console.log('Capybara model loaded and positioned at initial pathData[0]:', pathData[0]);
                        } else {
                            console.warn('Prop pathData is empty or undefined, cannot set initial position for capybara.');
                        }
                        // You might want to scale the model if it's too big or small
                        // mainMesh.scaling.scaleInPlace(0.5); // Example: half size
                    }
                } catch (e) {
                    console.error('Failed to load capybara model:', e);
                }
            };

            loadPlayerModel();

            engine.runRenderLoop(() => {
                scene.render();
            });

            return () => {
                engine.dispose();
            };
        }
    }, [reactCanvas]); // Main useEffect for scene setup. PathData is not a dependency here as boxes are created once.

    // New useEffect for updating player model position based on props
    useEffect(() => {
        if (capybaraMesh && pathData && pathData[playerPosition]) {
            console.log(`SceneComponent: Moving capybara to pathData[${playerPosition}]`, pathData[playerPosition]);
            capybaraMesh.position = pathData[playerPosition];
        }
    }, [playerPosition, pathData, capybaraMesh]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%' }} />;
};

export default SceneComponent;
