import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar';

const ClimateDefender = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [resources, setResources] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [selectedDefense, setSelectedDefense] = useState(null);
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(100);

  const defenseTypes = {
    SOLAR: {
      name: 'Solar Shield',
      cost: 20,
      range: 100,
      damage: 15,
      color: '#FFD700',
      description: 'Converts harmful emissions into clean energy'
    },
    TREE: {
      name: 'Forest Guardian',
      cost: 30,
      range: 150,
      damage: 10,
      color: '#228B22',
      description: 'Absorbs CO2 and provides lasting protection'
    },
    WIND: {
      name: 'Wind Turbine',
      cost: 25,
      range: 120,
      damage: 12,
      color: '#87CEEB',
      description: 'Disrupts pollution clouds and generates resources'
    }
  };

  const [defenses, setDefenses] = useState([]);
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastSpawnTime = 0;

    const gameLoop = (timestamp) => {
      if (!gameOver) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn new threats
        if (timestamp - lastSpawnTime > 2000) { // Spawn every 2 seconds
          spawnThreat();
          lastSpawnTime = timestamp;
        }

        // Update and draw threats
        updateThreats();
        drawThreats(ctx);

        // Draw defenses
        drawDefenses(ctx);

        // Check collisions
        checkCollisions();

        // Request next frame
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const spawnThreat = () => {
      const newThreat = {
        x: Math.random() * canvas.width,
        y: 0,
        speed: 1 + (wave * 0.2),
        size: 20,
        health: 30 + (wave * 5),
        type: Math.random() > 0.5 ? 'POLLUTION' : 'EMISSION'
      };
      setThreats(prev => [...prev, newThreat]);
    };

    const updateThreats = () => {
      setThreats(prev => prev.map(threat => ({
        ...threat,
        y: threat.y + threat.speed
      })).filter(threat => {
        if (threat.y > canvas.height) {
          setHealth(prev => Math.max(0, prev - 10));
          return false;
        }
        return threat.health > 0;
      }));
    };

    const drawThreats = (ctx) => {
      threats.forEach(threat => {
        ctx.beginPath();
        ctx.fillStyle = threat.type === 'POLLUTION' ? '#8B0000' : '#4B0082';
        ctx.arc(threat.x, threat.y, threat.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(threat.x - 15, threat.y - 25, 30 * (threat.health / (30 + (wave * 5))), 5);
      });
    };

    const drawDefenses = (ctx) => {
      defenses.forEach(defense => {
        ctx.beginPath();
        ctx.fillStyle = defense.color;
        ctx.arc(defense.x, defense.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw range circle
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.arc(defense.x, defense.y, defense.range, 0, Math.PI * 2);
        ctx.stroke();
      });
    };

    const checkCollisions = () => {
      defenses.forEach(defense => {
        threats.forEach(threat => {
          const dx = defense.x - threat.x;
          const dy = defense.y - threat.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < defense.range) {
            // Apply damage
            threat.health -= defense.damage / 60; // Damage per frame
            
            // Visual effect for attack
            ctx.beginPath();
            ctx.strokeStyle = defense.color;
            ctx.moveTo(defense.x, defense.y);
            ctx.lineTo(threat.x, threat.y);
            ctx.stroke();

            // Resource generation
            if (Math.random() < 0.01) { // 1% chance per frame
              setResources(prev => prev + 1);
            }
          }
        });
      });
    };

    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [defenses, threats, wave, gameOver]);

  const handleCanvasClick = (e) => {
    if (selectedDefense && resources >= defenseTypes[selectedDefense].cost) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDefenses(prev => [...prev, {
        ...defenseTypes[selectedDefense],
        x,
        y
      }]);

      setResources(prev => prev - defenseTypes[selectedDefense].cost);
      setSelectedDefense(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-white">
            <span className="text-xl mr-4">Wave: {wave}</span>
            <span className="text-xl mr-4">Health: {health}</span>
            <span className="text-xl mr-4">Resources: {resources}</span>
            <span className="text-xl">Score: {score}</span>
          </div>
          <div className="flex space-x-4">
            {Object.entries(defenseTypes).map(([key, defense]) => (
              <button
                key={key}
                onClick={() => setSelectedDefense(key)}
                className={`px-4 py-2 rounded ${
                  selectedDefense === key ? 'bg-primary-500' : 'bg-primary-700'
                } text-white`}
                disabled={resources < defense.cost}
              >
                {defense.name} ({defense.cost})
              </button>
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className="bg-gray-800 rounded-lg mx-auto cursor-pointer"
        />

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="mb-4">Final Score: {score}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 text-white px-6 py-2 rounded"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClimateDefender; 