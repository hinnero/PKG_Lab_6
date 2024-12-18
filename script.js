const canvas = document.getElementById("canvas3D");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

let vertices = [
    { x: 0, y: -50, z: -10 }, { x: 18, y: -50, z: -10 },
    { x: 18, y: 50, z: -10 }, { x: 0, y: 50, z: -10 },
    { x: 0, y: -50, z: 10 }, { x: 18, y: -50, z: 10 },
    { x: 18, y: 50, z: 10 }, { x: 0, y: 50, z: 10 },
    { x: 18, y: 50, z: -10 }, { x: 68, y: 50, z: -10 },
    { x: 68, y: 0, z: -10 }, { x: 18, y: 0, z: -10 },
    { x: 18, y: 50, z: 10 }, { x: 68, y: 50, z: 10 },
    { x: 68, y: 0, z: 10 }, { x: 18, y: 0, z: 10 },
    { x: 28, y: 40, z: -10 }, { x: 58, y: 40, z: -10 },
    { x: 58, y: 10, z: -10 }, { x: 28, y: 10, z: -10 },
    { x: 28, y: 40, z: 10 }, { x: 58, y: 40, z: 10 },
    { x: 58, y: 10, z: 10 }, { x: 28, y: 10, z: 10 },
];

let edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 9], [9, 10], [10, 11], [11, 8], [12, 13], [13, 14], [14, 15], [15, 12], [8, 12], [9, 13], [10, 14], [11, 15],
    [16, 17], [17, 18], [18, 19], [19, 16], [20, 21], [21, 22], [22, 23], [23, 20], [16, 20], [17, 21], [18, 22], [19, 23],
];

let angleX = 0, angleY = 0, angleZ = 0;
let translateX = 0, translateY = 0, translateZ = 0;
let scale = 1;

const camera = { x: 70, y: 50, z: 150 };
const perspective = 500;

document.getElementById("rotateX").oninput = e => { angleX = parseFloat(e.target.value); draw(); };
document.getElementById("rotateY").oninput = e => { angleY = parseFloat(e.target.value); draw(); };
document.getElementById("rotateZ").oninput = e => { angleZ = parseFloat(e.target.value); draw(); };

document.getElementById("translateX").oninput = e => { translateX = parseFloat(e.target.value); draw(); };
document.getElementById("translateY").oninput = e => { translateY = parseFloat(e.target.value); draw(); };
document.getElementById("translateZ").oninput = e => { translateZ = parseFloat(e.target.value); draw(); };

document.getElementById("scale").oninput = e => { scale = parseFloat(e.target.value); draw(); };

function project3D(x, y, z) {
    const adjustedZ = z - camera.z;
    const factor = perspective / (perspective + adjustedZ);
    return {
        x: canvas.width / 2 + (x - camera.x) * factor,
        y: canvas.height / 2 - (y - camera.y) * factor
    };
}

function applyTransformations() {
    let radX = angleX * Math.PI / 180;
    let radY = angleY * Math.PI / 180;
    let radZ = angleZ * Math.PI / 180;

    let rotateXMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(radX), -Math.sin(radX), 0],
        [0, Math.sin(radX), Math.cos(radX), 0],
        [0, 0, 0, 1]
    ];

    let rotateYMatrix = [
        [Math.cos(radY), 0, Math.sin(radY), 0],
        [0, 1, 0, 0],
        [-Math.sin(radY), 0, Math.cos(radY), 0],
        [0, 0, 0, 1]
    ];

    let rotateZMatrix = [
        [Math.cos(radZ), -Math.sin(radZ), 0, 0],
        [Math.sin(radZ), Math.cos(radZ), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    let rotationMatrix = multiplyMatrices(
        rotateXMatrix,
        multiplyMatrices(rotateYMatrix, rotateZMatrix)
    );

    let scaleMatrix = [
        [scale, 0, 0, 0],
        [0, scale, 0, 0],
        [0, 0, scale, 0],
        [0, 0, 0, 1]
    ];

    let translationMatrix = [
        [1, 0, 0, translateX],
        [0, 1, 0, translateY],
        [0, 0, 1, translateZ],
        [0, 0, 0, 1]
    ];

    transformationMatrix = multiplyMatrices(
        translationMatrix,
        multiplyMatrices(scaleMatrix, rotationMatrix)
    );

    displayMatrix();
}

function multiplyMatrices(a, b) {
    let result = Array(a.length).fill().map(() => Array(b[0].length).fill(0));
    return result.map((row, i) =>
        row.map((_, j) => a[i].reduce((sum, elm, k) => sum + elm * b[k][j], 0))
    );
}

function applyMatrixToVertex(vertex) {
    let { x, y, z } = vertex;
    let result = multiplyMatrices(transformationMatrix, [[x], [y], [z], [1]]);
    return { x: result[0][0], y: result[1][0], z: result[2][0] };
}

function draw() {
    applyTransformations();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStaticAxes();

    ctx.strokeStyle = "white";
    ctx.beginPath();
    edges.forEach(([start, end]) => {
        const p1 = project3D(
            ...Object.values(applyMatrixToVertex(vertices[start]))
        );
        const p2 = project3D(
            ...Object.values(applyMatrixToVertex(vertices[end]))
        );
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    });
    ctx.stroke();
}

function drawStaticAxes() {
    ctx.strokeStyle = "red";
    ctx.beginPath();

    const origin = { x: 0, y: 0, z: 0 };
    const xAxis = { x: 100, y: 0, z: 0 };
    const yAxis = { x: 0, y: 100, z: 0 };
    const zAxis = { x: 0, y: 0, z: 100 };

    const projectedOrigin = project3D(origin.x, origin.y, origin.z);
    const projectedXAxis = project3D(xAxis.x, xAxis.y, xAxis.z);
    const projectedYAxis = project3D(yAxis.x, yAxis.y, yAxis.z);
    const projectedZAxis = project3D(zAxis.x, zAxis.y, zAxis.z);

    ctx.moveTo(projectedOrigin.x, projectedOrigin.y);
    ctx.lineTo(projectedXAxis.x, projectedXAxis.y);
    ctx.moveTo(projectedOrigin.x, projectedOrigin.y);
    ctx.lineTo(projectedYAxis.x, projectedYAxis.y);
    ctx.moveTo(projectedOrigin.x, projectedOrigin.y);
    ctx.lineTo(projectedZAxis.x, projectedZAxis.y);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.fillText("X", projectedXAxis.x + 5, projectedXAxis.y);
    ctx.fillText("Y", projectedYAxis.x, projectedYAxis.y - 5);
    ctx.fillText("Z", projectedZAxis.x + 5, projectedZAxis.y);
}

function displayMatrix() {
    const matrixContainer = document.getElementById("transformationMatrix");
    matrixContainer.textContent = transformationMatrix
        .map(row => row.map(value => value.toFixed(3)).join("\t"))
        .join("\n");
}

draw();

document.getElementById("generateProjections").onclick = () => {
    const transformedVertices = vertices.map(applyMatrixToVertex);

    drawProjection("projectionXY", transformedVertices, vertex => ({ x: vertex.x, y: vertex.y }));
    drawProjection("projectionXZ", transformedVertices, vertex => ({ x: vertex.x, y: vertex.z }));
    drawProjection("projectionYZ", transformedVertices, vertex => ({ x: vertex.z, y: vertex.y }));
};

function drawProjection(canvasId, transformedVertices, projectFn) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const center = {
        x: vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length,
        y: vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length,
        z: vertices.reduce((sum, v) => sum + v.z, 0) / vertices.length,
    };

    const correctedVertices = transformedVertices.map(v => ({
        x: v.x - translateX,
        y: v.y - translateY,
        z: v.z - translateZ,
    }));

    const projectedVertices = correctedVertices.map(projectFn);

    const bounds = projectedVertices.reduce(
        (acc, v) => ({
            minX: Math.min(acc.minX, v.x),
            maxX: Math.max(acc.maxX, v.x),
            minY: Math.min(acc.minY, v.y),
            maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const scaleFactor = Math.min(canvas.width / width, canvas.height / height) * 0.9;
    const offsetX = canvas.width / 2 - centerX * scaleFactor;
    const offsetY = canvas.height / 2 - centerY * scaleFactor;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    edges.forEach(([start, end]) => {
        const p1 = projectedVertices[start];
        const p2 = projectedVertices[end];
        ctx.moveTo(offsetX + p1.x * scaleFactor, offsetY - p1.y * scaleFactor);
        ctx.lineTo(offsetX + p2.x * scaleFactor, offsetY - p2.y * scaleFactor);
    });
    ctx.stroke();

    ctx.fillStyle = "red";
    projectedVertices.forEach(p => {
        ctx.beginPath();
        ctx.arc(offsetX + p.x * scaleFactor, offsetY - p.y * scaleFactor, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}
