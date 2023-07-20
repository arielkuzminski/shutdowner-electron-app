window.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const electron = require('electron');
    const {ipcRenderer} = electron;

    let myInterval;

    let toGo;
    let isPause = false;
    let secondsAtStart;

    const timeLeft = document.getElementById('time-left');
    const progressElement = document.getElementById('progress');
    const timeValueInputElement = document.getElementById('timeValueInput');

    const pauseButton = document.getElementById('pause');
    const startButton = document.getElementById('start');
    const abortButton = document.getElementById('abort');
    
    timeLeft.style.visibility = 'hidden';
    progressElement.style.visibility = 'hidden';
    
    timeValueInputElement.addEventListener('input', () => {
    const startButton = document.getElementById('start');
        if (timeValueInputElement.value > 0) {
            startButton.disabled = false;
        } else {
            startButton.disabled = true;
        }
    });
    
    const startCountdown = (secondsOrHours, timeValueInput) => {
        clearInterval(myInterval);
        let currentSecondsLeft;
        if (isPause) {
            currentSecondsLeft = toGo;
            isPause = false;
            pauseButton.innerText = 'Pause';
        } else {
            if (secondsOrHours === 'minutes') {
                currentSecondsLeft = timeValueInput * 60;
            } else {
                currentSecondsLeft = timeValueInput;
            }
            secondsAtStart = currentSecondsLeft;
        }
        pauseButton.disabled = false;
        abortButton.disabled = false;
        startButton.disabled = true;
        timeLeft.style.visibility = 'visible';
        progressElement.style.visibility = 'visible';
        updateTimer(currentSecondsLeft, secondsAtStart);
        myInterval = setInterval(() => {
            if (currentSecondsLeft === 0) {
                updateTimer(currentSecondsLeft, secondsAtStart);
                clearInterval(myInterval);
                sendEvent();
            } else {
                currentSecondsLeft--;
                updateTimer(currentSecondsLeft, secondsAtStart);
            }
        }, 1000);
    };

    const abortCountdown = () => {
        clearInterval(myInterval);
    }

    const updateTimer = (currentSecondsLeft, secondsAtStart) => {
        const spanMinutes = document.getElementById('countdownMinutes');
        const spanSeconds = document.getElementById('countdownSeconds');
        const progress = document.getElementById('progress');
        const minutes = Math.floor(currentSecondsLeft / 60);
        const seconds = (currentSecondsLeft % 60);
        toGo = currentSecondsLeft;
        spanMinutes.innerHTML = minutes;
        spanSeconds.innerHTML = seconds;
        const percent = Math.floor(currentSecondsLeft / secondsAtStart * 100);
        progress.value = percent;
    }

    const sendEvent = () => {
        ipcRenderer.send('start');
    }

    startButton.addEventListener('click', (e) => {
        e.preventDefault();
        const secondsOrHours = document.getElementById('timeSelect').value;
        const timeValueInput = document.getElementById('timeValueInput').value;
        startCountdown(secondsOrHours, timeValueInput);
    });

    abortButton.addEventListener('click', (e) => {
        e.preventDefault();
        abortCountdown();
        isPause = false;
        pauseButton.innerText = 'Pause';
        pauseButton.disabled = true;
        startButton.disabled = false;
        timeLeft.style.visibility = 'hidden';
        progressElement.style.visibility = 'hidden';
    });

    pauseButton.addEventListener('click', () => {
        if (isPause) {
            startCountdown();
        } else {
            abortCountdown();
            isPause = true;
            pauseButton.innerText = 'Continue';
        }
    });
  })