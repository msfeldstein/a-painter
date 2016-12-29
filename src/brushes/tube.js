/* globals AFRAME THREE */
AFRAME.registerBrush('tube',
  {
    init: function (color, brushSize) {
      this.idx = 0;
      this.geometry = new THREE.BufferGeometry();
      this.vertices = new Float32Array(this.options.maxPoints * 3 * 3);
      this.uvs = new Float32Array(this.options.maxPoints * 2 * 2);
      this.linepositions = new Float32Array(this.options.maxPoints);

      this.geometry.setDrawRange(0, 0);
      this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));
      this.geometry.addAttribute('uv', new THREE.BufferAttribute(this.uvs, 2).setDynamic(true));
      this.geometry.addAttribute('lineposition', new THREE.BufferAttribute(this.linepositions, 1).setDynamic(true));

      this.material = material;
      var mesh = new THREE.Mesh(this.geometry, this.material);
      mesh.drawMode = THREE.TriangleStripDrawMode;

      mesh.frustumCulled = false;
      mesh.vertices = this.vertices;

      this.object3D.add(mesh);
    },
    addPoint: function (position, orientation, pointerPosition, pressure, timestamp) {
      var uv = 0;
      for (i = 0; i < this.data.numPoints; i++) {
        this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
        this.uvs[ uv++ ] = 0;

        this.uvs[ uv++ ] = i / (this.data.numPoints - 1);
        this.uvs[ uv++ ] = 1;
      }

      var direction = new THREE.Vector3();
      direction.set(1, 0, 0);
      direction.applyQuaternion(orientation);
      direction.normalize();

      var posA = pointerPosition.clone();
      var posB = pointerPosition.clone();
      var brushSize = this.data.size * pressure;
      posA.add(direction.clone().multiplyScalar(brushSize / 2));
      posB.add(direction.clone().multiplyScalar(-brushSize / 2));

      this.vertices[ this.idx++ ] = posA.x;
      this.vertices[ this.idx++ ] = posA.y;
      this.vertices[ this.idx++ ] = posA.z;

      this.vertices[ this.idx++ ] = posB.x;
      this.vertices[ this.idx++ ] = posB.y;
      this.vertices[ this.idx++ ] = posB.z;

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.uv.needsUpdate = true;

      this.geometry.setDrawRange(0, this.data.numPoints * 2);

      return true;
    },

    tick: function(timeOffset, delta) {
      this.material.uniforms.time.value = timeOffset;
    },
  },
  {thumbnail:'brushes/thumb_rainbow.png', maxPoints: 3000}
);

