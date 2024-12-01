class ManagerAudio {
	constructor() { 
		this.loaded_audioPlayers = {};
		this.playing_sfx = [];
		// load all audio
		this.load("audio/pluck.ogg");
		this.load("audio/Rising Tide (faster).mp3")
		this.load("audio/Rising Tide.mp3")
	}

	load(pathString) {
		let aud = new Audio(pathString);
		aud.preservesPitch = false;
		this.loaded_audioPlayers[pathString] = [aud];
	}

	_process() {
		let next_frame_audio_array = []
		this.playing_sfx.forEach(element => {
			if(element[1].paused == false) {
				// Audio still playing, do again next frame
				next_frame_audio_array.push(element);
				if(element[2] != null) {
					//console.log(Math.min(10 / Camera.main.node.model.position().sub(element[2].model.position()).length(),1));
					element[1].volume = Math.min(10 / Camera.main.node.model.position().sub(element[2].model.position()).length(),1);
					//console.log(100 / Camera.main.node.position.sub(element[2].position).lengthSquared());
					//console.log(100 / Camera.main.node.position.sub(element[2].position).lengthSquared());
				}
			} else {
				this.loaded_audioPlayers[element[0]].push(element[1]);
			}
		});
		this.playing_sfx = next_frame_audio_array;
	}

	play_sfx(pathString, nodeToFollow=null) {

		console.log(`String: ${pathString}, Node: ${Camera.main.node.model.position()}`);
		let a;
		if(pathString in this.loaded_audioPlayers && this.loaded_audioPlayers[pathString].length > 0) {
			a = this.loaded_audioPlayers[pathString].pop();
		} else {
			a = new Audio(pathString);
		}

		if(nodeToFollow != null) {
			let l = Camera.main.node.model.position().sub(nodeToFollow.model.position()).lengthSquared();
			a.volume = l != 0 ? 1/l : 1 ; // if zero we want it to be 
		} else {
			a.volume = 1;
		} 
		this.playing_sfx.push([pathString,a,nodeToFollow]);
		// ["someAudio.wav", audioObject, 3D_position]
		a.playbackRate = 1;
		a.play();
		return a;
	}

	play_music() {

	}
}