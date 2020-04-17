import express, {Application} from "express";
import socketIO, {Server as SocketIOServer} from "socket.io";
import {createServer, Server as HTTPServer} from "http";
import path from "path";

export default class Server {
	httpServer = HTTPServer;
	app = Application;
	io = SocketIOServer;

	activeSockets = [];
	DEFAULT_PORT = 5000;
	constructor() {
		this.initialize();
	}

	listen(callback) {
		this.httpServer.listen(this.DEFAULT_PORT, () => {
			callback(this.DEFAULT_PORT);
		});
	}

	initialize() {
		this.app = express();
		this.httpServer = createServer(this.app);
		this.io = socketIO(this.httpServer);

		this.configureApp();
		this.configureRoutes();
		this.handleSocketConnection();
	}

	configureApp() {
		this.app.use(express.static(path.join(__dirname, "../public")));
	}

	configureRoutes() {
		this.app.get("/", (req, res) => {
			res.sendFile("index.html");
		});
	}

	handleSocketConnection() {
		this.io.on("connection", socket => {
			const existingSocket = this.activeSockets.find(
				existingSocket => existingSocket === socket.id
			);

			if (!existingSocket) {
				this.activeSockets.push(socket.id);

				socket.emit("update-user-list", {
					users: this.activeSockets.filter(
						existingSocket => existingSocket !== socket.id
					)
				});

				socket.broadcast.emit("update-user-list", {
					users: [socket.id]
				});
			}

			socket.on("call-user", data => {
				socket.to(data.to).emit("call-made", {
					offer: data.offer,
					socket: socket.id
				});
			});

			socket.on("make-answer", data => {
				socket.to(data.to).emit("answer-made", {
					socket: socket.id,
					answer: data.answer
				});
			});

			socket.on("reject-call", data => {
				socket.to(data.from).emit("call-rejected", {
					socket: socket.id
				});
			});

			socket.on("disconnect", () => {
				this.activeSockets = this.activeSockets.filter(existingSocket => existingSocket !== socket.id);
				socket.broadcast.emit("remove-user", {
					socketId: socket.id
				});
			});
		});
	}
}