import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader, Nullable, AbstractMesh, Animation } from '@babylonjs/core';

interface SceneComponentProps {
  playerPosition: number;
  pathData: Vector3[];
  onMovementAnimationEnd: () => void; // Added callback prop
}

const SceneComponent: React.FC<SceneComponentProps> = ({ playerPosition, pathData, onMovementAnimationEnd }) => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);
    const [capybaraMesh, setCapybaraMesh] = useState<Nullable<AbstractMesh>>(null);
    const [sceneInstance, setSceneInstance] = useState<Nullable<Scene>>(null);

    useEffect(() => {
        if (reactCanvas.current) {
            const engine = new Engine(reactCanvas.current, true);
            const scene = new Scene(engine);
            setSceneInstance(scene); // Store scene instance

            // Camera
            const camera = new ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 30, new Vector3(10.5, 0, 0), scene); // Adjusted for isometric view
            camera.attachControl(reactCanvas.current, true);

            // Light
            new HemisphericLight("light", new Vector3(0, 1, 0), scene);

            // Materials
            const greenMaterial = new StandardMaterial("greenMaterial", scene);
            greenMaterial.diffuseColor = new Color3(0, 1, 0); // Green

            const blueMaterial = new StandardMaterial("blueMaterial", scene);
            blueMaterial.diffuseColor = new Color3(0, 0, 1); // Blue

            // Create board game path from pathData prop
            if (pathData && pathData.length > 0) {
                pathData.forEach((pos, index) => {
                    const box = MeshBuilder.CreateBox(`box${index}`, { width: 1, height: 0.2, depth: 1 }, scene);
                    box.position = pos;
                    box.material = index === 0 ? greenMaterial : blueMaterial;
                });
            }

            // Load player model
            const loadPlayerModel = async () => {
                try {
                    const result = await SceneLoader.ImportMeshAsync('', '/assets/', 'capybara.glb', scene);
                    if (result.meshes.length > 0) {
                        const mainMesh = result.meshes[0];
                        mainMesh.name = 'capybara';
                        setCapybaraMesh(mainMesh); // Store mesh in state
                        if (pathData.length > 0) {
                            mainMesh.position = pathData[0]; // Initial position
                        }
                        console.log('Capybara model loaded and positioned at start.');
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
    }, [reactCanvas, pathData]); // pathData added to deps for board creation

    // useEffect for capybara movement animation
    useEffect(() => {
        if (capybaraMesh && pathData && pathData[playerPosition] !== undefined && sceneInstance) {
            const frameRate = 60;
            const movementDurationSeconds = 1.0; // Animate over 1 second
            const totalFrames = frameRate * movementDurationSeconds;

            const startPosition = capybaraMesh.position.clone(); // Current actual position
            const endPosition = pathData[playerPosition];    // Target position from props

            // Avoid self-animation if already at target (e.g. initial load or same spot)
            if (startPosition.equalsWithEpsilon(endPosition, 0.01)) {
                // console.log('SceneComponent: Capybara already at target position, animation skipped.');
                // Ensure capybara is exactly at the endPosition if it's the initial placement
                if (capybaraMesh.position !== endPosition) capybaraMesh.position = endPosition;
                return;
            }

            console.log(`SceneComponent: Animating capybara from ${startPosition} to ${endPosition}`);

            const positionAnimation = new Animation(
                'capybaraPositionAnimation', // name
                'position',                  // property to animate
                frameRate,                   // frames per second
                Animation.ANIMATIONTYPE_VECTOR3, // datatype
                Animation.ANIMATIONLOOPMODE_CONSTANT // loop mode
            );

            const keys = [];
            keys.push({ frame: 0, value: startPosition });
            keys.push({ frame: totalFrames, value: endPosition });
            positionAnimation.setKeys(keys);

            // Stop any previous animations on the mesh to prevent conflicts
            sceneInstance.stopAnimation(capybaraMesh);

            sceneInstance.beginAnimation(capybaraMesh, 0, totalFrames, false, 1, () => {
                console.log('SceneComponent: Capybara animation finished.');
                if (capybaraMesh) { // Ensure mesh still exists
                    capybaraMesh.position = endPosition; // Ensure final position is precise
                }
                if (onMovementAnimationEnd) {
                    onMovementAnimationEnd(); // Call the callback
                }
            });
        } else {
            // Optional: Add more detailed logs for why animation is skipped
            // if (!capybaraMesh) console.warn('SceneComponent: Animation skipped, capybaraMesh is null.');
            // if (!pathData || pathData[playerPosition] === undefined) console.warn('SceneComponent: Animation skipped, pathData or target position is invalid.');
            // if (!sceneInstance) console.warn('SceneComponent: Animation skipped, sceneInstance is null.');
        }
    }, [playerPosition, pathData, capybaraMesh, sceneInstance]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%' }} />;
};

export default SceneComponent;
