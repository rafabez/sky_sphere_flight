import * as THREE from 'https://unpkg.com/three@0.122.0/build/three.module.js';
import { FlyControls } from './FlyControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 50, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 50;
controls.rollSpeed = Math.PI / 24;
controls.autoForward = false;
controls.dragToLook = true;

const clock = new THREE.Clock();
let gameTime = 0;
let score = 0;
let currentRingIndex = 0;
const rings = [];
const ringPositions = [
    new THREE.Vector3(0, 50, 0),
    new THREE.Vector3(100, 70, -50),
    new THREE.Vector3(50, 90, -150),
    new THREE.Vector3(-80, 60, -100),
    new THREE.Vector3(-120, 40, 50),
    new THREE.Vector3(0, 20, 150) // Back near start
];
const ringRadius = 15;
const ringTubeRadius = 1;
const ringColor = 0xaaaaaa; // Grey
const targetRingColor = 0x00ff00; // Green
const passedRingColor = 0x0000ff; // Blue

const scoreElement = document.getElementById('score');
const nextRingElement = document.getElementById('nextRing');
const timerElement = document.getElementById('timer');

// Game State
let gameFinished = false;
let finalTime = 0;

// Arrow Helper for navigation aid
let arrowHelper;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const loader = new THREE.TextureLoader();

loader.load('./terrainTexture.jpg', function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    const terrainMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const terrainGeometry = new THREE.SphereGeometry(50, 32, 32);
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    // Make the central sphere smaller or remove it if it obstructs the course
    terrainGeometry.scale(0.1, 0.1, 0.1); // Make it much smaller
    terrain.position.y = -10; // Move it down
    scene.add(terrain);
});

// Create Rings
function createRings() {
    const ringGeometry = new THREE.TorusGeometry(ringRadius, ringTubeRadius, 16, 100);
    for (let i = 0; i < ringPositions.length; i++) {
        const ringMaterial = new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, wireframe: true });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(ringPositions[i]);
        // Orient rings - basic orientation, could be randomized
        if (i > 0) {
            ring.lookAt(ringPositions[i-1]);
        } else {
             ring.lookAt(camera.position); // Look towards start
        }
        ring.userData.index = i; // Store index
        rings.push(ring);
        scene.add(ring);
    }
    // Highlight the first ring
    if (rings.length > 0) {
        rings[currentRingIndex].material.color.setHex(targetRingColor);
        rings[currentRingIndex].material.wireframe = false; // Make target solid
    }
}
createRings();

// Initialize Arrow Helper
function createArrowHelper() {
    const dir = new THREE.Vector3(1, 0, 0); // Initial direction
    const origin = new THREE.Vector3(0, 0, 0); // Will be updated relative to camera
    const length = 10; // Length of the arrow
    const hex = 0xffff00; // Yellow color
    arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    scene.add(arrowHelper); // Add to scene initially, will be positioned relative to camera later
}
createArrowHelper();

loader.load('./backgroundTexture.jpg', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const backgroundGeometry = new THREE.SphereGeometry(1500, 60, 40); // Increased segments for smoother background
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(background);
});

window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

const maxCameraDistance = 500; // Adjust this value as needed

// Mobile touch control variables
let touchStartX = 0;
let touchStartY = 0;
let cameraRotationX = 0;
let cameraRotationY = 0;
let pinchStartDistance = 0;

// Set up event listeners for touch controls
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        // Pan and tilt
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
    if (event.touches.length === 2) {
        // Pinch to zoom
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        pinchStartDistance = Math.sqrt(dx * dx + dy * dy);
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 1) {
        // Pan and tilt
        const deltaX = event.touches[0].clientX - touchStartX;
        const deltaY = event.touches[0].clientY - touchStartY;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;

        const rotationFactor = 0.005;

        cameraRotationY -= deltaX * rotationFactor;
        cameraRotationX -= deltaY * rotationFactor;

        // Limit camera rotation vertically
        cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));

        camera.rotation.x = cameraRotationX;
        camera.rotation.y = cameraRotationY;
    } // End if touches.length === 1
    if (event.touches.length === 2) {
        // Pinch to zoom
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        const pinchCurrentDistance = Math.sqrt(dx * dx + dy * dy);

        const deltaDistance = pinchCurrentDistance - pinchStartDistance;
        const zoomSpeed = 0.1;

        camera.fov += deltaDistance * zoomSpeed;
        camera.fov = Math.max(10, Math.min(100, camera.fov)); // Limit FOV
        camera.updateProjectionMatrix();

        pinchStartDistance = pinchCurrentDistance;

        // Update camera position based on zoom - Note: This might conflict with FlyControls zoom/movement. Consider removing if issues arise.
        // const zoomFactor = Math.tan(THREE.Math.degToRad(camera.fov) / 2);
        // const distance = (window.innerHeight / 2) / zoomFactor;
        // camera.position.set(0, 0, distance); // Commenting out direct position set as FlyControls handles movement.
    }
} // End handleTouchMove

function handleTouchEnd(event) {
    // Reset pinch start distance when fingers are lifted
    pinchStartDistance = 0;
} // End handleTouchEnd

function checkRingCollision() {
    if (currentRingIndex >= rings.length) return; // Game finished

    const targetRing = rings[currentRingIndex];
    const distanceToRing = camera.position.distanceTo(targetRing.position);

    // Simple collision check: within radius + buffer
    if (distanceToRing < ringRadius + 2) { // Added buffer of 2
        score += 100; // Award points
        scoreElement.textContent = score;

        // Update ring appearance
        targetRing.material.color.setHex(passedRingColor);
        targetRing.material.wireframe = true; // Make passed wireframe again

        currentRingIndex++;

        if (currentRingIndex < rings.length) {
            // Highlight next ring
            rings[currentRingIndex].material.color.setHex(targetRingColor);
            rings[currentRingIndex].material.wireframe = false;
            nextRingElement.textContent = currentRingIndex + 1;
        } else {
            // Game finished
            gameFinished = true;
            finalTime = gameTime;
            nextRingElement.textContent = "Finished!";
            timerElement.textContent = finalTime.toFixed(2); // Display final time immediately
            controls.enabled = false; // Disable controls
            showFinishScreen();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!gameFinished) {
        const delta = clock.getDelta();
        gameTime += delta;
        timerElement.textContent = gameTime.toFixed(2); // Update timer only if game is running
        controls.update(delta); // Update camera position/rotation based on controls
        checkRingCollision(); // Check if player passed through the target ring
    } else {
         // Optional: Add any post-game animation or idle behavior here
    }

    // Update Arrow Helper (only if game not finished)
    if (arrowHelper && !gameFinished && currentRingIndex < rings.length) {
        const targetRing = rings[currentRingIndex];
        const direction = new THREE.Vector3().subVectors(targetRing.position, camera.position).normalize();
        arrowHelper.setDirection(direction);

        // Position arrow slightly in front of the camera
        const arrowPosition = new THREE.Vector3();
        camera.getWorldPosition(arrowPosition); // Get camera's world position
        const offset = direction.clone().multiplyScalar(20); // Offset distance in front of camera
        arrowPosition.add(offset);
        arrowHelper.position.copy(arrowPosition);

        arrowHelper.visible = true;
    } else if (arrowHelper) {
        arrowHelper.visible = false; // Hide arrow when game is finished or no target
    }

    renderer.render(scene, camera);

    // Limit how far the camera can move away from the center (optional, keep if desired)
    // if (camera.position.length() > maxCameraDistance) {
    //     camera.position.setLength(maxCameraDistance);
    // }
}

animate();

// Modal Logic
const modal = document.getElementById('instructionsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const startGameBtn = document.getElementById('startGameBtn'); // Get the new button

function closeModal() {
    modal.style.display = 'none';
    // Optional: Resume game if paused, e.g., restart clock or enable controls fully
}

closeModalBtn.addEventListener('click', closeModal);
startGameBtn.addEventListener('click', closeModal); // Add listener to the new button

// Close modal with Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display !== 'none') {
        closeModal();
    }
});

// Initially show the modal (already displayed by default CSS)
// modal.style.display = 'flex';

// --- High Score Logic ---
const finishModal = document.getElementById('finishModal');
const finalScoreElement = document.getElementById('finalScore');
const finalTimeElement = document.getElementById('finalTime');
const highScoresListElement = document.getElementById('highScoresList');
const highScoreUrl = 'highscore.php'; // Path to your PHP script
const highScoreEntryDiv = document.getElementById('highScoreEntry');
const playerNameInput = document.getElementById('playerNameInput');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const highScoreDisplayDiv = document.getElementById('highScoreDisplay');


 async function fetchHighScores() {
     try {
         const response = await fetch(highScoreUrl);
         if (!response.ok) {
             // Try to get more specific error message from the server response body
             let errorText = response.statusText; // Default to status text
             try {
                 errorText = await response.text(); // Attempt to read response body
             } catch (textError) {
                 // Ignore error if reading text fails, stick with statusText
             }
             throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
         }
         const scores = await response.json();
         displayHighScores(scores);
     } catch (error) {
         console.error("Could not fetch high scores:", error.message); // Log the detailed error
         highScoresListElement.innerHTML = '<li>Error loading scores. Check console for details.</li>';
     }
  }

 // Function to actually send the score to the server
 async function submitScoreToServer(playerName, playerScore, playerTime) {
    try {
        const response = await fetch(highScoreUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName, score: playerScore, time: playerTime }),
        });
        if (!response.ok) {
             // Try to get more specific error message from the server response body
             let errorText = response.statusText; // Default to status text
             try {
                 errorText = await response.text(); // Attempt to read response body
             } catch (textError) {
                 // Ignore error if reading text fails, stick with statusText
             }
             throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
         }
          // After saving successfully, fetch the updated list
          await fetchHighScores();
      } catch (error) {
          console.error("Could not save high score:", error.message); // Log the detailed error
          // Even if saving fails, try to fetch existing scores
          await fetchHighScores();
         // Optionally inform the user score wasn't saved
    } finally {
        // Show the high score list and restart button regardless of save success/failure
        highScoreEntryDiv.style.display = 'none';
        highScoreDisplayDiv.style.display = 'block';
    }
 }

function displayHighScores(scores) {
    highScoresListElement.innerHTML = ''; // Clear previous list
    if (scores && scores.length > 0) {
         scores.forEach((entry, index) => {
             const li = document.createElement('li');
             // Display time prominently, then name. Score is less relevant if always the same.
             li.textContent = `${index + 1}. ${entry.time.toFixed(2)}s - ${entry.name}`; // (Score: ${entry.score}) - Can add score back if needed
             highScoresListElement.appendChild(li);
         });
    } else {
        highScoresListElement.innerHTML = '<li>No high scores yet!</li>';
    }
}

 function showFinishScreen() {
     finalScoreElement.textContent = score;
     finalTimeElement.textContent = finalTime.toFixed(2);
     playerNameInput.value = ''; // Clear previous name entry
     highScoreEntryDiv.style.display = 'block'; // Show name entry
     highScoreDisplayDiv.style.display = 'none'; // Hide score list initially
     finishModal.style.display = 'flex'; // Show the finish modal

     // We no longer call saveHighScore directly here.
     // It will be called when the submit button is clicked.
 }

 // Add event listener for the submit score button
 submitScoreBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim() || "Pilot"; // Get name or default
    // Disable button to prevent multiple submissions? Optional.
    // submitScoreBtn.disabled = true;
    submitScoreToServer(playerName, score, finalTime); // Call the function to save and fetch
 });

 // Restart Game button logic
 const restartGameBtn = document.getElementById('restartGameBtn');
 if (restartGameBtn) {
     restartGameBtn.addEventListener('click', () => {
         window.location.reload(); // Simple way to restart
     });
 }
