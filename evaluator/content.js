// Constants
const tableSelector = "#scorecard"
const messageSelector = "#messageBox"
const totalSelector = "#total-score"

// Do an initial evaluation
let lastEvaluations = [0, 0]
let playerNames = ["Player 1", "Player 2"]

/**
 * Update the players' scorecards
 */
function getScorecards(table) {
    const tableRows = table.querySelectorAll('tr')
    let scorecards = [[], []]

    nameRow = tableRows[0]
    playerNames = [nameRow.cells[1].textContent.trim(), nameRow.cells[2].textContent.trim()]

    tableRows.forEach((tableRow, _) => {
        const cells = tableRow.querySelectorAll('th, td')
        if (cells.length >= 3) {
            scorecards[0].push(tableRow.cells[1].textContent.trim())
            scorecards[1].push(tableRow.cells[2].textContent.trim())
        }
    })

    console.log("Got scorecards ", scorecards)
    return scorecards
}

function sendEvaluations(data, names) {
    chrome.runtime.sendMessage({ type: "evaluations", data: data, names: names });
    console.log("Sending evaluations: ", lastEvaluations)
}

/**
 * Send a request to the AI server to evaulate the game position.
 */
function requestEvaluation(scorecards) {
    fetch('http://localhost:2763', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scorecards)
    })
        .then(response => response.json())
        .then(data => {
            lastEvaluations = data.evaluations
            sendEvaluations(lastEvaluations, playerNames)
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function evaluate() {
    let tableNode = document.querySelector(tableSelector)
    scorecards = getScorecards(tableNode)
    requestEvaluation(scorecards)
}

/**
 * A callback that triggers an evaluation.
 */
function evaluationCallback(mutationsList) {
    for (const mutation of mutationsList) {
        let messageNode = document.querySelector(messageSelector)
        const paragraphs = messageNode.querySelectorAll('p')
        paragraphs.forEach(pElement => {
            if (pElement.textContent == "") {
                evaluate()
            }
        })
    }
}

/**
 * Attach to all elements from some selector, triggering some callback.
 */
function observeTarget(selector, callback) {
    let targetNode = document.querySelector(selector)

    if (targetNode) {
        console.log("Target element found:", targetNode)

        const observer = new MutationObserver(callback)

        const config = {
            attributes: true,
            childList: true,
            subtree: true
        }

        observer.observe(targetNode, config)
        console.log("Started observing:", selector)
    } else {
        console.warn("Target element not found. Watching for DOM changes...")
        waitForTarget(selector)
    }
}

// Hook onto the scoreboard for regular requests
observeTarget(messageSelector, evaluationCallback)

// Do a evaluation to begin
evaluate()

// Listen out for evaluation requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "evaluationRequest") {
        sendEvaluations(lastEvaluations, playerNames)
    }
});