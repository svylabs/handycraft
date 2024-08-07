const fs = require('fs');
const express = require('express');
const path = require('path');

const createApp = async(name, description) => {
    try {
        // Create a new app json locally
        const app = {
            name,
            description,
            contracts: [],
            network: {},
            components: [
                {
                    type: "text",
                    label: "Enter your name",
                    id: "name",
                    placement: "input"
                },
                {
                    type: "button",
                    label: "Submit",
                    id: "submit",
                    placement: "action",
                    codeRef: "alert(`Hello, ${data[\"name\"]}`);"
                }
            ]
        }
        // Create a directory with the name of the app and store app.json there
        fs.mkdirSync(name);
        fs.writeFileSync(`${name}/app.json`, JSON.stringify(app, null, 2));
        console.log("A simple app has been created", app);
        console.log("You can run the app using `microcraft app open <dir>` command")
    } catch (error) {
        console.error('Error creating app:', error.message);
    
    }
}

const new_command = async (name, description, options) => {
    try {
        // Create a new app json locally
        await createApp(name, description);
    } catch (error) {
        console.error('Error creating app:', error.message);
    }
}

const open_command = async (source, url) => {
    try {
        const app = express();
        app.use(express.static(path.join(__dirname, '../../microcraft-lite/public')));
        app.use("/app", (req, res) => {
            res.sendFile(path.join(__dirname, "..", "..", "microcraft-lite", 'index.html'));
        });
        let pathParam = `source=${source}&path=${url}`;
        if (source === 'local') {
            app.use("/applet/files", (req, res) => {
                const basePath = req.query.base_path;
                const filePath = req.query.file_path;
                //console.log(name, file);
                res.sendFile(path.join(process.cwd(), basePath, filePath));
            });
            app.use("/applet/app.json", (req, res) => {
                //console.log(req.query.path, 'app.json');
                res.sendFile(path.join(process.cwd(), req.query.base_path, 'app.json'));
            });
        }
        const open = await import('open');
        //console.log(open);
        app.listen(2112, () => {
            console.log('Server started at http://localhost:2112');
            console.log("Opening app in browser..");
            open.default('http://localhost:2112/app/external?'  + pathParam);
        });
        
    } catch (error) {
        console.log(error);
        console.error('Error opening app:', error.message);
    }
}

module.exports = { new_command, open_command };