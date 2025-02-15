import React, { useState } from 'react';
import Navbar from '../Navbar';

const ClimateHero = () => {
  const [score, setScore] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: "You're at the supermarket buying groceries. What do you choose?",
      image: "🛒",
      choices: [
        {
          text: "Pre-packaged imported fruits",
          impact: -5,
          feedback: "Imported fruits have a high carbon footprint due to transportation and packaging."
        },
        {
          text: "Local seasonal produce",
          impact: 10,
          feedback: "Great choice! Local seasonal produce reduces transportation emissions and supports local farmers."
        },
        {
          text: "Organic vegetables with plastic packaging",
          impact: 0,
          feedback: "Organic is good, but plastic packaging creates waste. Consider bringing your own bags."
        }
      ]
    },
    {
      id: 2,
      situation: "Your phone is getting old. What's your next move?",
      image: "📱",
      choices: [
        {
          text: "Buy the latest model immediately",
          impact: -10,
          feedback: "Electronic waste is a growing problem. New devices require resource extraction and energy."
        },
        {
          text: "Repair the current phone",
          impact: 15,
          feedback: "Excellent! Repairing extends device life and reduces e-waste."
        },
        {
          text: "Research eco-friendly phone options",
          impact: 5,
          feedback: "Good thinking! Considering environmental impact in purchases is important."
        }
      ]
    },
    // Add more scenarios here...
  ];

  const handleChoice = (choice) => {
    setScore(prevScore => prevScore + choice.impact);
    setFeedback(choice.feedback);
    
    setTimeout(() => {
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
        setFeedback('');
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const getScoreMessage = () => {
    if (score >= 30) return "Amazing! You're a true Climate Hero! 🌟";
    if (score >= 15) return "Good job! You're making positive changes! 👍";
    return "There's room for improvement. Try again! 🌱";
  };

  const restartGame = () => {
    setScore(0);
    setCurrentScenario(0);
    setFeedback('');
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Climate Hero Journey</h1>
            <p className="text-lg text-gray-600 mt-2">Make sustainable choices and become a Climate Hero!</p>
            <div className="mt-4 text-2xl font-bold text-primary-600">
              Score: {score}
            </div>
          </div>

          {!gameOver ? (
            <div className="space-y-6">
              <div className="text-center text-6xl mb-4">
                {scenarios[currentScenario].image}
              </div>
              
              <div className="text-xl text-center mb-6">
                {scenarios[currentScenario].situation}
              </div>

              <div className="grid gap-4">
                {scenarios[currentScenario].choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 text-left rounded-lg border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>

              {feedback && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <p className="text-primary-800">{feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">{getScoreMessage()}</h2>
              <p className="text-lg">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Educational Tips */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Did You Know?</h3>
            <p className="text-gray-600">
              Daily choices have a big impact on climate change. Small changes in our lifestyle
              can add up to make a significant difference in reducing our carbon footprint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateHero; 