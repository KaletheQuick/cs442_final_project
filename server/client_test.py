import asyncio
import websockets

async def hello():
    uri = "ws://localhost:8005"
    async with websockets.connect(uri) as websocket:
        name = input("What is your name? ")

        await websocket.send(name)
        print(f'Client sent: {name}')

        greeting = await websocket.recv()
        print(f'Client recieved: {greeting}')

if __name__ == "__main__":
    asyncio.run(hello())