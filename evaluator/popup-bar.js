const barWidth = 500

function transformLevels(ratio) {
    whiteWidth = ratio * barWidth
    blackWidth = (1 - ratio) * barWidth

    document.getElementById("white-level-bar").style.width = whiteWidth + "px"
    document.getElementById("black-level-bar").style.width = blackWidth + "px"
}
