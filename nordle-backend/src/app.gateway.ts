import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "net";
import * as fs from "fs";
import * as crypto from "crypto";

class Language {
    words: string[];
    wordsByLength: Map<number, string[]> = new Map();

    constructor(public name: string, path: string) {
        this.words = fs.readFileSync(path, "utf8").split("\n");

        for (let word of this.words) {
            let wordsByLength = this.wordsByLength.get(word.length);
            if (!wordsByLength) {
                wordsByLength = [];
                this.wordsByLength.set(word.length, wordsByLength);
            }
            wordsByLength.push(word);
        }
    }

    getRandomWord(length: number): string {
        const words = this.wordsByLength.get(length);
        return words[Math.floor(Math.random() * words.length)];
    }
}

class Game {
    secrets: string[] = [];
    guesses: string[] = [];

    constructor(public language: Language, public maxGuesses: number, public wordLength: number) {}

    genSecrets(count: number) {
        for (let i = 0; i < count; i++) {
            this.secrets.push(this.language.getRandomWord(this.wordLength));
        }
    }
}

class Room {
    clients: Set<Client> = new Set();
    code: string = "";

    constructor(public game: Game) {
        for (let i = 0; i < 8; i++) {
            const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const index = crypto.randomInt(0, charset.length);
            this.code += charset.charAt(index);
        }
    }

    addClient(client: Client) {
        if (client.room) {
            client.room.removeClient(client);
        }
        this.clients.add(client);
        client.room = this;
    }

    removeClient(client: Client) {
        this.clients.delete(client);
        client.room = null;
        if (this.clients.size === 0) {
            rooms.delete(this.code);
        }
    }
}

class Client {
    socket: Socket;
    room?: Room;
}

interface NewGame {
    language: string;
    maxGuesses: number;
    wordLength: number;
    secretCount: number;
}

interface JoinGame {
    code: string;
}

const clients: WeakMap<Socket, Client> = new WeakMap();
const languages: Map<string, Language> = new Map();
const rooms: Map<string, Room> = new Map();

languages.set("English", new Language("English", "./words/english.txt"));

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class AppGateway implements OnGatewayConnection {
    handleConnection(@ConnectedSocket() socket: Socket) {
        clients.set(socket, {
            socket,
        });
    }

    @SubscribeMessage("newGame")
    newGame(@ConnectedSocket() socket: Socket, @MessageBody() data: NewGame) {
        const client = clients.get(socket);
        const game = new Game(languages[data.language], data.maxGuesses, data.wordLength);
        game.genSecrets(data.secretCount);
        const room = new Room(game);
        room.addClient(client);
        rooms.set(room.code, room);
    }

    @SubscribeMessage("joinGame")
    joinGame(@ConnectedSocket() socket: Socket, @MessageBody() data: JoinGame) {
        const client = clients.get(socket);
        const room = rooms.get(data.code);
        if (!room) {
            return;
        }
        room.addClient(client);
    }

    @SubscribeMessage("leaveGame")
    leaveGame(@ConnectedSocket() socket: Socket) {
        const client = clients.get(socket);
        if (!client.room) {
            return;
        }
        client.room.removeClient(client);
    }
}