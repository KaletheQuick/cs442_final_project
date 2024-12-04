import asyncio
import websockets
import json

# Dictionary to store clients, keyed by UID
clients = {}
LOBBY_MAX_SIZE = 32
lobby = None

PCOUNTER = 1

# Client data class
class Client:
    def __init__(self, uid, websocket, display_name):
        self.uid = uid
        self.websocket = websocket
        self.display_name = display_name
        self.lobby : RaceInstance = None 


class RaceInstance:
    def __init__(self, race_id):
        self.race_id = race_id  # Unique identifier for the race
        self.players = []  # List of players in the race
        self.state = "waiting"  # Race states: waiting, countdown, active, finished
        self.ready_players = set()  # Players who are ready
        self.positions = {}  # Dictionary mapping player UID to position/rotation
        self.finished_players = []  # List of players in finishing order
        asyncio.create_task(self.broadcast_positions())

    async def add_player(self, player : Client):
        """
        Add a player to the race.
        """
        player.lobby = self
        print(player.lobby)
        self.players.append(player)
        self.positions[player.uid] = {"position": (0, 0, 0), "rotation": (0, 0, 0)}
        print(f"Player {player.display_name} joined race {self.race_id}.")

    def remove_player(self, player : Client):
        if player in self.players:
            self.players.remove(player)
            self.positions.pop(player.uid, None)

    async def player_ready(self, player):
        """
        Mark a player as ready.
        """
        self.ready_players.add(player.uid)
        print(f"Player {player.display_name} is ready.")
        if len(self.ready_players) == len(self.players):  # All players ready
            await self.start_countdown()

    async def start_countdown(self):
        """
        Begin the countdown to start the race.
        """
        self.state = "countdown"
        print(f"Starting countdown for race {self.race_id}.")
        for i in range(3, 0, -1):  # Example: 3-second countdown
            self.broadcast_message(f"Countdown: {i}")
            await asyncio.sleep(1)
        self.broadcast_message("GO!")
        self.state = "active"

    async def receive_update(self, player, update_data):
        """
        Handle position/rotation updates from a player.
        """
        #if self.state != "active":
        #    return
        self.positions[player.uid] = update_data
        #print(f"Received update from {player.display_name}: {update_data}")

    async def broadcast_positions(self):
        """
        Broadcast all players' positions at regular intervals.
        """
        while self.state == "active" or self.state == "waiting":
            self.broadcast_message({"type": "positions", "data": self.positions})
            await asyncio.sleep(0.1)  # Tick interval (10 times per second)

    async def player_finished(self, player):
        """
        Mark a player as finished and notify their placement.
        """
        self.finished_players.append(player)
        place = len(self.finished_players)
        self.broadcast_message(f"Player {player.display_name} finished in place {place}!")
        if len(self.finished_players) == len(self.players):
            self.end_race()

    def end_race(self):
        """
        End the race and clean up.
        """
        self.state = "finished"
        print(f"Race {self.race_id} has finished!")
        self.broadcast_message("Race complete. Thanks for playing!")

    def broadcast_message(self, message):
        """
        Send a message to all players.
        """
        for player in self.players:
            asyncio.create_task(player.websocket.send(json.dumps(message)))  # Replace `str` with JSON serialization as needed


async def handle_client(websocket): # path argument not needed at the moment
    # Receive the initial message (assume it's the display name)
    display_name = await websocket.recv()
    print(f"Received display name: {display_name}")

    # Generate a UID and create a new client
    global PCOUNTER
    uid = PCOUNTER
    PCOUNTER += 1
    client = Client(uid, websocket, display_name)

    # Store the client in the dictionary
    clients[uid] = client

    # attempt join lobby
    if len(lobby.players) < LOBBY_MAX_SIZE:
        await lobby.add_player(client)
        print(f"Client connected with UID: {uid} in lobby 0")
    else:
        print(f"Client connected with UID: {uid} all lobbies full")

    # Send the UID back to the client
    datapack = {
        "type":"connection",
        "value":"success",
        "uid":uid,
        "lobby_id":0,
        "current_players":[p.uid for p in lobby.players]
    }
    await websocket.send(json.dumps(datapack))

    try:
        while True:
            # Handle messages from the client
            message = await websocket.recv()
            #print(f"Received from {client.display_name} ({client.uid}): {message}")
            # Example: Echo the message back to the client
            #await websocket.send(f"Echo: {message}")
            match message[0]:
                case "A": # Default
                    await client.lobby.receive_update(client,message)
                case "A": # Default
                    await client.lobby.player_ready(client)
                case _:
                    pass


    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client {client.display_name} ({client.uid}) disconnected: {e}")
        client.lobby.remove_player(client)
    finally:
        # Remove the client on disconnect
        del clients[uid]
        print(f"Client {client.display_name} ({client.uid}) removed from clients")

async def main():
    global lobby
    # Start the WebSocket server
    server = await websockets.serve(handle_client, "0.0.0.0", 8005)
    print("Server started on ws://localhost:8005")
    lobby = RaceInstance(0)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
