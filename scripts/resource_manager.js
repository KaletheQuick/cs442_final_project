// NOTE: The resource manager is responsible for handling all requests for assets, and storing them.
// this includes mesh objects, textures, audio files, and everything else.
// it isn't meant to be instanced, it's essentially a global collection of functions with a namespace

class ResourceManager {
    static meshes = {};
    static textures = {};

    // paths for where the resources are stored
    // NOTE: Keys for the resource is just the file name.
    // So the mesh object loaded from "./meshes/d4.obj" would be accessed like this: ResourceManager.meshes["d4.obj"]
    static mesh_src = "meshes/";
    static img_src = "img/";

    static load_mesh_list(paths) {
        for(let mesh_path of paths)
            this.load_mesh_resource(mesh_path);
    }

    // The mesh loading functionality in render.js had been moved here, storing the meshes in one large dictionary
    static load_mesh_resource(mesh_name) {
        this.load_resource(this.mesh_src + mesh_name, (request) => {
            // parse the obj file
            let mesh = Mesh.from_obj(request.responseText);
            // add it to the mesh dictionary
            this.meshes[mesh_name] = mesh;

            // NOTE: I'm not quite sure why this needs to be called after every mesh is loaded, but it doesn't work otherwise.
            //renderer_init();
        });
    }

    static load_texture_resource(file_path) {
        // create new javascript image object, set the path
        // do webgl texture stuff
    }

    static load_audio_resource(file_path) {
    }


    // Fetch a resource and give it to the callback
    static load_resource(file_path, callback) {
        let request = new XMLHttpRequest();
		
        request.onreadystatechange = function() {
            if(request.readyState != 4)
				return;
            if(request.status != 200) {
                console.log("Error loading resource: " + request.statusText);
                return;
            }
            //console.log("ResourceManager: Loaded resource at \"" + file_path + "\"");
            callback(request);
        }

		// send the request to the server
        request.open('GET', file_path);
        request.send();
    }
}