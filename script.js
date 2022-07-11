// array from which random no.s will be selected from 1 to 15
const positionsArray = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  null,
];

const positionStatusMap = new Map(); //  map to keep the track of blocks and their correct positions

// Audio files played while handling click events
const toggleActivityAudio = new Audio("./assets/toggleactivity.mp3");
const winningAudio = new Audio("./assets/winning.wav");
const clickButtonAudio = new Audio("./assets/clickbutton.wav");

// DOM elements
const timer = document.querySelector("#timer");
const movesCounter = document.querySelector("#movescounter");
const gameBoardCover = document.querySelector(
  "#Game_gameboard_container_cover"
);
const toggleActivity = document.querySelector("#toggleactivity");
const resetButton = document.querySelector("#resetbutton");

let stepsCounter = 0; // Variable to count moves of the players

// local storage variables
let localStorageTime = localStorage.getItem("currentTime");
let localStorageMoves = localStorage.getItem("currentMoves");
let localStoragePositions = localStorage.getItem("currentPositions");

// Function to set Local storage values
function setLocalStorageValues(key, value) {
  localStorage.setItem(key, value);
  if (key == "currentTime") {
    localStorageTime = value;
  } else if (key == "currentMoves") {
    localStorageMoves = value;
  } else if (key == "currentPositions") {
    localStoragePositions = value;
  }
}

// Function  which returns DOM element cell with attached position
function GiveCellId(position) {
  return document.querySelector(
    `#Game_gameboard_container_board_row_cell-${position}`
  );
}

// Document load activity
document.addEventListener("DOMContentLoaded", (event) => {
  const currentTime = getCurrentTime();

  if (currentTime > 0) {
    const status = confirm("You want to resume ?");

    if (!status) {
      handleWindowLoader({ command: "RESET" });
    } else {
      handleWindowLoader({ command: "RESUME" });
    }
  } else {
    handleWindowLoader({ command: "LOAD" });
  }

  document.body.style.display = "block";
});

function getCurrentTime() {
  let currentTime;

  if (localStorageTime) {
    currentTime = localStorageTime.split(":");
    const minutes = +currentTime[0] * 60;
    const seconds = +currentTime[1];
    return minutes + seconds;
  }
  return 0;
}

// Document load activity handler
async function handleWindowLoader(operation) {
  if (!localStorageTime) {
    setDOMValues(timer, { textContent: "00:00" });

    setLocalStorageValues("currentTime", timer.textContent);

    createPuzzleBoard();
    return;
  }
  if (operation.command == "RESET") {
    setDOMValues(timer, { textContent: "00:00" });
    setLocalStorageValues("currentTime", timer.textContent);
    setDOMValues(movesCounter, { textContent: "0" });

    setLocalStorageValues("currentMoves", movesCounter.textContent);
    createPuzzleBoard();
    handleTimerOperations({ command: "STOP" });
    return;
  }
  stepsCounter = +localStorageMoves;
  createPuzzleBoard();
}

// Function to create the Puzzle board
async function createPuzzleBoard() {
  gameBoardCover.style.display = "flex";
  const arrayHelper = [];
  const arrayOfBoardValues = createPuzzleBoardHelper(arrayHelper);
  if (!localStoragePositions) {
    setLocalStorageValues("currentPositions", arrayOfBoardValues);
  }
  if (!localStorageMoves) {
    setLocalStorageValues("currentMoves", stepsCounter);
  }

  setDOMValues(movesCounter, {
    textContent: localStorageMoves,
  });
  setDOMValues(timer, {
    textContent: localStorageTime,
  });
  setDOMValues(toggleActivity, {
    value: "Start",
    title: "Start Game",
    innerHTML: `<img src="./assets/startIcon.svg" alt="Start Game Button" >`,
  });
  setDOMValues(gameBoardCover, {
    textContent: "Play",
  });

  await checkForValidityOfPuzzle(arrayOfBoardValues)
    .then((result) => {
      stepsCounter = +localStorageMoves;

      let positionOfEmptyBlock;

      for (let value = 0; value < arrayOfBoardValues.length; value++) {
        const cellId = GiveCellId(value + 1);
        if (value + 1 == arrayOfBoardValues[value]) {
          positionStatusMap.set(value + 1, { status: true });

          setDOMValues(cellId, { textContent: arrayOfBoardValues[value] });
          setDOMValues(cellId, { value: arrayOfBoardValues[value] });
        } else if (arrayOfBoardValues[value] == null) {
          positionOfEmptyBlock = value + 1;
          if (value + 1 == 16) {
            positionStatusMap.set(value + 1, { status: true });
          } else {
            positionStatusMap.set(value + 1, { status: false });
          }

          setDOMValues(cellId, { textContent: " " });
          setDOMValues(cellId, { value: null });
        } else {
          positionStatusMap.set(value + 1, { status: false });
          setDOMValues(cellId, { textContent: arrayOfBoardValues[value] });
          setDOMValues(cellId, { value: arrayOfBoardValues[value] });
        }
      }
      changeBackgroundOfCell(positionStatusMap, positionOfEmptyBlock);
    })
    .catch((err) => {
      createPuzzleBoard();
    });
}

// Change Background Colour of the blocks according to their state
function changeBackgroundOfCell(positionStatusMap, positionOfEmptyBlock) {
  const mapValues = positionStatusMap.entries();
  const arrayOfMapValues = Array.from(mapValues);

  for (const value of arrayOfMapValues) {
    const cellId = GiveCellId(value[0]);
    if (value[1].status) {
      // if empty block is at its correct position
      if (positionOfEmptyBlock == 16) {
        GiveCellId(positionOfEmptyBlock).style.backgroundColor =
          "rgb(78, 78, 9)";  
        if (value[0] == 15 || value[0] == 12) {
          cellId.style.backgroundColor = "green";
        }
      } else {
        cellId.style.backgroundColor = "green";
      }
    } else {
      if (value[0] == positionOfEmptyBlock) {
        cellId.style.backgroundColor = "rgb(78, 78, 9)";
      } else {
        cellId.style.backgroundColor = "yellow";
      }
    }
  }
}

// Function to get the inversion count
function getInversionCount(arrayOfBoardValues) {
  let inversionCount = 0;
  for (let value = 0; value < arrayOfBoardValues.length; value++) {
    for (
      let nextvalue = value + 1;
      nextvalue < arrayOfBoardValues.length;
      nextvalue++
    ) {
      if (
        arrayOfBoardValues[value] != null &&
        arrayOfBoardValues[nextvalue] != null &&
        arrayOfBoardValues[value] > arrayOfBoardValues[nextvalue]
      ) {
        inversionCount++;
      }
    }
  }
  return inversionCount;
}

// helper function to create the puzzle board
function createPuzzleBoardHelper(arrayHelper) {
  const currentTime = getCurrentTime();

  if (currentTime > 0) {
    const arrayFromLocalStorage = localStoragePositions.split(",");
    const index = arrayFromLocalStorage.indexOf("");
    arrayFromLocalStorage[index] = null;
    return arrayFromLocalStorage;
  }
  const helper = positionsArray.slice(0, 17); // copy content of positionsArray in helper

  while (helper.length) {
    const randomNum = Math.floor(Math.random() * 17);
    if (helper[randomNum] === undefined) {
      continue;
    } else {
      arrayHelper.push(helper[randomNum]);
    }

    helper.splice(randomNum, 1);
  }
  setLocalStorageValues("currentPositions", arrayHelper);

  return arrayHelper;
}

// Check for solvable or unsolvable case
async function checkForValidityOfPuzzle(arrayOfBoardValues) {
  const inversionCount = getInversionCount(arrayOfBoardValues);

  const positionOfEmptyBlock =
    Math.ceil((arrayOfBoardValues.indexOf(null) + 1) / 4) * 4;

  if ((positionOfEmptyBlock / 4) % 2 != 0 && inversionCount % 2 != 0) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  return (positionOfEmptyBlock / 4) % 2 == 0 && inversionCount % 2 == 0
    ? new Promise((resolve, reject) => {
        resolve(true);
      })
    : new Promise((resolve, reject) => {
        reject("Unsolvable");
      });
}

// Handle Timeer Events

let timeInterval;

//  function to set value of the Timer
function setTimerValue(currentTime) {
  if (currentTime < 60) {
    setDOMValues(timer, {
      textContent:
        currentTime <= 9 ? `00:0${currentTime}` : `00:${currentTime}`,
    });

    setLocalStorageValues("currentTime", timer.textContent);
    return;
  }
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime - 60 * minutes;
  if (minutes <= 9 && seconds <= 9) {
    setDOMValues(timer, {
      textContent: `0${minutes}:0${seconds}`,
    });
  } else if (minutes <= 9 && seconds > 9) {
    setDOMValues(timer, {
      textContent: `0${minutes}:${seconds}`,
    });
  } else if (minutes > 9 && seconds <= 9) {
    setDOMValues(timer, {
      textContent: `${minutes}:0${seconds}`,
    });
  } else {
    setDOMValues(timer, {
      textContent: `${minutes}:${seconds}`,
    });
  }

  setLocalStorageValues("currentTime", timer.textContent);
}

//  function to handle the timer for different scenarios
function handleTimerOperations(operation) {
  if (operation.command == "START" && !localStorageTime) {
    const time = new Date().getMinutes() * 60 + new Date().getSeconds();
    timeInterval = setInterval(() => {
      const newDate = new Date();

      const newTime = newDate.getMinutes() * 60 + newDate.getSeconds();

      const currentTime = newTime - time;
      setTimerValue(currentTime);
    }, 1000);
    return;
  }
  if (operation.command == "STOP") {
    clearInterval(timeInterval);
    setDOMValues(timer, { textContent: "00:00" });

    setLocalStorageValues("currentTime", timer.textContent);
    return;
  }
  if (operation.command == "PAUSE") {
    clearInterval(timeInterval);
    return;
  }

  let currentTime = getCurrentTime();
  setTimerValue(currentTime);
  currentTime++;

  timeInterval = setInterval(() => {
    setTimerValue(currentTime);
    currentTime++;
  }, 1000);
}

// Function to search for the position of empty block
function isEmptyBlock(position) {
  if (GiveCellId(position).value == "null") {
    stepsCounter++;
    return true;
  }
}

// Function to swap the blocks
function SwapWithEmptyBlock(positionOfEmptyBlock, positionOfClickedBlock) {
  const clickedBlockCellId = GiveCellId(positionOfClickedBlock);
  const emptyBlockCellId = GiveCellId(positionOfEmptyBlock);
  const { value } = clickedBlockCellId;
  clickButtonAudio.play();
  setDOMValues(clickedBlockCellId, { textContent: " " });
  setDOMValues(clickedBlockCellId, { value: null });

  setDOMValues(emptyBlockCellId, { textContent: value });
  setDOMValues(emptyBlockCellId, { value });
  if (positionOfClickedBlock == 16) {
    positionStatusMap.set(positionOfClickedBlock, {
      status: true,
    });
  } else {
    positionStatusMap.set(positionOfClickedBlock, {
      status: false,
    });
  }

  if (positionOfEmptyBlock == value) {
    positionStatusMap.set(positionOfEmptyBlock, { status: true });
  } else {
    positionStatusMap.set(positionOfEmptyBlock, { status: false });
  }

  changeBackgroundOfCell(positionStatusMap, positionOfClickedBlock);
}

// Function to check the position of the empty block around the clicked block
function checkForEmptyBlock(positionOfClickedBlock) {
  let leftBlockPosition = positionOfClickedBlock - 1; // search the position of the empty block on left of the clicked block
  let rightBlockPosition = positionOfClickedBlock + 1; // search the position of the empty block on right of the clicked block
  const topBlockPosition = positionOfClickedBlock - 4; // search the position of the empty block on top of the clicked block
  const bottomBlockPosition = positionOfClickedBlock + 4; // search the position of the empty block on bottom of the clicked block

  if (positionOfClickedBlock % 4 == 0) {
    rightBlockPosition = -1;
  }
  if ((positionOfClickedBlock - 1) % 4 == 0) {
    leftBlockPosition = -1;
  }

  if (leftBlockPosition > 0 && isEmptyBlock(leftBlockPosition)) {
    SwapWithEmptyBlock(leftBlockPosition, positionOfClickedBlock);
    return;
  }
  if (
    rightBlockPosition < 17 &&
    rightBlockPosition > 0 &&
    isEmptyBlock(rightBlockPosition)
  ) {
    SwapWithEmptyBlock(rightBlockPosition, positionOfClickedBlock);

    return;
  }
  if (topBlockPosition > 0 && isEmptyBlock(topBlockPosition)) {
    SwapWithEmptyBlock(topBlockPosition, positionOfClickedBlock);
    return;
  }
  if (bottomBlockPosition < 17 && isEmptyBlock(bottomBlockPosition)) {
    SwapWithEmptyBlock(bottomBlockPosition, positionOfClickedBlock);
    return;
  }
}

// Function to create an array of the current positions of the blocks from Local Storage
async function createArrayForLocalStoragePositions() {
  const array = [];
  for (let i = 0; i < 16; i++) {
    const cellId = GiveCellId(i + 1);
    if (cellId.textContent == " ") {
      array.push(null);
    } else {
      array.push(+cellId.textContent);
    }
  }
  return array;
}

// Function to handle the event when a blockm is clicked
async function clickBlock(id) {
  if (GiveCellId(id).textContent == " ") {
    return;
  }

  const positionOfClickedBlock = id;

  checkForEmptyBlock(positionOfClickedBlock);
  setDOMValues(movesCounter, {
    textContent: stepsCounter,
  });

  setLocalStorageValues("currentMoves", movesCounter.textContent);

  const currentPositionArray = await createArrayForLocalStoragePositions();
  setLocalStorageValues("currentPositions", currentPositionArray);

  // Fetch status of all positions from the map and fill it in an array
  const positionStatusArray = Array.from(positionStatusMap.values());

  // check for positions with status false
  const falseStatus = positionStatusArray.find((item) => item.status == false);
  // if falseStatus is undefined this means all the blocks are at correct positions and game is over
  if (falseStatus == undefined) {
    const timeConsumed = timer.textContent.split(":");
    const minutes = +timeConsumed[0];
    const seconds = +timeConsumed[1];
    const timeResultToBeShown = !minutes
      ? `${seconds} Seconds`
      : !seconds
      ? `${minutes} Minutes`
      : `${minutes} Minute and ${seconds} Seconds`;
    winningAudio.play();
    setTimeout(() => {
      alert(
        `Congratulations you solved the puzzle in ${stepsCounter} steps in ${timeResultToBeShown}`
      );
      handleWindowLoader({ command: "RESET" });
    }, 500);
  }
}

// Handle boardCover click event

gameBoardCover.addEventListener("click", function () {
  gameBoardCover.style.display = "none";

  setDOMValues(toggleActivity, {
    value: "Pause",
    title: "Pause Game",
    innerHTML: `<img src="./assets/pauseIcon.svg" alt="Pause Game Button">`,
  });
  toggleActivityAudio.play();
  handleTimerOperations({ command: "START" });
});

// Function to set DOM  elemnt attributes
function setDOMValues(element, attr) {
  const arrayOfEntries = Object.entries(attr);

  for (const arrayOfEntry of arrayOfEntries) {
    element[arrayOfEntry[0]] = arrayOfEntry[1];
  }
}

// Handle resume and pause activities

toggleActivity.addEventListener("click", function () {
  if (toggleActivity.value == "Start") {
    setDOMValues(toggleActivity, {
      value: "Pause",
      title: "Pause Game",
      innerHTML: `<img src="./assets/pauseIcon.svg" alt="Pause Game Button">`,
    });
    toggleActivityAudio.play();
    gameBoardCover.style.display = "none";

    handleTimerOperations({ command: "Start" });
    return;
  }
  if (toggleActivity.value == "Pause") {
    gameBoardCover.style.display = "flex";
    handleTimerOperations({ command: "PAUSE" });
    setDOMValues(gameBoardCover, {
      textContent: "Paused",
    });
    setDOMValues(toggleActivity, {
      value: "Resume",
      title: "Resume Game",
      innerHTML: `<img src="./assets/resumeIcon.svg" alt="Resume Game Button">`,
    });
    toggleActivityAudio.play();
    return;
  }
  setDOMValues(toggleActivity, {
    value: "Pause",
    title: "Pause Game",
    innerHTML: `<img src="./assets/pauseIcon.svg" alt="Pause Game Button">`,
  });
  toggleActivityAudio.play();
  gameBoardCover.style.display = "none";
  handleTimerOperations({ command: "RESUME" });
});

resetButton.addEventListener("click", () => {
  toggleActivityAudio.play();
  handleWindowLoader({ command: "RESET" });
});

document.querySelector("#setter").addEventListener("click", () => {
  GiveCellId(1).value = "17";
});
