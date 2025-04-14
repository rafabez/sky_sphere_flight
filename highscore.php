<?php
$highScoreFile = 'highscores.json';
$maxScores = 5;

// Function to read high scores from JSON file
function getHighScores($file, $max) {
    if (file_exists($file)) {
        $json = file_get_contents($file);
        $scores = json_decode($json, true);
        // Ensure it's an array and limit to max scores
        if (is_array($scores)) {
            usort($scores, function($a, $b) {
                // Sort primarily by time (ascending), then score (descending)
                if ($a['time'] == $b['time']) {
                     return $b['score'] <=> $a['score']; // Descending score for tie-break
                }
                return $a['time'] <=> $b['time']; // Ascending time
            });
            return array_slice($scores, 0, $max);
        }
    }
    return []; // Return empty array if file doesn't exist or is invalid
}

// Function to save high scores to JSON file
function saveHighScores($file, $scores) {
    $json = json_encode($scores, JSON_PRETTY_PRINT);
    file_put_contents($file, $json);
}

// Handle POST request (saving new high score)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get data from POST body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (isset($data['name'], $data['score'], $data['time'])) {
        $name = htmlspecialchars($data['name']); // Sanitize input
        $score = intval($data['score']); // Ensure integer
        $time = floatval($data['time']); // Ensure float

        // Load existing high scores
        $highScores = getHighScores($highScoreFile, 100); // Load more than needed temporarily
        // Add the new score
        $highScores[] = ['name' => $name, 'score' => $score, 'time' => $time];

        // Sort and save the updated high scores
        $highScores = getHighScores($highScoreFile, $maxScores); // Re-sort and limit
        saveHighScores($highScoreFile, $highScores);
    } else {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid data received']);
        exit;
    }
}

// Handle GET request (reading high scores)
// Always return the high scores
$highScores = getHighScores($highScoreFile, $maxScores);
header('Content-Type: application/json');
echo json_encode($highScores);
?>
