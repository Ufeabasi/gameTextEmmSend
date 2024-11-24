const imageSets = {
    level1: ['img-1.png', 'img-3.png', 'img-6.png'],
   
    level2: ['brazil.png', 'caribbean.png', 'congo.png', 'cro.png', 'nigeria.png', 'norway.png'],
    level3: ['french-fries.png', 'groceries.png', 'masala-dosa.png', 'ramen.png', 'juice.png', 'avocado.png', 'berries.png', 'burger.png', 'chicken.png', 'snack.png'],
};

const gridColumns = {
   level1: 3,
   level2: 4,
   level3: 5,
};

const coverImages = {
   level1: '',
   level2: 'cover2.png',
   level3: 'cover3.png'
};

const levelScoreThresholds = {
   level1: 100,
   level2: 250,
   level3: 400
};

let countdown;
let timeLeft = 10;
let attempts = 6;
let totalScore = 0;
let currentScore = 0
let level = 'level1';
let flippedCards = [];
let matchedPairs = 0;
let flippingDisabled = false;
let gameStarted = false;

let adAttempts = 6; //ADS WATCHED TO GET ATTEMPT
let maxAdLives = 6; // MAX ADS THE PLAYER CAN WATCH TO GAIN ATTEMPT
let adsLeft = 5; // FOR THE X2SCORE 

let stars = 80000;
let canWatchAd = true;

let roundComplete = false; // TRACK ROUND COMPLETION

let shuffleBonusCount = 3;

let timerPaused = false; // Tracks if the timer is currently paused
let flipBonus = 3;
let timeFreezer = 3;

let isFreezerCliked = true;

const countDownTimer = document.getElementById('timer');
const attemptLeft = document.getElementById('attempts');
const watchAdButton = document.getElementById('watchAdButton');
const remainingStars = document.getElementById('stars');
const displayFreezerAmount = document.getElementById('time-freezer-count');
const freezerButton = document.getElementById("freezer-btn");
const mainScore = document.getElementById('score');
const buyFreezerBtn = document.getElementById('buy-freezer');
const attemptExhaustedSlidMenu= document.getElementById('attemptExhaustedMenu');


//CONTROLS ALL THE MENU SLIDES UP AND MENU
const winMenuScore = document.getElementById('current-score');
const closeMenuIconFail = document.getElementById('closeMenuIconFail');
const closeMenuIconWin = document.getElementById('closeMenuIconWin');
const closeAttemptMenuIcon = document.getElementById('closeAttemptMenuIcon');
const failMenu = document.getElementById('failMenu');
const winMenu = document.getElementById('winMenu');
const tryAgainBtn = document.querySelector('.fail-try');
const x2adLeft = document.getElementById('x2adLeft');
const buyAttemptsWithStars = document.getElementById('buyAttWithStarts');
const timeFreezerCount = document.getElementById('timeFreezerCount');

const notificationBar = document.getElementById('notification-bar');
const notificationMessage = document.getElementById('notification-message');
const flipBonusCount = document.getElementById('flipBonusCount');
const shuffleBonusDisplay = document.getElementById('shuffel-bonus-display');

//ALL EVENT LISTINERS
document.getElementById("start-button").addEventListener("click", startGame);

document.getElementById("watchAdButton").addEventListener('click', watchAd);


document.getElementById("buyStarsButton").addEventListener("click", buyStars);

document.getElementById('x2scoreBtn').addEventListener('click', x2scoreAds);
document.getElementById('freezer-btn').addEventListener('click', useTimeFreezer);


document.getElementById("flipBouns").addEventListener("click", flipCardBonus);
document.getElementById("shuffel-bonus").addEventListener("click", shuffleUnopenedCards);

initGame(level);

function initGame(level) {
   const container = document.getElementById("image-container");
   container.innerHTML = "";

   const images = [...imageSets[level], ...imageSets[level]];
   shuffle(images);

   container.style.gridTemplateColumns = `repeat(${gridColumns[level]}, 1fr)`;

   images.forEach((imageSrc) => {
       const card = document.createElement("div");
       card.className = "card";
       card.dataset.image = imageSrc;

       const front = document.createElement("div");
       front.className = "card-front";
       front.style.backgroundImage = `url(images/${imageSrc})`;

       const back = document.createElement("div");
       back.className = "card-back";
       back.style.backgroundImage = coverImages[level];

       card.appendChild(front);
       card.appendChild(back);

       card.addEventListener("click", () => flipCard(card));
       container.appendChild(card);
   });
   
}


function startCountdown() {
    if (countdown) clearInterval(countdown); // Clear any existing timer
    updateTimerDisplay();

    countdown = setInterval(() => {
        if (timerPaused) return; // Skip updates if paused

        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(countdown); // Stop the timer
            timerPaused = false;
            if (currentScore === 0) {
                loseAttempt();
                gameStarted = false;
                failSlideUpMenu();
            } else {
                gameStarted = false;
                winSlideUpMenu();
            }
        }
    }, 1000);
}

function pauseTimerFor3Seconds() {
    if (timerPaused) return; // Prevent multiple pauses
    timerPaused = true; // Set pause flag
    clearInterval(countdown); // Stop the timer

    setTimeout(() => {
        timerPaused = false; // Resume after 3 seconds
        startCountdown(); // Restart the countdown
    }, 3000);
}

function useTimeFreezer() {
    if (timeLeft === 10) {
        showNotification('Start the game to use this feature');
        return;
    }
    if (!isFreezerCliked && timeFreezer > 0) {
        showNotification('Can only use after 3 seconds');
        return;
    }
    if (timeFreezer === 0) {
        showNotification("Use stars to buy more Freezers");
        return;
    }

    pauseTimerFor3Seconds(); // Pause the timer for 3 seconds
    timeFreezer--;
    timeFreezerCount.textContent = timeFreezer;

    setTimeout(() => {
        isFreezerCliked = true;
        showNotification('Freezer enabled');
    }, 3000);
}



function updateTimerDisplay() {
   countDownTimer.textContent = timeLeft;
}

function resetTimer() {
   clearInterval(countdown);
   timerPaused = false; // Reset pause state
   timeLeft = 10;
   updateTimerDisplay
   startCountdown();
}

function stopTimer() {
 clearInterval(countdown);
 countdown = null; // Reset the timer reference
    timerPaused = false;
};

function startGame() {
   if (!gameStarted && attempts > 0 && timeLeft > 0) {
       gameStarted = true;
       flippingDisabled = false;
       initGame(level); 
       flippedCards = [];
       matchedPairs = 0;
       startCountdown();
   } else if (timeLeft <=0 || attempts <= 0) {
        attemptExhustedMenu();
   } 
}

function failSlideUpMenu() {
    document.querySelectorAll('.card.flipped').forEach(card => card.classList.remove('flipped'));
    timeLeft = 10;
    loseAttempt();
    stopTimer();
    failMenu.classList.add("active");

    closeMenuIconFail.addEventListener('click', () => {
        failMenu.classList.remove('active');
        winMenu.classList.remove('active');
    });

    tryAgainBtn.addEventListener('click', () => {
        failMenu.classList.remove('active');
    });
}

function winSlideUpMenu() {
    document.querySelectorAll('.card.flipped').forEach(card => card.classList.remove('flipped'));
    updateScore();
    timeLeft = 10;
    loseAttempt();
    stopTimer();
    winMenu.classList.add("active");

    closeMenuIconWin.addEventListener('click', () => {
        winMenu.classList.remove('active');
        currentScore = 0;
    });
}

function attemptExhustedMenu() {
    attemptExhaustedSlidMenu.classList.add('active');
    
    closeAttemptMenuIcon.addEventListener('click', () => {
        attemptExhaustedSlidMenu.classList.remove('active');
    })
    
}

function endGame() {
   gameStarted = false;
   flippingDisabled = true;
   stopTimer();  
   document.querySelectorAll('.card.flipped').forEach(card => card.classList.remove('flipped'));
   resetTimer();
   showNotification("Game over! You've run out of attempts.");
}

function loseAttempt() {
   attempts--;
   attemptLeft.textContent = attempts;
   if (attempts <= 0) {
        endGame();
   } else {
       resetTimer();
       flippingDisabled = true;
   }
}

function showAdOverlay() {
   document.getElementById("ad-overlay").classList.remove("hidden");
}

function hideAdOverlay() {
   document.getElementById("ad-overlay").classList.add("hidden");
}

function watchAd() {
    if (adAttempts > 0) {
        attempts += maxAdLives;
        maxAdLives = Math.max(adAttempts - 1, 0);
        adAttempts--;
        updateAttemptsDisplay();
        attemptExhaustedSlidMenu.classList.remove('active');
        // showNotification(`You gained ${maxAdLives} attempts! You have ${adAttempts} ad chances left.`);
    } else {
        showNotification("You've used all ads attempts. Use stars to buy attempts.");
        attemptExhustedMenu();
    }
}

function x2scoreAds() {
    if (adsLeft <= 0) {
        showNotification('You have watched all your ads video for the day. check back tomorrow')
    } else {
        adsLeft--;
        x2adLeft.textContent = adsLeft;
        totalScore += currentScore;
        updateScore();
        winMenu.classList.remove('active');
        currentScore = 0;
    }
};

function buyStars() {
    const starCost = 5;
    if (stars >= starCost ) {
        stars -= starCost 
        attempts++;
        updateAttemptsDisplay();
        updateStarsDisplay();
    } else {
        showNotification("Not enough coin to buy stars.");
    }
}

function updateAttemptsDisplay() {
   timeLeft = 10;
   attemptLeft.textContent = attempts;
}

function updateStarsDisplay() {
   remainingStars.textContent = stars;
}

function flipCard(card) {
   if (flippingDisabled || !gameStarted) return;

   if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
       card.classList.add("flipped");
       flippedCards.push(card);

       if (flippedCards.length === 2) {
           checkMatch();
       } else if (flippedCards.length === 3) {
           // Flip back the previous unmatched pair
           const [card1, card2] = flippedCards.splice(0, 2);
           card1.classList.remove("flipped");
           card2.classList.remove("flipped");
       }
   }
}

function checkMatch() {
   const [card1, card2] = flippedCards;
    
   if (card1.dataset.image === card2.dataset.image) {
       card1.classList.add("matched");
       card2.classList.add("matched");
       totalScore += 10;
       currentScore += 10;
       matchedPairs++;
       resetTimer();
       
       if (matchedPairs === imageSets[level].length) {
           shuffleAndContinue();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
        }, 1000);
    }
    
   flippedCards = [];
   flippingDisabled = false;
   updateScore();
}

function shuffleAndContinue() {
   matchedPairs = 0; 
   initGame(level);
}

function checkScoreForLevelUp() {
   if (totalScore >= levelScoreThresholds[level]) {
       levelUp();
   }
}

function levelUp() {
   if (totalScore >= levelScoreThresholds.level1 && totalScore < levelScoreThresholds.level2 && level === 'level1') {
       level = 'level2';
   } else if (totalScore >= levelScoreThresholds.level2 && totalScore < levelScoreThresholds.level3 && level === 'level2') {
       level = 'level3';
   } else if (totalScore >= levelScoreThresholds.level3) {
       showNotification("You've reached the final level!");
    //    endGame();
    //    matchedPairs = 0;
    //    timeLeft = 10;
    //    flippingDisabled = false;
    //    clearInterval(countdown);
    //    resetTimer();
       return;
   }
   initGame(level);
}

function updateScore() {
   mainScore.textContent = totalScore;
   winMenuScore.textContent = currentScore;
   checkScoreForLevelUp();
}

function shuffle(array) {
   array.sort(() => Math.random() - 0.5);
}

function showPoints() {
    const points = document.createElement('div');
    points.classList.add('points');
    points.innerText = '+10';
    points.style.left = `${card.offsetLeft + 50}px`;
    points.style.top = `${card.offsetTop - 30}px`;
    document.body.appendChild(points);
    setTimeout(() => points.remove(), 1500);
}

function flipCardBonus() {
    if (!gameStarted) {
        showNotification("You can't use this feature right now");
        return;
    }
    if (flipBonus <= 0) {
        showNotification("Not enough!")
        return;
    }

   // Get all unmatched cards
   const unmatchedCards = Array.from(document.querySelectorAll(".card:not(.matched):not(.flipped)"));
   if (unmatchedCards.length < 2 ) {
       showNotification("Not enough cards to reveal a match!");
       return;
   }

   // Find pairs of cards
   const pairs = unmatchedCards.reduce((acc, card) => {
       const key = card.dataset.image;
       if (!acc[key]) acc[key] = [];
       acc[key].push(card);
       return acc;
   }, {});

   // Find a pair with at least two cards
   const matchedPairKey = Object.keys(pairs).find(key => pairs[key].length >= 2); 
   if (!matchedPairKey) {
       showNotification("No matching pairs available to reveal!");
       return;
   }
   // Flip two matching cards
   const [card1, card2] = pairs[matchedPairKey];
   card1.classList.add("flipped", "matched");
   card2.classList.add("flipped", "matched");
   // Update score and matched pairs count
   totalScore += 10;
   currentScore += 10;
   matchedPairs++;
   updateScore();
   resetTimer();


   if (matchedPairs === imageSets[level].length) {
       shuffleAndContinue();
    }

   // Decrement the usage count and update button text
   flipBonus--;
   flipBonusCount.textContent = flipBonus;

   if (flipBonus <= 0) {
    showNotification('Flip bonus finished!');
    }
}


function shuffleUnopenedCards() {
   if (shuffleBonusCount > 0) {

        if(!gameStarted) {
            showNotification('Start game to use this feature')
        }

       // Get all cards
       const cards = Array.from(document.querySelectorAll('.card'));

       // Separate unopened cards and already matched cards
       const unopenedCards = cards.filter(card => 
           !card.classList.contains('flipped') && !card.classList.contains('matched')
       );

       // Extract data-image values of unopened cards
       const unopenedImages = unopenedCards.map(card => card.dataset.image);

       // Shuffle the images
       shuffle(unopenedImages);

       // Reassign shuffled images back to unopened cards
       unopenedCards.forEach((card, index) => {
           card.dataset.image = unopenedImages[index];
           card.querySelector('.card-front').style.backgroundImage = `url(images/${unopenedImages[index]})`;
       });

       // Decrement shuffle count
       shuffleBonusCount--;
       shuffleBonusDisplay.textContent = shuffleBonusCount;

       // Update button or notify the user
       if (shuffleBonusCount === 0) {
        disableButton(shuffleUnopenedCards())
        //    document.getElementById('shuffle-button').disabled = true;
           showNotification('No more shuffle attempts left!');
       }
   } else {
       showNotification('You have used all your shuffle attempts!');
   }
}

function showNotification(message, duration = 3000) {
    notificationMessage.textContent = message;
  
    notificationBar.classList.remove('hidden');
    notificationBar.classList.add('visible');
  
    const timeout = setTimeout(() => {
      hideNotification();
    }, 3000);
  
}
  
// Function to hide notification
function hideNotification() {
    const notificationBar = document.getElementById('notification-bar');
    notificationBar.classList.remove('visible');
    notificationBar.classList.add('hidden');
}

function disableButton(button) {
    // Save the original handler in a regular property, not dataset
    button._oldHandler = button.onclick;
    // Remove the click handler
    button.onclick = null;
}

function enableButton(button) {
    // Restore the original click handler if it exists
    if (button._oldHandler) {
        button.onclick = button._oldHandler;
        delete button._oldHandler; // Clean up the temporary property
    }
}

