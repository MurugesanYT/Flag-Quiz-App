import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [flags, setFlags] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const correctCode = "3675";

  useEffect(() => {
    if (gameStarted) {
      fetchFlags();
    }
  }, [gameStarted]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Shuffle the array to get random flags
      const shuffledFlags = data.sort(() => Math.random() - 0.5);
      setFlags(shuffledFlags.slice(0, 10)); // Take the first 10
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
      toast.error('Failed to load flags. Please try again.');
    }
  };

  const handleCodeSubmit = () => {
    if (enteredCode === correctCode) {
      setGameStarted(true);
      toast.success('Code accepted! Starting game...');
    } else {
      toast.error('Incorrect code. Please try again.');
    }
  };

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer.');
      return;
    }

    const currentQuestion = flags[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.name.common) {
      setScore(score + 1);
      toast.success('Correct!');
    } else {
      toast.error(`Incorrect. The correct answer was ${currentQuestion.name.common}.`);
    }

    setSelectedAnswer(null);
    if (currentQuestionIndex < flags.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      toast.success('Quiz completed!');
    }
  };

  const generateOptions = () => {
    if (!flags[currentQuestionIndex]) return [];

    const correctOption = flags[currentQuestionIndex].name.common;
    let options = [correctOption];

    // Add three incorrect options
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * flags.length);
      const randomOption = flags[randomIndex].name.common;
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    return options;
  };

  if (!gameStarted) {
    return (
      <div className="container">
        <h1>Enter Code</h1>
        <input
          type="text"
          placeholder="Enter the code"
          value={enteredCode}
          onChange={(e) => setEnteredCode(e.target.value)}
        />
        <button onClick={handleCodeSubmit}>Submit Code</button>
      </div>
    );
  }

  if (loading) {
    return <div className="container">Loading flags...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  const options = generateOptions();

  return (
    <div className="container">
      {flags[currentQuestionIndex] ? (
        <>
          <h1>Question {currentQuestionIndex + 1}</h1>
          <img src={flags[currentQuestionIndex].flags.png} alt="Flag" style={{ width: '200px', height: '150px' }} />
          <div className="options">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelection(option)}
                className={selectedAnswer === option ? 'selected' : ''}
              >
                {option}
              </button>
            ))}
          </div>
          <button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
            {currentQuestionIndex === flags.length - 1 ? 'Finish' : 'Next'}
          </button>
          <p>Score: {score}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
