let selector = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null]; // array from which random no.s will be selected from 1 to 15

let status_map = new Map(); //  map to keep the track of blocks and their correct positions

// Handle Moves
let stepsCounter = 0;

function increaseStepCounter() {
  stepsCounter++;
}

// Document load activity
document.addEventListener("DOMContentLoaded", (event) => {
  let currentTime = getCurrentTime();
  if (currentTime > 0) {
    if (currentTime > 0) {
      document.querySelector('body').style.display = "none"
      let status = confirm("You want to resume ?");
      if (!status) {
        handleWindowLoader({ command: "Reset" });
        document.querySelector('body').style.display = "block"
      } else {
        handleWindowLoader({ command: "Resume" });
        document.querySelector('body').style.display = "block"
      }
    }
  } else {
    handleWindowLoader({ command: "Load" });
  }
});

function getCurrentTime() {
  let currentTime;
  if (localStorage.getItem("currentTime")) {
    currentTime = localStorage.getItem("currentTime").split(":");
    let minutes = Number(currentTime[0]) * 60;
    let seconds = Number(currentTime[1]);
    currentTime = minutes + seconds;
  } else {
    currentTime = 0;
  }

  return currentTime;
}

// Document load activity handler
async function handleWindowLoader(operation) {
  if (!localStorage.getItem("currentTime")) {
    document.querySelector("#timer").textContent = "0:0";

    localStorage.setItem(
      "currentTime",
      document.querySelector("#timer").textContent
    );
    createPuzzleBoard();
  } else if (operation.command == "Reset") {
    document.querySelector("#timer").textContent = "0:0";
    localStorage.setItem(
      "currentTime",
      document.querySelector("#timer").textContent
    );
    document.querySelector("#movesCounter").textContent = "0";
    localStorage.setItem(
      "currentMoves",
      document.querySelector("#movesCounter").textContent
    );
    createPuzzleBoard();
    handleTimer({ command: "Stop" });
  } else {
    stepsCounter = Number(localStorage.getItem("currentMoves"));
    createPuzzleBoard();
  }
}

// Function to create the Puzzle board
async function createPuzzleBoard() {
  document.querySelector("#boardCover").style.display = "flex";
  let resultingArray = [];
  let list = createPuzzleBoardHelper(resultingArray);
  if (!localStorage.getItem("currentPositions")) {
    localStorage.setItem("currentPositions", list);
  }
  if (!localStorage.getItem("currentMoves")) {
    localStorage.setItem("currentMoves", stepsCounter);
  }

  document.querySelector("#movesCounter").textContent =
    localStorage.getItem("currentMoves");
  document.querySelector("#timer").textContent =
    localStorage.getItem("currentTime");

  stepsCounter = Number(localStorage.getItem("currentMoves"));

  document.querySelector("#toggleActivity").value = "Start";
  document.querySelector("#toggleActivity").title = "Start Game"
  document.querySelector("#toggleActivity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-skip-start-circle" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M10.229 5.055a.5.5 0 0 0-.52.038L7 7.028V5.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V8.972l2.71 1.935a.5.5 0 0 0 .79-.407v-5a.5.5 0 0 0-.271-.445z" />
  </svg>`
  document.querySelector("#boardCover").textContent = "Play";

  await checkForValidity(list)
    .then((result) => {
      let swapperPosition;

      for (let i = 0; i < list.length; i++) {
        if (i + 1 == list[i]) {
          status_map.set(i + 1, { status: true });
          document.querySelector(`#board_row_${i + 1}`).textContent = list[i];
        } else if (list[i] == null) {
          swapperPosition = i + 1;

          status_map.set(i + 1, { status: false });
          document.querySelector(`#board_row_${i + 1}`).textContent = " ";
        } else {
          status_map.set(i + 1, { status: false });
          document.querySelector(`#board_row_${i + 1}`).textContent = list[i];
        }
      }
      change_background(status_map, swapperPosition);
    })
    .catch((err) => {
      createPuzzleBoard();
    });
}


// Change Background Colour of the blocks according to their state
function change_background(status_map, swapperPosition) {
  let map_values = status_map.entries();
  let array = Array.from(map_values);

  for (let i = 0; i < array.length; i++) {
    if (array[i][1].status) {
      document.querySelector(
        `#board_row_${array[i][0]}`
      ).style.backgroundColor = "green";
    } else if (array[i][0] == swapperPosition) {
      document.querySelector(
        `#board_row_${array[i][0]}`
      ).style.backgroundColor = "rgb(78, 78, 9)";
     
    } else {
      document.querySelector(
        `#board_row_${array[i][0]}`
      ).style.backgroundColor = "yellow";
    }
  }
}

// Function to get the inversion count
function getInversionCount(array) {
  let inversionCount = 0;
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] != null && array[j] != null && array[i] > array[j]) {
        inversionCount++;
      }
    }
  }
  return inversionCount;
}

// helper function to create the puzzle board
function createPuzzleBoardHelper(resultingArray) {
  let currentTime = getCurrentTime();

  if (currentTime > 0) {
    let array = localStorage.getItem("currentPositions").split(",");
    let index = array.indexOf("");
    array[index] = null;
    return array;
  } else {
    let helper = selector.slice(0, 17); // copy content of selector in helper

    while (helper.length) {
      let random_num = Math.floor(Math.random() * 17);
      if (helper[random_num] === undefined) {
        continue;
      } else {
        resultingArray.push(helper[random_num]);
      }

      helper.splice(random_num, 1);
    }
    localStorage.setItem("currentPositions", resultingArray);
    return resultingArray;
  }
}

// Check for solvable or unsolvable case
async function checkForValidity(array) {
  let inversionCount = getInversionCount(array);

  let positionOfSwapper = Math.ceil((array.indexOf(null) + 1) / 4) * 4;

  if ((positionOfSwapper / 4) % 2 != 0 && inversionCount % 2 != 0) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  } else if ((positionOfSwapper / 4) % 2 == 0 && inversionCount % 2 == 0) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  } else {
    return new Promise((resolve, reject) => {
      reject("Unsolvable");
    });
  }
}

// Handle Time
let timeHanddlerHelper;

//  function to support Timer Function
function supportHandleTimer(exactTime) {
  if (exactTime < 60) {
    document.querySelector("#timer").textContent = `0:${exactTime}`;
    localStorage.setItem(
      "currentTime",
      document.querySelector("#timer").textContent
    );
  } else {
    let minutes = Math.floor(exactTime / 60);
    let seconds = exactTime - 60 * minutes;
    document.querySelector("#timer").textContent = `${minutes}:${seconds}`;
    localStorage.setItem(
      "currentTime",
      document.querySelector("#timer").textContent
    );
  }
}

//  function to handle the timer for different scenarios
function handleTimer(operation) {
  if (operation.command == "Start" && !localStorage.getItem("currentTime")) {
    let currentTime = new Date().getMinutes() * 60 + new Date().getSeconds();
    timeHanddlerHelper = setInterval(() => {
      let newDate = new Date();

      let newTime = newDate.getMinutes() * 60 + newDate.getSeconds();

      let exactTime = newTime - currentTime;
      supportHandleTimer(exactTime);
    }, 1000);
  } else if (operation.command == "Stop") {
    clearInterval(timeHanddlerHelper);
    document.querySelector("#timer").textContent = "0:0";
    localStorage.setItem(
      "currentTime",
      document.querySelector("#timer").textContent
    );
  } else if (operation.command == "Pause") {
    clearInterval(timeHanddlerHelper);
  } else {
    let currentTime = getCurrentTime();
    supportHandleTimer(currentTime);
    currentTime++;

    timeHanddlerHelper = setInterval(() => {
      supportHandleTimer(currentTime);
      currentTime++;
    }, 1000);
  }
}

// Function to search for the position of swapper
function searchForSwapper(position) {
  if (document.querySelector(`#board_row_${position}`).textContent == " ") {
    increaseStepCounter();
    return true;
  }
}

// Function to swap the blocks
function Swapper(positionOfSwapper, myPosition) {
  let value = document.querySelector(`#board_row_${myPosition}`).textContent;
  document.querySelector(`#board_row_${myPosition}`).textContent = " ";

  document.querySelector(`#board_row_${positionOfSwapper}`).textContent = value;

  if (positionOfSwapper == value) {
    status_map.set(positionOfSwapper, { status: true });
    change_background(status_map, myPosition);
  } else {
    status_map.set(myPosition, { status: false });
    change_background(status_map, myPosition);
  }
}

// Function to check the position of the swapper around the clicked block
function checkForSwapper(myLeft, myRight, myTop, myBottom, myPosition) {
  if (myPosition % 4 == 0) {
    myRight = -1;
  }
  if ((myPosition - 1) % 4 == 0) {
    myLeft = -1;
  }

  if (myLeft > 0) {
    if (searchForSwapper(myLeft)) {
      Swapper(myLeft, myPosition);
      return;
    }
  }
  if (myRight < 17 && myRight > 0) {
    if (searchForSwapper(myRight)) {
      Swapper(myRight, myPosition);

      return;
    }
  }
  if (myTop > 0) {
    if (searchForSwapper(myTop)) {
      Swapper(myTop, myPosition);
      return;
    }
  }
  if (myBottom < 17) {
    if (searchForSwapper(myBottom)) {
      Swapper(myBottom, myPosition);
      return;
    }
  }
}

// Function to create an array of the current positions of the blocks
async function createArray() {
  let array = [];
  for (let i = 0; i < 16; i++) {
    if (document.querySelector(`#board_row_${i + 1}`).textContent == " ") {
      array.push(null);
    } else {
      array.push(
        Number(document.querySelector(`#board_row_${i + 1}`).textContent)
      );
    }
  }
  return array;
}

// Function to handle the event when a blockm is clicked
async function clickedBlock(id) {
  if (document.querySelector(`#board_row_${id}`).textContent == " ") {
    return;
  }
  id = Number(id);
  let myPosition = id;
  let myLeft = id - 1; // search the position of the swapper on left of the clicked block
  let myRight = id + 1; // search the position of the swapper on right of the clicked block
  let myTop = id - 4; // search the position of the swapper on top of the clicked block
  let myBottom = id + 4; // search the position of the swapper on bottom of the clicked block

  checkForSwapper(myLeft, myRight, myTop, myBottom, myPosition);
  document.querySelector("#movesCounter").textContent = stepsCounter;
  localStorage.setItem(
    "currentMoves",
    document.querySelector("#movesCounter").textContent
  );
  let currentPositionArray = await createArray();
  localStorage.setItem("currentPositions", currentPositionArray); // update the currentPositions in localStorage

  // Fetch all the Blocks and their position status and fill them in an array
  let result = Array.from(status_map.values());
  for (let i = 0; i < result.length; i++) {
    result[i] = result[i].status;
  }

  const counts = {}; // array filled with status of all the blocks
  result.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });

  // if there is only one false count in the array that means the game is over
  if (counts.false == 1) {
    let timeConsumed = document.querySelector("#timer").textContent.split(":");
    let minutes = Number(timeConsumed[0]);
    let seconds = Number(timeConsumed[1]);
    let timeResultToBeShown;
    if (!minutes) {
      timeResultToBeShown = `${seconds} Seconds`;
    } else if (!seconds) {
      timeResultToBeShown = `${minutes} Minutes`;
    } else {
      timeResultToBeShown = `${minutes} Minute and ${seconds} Seconds`;
    }
    setTimeout(() => {
      alert(
        `Congratulations you solved the puzzle in ${stepsCounter
        } steps in ${timeResultToBeShown}`
      );
      handleWindowLoader({ command: "Reset" });
    }, 500)

  }
}

// Handle boardCover click event
document.querySelector("#boardCover").addEventListener("click", function () {
  document.querySelector("#boardCover").style.display = "none";
  document.querySelector("#toggleActivity").value = "Pause";
  document.querySelector("#toggleActivity").title = "Pause Game"
  document.querySelector("#toggleActivity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/>
</svg>`

  handleTimer({ command: "Start" });
});

// Handle resume and pause activities
document
  .querySelector("#toggleActivity")
  .addEventListener("click", function () {
    if (document.querySelector("#toggleActivity").value == "Start") {
      document.querySelector("#toggleActivity").value = "Pause";
      document.querySelector("#toggleActivity").title = "Pause Game"
      document.querySelector("#toggleActivity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/>
</svg>`
      document.querySelector("#boardCover").style.display = "none";

      handleTimer({ command: "Start" });
    } else if (
      document.querySelector("#toggleActivity").value == "Pause"
    ) {
      document.querySelector("#boardCover").style.display = "flex";
      handleTimer({ command: "Pause" });
      document.querySelector("#boardCover").textContent = "Paused";
      document.querySelector("#toggleActivity").value = "Resume";
      document.querySelector("#toggleActivity").title = "Resume Game"
      document.querySelector("#toggleActivity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
</svg>`

    } else {
      document.querySelector("#toggleActivity").value = "Pause";
      document.querySelector("#toggleActivity").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/>
</svg>`
      document.querySelector("#toggleActivity").title = "Pause Game"
      document.querySelector("#boardCover").style.display = "none";
      handleTimer({ command: "Resume" });
    }
  });
