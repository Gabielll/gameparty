import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';

const SceneCanvas: React.FC = () => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (reactCanvas.current) {
            const engine = new Engine(reactCanvas.current, true);
            const scene = new Scene(engine);

            // Camera
            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), scene);
            camera.attachControl(reactCanvas.current, true);

            // Light
            new HemisphericLight("light", new Vector3(0, 1, 0), scene);

            // Materials
            const greenMaterial = new StandardMaterial("greenMaterial", scene);
            greenMaterial.diffuseColor = new Color3(0, 1, 0); // Green

            const blueMaterial = new StandardMaterial("blueMaterial", scene);
            blueMaterial.diffuseColor = new Color3(0, 0, 1); // Blue

            // Create board game path
            const boxSize = { width: 1, height: 0.2, depth: 1 };
            const spacing = 1.5;
            let currentPosition = new Vector3(0, 0, 0);

            for (let i = 0; i < 15; i++) {
                const box = MeshBuilder.CreateBox(`box${i}`, boxSize, scene);
                box.position = currentPosition.clone();

                if (i === 0) {
                    box.material = greenMaterial;
                } else {
                    box.material = blueMaterial;
                }

                // Simple path: move along X axis
                currentPosition.x += spacing;
            }

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

export default SceneCanvas;
