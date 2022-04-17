#version 300 es
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform samplerCube tex2;
uniform int cullMode;
uniform mediump vec4 color;
uniform bool enableVertColor;

in highp vec2 fragUV;
in mediump vec4 vertColor;
in mediump vec3 vertPos;
out mediump vec4 fragColor;

void main() {
  if (cullMode != 0) {
    if (cullMode == 1 && !gl_FrontFacing) discard;
    if (cullMode == 2 && gl_FrontFacing) discard;
  }
  
  fragColor = texture(tex2, vertPos);

  if (enableVertColor) {
    fragColor = fragColor * vertColor;
  } else {
    fragColor = fragColor * color;
  }
}