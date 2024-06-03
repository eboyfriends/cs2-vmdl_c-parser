const fs = require('fs');
const { promises: fsPromises } = fs; // Destructure promises from fs for modern async usage
const path = require('path');
const readline = require('readline');

const sectionsRegex = {
    Triangles: /m_Triangles\s*=\s*#\[([\s\S]*?)\]/g,
    Vertices: /m_Vertices\s*=\s*#\[([\s\S]*?)\]/g,
    Nodes: /m_Nodes\s*=\s*#\[([\s\S]*?)\]/g,
    CollisionAttributeIndex: /m_nCollisionAttributeIndex\s*=\s*(\d+)/g,
    Min: /m_vMin\s*=\s*\[([\s\S]*?)\]/g,
    Max: /m_vMax\s*=\s*\[([\s\S]*?)\]/g,
    OrthographicAreas: /m_vOrthographicAreas\s*=\s*\[([\s\S]*?)\]/g
};

async function extractDataFromFile(filePath) {
    const sectionsData = {
        Triangles: [],
        Vertices: [],
        Nodes: [],
        CollisionAttributeIndex: [],
        Min: [],
        Max: [],
        OrthographicAreas: [],
        CollisionAttributeIndices: []
    };

    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });

        let meshesContent = '';
        let collisionIndicesContent = '';
        let inMeshesSection = false;
        let inCollisionIndicesSection = false;

        for await (const line of rl) {
            if (line.includes('m_meshes')) {
                inMeshesSection = true;
            } else if (line.includes('m_CollisionAttributeIndices')) {
                inMeshesSection = false;
                inCollisionIndicesSection = true;
            } else if (inMeshesSection) {
                meshesContent += line.replace(/\s/g, '');
            } else if (inCollisionIndicesSection) {
                collisionIndicesContent += line.replace(/\s/g, '');
            }
        }

        for (const sectionName in sectionsRegex) {
            const regex = sectionsRegex[sectionName];
            const matches = meshesContent.matchAll(regex);
            for (const match of matches) {
                sectionsData[sectionName].push(match[1]);
            }
        }

        const collisionIndicesMatches = collisionIndicesContent.matchAll(/(\d+)/g);
        for (const match of collisionIndicesMatches) {
            sectionsData.CollisionAttributeIndices.push(match[1]);
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }

    return sectionsData;
}

async function processFilesInDirectory(directoryPath) {
    try {
        const files = await fsPromises.readdir(directoryPath);
        const txtFiles = files.filter(file => file.endsWith('.txt'));
        console.log(txtFiles)

        for (const txtFile of txtFiles) {
            const mapName = path.parse(txtFile).name;
            if (mapName == "de_inferno") continue; // too fuckin big
            const sectionsData = await extractDataFromFile(path.join(directoryPath, txtFile));
            await fsPromises.writeFile(`${mapName}.json`, JSON.stringify(sectionsData, null, 4));
            console.log(`Data written to ${mapName}.json`);
        }
    } catch (err) {
        console.error('Unable to scan directory:', err);
    }
}

const directoryPath = __dirname;
processFilesInDirectory(directoryPath);
