console.log("Content script loaded. Downloading games...")

// Running game history
let checkpointHistory = []

// Constants
const storageKey = "yahtzeeCheckpoints"
const downloadFilename = "yahtzeeCheckpoints"

const tableSelector = "#scorecard"
const messageSelector = "#messageBox"
const totalSelector = "#total-score"

chrome.storage.local.get([storageKey], (result) => {
    console.log("Existing checkpoint histories: ", result[storageKey])
})
/**
 * Append some data to some array in Chrome's storage. 
 */
function appendToStorageArray(key, array) {
    chrome.storage.local.get([key], (result) => {
        let existingArray = result[key] || []

        existingArray = existingArray.concat(array)

        chrome.storage.local.set({ [key]: existingArray }, () => {
            console.log("Array updated successfully:", existingArray)
        })
    })
}

/**
 * Log a snapshot of the scorecard.
 */
function logCheckpoint(table) {
    const tableRows = table.querySelectorAll('tr')
    let checkpoint = []

    tableRows.forEach((tableRow, _) => {
        const cells = tableRow.querySelectorAll('th, td')
        if (cells.length >= 3) {
            checkpoint.push(tableRow.cells[2].textContent.trim())
        }
    })

    if (JSON.stringify(checkpoint) == JSON.stringify(checkpointHistory[checkpointHistory.length - 1])) return;

    checkpointHistory.push(checkpoint)
    console.log("Logged checkpoint ", checkpoint)
}

/**
 * Download all snapshots saved by this extension.
 */
function downloadCheckpointHistories() {
    chrome.storage.local.get([storageKey], (result) => {
        let histories = result[storageKey]

        console.log(result[storageKey])
        csvHistories = histories.map(row => row.join(',')).join('\n');

        const blob = new Blob([csvHistories], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = downloadFilename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}

/**
 * A callback that triggers a whole-game commit.
 */
function saveCallback() {
    if (checkpointHistory.length > 0) {
        let totalNode = document.querySelector(totalSelector)
        const finalScore = totalNode.cells[2].textContent.trim()

        checkpointHistory.forEach((dataRow, rowIdx) => {
            let newRow = dataRow
            newRow[16] = finalScore
            checkpointHistory[rowIdx] = newRow
        })

        console.log("This game's checkpoint history: ", checkpointHistory)
        appendToStorageArray(storageKey, checkpointHistory)

        chrome.storage.local.get([storageKey], (result) => {
            console.log("Overall checkpoint history: ", result[storageKey])
        })

        downloadCheckpointHistories()
        checkpointHistory = []
    }
}

/**
 * A callback that triggers a checkpoint log.
 */
function checkpointCallback(mutationsList) {
    for (const mutation of mutationsList) {
        let messageNode = document.querySelector(messageSelector)
        const paragraphs = messageNode.querySelectorAll('p')
        paragraphs.forEach(pElement => {
            if (pElement.textContent == "") {
                let tableNode = document.querySelector(tableSelector)
                logCheckpoint(tableNode)
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

observeTarget(messageSelector, checkpointCallback)
observeTarget(totalSelector, saveCallback)