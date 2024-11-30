const vertex_source = 
/*glsl*/ `#version 300 es
    precision mediump float;

    uniform mat4 model[61];// tested on mobile LG velvet
    uniform mat4 view;
    uniform mat4 projection;
    uniform float u_time;
    uniform vec3 sun_dir;

    in vec3 coordinates;
    in vec4 color;
    in vec3 normal;
    in vec2 uv;
    in float matIndex;

    out vec4 v_color;
    out vec3 pos;
    out vec3 v_normal;
    out vec2 v_uv;
    flat out mat4 v_model;

    void main( void ) {

        gl_Position = projection * view * model[int(matIndex)] * vec4(coordinates, 1.0); // Apply projection

        v_color = color;
		
        pos = (model[int(matIndex)] * vec4(coordinates, 1.0)).xyz;
        v_normal = normal; //normalize((view * projection * vec4(normal, 1.0)).xyz);
        v_uv = uv;
        v_model = model[int(matIndex)]; 
    }
`;

const fragment_source = /*glsl*/ ` #version 300 es
    precision mediump float;

    //uniform mat4 model[64];
    uniform sampler2D albedo;
    uniform sampler2D uber_maps;
    uniform float u_time;
    // lights
    uniform vec3 sun_dir;
    uniform vec3 cam_pos;
    uniform vec3 lightColor; 
    uniform float ambient_power;
    uniform float sun_power;
    //uniform float specular_power;
    //uniform float shinyness;
    
    in vec4 v_color;
    in vec3 pos;
    in vec3 v_normal;
    in vec2 v_uv;
    flat in mat4 v_model;

    out vec4 f_color;

    void main( void ) {
        vec4 tex_col = texture(albedo, vec2(-v_uv.x, -v_uv.y));
        vec4 uber_col = texture(uber_maps, vec2(-v_uv.x, -v_uv.y));
		float shinyness = uber_col.r;
		float specular_power = uber_col.g;
        vec3 normal = (v_model * vec4(v_normal, 0.0)).xyz;

        vec3 ambient_contribution = tex_col.xyz * ambient_power; // ambient complete

        //float shade = clamp(dot(sun_dir,v_normal), 0.0, 1.0);
        float shade = max(dot(sun_dir,normal), 0.0);
		vec3 sun_contribution = tex_col.xyz * shade * sun_power * 2.0; // diffuse complete		

		vec3 cam_dir = normalize(pos - cam_pos);
		vec3 reflected_angle = reflect(sun_dir,normal);
		float dotdot = max(dot(cam_dir,reflected_angle), 0.0);
		//float cbt = max(pow(dotdot, specular_power), 0.0);
		float cbt = pow(dotdot, shinyness);
		vec3 specular_contribution = vec3(1,1,1) * cbt * specular_power; // specular complete

        vec3 staticLight = vec3(sin(u_time+1.0 * 2.0) * 0.7,sin(u_time) * 0.7,1);
        vec3 lightDir = normalize(staticLight - pos);
		reflected_angle = reflect(lightDir,normal);
		dotdot = max(dot(cam_dir,reflected_angle), 0.0);
		//float cbt = max(pow(dotdot, specular_power), 0.0);
		cbt = pow(dotdot, shinyness);
		vec3 lightspecular_contribution = vec3(1,1,1) * cbt * specular_power; // light specular complete

        vec3 dist = (staticLight - pos);
        float thing = (dist.x * dist.x) + (dist.y * dist.y) + (dist.z * dist.z);
        float l_attenuation = 0.1/ thing;
        vec3 pLight_contribution = (lightColor * l_attenuation) + (vec3(1,1,1) * cbt * specular_power * l_attenuation); // point light complete

        f_color = vec4(ambient_contribution + sun_contribution + specular_contribution + pLight_contribution, 1) + (v_color * 0.001);
        //f_color = v_color;// vec4(normal, 1.0);
    }
`;