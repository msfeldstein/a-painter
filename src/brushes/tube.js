/* globals AFRAME THREE */
var SEGMENTS = 8;
var TWO_PI = Math.PI * 2
var up = new THREE.Vector3(0, 1, 0)

var vertexShader = `
  attribute float lineposition;
  varying vec3 vNormal;
  void main() {
    vNormal = normalMatrix * vec3(normal);
    float amt = 0.1 * min(lineposition, 1.0);
    vec3 p = position + normal * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
  }
`;

var fragmentShader = `
  varying vec3 vNormal;
  void main() {
    gl_FragColor = vec4(vNormal, 1.0);
  }
`;

AFRAME.registerBrush('tube',
  {
    init: function (color, brushSize) {
      this.idx = 0;
      this.geometry = new THREE.BufferGeometry();
      this.vertices = new Float32Array(this.options.maxPoints * 3 * SEGMENTS);
      this.normals = new Float32Array(this.options.maxPoints * 3 * SEGMENTS);
      this.linepositions = new Float32Array(this.options.maxPoints);
      this.linepositions.index = 0
      this.faces = new Uint32Array(3 * this.options.maxPoints * SEGMENTS * 2);
      this.geometry.setDrawRange(0, 0);
      this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));
      this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3).setDynamic(true));
      this.geometry.addAttribute('lineposition', new THREE.BufferAttribute(this.linepositions, 1).setDynamic(true));
      this.geometry.setIndex(new THREE.BufferAttribute(this.faces, 1))
      this.faceIndex = 0

      this.material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
      });

      var mesh = new THREE.Mesh(this.geometry, this.material);

      mesh.frustumCulled = false;
      mesh.vertices = this.vertices;

      this.object3D.add(mesh);
    },
    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
      var firstNormal
      var direction
      if (this.lastPosition) {
        direction = position.clone().sub(this.lastPosition)
        firstNormal = direction.clone().cross(up)
        firstNormal.cross(direction)
        firstNormal.normalize()
      } else {
        direction = new THREE.Vector3()
        firstNormal = new THREE.Vector3()
      }
      
      var brushSize = this.data.size * pressure;
      
      var start = this.data.numPoints * SEGMENTS
      for (var i = 0; i < SEGMENTS; i++) {
        var theta = TWO_PI * i / SEGMENTS
        var normal
        if (this.data.numPoints == 0) {
          normal = new THREE.Vector3(0, 0, 0)
        } else {
          normal = firstNormal.clone()
          normal.applyAxisAngle(direction, theta)
        }
        this.linepositions[this.linepositions.index++] = this.data.numPoints

        this.vertices[ this.idx ] = pointerPosition.x;
        this.normals[ this.idx ] = normal.x
        this.idx ++
        this.vertices[ this.idx ] = pointerPosition.y;
        this.normals[ this.idx ] = normal.y
        this.idx ++
        this.vertices[ this.idx ] = pointerPosition.z;
        this.normals[ this.idx ] = normal.z
        this.idx ++
        
        
        if (this.data.numPoints > 0) {
          this.faces [ this.faceIndex++ ] = start + i
          this.faces [ this.faceIndex++ ] = start + (i + 1) % SEGMENTS
          this.faces [ this.faceIndex++ ] = start + i - SEGMENTS
          
          this.faces [ this.faceIndex++ ] = start + (i + 1) % SEGMENTS
          this.faces [ this.faceIndex++ ] = start + i - SEGMENTS
          this.faces [ this.faceIndex++ ] = start + (i - SEGMENTS + 1) % SEGMENTS
        }
        
        
      }
      

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.normal.needsUpdate = true
      this.geometry.setDrawRange(0, this.data.numPoints * SEGMENTS * 6);
      
      this.lastPosition = pointerPosition.clone();
      return true;
    },

    tick: function(timeOffset, delta) {
      // this.material.uniforms.time.value = timeOffset;
    },
  },
  {thumbnail:'brushes/thumb_rainbow.png', maxPoints: 3000}
);

