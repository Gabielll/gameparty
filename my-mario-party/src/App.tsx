import React, { useState } from 'react';
import SceneComponent from './scenes/SceneComponent';
import './App.css'; // Keep App.css for global styles if any
import { Vector3 } from '@babylonjs/core'; // Added for pathData

function App() {
  const [playerPosition, setPlayerPosition] = useState(0);
  const [gameState, setGameState] = useState('waiting_for_roll'); // e.g., 'waiting_for_roll', 'dice_rolling', 'player_moving', 'event'

  // Define pathData here to be passed to SceneComponent
  const pathData: Vector3[] = [];
  const spacing = 1.5; // Box width (1) + gap (0.5) effectively
  let currentX = 0;
  for (let i = 0; i < 15; i++) {
    pathData.push(new Vector3(currentX, 0, 0)); // Assuming Y=0, Z=0 for a linear path
    currentX += spacing;
  }
  // console.log('Path Data defined in App.tsx:', pathData); // Optional: for debugging

  const handleDiceRoll = () => {
    if (gameState !== 'waiting_for_roll') return; // Only roll if waiting

    const diceResult = Math.floor(Math.random() * 6) + 1;
    console.log(`Dice rolled: ${diceResult}`);

    // Use pathData defined above for pathLength
    const pathLength = pathData.length;

    setPlayerPosition(prevPosition => {
      let newPosition = prevPosition + diceResult;
      if (newPosition >= pathLength) {
        newPosition = pathLength - 1; // Cap at the last index (e.g., 14 for length 15)
        console.log('Player reached or passed the end of the board!');
      }
      console.log(`Player moving from ${prevPosition} to ${newPosition}`);
      return newPosition;
    });

    setGameState('moving'); // Or 'player_moving'
    console.log('Game state changed to: moving');

    // Simulate movement time and revert state
    setTimeout(() => {
      setGameState('waiting_for_roll');
      console.log('Game state changed back to: waiting_for_roll');
    }, 1000); // Simulate 1 second movement time
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '5px' }}>
        <button onClick={handleDiceRoll} disabled={gameState !== 'waiting_for_roll'}>
          {gameState === 'waiting_for_roll' ? 'Roll Dice' : `Player is at: ${playerPosition}`}
        </button>
        <p>Player Position: {playerPosition}</p>
        <p>Game State: {gameState}</p>
      </div>
      <SceneComponent playerPosition={playerPosition} pathData={pathData} />
    </div>
  );
}

export default App;
