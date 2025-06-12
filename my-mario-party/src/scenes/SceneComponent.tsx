import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader } from '@babylonjs/core';

const SceneComponent: React.FC = () => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);

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

            // Create board game path
            const pathData: Vector3[] = [];
            const boxSize = { width: 1, height: 0.2, depth: 1 };
            const spacing = 1.5;
            let currentPosition = new Vector3(0, 0, 0);

            for (let i = 0; i < 15; i++) {
                const box = MeshBuilder.CreateBox(`box${i}`, boxSize, scene);
                box.position = currentPosition.clone();
                pathData.push(currentPosition.clone());

                if (i === 0) {
                    box.material = greenMaterial;
                } else {
                    box.material = blueMaterial;
                }

                // Simple path: move along X axis
                currentPosition.x += spacing;
            }

            console.log('Path Data:', pathData);

            const loadPlayerModel = async () => {
                try {
                    const result = await SceneLoader.ImportMeshAsync('', '/assets/', 'capybara.glb', scene);
                    if (result.meshes.length > 0) {
                        const capybaraMesh = result.meshes[0];
                        capybaraMesh.name = 'capybara';
                        if (pathData.length > 0) {
                            capybaraMesh.position = pathData[0];
                            console.log('Capybara model loaded and positioned at:', pathData[0]);
                        } else {
                            console.warn('pathData is empty, cannot position capybara.');
                        }
                        // You might want to scale the model if it's too big or small
                        // capybaraMesh.scaling.scaleInPlace(0.5); // Example: half size
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
    }, [reactCanvas]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%' }} />;
};

export default SceneComponent;
