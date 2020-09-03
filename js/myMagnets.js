
function createMagnet(content) {
    let o = document.createElement("div");
    o.innerHTML = content;
    return o;
}

function createMagnetRainbow(content) {
    let o = createMagnet(content);
    let colors = ['rgb(139, 97, 195)', 'rgb(115, 97, 195)', 'rgb(93, 105, 214)', 'rgb(40, 167, 226)', 'rgb(40, 204, 226)', 'rgb(40, 226, 201)', 'rgb(40, 226, 148)',
        'rgb(40, 226, 102)', 'rgb(130, 226, 40)', 'rgb(170, 226, 40)', 'rgb(223, 226, 40)', 'rgb(226, 183, 40)',
        'rgb(226, 152, 40)', 'rgb(226, 124, 40)', 'rgb(226, 77, 40)', 'rgb(255, 0, 0)', 'rgb(144, 24, 24)'];
    o.style.backgroundColor = colors[content - 1];
    return o;
}


function createMagnetGS_B(content) {
    let o = document.createElement("div");
    o.innerHTML = content;
    o.classList.add("GS_B")
    return o;
}
function magnetGS() {
    clearMagnet();
    addMagnet(createMagnet(1))
    addMagnet(createMagnet(2))
    addMagnet(createMagnet(3))
    addMagnet(createMagnetGS_B(1))
    addMagnet(createMagnetGS_B(2))
    addMagnet(createMagnetGS_B(3))

}

function magnetSorting() {
    MagnetManager.clearMagnet();
    for (let i = 1; i <= 17; i++)
        MagnetManager.addMagnet(createMagnetRainbow(i))
}


function magnetBTrees() {
    MagnetManager.clearMagnet();
    for (let i = 1; i <= 17; i++)
        MagnetManager.addMagnet(createMagnetRainbow(i))

    for (let i = 1; i <= 7; i++)
        MagnetManager.addMagnetImage("Btreenode.png");


}

function magnetGraphNodes() {
    MagnetManager.clearMagnet();
    for (let i of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'])
        MagnetManager.addMagnet(createMagnet(i))
}

function loadMagnets() {
    document.getElementById("magnetSorting").onclick = magnetSorting;
    document.getElementById("magnetBTrees").onclick = magnetBTrees;
    document.getElementById("magnetGraphNodes").onclick = magnetGraphNodes;
    document.getElementById("magnetGS").onclick = magnetGS;
}




