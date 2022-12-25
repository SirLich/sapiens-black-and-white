
layout(binding = 0) uniform sampler2D texMap;
layout(binding = 1) uniform sampler2D bloomTex;

layout(location = 0) in vec2 fragTexCoord;

layout(location = 0) out vec4 outColor;

const float bloomIntensity = 5.0;

int COLORBLIND_MODE = 1;

vec4 Daltonize( vec4 dalInput, vec2 tex ) {
	// RGB to LMS matrix conversion
	vec3 L = vec3((17.8824f * dalInput.r) + (43.5161f * dalInput.g) + (4.11935f * dalInput.b));
	vec3 M = vec3((3.45565f * dalInput.r) + (27.1554f * dalInput.g) + (3.86714f * dalInput.b));
	vec3 S = vec3((0.0299566f * dalInput.r) + (0.184309f * dalInput.g) + (1.46709f * dalInput.b));
	
	// Simulate color blindness
	
	// #if ( COLORBLIND_MODE == 1) // Protanope - reds are greatly reduced (1% men)
		float l = 0.0f * L + 2.02344f * M + -2.52581f * S;
		float m = 0.0f * L + 1.0f * M + 0.0f * S;
		float s = 0.0f * L + 0.0f * M + 1.0f * S;
	// #endif
	
	// #if ( COLORBLIND_MODE == 2) // Deuteranope - greens are greatly reduced (1% men)
	// 	float l = 1.0f * L + 0.0f * M + 0.0f * S;
	// 	float m = 0.494207f * L + 0.0f * M + 1.24827f * S;
	// 	float s = 0.0f * L + 0.0f * M + 1.0f * S;
	// #endif
	
	// #if ( COLORBLIND_MODE == 3) // Tritanope - blues are greatly reduced (0.003% population)
	// 	float l = 1.0f * L + 0.0f * M + 0.0f * S;
	// 	float m = 0.0f * L + 1.0f * M + 0.0f * S;
	// 	float s = -0.395913f * L + 0.801109f * M + 0.0f * S;
	// #endif
	
	// LMS to RGB matrix conversion
	vec4 error;
	error.r = (0.0809444479f * l) + (-0.130504409f * m) + (0.116721066f * s);
	error.g = (-0.0102485335f * l) + (0.0540193266f * m) + (-0.113614708f * s);
	error.b = (-0.000365296938f * l) + (-0.00412161469f * m) + (0.693511405f * s);
	error.a = 1;

	return error.rgba;
	
	// Isolate invisible colors to color vision deficiency (calculate error matrix)
	// error = (input - error);
	
	// Shift colors towards visible spectrum (apply error modifications)
	// float4 correction;
	// correction.r = 0; // (error.r * 0.0) + (error.g * 0.0) + (error.b * 0.0);
	// correction.g = (error.r * 0.7) + (error.g * 1.0); // + (error.b * 0.0);
	// correction.b = (error.r * 0.7) + (error.b * 1.0); // + (error.g * 0.0);
	
	// Add compensation to original values
	// correction = input + correction;
	// correction.a = input.a;
	
	// return correction.rgba;
}

void main() {
	vec4 bloomValue = texture(bloomTex, fragTexCoord) * bloomIntensity;
	outColor = mix(texture(texMap, fragTexCoord), vec4(vec3(0.8) + bloomValue.xyz * 0.3, 1.0), min((bloomValue.x + bloomValue.y + bloomValue.z) * 0.12, 1.0));

	// outColor = Daltonize(outColor, fragTexCoord);
}