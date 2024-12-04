const sock = new WebSocket('ws://73.240.254.233:8080');
//const sock = new WebSocket('ws://192.168.0.121:8005');
var netUpdateLoop;
var uid_to_ships = {};
var my_uid = "";
var lobby_id = 0;
var all_player_uid = [];
const SEAKREIGHT_KEEEH = "1ed37381-315e-413a-a04e-7d75775d61cf";

sock.onopen = () => {
    console.log('Connection opened');
    let p_name = document.getElementById("player_name").value;
    if(p_name == "Fumbles") {
        p_name += `_${(Math.floor(Math.random() * 10 + 1))}${(Math.floor(Math.random() * 10 + 1))}${(Math.floor(Math.random() * 10 + 1))}${(Math.floor(Math.random() * 10 + 1))}`;
    }
    let package = {
        "SEAKREIGHT_KEEEH":SEAKREIGHT_KEEEH,
        "player_name": p_name,
    }
    sock.send(JSON.stringify(package));
    // Start sending position updates every 0.1 seconds (100ms)
    netUpdateLoop = setInterval(sendUpdate, 100); // Adjust the interval as needed
};

sock.onmessage = ({ data }) => {
    //console.log("Message from server: ", data);
    let jdat = JSON.parse(data);
    //console.log("Message from server: ", jdat);
    switch(jdat.type) {
        case "connection":
          my_uid = jdat.uid;
          ShipMotor.player_ship.node.position = getSpiralPosition(parseInt(my_uid)).scaled(2);
          break;
        case "positions":
          process_positions(jdat.data);
          break;
        case "countdown":
          process_countdown(jdat.value);
          break;
        case "racerFinish":
          ui_headMsg(`${jdat.place} - ${jdat.name}!`, 3000);
          //self.broadcast_message({"type":"racerFinish","name":player.display_name,"place":place})
          break;
        default:
          // code block
      } 
    //dout(`Message from server: ${data}`);
};

sock.onerror = (error) => {
    console.error('WebSocket error:', error);
};

sock.onclose = () => {
    console.log('Connection closed');
    clearInterval(netUpdateLoop);
};

// Functions

// Function to send position updates
function sendUpdate() {
    let pos = ShipMotor.player_ship.node.position;
    let rot = ShipMotor.player_ship.node.rotation;
    const x = pos.x
    const y = pos.y
    const z = pos.z
    const r_x = rot.x;  // Replace with your rotation data
    const r_y = rot.y;  // Replace with your rotation data
    const r_z = rot.z;  // Replace with your rotation data
    const status = "A";  // Example status letter (Active)

    // Format the data as a simple string
    const data = `${status}|${x},${y},${z},${r_x},${r_y},${r_z}`;

    // Send the data to the server
    sock.send(data);
    //console.log('Sent update: ', data);
}

function player_ready() {
    sock.send('R|0,0,0,0,0,0');
}

function player_finish() {
    sock.send('F|0,0,0,0,0,0');
}

function process_positions(pos_list) {
 //{ "c8fad701-6f34-48f2-834b-2c8c396f77e8": "A|30.780055170913336,8.206286336895637,31.049490959207816,8e-323,-0.020000000000000014,-4.4e-323", 
 //  "72ed8d6f-567f-426d-8a2a-a6f9f489023e": "A|-15.938215639503941,3.098134053114713,15.169102894797248,8e-323,-0.3200000000000007,4.4e-323" }
    let netstat = document.getElementById("netstat");
    let ind = 0;
    netstat.innerHTML = "<ul>"
    for (const [key, value] of Object.entries(pos_list)) {
        let splitstring = value.toString().substring(2).split(',');
        let n_pos = new Vec4(parseFloat(splitstring[0]),parseFloat(splitstring[1]),parseFloat(splitstring[2]));
        let n_rot = new Vec4(parseFloat(splitstring[3]),parseFloat(splitstring[4]),parseFloat(splitstring[5]));
        netstat.innerHTML += `<li>Player ${key}</li>`;
        if(key == my_uid) {continue;}
        ind++;
        //console.log(key, value);
        if(key in uid_to_ships == false) {
            // add new ship
            let n_ship = prefab_ship(key);
            scene.add_child(n_ship);
            let n_motor = n_ship.get_component("ShipMotor");  
            uid_to_ships[key] = n_motor;
            // NOTE- HACKY - regenerate zupermesh
            renderer_init();
        } 

        uid_to_ships[key].net_setValues(n_pos, n_rot);
        

    }
    netstat.innerHTML += "</ul>"
}


function process_countdown(value) {
    console.log("Countdown!");
    if(value == 0) {
        ui_headMsg("GO", 2000);
        AudMgr.play_sfx("audio/go.ogg")
        ShipMotor.player_ship.enabled = true;
    } else {
        ui_headMsg(value.toString(), 1000);
        AudMgr.play_sfx("audio/countdown.ogg")
    }

}


function getSpiralPosition(playerId) {
    // Golden angle in radians
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));  // ~2.39996 radians

    // Calculate the angle and radius for the player ID (n)
    const angle = goldenAngle * playerId;
    const radius = Math.sqrt(playerId);

    // Convert from polar to Cartesian coordinates
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    return new Vec4(x,y,0);
}