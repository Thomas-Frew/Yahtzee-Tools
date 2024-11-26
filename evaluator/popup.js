const thresholds = [5, 10, 20, 50, 100]

/**
 * Take the ratio between two Yahtzee scores.
 */
function getScoreRatio(diff) {
    return 0.5 + diff / 20
}

function getPositionPhrase(scores, names) {
    scoreDiff = scores[0] - scores[1]

    // Check for draws
    if (Math.abs(scoreDiff) <= thresholds[0]) {
        return "The position is drawn."
    }

    // Get the phrase for score difference
    diffPhrase = ""
    if (Math.abs(scoreDiff) <= thresholds[1]) {
        diffPhrase = "barely winning"
    } else if (Math.abs(scoreDiff) <= thresholds[2]) {
        diffPhrase = "slightly winning"
    } else if (Math.abs(scoreDiff) <= thresholds[3]) {
        diffPhrase = "winning"
    } else if (Math.abs(scoreDiff) <= thresholds[4]) {
        diffPhrase = "clearly winning"
    } else {
        diffPhrase = "dominating"
    }

    winningPlayer = scoreDiff >= 0 ? names[0] : names[1]
    return winningPlayer + " is " + diffPhrase + "."

}

function createWindowedPopup() {
    chrome.windows.create({
        url: 'window.html',
        type: 'popup',
        width: 100,
        height: 800
    })
}

// Request an evaluation
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var activeTab = tabs[0]
    chrome.tabs.sendMessage(activeTab.id, { type: "evaluationRequest" })
});

// Listen out for more evaluations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "evaluations") {
        evaluations = message.data
        names = message.names

        let diff = ((evaluations[0] - evaluations[1]) / 10).toFixed(2);
        let ratio = getScoreRatio(diff)
        transformLevels(ratio)

        document.getElementById("white-level-text").innerText = evaluations[0]
        document.getElementById("black-level-text").innerText = evaluations[1]

        document.getElementById("diff").innerText = diff
        document.getElementById("header").innerText = getPositionPhrase(evaluations, names)
    }
});

// Initialise popup elements
document.getElementById('floatButton').addEventListener('click', createWindowedPopup)