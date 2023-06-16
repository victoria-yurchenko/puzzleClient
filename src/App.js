import './App.css';
import { useEffect, useRef } from 'react';

function App() {

  const isCalled = useRef(false);
  const movesCounter = useRef(0);
  const startTime = useRef(null);
  const endTime = useRef(null);
  const seconds = useRef(0);

  useEffect(() => {
    if (!isCalled.current) {
      initializePuzzle();
      isCalled.current = true;
    }
  });

  const getRate = () => {

    const url = 'https://localhost:7065/api/puzzles/user';

    const name = document.getElementById('name').value;
    const userPassword = document.getElementById('password').value;

    const requestUrl = url + '?id=0&username=' + name + '&password=' + userPassword;

    fetch(requestUrl)
      .then(responce => responce.json())
      .then(result => {
        result.map((element) => {
          const h3 = document.getElementById('replay').append('h3');
          h3.innerHTML = result.movements + ' moves; ' + result.timeSeconds + 's'
        })
        
      })
      .catch(error => {
        console.error('Error: ', error);
      })
  }

  const save = () => {
    const url = 'https://localhost:7065/api/puzzles/';

    const name = document.getElementById('name').value;
    const userPassword = document.getElementById('password').value;

    const userDTO = {
      userName: name,
      password: userPassword,
      movements: movesCounter.current,
      seconds: seconds.current
    };

    console.log(JSON.stringify(userDTO))

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userDTO)
    };

    fetch(url, options)
      .then(response => response.json())
      .then(result => {
        // Handle the API response
        console.log(result);
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.error('Error:', error);
      });

  }

  const replay = () => {
    document.getElementById('puzzle-board').innerHTML = '';
    initializePuzzle();
  }

  const getBestScore = () => {
    const url = 'https://localhost:7065/api/puzzles';
    fetch(url)
      .then(responce => responce.json())
      .then(result => {
        if (result != null)
          document.getElementById('best-score').innerHTML = "Best time is: " + result.timeSeconds + 's';
      })
      .catch(error => {
        console.error('Error: ', error);
      })
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-lg-6'>
          <div id="puzzle-board"></div>
          <div className='marg' id='moves-counter'>Moves counter: 0</div>
          <div className='marg' id='time-elapsed'>Time elapsed: 0s</div>
          <div className='marg' id='best-score'>Best time is: 0s</div>
        </div>
        <div className='col-lg-6'>
          <div className='marg'>
            <input className='form-control w-100' id='name' placeholder='name'
              style={{ marginBottom: '10px', fontSize: '16pt', fontFamily: 'Arial, Helvetica, sans-serif' }}
              onChange={(event) => {
                if (event.target.value != '' &&
                  document.getElementById('password').value != '')
                  document.getElementById('rate').disabled = false;
              }}
            />
            <input className='form-control w-100' id='password' placeholder='password'
              style={{ marginBottom: '10px', fontSize: '16pt', fontFamily: 'Arial, Helvetica, sans-serif' }}
              onChange={(event) => {
                if (event.target.value != '' &&
                  document.getElementById('name').value != '')
                  document.getElementById('rate').disabled = false;
              }}
            />
          </div>
          <div className='marg'>
            <button id='rate' onClick={getRate} className='form-control' style={{ marginBottom: '10px', fontSize: '16pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>Rate</button>
            <button id='save' onClick={save} className='form-control' style={{ marginBottom: '10px', fontSize: '16pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>Save</button>
            <button id='replay' onClick={replay} className='form-control' style={{ marginBottom: '10px', fontSize: '16pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>Replay</button>
          </div>
        </div>
      </div>
    </div>
  );

  function startTimer() {
    startTime.current = new Date();
  }

  function endTimer() {
    endTime.current = new Date();
    let timeDiff = endTime.current - startTime.current;
    timeDiff /= 1000;
    seconds.current = Math.round(timeDiff);
    document.getElementById('time-elapsed').innerHTML = 'Time elapsed: ' + seconds.current + 's';
  }


  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Function to check if the puzzle is solved
  function isPuzzleSolved() {
    const cells = Array.from(document.querySelectorAll('.cell'));
    for (let i = 0; i < cells.length - 1; i++) {
      const cellValue = cells[i].innerHTML;
      if (cellValue !== i + 1)
        return false;
    }
    return true;
  }


  // Function to handle tile click
  function handleTileClick() {

    const selectedCell = this;
    const emptyCell = document.querySelector('.empty');

    // Check if the selected tile is adjacent to the empty tile
    const selectedTileIndex = Array.from(selectedCell.parentNode.children).indexOf(selectedCell);
    const emptyTileIndex = Array.from(emptyCell.parentNode.children).indexOf(emptyCell);
    const isAdjacent =
      Math.abs(selectedTileIndex - emptyTileIndex) === 1 ||
      Math.abs(selectedTileIndex - emptyTileIndex) === 4;

    if (isAdjacent) {
      movesCounter.current = movesCounter.current + 1;
      document.getElementById('moves-counter').innerHTML = 'Moves counter: ' + movesCounter.current;

      // Swap the positions of the selected tile and the empty tile
      selectedCell.classList.add('empty');
      emptyCell.classList.remove('empty');
      emptyCell.innerText = this.innerText;
      // emptyCell.style.backgroundColor = 'green'
      selectedCell.innerText = '';

      // Check if the puzzle is solved
      if (isPuzzleSolved()) {
        document.getElementById('save').disabled = false;
        const intervalId = setInterval(endTimer, 1000);
        clearInterval(intervalId);
        alert('Congratulations! Puzzle solved!');
        document.getElementById('save').disabled = false;
      }
    }
  }

  // Function to initialize the puzzle
  function initializePuzzle() {
    getBestScore();
    document.getElementById('save').disabled = true;
    document.getElementById('rate').disabled = true;
    startTimer();
    setInterval(endTimer, 1000);
    movesCounter.current = 0;
    document.getElementById('moves-counter').innerHTML = 'Moves counter: ' + movesCounter.current;
    const puzzleBoard = document.getElementById('puzzle-board');
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1); // Generate numbers from 1 to 15
    const shuffledNumbers = shuffleArray(numbers.concat('')); // Append empty string to represent the empty tile

    shuffledNumbers.forEach(number => {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (number === '')
        cell.classList.add('empty');
      cell.innerText = number;
      cell.addEventListener('click', handleTileClick);
      puzzleBoard.appendChild(cell);
    });
  }
}

export default App;
