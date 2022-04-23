import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway {
    @SubscribeMessage('setName')
    setName(@ConnectedSocket() client: any, @MessageBody() data: any): string {
        client.name = data
        return 'test'
    }

    @SubscribeMessage('getName')
    getName(@ConnectedSocket() client: any): string {
        return client.name
    }
}