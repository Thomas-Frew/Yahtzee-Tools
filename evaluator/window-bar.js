const barHeight = 500

function transformLevels(ratio) {
    whiteWidth = ratio * barHeight
    blackWidth = (1 - ratio) * barHeight

    document.getElementById("black-level-bar").style.height = blackWidth + "px"
    document.getElementById("white-level-bar").style.height = whiteWidth + "px"
}