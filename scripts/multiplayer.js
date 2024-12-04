const sock = new WebSocket('ws://73.240.254.233:8080');
var netUpdateLoop;
var uid_to_ships = {};
var my_uid = "";
var lobby_id = 0;
var all_player_uid = [];

sock.onopen = () => {
    console.log('Connection opened');
    sock.send('Fumbles');
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
          break;
        case "positions":
          process_positions(jdat.data);
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