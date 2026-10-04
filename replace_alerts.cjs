const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('alert(')) {
        return false;
    }

    const simpleAlertRegex = /alert\((['"`])([\s\S]*?)\1\)/g;
    const dynamicAlertRegex = /alert\(([^'"`)]+)\)/g;
    
    let changed = false;

    if (simpleAlertRegex.test(content)) {
        content = content.replace(simpleAlertRegex, (match, quote, text) => {
            const icon = text.toLowerCase().includes('error') ? 'error' : 'info';
            const title = icon === 'error' ? 'Error' : 'Aviso';
            return `Swal.fire({ icon: '${icon}', title: '${title}', text: \`${text.replace(/`/g, '\\`')}\` })`;
        });
        changed = true;
    }

    if (dynamicAlertRegex.test(content)) {
        content = content.replace(dynamicAlertRegex, (match, expression) => {
            return `Swal.fire({ icon: 'info', title: 'Aviso', text: String(${expression}) })`;
        });
        changed = true;
    }

    if (changed && !content.includes('import Swal from')) {
        if (content.includes('<script setup')) {
            content = content.replace(/<script setup[^>]*>/, match => match + "\nimport Swal from 'sweetalert2'");
        } else if (content.includes('<script')) {
            content = content.replace(/<script[^>]*>/, match => match + "\nimport Swal from 'sweetalert2'");
        } else {
            content = "import Swal from 'sweetalert2';\n" + content;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walkSync(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile() && (filepath.endsWith('.vue') || filepath.endsWith('.ts'))) {
            callback(filepath);
        }
    }
}

let modified = 0;
walkSync('app', (filepath) => {
    if (processFile(filepath)) {
        console.log('Modified', filepath);
        modified++;
    }
});
console.log('Total files modified:', modified);
