import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';

const TimeEcoSavior = () => {
  const [gameState, setGameState] = useState('intro'); // intro, playing, ending
  const [score, setScore] = useState(50);
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [worldState, setWorldState] = useState({
    pollution: 50,
    forestCover: 70,
    renewableEnergy: 10,
    temperature: 0
  });

  const timePeriods = [
    {
      era: "Industrial Revolution (1830s-1900s)",
      description: "The dawn of modern industry. Your decisions here will shape the foundation of our industrial world.",
      character: {
        name: "James Watt",
        role: "Industrial Pioneer",
        avatar: "👨‍🔬"
      },
      scenarios: [
        {
          id: 1,
          question: "As steam power becomes popular, which energy source will you promote?",
          choices: [
            {
              text: "Coal - It's abundant and powerful",
              impact: {
                score: -10,
                pollution: +20,
                temperature: +0.5
              },
              feedback: "While coal powered the industrial revolution, it began a legacy of fossil fuel dependency and pollution."
            },
            {
              text: "Invest in early hydroelectric power",
              impact: {
                score: +15,
                pollution: -5,
                renewableEnergy: +10
              },
              feedback: "A forward-thinking choice! Early investment in hydropower helped establish renewable energy infrastructure."
            }
          ]
        },
        {
          id: 2,
          question: "Urban factories are growing. How will you handle waste management?",
          choices: [
            {
              text: "Dump waste in rivers - it's the cheapest solution",
              impact: {
                score: -15,
                pollution: +25,
                forestCover: -10
              },
              feedback: "This practice led to severe water pollution and health issues in industrial cities."
            },
            {
              text: "Implement basic waste treatment systems",
              impact: {
                score: +10,
                pollution: -10
              },
              feedback: "Early investment in waste management helped prevent environmental disasters."
            }
          ]
        }
      ]
    },
    {
      era: "Modern Day (2025)",
      description: "Our present choices will determine the immediate future of our planet.",
      character: {
        name: "Dr. Sarah Chen",
        role: "Climate Scientist",
        avatar: "👩‍🔬"
      },
      scenarios: [
        {
          id: 1,
          question: "A major city is planning its energy infrastructure for the next decade. What do you recommend?",
          choices: [
            {
              text: "Maintain existing fossil fuel plants - they're reliable and cost-effective",
              impact: {
                score: -20,
                pollution: +15,
                temperature: +0.3,
                renewableEnergy: -5
              },
              feedback: "While reliable, fossil fuels continue to contribute significantly to global warming and air pollution."
            },
            {
              text: "Invest heavily in solar and wind infrastructure with battery storage",
              impact: {
                score: +20,
                pollution: -10,
                renewableEnergy: +25,
                temperature: -0.1
              },
              feedback: "Renewable energy investment helps create a sustainable future and reduces carbon emissions."
            }
          ]
        },
        {
          id: 2,
          question: "Transportation is a major source of emissions. How should we address it?",
          choices: [
            {
              text: "Expand highways to reduce traffic congestion",
              impact: {
                score: -15,
                pollution: +20,
                forestCover: -10
              },
              feedback: "More roads often lead to more cars and increased emissions - known as induced demand."
            },
            {
              text: "Invest in public transit and bicycle infrastructure",
              impact: {
                score: +15,
                pollution: -15,
                renewableEnergy: +5
              },
              feedback: "Sustainable transportation reduces emissions and improves urban livability."
            }
          ]
        },
        {
          id: 3,
          question: "How should we address deforestation in developing nations?",
          choices: [
            {
              text: "Allow economic growth to take priority",
              impact: {
                score: -20,
                forestCover: -20,
                temperature: +0.2
              },
              feedback: "Short-term economic gains often lead to long-term environmental damage."
            },
            {
              text: "Establish international funding for forest preservation",
              impact: {
                score: +20,
                forestCover: +15,
                pollution: -10
              },
              feedback: "Supporting sustainable development helps both local communities and global climate goals."
            }
          ]
        }
      ]
    },
    {
      era: "Future (2100)",
      description: "The consequences of past choices are clear. Can we create a sustainable future?",
      character: {
        name: "AI-ECO",
        role: "Environmental Analysis System",
        avatar: "🤖"
      },
      scenarios: [
        {
          id: 1,
          question: "Rising sea levels threaten coastal cities. What's your approach?",
          choices: [
            {
              text: "Build massive sea walls to protect existing infrastructure",
              impact: {
                score: -10,
                pollution: +15,
                renewableEnergy: -10
              },
              feedback: "While protective, sea walls are expensive and don't address the root cause of rising seas."
            },
            {
              text: "Implement managed retreat and restore natural coastlines",
              impact: {
                score: +25,
                forestCover: +20,
                pollution: -15
              },
              feedback: "Natural solutions often provide better long-term protection and environmental benefits."
            }
          ]
        },
        {
          id: 2,
          question: "Advanced technology allows for weather modification. Should we use it?",
          choices: [
            {
              text: "Deploy global climate control systems",
              impact: {
                score: -15,
                temperature: -0.5,
                renewableEnergy: -20
              },
              feedback: "Technological fixes without addressing root causes can lead to unintended consequences."
            },
            {
              text: "Focus on natural climate solutions and emissions reduction",
              impact: {
                score: +20,
                forestCover: +15,
                pollution: -20
              },
              feedback: "Working with nature provides more sustainable and resilient solutions."
            }
          ]
        },
        {
          id: 3,
          question: "How should we handle climate refugees from uninhabitable regions?",
          choices: [
            {
              text: "Restrict migration to protect resources",
              impact: {
                score: -25,
                pollution: +10,
                renewableEnergy: -5
              },
              feedback: "Isolationist policies often lead to greater global instability and suffering."
            },
            {
              text: "Create international climate refuge zones with sustainable infrastructure",
              impact: {
                score: +25,
                renewableEnergy: +15,
                forestCover: +10
              },
              feedback: "Global cooperation and planning helps create a more resilient and equitable future."
            }
          ]
        }
      ]
    }
  ];

  const handleChoice = (choice) => {
    // Update score and world state
    setScore(prev => prev + choice.impact.score);
    setWorldState(prev => ({
      pollution: Math.max(0, Math.min(100, prev.pollution + (choice.impact.pollution || 0))),
      forestCover: Math.max(0, Math.min(100, prev.forestCover + (choice.impact.forestCover || 0))),
      renewableEnergy: Math.max(0, Math.min(100, prev.renewableEnergy + (choice.impact.renewableEnergy || 0))),
      temperature: prev.temperature + (choice.impact.temperature || 0)
    }));

    // Show feedback
    setFeedback(choice.feedback);

    // Progress game after delay
    setTimeout(() => {
      setFeedback(null);
      if (currentScenario < timePeriods[currentPeriod].scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
      } else if (currentPeriod < timePeriods.length - 1) {
        setCurrentPeriod(prev => prev + 1);
        setCurrentScenario(0);
      } else {
        setGameState('ending');
      }
    }, 3000);
  };

  const getEndingMessage = () => {
    if (score >= 80) {
      return "Congratulations! Your wise decisions led to a sustainable future!";
    } else if (score >= 50) {
      return "The future is challenging but there's hope for improvement.";
    } else {
      return "Environmental challenges have created a difficult future.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-green-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white bg-opacity-10 rounded-xl p-8 text-white">
          {/* Score and World State Display */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-black bg-opacity-30 p-4 rounded-lg">
              <h3 className="text-sm font-semibold">Sustainability Score</h3>
              <p className="text-2xl font-bold">{score}</p>
            </div>
            {Object.entries(worldState).map(([key, value]) => (
              <div key={key} className="bg-black bg-opacity-30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="text-2xl font-bold">{typeof value === 'number' ? Math.round(value) : value}</p>
              </div>
            ))}
          </div>

          {gameState === 'playing' && (
            <div className="space-y-6">
              {/* Time Period and Character */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">{timePeriods[currentPeriod].era}</h2>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-4xl">{timePeriods[currentPeriod].character.avatar}</span>
                  <div>
                    <p className="font-semibold">{timePeriods[currentPeriod].character.name}</p>
                    <p className="text-sm opacity-80">{timePeriods[currentPeriod].character.role}</p>
                  </div>
                </div>
              </div>

              {/* Current Scenario */}
              <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">
                  {timePeriods[currentPeriod].scenarios[currentScenario].question}
                </h3>
                <div className="space-y-4">
                  {timePeriods[currentPeriod].scenarios[currentScenario].choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoice(choice)}
                      className="w-full p-4 text-left rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors duration-200"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className="mt-4 p-4 bg-black bg-opacity-30 rounded-lg">
                  <p>{feedback}</p>
                </div>
              )}
            </div>
          )}

          {gameState === 'intro' && (
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold">Time Traveler: Eco-Savior</h1>
              <p className="text-xl">Journey through time to shape Earth's environmental future</p>
              <button
                onClick={() => setGameState('playing')}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors duration-200"
              >
                Begin Journey
              </button>
            </div>
          )}

          {gameState === 'ending' && (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Journey Complete</h2>
              <p className="text-xl">{getEndingMessage()}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors duration-200"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeEcoSavior; 