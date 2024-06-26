import { readFile } from "fs/promises";
import * as http from "http";
import * as url from "url";
import Database from "./database.js";
import path from "path";
import { json } from "express";


async function basicServer(request, response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  if (request.method === 'OPTIONS') {
    // Handle preflight requests
    response.writeHead(200);
    response.end();
    return;
  }
  const parsedUrl = url.parse(request.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Grab the HTTP method.
  const method = request.method;

  if (method === "POST" && pathname === "/addProject") {
    console.log("POST /addProject");
    const database = await Database("tomato");
    let bod = await database.addProject(query.name)
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(bod));
    
  } else if (method === "GET" && pathname === "/projects") {
    console.log("GET /projects");
    const database = await Database("tomato");
    let bod = await database.getProjects()
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(bod.data.projects));

  } else if (method === "DELETE" && pathname === "/removeProject") {
    console.log("DELETE /removeProject");
    const database = await Database("tomato");
    let bod = await database.deleteProject(query.name)
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(bod));
    
    } else if (method === "POST" && pathname === "/addTask") {
        console.log("POST /addTask");
        const database = await Database("tomato");
        let bod =await database.addTask(query.project,query.name,query.due)
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(bod));
        
      } else if (method === "GET" && pathname === "/tasks") {
        console.log("GET /tasks");
        const database = await Database("tomato");
        let bod =await database.getTasksInProject(query.project)
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(bod.data));
    
      } else if (method === "DELETE" && pathname === "/removeTask") {
        console.log("DELETE /removeProject");
        const database = await Database("tomato");
        let bod = await database.deleteProject(query.project,query.name)
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(bod));

  
  } else {
    const sendIt = async (pathname, type) => {
      const file = pathname === "/" ? "index.html" : pathname;
      try {
        const data = await readFile(
          path.join(
            path.dirname(url.fileURLToPath(import.meta.url)),
            "..",
            "client",
            file,
          ),
          "utf8",
        );
        response.writeHead(200, { "Content-Type": type });
        response.write(data);
      } catch (err) {
        response.statusCode = 404;
        response.write("Not found");
      }
      response.end();
    };
    if (pathname.endsWith(".css")) {
      sendIt(pathname, "text/css");
    } else if (pathname.endsWith(".js")) {
      sendIt(pathname, "text/javascript");
    } else if (pathname.endsWith(".json")) {
      sendIt(pathname, "application/json");
    } else if (pathname.endsWith(".html")) {
      sendIt(pathname, "text/html");
    } else if (pathname.endsWith("/")) {
      sendIt(pathname, "text/html");
    } else {
      sendIt(pathname, "text/plain");
    }
  }
}
http.createServer(basicServer).listen(3260, () => {
  console.log("Server started on port 3260");
});
