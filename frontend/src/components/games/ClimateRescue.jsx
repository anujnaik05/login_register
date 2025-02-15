import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar';

const ClimateRescue = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [player, setPlayer] = useState({
    x: 0,
    y: 0,
    vehicle: 'eco-drone',
    inventory: [],
    speed: 5
  });
  const [missions, setMissions] = useState([
    {
      id: 1,
      type: 'rescue',
      target: 'polar-bear',
      location: 'arctic',
      description: 'Rescue stranded polar bears affected by melting ice',
      completed: false
    },
    {
      id: 2,
      type: 'restore',
      target: 'coral-reef',
      location: 'ocean',
      description: 'Plant heat-resistant coral to restore damaged reefs',
      completed: false
    },
    {
      id: 3,
      type: 'clean',
      target: 'plastic',
      location: 'beach',
      description: 'Clean up plastic waste threatening marine life',
      completed: false
    }
  ]);

  const updateGameState = () => {
    // Update game physics and state
    if (gameState === 'playing') {
      // Keep player within canvas bounds
      const canvas = canvasRef.current;
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, Math.min(canvas.width - 30, prev.x)),
        y: Math.max(0, Math.min(canvas.height - 30, prev.y))
      }));
    }
  };

  const drawGame = (ctx) => {
    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw player
    ctx.fillStyle = '#2ECC71'; // Green
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw mission objectives
    missions.forEach(mission => {
      if (!mission.completed) {
        // Draw mission targets
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(
          Math.random() * ctx.canvas.width,
          Math.random() * ctx.canvas.height,
          10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  };

  const checkMissions = () => {
    // Check if player has completed any missions
    missions.forEach(mission => {
      if (!mission.completed) {
        // Simple distance check for mission completion
        const distance = Math.sqrt(
          Math.pow(player.x - mission.targetX, 2) +
          Math.pow(player.y - mission.targetY, 2)
        );
        
        if (distance < 30) {
          setMissions(prev =>
            prev.map(m =>
              m.id === mission.id ? { ...m, completed: true } : m
            )
          );
          setScore(prev => prev + 100);
        }
      }
    });
  };

  const updatePlayerPosition = (key) => {
    setPlayer(prev => {
      const newPos = { ...prev };
      switch (key) {
        case 'ArrowUp':
          newPos.y -= prev.speed;
          break;
        case 'ArrowDown':
          newPos.y += prev.speed;
          break;
        case 'ArrowLeft':
          newPos.x -= prev.speed;
          break;
        case 'ArrowRight':
          newPos.x += prev.speed;
          break;
        default:
          break;
      }
      return newPos;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gameLoop = () => {
      if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateGameState();
        drawGame(ctx);
        checkMissions();
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const handleKeyPress = (e) => {
      if (gameState === 'playing') {
        updatePlayerPosition(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    if (gameState === 'playing') {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, player, missions]);

  const startGame = () => {
    setGameState('playing');
    setPlayer({
      x: canvasRef.current.width / 2,
      y: canvasRef.current.height - 50,
      vehicle: 'eco-drone',
      inventory: [],
      speed: 5
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-green-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white bg-opacity-10 rounded-xl p-6">
          <div className="text-white mb-4 flex justify-between items-center">
            <div>
              <span className="text-xl mr-6">Level: {level}</span>
              <span className="text-xl">Score: {score}</span>
            </div>
            <div className="flex space-x-4">
              {gameState === 'menu' && (
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Start Mission
                </button>
              )}
              {gameState === 'playing' && (
                <button
                  onClick={() => setGameState('paused')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition duration-200"
                >
                  Pause
                </button>
              )}
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="bg-opacity-50 bg-blue-900 rounded-lg mx-auto"
          />

          {/* Mission Information */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {missions.map(mission => (
              <div 
                key={mission.id}
                className={`p-4 rounded-lg ${
                  mission.completed 
                    ? 'bg-green-900 bg-opacity-50' 
                    : 'bg-blue-900 bg-opacity-50'
                }`}
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {mission.type.charAt(0).toUpperCase() + mission.type.slice(1)} Mission
                </h3>
                <p className="text-gray-200 text-sm">{mission.description}</p>
                {mission.completed && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateRescue; 