import { Server } from "./server/Server.js";

const main = async () => {
    const server = new Server();
    await server.initialize();
    server.listen();
};

main();