const http = require('http');

const todolist = [];
const port = process.argv[2];

if (isNaN(port)) {
    console.log('Invalid port number');
    process.exit(1);
} else if (port < 3000) {
    console.log('Port must be greater than 3000');
    process.exit(1);
}

const reqHandler = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname, searchParams } = parsedUrl;
    const method = req.method;

    switch (method) {
        case 'GET': 
            handleGet(req, res);
            break;
        case 'POST':
            handlePost(req, res);
            break;
        case 'DELETE':
            handleDelete(req, res, searchParams);
            break;
        case 'PUT':
            handlePut(req, res, searchParams);
            break;
        default:
            res.end('Invalid method');
            break;
    }
};

function handleGet(req, res) {
    if (todolist.length === 0) {
        res.end('Well done! Todo list is empty!');
    } else {
        let responseText = '';
        todolist.forEach((item, index) => {
            responseText += `${index + 1}) ${item}\n`;
        });
        res.end(responseText.trim());
    }
}

function handlePost(req, res) {
    let item = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
        item += chunk;
    });

    req.on('end', () => {
        todolist.push(item.trim());
        console.log(todolist);
        res.end('OK');
    });
}

function handleDelete(req, res, searchParams) {
    const indexstr = searchParams.get('index');
    const index = parseInt(indexstr, 10);
    const i = index - 1;
    todolist.splice(i, 1);
    res.end('Item deleted');
}

function handlePut(req, res, searchParams) {
    const indexstr = searchParams.get('index');
    const upindex = parseInt(indexstr, 10);
    let updateditem = '';

    req.setEncoding('utf8');
    req.on('data', (chunk) => {
        updateditem += chunk;
    });

    req.on('end', () => {
        todolist[upindex - 1] = updateditem.trim();
        res.end('Item updated');
    });
}

const server = http.createServer(reqHandler);

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
