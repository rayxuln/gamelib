/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/app.js":
/*!***********************!*\
  !*** ./src/js/app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _resources_texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resources/texture.js */ "./src/js/resources/texture.js");
/* harmony import */ var _core_input_manager_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/input_manager.js */ "./src/js/core/input_manager.js");
/* harmony import */ var _core_render_server_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/render_server.js */ "./src/js/core/render_server.js");
/* harmony import */ var _core_resource_server_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/resource_server.js */ "./src/js/core/resource_server.js");





class App {
  constructor(div_id) {
    this.lastFrameTimestamp = 0
    this.currentTimestamp = 0
    this.assets = {}
    this.mainCamera = null
    this.inputManager = new _core_input_manager_js__WEBPACK_IMPORTED_MODULE_1__["default"]()
    this.renderServer = new _core_render_server_js__WEBPACK_IMPORTED_MODULE_2__.RenderServer(div_id)
    this.resourceServer = new _core_resource_server_js__WEBPACK_IMPORTED_MODULE_3__.ResourceServer(this, [_core_resource_server_js__WEBPACK_IMPORTED_MODULE_3__.TextResourceLoader, _core_resource_server_js__WEBPACK_IMPORTED_MODULE_3__.TextureResouceLoader])
  }

  step(timestamp) {
    const delta = timestamp - this.lastFrameTimestamp
    this.currentTimestamp = timestamp

    this.vueUI.fps = Math.round(delta !== 0.0 ? 1000.0 / delta : -1)

    this.renderServer.update(delta)
    if (this.scene) {
      this.scene.update(delta)
    }
    this.inputManager.afterUpdate(delta)

    this.lastFrameTimestamp = timestamp

    window.requestAnimationFrame((timestamp) => {
      this.step(timestamp)
    })
  }

  input (event) {
    this.inputManager.input(event)
    this.scene.input(event)
  }

  run (scene) {
    this.renderServer.element.addEventListener('keydown', (e) => {this.input(e)})
    this.renderServer.element.addEventListener('keyup', (e) => {this.input(e)})
    this.renderServer.element.addEventListener('mousedown', (e) => {this.input(e)})
    this.renderServer.element.addEventListener('mousemove', (e) => {this.input(e)})
    this.renderServer.element.addEventListener('mouseup', (e) => {this.input(e)})
    this.renderServer.element.addEventListener('contextmenu', (e) => {e.preventDefault()})

    this.changeScene(scene)

    window.requestAnimationFrame((timestamp) => {
      this.step(timestamp)
    })
  }

  changeScene (newScene) {
    if (this.scene) {
      this.scene.exit()
    }
    this.scene = newScene
    this.scene.app = this
    if (newScene) {
      this.scene.enter()
    }
  }

  createResource (type, ...args) {
    return new type(this, ...args)
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./src/js/component/camera.js":
/*!************************************!*\
  !*** ./src/js/component/camera.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Camera": () => (/* binding */ Camera),
/* harmony export */   "PerspectiveCamera": () => (/* binding */ PerspectiveCamera)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform.js */ "./src/js/component/transform.js");



class Camera {
  get current () {
    if (!this.entity.app) return false
    return this.entity.app.mainCamera === this
  }
  set current (v) {
    if (this.current && !v)
      this.entity.app.mainCamera = null
    else
      this.makeCurrent()
  }

  constructor () {
    this.pMatrix = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create()
  }

  makeCurrent () {
    if (!this.entity.app) return
    this.entity.app.mainCamera = this
  }

  added () {
    this.transform = this.entity.getComponent(_transform_js__WEBPACK_IMPORTED_MODULE_1__["default"])
    if (!this.transform) {
      console.warn('no transform component found in a camera entity!')
      return
    }
  }
}

class PerspectiveCamera extends Camera {

  #fov = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.glMatrix.toRadian(75.0)
  #aspect = 1.0
  #far = 1000
  #near = 0.1
  #dirty = true

  get fov () {return this.#fov}
  set fov (v) {this.#fov=v;this.#dirty=true}
  get aspect () {return this.#aspect}
  set aspect (v) {this.#aspect=v;this.#dirty=true}
  get far () {return this.#far}
  set far (v) {this.#far=v;this.#dirty=true}
  get near () {return this.#near}
  set near (v) {this.#near=v;this.#dirty=true}

  constructor (options) {
    super()
    if (options)
    {
      this.#fov = options.fov ?? this.#fov
      this.#aspect = options.aspect ?? this.#aspect
      this.#far = options.far ?? this.#far
      this.#near = options.near ?? this.#near
      this.#dirty = true
    }
  }

  added () {
    super.added()
    this.syncPMatrix()
    if (!this.entity.app.mainCamera) {
      this.makeCurrent()
    }
  }

  preUpdate (delta) {
    const canvas = this.entity.app.renderServer.element
    const aspect = canvas.width / canvas.height
    if (aspect !== this.aspect) {
      this.aspect = aspect
    }
    if (this.#dirty) this.syncPMatrix()
  }

  syncPMatrix () {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.perspective(this.pMatrix, this.#fov, this.#aspect, this.#near, this.#far)
    this.#dirty = false
  }
}



/***/ }),

/***/ "./src/js/component/custom_animate_1.js":
/*!**********************************************!*\
  !*** ./src/js/component/custom_animate_1.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CustomAnimate1": () => (/* binding */ CustomAnimate1)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");


class CustomAnimate1 {
  scaling = 0.0

  constructor () {

  }

  added () {
    this.transform = this.entity.getComponent('Transform')
    if (!this.transform) {
      console.warn('No transform component found!')
      return
    }
  }

  update (delta) {
    this.scaling += 0.1
    const s = Math.max(Math.min(Math.sin(this.scaling) + 2.0, 1.5), 1.0)

    this.transform.scaling = [s, s, s]
    this.transform.rotate(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.glMatrix.toRadian(1), [0.0, 0.0, 1.0])
  }
}



/***/ }),

/***/ "./src/js/component/first_person_controller.js":
/*!*****************************************************!*\
  !*** ./src/js/component/first_person_controller.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ControlTrigger": () => (/* binding */ ControlTrigger),
/* harmony export */   "FirstPersonController": () => (/* binding */ FirstPersonController)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform.js */ "./src/js/component/transform.js");



class FirstPersonController {

  mouseSensitive = 1.0
  moveSpeed = 1.0
  xEulerLimitDegree = 80

  rotationEulerDegree = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()


  constructor () {

  }

  added () {
    this.transform = this.entity.getComponent(_transform_js__WEBPACK_IMPORTED_MODULE_1__["default"])
  }

  update (delta) {
    const input = this.entity.app.inputManager

    const moveVec = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    moveVec[0] = input.getActionStrength('move_right') - input.getActionStrength('move_left')
    moveVec[1] = input.getActionStrength('move_up') - input.getActionStrength('move_down')
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(moveVec, moveVec, 0.5)

    const basis = this.transform.basis
    // basis.z * moveVec[0] * moveSpeed + basis.x * moveVec[1] * moveSpeed
    const movementDelta = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    const movementDeltaX = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    const movementDeltaZ = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(movementDeltaX, basis.x, moveVec[0] * this.moveSpeed)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(movementDeltaZ, basis.z, moveVec[1] * this.moveSpeed * -1.0)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(movementDelta, movementDeltaX, movementDeltaZ)

    var origin = this.transform.globalOrigin
    this.transform.globalOrigin = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(origin, origin, movementDelta)

    let msg = `Camera: (${origin[0].toFixed(2)}, ${origin[1].toFixed(2)}, ${origin[2].toFixed(2)})`
    this.entity.app.vueUI.msg = msg
  }

  input (event) {
    const mouseSensitiveModifier = -0.5
    const clampDegree = (x) => {
      const ax = Math.abs(x)
      return Math.sign(x) * (ax - Math.floor(ax / 360.0) * 360.0)
    }

    if (event instanceof MouseEvent) {
      const rotationEulerDegree = this.transform.eulerRotationDegree
      rotationEulerDegree[1] += event.movementX * mouseSensitiveModifier * this.mouseSensitive
      rotationEulerDegree[0] += event.movementY * mouseSensitiveModifier * this.mouseSensitive

      const clamp = (v, min, max) => {
        if (v < min) return min
        if (v > max) return max
        return v
      }
      rotationEulerDegree[0] = clamp(rotationEulerDegree[0], -this.xEulerLimitDegree, this.xEulerLimitDegree)
      
      this.transform.eulerRotationDegree = rotationEulerDegree
    }
  }
}

class ControlTrigger {

  #controller = null

  set controller (c) {
    this.#controller = c
    if (c) c.activated = false
  }
  get controller () {
    return this.#controller
  }

  constructor () {
    
  }

  added () {

  }

  input (event) {
    if (!this.controller) return
    if (event instanceof MouseEvent) {
      if (event.button === 2) {
        if (event.type === 'mousedown') {
          this.controller.activated = true
          const element = this.entity.app.renderServer.element
          element.requestPointerLock()
        } else if (event.type === 'mouseup') {
          this.controller.activated = false
          document.exitPointerLock()
        }
      }
    }
  }
}



/***/ }),

/***/ "./src/js/component/mesh_renderer.js":
/*!*******************************************!*\
  !*** ./src/js/component/mesh_renderer.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform.js */ "./src/js/component/transform.js");



class MeshRenderer {

  mesh = null

  constructor () {
  }

  added () {
    this.transform = this.entity.getComponent(_transform_js__WEBPACK_IMPORTED_MODULE_1__["default"])
  }

  update (delta) {
    const transform = this.transform
    if (!transform) return
    const camera = this.entity.app.mainCamera
    if (!camera) return

    if (this.mesh.valid) {
      const gl = this.entity.app.renderServer.gl
      const shader = this.mesh.shader
      if (!gl) throw new Error('Invalid gl!')
      
      const pMatrix = camera.pMatrix
      const vMatrix = camera.transform.globalMatrix
      const mMatrix = transform.globalMatrix

      // const norMatrix = mat3.create()
      // mat3.normalFromMat4(norMatrix, mvMatrix)
      
      shader.use()

      shader.uploadParameter('pMatrix', pMatrix)
      shader.uploadParameter('vMatrix', vMatrix)
      shader.uploadParameter('umMatrix', mMatrix)
      shader.uploadParameter('enableBillboard', 0, true)
      shader.uploadParameter('enableInstanceDraw', 0, true)
      shader.uploadParameter('enableVertColor', 0, true)
      shader.uploadParameter('uvScale', [1, 1])

      shader.setParametersToGL(gl)
      
      gl.enable(gl.DEPTH_TEST)

      gl.bindVertexArray(this.mesh.glVao)
      gl.drawArrays(gl.TRIANGLES, 0, this.mesh.vertexCount)
      // gl.drawArrays(gl.LINES, 0, this.mesh.vertexCount)
      gl.bindVertexArray(null)
    }
  }

  removed () {
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MeshRenderer);

/***/ }),

/***/ "./src/js/component/particle_emitter.js":
/*!**********************************************!*\
  !*** ./src/js/component/particle_emitter.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParticleEmitShape": () => (/* binding */ ParticleEmitShape),
/* harmony export */   "ParticleEmitShapeBox": () => (/* binding */ ParticleEmitShapeBox),
/* harmony export */   "ParticleEmitShapeCylinder": () => (/* binding */ ParticleEmitShapeCylinder),
/* harmony export */   "ParticleEmitShapePoint": () => (/* binding */ ParticleEmitShapePoint),
/* harmony export */   "ParticleEmitShapeShpere": () => (/* binding */ ParticleEmitShapeShpere),
/* harmony export */   "ParticleEmitter": () => (/* binding */ ParticleEmitter),
/* harmony export */   "ParticleParam": () => (/* binding */ ParticleParam),
/* harmony export */   "ParticleParamColor": () => (/* binding */ ParticleParamColor),
/* harmony export */   "ParticleParamNumber": () => (/* binding */ ParticleParamNumber)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _transform_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _core_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/utils.js */ "./src/js/core/utils.js");
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/color/color.js */ "./src/js/lib/color/color.js");
/* harmony import */ var _core_signal_slot_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/signal_slot.js */ "./src/js/core/signal_slot.js");






class ParticleEmitShape {

  param = {
    
  }

  constructor (options) {
    if (options) {
      for (k in this.param) {
        this.param[k] = options[k] ?? this.param[k]
      }
    }
  }

  getInitPosition () {
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
  }
}

class ParticleEmitShapePoint extends ParticleEmitShape {
  constructor (options) {
    super(options)
  }
}

class ParticleEmitShapeBox extends ParticleEmitShape {
  constructor (w, h, l) {
    super()
    this.param.w = w
    this.param.h = h
    this.param.l = l
  }

  getInitPosition () {
    let w = this.param.w
    let h = this.param.h
    let l = this.param.l

    let x = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-w, w)
    let y = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-h, h)
    let z = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-l, l)

    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(x, y, z)
  }
}

class ParticleEmitShapeShpere extends ParticleEmitShape {
  constructor (ir, or) {
    super()
    if (!or) {
      or = ir
      ir = 0
    }
    this.param.ir = ir
    this.param.or = or
  }

  getInitPosition () {
    let r = this.param.or - this.param.ir
    let l = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-r, r)
    l += this.param.ir * Math.sign(l)

    const d = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(_core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-1, 1), _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-1, 1), _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-1, 1))
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(d, d)
    
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d, d, l)
  }
}

class ParticleEmitShapeCylinder extends ParticleEmitShape {
  constructor (ir, or, h) {
    super()
    if (!or) {
      or = ir
      ir = 0
    }
    this.param.ir = ir
    this.param.or = or
    this.param.h = h ?? 0
  }

  getInitPosition () {
    const h = this.param.h
    let r = this.param.or - this.param.ir
    let l = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-r, r)
    l += this.param.ir * Math.sign(l)

    const d = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(_core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-1, 1), 0, _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-1, 1))
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(d, d)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d, d, l)
    d[1] = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-h, h)
    
    return d
  }
}

class ParticleParam {

  param = {
    min: 0,
    max: 0,
    variantFunction:  null, // (t) => 1,
  }
  

  constructor (options) {
    if (options) {
      for (let k in this.param) {
        this.param[k] = options[k] ?? this.param[k]
      }
    }
  }

  getInitialValue () {
    return null
  }

  getVariantValue (t) {
    if (this.param.variantFunction === null) return 1
    return this.param.variantFunction(t)
  }
}

class ParticleParamNumber extends ParticleParam {

  constructor (options) {
    super(options)
  }

  getInitialValue () {
    return _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(this.param.min, this.param.max)
  }
}

class ParticleParamInteger extends ParticleParamNumber {
  constructor (options) {
    super(options)
  }

  getInitialValue () {
    return Math.floor(super.getInitialValue())
  }

  getVariantValue(t) {
    return Math.floor(super.getVariantValue(t))
  }
}

// color is an array contains 4 (or 3) float elements
class ParticleParamColor extends ParticleParam {

  constructor (options) {
    super(options)
  }

  getInitialValue () {
    const res = []
    for (let i=0; i<Math.min(this.param.max.length, this.param.min.length); ++i) {
      res[i] = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(this.param.min[i], this.param.max[i])
    }
    if (res.length === 3) {
      res[3] = 1
    }
    return res
  }

  getVariantValue (t) {
    if (this.param.variantFunction === null) return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.fromValues(1, 1, 1, 1)
    return this.param.variantFunction(t)
  }
}

class ParticleData {

  index = -1

  transform = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create()
  noneScaleTrasnform = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create()
  velocity = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
  age = 0
  restart = false
  color = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.fromValues(1, 1, 1, 1)
  animationFrame = 0

  init = {
    direction: _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(),
    linearAcceleration: 0,
    radialAcceleration: 0,
    tangentialAcceleration: 0,
    damping: 0,
    scale: 1,
    color: _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.toRGBA(_lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.white),
    angle: 0,
    angularVelocity: 0,
    orbitalVelocity: 0,
    randomAnimationFrame: 0,
  }

  constructor() {

  }

  calcAnimationFrame (life, fps) {
    const mspf = (1000 / fps)
    const frame = Math.floor((life - this.age) / mspf)
    return frame ?? 0
  }

  calcUVOffset (frame, hFrame, vFrame) {
    if (!hFrame) hFrame = 1
    if (!vFrame) vFrame = 1
    const column = frame % hFrame
    const row = Math.floor(frame / vFrame)
    return [column/hFrame, row/vFrame]
  }
}

// time unit: msec
// rotation unit: degrees
class ParticleEmitter {

  signals = {
    emissionEnd: new _core_signal_slot_js__WEBPACK_IMPORTED_MODULE_4__.SignalSlot()
  }

  particleRenderer = null

  param = {
    count: 8,
    life: 1000, // msec
    explosive: 0, // 0~1
    localCoords: false,
    oneShot: false,
  }

  particleParam = {
    direction: _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(0, 0, 0),
    spread: 0, // 0 ~ 180 degrees
    gravity: _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(0, -9.8, 0),
    lifeRandomness: 0, // 0 ~ 1
    emitShape: new ParticleEmitShapePoint(),

    angle: new ParticleParamNumber({min: 0, max: 0}),
    angleAxis: 'z',

    orbitalVelocity: new ParticleParamNumber({min: 0, max: 0}),
    linearVelocity: new ParticleParamNumber({min: 0, max: 0}),
    angularVelocity: new ParticleParamNumber({min: 0, max: 0}),
    linearAcceleration: new ParticleParamNumber({min: 0, max: 0}),
    radialAcceleration: new ParticleParamNumber({min: 0, max: 0}),
    tangentialAcceleration: new ParticleParamNumber({min: 0, max: 0}),
    
    damping: new ParticleParamNumber({min: 0, max: 0}), // 0 ~ 1
    scale: new ParticleParamNumber({min: 1, max: 1}),
    color: new ParticleParamColor({min: _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.toRGBA(_lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.white), max: _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.toRGBA(_lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.white)}),

    animationHFrames: 0,
    animationVFrames: 0,
    animationFPS: 15,
    randomAnimationFrame: new ParticleParamInteger({min: 0, max: 0}),
    enableRandomAnimationFrame: false,
  }

  runtime = {
    emitting: false,
    emitTime: 0, // msec
    emitCount: 0,
    newStart: false,
    mspf: 0,
    particlePool: [],
    instancesData: [],
  }

  constructor () {
    
  }

  startEmission (reset=false) {
    this.runtime.emitting = true
    this.runtime.emitTime = 0
    this.runtime.newStart = true

    if (reset) {
      this.runtime.particlePool = []
      this.runtime.instancesData = []
      for (let i=0; i<this.param.count; ++i) {
        this.runtime.particlePool.push(new ParticleData())
      }
    }
  }

  stopEmission () {
    this.runtime.emitting = false
  }

  syncParticleCount () {
    if (!this.runtime.emitting)
      return
    if (this.param.count != this.runtime.particlePool.length) {
      if (this.runtime.particlePool.length < this.param.count) {
        const old = this.runtime.particlePool
        this.runtime.particlePool = []
        for (let i=0; i<this.param.count; ++i) {
          if (i < old.length) this.runtime.particlePool[i] = old[i]
          else this.runtime.particlePool[i] = new ParticleData()
        }
      } else {
        let shouldReduce = true
        for (let i=this.param.count; i<this.runtime.particlePool.length; ++i) {
          if (this.runtime.particlePool[i].age > 0) {
            shouldReduce = false
            break
          }
        }
        if (shouldReduce) {
          const old = this.runtime.particlePool
          this.runtime.particlePool = []
          for (let i=0; i<this.param.count; ++i) {
            this.runtime.particlePool[i] = old[i]
          }
          this.runtime.instancesData = []
        }
      }
    }
  }

  reviveParticles (mspf) {
    if (!this.runtime.emitting)
      return
    if (this.runtime.emitTime > this.param.life || this.runtime.newStart) {
      this.runtime.emitTime = 0
      this.runtime.newStart = false
    } else {
      this.runtime.emitTime += mspf
    }
    if (this.runtime.emitTime <= (1-this.param.explosive) * this.param.life) {
      let emitDuration = this.param.life * (1 - this.param.explosive)
      let emitPerFrame = this.param.count
      if (emitDuration !== 0) {
        emitPerFrame = this.param.count / emitDuration * mspf
      }
      let availableCount = 0
      for (let data of this.runtime.particlePool) {
        if (data.age - mspf <= 0) availableCount += 1
      }
      this.runtime.emitCount += emitPerFrame
      this.runtime.emitCount = Math.min(availableCount, this.runtime.emitCount)
      
      for (let i=0; i<this.param.count; ++i) {
        const data = this.runtime.particlePool[i]
        if (data.age - mspf <= 0) {
          if (this.runtime.emitCount >= 1) {
            data.restart = true
            data.age = 0
            this.runtime.emitCount -= 1
          }
        }
      }

    }
  }

  updateParticleData (data, delta) {
    const emitterMatrix = this.param.localCoords ? _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create() : this.transform.globalMatrix
    const emitterPos = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(emitterMatrix[12], emitterMatrix[13], emitterMatrix[14])
    const emitterUp = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(emitterMatrix[4], emitterMatrix[5], emitterMatrix[6])
    const particleMatrix = data.transform
    const noneScaleTrasnform = data.noneScaleTrasnform
    if (data.age <= 0) { // Restart
      if (data.restart) {
        data.age = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].weightedRandom(this.param.life, this.particleParam.lifeRandomness)
        data.restart = false
        
        // calc position
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.identity(noneScaleTrasnform)
        const pos = this.particleParam.emitShape.getInitPosition()
        noneScaleTrasnform[12] = pos[0]
        noneScaleTrasnform[13] = pos[1]
        noneScaleTrasnform[14] = pos[2]

        // calc angle
        data.init.angle = this.particleParam.angle.getInitialValue()
        switch (this.particleParam.angleAxis) {
          case 'x':
            _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateX(noneScaleTrasnform, noneScaleTrasnform, _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(data.init.angle))
            break
          case 'y':
            _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateY(noneScaleTrasnform, noneScaleTrasnform, _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(data.init.angle))
            break
          case 'z':
          default:
            _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateZ(noneScaleTrasnform, noneScaleTrasnform, _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(data.init.angle))
            break
        }

        // calc angular velocity
        data.init.angularVelocity = this.particleParam.angularVelocity.getInitialValue()

        // calc direction
        let d = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.copy(data.init.direction, this.particleParam.direction)
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.rotateX(d, d, [0, 0, 0], _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(_core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-this.particleParam.spread, this.particleParam.spread)))
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.rotateY(d, d, [0, 0, 0], _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(_core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-this.particleParam.spread, this.particleParam.spread)))
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.rotateZ(d, d, [0, 0, 0], _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(_core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].randomRange(-this.particleParam.spread, this.particleParam.spread)))
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(d, d)

        // calc linear velocity
        let v = this.particleParam.linearVelocity.getInitialValue()
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(data.velocity, d, v)

        // calc accelerations
        data.init.linearAcceleration = this.particleParam.linearAcceleration.getInitialValue()
        data.init.radialAcceleration = this.particleParam.radialAcceleration.getInitialValue()
        data.init.tangentialAcceleration = this.particleParam.tangentialAcceleration.getInitialValue()

        // calc orbital velocity
        data.init.orbitalVelocity = this.particleParam.orbitalVelocity.getInitialValue()

        // calc damping
        data.init.damping = this.particleParam.damping.getInitialValue()
        
        // transform
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(noneScaleTrasnform, emitterMatrix, noneScaleTrasnform)
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.copy(particleMatrix, noneScaleTrasnform)

        // calc scaling
        const scaleVar = this.particleParam.scale.getVariantValue(0)
        data.init.scale = this.particleParam.scale.getInitialValue()
        const scale = data.init.scale * scaleVar
        _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].mat4SetScaling(particleMatrix, particleMatrix, [scale, scale, scale])
        
        // calc color
        const colorVar = this.particleParam.color.getVariantValue(0)
        data.init.color = this.particleParam.color.getInitialValue()
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.copy(data.color, data.init.color)
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.mul(data.color, data.color, colorVar)

        // calc random animation frame
        data.init.randomAnimationFrame = this.particleParam.randomAnimationFrame.getInitialValue()
      }
    } else { // Update
      data.age -= delta

      const dt = delta / 1000
      let t = 1 - (data.age / this.param.life)
      if (Number.isNaN(t)) t = 0
      if (t > 1) t = 1

      const pos = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(noneScaleTrasnform[12], noneScaleTrasnform[13], noneScaleTrasnform[14])

      // apply angular velocity
      const avVar = this.particleParam.angularVelocity.getVariantValue(t)
      const av = data.init.angularVelocity * avVar
      const angle = _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].deg2rad(av * dt)
      switch (this.particleParam.angleAxis) {
        case 'x':
          _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateX(noneScaleTrasnform, noneScaleTrasnform, angle)
          break
        case 'y':
          _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateY(noneScaleTrasnform, noneScaleTrasnform, angle)
          break
        case 'z':
        default:
          _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateZ(noneScaleTrasnform, noneScaleTrasnform, angle)
          break
      }
    
      // apply gravity
      // v = v + g * dt
      const v = data.velocity
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v, v, _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), this.particleParam.gravity, dt))

      // apply linear acceleration
      // v = v + a * dt
      const a = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.clone(data.init.direction)
      const linearAccelerationVar = this.particleParam.linearAcceleration.getVariantValue(t)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(a, a, data.init.linearAcceleration * linearAccelerationVar)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v, v, _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(a, a, dt))

      // apply radial acceleration
      const radialDirection = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.sub(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), pos, emitterPos)
      const radius = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.length(radialDirection)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(radialDirection, radialDirection)
      const radialAccelerationVar = this.particleParam.radialAcceleration.getVariantValue(t)
      const radialAcceleration = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), radialDirection, data.init.radialAcceleration*dt*radialAccelerationVar)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v, v, radialAcceleration)
      
      // apply tangential acceleration
      const tangentialDirection = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), emitterUp, radialDirection)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(tangentialDirection, tangentialDirection)
      const tangentialAccelerationVar = this.particleParam.tangentialAcceleration.getVariantValue(t)
      const tangentialAcceleration = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), tangentialDirection, data.init.tangentialAcceleration*dt*tangentialAccelerationVar)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v, v, tangentialAcceleration)


      // apply damping
      const dampingVar = this.particleParam.damping.getVariantValue(t)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.lerp(v, v, [0, 0, 0], data.init.damping * dampingVar)
  
      // update position
      // x = x + v * dt
      const transform = noneScaleTrasnform
      transform[12] += v[0] * dt
      transform[13] += v[1] * dt
      transform[14] += v[2] * dt

      // apply orbital velocity
      if (radius > 0) {
        const orbitalVelocityVar = this.particleParam.orbitalVelocity.getVariantValue(t)
        const orbitalV = data.init.orbitalVelocity * orbitalVelocityVar
        const emitterPos = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(emitterMatrix[12], emitterMatrix[13], emitterMatrix[14])
        const pos = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.fromValues(transform[12], transform[13], transform[14])
        _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.rotateY(pos, pos, emitterPos, orbitalV * dt)
        transform[12] = pos[0]
        transform[13] = pos[1]
        transform[14] = pos[2]
      }

      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.copy(particleMatrix, noneScaleTrasnform)

      // update scaling
      const scaleVar = this.particleParam.scale.getVariantValue(t)
      const scale = data.init.scale * scaleVar
      _core_utils_js__WEBPACK_IMPORTED_MODULE_2__["default"].mat4SetScaling(particleMatrix, particleMatrix, [scale, scale, scale])

      // update color
      const colorVar = this.particleParam.color.getVariantValue(t)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.copy(data.color, data.init.color)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec4.mul(data.color, data.color, colorVar)
    }
  }

  updateParticles (delta) {
    let index = 0
    for (let data of this.runtime.particlePool) {
      data.index = index++
      this.updateParticleData(data, delta)
    }
  }

  // instancesData = [transform: mat4, color: uint32]
  renderParticles () {
    if (this.particleRenderer === null) return
    const uvScale = [1, 1]
    const hFrame = this.particleParam.animationHFrames
    const vFrame = this.particleParam.animationVFrames
    if (hFrame > 0) uvScale[0] = 1 / hFrame
    if (vFrame > 0) uvScale[1] = 1 / vFrame

    const instancesData = this.runtime.instancesData
    let instanceCount = 0
    for (let data of this.runtime.particlePool) {
      if (data.age > 0) {
        let mMatrix = data.transform
        if (this.param.localCoords) {
          mMatrix = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.clone(data.transform)
          _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(mMatrix, this.transform.globalMatrix, mMatrix)
        }
        const transformLen = mMatrix.length // 4*4 in 4 bytes
        const transformOffset = 0
        const colorLen = 4 // rgba
        const colorOffset = transformLen
        const uvOffsetLen = 2 // uv
        const uvOffsetOffset = colorOffset + colorLen
        const stride = transformLen + colorLen + uvOffsetLen
        for (let i=0; i<transformLen; ++i) {
          instancesData[instanceCount*stride+transformOffset+i] = mMatrix[i]
        }
        for (let i=0; i<colorLen; ++i) {
          instancesData[instanceCount*stride+colorOffset+i] = data.color[i]
        }
        let frame = 0
        if (this.particleParam.enableRandomAnimationFrame) {
          frame = data.init.randomAnimationFrame
        } else {
          frame = data.calcAnimationFrame(this.param.life, this.particleParam.animationFPS)
        }
        const uvOffset = data.calcUVOffset(frame, hFrame, vFrame)
        instancesData[instanceCount*stride+uvOffsetOffset+0] = uvOffset[0]
        instancesData[instanceCount*stride+uvOffsetOffset+1] = uvOffset[1]
        instanceCount += 1
      }
    }
    this.particleRenderer.renderParticles(this.runtime.particlePool.length, instancesData, instanceCount, uvScale)
  }

  added () {
    this.transform = this.entity.getComponent(_transform_js__WEBPACK_IMPORTED_MODULE_1__["default"])
  }

  update (delta) {
    if (this.param.oneShot && this.runtime.emitting && this.runtime.emitTime > this.param.life) {
      this.stopEmission()
      this.signals.emissionEnd.emit()
    }

    this.syncParticleCount()
    this.reviveParticles(delta)
    this.updateParticles(delta)
    this.renderParticles()
  }

}



/***/ }),

/***/ "./src/js/component/particle_emitter_controller.js":
/*!*********************************************************!*\
  !*** ./src/js/component/particle_emitter_controller.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParticleEmitterController1": () => (/* binding */ ParticleEmitterController1)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./particle_emitter.js */ "./src/js/component/particle_emitter.js");



const EMIT_SHAPE = {
  POINT: 0,
  SPHERE: 1,
  BOX: 2,
  CYLINDER: 3,
}

class ParticleEmitterController1 {

  currentEmitShape = null
  emitShapes = []

  constructor () {

  }

  added () {
    this.particleEmitter = this.entity.getComponent(_particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__.ParticleEmitter)
    if (!this.particleEmitter) {
      console.warn('Unable to find a valid particle emitter!')
    }

    this.emitShapes[EMIT_SHAPE.POINT] = new _particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__.ParticleEmitShapePoint()
    this.emitShapes[EMIT_SHAPE.BOX] = new _particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__.ParticleEmitShapeBox(0, 0, 0)
    this.emitShapes[EMIT_SHAPE.SPHERE] = new _particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__.ParticleEmitShapeShpere(0, 0)
    this.emitShapes[EMIT_SHAPE.CYLINDER] =new _particle_emitter_js__WEBPACK_IMPORTED_MODULE_1__.ParticleEmitShapeCylinder(0, 0, 0)
  }

  update (delta) {
    if (!this.particleEmitter) return

    const app = this.entity.app
    const vueUI = app.vueUI
    if (app.inputManager.isActionJustPressed('interact')) {
      if (this.particleEmitter.runtime.emitting) {
        this.particleEmitter.stopEmission()
      } else {
        this.particleEmitter.startEmission()
      }
    }

    this.particleEmitter.param.explosive = vueUI.ps.explosive
    this.particleEmitter.param.life = vueUI.ps.life * 1000
    this.particleEmitter.particleParam.lifeRandomness = vueUI.ps.lifeRandomness

    this.particleEmitter.particleParam.emitShape = this.emitShapes[vueUI.ps.emitShape.value] ?? this.particleEmitter.particleParam.emitShape
    this.emitShapes[EMIT_SHAPE.SPHERE].param.ir = vueUI.ps.emitShape.sphere[0]
    this.emitShapes[EMIT_SHAPE.SPHERE].param.or = vueUI.ps.emitShape.sphere[1]
    this.emitShapes[EMIT_SHAPE.BOX].param.w = vueUI.ps.emitShape.box.w
    this.emitShapes[EMIT_SHAPE.BOX].param.h = vueUI.ps.emitShape.box.h
    this.emitShapes[EMIT_SHAPE.BOX].param.l = vueUI.ps.emitShape.box.l
    this.emitShapes[EMIT_SHAPE.CYLINDER].param.ir = vueUI.ps.emitShape.cylinder.r[0]
    this.emitShapes[EMIT_SHAPE.CYLINDER].param.or = vueUI.ps.emitShape.cylinder.r[1]
    this.emitShapes[EMIT_SHAPE.CYLINDER].param.h = vueUI.ps.emitShape.cylinder.h
    
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.copy(this.particleEmitter.particleParam.direction, vueUI.ps.direction)
    this.particleEmitter.particleParam.spread = vueUI.ps.spread
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.copy(this.particleEmitter.particleParam.gravity, vueUI.ps.gravity)

    this.particleEmitter.particleParam.color.param.min = vueUI.ps.color[0]
    this.particleEmitter.particleParam.color.param.max = vueUI.ps.color[1]
    this.particleEmitter.particleParam.color.param.variantFunction = vueUI.ps.colorVariantFunction.enable ? vueUI.ps.colorVariantFunction.func : null

    this.particleEmitter.particleParam.scale.param.min = vueUI.ps.scale[0]
    this.particleEmitter.particleParam.scale.param.max = vueUI.ps.scale[1]
    this.particleEmitter.particleParam.scale.param.variantFunction = vueUI.ps.scaleVariantFunction.enable ? vueUI.ps.scaleVariantFunction.func : null
    
    this.particleEmitter.particleParam.angle.param.min = vueUI.ps.angle[0]
    this.particleEmitter.particleParam.angle.param.max = vueUI.ps.angle[1]

    this.particleEmitter.particleParam.damping.param.min = vueUI.ps.damping[0]
    this.particleEmitter.particleParam.damping.param.max = vueUI.ps.damping[1]
    this.particleEmitter.particleParam.damping.param.variantFunction = vueUI.ps.dampingVariantFunction.enable ? vueUI.ps.dampingVariantFunction.func : null

    this.particleEmitter.particleParam.linearVelocity.param.min = vueUI.ps.linearVelocity[0]
    this.particleEmitter.particleParam.linearVelocity.param.max = vueUI.ps.linearVelocity[1]

    this.particleEmitter.particleParam.angularVelocity.param.min = vueUI.ps.angularVelocity[0]
    this.particleEmitter.particleParam.angularVelocity.param.max = vueUI.ps.angularVelocity[1]
    this.particleEmitter.particleParam.angularVelocity.param.variantFunction = vueUI.ps.angularVelocityVariantFunction.enable ? vueUI.ps.angularVelocityVariantFunction.func : null

    this.particleEmitter.particleParam.linearAcceleration.param.min = vueUI.ps.linearAcceleration[0]
    this.particleEmitter.particleParam.linearAcceleration.param.max = vueUI.ps.linearAcceleration[1]
    this.particleEmitter.particleParam.linearAcceleration.param.variantFunction = vueUI.ps.linearAccelerationVariantFunction.enable ? vueUI.ps.linearAccelerationVariantFunction.func : null

    this.particleEmitter.particleParam.radialAcceleration.param.min = vueUI.ps.radialAcceleration[0]
    this.particleEmitter.particleParam.radialAcceleration.param.max = vueUI.ps.radialAcceleration[1]
    this.particleEmitter.particleParam.radialAcceleration.param.variantFunction = vueUI.ps.radialAccelerationVariantFunction.enable ? vueUI.ps.radialAccelerationVariantFunction.func : null

    this.particleEmitter.particleParam.tangentialAcceleration.param.min = vueUI.ps.tangentialAcceleration[0]
    this.particleEmitter.particleParam.tangentialAcceleration.param.max = vueUI.ps.tangentialAcceleration[1]
    this.particleEmitter.particleParam.tangentialAcceleration.param.variantFunction = vueUI.ps.tangentialAccelerationVariantFunction.enable ? vueUI.ps.tangentialAccelerationVariantFunction.func : null

    this.particleEmitter.particleParam.orbitalVelocity.param.min = vueUI.ps.orbitalVelocity[0]
    this.particleEmitter.particleParam.orbitalVelocity.param.max = vueUI.ps.orbitalVelocity[1]
    this.particleEmitter.particleParam.orbitalVelocity.param.variantFunction = vueUI.ps.orbitalVelocityVariantFunction.enable ? vueUI.ps.orbitalVelocityVariantFunction.func : null

    if (vueUI.ps.count !== this.particleEmitter.param.count) {
      this.particleEmitter.param.count = vueUI.ps.count
    }

  }
}



/***/ }),

/***/ "./src/js/component/particle_renderer.js":
/*!***********************************************!*\
  !*** ./src/js/component/particle_renderer.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParticleRenderer": () => (/* binding */ ParticleRenderer),
/* harmony export */   "TextureParticleRenderer": () => (/* binding */ TextureParticleRenderer)
/* harmony export */ });
/* harmony import */ var _resources_mesh_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../resources/mesh.js */ "./src/js/resources/mesh.js");
/* harmony import */ var _resources_shader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../resources/shader.js */ "./src/js/resources/shader.js");
/* harmony import */ var _resources_particle_mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../resources/particle_mesh.js */ "./src/js/resources/particle_mesh.js");




const BLEND_MODE = {
  MIX: 0,
  ADD: 1,
  MUL: 2,
}

class ParticleRenderer {

  mesh = null
  particleMesh = null

  _params = {
    blendMode: BLEND_MODE.MIX,
    enableBillboard: false,
  }

  constructor (mesh, params) {

    if (params) {
      for (let k in this._params) {
        this._params[k] = params[k] ?? this._params[k]
      }
    }

    this.mesh = mesh
  }

  renderParticles (count, instancesData, instanceCount, uvScale) {
    if (this.mesh === null) return
    if (this.particleMesh === null || this.particleMesh.bufferSize !== count) {
      this.particleMesh = this.entity.app.createResource(_resources_particle_mesh_js__WEBPACK_IMPORTED_MODULE_2__.ParticleMesh, this.mesh, count)
    }

    const mesh = this.mesh
    const camera = this.entity.app.mainCamera
    const gl = this.entity.app.renderServer.gl
    if (!camera) return
    if (!gl) throw new Error('Invalid gl!')

    if (this.particleMesh.isValid()) {
      const shader = mesh.shader

      const pMatrix = camera.pMatrix
      const vMatrix = camera.transform.globalMatrix

      shader.use()

      shader.uploadParameter('pMatrix', pMatrix)
      shader.uploadParameter('vMatrix', vMatrix)
      shader.uploadParameter('enableBillboard', this._params.enableBillboard ? 1 : 0, true)
      shader.uploadParameter('enableInstanceDraw', 1, true)
      shader.uploadParameter('enableVertColor', 1, true)
      shader.uploadParameter('uvScale', uvScale)

      shader.setParametersToGL()
      
      gl.depthMask(false)
      gl.enable(gl.BLEND)
      switch(this._params.blendMode) {
        case BLEND_MODE.MIX:
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
          break
        case BLEND_MODE.ADD:
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD)
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ZERO, gl.ONE)
          break
        case BLEND_MODE.MUL:
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD)
          gl.blendFuncSeparate(gl.DST_COLOR, gl.ZERO, gl.ZERO, gl.ONE)
          break
      }

      this.particleMesh.updateInstanceData(instancesData)
      gl.bindVertexArray(this.particleMesh.glVao)
      gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.vertexCount, instanceCount)
      gl.bindVertexArray(null)
      gl.disable(gl.BLEND)
      gl.depthMask(true)
    }
  }
}



class TextureParticleRenderer extends ParticleRenderer {
  constructor (params) {
    super(null, params)
    this._params.texture = null
    if (params) {
      for (let k in this._params) {
        this._params[k] = params[k] ?? this._params[k]
      }
    }
  }

  get texture() {
    return this._params.texture
  }

  set texture(v) {
    this._params.texture = v
  }

  async aysncAdded () {
    const app = this.entity.app
    const resourceServer = app.resourceServer
    const mesh = app.createResource(_resources_mesh_js__WEBPACK_IMPORTED_MODULE_0__.QuadMesh)
    mesh.shader = app.createResource(_resources_shader_js__WEBPACK_IMPORTED_MODULE_1__.SimpleMeshShader,
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.vs'),
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.fs')
      )
    mesh.shader.parameters.cullMode = _resources_shader_js__WEBPACK_IMPORTED_MODULE_1__.SimpleMeshShader.CULL_MODE.BACK
    this.mesh = mesh
  }

  added () {
    this.aysncAdded().then()
  }

  renderParticles (count, instancesData, instanceCount, uvScale) {
    super.renderParticles(count, instancesData, instanceCount, uvScale)
    if (this.mesh === null) return
    const shader = this.mesh.shader
    shader.parameters.tex1 = this._params.texture
  }
}

ParticleRenderer.BLEND_MODE = BLEND_MODE



/***/ }),

/***/ "./src/js/component/transform.js":
/*!***************************************!*\
  !*** ./src/js/component/transform.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");


class Transform {

  matrix
  eulerDegrees = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create() // in degrees

  parent = null
  children = []

  #dirty = {
    eulerDegrees: false,
    matrix: true,
  }

  #chache = {
    globalMatrix: _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create(),
  }

  constructor () {
    this.matrix = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.identity(this.matrix)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(this.eulerDegrees, 0, 0, 0)
  }

  addChild(trans) {
    const childGlobalMatrix = trans.globalMatrix
    
    this.children.push(trans)
    trans.parent = this
    trans.globalMatrix = childGlobalMatrix
  }

  removeChild(trans) {
    const i = this.children.indexOf(trans)
    if (i >= 0) {
      this.children = this.children.slice(i, 1)
      const childGlobalMatrix = trans.globalMatrix
      trans.parent = null
      trans.globalMatrix = childGlobalMatrix
    }
  }

  get childCount () {
    return this.children.length
  }

  beenQueueDestroy () {
    for (let c of this.children) {
      c.entity.queueDestroy()
    }
  }

  translate(v) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.translate(this.matrix, this.matrix, v)
    this.#dirty.matrix = true
  }

  rotate (rad, axis) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotate(this.matrix, this.matrix, rad, axis)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }
  rotateX (rad) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateX(this.matrix, this.matrix, rad)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }
  rotateY (rad) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateY(this.matrix, this.matrix, rad)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }
  rotateZ (rad) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.rotateZ(this.matrix, this.matrix, rad)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }

  scale (v) {
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.scale(this.matrix, this.matrix, v)
    this.#dirty.matrix = true
  }

  asignMatrix (m) {
    const sameRotation = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.equals(
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getRotation(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.create(), this.matrix),
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getRotation(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.create(), m)
      )
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.copy(this.matrix, m)
    this.#dirty.eulerDegrees = !sameRotation
    this.#dirty.matrix = true
  }

  get globalMatrix () {
    let dirty = this.#dirty.matrix
    if (!dirty) {
      let p = this.parent
      while (p!==null) {
        if (p.#dirty.matrix) {
          dirty = true
          break
        }
        p = p.parent
      }
    }
    if (dirty) {
      if (this.parent === null) return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.clone(this.matrix)
      const p = this.parent.globalMatrix
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(this.#chache.globalMatrix, p, this.matrix)
      this.#dirty.matrix = false
    }
    return this.#chache.globalMatrix
  }
  set globalMatrix (m) {
    if (this.parent === null) {
      this.asignMatrix(m)
      return
    }
    const p = this.parent.globalMatrix
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.invert(p, p)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(m, p, m)
    this.asignMatrix(m)
  }

  _getBasis (m) {
    const x = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    const y = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    const z = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(x, m[0], m[1], m[2])
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(y, m[4], m[5], m[6])
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(z, m[8], m[9], m[10])

    return {x, y, z}
  }
  _setBasis (out, b) {
    const m = out

    m[0] = b.x[0]
    m[1] = b.x[1]
    m[2] = b.x[2]
    m[4] = b.y[0]
    m[5] = b.y[1]
    m[6] = b.y[2]
    m[8] = b.z[0]
    m[9] = b.z[1]
    m[10] = b.z[2]
  }

  get basis () {
    return this._getBasis(this.matrix)
  }
  set basis (b) {
    this._setBasis(this.matrix)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }

  get globalBasis () {
    return this._getBasis(this.globalMatrix)
  }
  set globalBasis (b) {
    const m = this.globalMatrix
    this._setBasis(m, b)
    this.globalMatrix = m
  }

  _getOrigin (m) {
    const p = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(p, m[12], m[13], m[14])
    return p
  }
  _setOrigin (m, p) {
    m[12] = p[0]
    m[13] = p[1]
    m[14] = p[2]
  }

  get origin () {
    return this._getOrigin(this.matrix)
  }
  set origin (p) {
    this._setOrigin(this.matrix, p)
    this.#dirty.matrix = true
  }

  get globalOrigin () {
    return this._getOrigin(this.globalMatrix)
  }
  set globalOrigin (p) {
    const m = this.globalMatrix
    this._setOrigin(m, p)
    this.globalMatrix = m
  }

  _getRotation (mat) {
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getRotation(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.create(), mat)
  }
  _setRotation (out, q) {
    const mat = out
    const scale = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getScaling(scale, mat)
    const origin = this.origin
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.identity(mat)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(mat, mat, _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.fromQuat(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create(), q))
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.scale(mat, mat, scale)
    this.origin = origin
  }

  get rotation () {
    return this._getRotation(this.matrix)
  }
  set rotation (q) {
    this._setRotation(this.matrix, q)
    this.#dirty.eulerDegrees = true
    this.#dirty.matrix = true
  }

  get globalRotation () {
    return this._getRotation(this.globalMatrix)
  }
  set globalRotation (q) {
    const m = this.globalMatrix
    this._setRotation(m, q)
    this.globalMatrix = m
  }

  _getScaling (m) {
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getScaling(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), m)
  }
  _setScaling (m, s) {
    const oldS = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getScaling(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), m)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.div(s, s, oldS)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.scale(m, m, s)
  }

  get scaling () {
    return this._getScaling(this.matrix)
  }
  set scaling (s) {
    this._setScaling(this.matrix, s)
    this.#dirty.matrix = true
  }

  get globalScaling () {
    return this._getScaling(this.matrix)
  }
  set globalScaling (s) {
    const m = this.globalMatrix
    this._setScaling(m, s)
    this.globalMatrix = m
  }

  syncEulerDegreesToRotation () {
    const x = this.eulerDegrees[0]
    const y = this.eulerDegrees[1]
    const z = this.eulerDegrees[2]

    const mat = this.matrix

    const scale = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getScaling(scale, mat)
    const origin = this.origin
    const rotation = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.fromEuler(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.create(), x, y, z)

    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.identity(mat)
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.mul(mat, mat, _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.fromQuat(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create(), rotation))
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.scale(mat, mat, scale)
    this.origin = origin
  }

  syncRotationToEulerDegrees () {
    const mat = this.matrix
    const q = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.getRotation(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.quat.create(), mat)
    const sqr = x => x * x
    const res = this.eulerDegrees
    const degree = 180.0 / Math.PI
    
    const s = 2*(q[3]*q[1]-q[2]*q[0])
    if (s < 1.0) {
      if (s > -1.0) {
        res[0] = Math.atan2(2*(q[3]*q[0]+q[1]*q[2]), 1 - 2*(sqr(q[0]) + sqr(q[1])))
        res[1] = Math.asin(s)
        res[2] = Math.atan2(2*(q[3]*q[2]+q[0]*q[1]), 1 - 2*(sqr(q[1]) + sqr(q[2])))
      } else {
        res[0] = Math.atan2(2*(q[3]*q[0]+q[1]*q[2]), 1 - 2*(sqr(q[0]) + sqr(q[1])))
        res[1] = -Math.PI / 2.0
        res[2] = 0.0
      }
    } else {
      res[0] = Math.atan2(2*(q[3]*q[0]+q[1]*q[2]), 1 - 2*(sqr(q[0]) + sqr(q[1])))
      res[1] = Math.PI / 2.0
      res[2] = 0.0
    }

    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(res, res, degree)
  }

  get eulerRotation () {
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), this.eulerRotationDegree, Math.PI / 180.0)
  }

  set eulerRotation (v) {
    const degree = 180.0 / Math.PI
    v[0] *= degree
    v[1] *= degree
    v[2] *= degree
    this.eulerRotationDegree = v
  } 

  get eulerRotationDegree () {
    if (this.#dirty.eulerDegrees) {
      this.syncRotationToEulerDegrees()
      this.#dirty.eulerDegrees = false
    }
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.copy(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), this.eulerDegrees)
  }

  set eulerRotationDegree (v) {
    const clampDegree = (x) => {
      const ax = Math.abs(x)
      return Math.sign(x) * (ax - Math.floor(ax / 360.0) * 360.0)
    }
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.set(this.eulerDegrees, ...v)
    this.eulerDegrees[0] = clampDegree(this.eulerDegrees[0])
    this.eulerDegrees[1] = clampDegree(this.eulerDegrees[1])
    this.eulerDegrees[2] = clampDegree(this.eulerDegrees[2])
    this.syncEulerDegreesToRotation()
    this.#dirty.matrix = true
  }

  xform (p) {
    const res = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create()
    _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.transformMat4(res, p, this.matrix)
    return res
  }

  xformInverse (p) {
    const mat = this.matrix
    return _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.transformMat4(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.vec3.create(), p, _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.invert(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__.mat4.create(), mat))
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Transform);

/***/ }),

/***/ "./src/js/core/input_manager.js":
/*!**************************************!*\
  !*** ./src/js/core/input_manager.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class InputManager {

  inputActionMap = {}
  inputStateMap = {}
  

  constructor () {
  }

  addInputAction(action, type, code) {
    if (!this.inputActionMap[action])
      this.inputActionMap[action] = []
    this.inputActionMap[action].push({
      type, code
    })

    if (!this.inputStateMap[action]) {
      this.inputStateMap[action] = {
        pressed: false,
        lastPressed: false,
      }
    }
  }

  afterUpdate (delta) {
    for (let action in this.inputStateMap) {
      const state = this.inputStateMap[action]
      state.lastPressed = state.pressed
    }
  }

  input (event) {
    for (let action in this.inputActionMap) {
      const os = this.inputActionMap[action]
      const state = this.inputStateMap[action]
      let changed = false
      let pressed = false
      for (let o of os) {
        if (event instanceof o.type) {
          if (event.code === o.code) {
            if (event.type === 'keydown') {
              pressed = true
              changed = true
            } else if (event.type === 'keyup') {
              changed = true
            }
          }
        }
      }

      if (changed) {
        state.pressed = pressed
      }

    }
  }

  isActionPressed (action) {
    const state = this.inputStateMap[action]
    return state && state.pressed
  }

  isActionReleased (action) {
    const state = this.inputStateMap[action]
    return !state || !state.pressed
  }

  isActionJustPressed (action) {
    const state = this.inputStateMap[action]
    return state && state.pressed && state.pressed !== state.lastPressed
  }

  isActionJustReleased (action) {
    const state = this.inputStateMap[action]
    return state && !state.pressed && state.pressed !== state.lastPressed
  }

  getActionStrength (action) {
    return this.isActionPressed(action) ? 1 : 0
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (InputManager);

/***/ }),

/***/ "./src/js/core/render_server.js":
/*!**************************************!*\
  !*** ./src/js/core/render_server.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RenderServer": () => (/* binding */ RenderServer)
/* harmony export */ });

class RenderServer {

  gl = null
  element = null

  constructor (elementId) {
    this.element = document.getElementById(elementId)

    if (!this.element) {
      throw new Error(`Canvas not found: ${elementId}`)
    }
    if (!this.element instanceof HTMLCanvasElement) {
      throw new Error(`Element ${elementId} is not a Canvas!`)
    }

    this.fetch_gl()
  }

  fetch_gl() {
    const names = [
      'webgl2',
    ]
    var gl = null
    for (var i=0; i<names.length; ++i) {
      gl = this.element.getContext(names[i])
      if (gl) break
    }
    if (gl === null) {
      throw new Error(`Your browser does not support ${names}!`)
    }

    // function throwOnGLError(err, funcName, args) {
    //   throw  `${WebGLDebugUtils.glEnumToString(err)} was caused by call to: ${funcName}(${args})`;
    // }
    // gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError)
    this.gl = gl
    
    this.setupCanvasSizeAndViewport()
    window.addEventListener('resize', () => {
      this.setupCanvasSizeAndViewport()
    })
  }

  setupCanvasSizeAndViewport () {
    const gl = this.gl
    const canvas = this.element
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  }

  update (delta) {
    const gl = this.gl
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEAPTH_BUFFER_BIT)
  }
}



/***/ }),

/***/ "./src/js/core/resource_server.js":
/*!****************************************!*\
  !*** ./src/js/core/resource_server.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResourceLoader": () => (/* binding */ ResourceLoader),
/* harmony export */   "ResourceServer": () => (/* binding */ ResourceServer),
/* harmony export */   "TextResourceLoader": () => (/* binding */ TextResourceLoader),
/* harmony export */   "TextureResouceLoader": () => (/* binding */ TextureResouceLoader)
/* harmony export */ });
/* harmony import */ var _resources_texture_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../resources/texture.js */ "./src/js/resources/texture.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./src/js/core/utils.js");



class ResourceLoader {
  constructor () {

  }

  getRecognizedExtension () {
    return null
  }

  load (url) {
    return Promise.resolve()
  }


}

class TextResourceLoader extends ResourceLoader {
  constructor () {
    super()
  }

  getRecognizedExtension () {
    return ['fs','vs', 'text', 'js']
  }

  load (url) {
    return fetch(url).then(res=>res.text())
  }
}

class TextureResouceLoader extends ResourceLoader {
  constructor () {
    super()
  }

  getRecognizedExtension () {
    return ['png', 'jpg', 'bmp']
  }

  load (url) {
    return new Promise((resolve) => {
      const image = new Image()
      image.src = url
      image.onload = (e) => {
        const res = this.app.createResource(_resources_texture_js__WEBPACK_IMPORTED_MODULE_0__["default"], image)
        resolve(res)
      }
    })
  }
}

class ResourceServer {

  app = null
  resourceLoaderList = []

  loadedResourceMap = {} // { url: resource }

  constructor (app, resourceLoaders) {
    if (!resourceLoaders) return
    this.app = app
    for (let t of resourceLoaders) {
      this.registerResourceLoader(t)
    }
  }

  registerResourceLoader (resourceLoader) {
    const loader = new resourceLoader()
    loader.app = this.app
    this.resourceLoaderList.push(loader)
  }

  load (url, loaderType) {
    if (this.loadedResourceMap[url]) {
      return Promise.resolve(this.loadedResourceMap[url])
    }
    
    let res = null
    for (let loader of this.resourceLoaderList) {
      if (loaderType && loader instanceof loaderType)
      {
        res = loader.load(url)
        break
      }
    }

    const ext = _utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].getFileExtension(url)
    if (res === null) {
      for (let loader of this.resourceLoaderList) {
        if (loader.getRecognizedExtension().includes(ext)) {
          res = loader.load(url)
          break
        }
      }
    }
    if (res === null) {
      throw new Error(`Unable to load resource: "${url}"`)
    }
    return res.then((r)=>{
      this.loadedResourceMap[url] = r
      return r
    })
  }
  
}



/***/ }),

/***/ "./src/js/core/signal_slot.js":
/*!************************************!*\
  !*** ./src/js/core/signal_slot.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SignalSlot": () => (/* binding */ SignalSlot)
/* harmony export */ });

class ListenerData {

  func = null
  binds = []

  constructor (func, binds) {
    this.func = func
    this.binds = binds
  }
}

class SignalSlot {

  listeners = {}

  constructor () {

  }

  connect (func, ...binds) {
    if (this.listeners[func]) {
      throw new Error('Signal already connected!')
    }
    this.listeners[func] = new ListenerData(func, binds)
  }

  disconnect (func) {
    if (this.listeners[func] === undefined) {
      throw new Error('Signal not connected!')
    }
  }

  emit (...args) {
    for (let k in this.listeners) {
      const d = this.listeners[k]
      d.func(...args, ...d.binds)
    }
  }
}



/***/ }),

/***/ "./src/js/core/utils.js":
/*!******************************!*\
  !*** ./src/js/core/utils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomRange (min, max) {
    if (max === min) return min
    if (max < min) {
      const t = max
      max = min
      min = t
    }
    return Math.random() * (max-min) + min
  },

  htmlEncode (html){
    var temp = document.createElement ("div");
    (temp.textContent != undefined ) ? (temp.textContent = html) : (temp.innerText = html);
    var output = temp.innerHTML;
    temp = null;
    return output;
  },

  equals (a, b) {
    return (a-b) <= 0.000001
  },

  equals0 (a) {
    return this.equals(a, 0)
  },

  mix (x, y, w) {
    return x*(1-w) + y*w
  },

  mixFloor (x, y, w) {
    return Math.floor(this.mix(x, y, w))
  },

  weightedRandom (v, w) {
    return v * this.mix(1, Math.random(), w)
  },

  deg2rad (x) {
    return x / 180 * Math.PI
  },

  rad2deg (x) {
    return x / Math.PI * 180
  },

  mat4SetScaling(out, a, s) {
    const x0 = a[0]
    const x1 = a[1]
    const x2 = a[2]

    const y0 = a[4]
    const y1 = a[5]
    const y2 = a[6]

    const z0 = a[8]
    const z1 = a[9]
    const z2 = a[10]

    const xLength = Math.sqrt(x0*x0 + x1*x1 + x2*x2)
    const yLength = Math.sqrt(y0*y0 + y1*y1 + y2*y2)
    const zLength = Math.sqrt(z0*z0 + z1*z1 + z2*z2)

    if (xLength !== 0) {
      out[0] = x0/xLength * s[0]
      out[1] = x1/xLength * s[0]
      out[2] = x2/xLength * s[0]
    } else {
      out[0] = 0
      out[1] = 0
      out[2] = 0
    }
    
    if (yLength !== 0) {
      out[4] = y0/yLength * s[1]
      out[5] = y1/yLength * s[1]
      out[6] = y2/yLength * s[1]
    } else {
      out[4] = 0
      out[5] = 0
      out[6] = 0
    }
    
    if (zLength !== 0) {
      out[8] = z0/zLength * s[2]
      out[9] = z1/zLength * s[2]
      out[10] = z2/zLength * s[2]
    } else {
      out[8] = 0
      out[9] = 0
      out[10] = 0
    }
    
  },

  combinePath (a, b) {
    return a + '/' + b
  },

  getFileExtension (path) {
    const ss = path.split('.')
    return ss[ss.length-1]
  },

  getFileBaseName (path) {
    path = path.replace('\\ ', ' ')
    path = path.replace('\\', '/')
    let ss = path.split('/')
    ss = ss[ss.length-1]
    ss = ss.split('.')
    return ss[0]
  }
});

/***/ }),

/***/ "./src/js/entity.js":
/*!**************************!*\
  !*** ./src/js/entity.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Entity {
  componentCollection = {}
  id = -1
  activated = true
  hasBeenQueuedDestroy = false
  
  constructor () {

  }

  getScene () {
    return this.scene
  }

  get app() {
    return this.getScene().app
  }

  getComponent(name) {
    if (typeof(name) === 'function') {
      name = name.name
    }
    const res = this.componentCollection[name]
    if (!res) throw new Error(`Can\'t find component: ${name}`)
    return res
  }

  getComponentRaw (name) {
    if (typeof(name) === 'function') {
      name = name.name
    }
    return this.componentCollection[name]
  }

  addComponent(name, component) {
    if (component === undefined && typeof(name) === 'object') {
      component = name
      name = component.constructor.name
    }
    if (!name || name === '') {
      console.error(`Invalid component name: '${name}'`)
      return
    }
    if (this.componentCollection[name]) {
      console.warn(`component of ${name} already exists! overriding...`)
    }
    component.entity = this
    component.activated = true
    this.componentCollection[name] = component
    if (component.added) component.added()
    return this
  }

  removeComponent(name) {
    const component = this.getComponent(name)
    if (!component) return
    if (component.removed) component.removed()
    this.componentCollection[name] = undefined
  }

  input (event) {
    this.callComponentCollectionFunction('input', event)
  }

  preUpdate (delta) {
    this.callComponentCollectionFunction('preUpdate', delta)
  }

  update(delta) {
    this.callComponentCollectionFunction('update', delta)
  }

  afterUpdate (delta) {
    this.callComponentCollectionFunction('afterUpdate', delta)
  }

  callComponentCollectionFunction(funcName, ...args) {
    for (let name in this.componentCollection) {
      const component = this.getComponent(name)
      if (!component.activated) continue
      if (component[funcName]) component[funcName](...args)
    }
  }

  destroyed() {
    for (let name in this.componentCollection) {
      this.removeComponent(name)
    }
  }

  queueDestroy() {
    this.getScene().destroyedEntityQueue.push(this)
    this.hasBeenQueuedDestroy = true
    this.callComponentCollectionFunction('beenQueueDestroy')
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Entity);

/***/ }),

/***/ "./src/js/lib/color/color.js":
/*!***********************************!*\
  !*** ./src/js/lib/color/color.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Color": () => (/* binding */ Color)
/* harmony export */ });



const Color = {
  _digit_map: {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'a': 10,
    'b': 11,
    'c': 12,
    'd': 13,
    'e': 14,
    'f': 15,
  },
  _str_map: {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: 'a',
    11: 'b',
    12: 'c',
    13: 'd',
    14: 'e',
    15: 'f',
  },

  black: '000000ff',
  white: 'ffffffff',
  red: 'ff0000ff',
  green: '00ff00ff',
  blue: '0000ffff',

  toRGB: function (hexColor) {
    hexColor = hexColor.toLowerCase()
    if (hexColor.length !== 6) {
      throw new Error(`Invlaid hex color: ${hexColor}(${hexColor.length})`)
    }

    let r = this._digit_map[hexColor[0]] * 16 + this._digit_map[hexColor[1]]
    let g = this._digit_map[hexColor[2]] * 16 + this._digit_map[hexColor[3]]
    let b = this._digit_map[hexColor[4]] * 16 + this._digit_map[hexColor[5]]

    return [r/255, g/255, b/255]
  },

  toRGBA: function (hexColor) {
    hexColor = hexColor.toLowerCase()
    if (hexColor.length !== 6 && hexColor.length !== 8) {
      throw new Error(`Invlaid hex color: ${hexColor}(${hexColor.length})`)
    }
    if (hexColor.length === 6) hexColor = hexColor + 'ff'

    let r = this._digit_map[hexColor[0]] * 16 + this._digit_map[hexColor[1]]
    let g = this._digit_map[hexColor[2]] * 16 + this._digit_map[hexColor[3]]
    let b = this._digit_map[hexColor[4]] * 16 + this._digit_map[hexColor[5]]
    let a = this._digit_map[hexColor[6]] * 16 + this._digit_map[hexColor[7]]

    return [r/255, g/255, b/255, a/255]
  },

  toHex: function (color) {
    if (color.length < 3) throw new Error(`Invalid color: ${color}!`)
    let r = color[0] * 255
    let g = color[1] * 255
    let b = color[2] * 255
    let a = 255
    if (color.length > 3) a = color[3] * 255
    return (this._str_map[r/16]+this._str_map[r%16]) +
            (this._str_map[g/16]+this._str_map[g%16]) +
            (this._str_map[b/16]+this._str_map[b%16]) +
            (this._str_map[a/16]+this._str_map[a%16])
  },

  rgbaStringToColor: function (s) {
    s = s.split('(')[1]
    s = s.split(',')
    let r = parseInt(s[0])
    let g = parseInt(s[1])
    let b = parseInt(s[2])
    let a = parseFloat(s[3])
    return [r/255, g/255, b/255, a]
  },
}






/***/ }),

/***/ "./src/js/lib/gl-matrix/common.js":
/*!****************************************!*\
  !*** ./src/js/lib/gl-matrix/common.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ARRAY_TYPE": () => (/* binding */ ARRAY_TYPE),
/* harmony export */   "EPSILON": () => (/* binding */ EPSILON),
/* harmony export */   "RANDOM": () => (/* binding */ RANDOM),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "setMatrixArrayType": () => (/* binding */ setMatrixArrayType),
/* harmony export */   "toRadian": () => (/* binding */ toRadian)
/* harmony export */ });
/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
var RANDOM = Math.random;
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */

function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
 */

function toRadian(a) {
  return a * degree;
}
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */

function equals(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/***/ }),

/***/ "./src/js/lib/gl-matrix/index.js":
/*!***************************************!*\
  !*** ./src/js/lib/gl-matrix/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "glMatrix": () => (/* reexport module object */ _common_js__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   "mat2": () => (/* reexport module object */ _mat2_js__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   "mat2d": () => (/* reexport module object */ _mat2d_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   "mat3": () => (/* reexport module object */ _mat3_js__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   "mat4": () => (/* reexport module object */ _mat4_js__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "quat": () => (/* reexport module object */ _quat_js__WEBPACK_IMPORTED_MODULE_5__),
/* harmony export */   "quat2": () => (/* reexport module object */ _quat2_js__WEBPACK_IMPORTED_MODULE_6__),
/* harmony export */   "vec2": () => (/* reexport module object */ _vec2_js__WEBPACK_IMPORTED_MODULE_7__),
/* harmony export */   "vec3": () => (/* reexport module object */ _vec3_js__WEBPACK_IMPORTED_MODULE_8__),
/* harmony export */   "vec4": () => (/* reexport module object */ _vec4_js__WEBPACK_IMPORTED_MODULE_9__)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");
/* harmony import */ var _mat2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat2.js */ "./src/js/lib/gl-matrix/mat2.js");
/* harmony import */ var _mat2d_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat2d.js */ "./src/js/lib/gl-matrix/mat2d.js");
/* harmony import */ var _mat3_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mat3.js */ "./src/js/lib/gl-matrix/mat3.js");
/* harmony import */ var _mat4_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mat4.js */ "./src/js/lib/gl-matrix/mat4.js");
/* harmony import */ var _quat_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./quat.js */ "./src/js/lib/gl-matrix/quat.js");
/* harmony import */ var _quat2_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./quat2.js */ "./src/js/lib/gl-matrix/quat2.js");
/* harmony import */ var _vec2_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./vec2.js */ "./src/js/lib/gl-matrix/vec2.js");
/* harmony import */ var _vec3_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./vec3.js */ "./src/js/lib/gl-matrix/vec3.js");
/* harmony import */ var _vec4_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./vec4.js */ "./src/js/lib/gl-matrix/vec4.js");












/***/ }),

/***/ "./src/js/lib/gl-matrix/mat2.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/mat2.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LDU": () => (/* binding */ LDU),
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "adjoint": () => (/* binding */ adjoint),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "frob": () => (/* binding */ frob),
/* harmony export */   "fromRotation": () => (/* binding */ fromRotation),
/* harmony export */   "fromScaling": () => (/* binding */ fromScaling),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar),
/* harmony export */   "multiplyScalarAndAdd": () => (/* binding */ multiplyScalarAndAdd),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "transpose": () => (/* binding */ transpose)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 2x2 Matrix
 * @module mat2
 */

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */

function fromValues(m00, m01, m10, m11) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */

function set(out, m00, m01, m10, m11) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m10;
  out[3] = m11;
  return out;
}
/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache
  // some values
  if (out === a) {
    var a1 = a[1];
    out[1] = a[2];
    out[2] = a1;
  } else {
    out[0] = a[0];
    out[1] = a[2];
    out[2] = a[1];
    out[3] = a[3];
  }

  return out;
}
/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3]; // Calculate the determinant

  var det = a0 * a3 - a2 * a1;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = a3 * det;
  out[1] = -a1 * det;
  out[2] = -a2 * det;
  out[3] = a0 * det;
  return out;
}
/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the source matrix
 * @returns {mat2} out
 */

function adjoint(out, a) {
  // Caching this value is nessecary if out == a
  var a0 = a[0];
  out[0] = a[3];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a0;
  return out;
}
/**
 * Calculates the determinant of a mat2
 *
 * @param {ReadonlyMat2} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  return a[0] * a[3] - a[2] * a[1];
}
/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  return out;
}
/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  return out;
}
/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/

function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */

function fromRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2
 *
 * @param {ReadonlyMat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str(a) {
  return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns Frobenius norm of a mat2
 *
 * @param {ReadonlyMat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3]);
}
/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {ReadonlyMat2} L the lower triangular matrix
 * @param {ReadonlyMat2} D the diagonal matrix
 * @param {ReadonlyMat2} U the upper triangular matrix
 * @param {ReadonlyMat2} a the input matrix to factorize
 */

function LDU(L, D, U, a) {
  L[2] = a[2] / a[0];
  U[0] = a[0];
  U[1] = a[1];
  U[3] = a[3] - L[2] * U[1];
  return [L, D, U];
}
/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @returns {mat2} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2} a The first matrix.
 * @param {ReadonlyMat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {ReadonlyMat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {ReadonlyMat2} a the first operand
 * @param {ReadonlyMat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Alias for {@link mat2.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link mat2.subtract}
 * @function
 */

var sub = subtract;

/***/ }),

/***/ "./src/js/lib/gl-matrix/mat2d.js":
/*!***************************************!*\
  !*** ./src/js/lib/gl-matrix/mat2d.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "frob": () => (/* binding */ frob),
/* harmony export */   "fromRotation": () => (/* binding */ fromRotation),
/* harmony export */   "fromScaling": () => (/* binding */ fromScaling),
/* harmony export */   "fromTranslation": () => (/* binding */ fromTranslation),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar),
/* harmony export */   "multiplyScalarAndAdd": () => (/* binding */ multiplyScalarAndAdd),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "translate": () => (/* binding */ translate)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 2x3 Matrix
 * @module mat2d
 * @description
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0,
 *  c, d, 0,
 *  tx, ty, 1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(6);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[4] = 0;
    out[5] = 0;
  }

  out[0] = 1;
  out[3] = 1;
  return out;
}
/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {ReadonlyMat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(6);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */

function fromValues(a, b, c, d, tx, ty) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(6);
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */

function set(out, a, b, c, d, tx, ty) {
  out[0] = a;
  out[1] = b;
  out[2] = c;
  out[3] = d;
  out[4] = tx;
  out[5] = ty;
  return out;
}
/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {mat2d} out
 */

function invert(out, a) {
  var aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3];
  var atx = a[4],
      aty = a[5];
  var det = aa * ad - ab * ac;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = ad * det;
  out[1] = -ab * det;
  out[2] = -ac * det;
  out[3] = aa * det;
  out[4] = (ac * aty - ad * atx) * det;
  out[5] = (ab * atx - aa * aty) * det;
  return out;
}
/**
 * Calculates the determinant of a mat2d
 *
 * @param {ReadonlyMat2d} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  return a[0] * a[3] - a[1] * a[2];
}
/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function multiply(out, a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  out[0] = a0 * b0 + a2 * b1;
  out[1] = a1 * b0 + a3 * b1;
  out[2] = a0 * b2 + a2 * b3;
  out[3] = a1 * b2 + a3 * b3;
  out[4] = a0 * b4 + a2 * b5 + a4;
  out[5] = a1 * b4 + a3 * b5 + a5;
  return out;
}
/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function rotate(out, a, rad) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = a0 * c + a2 * s;
  out[1] = a1 * c + a3 * s;
  out[2] = a0 * -s + a2 * c;
  out[3] = a1 * -s + a3 * c;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/

function scale(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0 * v0;
  out[1] = a1 * v0;
  out[2] = a2 * v1;
  out[3] = a3 * v1;
  out[4] = a4;
  out[5] = a5;
  return out;
}
/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to translate
 * @param {ReadonlyVec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/

function translate(out, a, v) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var v0 = v[0],
      v1 = v[1];
  out[0] = a0;
  out[1] = a1;
  out[2] = a2;
  out[3] = a3;
  out[4] = a0 * v0 + a2 * v1 + a4;
  out[5] = a1 * v0 + a3 * v1 + a5;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */

function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = -s;
  out[3] = c;
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat2d} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = v[1];
  out[4] = 0;
  out[5] = 0;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat2d} out
 */

function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = v[0];
  out[5] = v[1];
  return out;
}
/**
 * Returns a string representation of a mat2d
 *
 * @param {ReadonlyMat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str(a) {
  return "mat2d(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ")";
}
/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {ReadonlyMat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], 1);
}
/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @returns {mat2d} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  return out;
}
/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {ReadonlyMat2d} a the first operand
 * @param {ReadonlyMat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat2d} a The first matrix.
 * @param {ReadonlyMat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
}
/**
 * Alias for {@link mat2d.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link mat2d.subtract}
 * @function
 */

var sub = subtract;

/***/ }),

/***/ "./src/js/lib/gl-matrix/mat3.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/mat3.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "adjoint": () => (/* binding */ adjoint),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "frob": () => (/* binding */ frob),
/* harmony export */   "fromMat2d": () => (/* binding */ fromMat2d),
/* harmony export */   "fromMat4": () => (/* binding */ fromMat4),
/* harmony export */   "fromQuat": () => (/* binding */ fromQuat),
/* harmony export */   "fromRotation": () => (/* binding */ fromRotation),
/* harmony export */   "fromScaling": () => (/* binding */ fromScaling),
/* harmony export */   "fromTranslation": () => (/* binding */ fromTranslation),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar),
/* harmony export */   "multiplyScalarAndAdd": () => (/* binding */ multiplyScalarAndAdd),
/* harmony export */   "normalFromMat4": () => (/* binding */ normalFromMat4),
/* harmony export */   "projection": () => (/* binding */ projection),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "translate": () => (/* binding */ translate),
/* harmony export */   "transpose": () => (/* binding */ transpose)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(9);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {ReadonlyMat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */

function fromMat4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[4];
  out[4] = a[5];
  out[5] = a[6];
  out[6] = a[8];
  out[7] = a[9];
  out[8] = a[10];
  return out;
}
/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(9);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */

function fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(9);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */

function set(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m10;
  out[4] = m11;
  out[5] = m12;
  out[6] = m20;
  out[7] = m21;
  out[8] = m22;
  return out;
}
/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  out[0] = a11 * a22 - a12 * a21;
  out[1] = a02 * a21 - a01 * a22;
  out[2] = a01 * a12 - a02 * a11;
  out[3] = a12 * a20 - a10 * a22;
  out[4] = a00 * a22 - a02 * a20;
  out[5] = a02 * a10 - a00 * a12;
  out[6] = a10 * a21 - a11 * a20;
  out[7] = a01 * a20 - a00 * a21;
  out[8] = a00 * a11 - a01 * a10;
  return out;
}
/**
 * Calculates the determinant of a mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {mat3} out
 */

function translate(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function rotate(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Translation vector
 * @returns {mat3} out
 */

function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 1;
  out[5] = 0;
  out[6] = v[0];
  out[7] = v[1];
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function fromRotation(out, rad) {
  var s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = -s;
  out[4] = c;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyVec2} v Scaling vector
 * @returns {mat3} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = v[1];
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  out[8] = 1;
  return out;
}
/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat2d} a the matrix to copy
 * @returns {mat3} out
 **/

function fromMat2d(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = 0;
  out[3] = a[2];
  out[4] = a[3];
  out[5] = 0;
  out[6] = a[4];
  out[7] = a[5];
  out[8] = 1;
  return out;
}
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}
/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyMat4} a Mat4 to derive the normal matrix from
 *
 * @returns {mat3} out
 */

function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  return out;
}
/**
 * Generates a 2D projection matrix with the given bounds
 *
 * @param {mat3} out mat3 frustum matrix will be written into
 * @param {number} width Width of your gl context
 * @param {number} height Height of gl context
 * @returns {mat3} out
 */

function projection(out, width, height) {
  out[0] = 2 / width;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = -2 / height;
  out[5] = 0;
  out[6] = -1;
  out[7] = 1;
  out[8] = 1;
  return out;
}
/**
 * Returns a string representation of a mat3
 *
 * @param {ReadonlyMat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str(a) {
  return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
}
/**
 * Returns Frobenius norm of a mat3
 *
 * @param {ReadonlyMat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
}
/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  return out;
}
/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat3} a The first matrix.
 * @param {ReadonlyMat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7],
      a8 = a[8];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7],
      b8 = b[8];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
}
/**
 * Alias for {@link mat3.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link mat3.subtract}
 * @function
 */

var sub = subtract;

/***/ }),

/***/ "./src/js/lib/gl-matrix/mat4.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/mat4.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "adjoint": () => (/* binding */ adjoint),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "determinant": () => (/* binding */ determinant),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "frob": () => (/* binding */ frob),
/* harmony export */   "fromQuat": () => (/* binding */ fromQuat),
/* harmony export */   "fromQuat2": () => (/* binding */ fromQuat2),
/* harmony export */   "fromRotation": () => (/* binding */ fromRotation),
/* harmony export */   "fromRotationTranslation": () => (/* binding */ fromRotationTranslation),
/* harmony export */   "fromRotationTranslationScale": () => (/* binding */ fromRotationTranslationScale),
/* harmony export */   "fromRotationTranslationScaleOrigin": () => (/* binding */ fromRotationTranslationScaleOrigin),
/* harmony export */   "fromScaling": () => (/* binding */ fromScaling),
/* harmony export */   "fromTranslation": () => (/* binding */ fromTranslation),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "fromXRotation": () => (/* binding */ fromXRotation),
/* harmony export */   "fromYRotation": () => (/* binding */ fromYRotation),
/* harmony export */   "fromZRotation": () => (/* binding */ fromZRotation),
/* harmony export */   "frustum": () => (/* binding */ frustum),
/* harmony export */   "getRotation": () => (/* binding */ getRotation),
/* harmony export */   "getScaling": () => (/* binding */ getScaling),
/* harmony export */   "getTranslation": () => (/* binding */ getTranslation),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "lookAt": () => (/* binding */ lookAt),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "multiplyScalar": () => (/* binding */ multiplyScalar),
/* harmony export */   "multiplyScalarAndAdd": () => (/* binding */ multiplyScalarAndAdd),
/* harmony export */   "ortho": () => (/* binding */ ortho),
/* harmony export */   "orthoNO": () => (/* binding */ orthoNO),
/* harmony export */   "orthoZO": () => (/* binding */ orthoZO),
/* harmony export */   "perspective": () => (/* binding */ perspective),
/* harmony export */   "perspectiveFromFieldOfView": () => (/* binding */ perspectiveFromFieldOfView),
/* harmony export */   "perspectiveNO": () => (/* binding */ perspectiveNO),
/* harmony export */   "perspectiveZO": () => (/* binding */ perspectiveZO),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "rotateX": () => (/* binding */ rotateX),
/* harmony export */   "rotateY": () => (/* binding */ rotateY),
/* harmony export */   "rotateZ": () => (/* binding */ rotateZ),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "targetTo": () => (/* binding */ targetTo),
/* harmony export */   "translate": () => (/* binding */ translate),
/* harmony export */   "transpose": () => (/* binding */ transpose)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(16);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */

function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */

function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function adjoint(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Scaling vector
 * @returns {mat4} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function fromRotation(out, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;

  if (len < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c; // Perform rotation-specific matrix multiplication

  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromRotationTranslation(out, q, v) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {ReadonlyQuat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */

function fromQuat2(out, a) {
  var translation = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense

  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }

  fromRotationTranslation(out, a, translation);
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */

function getRotation(out, mat) {
  var scaling = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }

  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @returns {mat4} out
 */

function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @param {ReadonlyVec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */

function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */

function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Alias for {@link mat4.perspectiveNO}
 * @function
 */

var perspective = perspectiveNO;
/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180.0);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = far * near / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Alias for {@link mat4.orthoNO}
 * @function
 */

var ortho = orthoNO;
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON && Math.abs(eyey - centery) < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON && Math.abs(eyez - centerz) < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    return identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function targetTo(out, eye, target, up) {
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2];
  var z0 = eyex - target[0],
      z1 = eyey - target[1],
      z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
      x1 = upz * z0 - upx * z2,
      x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
/**
 * Returns a string representation of a mat4
 *
 * @param {ReadonlyMat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
/**
 * Returns Frobenius norm of a mat4
 *
 * @param {ReadonlyMat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}
/**
 * Alias for {@link mat4.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link mat4.subtract}
 * @function
 */

var sub = subtract;

/***/ }),

/***/ "./src/js/lib/gl-matrix/quat.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/quat.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "calculateW": () => (/* binding */ calculateW),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "conjugate": () => (/* binding */ conjugate),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "exp": () => (/* binding */ exp),
/* harmony export */   "fromEuler": () => (/* binding */ fromEuler),
/* harmony export */   "fromMat3": () => (/* binding */ fromMat3),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "getAngle": () => (/* binding */ getAngle),
/* harmony export */   "getAxisAngle": () => (/* binding */ getAxisAngle),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "ln": () => (/* binding */ ln),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "pow": () => (/* binding */ pow),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "rotateX": () => (/* binding */ rotateX),
/* harmony export */   "rotateY": () => (/* binding */ rotateY),
/* harmony export */   "rotateZ": () => (/* binding */ rotateZ),
/* harmony export */   "rotationTo": () => (/* binding */ rotationTo),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "setAxes": () => (/* binding */ setAxes),
/* harmony export */   "setAxisAngle": () => (/* binding */ setAxisAngle),
/* harmony export */   "slerp": () => (/* binding */ slerp),
/* harmony export */   "sqlerp": () => (/* binding */ sqlerp),
/* harmony export */   "sqrLen": () => (/* binding */ sqrLen),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "str": () => (/* binding */ str)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");
/* harmony import */ var _mat3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3.js */ "./src/js/lib/gl-matrix/mat3.js");
/* harmony import */ var _vec3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec3.js */ "./src/js/lib/gl-matrix/vec3.js");
/* harmony import */ var _vec4_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec4.js */ "./src/js/lib/gl-matrix/vec4.js");




/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {ReadonlyQuat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */

function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2.0;
  var s = Math.sin(rad / 2.0);

  if (s > _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    // If s is zero, return any axis (no rotation - axis does not matter)
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }

  return rad;
}
/**
 * Gets the angular distance between two unit quaternions
 *
 * @param  {ReadonlyQuat} a     Origin unit quaternion
 * @param  {ReadonlyQuat} b     Destination unit quaternion
 * @return {Number}     Angle, in radians, between the two quaternions
 */

function getAngle(a, b) {
  var dotproduct = dot(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */

function multiply(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateX(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateY(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateZ(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate W component of
 * @returns {quat} out
 */

function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}
/**
 * Calculate the exponential of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function exp(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
/**
 * Calculate the natural logarithm of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @returns {quat} out
 */

function ln(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
/**
 * Calculate the scalar power of a unit quaternion.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate the exponential of
 * @param {Number} b amount to scale the quaternion by
 * @returns {quat} out
 */

function pow(out, a, b) {
  ln(out, a);
  scale(out, out, b);
  exp(out, out);
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Generates a random unit quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function random(out) {
  // Implementation of http://planning.cs.uiuc.edu/node198.html
  // TODO: Calling random 3 times is probably not the fastest solution
  var u1 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM();
  var u2 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM();
  var u3 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
  return out;
}
/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate inverse of
 * @returns {quat} out
 */

function invert(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate conjugate of
 * @returns {quat} out
 */

function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Creates a quaternion from the given euler angle x, y, z.
 *
 * @param {quat} out the receiving quaternion
 * @param {x} Angle to rotate around X axis in degrees.
 * @param {y} Angle to rotate around Y axis in degrees.
 * @param {z} Angle to rotate around Z axis in degrees.
 * @returns {quat} out
 * @function
 */

function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180.0;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
/**
 * Returns a string representation of a quatenion
 *
 * @param {ReadonlyQuat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */

var clone = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.clone;
/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */

var fromValues = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.fromValues;
/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the source quaternion
 * @returns {quat} out
 * @function
 */

var copy = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.copy;
/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */

var set = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.set;
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 * @function
 */

var add = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.add;
/**
 * Alias for {@link quat.multiply}
 * @function
 */

var mul = multiply;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

var scale = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.scale;
/**
 * Calculates the dot product of two quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.dot;
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */

var lerp = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.lerp;
/**
 * Calculates the length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */

var length = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.length;
/**
 * Alias for {@link quat.length}
 * @function
 */

var len = length;
/**
 * Calculates the squared length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.squaredLength;
/**
 * Alias for {@link quat.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.normalize;
/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat} a The first quaternion.
 * @param {ReadonlyQuat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var exactEquals = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.exactEquals;
/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat} a The first vector.
 * @param {ReadonlyQuat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

var equals = _vec4_js__WEBPACK_IMPORTED_MODULE_3__.equals;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__.create();
  var xUnitVec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__.fromValues(1, 0, 0);
  var yUnitVec3 = _vec3_js__WEBPACK_IMPORTED_MODULE_2__.fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot = _vec3_js__WEBPACK_IMPORTED_MODULE_2__.dot(a, b);

    if (dot < -0.999999) {
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__.cross(tmpvec3, xUnitVec3, a);
      if (_vec3_js__WEBPACK_IMPORTED_MODULE_2__.len(tmpvec3) < 0.000001) _vec3_js__WEBPACK_IMPORTED_MODULE_2__.cross(tmpvec3, yUnitVec3, a);
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__.normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      _vec3_js__WEBPACK_IMPORTED_MODULE_2__.cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create();
  var temp2 = create();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = _mat3_js__WEBPACK_IMPORTED_MODULE_1__.create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize(out, fromMat3(out, matr));
  };
}();

/***/ }),

/***/ "./src/js/lib/gl-matrix/quat2.js":
/*!***************************************!*\
  !*** ./src/js/lib/gl-matrix/quat2.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "conjugate": () => (/* binding */ conjugate),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "fromMat4": () => (/* binding */ fromMat4),
/* harmony export */   "fromRotation": () => (/* binding */ fromRotation),
/* harmony export */   "fromRotationTranslation": () => (/* binding */ fromRotationTranslation),
/* harmony export */   "fromRotationTranslationValues": () => (/* binding */ fromRotationTranslationValues),
/* harmony export */   "fromTranslation": () => (/* binding */ fromTranslation),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "getDual": () => (/* binding */ getDual),
/* harmony export */   "getReal": () => (/* binding */ getReal),
/* harmony export */   "getTranslation": () => (/* binding */ getTranslation),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "invert": () => (/* binding */ invert),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "rotateAroundAxis": () => (/* binding */ rotateAroundAxis),
/* harmony export */   "rotateByQuatAppend": () => (/* binding */ rotateByQuatAppend),
/* harmony export */   "rotateByQuatPrepend": () => (/* binding */ rotateByQuatPrepend),
/* harmony export */   "rotateX": () => (/* binding */ rotateX),
/* harmony export */   "rotateY": () => (/* binding */ rotateY),
/* harmony export */   "rotateZ": () => (/* binding */ rotateZ),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "setDual": () => (/* binding */ setDual),
/* harmony export */   "setReal": () => (/* binding */ setReal),
/* harmony export */   "sqrLen": () => (/* binding */ sqrLen),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "translate": () => (/* binding */ translate)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");
/* harmony import */ var _quat_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./quat.js */ "./src/js/lib/gl-matrix/quat.js");
/* harmony import */ var _mat4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4.js */ "./src/js/lib/gl-matrix/mat4.js");



/**
 * Dual Quaternion<br>
 * Format: [real, dual]<br>
 * Quaternion format: XYZW<br>
 * Make sure to have normalized dual quaternions, otherwise the functions may not work as intended.<br>
 * @module quat2
 */

/**
 * Creates a new identity dual quat
 *
 * @returns {quat2} a new dual quaternion [real -> rotation, dual -> translation]
 */

function create() {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(8);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    dq[0] = 0;
    dq[1] = 0;
    dq[2] = 0;
    dq[4] = 0;
    dq[5] = 0;
    dq[6] = 0;
    dq[7] = 0;
  }

  dq[3] = 1;
  return dq;
}
/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {ReadonlyQuat2} a dual quaternion to clone
 * @returns {quat2} new dual quaternion
 * @function
 */

function clone(a) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(8);
  dq[0] = a[0];
  dq[1] = a[1];
  dq[2] = a[2];
  dq[3] = a[3];
  dq[4] = a[4];
  dq[5] = a[5];
  dq[6] = a[6];
  dq[7] = a[7];
  return dq;
}
/**
 * Creates a new dual quat initialized with the given values
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromValues(x1, y1, z1, w1, x2, y2, z2, w2) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  dq[4] = x2;
  dq[5] = y2;
  dq[6] = z2;
  dq[7] = w2;
  return dq;
}
/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component (translation)
 * @param {Number} y2 Y component (translation)
 * @param {Number} z2 Z component (translation)
 * @returns {quat2} new dual quaternion
 * @function
 */

function fromRotationTranslationValues(x1, y1, z1, w1, x2, y2, z2) {
  var dq = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(8);
  dq[0] = x1;
  dq[1] = y1;
  dq[2] = z1;
  dq[3] = w1;
  var ax = x2 * 0.5,
      ay = y2 * 0.5,
      az = z2 * 0.5;
  dq[4] = ax * w1 + ay * z1 - az * y1;
  dq[5] = ay * w1 + az * x1 - ax * z1;
  dq[6] = az * w1 + ax * y1 - ay * x1;
  dq[7] = -ax * x1 - ay * y1 - az * z1;
  return dq;
}
/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q a normalized quaternion
 * @param {ReadonlyVec3} t tranlation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotationTranslation(out, q, t) {
  var ax = t[0] * 0.5,
      ay = t[1] * 0.5,
      az = t[2] * 0.5,
      bx = q[0],
      by = q[1],
      bz = q[2],
      bw = q[3];
  out[0] = bx;
  out[1] = by;
  out[2] = bz;
  out[3] = bw;
  out[4] = ax * bw + ay * bz - az * by;
  out[5] = ay * bw + az * bx - ax * bz;
  out[6] = az * bw + ax * by - ay * bx;
  out[7] = -ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Creates a dual quat from a translation
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyVec3} t translation vector
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromTranslation(out, t) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = t[0] * 0.5;
  out[5] = t[1] * 0.5;
  out[6] = t[2] * 0.5;
  out[7] = 0;
  return out;
}
/**
 * Creates a dual quat from a quaternion
 *
 * @param {ReadonlyQuat2} dual quaternion receiving operation result
 * @param {ReadonlyQuat} q the quaternion
 * @returns {quat2} dual quaternion receiving operation result
 * @function
 */

function fromRotation(out, q) {
  out[0] = q[0];
  out[1] = q[1];
  out[2] = q[2];
  out[3] = q[3];
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param {quat2} out the dual quaternion
 * @param {ReadonlyMat4} a the matrix
 * @returns {quat2} dual quat receiving operation result
 * @function
 */

function fromMat4(out, a) {
  //TODO Optimize this
  var outer = _quat_js__WEBPACK_IMPORTED_MODULE_1__.create();
  _mat4_js__WEBPACK_IMPORTED_MODULE_2__.getRotation(outer, a);
  var t = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);
  _mat4_js__WEBPACK_IMPORTED_MODULE_2__.getTranslation(t, a);
  fromRotationTranslation(out, outer, t);
  return out;
}
/**
 * Copy the values from one dual quat to another
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the source dual quaternion
 * @returns {quat2} out
 * @function
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  return out;
}
/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @returns {quat2} out
 */

function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  out[4] = 0;
  out[5] = 0;
  out[6] = 0;
  out[7] = 0;
  return out;
}
/**
 * Set the components of a dual quat to the given values
 *
 * @param {quat2} out the receiving quaternion
 * @param {Number} x1 X component
 * @param {Number} y1 Y component
 * @param {Number} z1 Z component
 * @param {Number} w1 W component
 * @param {Number} x2 X component
 * @param {Number} y2 Y component
 * @param {Number} z2 Z component
 * @param {Number} w2 W component
 * @returns {quat2} out
 * @function
 */

function set(out, x1, y1, z1, w1, x2, y2, z2, w2) {
  out[0] = x1;
  out[1] = y1;
  out[2] = z1;
  out[3] = w1;
  out[4] = x2;
  out[5] = y2;
  out[6] = z2;
  out[7] = w2;
  return out;
}
/**
 * Gets the real part of a dual quat
 * @param  {quat} out real part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} real part
 */

var getReal = _quat_js__WEBPACK_IMPORTED_MODULE_1__.copy;
/**
 * Gets the dual part of a dual quat
 * @param  {quat} out dual part
 * @param  {ReadonlyQuat2} a Dual Quaternion
 * @return {quat} dual part
 */

function getDual(out, a) {
  out[0] = a[4];
  out[1] = a[5];
  out[2] = a[6];
  out[3] = a[7];
  return out;
}
/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the real part
 * @returns {quat2} out
 * @function
 */

var setReal = _quat_js__WEBPACK_IMPORTED_MODULE_1__.copy;
/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat} q a quaternion representing the dual part
 * @returns {quat2} out
 * @function
 */

function setDual(out, q) {
  out[4] = q[0];
  out[5] = q[1];
  out[6] = q[2];
  out[7] = q[3];
  return out;
}
/**
 * Gets the translation of a normalized dual quat
 * @param  {vec3} out translation
 * @param  {ReadonlyQuat2} a Dual Quaternion to be decomposed
 * @return {vec3} translation
 */

function getTranslation(out, a) {
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3];
  out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
  out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
  out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  return out;
}
/**
 * Translates a dual quat by the given vector
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {quat2} out
 */

function translate(out, a, v) {
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3],
      bx1 = v[0] * 0.5,
      by1 = v[1] * 0.5,
      bz1 = v[2] * 0.5,
      ax2 = a[4],
      ay2 = a[5],
      az2 = a[6],
      aw2 = a[7];
  out[0] = ax1;
  out[1] = ay1;
  out[2] = az1;
  out[3] = aw1;
  out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
  out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
  out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
  out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
  return out;
}
/**
 * Rotates a dual quat around the X axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateX(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__.rotateX(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Y axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateY(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__.rotateY(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat around the Z axis
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {number} rad how far should the rotation be
 * @returns {quat2} out
 */

function rotateZ(out, a, rad) {
  var bx = -a[0],
      by = -a[1],
      bz = -a[2],
      bw = a[3],
      ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7],
      ax1 = ax * bw + aw * bx + ay * bz - az * by,
      ay1 = ay * bw + aw * by + az * bx - ax * bz,
      az1 = az * bw + aw * bz + ax * by - ay * bx,
      aw1 = aw * bw - ax * bx - ay * by - az * bz;
  _quat_js__WEBPACK_IMPORTED_MODULE_1__.rotateZ(out, a, rad);
  bx = out[0];
  by = out[1];
  bz = out[2];
  bw = out[3];
  out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @returns {quat2} out
 */

function rotateByQuatAppend(out, a, q) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  out[0] = ax * qw + aw * qx + ay * qz - az * qy;
  out[1] = ay * qw + aw * qy + az * qx - ax * qz;
  out[2] = az * qw + aw * qz + ax * qy - ay * qx;
  out[3] = aw * qw - ax * qx - ay * qy - az * qz;
  ax = a[4];
  ay = a[5];
  az = a[6];
  aw = a[7];
  out[4] = ax * qw + aw * qx + ay * qz - az * qy;
  out[5] = ay * qw + aw * qy + az * qx - ax * qz;
  out[6] = az * qw + aw * qz + ax * qy - ay * qx;
  out[7] = aw * qw - ax * qx - ay * qy - az * qz;
  return out;
}
/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat} q quaternion to rotate by
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @returns {quat2} out
 */

function rotateByQuatPrepend(out, q, a) {
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3],
      bx = a[0],
      by = a[1],
      bz = a[2],
      bw = a[3];
  out[0] = qx * bw + qw * bx + qy * bz - qz * by;
  out[1] = qy * bw + qw * by + qz * bx - qx * bz;
  out[2] = qz * bw + qw * bz + qx * by - qy * bx;
  out[3] = qw * bw - qx * bx - qy * by - qz * bz;
  bx = a[4];
  by = a[5];
  bz = a[6];
  bw = a[7];
  out[4] = qx * bw + qw * bx + qy * bz - qz * by;
  out[5] = qy * bw + qw * by + qz * bx - qx * bz;
  out[6] = qz * bw + qw * bz + qx * by - qy * bx;
  out[7] = qw * bw - qx * bx - qy * by - qz * bz;
  return out;
}
/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the dual quaternion to rotate
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @param {Number} rad how far the rotation should be
 * @returns {quat2} out
 */

function rotateAroundAxis(out, a, axis, rad) {
  //Special case for rad = 0
  if (Math.abs(rad) < _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON) {
    return copy(out, a);
  }

  var axisLength = Math.hypot(axis[0], axis[1], axis[2]);
  rad = rad * 0.5;
  var s = Math.sin(rad);
  var bx = s * axis[0] / axisLength;
  var by = s * axis[1] / axisLength;
  var bz = s * axis[2] / axisLength;
  var bw = Math.cos(rad);
  var ax1 = a[0],
      ay1 = a[1],
      az1 = a[2],
      aw1 = a[3];
  out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
  out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
  out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
  out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
  var ax = a[4],
      ay = a[5],
      az = a[6],
      aw = a[7];
  out[4] = ax * bw + aw * bx + ay * bz - az * by;
  out[5] = ay * bw + aw * by + az * bx - ax * bz;
  out[6] = az * bw + aw * bz + ax * by - ay * bx;
  out[7] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Adds two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 * @function
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  return out;
}
/**
 * Multiplies two dual quat's
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {quat2} out
 */

function multiply(out, a, b) {
  var ax0 = a[0],
      ay0 = a[1],
      az0 = a[2],
      aw0 = a[3],
      bx1 = b[4],
      by1 = b[5],
      bz1 = b[6],
      bw1 = b[7],
      ax1 = a[4],
      ay1 = a[5],
      az1 = a[6],
      aw1 = a[7],
      bx0 = b[0],
      by0 = b[1],
      bz0 = b[2],
      bw0 = b[3];
  out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
  out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
  out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
  out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
  out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
  out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
  out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
  out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
  return out;
}
/**
 * Alias for {@link quat2.multiply}
 * @function
 */

var mul = multiply;
/**
 * Scales a dual quat by a scalar number
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the dual quat to scale
 * @param {Number} b amount to scale the dual quat by
 * @returns {quat2} out
 * @function
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  return out;
}
/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot = _quat_js__WEBPACK_IMPORTED_MODULE_1__.dot;
/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param {quat2} out the receiving dual quat
 * @param {ReadonlyQuat2} a the first operand
 * @param {ReadonlyQuat2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat2} out
 */

function lerp(out, a, b, t) {
  var mt = 1 - t;
  if (dot(a, b) < 0) t = -t;
  out[0] = a[0] * mt + b[0] * t;
  out[1] = a[1] * mt + b[1] * t;
  out[2] = a[2] * mt + b[2] * t;
  out[3] = a[3] * mt + b[3] * t;
  out[4] = a[4] * mt + b[4] * t;
  out[5] = a[5] * mt + b[5] * t;
  out[6] = a[6] * mt + b[6] * t;
  out[7] = a[7] * mt + b[7] * t;
  return out;
}
/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quat to calculate inverse of
 * @returns {quat2} out
 */

function invert(out, a) {
  var sqlen = squaredLength(a);
  out[0] = -a[0] / sqlen;
  out[1] = -a[1] / sqlen;
  out[2] = -a[2] / sqlen;
  out[3] = a[3] / sqlen;
  out[4] = -a[4] / sqlen;
  out[5] = -a[5] / sqlen;
  out[6] = -a[6] / sqlen;
  out[7] = a[7] / sqlen;
  return out;
}
/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param {quat2} out the receiving quaternion
 * @param {ReadonlyQuat2} a quat to calculate conjugate of
 * @returns {quat2} out
 */

function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  out[4] = -a[4];
  out[5] = -a[5];
  out[6] = -a[6];
  out[7] = a[7];
  return out;
}
/**
 * Calculates the length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate length of
 * @returns {Number} length of a
 * @function
 */

var length = _quat_js__WEBPACK_IMPORTED_MODULE_1__.length;
/**
 * Alias for {@link quat2.length}
 * @function
 */

var len = length;
/**
 * Calculates the squared length of a dual quat
 *
 * @param {ReadonlyQuat2} a dual quat to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength = _quat_js__WEBPACK_IMPORTED_MODULE_1__.squaredLength;
/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Normalize a dual quat
 *
 * @param {quat2} out the receiving dual quaternion
 * @param {ReadonlyQuat2} a dual quaternion to normalize
 * @returns {quat2} out
 * @function
 */

function normalize(out, a) {
  var magnitude = squaredLength(a);

  if (magnitude > 0) {
    magnitude = Math.sqrt(magnitude);
    var a0 = a[0] / magnitude;
    var a1 = a[1] / magnitude;
    var a2 = a[2] / magnitude;
    var a3 = a[3] / magnitude;
    var b0 = a[4];
    var b1 = a[5];
    var b2 = a[6];
    var b3 = a[7];
    var a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = (b0 - a0 * a_dot_b) / magnitude;
    out[5] = (b1 - a1 * a_dot_b) / magnitude;
    out[6] = (b2 - a2 * a_dot_b) / magnitude;
    out[7] = (b3 - a3 * a_dot_b) / magnitude;
  }

  return out;
}
/**
 * Returns a string representation of a dual quatenion
 *
 * @param {ReadonlyQuat2} a dual quaternion to represent as a string
 * @returns {String} string representation of the dual quat
 */

function str(a) {
  return "quat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ")";
}
/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyQuat2} a the first dual quaternion.
 * @param {ReadonlyQuat2} b the second dual quaternion.
 * @returns {Boolean} true if the dual quaternions are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7];
}
/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param {ReadonlyQuat2} a the first dual quat.
 * @param {ReadonlyQuat2} b the second dual quat.
 * @returns {Boolean} true if the dual quats are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3],
      a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3],
      b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7));
}

/***/ }),

/***/ "./src/js/lib/gl-matrix/vec2.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/vec2.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "angle": () => (/* binding */ angle),
/* harmony export */   "ceil": () => (/* binding */ ceil),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "cross": () => (/* binding */ cross),
/* harmony export */   "dist": () => (/* binding */ dist),
/* harmony export */   "distance": () => (/* binding */ distance),
/* harmony export */   "div": () => (/* binding */ div),
/* harmony export */   "divide": () => (/* binding */ divide),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "floor": () => (/* binding */ floor),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "inverse": () => (/* binding */ inverse),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "max": () => (/* binding */ max),
/* harmony export */   "min": () => (/* binding */ min),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "negate": () => (/* binding */ negate),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "rotate": () => (/* binding */ rotate),
/* harmony export */   "round": () => (/* binding */ round),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "scaleAndAdd": () => (/* binding */ scaleAndAdd),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "sqrDist": () => (/* binding */ sqrDist),
/* harmony export */   "sqrLen": () => (/* binding */ sqrLen),
/* harmony export */   "squaredDistance": () => (/* binding */ squaredDistance),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "transformMat2": () => (/* binding */ transformMat2),
/* harmony export */   "transformMat2d": () => (/* binding */ transformMat2d),
/* harmony export */   "transformMat3": () => (/* binding */ transformMat3),
/* harmony export */   "transformMat4": () => (/* binding */ transformMat4),
/* harmony export */   "zero": () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(2);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {ReadonlyVec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues(x, y) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the source vector
 * @returns {vec2} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */

function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to ceil
 * @returns {vec2} out
 */

function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to floor
 * @returns {vec2} out
 */

function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to round
 * @returns {vec2} out
 */

function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0],
      y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0],
      y = a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0],
      y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to invert
 * @returns {vec2} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to normalize
 * @returns {vec2} out
 */

function normalize(out, a) {
  var x = a[0],
      y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Calculates the dot product of two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */

function lerp(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */

function random(out, scale) {
  scale = scale || 1.0;
  var r = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {ReadonlyVec2} a The vec2 point to rotate
 * @param {ReadonlyVec2} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec2} out
 */

function rotate(out, a, b, rad) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
      p1 = a[1] - b[1],
      sinC = Math.sin(rad),
      cosC = Math.cos(rad); //perform rotation and translate to correct position

  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
/**
 * Get the angle between two 2D vectors
 * @param {ReadonlyVec2} a The first operand
 * @param {ReadonlyVec2} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var x1 = a[0],
      y1 = a[1],
      x2 = b[0],
      y2 = b[1],
      // mag is the product of the magnitudes of a and b
  mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2),
      // mag &&.. short circuits if mag == 0
  cosine = mag && (x1 * x2 + y1 * y2) / mag; // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1

  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1];
  var b0 = b[0],
      b1 = b[1];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
}
/**
 * Alias for {@link vec2.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec2.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec2.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link vec2.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec2.distance}
 * @function
 */

var dist = distance;
/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

/***/ }),

/***/ "./src/js/lib/gl-matrix/vec3.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/vec3.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "angle": () => (/* binding */ angle),
/* harmony export */   "bezier": () => (/* binding */ bezier),
/* harmony export */   "ceil": () => (/* binding */ ceil),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "cross": () => (/* binding */ cross),
/* harmony export */   "dist": () => (/* binding */ dist),
/* harmony export */   "distance": () => (/* binding */ distance),
/* harmony export */   "div": () => (/* binding */ div),
/* harmony export */   "divide": () => (/* binding */ divide),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "floor": () => (/* binding */ floor),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "hermite": () => (/* binding */ hermite),
/* harmony export */   "inverse": () => (/* binding */ inverse),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "max": () => (/* binding */ max),
/* harmony export */   "min": () => (/* binding */ min),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "negate": () => (/* binding */ negate),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "rotateX": () => (/* binding */ rotateX),
/* harmony export */   "rotateY": () => (/* binding */ rotateY),
/* harmony export */   "rotateZ": () => (/* binding */ rotateZ),
/* harmony export */   "round": () => (/* binding */ round),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "scaleAndAdd": () => (/* binding */ scaleAndAdd),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "sqrDist": () => (/* binding */ sqrDist),
/* harmony export */   "sqrLen": () => (/* binding */ sqrLen),
/* harmony export */   "squaredDistance": () => (/* binding */ squaredDistance),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "transformMat3": () => (/* binding */ transformMat3),
/* harmony export */   "transformMat4": () => (/* binding */ transformMat4),
/* harmony export */   "transformQuat": () => (/* binding */ transformQuat),
/* harmony export */   "zero": () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {ReadonlyVec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the source vector
 * @returns {vec3} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */

function set(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to ceil
 * @returns {vec3} out
 */

function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to floor
 * @returns {vec3} out
 */

function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to round
 * @returns {vec3} out
 */

function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
/**
 * Calculates the squared length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {vec3} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to invert
 * @returns {vec3} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @param {ReadonlyVec3} c the third operand
 * @param {ReadonlyVec3} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec3} out
 */

function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */

function random(out, scale) {
  scale = scale || 1.0;
  var r = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2.0 * Math.PI;
  var z = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2.0 - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
}
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */

function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec3} out
 */

function transformQuat(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2]; // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);

  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2; // vec3.scale(uuv, uuv, 2);

  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateX(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateY(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateZ(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2],
      mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
      mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
      mag = mag1 * mag2,
      cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec3 to zero
 *
 * @param {vec3} out the receiving vector
 * @returns {vec3} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec3} a The first vector.
 * @param {ReadonlyVec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
}
/**
 * Alias for {@link vec3.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec3.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link vec3.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec3.distance}
 * @function
 */

var dist = distance;
/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

/***/ }),

/***/ "./src/js/lib/gl-matrix/vec4.js":
/*!**************************************!*\
  !*** ./src/js/lib/gl-matrix/vec4.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "ceil": () => (/* binding */ ceil),
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "create": () => (/* binding */ create),
/* harmony export */   "cross": () => (/* binding */ cross),
/* harmony export */   "dist": () => (/* binding */ dist),
/* harmony export */   "distance": () => (/* binding */ distance),
/* harmony export */   "div": () => (/* binding */ div),
/* harmony export */   "divide": () => (/* binding */ divide),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "equals": () => (/* binding */ equals),
/* harmony export */   "exactEquals": () => (/* binding */ exactEquals),
/* harmony export */   "floor": () => (/* binding */ floor),
/* harmony export */   "forEach": () => (/* binding */ forEach),
/* harmony export */   "fromValues": () => (/* binding */ fromValues),
/* harmony export */   "inverse": () => (/* binding */ inverse),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "lerp": () => (/* binding */ lerp),
/* harmony export */   "max": () => (/* binding */ max),
/* harmony export */   "min": () => (/* binding */ min),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "multiply": () => (/* binding */ multiply),
/* harmony export */   "negate": () => (/* binding */ negate),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "random": () => (/* binding */ random),
/* harmony export */   "round": () => (/* binding */ round),
/* harmony export */   "scale": () => (/* binding */ scale),
/* harmony export */   "scaleAndAdd": () => (/* binding */ scaleAndAdd),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "sqrDist": () => (/* binding */ sqrDist),
/* harmony export */   "sqrLen": () => (/* binding */ sqrLen),
/* harmony export */   "squaredDistance": () => (/* binding */ squaredDistance),
/* harmony export */   "squaredLength": () => (/* binding */ squaredLength),
/* harmony export */   "str": () => (/* binding */ str),
/* harmony export */   "sub": () => (/* binding */ sub),
/* harmony export */   "subtract": () => (/* binding */ subtract),
/* harmony export */   "transformMat4": () => (/* binding */ transformMat4),
/* harmony export */   "transformQuat": () => (/* binding */ transformQuat),
/* harmony export */   "zero": () => (/* binding */ zero)
/* harmony export */ });
/* harmony import */ var _common_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./common.js */ "./src/js/lib/gl-matrix/common.js");

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create() {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);

  if (_common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */

function clone(a) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */

function fromValues(x, y, z, w) {
  var out = new _common_js__WEBPACK_IMPORTED_MODULE_0__.ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {vec4} out
 */

function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {vec4} out
 */

function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {vec4} out
 */

function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {vec4} out
 */

function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {vec4} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {vec4} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} result the receiving vector
 * @param {ReadonlyVec4} U the first vector
 * @param {ReadonlyVec4} V the second vector
 * @param {ReadonlyVec4} W the third vector
 * @returns {vec4} result
 */

function cross(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
      B = v[0] * w[2] - v[2] * w[0],
      C = v[0] * w[3] - v[3] * w[0],
      D = v[1] * w[2] - v[2] * w[1],
      E = v[1] * w[3] - v[3] * w[1],
      F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */

function random(out, scale) {
  scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;

  var v1, v2, v3, v4;
  var s1, s2;

  do {
    v1 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2 - 1;
    v2 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);

  do {
    v3 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2 - 1;
    v4 = _common_js__WEBPACK_IMPORTED_MODULE_0__.RANDOM() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */

function transformMat4(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec4} out
 */

function transformQuat(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  return Math.abs(a0 - b0) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _common_js__WEBPACK_IMPORTED_MODULE_0__.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
}
/**
 * Alias for {@link vec4.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */

var mul = multiply;
/**
 * Alias for {@link vec4.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec4.distance}
 * @function
 */

var dist = distance;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec4.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

/***/ }),

/***/ "./src/js/resources/mesh.js":
/*!**********************************!*\
  !*** ./src/js/resources/mesh.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Mesh": () => (/* binding */ Mesh),
/* harmony export */   "PlaneMesh": () => (/* binding */ PlaneMesh),
/* harmony export */   "QuadMesh": () => (/* binding */ QuadMesh),
/* harmony export */   "SphereMesh": () => (/* binding */ SphereMesh),
/* harmony export */   "Triangle3DMesh": () => (/* binding */ Triangle3DMesh)
/* harmony export */ });
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/color/color.js */ "./src/js/lib/color/color.js");
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");



class Mesh {
  vertices = []
  indices = []
  uvs = []
  colors = []
  normals = []

  glVao = null
  glVbo = {
    pos: null,
    uv: null,
    normal: null,
  }

  shader = null

  #valid = false

  get valid () {
    return this.#valid && this.shader
  }

  get vertexCount () {
    return this.vertices.length / 3
  }

  constructor (app) {
    this.app = app
  }

  deleteResourceFromGL () {
    const gl = this.app.renderServer.gl
    if (!gl) return

    for (let n in this.glVbo) {
      const vbo = this.glVbo[n]
      if (gl.isBuffer(vbo)) {
        gl.deleteBuffer(vbo)
        this.glVbo[n] = null
      }
    }

    if(gl.isVertexArray(this.glVao)) {
      gl.deleteVertexArray(this.glVao)
    }
  }

  createResourceFromGL () {
    const gl = this.app.renderServer.gl
    if (!gl) return

    this.glVbo.pos = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.pos)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)

    this.glVbo.uv = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.uv)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)

    this.glVbo.normal = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.normal)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW)

    this.glVao = gl.createVertexArray()
    gl.bindVertexArray(this.glVao)

    gl.enableVertexAttribArray(0)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.pos)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(1)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.uv)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(2)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glVbo.normal)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)
  }

  syncWithGL () {
    this.#valid = false
    this.deleteResourceFromGL()
    this.createResourceFromGL()
    this.#valid = true
  }

  release () {
    this.deleteResourceFromGL()
  }

  calcNormals () {
    const vertCount = this.vertices.length / 3.0
    for (let i=0; i<vertCount; i+=3) {
      const i1 = (i)*3
      const i2 = (i+1)*3
      const i3 = (i+2)*3
      const a = [
        this.vertices[i2]-this.vertices[i1],
        this.vertices[i2+1]-this.vertices[i1+1],
        this.vertices[i2+2]-this.vertices[i1+2],
      ]
      const b = [
        this.vertices[i3]-this.vertices[i1],
        this.vertices[i3+1]-this.vertices[i1+1],
        this.vertices[i3+2]-this.vertices[i1+2],
      ]
      const cross = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_1__.vec3.cross(_lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_1__.vec3.create(), a, b)
      _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_1__.vec3.normalize(cross, cross)
      this.normals.push(...cross)
      this.normals.push(...cross)
      this.normals.push(...cross)
    }
  }
}

class Triangle3DMesh extends Mesh {
  originVertices = [
    0.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    2.0, 0.0, 0.0,
    0.5, 1.0, 0.0,
    1.5, 1.0, 0.0,
    1.0, 2.0, 0.0,

    0.0, 0.0, -2.0,
    1.0, 0.0, -2.0,
    2.0, 0.0, -2.0,
    0.5, 1.0, -2.0,
    1.5, 1.0, -2.0,
    1.0, 2.0, -2.0,
  ]

  constructor (app) {
    super(app)

    this.indices = [
      0, 1, 3,
      1, 4, 3,
      1, 2, 4,
      3, 4, 5,
  
      6, 9, 7,
      7, 9, 10,
      7, 10, 8,
      9, 11, 10,
  
      0, 3, 6,
      3, 9, 6,
      3, 5, 9,
      5, 11, 9,
  
      2, 8, 4,
      4, 8, 10,
      4, 10, 5,
      5, 10, 11,
  
      0, 6, 8,
      8, 2, 0,
    ]

    for (var i=0; i<this.indices.length; ++i) {
      const a = this.indices[i]
      this.vertices.push(this.originVertices[a*3], this.originVertices[a*3+1], this.originVertices[a*3+2])

      if (i >= 24) {
        this.uvs.push(this.originVertices[a*3+2], this.originVertices[a*3+1])
        this.colors.push(this.originVertices[a*3+2], this.originVertices[a*3+1])
      } else {
        this.uvs.push(this.originVertices[a*3], this.originVertices[a*3+1])
        this.colors.push(this.originVertices[a*3], this.originVertices[a*3+1])
      }
    }

    for (var i=0; i<this.indices.length; i+=3) {
      const a = this.indices[i]
      const b = this.indices[i+1]
      const c = this.indices[i+2]

      const v1 = [
        this.originVertices[a*3] - this.originVertices[b*3],
        this.originVertices[a*3+1] - this.originVertices[b*3+1],
        this.originVertices[a*3+2] - this.originVertices[b*3+2],
      ]
      const v2 = [
        this.originVertices[a*3] - this.originVertices[c*3],
        this.originVertices[a*3+1] - this.originVertices[c*3+1],
        this.originVertices[a*3+2] - this.originVertices[c*3+2],
      ]
      const cross = [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0],
      ]

      this.normals.push(...cross)
      this.normals.push(...cross)
      this.normals.push(...cross)
    }

    this.syncWithGL()
  }
}

class PlaneMesh extends Mesh {

  #size = [1, 1]
  #unitSize = [10, 10]
  #color = [0.5, 0.5, 1.0]

  constructor (app) {
    super(app)
    this.updateVertData()
  }

  updateVertData () {
    this.clearVertData()
    this.generateVertData()
    this.syncWithGL()
  }

  clearVertData () {
    this.vertices = []
    this.indices = []
    this.uvs = []
    this.colors = []
    this.normals = []
  }

  generateVertData () {
    const origin = [-this.#unitSize[0]*this.#size[0]/2.0, -this.#unitSize[1]*this.#size[0]/2.0]
    for (let i=0; i<this.#size[0]; ++i) {
      for (let j=0; j<this.#size[1]; ++j) {
        const offset = [
          origin[0] + i * this.#unitSize[0],
          origin[1] + j * this.#unitSize[1],
        ]
        this.generateSquare(offset)
      }
    }
    this.calcNormals()
  }

  generateSquare (offset) {
    const x = offset[0]
    const z = offset[1]
    const w = this.#unitSize[0]
    const h = this.#unitSize[1]
    const sw = w * this.#size[0]
    const sh = w * this.#size[1]
    const uvOffset = [0.5, 0.5]
    this.vertices.push(x, 0.0, z)
    this.uvs.push(x / sw + uvOffset[0], z / sh + uvOffset[1])
    this.colors.push(...this.#color)
    this.vertices.push(x + w, 0.0, z)
    this.uvs.push((x + w) / sw + uvOffset[0], z / sh + uvOffset[1])
    this.colors.push(...this.#color)
    this.vertices.push(x, 0.0, z + h)
    this.uvs.push(x / sw + uvOffset[0], (z + h) / sh + uvOffset[1])
    this.colors.push(...this.#color)

    this.vertices.push(x + w, 0.0, z)
    this.uvs.push((x + w) / sw + uvOffset[0], z / sh + uvOffset[1])
    this.colors.push(...this.#color)
    this.vertices.push(x + w, 0.0, z + h)
    this.uvs.push((x + w) / sw + uvOffset[0], (z + h) / sh + uvOffset[1])
    this.colors.push(...this.#color)
    this.vertices.push(x, 0.0, z + h)
    this.uvs.push(x / sw + uvOffset[0], (z + h) / sh + uvOffset[1])
    this.colors.push(...this.#color)
  }
}

class SphereMesh extends Mesh {

  #divisions = 10
  #color = [0.5, 0.5, 1.0]
  #flat = false

  constructor (app, options) {
    super(app)
    if (options) {
      this.#divisions = options.divisions ?? this.#divisions
      this.#color = options.color ?? this.#color
      this.#flat = options.flat ?? this.#flat
    }
    this.updateVertData()
  }

  updateVertData () {
    this.clearVertData()
    this.generateVertData()
    this.syncWithGL()
  }

  clearVertData () {
    this.vertices = []
    this.indices = []
    this.uvs = []
    this.colors = []
    this.normals = []
  }

  generateVertData () {
    const latitudeBands = this.#divisions
    const longitudeBands = this.#divisions

    const rawVertices = []
    const rawUVs = []
    const rawColors = []
    const rawNoramls = []

    for (let latNumber=0; latNumber <= latitudeBands; ++latNumber) {
      const theta = latNumber * Math.PI / latitudeBands
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)
      for (let longNumber=0; longNumber <= longitudeBands; ++longNumber) {
        const phi = longNumber * 2 * Math.PI / longitudeBands
        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)

        const x = cosPhi * sinTheta
        const y = cosTheta
        const z = sinPhi * sinTheta
        const u = 1 - (longNumber / longitudeBands)
        const v = latNumber / latitudeBands

        // rawUVs.push((x+1.0)*0.5, (y+1.0)*0.5)
        rawUVs.push(u, v)
        rawNoramls.push(x, y, z)
        rawColors.push(...this.#color)
        rawVertices.push(x, y, z)
      }
    }

    for (let latNumber=0; latNumber < latitudeBands; ++latNumber) {
      for (let longNumber=0; longNumber < longitudeBands; ++longNumber) {
        const first = (latNumber*(longitudeBands+1)) + longNumber
        const second = first + longitudeBands + 1
        this.indices.push(first, second, first+1)
        this.indices.push(second, second+1, first+1)
      }
    }

    for (let i=0; i<this.indices.length; ++i) {
      const id = this.indices[i]

      this.vertices.push(rawVertices[id*3], rawVertices[id*3+1], rawVertices[id*3+2])
      this.uvs.push(rawUVs[id*2], rawUVs[id*2+1])
      this.colors.push(rawColors[id*3], rawColors[id*3+1], rawColors[id*3+2])
      if (!this.#flat) {
        this.normals.push(rawNoramls[id*3], rawNoramls[id*3+1], rawNoramls[id*3+2])
      }
    }

    if (this.#flat) {
      for (let i=0; i<this.indices.length; i+=3) {
        const a = this.indices[i]*3
        const b = this.indices[i+1]*3
        const c = this.indices[i+2]*3
  
        const n1 = [rawNoramls[a], rawNoramls[a+1], rawNoramls[a+2]]
        const n2 = [rawNoramls[b], rawNoramls[b+1], rawNoramls[b+2]]
        const n3 = [rawNoramls[c], rawNoramls[c+1], rawNoramls[c+2]]
  
        const n = [
          (n1[0]+n2[0]+n3[0])/3,
          (n1[1]+n2[1]+n3[1])/3,
          (n1[2]+n2[2]+n3[2])/3,
        ]
  
        this.normals.push(...n)
        this.normals.push(...n)
        this.normals.push(...n)
      }
    }
  }

}

class QuadMesh extends Mesh {

  #axis = 'z'

  constructor (app, options) {
    super(app)

    if (options) {
      this.#axis = options.axis ?? this.#axis
      if (this.#axis !== 'z' && this.#axis != 'x' && this.#axis != 'y') {
        console.error('Unreconized axis %s', this.#axis)
        this.#axis = 'z'
      }
    }

    this.updateVertData()
  }

  updateVertData () {
    this.clearVertData()
    this.generateVertData()
    this.syncWithGL()
  }

  clearVertData () {
    this.vertices = []
    this.indices = []
    this.uvs = []
    this.colors = []
    this.normals = []
  }

  generateVertData () {
    const originVertice = []
    const nor = []
    if (this.#axis === 'x') {
      originVertice.push(0, 0.5, 0.5)
      originVertice.push(0, 0.5, -0.5)
      originVertice.push(0, -0.5, -0.5)
      originVertice.push(0, -0.5, 0.5)
      nor.push(1, 0, 0)
    } else if (this.#axis === 'y') {
      originVertice.push(-0.5, 0, -0.5)
      originVertice.push(0.5, 0, -0.5)
      originVertice.push(0.5, 0, 0.5)
      originVertice.push(-0.5, 0, 0.5)
      nor.push(0, 1, 0)
    } else if (this.#axis == 'z') {
      originVertice.push(-0.5, 0.5, 0)
      originVertice.push(0.5, 0.5, 0)
      originVertice.push(0.5, -0.5, 0)
      originVertice.push(-0.5, -0.5, 0)
      nor.push(0, 0, 1)
    }

    const originUVs = [
      0, 1,
      1, 1,
      1, 0,
      0, 0,
    ]

    this.indices = [
      2, 1, 0,
      3, 2, 0,
    ]

    for (let i=0; i<this.indices.length; ++i) {
      const x = originVertice[this.indices[i]*3+0]
      const y = originVertice[this.indices[i]*3+1]
      const z = originVertice[this.indices[i]*3+2]
      this.vertices.push(x, y, z)

      const u = originUVs[this.indices[i]*2+0]
      const v = originUVs[this.indices[i]*2+1]
      this.uvs.push(u, v)
    }

    for (let i=0; i<this.indices.length; ++i) {
      this.normals.push(...nor)
    }
  }
}



/***/ }),

/***/ "./src/js/resources/particle_mesh.js":
/*!*******************************************!*\
  !*** ./src/js/resources/particle_mesh.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ParticleMesh": () => (/* binding */ ParticleMesh)
/* harmony export */ });

class ParticleMesh {

  mesh = null
  instanceGlVbo = null
  glVao = null
  #valid = false
  bufferSize = 0

  constructor (app, mesh, bufferSize) {
    this.app = app
    this.mesh = mesh
    this.bufferSize = bufferSize
    this.syncWithGL()

    if (this.glVao)
      this.#valid = true
  }

  isValid () {
    return this.#valid
  }

  deleteResourceFromGL () {
    const gl = this.app.renderServer.gl
    if (!gl) return

    if(gl.isVertexArray(this.glVao)) {
      gl.deleteVertexArray(this.glVao)
      this.glVao = null
    }
  }

  createResourceFromGL () {
    const gl = this.app.renderServer.gl
    if (!gl) return
    if (this.mesh === null) return
    if (this.bufferSize <= 0) return

    const transformLen = 4*4*4 // 4*4 in bytes
    const trasnformOffset = 0
    const colorLen = 4*4 // rgba in bytes
    const colorOffset = transformLen
    const uvOffsetLen = 2*4 // uv in bytes
    const uvOffsetOffset = colorOffset + colorLen
    const stride = transformLen + colorLen + uvOffsetLen

    this.instanceGlVbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.bufferData(gl.ARRAY_BUFFER, this.bufferSize * stride, gl.DYNAMIC_DRAW)

    this.glVao = gl.createVertexArray()
    gl.bindVertexArray(this.glVao)

    gl.enableVertexAttribArray(0)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.glVbo.pos)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(1)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.glVbo.uv)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(2)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.glVbo.normal)
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(3) // transform[0]
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, trasnformOffset+0*4*4)
    gl.vertexAttribDivisor(3, 1)

    gl.enableVertexAttribArray(4) // transform[1]
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(4, 4, gl.FLOAT, false, stride, trasnformOffset+1*4*4)
    gl.vertexAttribDivisor(4, 1)

    gl.enableVertexAttribArray(5) // transform[2]
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(5, 4, gl.FLOAT, false, stride, trasnformOffset+2*4*4)
    gl.vertexAttribDivisor(5, 1)

    gl.enableVertexAttribArray(6) // transform[3]
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(6, 4, gl.FLOAT, false, stride, trasnformOffset+3*4*4)
    gl.vertexAttribDivisor(6, 1)

    gl.enableVertexAttribArray(7) // color
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(7, 4, gl.FLOAT, false, stride, colorOffset)
    gl.vertexAttribDivisor(7, 1)

    gl.enableVertexAttribArray(8) // uvOffset
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.vertexAttribPointer(8, 2, gl.FLOAT, false, stride, uvOffsetOffset)
    gl.vertexAttribDivisor(8, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)
  }

  syncWithGL () {
    this.deleteResourceFromGL()
    this.createResourceFromGL()
  }

  updateInstanceData (data) {
    const gl = this.app.renderServer.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlVbo)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data))
  }
}



/***/ }),

/***/ "./src/js/resources/shader.js":
/*!************************************!*\
  !*** ./src/js/resources/shader.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shader": () => (/* binding */ Shader),
/* harmony export */   "SimpleMeshShader": () => (/* binding */ SimpleMeshShader)
/* harmony export */ });
class Shader {

  glProgram = null
  parameters = {}

  constructor (app) {
    this.app = app
  }

  setParametersToGL () {

  }
}

const CULL_MODE = {
  NONE: 0,
  BACK: 1,
  FRONT: 2,
}

class SimpleMeshShader extends Shader {

  parameters = {
    tex1: null,
    tex2: null,
    cullMode: CULL_MODE.BACK,
    color: [1, 1, 1, 1],
  }

  #cache = {
    paramLocations: {},
  }

  constructor (app, vsText, fsText) {
    super(app)

    const gl = this.app.renderServer.gl
    if (!gl) throw new Error('Invalid gl!')

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, vsText)
    gl.shaderSource(fragShader, fsText)
    gl.compileShader(vertShader)
    gl.compileShader(fragShader)
    const vertInfo = gl.getShaderInfoLog(vertShader)
    const fragInfo = gl.getShaderInfoLog(fragShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    const link_status = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!link_status) {
      var errorText = 'Can\'t link gl program!\n' + vertInfo + '\n' + fragInfo + '\n' + gl.getProgramInfoLog(program)
      throw new Error(errorText)
    }
    this.glProgram = program
  }

  use () {
    const gl = this.app.renderServer.gl
    gl.useProgram(this.glProgram)
  }

  uploadParameter (param, value, integer=false) {
    const gl = this.app.renderServer.gl

    let location = this.#cache.paramLocations[param]
    if (location === null) return
    if (location === undefined) {
      location = gl.getUniformLocation(this.glProgram, param)
      this.#cache.paramLocations[param] = location
      if (location === null) {
        console.warn(`try to upload to a null shader param: ${param}`)
        return
      }
    }

    if (value instanceof Array || value instanceof Float32Array || value instanceof Int32Array) {
      const len = value.length
      switch (len) {
        case 1:
          if (integer) gl.uniform1iv(location, value)
          else gl.uniform1fv(location, value)
          break
        case 2:
          if (integer) gl.uniform2iv(location, value)
          else gl.uniform2fv(location, value)
          break
        case 3:
          if (integer) gl.uniform3iv(location, value)
          else gl.uniform3fv(location, value)
          break
        case 4:
          if (integer) gl.uniform4iv(location, value)
          else gl.uniform4fv(location, value)
          break
        case 9:
          gl.uniformMatrix3fv(location, false, value)
          break
        case 16:
          gl.uniformMatrix4fv(location, false, value)
          break
      }
    } else {
      if (integer) gl.uniform1i(location, value)
      else gl.uniform1f(location, value)
    }
  }

  bindTexture (index, texture) {
    const gl = this.app.renderServer.gl
    gl.activeTexture(gl[`TEXTURE${index}`])
    gl.bindTexture(gl.TEXTURE_2D, texture.glTex)
    this.uploadParameter(`tex${index}`, index, true)
  }

  setParametersToGL () {
    if (this.parameters.tex1) {
      this.bindTexture(0, this.parameters.tex1)
    }
    
    if (this.parameters.tex2) {
      this.bindTexture(1, this.parameters.tex2)
    }

    this.uploadParameter('cullMode', this.parameters.cullMode, true)
    this.uploadParameter('color', this.parameters.color)
  }
}

Shader.CULL_MODE = CULL_MODE



/***/ }),

/***/ "./src/js/resources/texture.js":
/*!*************************************!*\
  !*** ./src/js/resources/texture.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Texutre {

  glTex = null
  image = null

  constructor (app, image) {
    this.app = app
    this.image = image
    const gl = this.app.renderServer.gl
    this.glTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.glTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    if (!gl.isTexture(this.glTex)) {
      console.error(image)
      throw new Error('The texture is invalid!')
    }
  }
  
  get width () {
    return this.image.width
  }

  get height () {
    return this.image.height
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Texutre);

/***/ }),

/***/ "./src/js/scene.js":
/*!*************************!*\
  !*** ./src/js/scene.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _entity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entity.js */ "./src/js/entity.js");



class Scene {
  idCount = 0

  entityCollection = []
  destroyedEntityQueue = []

  constructor() {

  }

  getNewId () {
    return this.idCount++
  }

  enter () {

  }
  
  exit () {
    
  }

  update(delta) {
    this.callEntityCollectionFunction('preUpdate', delta)
    this.callEntityCollectionFunction('update', delta)
    this.callEntityCollectionFunction('afterUpdate', delta)

    if (this.destroyedEntityQueue.length > 0) {
      const marked = {}
      for (let entity of this.destroyedEntityQueue) {
        if (!marked[entity.id]) {
          marked[entity.id] = true
          this.destroyEntity(entity)
        }
      }
      this.destroyedEntityQueue = []
    }
  }

  callEntityCollectionFunction(funcName, ...args) {
    const callIt = (entity) => {
      if (entity.activated && entity[funcName]) entity[funcName](...args)
    }
    const trevalTransTree = (root) => {
      for (let c of root.children) {
        if (c.entity.activated && c.childCount > 0) {
          trevalTransTree(c)
        }
        callIt(c.entity)
      }
    }

    for (let entity of this.entityCollection) {
      const transform = entity.getComponentRaw(_component_transform_js__WEBPACK_IMPORTED_MODULE_0__["default"])
      if (entity.activated && transform && transform.parent == null && transform.childCount > 0) {
        trevalTransTree(transform)
      }
      if (!transform || transform.parent == null) {
        callIt(entity)
      }
    }
  }

  createEntity() {
    const e = new _entity_js__WEBPACK_IMPORTED_MODULE_1__["default"]()
    e.id = this.getNewId()
    e.scene = this
    this.entityCollection.push(e)
    return e
  }

  destroyEntity(e) {
    const pos = this.entityCollection.indexOf(e)
    
    if (pos >= 0) {
      const transform = e.getComponentRaw(_component_transform_js__WEBPACK_IMPORTED_MODULE_0__["default"])
      if (transform) {
        for (let c of transform.children) {
          this.destroyEntity(c.entity)
        }
      }

      const old = this.entityCollection
      this.entityCollection = []
      for (let i=0; i<old.length; ++i) {
        if (i !== pos) {
          this.entityCollection.push(old[i])
        }
      }
    }
    e.destroyed()
  }

  input (event) {
    this.callEntityCollectionFunction('input', event)
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Scene);

/***/ }),

/***/ "./src/js/test1/fire_scene1.js":
/*!*************************************!*\
  !*** ./src/js/test1/fire_scene1.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FireScene1": () => (/* binding */ FireScene1)
/* harmony export */ });
/* harmony import */ var _scene_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scene.js */ "./src/js/scene.js");
/* harmony import */ var _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/first_person_controller.js */ "./src/js/component/first_person_controller.js");
/* harmony import */ var _resources_mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../resources/mesh.js */ "./src/js/resources/mesh.js");
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_particle_emitter_controller_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../component/particle_emitter_controller.js */ "./src/js/component/particle_emitter_controller.js");
/* harmony import */ var _resources_shader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../resources/shader.js */ "./src/js/resources/shader.js");
/* harmony import */ var _component_camera_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../component/camera.js */ "./src/js/component/camera.js");
/* harmony import */ var _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../component/custom_animate_1.js */ "./src/js/component/custom_animate_1.js");
/* harmony import */ var _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../component/mesh_renderer.js */ "./src/js/component/mesh_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _prefabs_fps_camera_fps_camera_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./prefabs/fps_camera/fps_camera.js */ "./src/js/test1/prefabs/fps_camera/fps_camera.js");
/* harmony import */ var _core_utils_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../core/utils.js */ "./src/js/core/utils.js");
/* harmony import */ var _prefabs_fire_fire_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./prefabs/fire/fire.js */ "./src/js/test1/prefabs/fire/fire.js");
















class FireScene1 extends _scene_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor () {
    super()
  }

  async setUpScene () {
    const app = this.app
    const resourceServer = app.resourceServer
    const texture = await resourceServer.load('/simple_particle_system' + 'assets/images/flames.png')

    ;(0,_prefabs_fps_camera_fps_camera_js__WEBPACK_IMPORTED_MODULE_12__.FPSCamera)(app, [0.05, 1.54, 5.12])
    ;(0,_prefabs_fire_fire_js__WEBPACK_IMPORTED_MODULE_14__.Fire)(app, texture, [0, 0, 0])
  }

  enter () {
    const app = this.app
    app.inputManager.addInputAction('move_left', KeyboardEvent, 'KeyA')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'KeyD')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'KeyW')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'KeyS')
    app.inputManager.addInputAction('interact', KeyboardEvent, 'KeyE')

    app.inputManager.addInputAction('move_left', KeyboardEvent, 'ArrowLeft')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'ArrowRight')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'ArrowUp')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'ArrowDown')

    this.setUpScene().then()
  }
}



/***/ }),

/***/ "./src/js/test1/firework_scene1.js":
/*!*****************************************!*\
  !*** ./src/js/test1/firework_scene1.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FireworkScene1": () => (/* binding */ FireworkScene1)
/* harmony export */ });
/* harmony import */ var _scene_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scene.js */ "./src/js/scene.js");
/* harmony import */ var _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/first_person_controller.js */ "./src/js/component/first_person_controller.js");
/* harmony import */ var _resources_mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../resources/mesh.js */ "./src/js/resources/mesh.js");
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_particle_emitter_controller_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../component/particle_emitter_controller.js */ "./src/js/component/particle_emitter_controller.js");
/* harmony import */ var _resources_shader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../resources/shader.js */ "./src/js/resources/shader.js");
/* harmony import */ var _component_camera_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../component/camera.js */ "./src/js/component/camera.js");
/* harmony import */ var _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../component/custom_animate_1.js */ "./src/js/component/custom_animate_1.js");
/* harmony import */ var _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../component/mesh_renderer.js */ "./src/js/component/mesh_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");
/* harmony import */ var _prefabs_fps_camera_fps_camera_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./prefabs/fps_camera/fps_camera.js */ "./src/js/test1/prefabs/fps_camera/fps_camera.js");
/* harmony import */ var _prefabs_rocket_rocket_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./prefabs/rocket/rocket.js */ "./src/js/test1/prefabs/rocket/rocket.js");
/* harmony import */ var _prefabs_explosion_explosion_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./prefabs/explosion/explosion.js */ "./src/js/test1/prefabs/explosion/explosion.js");
/* harmony import */ var _prefabs_generator_generator_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./prefabs/generator/generator.js */ "./src/js/test1/prefabs/generator/generator.js");
/* harmony import */ var _core_utils_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../core/utils.js */ "./src/js/core/utils.js");


















class FireworkScene1 extends _scene_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor () {
    super()
  }

  async setUpScene () {
    const app = this.app
    const resourceServer = app.resourceServer
    const texture = await resourceServer.load('/simple_particle_system' + 'assets/images/particle.png')

    ;(0,_prefabs_fps_camera_fps_camera_js__WEBPACK_IMPORTED_MODULE_12__.FPSCamera)(app)
    ;(0,_prefabs_generator_generator_js__WEBPACK_IMPORTED_MODULE_15__.Generator)(app, [0, 0, 0], (origin)=>{
      const w = 10
      const h = 10
      const offset = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_11__.vec3.fromValues(_core_utils_js__WEBPACK_IMPORTED_MODULE_16__["default"].randomRange(-w, w), 0, _core_utils_js__WEBPACK_IMPORTED_MODULE_16__["default"].randomRange(-h, h))
      const pos = _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_11__.vec3.add(origin, origin, offset)
      ;(0,_prefabs_rocket_rocket_js__WEBPACK_IMPORTED_MODULE_13__.Rocket)(app, texture, pos)
    }, 100, 2000)
  }

  enter () {
    const app = this.app
    app.inputManager.addInputAction('move_left', KeyboardEvent, 'KeyA')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'KeyD')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'KeyW')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'KeyS')
    app.inputManager.addInputAction('interact', KeyboardEvent, 'KeyE')

    app.inputManager.addInputAction('move_left', KeyboardEvent, 'ArrowLeft')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'ArrowRight')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'ArrowUp')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'ArrowDown')

    this.setUpScene().then()
  }
}



/***/ }),

/***/ "./src/js/test1/prefabs/explosion/explosion.js":
/*!*****************************************************!*\
  !*** ./src/js/test1/prefabs/explosion/explosion.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Explosion": () => (/* binding */ Explosion)
/* harmony export */ });
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../lib/color/color.js */ "./src/js/lib/color/color.js");





function Explosion (app, texture, pos, color) {
  const scene = app.scene
  const e = scene.createEntity()

  e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
  e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]).translate(pos)
  e.addComponent(new _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer({
    texture: texture,
    blendMode: _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.ParticleRenderer.BLEND_MODE.ADD,
    enableBillboard: true,
  }))
  e.addComponent(new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter())

  const particleEmitter = e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter)
  particleEmitter.particleRenderer = e.getComponent(_component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer)
  particleEmitter.param.count = 100
  particleEmitter.param.life = 2000
  particleEmitter.param.explosive = 1
  particleEmitter.param.localCoords = false
  particleEmitter.param.oneShot = true
  particleEmitter.particleParam.emitShape = new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitShapePoint()
  particleEmitter.particleParam.direction[1] = 1
  particleEmitter.particleParam.spread = 180
  particleEmitter.particleParam.scale.param.min = 0.3
  particleEmitter.particleParam.scale.param.max = 1.3
  particleEmitter.particleParam.scale.param.variantFunction = (t) => (1-t)
  particleEmitter.particleParam.color.param.min = color
  particleEmitter.particleParam.color.param.max = color
  particleEmitter.particleParam.color.param.variantFunction = (t) => [1, 1, 1, 1-t]
  particleEmitter.particleParam.linearVelocity.param.min = 0.5
  particleEmitter.particleParam.linearVelocity.param.max = 13.9
  particleEmitter.particleParam.radialAcceleration.param.min = 0
  particleEmitter.particleParam.radialAcceleration.param.max = 11.9
  particleEmitter.particleParam.radialAcceleration.param.variantFunction = (t) => (1-t)
  particleEmitter.particleParam.damping.param.min = 0.01
  particleEmitter.particleParam.damping.param.max = 0.1
  particleEmitter.particleParam.damping.param.variantFunction = (t) => (t)
  particleEmitter.signals.emissionEnd.connect(() => {e.queueDestroy()})

  particleEmitter.startEmission()

  return e
}



/***/ }),

/***/ "./src/js/test1/prefabs/fire/fire.js":
/*!*******************************************!*\
  !*** ./src/js/test1/prefabs/fire/fire.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Fire": () => (/* binding */ Fire)
/* harmony export */ });
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../lib/color/color.js */ "./src/js/lib/color/color.js");
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");






function Fire (app, texture, pos) {
  const scene = app.scene
  const e = scene.createEntity()

  e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
  e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]).translate(pos)
  e.addComponent(new _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer({
    texture: texture,
    blendMode: _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.ParticleRenderer.BLEND_MODE.ADD,
    enableBillboard: true,
  }))
  e.addComponent(new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter())

  const particleEmitter = e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter)
  particleEmitter.particleRenderer = e.getComponent(_component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer)
  particleEmitter.param.count = 100
  particleEmitter.param.life = 1000
  particleEmitter.param.explosive = 0.1
  particleEmitter.param.localCoords = false
  particleEmitter.param.oneShot = false
  particleEmitter.particleParam.emitShape = new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitShapePoint()
  _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_4__.vec3.copy(particleEmitter.particleParam.direction, [0, 1, 0])
  particleEmitter.particleParam.spread = 0
  _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_4__.vec3.copy(particleEmitter.particleParam.gravity, [0, 0, 0])
  particleEmitter.particleParam.scale.param.min = 1
  particleEmitter.particleParam.scale.param.max = 1.8
  particleEmitter.particleParam.scale.param.variantFunction = (t) => (4*t-4*t*t)
  particleEmitter.particleParam.color.param.min = _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.rgbaStringToColor('rgba(225, 203, 36, 1)')
  particleEmitter.particleParam.color.param.max = _lib_color_color_js__WEBPACK_IMPORTED_MODULE_3__.Color.rgbaStringToColor('rgba(217, 69, 5, 1)')
  particleEmitter.particleParam.color.param.variantFunction = (t) => [1, 1, 1, 4*t-4*t*t]
  particleEmitter.particleParam.linearVelocity.param.min = 1.3
  particleEmitter.particleParam.linearVelocity.param.max = 5.2
  particleEmitter.particleParam.radialAcceleration.param.min = 0
  particleEmitter.particleParam.radialAcceleration.param.max = 0
  particleEmitter.particleParam.damping.param.min = 0
  particleEmitter.particleParam.damping.param.max = 0
  particleEmitter.particleParam.animationHFrames = 2
  particleEmitter.particleParam.animationVFrames = 2
  particleEmitter.particleParam.randomAnimationFrame.param.min = 0
  particleEmitter.particleParam.randomAnimationFrame.param.max = 3
  particleEmitter.particleParam.enableRandomAnimationFrame = true


  particleEmitter.startEmission()

  return e
}



/***/ }),

/***/ "./src/js/test1/prefabs/fps_camera/fps_camera.js":
/*!*******************************************************!*\
  !*** ./src/js/test1/prefabs/fps_camera/fps_camera.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FPSCamera": () => (/* binding */ FPSCamera)
/* harmony export */ });
/* harmony import */ var _component_camera_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../component/camera.js */ "./src/js/component/camera.js");
/* harmony import */ var _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../component/first_person_controller.js */ "./src/js/component/first_person_controller.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../component/transform.js */ "./src/js/component/transform.js");





function FPSCamera (app, pos) {
  const scene = app.scene
  const e = scene.createEntity()
  e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
  e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]).translate(pos ?? [-2.42, 7.24, 35.41])
  e.addComponent(new _component_camera_js__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera())
  e.addComponent(new _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.FirstPersonController())
  e.addComponent(new _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.ControlTrigger())
  e.getComponent(_component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.ControlTrigger).controller = e.getComponent('FirstPersonController')
  return e
}



/***/ }),

/***/ "./src/js/test1/prefabs/generator/generator.js":
/*!*****************************************************!*\
  !*** ./src/js/test1/prefabs/generator/generator.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Generator": () => (/* binding */ Generator)
/* harmony export */ });
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _core_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/utils.js */ "./src/js/core/utils.js");



class GeneratorComponent {

  started = false

  param = {
    min: 0,
    max: 1000,
    callback: null,
  }

  constructor (callback, minTime, maxTime) {
    this.param.min = minTime ?? this.param.min
    this.param.max = maxTime ?? this.param.max
    this.param.callback = callback
  }

  onTimeout () {
    if (this.param.callback) {
      this.param.callback(this.transform.globalOrigin)
      setTimeout(()=>{this.onTimeout()}, _core_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].randomRange(this.param.min, this.param.max))
    }
  }

  added () {
    this.transform = this.entity.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_0__["default"])
  }

  update (delta) {
    if (!this.started) {
      this.started = true
      setTimeout(()=>{this.onTimeout()}, _core_utils_js__WEBPACK_IMPORTED_MODULE_1__["default"].randomRange(this.param.min, this.param.max))
    }
  }


}

function Generator (app, origin, generateCallback, minTime, maxTime) {
  const scene = app.scene
  const e = scene.createEntity()
  e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_0__["default"]())
  e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_0__["default"]).translate(origin)
  e.addComponent(new GeneratorComponent(generateCallback, minTime, maxTime))
  return e
}



/***/ }),

/***/ "./src/js/test1/prefabs/rocket/rocket.js":
/*!***********************************************!*\
  !*** ./src/js/test1/prefabs/rocket/rocket.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Rocket": () => (/* binding */ Rocket)
/* harmony export */ });
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _core_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../core/utils.js */ "./src/js/core/utils.js");
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../lib/color/color.js */ "./src/js/lib/color/color.js");
/* harmony import */ var _explosion_explosion_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../explosion/explosion.js */ "./src/js/test1/prefabs/explosion/explosion.js");







class RocketComponent {

  age = 2000
  waitTime = 2000
  moveSpeed = 10

  constructor () {

  }

  added () {
    this.transform = this.entity.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"])
    this.particleEmitter = this.entity.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter)
    this.particleRenderer = this.entity.getComponent(_component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer)
  }

  update (delta) {
    this.age -= delta

    if (this.age > 0) {
      const origin = this.transform.globalOrigin
      origin[1] += this.moveSpeed * delta / 1000
      this.transform.globalOrigin = origin
    } else {
      if (this.particleEmitter.runtime.emitting) {
        this.particleEmitter.stopEmission()
        ;(0,_explosion_explosion_js__WEBPACK_IMPORTED_MODULE_5__.Explosion)(this.entity.app, this.particleRenderer.texture, this.transform.globalOrigin, this.particleEmitter.particleParam.color.param.min)
      }
      this.waitTime -= delta
    }
    if (this.waitTime < 0) {
      this.entity.queueDestroy()
    }
  }
}


const EXPLOSION_COLOR = [
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('0000FF'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('FF00FF'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('DC143C'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('00FFFF'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('00FF7F'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('FFFF00'),
  _lib_color_color_js__WEBPACK_IMPORTED_MODULE_4__.Color.toRGBA('F4A460'),
]

function getExplosionColor () {
  return EXPLOSION_COLOR[Math.floor(_core_utils_js__WEBPACK_IMPORTED_MODULE_3__["default"].randomRange(0, EXPLOSION_COLOR.length))]
}

function Rocket (app, texture, pos) {
  const scene = app.scene
  const e = scene.createEntity()
  e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]())
  e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_2__["default"]).translate(pos)
  e.addComponent(new _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer({
    texture: texture,
    blendMode: _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.ParticleRenderer.BLEND_MODE.ADD,
    enableBillboard: true,
  }))
  e.addComponent(new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter())

  const particleEmitter = e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitter)
  particleEmitter.particleRenderer = e.getComponent(_component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_1__.TextureParticleRenderer)
  particleEmitter.param.count = 20
  particleEmitter.param.explosive = 0
  particleEmitter.param.localCoords = false
  particleEmitter.param.oneShot = false
  particleEmitter.particleParam.emitShape = new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_0__.ParticleEmitShapeCylinder(0, 0, 0.2)
  particleEmitter.particleParam.direction[1] = -1
  particleEmitter.particleParam.spread = 15
  particleEmitter.particleParam.scale.param.min = 0.3
  particleEmitter.particleParam.scale.param.max = 1
  particleEmitter.particleParam.scale.param.variantFunction = (t) => (1-t)
  const color = getExplosionColor()
  particleEmitter.particleParam.color.param.min = color
  particleEmitter.particleParam.color.param.max = color
  particleEmitter.particleParam.linearVelocity.param.min = 4.5
  particleEmitter.particleParam.linearVelocity.param.max = 19.5

  particleEmitter.startEmission()

  e.addComponent(new RocketComponent())

  return e
}



/***/ }),

/***/ "./src/js/test1/test_scene1.js":
/*!*************************************!*\
  !*** ./src/js/test1/test_scene1.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TestScene1": () => (/* binding */ TestScene1)
/* harmony export */ });
/* harmony import */ var _scene_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scene.js */ "./src/js/scene.js");
/* harmony import */ var _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/first_person_controller.js */ "./src/js/component/first_person_controller.js");
/* harmony import */ var _resources_mesh_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../resources/mesh.js */ "./src/js/resources/mesh.js");
/* harmony import */ var _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component/particle_emitter.js */ "./src/js/component/particle_emitter.js");
/* harmony import */ var _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../component/particle_renderer.js */ "./src/js/component/particle_renderer.js");
/* harmony import */ var _component_particle_emitter_controller_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../component/particle_emitter_controller.js */ "./src/js/component/particle_emitter_controller.js");
/* harmony import */ var _resources_shader_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../resources/shader.js */ "./src/js/resources/shader.js");
/* harmony import */ var _component_camera_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../component/camera.js */ "./src/js/component/camera.js");
/* harmony import */ var _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../component/custom_animate_1.js */ "./src/js/component/custom_animate_1.js");
/* harmony import */ var _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../component/mesh_renderer.js */ "./src/js/component/mesh_renderer.js");
/* harmony import */ var _component_transform_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../component/transform.js */ "./src/js/component/transform.js");
/* harmony import */ var _lib_gl_matrix_index_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/gl-matrix/index.js */ "./src/js/lib/gl-matrix/index.js");













class TestScene1 extends _scene_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor () {
    super()
  }

  async setUpScene () {
    const app = this.app
    const resourceServer = app.resourceServer
    
    const mesh = app.createResource(_resources_mesh_js__WEBPACK_IMPORTED_MODULE_2__.Triangle3DMesh)
    const shader = app.createResource(_resources_shader_js__WEBPACK_IMPORTED_MODULE_6__.SimpleMeshShader,
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.vs'),
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.fs'))
    shader.parameters.tex1 = await resourceServer.load('/simple_particle_system' + 'assets/images/chicken.png')
    shader.parameters.tex2 = await resourceServer.load('/simple_particle_system' + 'assets/images/hi.png')
    
    mesh.shader = shader

    // create mesh objects
    var e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.addComponent(new _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__.CustomAnimate1())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([0, 0, -5.0])
    e.addComponent(new _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]())
    e.getComponent(_component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]).mesh = mesh

    e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([5.0, 5.5, -5.0])
    // e.addComponent(new CustomAnimate1())
    e.addComponent(new _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]())
    e.getComponent(_component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]).mesh = mesh

    e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([-5.0, 0, -5.0])
    e.addComponent(new _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__.CustomAnimate1())
    e.addComponent(new _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]())
    e.getComponent(_component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]).mesh = mesh

    const e1 = this.createEntity()
    e1.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e1.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([-5.0, -10.0, 0.0])
    e1.addComponent(new _component_custom_animate_1_js__WEBPACK_IMPORTED_MODULE_8__.CustomAnimate1())
    e1.addComponent(new _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]())
    e1.getComponent(_component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]).mesh = mesh
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).addChild(e1.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]))

    e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([0, 5, 0])
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).scale([2, 2, 2])
    e.addComponent(new _component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]())
    const sphereMesh = app.createResource(_resources_mesh_js__WEBPACK_IMPORTED_MODULE_2__.SphereMesh)
    sphereMesh.shader = app.createResource(_resources_shader_js__WEBPACK_IMPORTED_MODULE_6__.SimpleMeshShader,
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.vs'),
      await resourceServer.load('/simple_particle_system' + 'assets/shaders/unlit3.fs'))
    sphereMesh.shader.parameters.tex1 = await resourceServer.load('/simple_particle_system' + 'assets/images/chicken.png')
    sphereMesh.shader.parameters.tex2 = await resourceServer.load('/simple_particle_system' + 'assets/images/hi.png')
    sphereMesh.shader.parameters.cullMode = _resources_shader_js__WEBPACK_IMPORTED_MODULE_6__.SimpleMeshShader.CULL_MODE.NONE
    e.getComponent(_component_mesh_renderer_js__WEBPACK_IMPORTED_MODULE_9__["default"]).mesh  = sphereMesh

    // create camera
    // pointing to -z defualt
    e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([-2.42, 7.24, 35.41])
    e.addComponent(new _component_camera_js__WEBPACK_IMPORTED_MODULE_7__.PerspectiveCamera())
    e.addComponent(new _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.FirstPersonController())
    e.addComponent(new _component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.ControlTrigger())
    e.getComponent(_component_first_person_controller_js__WEBPACK_IMPORTED_MODULE_1__.ControlTrigger).controller = e.getComponent('FirstPersonController')

    // create particle emitter
    e = this.createEntity()
    e.addComponent(new _component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]())
    e.getComponent(_component_transform_js__WEBPACK_IMPORTED_MODULE_10__["default"]).translate([-10, 5, 10])
    e.addComponent(new _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__.TextureParticleRenderer({
      texture: await resourceServer.load('/simple_particle_system' + 'assets/images/particle.png'),
      // texture: await resourceServer.load(__ROOT_PATH__ + 'assets/images/flames.png'),
      blendMode: _component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__.ParticleRenderer.BLEND_MODE.ADD,
      enableBillboard: true,
    }))
    e.addComponent(new _component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__.ParticleEmitter())
    e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__.ParticleEmitter).particleRenderer = e.getComponent(_component_particle_renderer_js__WEBPACK_IMPORTED_MODULE_4__.TextureParticleRenderer)
    e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__.ParticleEmitter).param.explosive = 0
    e.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__.ParticleEmitter).param.oneShot = false
    const eee = e
    setTimeout(() => {eee.getComponent(_component_particle_emitter_js__WEBPACK_IMPORTED_MODULE_3__.ParticleEmitter).startEmission()}, 100)
    e.addComponent(new _component_particle_emitter_controller_js__WEBPACK_IMPORTED_MODULE_5__.ParticleEmitterController1())
  }

  enter () {
    const app = this.app
    app.inputManager.addInputAction('move_left', KeyboardEvent, 'KeyA')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'KeyD')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'KeyW')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'KeyS')
    app.inputManager.addInputAction('interact', KeyboardEvent, 'KeyE')

    app.inputManager.addInputAction('move_left', KeyboardEvent, 'ArrowLeft')
    app.inputManager.addInputAction('move_right', KeyboardEvent, 'ArrowRight')
    app.inputManager.addInputAction('move_up', KeyboardEvent, 'ArrowUp')
    app.inputManager.addInputAction('move_down', KeyboardEvent, 'ArrowDown')

    this.setUpScene().then()
  }
}



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app.js */ "./src/js/app.js");
/* harmony import */ var _lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/color/color.js */ "./src/js/lib/color/color.js");
/* harmony import */ var _test1_firework_scene1_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./test1/firework_scene1.js */ "./src/js/test1/firework_scene1.js");
/* harmony import */ var _test1_fire_scene1_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./test1/fire_scene1.js */ "./src/js/test1/fire_scene1.js");
/* harmony import */ var _test1_test_scene1_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./test1/test_scene1.js */ "./src/js/test1/test_scene1.js");






Vue.component('vector-3-editor', {
  props: ['value'],
  data: function () {
    return {
    }
  },
  template: `
  <div class="vector-3-editor">
    <el-input-number
      :controls="false"
      size="small"
      placeholder="x"
      v-model="value[0]">
    </el-input-number>
    <el-input-number
      :controls="false"
      size="small"
      placeholder="y"
      v-model="value[1]">
    </el-input-number>
    <el-input-number
      :controls="false"
      size="small"
      placeholder="z"
      v-model="value[2]">
    </el-input-number>
  </div>
  `,
})

Vue.component('color-editor', {
  props: ['value'],
  data: function () {
    return {
      minColor: '#ffffffff',
      maxColor: '#ffffffff',
    }
  },
  methods: {
    onMinColorChanged (v) {
      const color = _lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.rgbaStringToColor(v)
      this.value[0][0] = color[0]
      this.value[0][1] = color[1]
      this.value[0][2] = color[2]
      this.value[0][3] = color[3]
    },
    onMaxColorChanged (v) {
      const color = _lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.rgbaStringToColor(v)
      this.value[1][0] = color[0]
      this.value[1][1] = color[1]
      this.value[1][2] = color[2]
      this.value[1][3] = color[3]
    },
  },
  template: `
  <div class="color-editor">
    Min:
    <el-color-picker v-model="minColor" size="mini" :show-alpha="true" color-format="hex" @change="onMinColorChanged"></el-color-picker>
    Max:
    <el-color-picker v-model="maxColor" size="mini" :show-alpha="true" color-format="hex" @change="onMaxColorChanged"></el-color-picker>
  </div>
  `,
})

Vue.component('variant-function-editor', {
  props: ['value'],
  data: function () {
    return {
      raw: '',
    }
  },
  methods: {
    onRawChanged (v) {
      try {
        const f = (new Function(`return ${v}`)).call()
        if (typeof f !== 'function') {
          throw new Error('It\'s not a function!')
        }
        this.value.func = f
      } catch (e) {
        this.value.func = null
        this.$message.error(`Invalid JavaScript Function: "${v}". ${e}`);
      }
    },
  },
  template: `
  <div class="variant-function-editor">
    <el-input v-model="raw" placeholder="Variant Function" @change="onRawChanged"></el-input>
  </div>
  `,
})

const vueUI = new Vue({
  el: '#vue-ui',
  data: {
    msg: '鼠标右键进入fps模式',
    fps: 0,
    particaleSystemMessage: '',
    ps: {
      count: 20,
      life: 1,
      lifeRandomness: 0,
      explosive: 0,
      spread: 0,
      direction: [0, 0, 0],
      gravity: [0, -9.8, 0],

      scale: [1, 1],
      scaleVariantFunction: {
        enale: false,
        func: null,
      },
      angle: [0, 0],
      damping: [0, 0],
      dampingVariantFunction: {
        enale: false,
        func: null,
      },
      
      linearVelocity: [10, 40],
      angularVelocity: [0, 0],
      angularVelocityVariantFunction: {
        enale: false,
        func: null,
      },
      linearAcceleration: [0, 0],
      linearAccelerationVariantFunction: {
        enale: false,
        func: null,
      },
      radialAcceleration: [0, 0],
      radialAccelerationVariantFunction: {
        enale: false,
        func: null,
      },
      tangentialAcceleration: [0, 0],
      tangentialAccelerationVariantFunction: {
        enale: false,
        func: null,
      },
      orbitalVelocity: [0, 0],
      orbitalVelocityVariantFunction: {
        enale: false,
        func: null,
      },

      color: [_lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.toRGBA(_lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.white), _lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.toRGBA(_lib_color_color_js__WEBPACK_IMPORTED_MODULE_1__.Color.white)],
      colorVariantFunction: {
        enale: false,
        func: null,
      },

      emitShape: {
        value: 0,
        options: [
          {label: 'Point', value: 0},
          {label: 'Sphere', value: 1},
          {label: 'Box', value: 2},
          {label: 'Cylinder', value: 3},
        ],
        sphere: [0, 0],
        box: {
          w: 0,
          h: 0,
          l: 0,
        },
        cylinder: {
          r: [0, 0],
          h: 0,
        },
      },

      collapsePanels: [],
    },
    
  }
})

const app = new _app_js__WEBPACK_IMPORTED_MODULE_0__["default"]('viewer')
app.vueUI = vueUI
window.__app = app

const q = new URLSearchParams(window.location.search)
const scene = q.get('scene')
switch (scene) {
  case 'fire':
    app.run(new _test1_fire_scene1_js__WEBPACK_IMPORTED_MODULE_3__.FireScene1())
    break
  case 'firework':
    app.run(new _test1_firework_scene1_js__WEBPACK_IMPORTED_MODULE_2__.FireworkScene1())
    break
  default:
    app.run(new _test1_test_scene1_js__WEBPACK_IMPORTED_MODULE_4__.TestScene1())
    break
}
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEdnRTtBQUMxQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMscURBQVM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pEdUQ7QUFDaEM7QUFDRjtBQUNTO0FBQ007QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGdFQUFXO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxrRUFBaUI7QUFDN0IsWUFBWSxrRUFBaUI7QUFDN0IsWUFBWSxrRUFBaUI7QUFD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LHlFQUF1QjtBQUNwRSw4Q0FBOEMsMkVBQXlCO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksOERBQVM7QUFDYjtBQUNBLElBQUksOERBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFHK0M7QUFDVTtBQUNHO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELHFFQUFZO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q2xHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUQ2QztBQUNmO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0Qyw2REFBTztBQUNuRDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsS0FBSztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGtFQUFzQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsSUFBSTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Q3NFO0FBQ3RFO0FBQ0EsaUVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdE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QTtBQUNBO0FBQ0Esa0JBQWtCLHVCQUF1QjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHVCQUF1QjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHVCQUF1QjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQix1QkFBdUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDcGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxNQUFNO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsY0FBYyw2REFBWSxDQUFDLDREQUFXLEdBQUcsNkRBQVksQ0FBQyw0REFBVztBQUNqRTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLHlCQUF5QjtBQUNwQyxXQUFXLDBCQUEwQjtBQUNyQyxXQUFXLHVCQUF1QjtBQUNsQyxXQUFXLDRCQUE0QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxnQkFBZ0IsK0NBQUc7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsNkRBQVU7QUFDMUI7QUFDQTtBQUNBLGdCQUFnQixxRUFBYztBQUM5QjtBQUNBO0FBQ0EsZ0JBQWdCLDZEQUFVO0FBQzFCO0FBQ0EsQyIsInNvdXJjZXMiOlsid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2FwcC5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb21wb25lbnQvY2FtZXJhLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2NvbXBvbmVudC9jdXN0b21fYW5pbWF0ZV8xLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2NvbXBvbmVudC9maXJzdF9wZXJzb25fY29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb21wb25lbnQvbWVzaF9yZW5kZXJlci5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb21wb25lbnQvcGFydGljbGVfZW1pdHRlci5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb21wb25lbnQvcGFydGljbGVfZW1pdHRlcl9jb250cm9sbGVyLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2NvbXBvbmVudC9wYXJ0aWNsZV9yZW5kZXJlci5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb21wb25lbnQvdHJhbnNmb3JtLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2NvcmUvaW5wdXRfbWFuYWdlci5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb3JlL3JlbmRlcl9zZXJ2ZXIuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvY29yZS9yZXNvdXJjZV9zZXJ2ZXIuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvY29yZS9zaWduYWxfc2xvdC5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9jb3JlL3V0aWxzLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2VudGl0eS5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9saWIvY29sb3IvY29sb3IuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbGliL2dsLW1hdHJpeC9jb21tb24uanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbGliL2dsLW1hdHJpeC9pbmRleC5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9saWIvZ2wtbWF0cml4L21hdDIuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbGliL2dsLW1hdHJpeC9tYXQyZC5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9saWIvZ2wtbWF0cml4L21hdDMuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbGliL2dsLW1hdHJpeC9tYXQ0LmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2xpYi9nbC1tYXRyaXgvcXVhdC5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9saWIvZ2wtbWF0cml4L3F1YXQyLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL2xpYi9nbC1tYXRyaXgvdmVjMi5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy9saWIvZ2wtbWF0cml4L3ZlYzMuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbGliL2dsLW1hdHJpeC92ZWM0LmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL3Jlc291cmNlcy9tZXNoLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL3Jlc291cmNlcy9wYXJ0aWNsZV9tZXNoLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL3Jlc291cmNlcy9zaGFkZXIuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvcmVzb3VyY2VzL3RleHR1cmUuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvc2NlbmUuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvdGVzdDEvZmlyZV9zY2VuZTEuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvdGVzdDEvZmlyZXdvcmtfc2NlbmUxLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL3Rlc3QxL3ByZWZhYnMvZXhwbG9zaW9uL2V4cGxvc2lvbi5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy90ZXN0MS9wcmVmYWJzL2ZpcmUvZmlyZS5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy90ZXN0MS9wcmVmYWJzL2Zwc19jYW1lcmEvZnBzX2NhbWVyYS5qcyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS8uL3NyYy9qcy90ZXN0MS9wcmVmYWJzL2dlbmVyYXRvci9nZW5lcmF0b3IuanMiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvdGVzdDEvcHJlZmFicy9yb2NrZXQvcm9ja2V0LmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtLy4vc3JjL2pzL3Rlc3QxL3Rlc3Rfc2NlbmUxLmpzIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zaW1wbGVwYXJ0aWNhbHN5c3RlbS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3NpbXBsZXBhcnRpY2Fsc3lzdGVtL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc2ltcGxlcGFydGljYWxzeXN0ZW0vLi9zcmMvanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVGV4dXRyZSBmcm9tICcuL3Jlc291cmNlcy90ZXh0dXJlLmpzJ1xyXG5pbXBvcnQgSW5wdXRNYW5hZ2VyIGZyb20gJy4vY29yZS9pbnB1dF9tYW5hZ2VyLmpzJ1xyXG5pbXBvcnQgeyBSZW5kZXJTZXJ2ZXIgfSBmcm9tICcuL2NvcmUvcmVuZGVyX3NlcnZlci5qcydcclxuaW1wb3J0IHsgUmVzb3VyY2VTZXJ2ZXIsIFRleHRSZXNvdXJjZUxvYWRlciwgVGV4dHVyZVJlc291Y2VMb2FkZXIgfSBmcm9tICcuL2NvcmUvcmVzb3VyY2Vfc2VydmVyLmpzJ1xyXG5cclxuY2xhc3MgQXBwIHtcclxuICBjb25zdHJ1Y3RvcihkaXZfaWQpIHtcclxuICAgIHRoaXMubGFzdEZyYW1lVGltZXN0YW1wID0gMFxyXG4gICAgdGhpcy5jdXJyZW50VGltZXN0YW1wID0gMFxyXG4gICAgdGhpcy5hc3NldHMgPSB7fVxyXG4gICAgdGhpcy5tYWluQ2FtZXJhID0gbnVsbFxyXG4gICAgdGhpcy5pbnB1dE1hbmFnZXIgPSBuZXcgSW5wdXRNYW5hZ2VyKClcclxuICAgIHRoaXMucmVuZGVyU2VydmVyID0gbmV3IFJlbmRlclNlcnZlcihkaXZfaWQpXHJcbiAgICB0aGlzLnJlc291cmNlU2VydmVyID0gbmV3IFJlc291cmNlU2VydmVyKHRoaXMsIFtUZXh0UmVzb3VyY2VMb2FkZXIsIFRleHR1cmVSZXNvdWNlTG9hZGVyXSlcclxuICB9XHJcblxyXG4gIHN0ZXAodGltZXN0YW1wKSB7XHJcbiAgICBjb25zdCBkZWx0YSA9IHRpbWVzdGFtcCAtIHRoaXMubGFzdEZyYW1lVGltZXN0YW1wXHJcbiAgICB0aGlzLmN1cnJlbnRUaW1lc3RhbXAgPSB0aW1lc3RhbXBcclxuXHJcbiAgICB0aGlzLnZ1ZVVJLmZwcyA9IE1hdGgucm91bmQoZGVsdGEgIT09IDAuMCA/IDEwMDAuMCAvIGRlbHRhIDogLTEpXHJcblxyXG4gICAgdGhpcy5yZW5kZXJTZXJ2ZXIudXBkYXRlKGRlbHRhKVxyXG4gICAgaWYgKHRoaXMuc2NlbmUpIHtcclxuICAgICAgdGhpcy5zY2VuZS51cGRhdGUoZGVsdGEpXHJcbiAgICB9XHJcbiAgICB0aGlzLmlucHV0TWFuYWdlci5hZnRlclVwZGF0ZShkZWx0YSlcclxuXHJcbiAgICB0aGlzLmxhc3RGcmFtZVRpbWVzdGFtcCA9IHRpbWVzdGFtcFxyXG5cclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKHRpbWVzdGFtcCkgPT4ge1xyXG4gICAgICB0aGlzLnN0ZXAodGltZXN0YW1wKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGlucHV0IChldmVudCkge1xyXG4gICAgdGhpcy5pbnB1dE1hbmFnZXIuaW5wdXQoZXZlbnQpXHJcbiAgICB0aGlzLnNjZW5lLmlucHV0KGV2ZW50KVxyXG4gIH1cclxuXHJcbiAgcnVuIChzY2VuZSkge1xyXG4gICAgdGhpcy5yZW5kZXJTZXJ2ZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHt0aGlzLmlucHV0KGUpfSlcclxuICAgIHRoaXMucmVuZGVyU2VydmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge3RoaXMuaW5wdXQoZSl9KVxyXG4gICAgdGhpcy5yZW5kZXJTZXJ2ZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4ge3RoaXMuaW5wdXQoZSl9KVxyXG4gICAgdGhpcy5yZW5kZXJTZXJ2ZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4ge3RoaXMuaW5wdXQoZSl9KVxyXG4gICAgdGhpcy5yZW5kZXJTZXJ2ZXIuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHt0aGlzLmlucHV0KGUpfSlcclxuICAgIHRoaXMucmVuZGVyU2VydmVyLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCAoZSkgPT4ge2UucHJldmVudERlZmF1bHQoKX0pXHJcblxyXG4gICAgdGhpcy5jaGFuZ2VTY2VuZShzY2VuZSlcclxuXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcclxuICAgICAgdGhpcy5zdGVwKHRpbWVzdGFtcClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBjaGFuZ2VTY2VuZSAobmV3U2NlbmUpIHtcclxuICAgIGlmICh0aGlzLnNjZW5lKSB7XHJcbiAgICAgIHRoaXMuc2NlbmUuZXhpdCgpXHJcbiAgICB9XHJcbiAgICB0aGlzLnNjZW5lID0gbmV3U2NlbmVcclxuICAgIHRoaXMuc2NlbmUuYXBwID0gdGhpc1xyXG4gICAgaWYgKG5ld1NjZW5lKSB7XHJcbiAgICAgIHRoaXMuc2NlbmUuZW50ZXIoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY3JlYXRlUmVzb3VyY2UgKHR5cGUsIC4uLmFyZ3MpIHtcclxuICAgIHJldHVybiBuZXcgdHlwZSh0aGlzLCAuLi5hcmdzKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwIiwiaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDQgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5pbXBvcnQgVHJhbnNmb3JtIGZyb20gJy4vdHJhbnNmb3JtLmpzJ1xyXG5cclxuY2xhc3MgQ2FtZXJhIHtcclxuICBnZXQgY3VycmVudCAoKSB7XHJcbiAgICBpZiAoIXRoaXMuZW50aXR5LmFwcCkgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdGhpcy5lbnRpdHkuYXBwLm1haW5DYW1lcmEgPT09IHRoaXNcclxuICB9XHJcbiAgc2V0IGN1cnJlbnQgKHYpIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnQgJiYgIXYpXHJcbiAgICAgIHRoaXMuZW50aXR5LmFwcC5tYWluQ2FtZXJhID0gbnVsbFxyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLm1ha2VDdXJyZW50KClcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMucE1hdHJpeCA9IG1hdDQuY3JlYXRlKClcclxuICB9XHJcblxyXG4gIG1ha2VDdXJyZW50ICgpIHtcclxuICAgIGlmICghdGhpcy5lbnRpdHkuYXBwKSByZXR1cm5cclxuICAgIHRoaXMuZW50aXR5LmFwcC5tYWluQ2FtZXJhID0gdGhpc1xyXG4gIH1cclxuXHJcbiAgYWRkZWQgKCkge1xyXG4gICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKVxyXG4gICAgaWYgKCF0aGlzLnRyYW5zZm9ybSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ25vIHRyYW5zZm9ybSBjb21wb25lbnQgZm91bmQgaW4gYSBjYW1lcmEgZW50aXR5IScpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGVyc3BlY3RpdmVDYW1lcmEgZXh0ZW5kcyBDYW1lcmEge1xyXG5cclxuICAjZm92ID0gZ2xNYXRyaXgudG9SYWRpYW4oNzUuMClcclxuICAjYXNwZWN0ID0gMS4wXHJcbiAgI2ZhciA9IDEwMDBcclxuICAjbmVhciA9IDAuMVxyXG4gICNkaXJ0eSA9IHRydWVcclxuXHJcbiAgZ2V0IGZvdiAoKSB7cmV0dXJuIHRoaXMuI2Zvdn1cclxuICBzZXQgZm92ICh2KSB7dGhpcy4jZm92PXY7dGhpcy4jZGlydHk9dHJ1ZX1cclxuICBnZXQgYXNwZWN0ICgpIHtyZXR1cm4gdGhpcy4jYXNwZWN0fVxyXG4gIHNldCBhc3BlY3QgKHYpIHt0aGlzLiNhc3BlY3Q9djt0aGlzLiNkaXJ0eT10cnVlfVxyXG4gIGdldCBmYXIgKCkge3JldHVybiB0aGlzLiNmYXJ9XHJcbiAgc2V0IGZhciAodikge3RoaXMuI2Zhcj12O3RoaXMuI2RpcnR5PXRydWV9XHJcbiAgZ2V0IG5lYXIgKCkge3JldHVybiB0aGlzLiNuZWFyfVxyXG4gIHNldCBuZWFyICh2KSB7dGhpcy4jbmVhcj12O3RoaXMuI2RpcnR5PXRydWV9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICBpZiAob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgdGhpcy4jZm92ID0gb3B0aW9ucy5mb3YgPz8gdGhpcy4jZm92XHJcbiAgICAgIHRoaXMuI2FzcGVjdCA9IG9wdGlvbnMuYXNwZWN0ID8/IHRoaXMuI2FzcGVjdFxyXG4gICAgICB0aGlzLiNmYXIgPSBvcHRpb25zLmZhciA/PyB0aGlzLiNmYXJcclxuICAgICAgdGhpcy4jbmVhciA9IG9wdGlvbnMubmVhciA/PyB0aGlzLiNuZWFyXHJcbiAgICAgIHRoaXMuI2RpcnR5ID0gdHJ1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWRkZWQgKCkge1xyXG4gICAgc3VwZXIuYWRkZWQoKVxyXG4gICAgdGhpcy5zeW5jUE1hdHJpeCgpXHJcbiAgICBpZiAoIXRoaXMuZW50aXR5LmFwcC5tYWluQ2FtZXJhKSB7XHJcbiAgICAgIHRoaXMubWFrZUN1cnJlbnQoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJlVXBkYXRlIChkZWx0YSkge1xyXG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5lbnRpdHkuYXBwLnJlbmRlclNlcnZlci5lbGVtZW50XHJcbiAgICBjb25zdCBhc3BlY3QgPSBjYW52YXMud2lkdGggLyBjYW52YXMuaGVpZ2h0XHJcbiAgICBpZiAoYXNwZWN0ICE9PSB0aGlzLmFzcGVjdCkge1xyXG4gICAgICB0aGlzLmFzcGVjdCA9IGFzcGVjdFxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuI2RpcnR5KSB0aGlzLnN5bmNQTWF0cml4KClcclxuICB9XHJcblxyXG4gIHN5bmNQTWF0cml4ICgpIHtcclxuICAgIG1hdDQucGVyc3BlY3RpdmUodGhpcy5wTWF0cml4LCB0aGlzLiNmb3YsIHRoaXMuI2FzcGVjdCwgdGhpcy4jbmVhciwgdGhpcy4jZmFyKVxyXG4gICAgdGhpcy4jZGlydHkgPSBmYWxzZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHtDYW1lcmEsIFBlcnNwZWN0aXZlQ2FtZXJhfSIsImltcG9ydCB7IGdsTWF0cml4LCB2ZWMzIH0gZnJvbSBcIi4uL2xpYi9nbC1tYXRyaXgvaW5kZXguanNcIlxyXG5cclxuY2xhc3MgQ3VzdG9tQW5pbWF0ZTEge1xyXG4gIHNjYWxpbmcgPSAwLjBcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG5cclxuICB9XHJcblxyXG4gIGFkZGVkICgpIHtcclxuICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KCdUcmFuc2Zvcm0nKVxyXG4gICAgaWYgKCF0aGlzLnRyYW5zZm9ybSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ05vIHRyYW5zZm9ybSBjb21wb25lbnQgZm91bmQhJylcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGUgKGRlbHRhKSB7XHJcbiAgICB0aGlzLnNjYWxpbmcgKz0gMC4xXHJcbiAgICBjb25zdCBzID0gTWF0aC5tYXgoTWF0aC5taW4oTWF0aC5zaW4odGhpcy5zY2FsaW5nKSArIDIuMCwgMS41KSwgMS4wKVxyXG5cclxuICAgIHRoaXMudHJhbnNmb3JtLnNjYWxpbmcgPSBbcywgcywgc11cclxuICAgIHRoaXMudHJhbnNmb3JtLnJvdGF0ZShnbE1hdHJpeC50b1JhZGlhbigxKSwgWzAuMCwgMC4wLCAxLjBdKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgQ3VzdG9tQW5pbWF0ZTEgfSIsImltcG9ydCB7IGdsTWF0cml4LCBtYXQ0LCBxdWF0LCB2ZWMzIH0gZnJvbSBcIi4uL2xpYi9nbC1tYXRyaXgvaW5kZXguanNcIlxyXG5pbXBvcnQgVHJhbnNmb3JtIGZyb20gXCIuL3RyYW5zZm9ybS5qc1wiXHJcblxyXG5jbGFzcyBGaXJzdFBlcnNvbkNvbnRyb2xsZXIge1xyXG5cclxuICBtb3VzZVNlbnNpdGl2ZSA9IDEuMFxyXG4gIG1vdmVTcGVlZCA9IDEuMFxyXG4gIHhFdWxlckxpbWl0RGVncmVlID0gODBcclxuXHJcbiAgcm90YXRpb25FdWxlckRlZ3JlZSA9IHZlYzMuY3JlYXRlKClcclxuXHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuXHJcbiAgfVxyXG5cclxuICBhZGRlZCAoKSB7XHJcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChUcmFuc2Zvcm0pXHJcbiAgfVxyXG5cclxuICB1cGRhdGUgKGRlbHRhKSB7XHJcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuZW50aXR5LmFwcC5pbnB1dE1hbmFnZXJcclxuXHJcbiAgICBjb25zdCBtb3ZlVmVjID0gdmVjMy5jcmVhdGUoKVxyXG4gICAgbW92ZVZlY1swXSA9IGlucHV0LmdldEFjdGlvblN0cmVuZ3RoKCdtb3ZlX3JpZ2h0JykgLSBpbnB1dC5nZXRBY3Rpb25TdHJlbmd0aCgnbW92ZV9sZWZ0JylcclxuICAgIG1vdmVWZWNbMV0gPSBpbnB1dC5nZXRBY3Rpb25TdHJlbmd0aCgnbW92ZV91cCcpIC0gaW5wdXQuZ2V0QWN0aW9uU3RyZW5ndGgoJ21vdmVfZG93bicpXHJcbiAgICB2ZWMzLnNjYWxlKG1vdmVWZWMsIG1vdmVWZWMsIDAuNSlcclxuXHJcbiAgICBjb25zdCBiYXNpcyA9IHRoaXMudHJhbnNmb3JtLmJhc2lzXHJcbiAgICAvLyBiYXNpcy56ICogbW92ZVZlY1swXSAqIG1vdmVTcGVlZCArIGJhc2lzLnggKiBtb3ZlVmVjWzFdICogbW92ZVNwZWVkXHJcbiAgICBjb25zdCBtb3ZlbWVudERlbHRhID0gdmVjMy5jcmVhdGUoKVxyXG4gICAgY29uc3QgbW92ZW1lbnREZWx0YVggPSB2ZWMzLmNyZWF0ZSgpXHJcbiAgICBjb25zdCBtb3ZlbWVudERlbHRhWiA9IHZlYzMuY3JlYXRlKClcclxuICAgIHZlYzMuc2NhbGUobW92ZW1lbnREZWx0YVgsIGJhc2lzLngsIG1vdmVWZWNbMF0gKiB0aGlzLm1vdmVTcGVlZClcclxuICAgIHZlYzMuc2NhbGUobW92ZW1lbnREZWx0YVosIGJhc2lzLnosIG1vdmVWZWNbMV0gKiB0aGlzLm1vdmVTcGVlZCAqIC0xLjApXHJcbiAgICB2ZWMzLmFkZChtb3ZlbWVudERlbHRhLCBtb3ZlbWVudERlbHRhWCwgbW92ZW1lbnREZWx0YVopXHJcblxyXG4gICAgdmFyIG9yaWdpbiA9IHRoaXMudHJhbnNmb3JtLmdsb2JhbE9yaWdpblxyXG4gICAgdGhpcy50cmFuc2Zvcm0uZ2xvYmFsT3JpZ2luID0gdmVjMy5hZGQob3JpZ2luLCBvcmlnaW4sIG1vdmVtZW50RGVsdGEpXHJcblxyXG4gICAgbGV0IG1zZyA9IGBDYW1lcmE6ICgke29yaWdpblswXS50b0ZpeGVkKDIpfSwgJHtvcmlnaW5bMV0udG9GaXhlZCgyKX0sICR7b3JpZ2luWzJdLnRvRml4ZWQoMil9KWBcclxuICAgIHRoaXMuZW50aXR5LmFwcC52dWVVSS5tc2cgPSBtc2dcclxuICB9XHJcblxyXG4gIGlucHV0IChldmVudCkge1xyXG4gICAgY29uc3QgbW91c2VTZW5zaXRpdmVNb2RpZmllciA9IC0wLjVcclxuICAgIGNvbnN0IGNsYW1wRGVncmVlID0gKHgpID0+IHtcclxuICAgICAgY29uc3QgYXggPSBNYXRoLmFicyh4KVxyXG4gICAgICByZXR1cm4gTWF0aC5zaWduKHgpICogKGF4IC0gTWF0aC5mbG9vcihheCAvIDM2MC4wKSAqIDM2MC4wKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQpIHtcclxuICAgICAgY29uc3Qgcm90YXRpb25FdWxlckRlZ3JlZSA9IHRoaXMudHJhbnNmb3JtLmV1bGVyUm90YXRpb25EZWdyZWVcclxuICAgICAgcm90YXRpb25FdWxlckRlZ3JlZVsxXSArPSBldmVudC5tb3ZlbWVudFggKiBtb3VzZVNlbnNpdGl2ZU1vZGlmaWVyICogdGhpcy5tb3VzZVNlbnNpdGl2ZVxyXG4gICAgICByb3RhdGlvbkV1bGVyRGVncmVlWzBdICs9IGV2ZW50Lm1vdmVtZW50WSAqIG1vdXNlU2Vuc2l0aXZlTW9kaWZpZXIgKiB0aGlzLm1vdXNlU2Vuc2l0aXZlXHJcblxyXG4gICAgICBjb25zdCBjbGFtcCA9ICh2LCBtaW4sIG1heCkgPT4ge1xyXG4gICAgICAgIGlmICh2IDwgbWluKSByZXR1cm4gbWluXHJcbiAgICAgICAgaWYgKHYgPiBtYXgpIHJldHVybiBtYXhcclxuICAgICAgICByZXR1cm4gdlxyXG4gICAgICB9XHJcbiAgICAgIHJvdGF0aW9uRXVsZXJEZWdyZWVbMF0gPSBjbGFtcChyb3RhdGlvbkV1bGVyRGVncmVlWzBdLCAtdGhpcy54RXVsZXJMaW1pdERlZ3JlZSwgdGhpcy54RXVsZXJMaW1pdERlZ3JlZSlcclxuICAgICAgXHJcbiAgICAgIHRoaXMudHJhbnNmb3JtLmV1bGVyUm90YXRpb25EZWdyZWUgPSByb3RhdGlvbkV1bGVyRGVncmVlXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDb250cm9sVHJpZ2dlciB7XHJcblxyXG4gICNjb250cm9sbGVyID0gbnVsbFxyXG5cclxuICBzZXQgY29udHJvbGxlciAoYykge1xyXG4gICAgdGhpcy4jY29udHJvbGxlciA9IGNcclxuICAgIGlmIChjKSBjLmFjdGl2YXRlZCA9IGZhbHNlXHJcbiAgfVxyXG4gIGdldCBjb250cm9sbGVyICgpIHtcclxuICAgIHJldHVybiB0aGlzLiNjb250cm9sbGVyXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGFkZGVkICgpIHtcclxuXHJcbiAgfVxyXG5cclxuICBpbnB1dCAoZXZlbnQpIHtcclxuICAgIGlmICghdGhpcy5jb250cm9sbGVyKSByZXR1cm5cclxuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikge1xyXG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJykge1xyXG4gICAgICAgICAgdGhpcy5jb250cm9sbGVyLmFjdGl2YXRlZCA9IHRydWVcclxuICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVudGl0eS5hcHAucmVuZGVyU2VydmVyLmVsZW1lbnRcclxuICAgICAgICAgIGVsZW1lbnQucmVxdWVzdFBvaW50ZXJMb2NrKClcclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZXVwJykge1xyXG4gICAgICAgICAgdGhpcy5jb250cm9sbGVyLmFjdGl2YXRlZCA9IGZhbHNlXHJcbiAgICAgICAgICBkb2N1bWVudC5leGl0UG9pbnRlckxvY2soKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgRmlyc3RQZXJzb25Db250cm9sbGVyLCBDb250cm9sVHJpZ2dlciB9IiwiaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDMsIG1hdDQgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5pbXBvcnQgVHJhbnNmb3JtIGZyb20gJy4vdHJhbnNmb3JtLmpzJ1xyXG5cclxuY2xhc3MgTWVzaFJlbmRlcmVyIHtcclxuXHJcbiAgbWVzaCA9IG51bGxcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gIH1cclxuXHJcbiAgYWRkZWQgKCkge1xyXG4gICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlIChkZWx0YSkge1xyXG4gICAgY29uc3QgdHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm1cclxuICAgIGlmICghdHJhbnNmb3JtKSByZXR1cm5cclxuICAgIGNvbnN0IGNhbWVyYSA9IHRoaXMuZW50aXR5LmFwcC5tYWluQ2FtZXJhXHJcbiAgICBpZiAoIWNhbWVyYSkgcmV0dXJuXHJcblxyXG4gICAgaWYgKHRoaXMubWVzaC52YWxpZCkge1xyXG4gICAgICBjb25zdCBnbCA9IHRoaXMuZW50aXR5LmFwcC5yZW5kZXJTZXJ2ZXIuZ2xcclxuICAgICAgY29uc3Qgc2hhZGVyID0gdGhpcy5tZXNoLnNoYWRlclxyXG4gICAgICBpZiAoIWdsKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZ2whJylcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IHBNYXRyaXggPSBjYW1lcmEucE1hdHJpeFxyXG4gICAgICBjb25zdCB2TWF0cml4ID0gY2FtZXJhLnRyYW5zZm9ybS5nbG9iYWxNYXRyaXhcclxuICAgICAgY29uc3QgbU1hdHJpeCA9IHRyYW5zZm9ybS5nbG9iYWxNYXRyaXhcclxuXHJcbiAgICAgIC8vIGNvbnN0IG5vck1hdHJpeCA9IG1hdDMuY3JlYXRlKClcclxuICAgICAgLy8gbWF0My5ub3JtYWxGcm9tTWF0NChub3JNYXRyaXgsIG12TWF0cml4KVxyXG4gICAgICBcclxuICAgICAgc2hhZGVyLnVzZSgpXHJcblxyXG4gICAgICBzaGFkZXIudXBsb2FkUGFyYW1ldGVyKCdwTWF0cml4JywgcE1hdHJpeClcclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcigndk1hdHJpeCcsIHZNYXRyaXgpXHJcbiAgICAgIHNoYWRlci51cGxvYWRQYXJhbWV0ZXIoJ3VtTWF0cml4JywgbU1hdHJpeClcclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcignZW5hYmxlQmlsbGJvYXJkJywgMCwgdHJ1ZSlcclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcignZW5hYmxlSW5zdGFuY2VEcmF3JywgMCwgdHJ1ZSlcclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcignZW5hYmxlVmVydENvbG9yJywgMCwgdHJ1ZSlcclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcigndXZTY2FsZScsIFsxLCAxXSlcclxuXHJcbiAgICAgIHNoYWRlci5zZXRQYXJhbWV0ZXJzVG9HTChnbClcclxuICAgICAgXHJcbiAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKVxyXG5cclxuICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMubWVzaC5nbFZhbylcclxuICAgICAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIDAsIHRoaXMubWVzaC52ZXJ0ZXhDb3VudClcclxuICAgICAgLy8gZ2wuZHJhd0FycmF5cyhnbC5MSU5FUywgMCwgdGhpcy5tZXNoLnZlcnRleENvdW50KVxyXG4gICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbW92ZWQgKCkge1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTWVzaFJlbmRlcmVyIiwiaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDQsIHZlYzMsIHZlYzQgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5pbXBvcnQgVHJhbnNmb3JtIGZyb20gJy4vdHJhbnNmb3JtLmpzJ1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vY29yZS91dGlscy5qcydcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9saWIvY29sb3IvY29sb3IuanMnXHJcbmltcG9ydCB7IFNpZ25hbFNsb3QgfSBmcm9tICcuLi9jb3JlL3NpZ25hbF9zbG90LmpzJ1xyXG5cclxuY2xhc3MgUGFydGljbGVFbWl0U2hhcGUge1xyXG5cclxuICBwYXJhbSA9IHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgIGZvciAoayBpbiB0aGlzLnBhcmFtKSB7XHJcbiAgICAgICAgdGhpcy5wYXJhbVtrXSA9IG9wdGlvbnNba10gPz8gdGhpcy5wYXJhbVtrXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRJbml0UG9zaXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHZlYzMuY3JlYXRlKClcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBhcnRpY2xlRW1pdFNoYXBlUG9pbnQgZXh0ZW5kcyBQYXJ0aWNsZUVtaXRTaGFwZSB7XHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBQYXJ0aWNsZUVtaXRTaGFwZUJveCBleHRlbmRzIFBhcnRpY2xlRW1pdFNoYXBlIHtcclxuICBjb25zdHJ1Y3RvciAodywgaCwgbCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5wYXJhbS53ID0gd1xyXG4gICAgdGhpcy5wYXJhbS5oID0gaFxyXG4gICAgdGhpcy5wYXJhbS5sID0gbFxyXG4gIH1cclxuXHJcbiAgZ2V0SW5pdFBvc2l0aW9uICgpIHtcclxuICAgIGxldCB3ID0gdGhpcy5wYXJhbS53XHJcbiAgICBsZXQgaCA9IHRoaXMucGFyYW0uaFxyXG4gICAgbGV0IGwgPSB0aGlzLnBhcmFtLmxcclxuXHJcbiAgICBsZXQgeCA9IHV0aWxzLnJhbmRvbVJhbmdlKC13LCB3KVxyXG4gICAgbGV0IHkgPSB1dGlscy5yYW5kb21SYW5nZSgtaCwgaClcclxuICAgIGxldCB6ID0gdXRpbHMucmFuZG9tUmFuZ2UoLWwsIGwpXHJcblxyXG4gICAgcmV0dXJuIHZlYzMuZnJvbVZhbHVlcyh4LCB5LCB6KVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGFydGljbGVFbWl0U2hhcGVTaHBlcmUgZXh0ZW5kcyBQYXJ0aWNsZUVtaXRTaGFwZSB7XHJcbiAgY29uc3RydWN0b3IgKGlyLCBvcikge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgaWYgKCFvcikge1xyXG4gICAgICBvciA9IGlyXHJcbiAgICAgIGlyID0gMFxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXJhbS5pciA9IGlyXHJcbiAgICB0aGlzLnBhcmFtLm9yID0gb3JcclxuICB9XHJcblxyXG4gIGdldEluaXRQb3NpdGlvbiAoKSB7XHJcbiAgICBsZXQgciA9IHRoaXMucGFyYW0ub3IgLSB0aGlzLnBhcmFtLmlyXHJcbiAgICBsZXQgbCA9IHV0aWxzLnJhbmRvbVJhbmdlKC1yLCByKVxyXG4gICAgbCArPSB0aGlzLnBhcmFtLmlyICogTWF0aC5zaWduKGwpXHJcblxyXG4gICAgY29uc3QgZCA9IHZlYzMuZnJvbVZhbHVlcyh1dGlscy5yYW5kb21SYW5nZSgtMSwgMSksIHV0aWxzLnJhbmRvbVJhbmdlKC0xLCAxKSwgdXRpbHMucmFuZG9tUmFuZ2UoLTEsIDEpKVxyXG4gICAgdmVjMy5ub3JtYWxpemUoZCwgZClcclxuICAgIFxyXG4gICAgcmV0dXJuIHZlYzMuc2NhbGUoZCwgZCwgbClcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBhcnRpY2xlRW1pdFNoYXBlQ3lsaW5kZXIgZXh0ZW5kcyBQYXJ0aWNsZUVtaXRTaGFwZSB7XHJcbiAgY29uc3RydWN0b3IgKGlyLCBvciwgaCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgaWYgKCFvcikge1xyXG4gICAgICBvciA9IGlyXHJcbiAgICAgIGlyID0gMFxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXJhbS5pciA9IGlyXHJcbiAgICB0aGlzLnBhcmFtLm9yID0gb3JcclxuICAgIHRoaXMucGFyYW0uaCA9IGggPz8gMFxyXG4gIH1cclxuXHJcbiAgZ2V0SW5pdFBvc2l0aW9uICgpIHtcclxuICAgIGNvbnN0IGggPSB0aGlzLnBhcmFtLmhcclxuICAgIGxldCByID0gdGhpcy5wYXJhbS5vciAtIHRoaXMucGFyYW0uaXJcclxuICAgIGxldCBsID0gdXRpbHMucmFuZG9tUmFuZ2UoLXIsIHIpXHJcbiAgICBsICs9IHRoaXMucGFyYW0uaXIgKiBNYXRoLnNpZ24obClcclxuXHJcbiAgICBjb25zdCBkID0gdmVjMy5mcm9tVmFsdWVzKHV0aWxzLnJhbmRvbVJhbmdlKC0xLCAxKSwgMCwgdXRpbHMucmFuZG9tUmFuZ2UoLTEsIDEpKVxyXG4gICAgdmVjMy5ub3JtYWxpemUoZCwgZClcclxuICAgIHZlYzMuc2NhbGUoZCwgZCwgbClcclxuICAgIGRbMV0gPSB1dGlscy5yYW5kb21SYW5nZSgtaCwgaClcclxuICAgIFxyXG4gICAgcmV0dXJuIGRcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBhcnRpY2xlUGFyYW0ge1xyXG5cclxuICBwYXJhbSA9IHtcclxuICAgIG1pbjogMCxcclxuICAgIG1heDogMCxcclxuICAgIHZhcmlhbnRGdW5jdGlvbjogIG51bGwsIC8vICh0KSA9PiAxLFxyXG4gIH1cclxuICBcclxuXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgIGZvciAobGV0IGsgaW4gdGhpcy5wYXJhbSkge1xyXG4gICAgICAgIHRoaXMucGFyYW1ba10gPSBvcHRpb25zW2tdID8/IHRoaXMucGFyYW1ba11cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0SW5pdGlhbFZhbHVlICgpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBnZXRWYXJpYW50VmFsdWUgKHQpIHtcclxuICAgIGlmICh0aGlzLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9PT0gbnVsbCkgcmV0dXJuIDFcclxuICAgIHJldHVybiB0aGlzLnBhcmFtLnZhcmlhbnRGdW5jdGlvbih0KVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGFydGljbGVQYXJhbU51bWJlciBleHRlbmRzIFBhcnRpY2xlUGFyYW0ge1xyXG5cclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xyXG4gICAgc3VwZXIob3B0aW9ucylcclxuICB9XHJcblxyXG4gIGdldEluaXRpYWxWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gdXRpbHMucmFuZG9tUmFuZ2UodGhpcy5wYXJhbS5taW4sIHRoaXMucGFyYW0ubWF4KVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGFydGljbGVQYXJhbUludGVnZXIgZXh0ZW5kcyBQYXJ0aWNsZVBhcmFtTnVtYmVyIHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xyXG4gICAgc3VwZXIob3B0aW9ucylcclxuICB9XHJcblxyXG4gIGdldEluaXRpYWxWYWx1ZSAoKSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihzdXBlci5nZXRJbml0aWFsVmFsdWUoKSlcclxuICB9XHJcblxyXG4gIGdldFZhcmlhbnRWYWx1ZSh0KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihzdXBlci5nZXRWYXJpYW50VmFsdWUodCkpXHJcbiAgfVxyXG59XHJcblxyXG4vLyBjb2xvciBpcyBhbiBhcnJheSBjb250YWlucyA0IChvciAzKSBmbG9hdCBlbGVtZW50c1xyXG5jbGFzcyBQYXJ0aWNsZVBhcmFtQ29sb3IgZXh0ZW5kcyBQYXJ0aWNsZVBhcmFtIHtcclxuXHJcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcclxuICAgIHN1cGVyKG9wdGlvbnMpXHJcbiAgfVxyXG5cclxuICBnZXRJbml0aWFsVmFsdWUgKCkge1xyXG4gICAgY29uc3QgcmVzID0gW11cclxuICAgIGZvciAobGV0IGk9MDsgaTxNYXRoLm1pbih0aGlzLnBhcmFtLm1heC5sZW5ndGgsIHRoaXMucGFyYW0ubWluLmxlbmd0aCk7ICsraSkge1xyXG4gICAgICByZXNbaV0gPSB1dGlscy5yYW5kb21SYW5nZSh0aGlzLnBhcmFtLm1pbltpXSwgdGhpcy5wYXJhbS5tYXhbaV0pXHJcbiAgICB9XHJcbiAgICBpZiAocmVzLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICByZXNbM10gPSAxXHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzXHJcbiAgfVxyXG5cclxuICBnZXRWYXJpYW50VmFsdWUgKHQpIHtcclxuICAgIGlmICh0aGlzLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9PT0gbnVsbCkgcmV0dXJuIHZlYzQuZnJvbVZhbHVlcygxLCAxLCAxLCAxKVxyXG4gICAgcmV0dXJuIHRoaXMucGFyYW0udmFyaWFudEZ1bmN0aW9uKHQpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBQYXJ0aWNsZURhdGEge1xyXG5cclxuICBpbmRleCA9IC0xXHJcblxyXG4gIHRyYW5zZm9ybSA9IG1hdDQuY3JlYXRlKClcclxuICBub25lU2NhbGVUcmFzbmZvcm0gPSBtYXQ0LmNyZWF0ZSgpXHJcbiAgdmVsb2NpdHkgPSB2ZWMzLmNyZWF0ZSgpXHJcbiAgYWdlID0gMFxyXG4gIHJlc3RhcnQgPSBmYWxzZVxyXG4gIGNvbG9yID0gdmVjNC5mcm9tVmFsdWVzKDEsIDEsIDEsIDEpXHJcbiAgYW5pbWF0aW9uRnJhbWUgPSAwXHJcblxyXG4gIGluaXQgPSB7XHJcbiAgICBkaXJlY3Rpb246IHZlYzMuY3JlYXRlKCksXHJcbiAgICBsaW5lYXJBY2NlbGVyYXRpb246IDAsXHJcbiAgICByYWRpYWxBY2NlbGVyYXRpb246IDAsXHJcbiAgICB0YW5nZW50aWFsQWNjZWxlcmF0aW9uOiAwLFxyXG4gICAgZGFtcGluZzogMCxcclxuICAgIHNjYWxlOiAxLFxyXG4gICAgY29sb3I6IENvbG9yLnRvUkdCQShDb2xvci53aGl0ZSksXHJcbiAgICBhbmdsZTogMCxcclxuICAgIGFuZ3VsYXJWZWxvY2l0eTogMCxcclxuICAgIG9yYml0YWxWZWxvY2l0eTogMCxcclxuICAgIHJhbmRvbUFuaW1hdGlvbkZyYW1lOiAwLFxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgY2FsY0FuaW1hdGlvbkZyYW1lIChsaWZlLCBmcHMpIHtcclxuICAgIGNvbnN0IG1zcGYgPSAoMTAwMCAvIGZwcylcclxuICAgIGNvbnN0IGZyYW1lID0gTWF0aC5mbG9vcigobGlmZSAtIHRoaXMuYWdlKSAvIG1zcGYpXHJcbiAgICByZXR1cm4gZnJhbWUgPz8gMFxyXG4gIH1cclxuXHJcbiAgY2FsY1VWT2Zmc2V0IChmcmFtZSwgaEZyYW1lLCB2RnJhbWUpIHtcclxuICAgIGlmICghaEZyYW1lKSBoRnJhbWUgPSAxXHJcbiAgICBpZiAoIXZGcmFtZSkgdkZyYW1lID0gMVxyXG4gICAgY29uc3QgY29sdW1uID0gZnJhbWUgJSBoRnJhbWVcclxuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoZnJhbWUgLyB2RnJhbWUpXHJcbiAgICByZXR1cm4gW2NvbHVtbi9oRnJhbWUsIHJvdy92RnJhbWVdXHJcbiAgfVxyXG59XHJcblxyXG4vLyB0aW1lIHVuaXQ6IG1zZWNcclxuLy8gcm90YXRpb24gdW5pdDogZGVncmVlc1xyXG5jbGFzcyBQYXJ0aWNsZUVtaXR0ZXIge1xyXG5cclxuICBzaWduYWxzID0ge1xyXG4gICAgZW1pc3Npb25FbmQ6IG5ldyBTaWduYWxTbG90KClcclxuICB9XHJcblxyXG4gIHBhcnRpY2xlUmVuZGVyZXIgPSBudWxsXHJcblxyXG4gIHBhcmFtID0ge1xyXG4gICAgY291bnQ6IDgsXHJcbiAgICBsaWZlOiAxMDAwLCAvLyBtc2VjXHJcbiAgICBleHBsb3NpdmU6IDAsIC8vIDB+MVxyXG4gICAgbG9jYWxDb29yZHM6IGZhbHNlLFxyXG4gICAgb25lU2hvdDogZmFsc2UsXHJcbiAgfVxyXG5cclxuICBwYXJ0aWNsZVBhcmFtID0ge1xyXG4gICAgZGlyZWN0aW9uOiB2ZWMzLmZyb21WYWx1ZXMoMCwgMCwgMCksXHJcbiAgICBzcHJlYWQ6IDAsIC8vIDAgfiAxODAgZGVncmVlc1xyXG4gICAgZ3Jhdml0eTogdmVjMy5mcm9tVmFsdWVzKDAsIC05LjgsIDApLFxyXG4gICAgbGlmZVJhbmRvbW5lc3M6IDAsIC8vIDAgfiAxXHJcbiAgICBlbWl0U2hhcGU6IG5ldyBQYXJ0aWNsZUVtaXRTaGFwZVBvaW50KCksXHJcblxyXG4gICAgYW5nbGU6IG5ldyBQYXJ0aWNsZVBhcmFtTnVtYmVyKHttaW46IDAsIG1heDogMH0pLFxyXG4gICAgYW5nbGVBeGlzOiAneicsXHJcblxyXG4gICAgb3JiaXRhbFZlbG9jaXR5OiBuZXcgUGFydGljbGVQYXJhbU51bWJlcih7bWluOiAwLCBtYXg6IDB9KSxcclxuICAgIGxpbmVhclZlbG9jaXR5OiBuZXcgUGFydGljbGVQYXJhbU51bWJlcih7bWluOiAwLCBtYXg6IDB9KSxcclxuICAgIGFuZ3VsYXJWZWxvY2l0eTogbmV3IFBhcnRpY2xlUGFyYW1OdW1iZXIoe21pbjogMCwgbWF4OiAwfSksXHJcbiAgICBsaW5lYXJBY2NlbGVyYXRpb246IG5ldyBQYXJ0aWNsZVBhcmFtTnVtYmVyKHttaW46IDAsIG1heDogMH0pLFxyXG4gICAgcmFkaWFsQWNjZWxlcmF0aW9uOiBuZXcgUGFydGljbGVQYXJhbU51bWJlcih7bWluOiAwLCBtYXg6IDB9KSxcclxuICAgIHRhbmdlbnRpYWxBY2NlbGVyYXRpb246IG5ldyBQYXJ0aWNsZVBhcmFtTnVtYmVyKHttaW46IDAsIG1heDogMH0pLFxyXG4gICAgXHJcbiAgICBkYW1waW5nOiBuZXcgUGFydGljbGVQYXJhbU51bWJlcih7bWluOiAwLCBtYXg6IDB9KSwgLy8gMCB+IDFcclxuICAgIHNjYWxlOiBuZXcgUGFydGljbGVQYXJhbU51bWJlcih7bWluOiAxLCBtYXg6IDF9KSxcclxuICAgIGNvbG9yOiBuZXcgUGFydGljbGVQYXJhbUNvbG9yKHttaW46IENvbG9yLnRvUkdCQShDb2xvci53aGl0ZSksIG1heDogQ29sb3IudG9SR0JBKENvbG9yLndoaXRlKX0pLFxyXG5cclxuICAgIGFuaW1hdGlvbkhGcmFtZXM6IDAsXHJcbiAgICBhbmltYXRpb25WRnJhbWVzOiAwLFxyXG4gICAgYW5pbWF0aW9uRlBTOiAxNSxcclxuICAgIHJhbmRvbUFuaW1hdGlvbkZyYW1lOiBuZXcgUGFydGljbGVQYXJhbUludGVnZXIoe21pbjogMCwgbWF4OiAwfSksXHJcbiAgICBlbmFibGVSYW5kb21BbmltYXRpb25GcmFtZTogZmFsc2UsXHJcbiAgfVxyXG5cclxuICBydW50aW1lID0ge1xyXG4gICAgZW1pdHRpbmc6IGZhbHNlLFxyXG4gICAgZW1pdFRpbWU6IDAsIC8vIG1zZWNcclxuICAgIGVtaXRDb3VudDogMCxcclxuICAgIG5ld1N0YXJ0OiBmYWxzZSxcclxuICAgIG1zcGY6IDAsXHJcbiAgICBwYXJ0aWNsZVBvb2w6IFtdLFxyXG4gICAgaW5zdGFuY2VzRGF0YTogW10sXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHN0YXJ0RW1pc3Npb24gKHJlc2V0PWZhbHNlKSB7XHJcbiAgICB0aGlzLnJ1bnRpbWUuZW1pdHRpbmcgPSB0cnVlXHJcbiAgICB0aGlzLnJ1bnRpbWUuZW1pdFRpbWUgPSAwXHJcbiAgICB0aGlzLnJ1bnRpbWUubmV3U3RhcnQgPSB0cnVlXHJcblxyXG4gICAgaWYgKHJlc2V0KSB7XHJcbiAgICAgIHRoaXMucnVudGltZS5wYXJ0aWNsZVBvb2wgPSBbXVxyXG4gICAgICB0aGlzLnJ1bnRpbWUuaW5zdGFuY2VzRGF0YSA9IFtdXHJcbiAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLnBhcmFtLmNvdW50OyArK2kpIHtcclxuICAgICAgICB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sLnB1c2gobmV3IFBhcnRpY2xlRGF0YSgpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdG9wRW1pc3Npb24gKCkge1xyXG4gICAgdGhpcy5ydW50aW1lLmVtaXR0aW5nID0gZmFsc2VcclxuICB9XHJcblxyXG4gIHN5bmNQYXJ0aWNsZUNvdW50ICgpIHtcclxuICAgIGlmICghdGhpcy5ydW50aW1lLmVtaXR0aW5nKVxyXG4gICAgICByZXR1cm5cclxuICAgIGlmICh0aGlzLnBhcmFtLmNvdW50ICE9IHRoaXMucnVudGltZS5wYXJ0aWNsZVBvb2wubGVuZ3RoKSB7XHJcbiAgICAgIGlmICh0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sLmxlbmd0aCA8IHRoaXMucGFyYW0uY291bnQpIHtcclxuICAgICAgICBjb25zdCBvbGQgPSB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sXHJcbiAgICAgICAgdGhpcy5ydW50aW1lLnBhcnRpY2xlUG9vbCA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMucGFyYW0uY291bnQ7ICsraSkge1xyXG4gICAgICAgICAgaWYgKGkgPCBvbGQubGVuZ3RoKSB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sW2ldID0gb2xkW2ldXHJcbiAgICAgICAgICBlbHNlIHRoaXMucnVudGltZS5wYXJ0aWNsZVBvb2xbaV0gPSBuZXcgUGFydGljbGVEYXRhKClcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IHNob3VsZFJlZHVjZSA9IHRydWVcclxuICAgICAgICBmb3IgKGxldCBpPXRoaXMucGFyYW0uY291bnQ7IGk8dGhpcy5ydW50aW1lLnBhcnRpY2xlUG9vbC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgaWYgKHRoaXMucnVudGltZS5wYXJ0aWNsZVBvb2xbaV0uYWdlID4gMCkge1xyXG4gICAgICAgICAgICBzaG91bGRSZWR1Y2UgPSBmYWxzZVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2hvdWxkUmVkdWNlKSB7XHJcbiAgICAgICAgICBjb25zdCBvbGQgPSB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sXHJcbiAgICAgICAgICB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sID0gW11cclxuICAgICAgICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLnBhcmFtLmNvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy5ydW50aW1lLnBhcnRpY2xlUG9vbFtpXSA9IG9sZFtpXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5ydW50aW1lLmluc3RhbmNlc0RhdGEgPSBbXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV2aXZlUGFydGljbGVzIChtc3BmKSB7XHJcbiAgICBpZiAoIXRoaXMucnVudGltZS5lbWl0dGluZylcclxuICAgICAgcmV0dXJuXHJcbiAgICBpZiAodGhpcy5ydW50aW1lLmVtaXRUaW1lID4gdGhpcy5wYXJhbS5saWZlIHx8IHRoaXMucnVudGltZS5uZXdTdGFydCkge1xyXG4gICAgICB0aGlzLnJ1bnRpbWUuZW1pdFRpbWUgPSAwXHJcbiAgICAgIHRoaXMucnVudGltZS5uZXdTdGFydCA9IGZhbHNlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJ1bnRpbWUuZW1pdFRpbWUgKz0gbXNwZlxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucnVudGltZS5lbWl0VGltZSA8PSAoMS10aGlzLnBhcmFtLmV4cGxvc2l2ZSkgKiB0aGlzLnBhcmFtLmxpZmUpIHtcclxuICAgICAgbGV0IGVtaXREdXJhdGlvbiA9IHRoaXMucGFyYW0ubGlmZSAqICgxIC0gdGhpcy5wYXJhbS5leHBsb3NpdmUpXHJcbiAgICAgIGxldCBlbWl0UGVyRnJhbWUgPSB0aGlzLnBhcmFtLmNvdW50XHJcbiAgICAgIGlmIChlbWl0RHVyYXRpb24gIT09IDApIHtcclxuICAgICAgICBlbWl0UGVyRnJhbWUgPSB0aGlzLnBhcmFtLmNvdW50IC8gZW1pdER1cmF0aW9uICogbXNwZlxyXG4gICAgICB9XHJcbiAgICAgIGxldCBhdmFpbGFibGVDb3VudCA9IDBcclxuICAgICAgZm9yIChsZXQgZGF0YSBvZiB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sKSB7XHJcbiAgICAgICAgaWYgKGRhdGEuYWdlIC0gbXNwZiA8PSAwKSBhdmFpbGFibGVDb3VudCArPSAxXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ydW50aW1lLmVtaXRDb3VudCArPSBlbWl0UGVyRnJhbWVcclxuICAgICAgdGhpcy5ydW50aW1lLmVtaXRDb3VudCA9IE1hdGgubWluKGF2YWlsYWJsZUNvdW50LCB0aGlzLnJ1bnRpbWUuZW1pdENvdW50KVxyXG4gICAgICBcclxuICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMucGFyYW0uY291bnQ7ICsraSkge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sW2ldXHJcbiAgICAgICAgaWYgKGRhdGEuYWdlIC0gbXNwZiA8PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5ydW50aW1lLmVtaXRDb3VudCA+PSAxKSB7XHJcbiAgICAgICAgICAgIGRhdGEucmVzdGFydCA9IHRydWVcclxuICAgICAgICAgICAgZGF0YS5hZ2UgPSAwXHJcbiAgICAgICAgICAgIHRoaXMucnVudGltZS5lbWl0Q291bnQgLT0gMVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZVBhcnRpY2xlRGF0YSAoZGF0YSwgZGVsdGEpIHtcclxuICAgIGNvbnN0IGVtaXR0ZXJNYXRyaXggPSB0aGlzLnBhcmFtLmxvY2FsQ29vcmRzID8gbWF0NC5jcmVhdGUoKSA6IHRoaXMudHJhbnNmb3JtLmdsb2JhbE1hdHJpeFxyXG4gICAgY29uc3QgZW1pdHRlclBvcyA9IHZlYzMuZnJvbVZhbHVlcyhlbWl0dGVyTWF0cml4WzEyXSwgZW1pdHRlck1hdHJpeFsxM10sIGVtaXR0ZXJNYXRyaXhbMTRdKVxyXG4gICAgY29uc3QgZW1pdHRlclVwID0gdmVjMy5mcm9tVmFsdWVzKGVtaXR0ZXJNYXRyaXhbNF0sIGVtaXR0ZXJNYXRyaXhbNV0sIGVtaXR0ZXJNYXRyaXhbNl0pXHJcbiAgICBjb25zdCBwYXJ0aWNsZU1hdHJpeCA9IGRhdGEudHJhbnNmb3JtXHJcbiAgICBjb25zdCBub25lU2NhbGVUcmFzbmZvcm0gPSBkYXRhLm5vbmVTY2FsZVRyYXNuZm9ybVxyXG4gICAgaWYgKGRhdGEuYWdlIDw9IDApIHsgLy8gUmVzdGFydFxyXG4gICAgICBpZiAoZGF0YS5yZXN0YXJ0KSB7XHJcbiAgICAgICAgZGF0YS5hZ2UgPSB1dGlscy53ZWlnaHRlZFJhbmRvbSh0aGlzLnBhcmFtLmxpZmUsIHRoaXMucGFydGljbGVQYXJhbS5saWZlUmFuZG9tbmVzcylcclxuICAgICAgICBkYXRhLnJlc3RhcnQgPSBmYWxzZVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNhbGMgcG9zaXRpb25cclxuICAgICAgICBtYXQ0LmlkZW50aXR5KG5vbmVTY2FsZVRyYXNuZm9ybSlcclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLnBhcnRpY2xlUGFyYW0uZW1pdFNoYXBlLmdldEluaXRQb3NpdGlvbigpXHJcbiAgICAgICAgbm9uZVNjYWxlVHJhc25mb3JtWzEyXSA9IHBvc1swXVxyXG4gICAgICAgIG5vbmVTY2FsZVRyYXNuZm9ybVsxM10gPSBwb3NbMV1cclxuICAgICAgICBub25lU2NhbGVUcmFzbmZvcm1bMTRdID0gcG9zWzJdXHJcblxyXG4gICAgICAgIC8vIGNhbGMgYW5nbGVcclxuICAgICAgICBkYXRhLmluaXQuYW5nbGUgPSB0aGlzLnBhcnRpY2xlUGFyYW0uYW5nbGUuZ2V0SW5pdGlhbFZhbHVlKClcclxuICAgICAgICBzd2l0Y2ggKHRoaXMucGFydGljbGVQYXJhbS5hbmdsZUF4aXMpIHtcclxuICAgICAgICAgIGNhc2UgJ3gnOlxyXG4gICAgICAgICAgICBtYXQ0LnJvdGF0ZVgobm9uZVNjYWxlVHJhc25mb3JtLCBub25lU2NhbGVUcmFzbmZvcm0sIHV0aWxzLmRlZzJyYWQoZGF0YS5pbml0LmFuZ2xlKSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ3knOlxyXG4gICAgICAgICAgICBtYXQ0LnJvdGF0ZVkobm9uZVNjYWxlVHJhc25mb3JtLCBub25lU2NhbGVUcmFzbmZvcm0sIHV0aWxzLmRlZzJyYWQoZGF0YS5pbml0LmFuZ2xlKSlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ3onOlxyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbWF0NC5yb3RhdGVaKG5vbmVTY2FsZVRyYXNuZm9ybSwgbm9uZVNjYWxlVHJhc25mb3JtLCB1dGlscy5kZWcycmFkKGRhdGEuaW5pdC5hbmdsZSkpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjYWxjIGFuZ3VsYXIgdmVsb2NpdHlcclxuICAgICAgICBkYXRhLmluaXQuYW5ndWxhclZlbG9jaXR5ID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmFuZ3VsYXJWZWxvY2l0eS5nZXRJbml0aWFsVmFsdWUoKVxyXG5cclxuICAgICAgICAvLyBjYWxjIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCBkID0gdmVjMy5jb3B5KGRhdGEuaW5pdC5kaXJlY3Rpb24sIHRoaXMucGFydGljbGVQYXJhbS5kaXJlY3Rpb24pXHJcbiAgICAgICAgdmVjMy5yb3RhdGVYKGQsIGQsIFswLCAwLCAwXSwgdXRpbHMuZGVnMnJhZCh1dGlscy5yYW5kb21SYW5nZSgtdGhpcy5wYXJ0aWNsZVBhcmFtLnNwcmVhZCwgdGhpcy5wYXJ0aWNsZVBhcmFtLnNwcmVhZCkpKVxyXG4gICAgICAgIHZlYzMucm90YXRlWShkLCBkLCBbMCwgMCwgMF0sIHV0aWxzLmRlZzJyYWQodXRpbHMucmFuZG9tUmFuZ2UoLXRoaXMucGFydGljbGVQYXJhbS5zcHJlYWQsIHRoaXMucGFydGljbGVQYXJhbS5zcHJlYWQpKSlcclxuICAgICAgICB2ZWMzLnJvdGF0ZVooZCwgZCwgWzAsIDAsIDBdLCB1dGlscy5kZWcycmFkKHV0aWxzLnJhbmRvbVJhbmdlKC10aGlzLnBhcnRpY2xlUGFyYW0uc3ByZWFkLCB0aGlzLnBhcnRpY2xlUGFyYW0uc3ByZWFkKSkpXHJcbiAgICAgICAgdmVjMy5ub3JtYWxpemUoZCwgZClcclxuXHJcbiAgICAgICAgLy8gY2FsYyBsaW5lYXIgdmVsb2NpdHlcclxuICAgICAgICBsZXQgdiA9IHRoaXMucGFydGljbGVQYXJhbS5saW5lYXJWZWxvY2l0eS5nZXRJbml0aWFsVmFsdWUoKVxyXG4gICAgICAgIHZlYzMuc2NhbGUoZGF0YS52ZWxvY2l0eSwgZCwgdilcclxuXHJcbiAgICAgICAgLy8gY2FsYyBhY2NlbGVyYXRpb25zXHJcbiAgICAgICAgZGF0YS5pbml0LmxpbmVhckFjY2VsZXJhdGlvbiA9IHRoaXMucGFydGljbGVQYXJhbS5saW5lYXJBY2NlbGVyYXRpb24uZ2V0SW5pdGlhbFZhbHVlKClcclxuICAgICAgICBkYXRhLmluaXQucmFkaWFsQWNjZWxlcmF0aW9uID0gdGhpcy5wYXJ0aWNsZVBhcmFtLnJhZGlhbEFjY2VsZXJhdGlvbi5nZXRJbml0aWFsVmFsdWUoKVxyXG4gICAgICAgIGRhdGEuaW5pdC50YW5nZW50aWFsQWNjZWxlcmF0aW9uID0gdGhpcy5wYXJ0aWNsZVBhcmFtLnRhbmdlbnRpYWxBY2NlbGVyYXRpb24uZ2V0SW5pdGlhbFZhbHVlKClcclxuXHJcbiAgICAgICAgLy8gY2FsYyBvcmJpdGFsIHZlbG9jaXR5XHJcbiAgICAgICAgZGF0YS5pbml0Lm9yYml0YWxWZWxvY2l0eSA9IHRoaXMucGFydGljbGVQYXJhbS5vcmJpdGFsVmVsb2NpdHkuZ2V0SW5pdGlhbFZhbHVlKClcclxuXHJcbiAgICAgICAgLy8gY2FsYyBkYW1waW5nXHJcbiAgICAgICAgZGF0YS5pbml0LmRhbXBpbmcgPSB0aGlzLnBhcnRpY2xlUGFyYW0uZGFtcGluZy5nZXRJbml0aWFsVmFsdWUoKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHRyYW5zZm9ybVxyXG4gICAgICAgIG1hdDQubXVsKG5vbmVTY2FsZVRyYXNuZm9ybSwgZW1pdHRlck1hdHJpeCwgbm9uZVNjYWxlVHJhc25mb3JtKVxyXG4gICAgICAgIG1hdDQuY29weShwYXJ0aWNsZU1hdHJpeCwgbm9uZVNjYWxlVHJhc25mb3JtKVxyXG5cclxuICAgICAgICAvLyBjYWxjIHNjYWxpbmdcclxuICAgICAgICBjb25zdCBzY2FsZVZhciA9IHRoaXMucGFydGljbGVQYXJhbS5zY2FsZS5nZXRWYXJpYW50VmFsdWUoMClcclxuICAgICAgICBkYXRhLmluaXQuc2NhbGUgPSB0aGlzLnBhcnRpY2xlUGFyYW0uc2NhbGUuZ2V0SW5pdGlhbFZhbHVlKClcclxuICAgICAgICBjb25zdCBzY2FsZSA9IGRhdGEuaW5pdC5zY2FsZSAqIHNjYWxlVmFyXHJcbiAgICAgICAgdXRpbHMubWF0NFNldFNjYWxpbmcocGFydGljbGVNYXRyaXgsIHBhcnRpY2xlTWF0cml4LCBbc2NhbGUsIHNjYWxlLCBzY2FsZV0pXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gY2FsYyBjb2xvclxyXG4gICAgICAgIGNvbnN0IGNvbG9yVmFyID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmNvbG9yLmdldFZhcmlhbnRWYWx1ZSgwKVxyXG4gICAgICAgIGRhdGEuaW5pdC5jb2xvciA9IHRoaXMucGFydGljbGVQYXJhbS5jb2xvci5nZXRJbml0aWFsVmFsdWUoKVxyXG4gICAgICAgIHZlYzQuY29weShkYXRhLmNvbG9yLCBkYXRhLmluaXQuY29sb3IpXHJcbiAgICAgICAgdmVjNC5tdWwoZGF0YS5jb2xvciwgZGF0YS5jb2xvciwgY29sb3JWYXIpXHJcblxyXG4gICAgICAgIC8vIGNhbGMgcmFuZG9tIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAgICAgIGRhdGEuaW5pdC5yYW5kb21BbmltYXRpb25GcmFtZSA9IHRoaXMucGFydGljbGVQYXJhbS5yYW5kb21BbmltYXRpb25GcmFtZS5nZXRJbml0aWFsVmFsdWUoKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgeyAvLyBVcGRhdGVcclxuICAgICAgZGF0YS5hZ2UgLT0gZGVsdGFcclxuXHJcbiAgICAgIGNvbnN0IGR0ID0gZGVsdGEgLyAxMDAwXHJcbiAgICAgIGxldCB0ID0gMSAtIChkYXRhLmFnZSAvIHRoaXMucGFyYW0ubGlmZSlcclxuICAgICAgaWYgKE51bWJlci5pc05hTih0KSkgdCA9IDBcclxuICAgICAgaWYgKHQgPiAxKSB0ID0gMVxyXG5cclxuICAgICAgY29uc3QgcG9zID0gdmVjMy5mcm9tVmFsdWVzKG5vbmVTY2FsZVRyYXNuZm9ybVsxMl0sIG5vbmVTY2FsZVRyYXNuZm9ybVsxM10sIG5vbmVTY2FsZVRyYXNuZm9ybVsxNF0pXHJcblxyXG4gICAgICAvLyBhcHBseSBhbmd1bGFyIHZlbG9jaXR5XHJcbiAgICAgIGNvbnN0IGF2VmFyID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmFuZ3VsYXJWZWxvY2l0eS5nZXRWYXJpYW50VmFsdWUodClcclxuICAgICAgY29uc3QgYXYgPSBkYXRhLmluaXQuYW5ndWxhclZlbG9jaXR5ICogYXZWYXJcclxuICAgICAgY29uc3QgYW5nbGUgPSB1dGlscy5kZWcycmFkKGF2ICogZHQpXHJcbiAgICAgIHN3aXRjaCAodGhpcy5wYXJ0aWNsZVBhcmFtLmFuZ2xlQXhpcykge1xyXG4gICAgICAgIGNhc2UgJ3gnOlxyXG4gICAgICAgICAgbWF0NC5yb3RhdGVYKG5vbmVTY2FsZVRyYXNuZm9ybSwgbm9uZVNjYWxlVHJhc25mb3JtLCBhbmdsZSlcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneSc6XHJcbiAgICAgICAgICBtYXQ0LnJvdGF0ZVkobm9uZVNjYWxlVHJhc25mb3JtLCBub25lU2NhbGVUcmFzbmZvcm0sIGFuZ2xlKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICd6JzpcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgbWF0NC5yb3RhdGVaKG5vbmVTY2FsZVRyYXNuZm9ybSwgbm9uZVNjYWxlVHJhc25mb3JtLCBhbmdsZSlcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgICAvLyBhcHBseSBncmF2aXR5XHJcbiAgICAgIC8vIHYgPSB2ICsgZyAqIGR0XHJcbiAgICAgIGNvbnN0IHYgPSBkYXRhLnZlbG9jaXR5XHJcbiAgICAgIHZlYzMuYWRkKHYsIHYsIHZlYzMuc2NhbGUodmVjMy5jcmVhdGUoKSwgdGhpcy5wYXJ0aWNsZVBhcmFtLmdyYXZpdHksIGR0KSlcclxuXHJcbiAgICAgIC8vIGFwcGx5IGxpbmVhciBhY2NlbGVyYXRpb25cclxuICAgICAgLy8gdiA9IHYgKyBhICogZHRcclxuICAgICAgY29uc3QgYSA9IHZlYzMuY2xvbmUoZGF0YS5pbml0LmRpcmVjdGlvbilcclxuICAgICAgY29uc3QgbGluZWFyQWNjZWxlcmF0aW9uVmFyID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmxpbmVhckFjY2VsZXJhdGlvbi5nZXRWYXJpYW50VmFsdWUodClcclxuICAgICAgdmVjMy5zY2FsZShhLCBhLCBkYXRhLmluaXQubGluZWFyQWNjZWxlcmF0aW9uICogbGluZWFyQWNjZWxlcmF0aW9uVmFyKVxyXG4gICAgICB2ZWMzLmFkZCh2LCB2LCB2ZWMzLnNjYWxlKGEsIGEsIGR0KSlcclxuXHJcbiAgICAgIC8vIGFwcGx5IHJhZGlhbCBhY2NlbGVyYXRpb25cclxuICAgICAgY29uc3QgcmFkaWFsRGlyZWN0aW9uID0gdmVjMy5zdWIodmVjMy5jcmVhdGUoKSwgcG9zLCBlbWl0dGVyUG9zKVxyXG4gICAgICBjb25zdCByYWRpdXMgPSB2ZWMzLmxlbmd0aChyYWRpYWxEaXJlY3Rpb24pXHJcbiAgICAgIHZlYzMubm9ybWFsaXplKHJhZGlhbERpcmVjdGlvbiwgcmFkaWFsRGlyZWN0aW9uKVxyXG4gICAgICBjb25zdCByYWRpYWxBY2NlbGVyYXRpb25WYXIgPSB0aGlzLnBhcnRpY2xlUGFyYW0ucmFkaWFsQWNjZWxlcmF0aW9uLmdldFZhcmlhbnRWYWx1ZSh0KVxyXG4gICAgICBjb25zdCByYWRpYWxBY2NlbGVyYXRpb24gPSB2ZWMzLnNjYWxlKHZlYzMuY3JlYXRlKCksIHJhZGlhbERpcmVjdGlvbiwgZGF0YS5pbml0LnJhZGlhbEFjY2VsZXJhdGlvbipkdCpyYWRpYWxBY2NlbGVyYXRpb25WYXIpXHJcbiAgICAgIHZlYzMuYWRkKHYsIHYsIHJhZGlhbEFjY2VsZXJhdGlvbilcclxuICAgICAgXHJcbiAgICAgIC8vIGFwcGx5IHRhbmdlbnRpYWwgYWNjZWxlcmF0aW9uXHJcbiAgICAgIGNvbnN0IHRhbmdlbnRpYWxEaXJlY3Rpb24gPSB2ZWMzLmNyb3NzKHZlYzMuY3JlYXRlKCksIGVtaXR0ZXJVcCwgcmFkaWFsRGlyZWN0aW9uKVxyXG4gICAgICB2ZWMzLm5vcm1hbGl6ZSh0YW5nZW50aWFsRGlyZWN0aW9uLCB0YW5nZW50aWFsRGlyZWN0aW9uKVxyXG4gICAgICBjb25zdCB0YW5nZW50aWFsQWNjZWxlcmF0aW9uVmFyID0gdGhpcy5wYXJ0aWNsZVBhcmFtLnRhbmdlbnRpYWxBY2NlbGVyYXRpb24uZ2V0VmFyaWFudFZhbHVlKHQpXHJcbiAgICAgIGNvbnN0IHRhbmdlbnRpYWxBY2NlbGVyYXRpb24gPSB2ZWMzLnNjYWxlKHZlYzMuY3JlYXRlKCksIHRhbmdlbnRpYWxEaXJlY3Rpb24sIGRhdGEuaW5pdC50YW5nZW50aWFsQWNjZWxlcmF0aW9uKmR0KnRhbmdlbnRpYWxBY2NlbGVyYXRpb25WYXIpXHJcbiAgICAgIHZlYzMuYWRkKHYsIHYsIHRhbmdlbnRpYWxBY2NlbGVyYXRpb24pXHJcblxyXG5cclxuICAgICAgLy8gYXBwbHkgZGFtcGluZ1xyXG4gICAgICBjb25zdCBkYW1waW5nVmFyID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmRhbXBpbmcuZ2V0VmFyaWFudFZhbHVlKHQpXHJcbiAgICAgIHZlYzMubGVycCh2LCB2LCBbMCwgMCwgMF0sIGRhdGEuaW5pdC5kYW1waW5nICogZGFtcGluZ1ZhcilcclxuICBcclxuICAgICAgLy8gdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgIC8vIHggPSB4ICsgdiAqIGR0XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IG5vbmVTY2FsZVRyYXNuZm9ybVxyXG4gICAgICB0cmFuc2Zvcm1bMTJdICs9IHZbMF0gKiBkdFxyXG4gICAgICB0cmFuc2Zvcm1bMTNdICs9IHZbMV0gKiBkdFxyXG4gICAgICB0cmFuc2Zvcm1bMTRdICs9IHZbMl0gKiBkdFxyXG5cclxuICAgICAgLy8gYXBwbHkgb3JiaXRhbCB2ZWxvY2l0eVxyXG4gICAgICBpZiAocmFkaXVzID4gMCkge1xyXG4gICAgICAgIGNvbnN0IG9yYml0YWxWZWxvY2l0eVZhciA9IHRoaXMucGFydGljbGVQYXJhbS5vcmJpdGFsVmVsb2NpdHkuZ2V0VmFyaWFudFZhbHVlKHQpXHJcbiAgICAgICAgY29uc3Qgb3JiaXRhbFYgPSBkYXRhLmluaXQub3JiaXRhbFZlbG9jaXR5ICogb3JiaXRhbFZlbG9jaXR5VmFyXHJcbiAgICAgICAgY29uc3QgZW1pdHRlclBvcyA9IHZlYzMuZnJvbVZhbHVlcyhlbWl0dGVyTWF0cml4WzEyXSwgZW1pdHRlck1hdHJpeFsxM10sIGVtaXR0ZXJNYXRyaXhbMTRdKVxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHZlYzMuZnJvbVZhbHVlcyh0cmFuc2Zvcm1bMTJdLCB0cmFuc2Zvcm1bMTNdLCB0cmFuc2Zvcm1bMTRdKVxyXG4gICAgICAgIHZlYzMucm90YXRlWShwb3MsIHBvcywgZW1pdHRlclBvcywgb3JiaXRhbFYgKiBkdClcclxuICAgICAgICB0cmFuc2Zvcm1bMTJdID0gcG9zWzBdXHJcbiAgICAgICAgdHJhbnNmb3JtWzEzXSA9IHBvc1sxXVxyXG4gICAgICAgIHRyYW5zZm9ybVsxNF0gPSBwb3NbMl1cclxuICAgICAgfVxyXG5cclxuICAgICAgbWF0NC5jb3B5KHBhcnRpY2xlTWF0cml4LCBub25lU2NhbGVUcmFzbmZvcm0pXHJcblxyXG4gICAgICAvLyB1cGRhdGUgc2NhbGluZ1xyXG4gICAgICBjb25zdCBzY2FsZVZhciA9IHRoaXMucGFydGljbGVQYXJhbS5zY2FsZS5nZXRWYXJpYW50VmFsdWUodClcclxuICAgICAgY29uc3Qgc2NhbGUgPSBkYXRhLmluaXQuc2NhbGUgKiBzY2FsZVZhclxyXG4gICAgICB1dGlscy5tYXQ0U2V0U2NhbGluZyhwYXJ0aWNsZU1hdHJpeCwgcGFydGljbGVNYXRyaXgsIFtzY2FsZSwgc2NhbGUsIHNjYWxlXSlcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBjb2xvclxyXG4gICAgICBjb25zdCBjb2xvclZhciA9IHRoaXMucGFydGljbGVQYXJhbS5jb2xvci5nZXRWYXJpYW50VmFsdWUodClcclxuICAgICAgdmVjNC5jb3B5KGRhdGEuY29sb3IsIGRhdGEuaW5pdC5jb2xvcilcclxuICAgICAgdmVjNC5tdWwoZGF0YS5jb2xvciwgZGF0YS5jb2xvciwgY29sb3JWYXIpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQYXJ0aWNsZXMgKGRlbHRhKSB7XHJcbiAgICBsZXQgaW5kZXggPSAwXHJcbiAgICBmb3IgKGxldCBkYXRhIG9mIHRoaXMucnVudGltZS5wYXJ0aWNsZVBvb2wpIHtcclxuICAgICAgZGF0YS5pbmRleCA9IGluZGV4KytcclxuICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZURhdGEoZGF0YSwgZGVsdGEpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBpbnN0YW5jZXNEYXRhID0gW3RyYW5zZm9ybTogbWF0NCwgY29sb3I6IHVpbnQzMl1cclxuICByZW5kZXJQYXJ0aWNsZXMgKCkge1xyXG4gICAgaWYgKHRoaXMucGFydGljbGVSZW5kZXJlciA9PT0gbnVsbCkgcmV0dXJuXHJcbiAgICBjb25zdCB1dlNjYWxlID0gWzEsIDFdXHJcbiAgICBjb25zdCBoRnJhbWUgPSB0aGlzLnBhcnRpY2xlUGFyYW0uYW5pbWF0aW9uSEZyYW1lc1xyXG4gICAgY29uc3QgdkZyYW1lID0gdGhpcy5wYXJ0aWNsZVBhcmFtLmFuaW1hdGlvblZGcmFtZXNcclxuICAgIGlmIChoRnJhbWUgPiAwKSB1dlNjYWxlWzBdID0gMSAvIGhGcmFtZVxyXG4gICAgaWYgKHZGcmFtZSA+IDApIHV2U2NhbGVbMV0gPSAxIC8gdkZyYW1lXHJcblxyXG4gICAgY29uc3QgaW5zdGFuY2VzRGF0YSA9IHRoaXMucnVudGltZS5pbnN0YW5jZXNEYXRhXHJcbiAgICBsZXQgaW5zdGFuY2VDb3VudCA9IDBcclxuICAgIGZvciAobGV0IGRhdGEgb2YgdGhpcy5ydW50aW1lLnBhcnRpY2xlUG9vbCkge1xyXG4gICAgICBpZiAoZGF0YS5hZ2UgPiAwKSB7XHJcbiAgICAgICAgbGV0IG1NYXRyaXggPSBkYXRhLnRyYW5zZm9ybVxyXG4gICAgICAgIGlmICh0aGlzLnBhcmFtLmxvY2FsQ29vcmRzKSB7XHJcbiAgICAgICAgICBtTWF0cml4ID0gbWF0NC5jbG9uZShkYXRhLnRyYW5zZm9ybSlcclxuICAgICAgICAgIG1hdDQubXVsKG1NYXRyaXgsIHRoaXMudHJhbnNmb3JtLmdsb2JhbE1hdHJpeCwgbU1hdHJpeClcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtTGVuID0gbU1hdHJpeC5sZW5ndGggLy8gNCo0IGluIDQgYnl0ZXNcclxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1PZmZzZXQgPSAwXHJcbiAgICAgICAgY29uc3QgY29sb3JMZW4gPSA0IC8vIHJnYmFcclxuICAgICAgICBjb25zdCBjb2xvck9mZnNldCA9IHRyYW5zZm9ybUxlblxyXG4gICAgICAgIGNvbnN0IHV2T2Zmc2V0TGVuID0gMiAvLyB1dlxyXG4gICAgICAgIGNvbnN0IHV2T2Zmc2V0T2Zmc2V0ID0gY29sb3JPZmZzZXQgKyBjb2xvckxlblxyXG4gICAgICAgIGNvbnN0IHN0cmlkZSA9IHRyYW5zZm9ybUxlbiArIGNvbG9yTGVuICsgdXZPZmZzZXRMZW5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dHJhbnNmb3JtTGVuOyArK2kpIHtcclxuICAgICAgICAgIGluc3RhbmNlc0RhdGFbaW5zdGFuY2VDb3VudCpzdHJpZGUrdHJhbnNmb3JtT2Zmc2V0K2ldID0gbU1hdHJpeFtpXVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8Y29sb3JMZW47ICsraSkge1xyXG4gICAgICAgICAgaW5zdGFuY2VzRGF0YVtpbnN0YW5jZUNvdW50KnN0cmlkZStjb2xvck9mZnNldCtpXSA9IGRhdGEuY29sb3JbaV1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGZyYW1lID0gMFxyXG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlUGFyYW0uZW5hYmxlUmFuZG9tQW5pbWF0aW9uRnJhbWUpIHtcclxuICAgICAgICAgIGZyYW1lID0gZGF0YS5pbml0LnJhbmRvbUFuaW1hdGlvbkZyYW1lXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGZyYW1lID0gZGF0YS5jYWxjQW5pbWF0aW9uRnJhbWUodGhpcy5wYXJhbS5saWZlLCB0aGlzLnBhcnRpY2xlUGFyYW0uYW5pbWF0aW9uRlBTKVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB1dk9mZnNldCA9IGRhdGEuY2FsY1VWT2Zmc2V0KGZyYW1lLCBoRnJhbWUsIHZGcmFtZSlcclxuICAgICAgICBpbnN0YW5jZXNEYXRhW2luc3RhbmNlQ291bnQqc3RyaWRlK3V2T2Zmc2V0T2Zmc2V0KzBdID0gdXZPZmZzZXRbMF1cclxuICAgICAgICBpbnN0YW5jZXNEYXRhW2luc3RhbmNlQ291bnQqc3RyaWRlK3V2T2Zmc2V0T2Zmc2V0KzFdID0gdXZPZmZzZXRbMV1cclxuICAgICAgICBpbnN0YW5jZUNvdW50ICs9IDFcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5wYXJ0aWNsZVJlbmRlcmVyLnJlbmRlclBhcnRpY2xlcyh0aGlzLnJ1bnRpbWUucGFydGljbGVQb29sLmxlbmd0aCwgaW5zdGFuY2VzRGF0YSwgaW5zdGFuY2VDb3VudCwgdXZTY2FsZSlcclxuICB9XHJcblxyXG4gIGFkZGVkICgpIHtcclxuICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSlcclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoZGVsdGEpIHtcclxuICAgIGlmICh0aGlzLnBhcmFtLm9uZVNob3QgJiYgdGhpcy5ydW50aW1lLmVtaXR0aW5nICYmIHRoaXMucnVudGltZS5lbWl0VGltZSA+IHRoaXMucGFyYW0ubGlmZSkge1xyXG4gICAgICB0aGlzLnN0b3BFbWlzc2lvbigpXHJcbiAgICAgIHRoaXMuc2lnbmFscy5lbWlzc2lvbkVuZC5lbWl0KClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN5bmNQYXJ0aWNsZUNvdW50KClcclxuICAgIHRoaXMucmV2aXZlUGFydGljbGVzKGRlbHRhKVxyXG4gICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoZGVsdGEpXHJcbiAgICB0aGlzLnJlbmRlclBhcnRpY2xlcygpXHJcbiAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IHsgUGFydGljbGVFbWl0dGVyLCBQYXJ0aWNsZVBhcmFtLCBQYXJ0aWNsZUVtaXRTaGFwZSwgUGFydGljbGVFbWl0U2hhcGVCb3gsIFBhcnRpY2xlRW1pdFNoYXBlQ3lsaW5kZXIsIFBhcnRpY2xlRW1pdFNoYXBlUG9pbnQsIFBhcnRpY2xlRW1pdFNoYXBlU2hwZXJlLCBQYXJ0aWNsZVBhcmFtQ29sb3IsIFBhcnRpY2xlUGFyYW1OdW1iZXIgfSIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5pbXBvcnQgeyBQYXJ0aWNsZUVtaXRTaGFwZUJveCwgUGFydGljbGVFbWl0U2hhcGVDeWxpbmRlciwgUGFydGljbGVFbWl0U2hhcGVQb2ludCwgUGFydGljbGVFbWl0U2hhcGVTaHBlcmUsIFBhcnRpY2xlRW1pdHRlciB9IGZyb20gJy4vcGFydGljbGVfZW1pdHRlci5qcydcclxuXHJcbmNvbnN0IEVNSVRfU0hBUEUgPSB7XHJcbiAgUE9JTlQ6IDAsXHJcbiAgU1BIRVJFOiAxLFxyXG4gIEJPWDogMixcclxuICBDWUxJTkRFUjogMyxcclxufVxyXG5cclxuY2xhc3MgUGFydGljbGVFbWl0dGVyQ29udHJvbGxlcjEge1xyXG5cclxuICBjdXJyZW50RW1pdFNoYXBlID0gbnVsbFxyXG4gIGVtaXRTaGFwZXMgPSBbXVxyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgYWRkZWQgKCkge1xyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoUGFydGljbGVFbWl0dGVyKVxyXG4gICAgaWYgKCF0aGlzLnBhcnRpY2xlRW1pdHRlcikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ1VuYWJsZSB0byBmaW5kIGEgdmFsaWQgcGFydGljbGUgZW1pdHRlciEnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLlBPSU5UXSA9IG5ldyBQYXJ0aWNsZUVtaXRTaGFwZVBvaW50KClcclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLkJPWF0gPSBuZXcgUGFydGljbGVFbWl0U2hhcGVCb3goMCwgMCwgMClcclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLlNQSEVSRV0gPSBuZXcgUGFydGljbGVFbWl0U2hhcGVTaHBlcmUoMCwgMClcclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLkNZTElOREVSXSA9bmV3IFBhcnRpY2xlRW1pdFNoYXBlQ3lsaW5kZXIoMCwgMCwgMClcclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoZGVsdGEpIHtcclxuICAgIGlmICghdGhpcy5wYXJ0aWNsZUVtaXR0ZXIpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IGFwcCA9IHRoaXMuZW50aXR5LmFwcFxyXG4gICAgY29uc3QgdnVlVUkgPSBhcHAudnVlVUlcclxuICAgIGlmIChhcHAuaW5wdXRNYW5hZ2VyLmlzQWN0aW9uSnVzdFByZXNzZWQoJ2ludGVyYWN0JykpIHtcclxuICAgICAgaWYgKHRoaXMucGFydGljbGVFbWl0dGVyLnJ1bnRpbWUuZW1pdHRpbmcpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5zdG9wRW1pc3Npb24oKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnN0YXJ0RW1pc3Npb24oKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFyYW0uZXhwbG9zaXZlID0gdnVlVUkucHMuZXhwbG9zaXZlXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJhbS5saWZlID0gdnVlVUkucHMubGlmZSAqIDEwMDBcclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGlmZVJhbmRvbW5lc3MgPSB2dWVVSS5wcy5saWZlUmFuZG9tbmVzc1xyXG5cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZW1pdFNoYXBlID0gdGhpcy5lbWl0U2hhcGVzW3Z1ZVVJLnBzLmVtaXRTaGFwZS52YWx1ZV0gPz8gdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5lbWl0U2hhcGVcclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLlNQSEVSRV0ucGFyYW0uaXIgPSB2dWVVSS5wcy5lbWl0U2hhcGUuc3BoZXJlWzBdXHJcbiAgICB0aGlzLmVtaXRTaGFwZXNbRU1JVF9TSEFQRS5TUEhFUkVdLnBhcmFtLm9yID0gdnVlVUkucHMuZW1pdFNoYXBlLnNwaGVyZVsxXVxyXG4gICAgdGhpcy5lbWl0U2hhcGVzW0VNSVRfU0hBUEUuQk9YXS5wYXJhbS53ID0gdnVlVUkucHMuZW1pdFNoYXBlLmJveC53XHJcbiAgICB0aGlzLmVtaXRTaGFwZXNbRU1JVF9TSEFQRS5CT1hdLnBhcmFtLmggPSB2dWVVSS5wcy5lbWl0U2hhcGUuYm94LmhcclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLkJPWF0ucGFyYW0ubCA9IHZ1ZVVJLnBzLmVtaXRTaGFwZS5ib3gubFxyXG4gICAgdGhpcy5lbWl0U2hhcGVzW0VNSVRfU0hBUEUuQ1lMSU5ERVJdLnBhcmFtLmlyID0gdnVlVUkucHMuZW1pdFNoYXBlLmN5bGluZGVyLnJbMF1cclxuICAgIHRoaXMuZW1pdFNoYXBlc1tFTUlUX1NIQVBFLkNZTElOREVSXS5wYXJhbS5vciA9IHZ1ZVVJLnBzLmVtaXRTaGFwZS5jeWxpbmRlci5yWzFdXHJcbiAgICB0aGlzLmVtaXRTaGFwZXNbRU1JVF9TSEFQRS5DWUxJTkRFUl0ucGFyYW0uaCA9IHZ1ZVVJLnBzLmVtaXRTaGFwZS5jeWxpbmRlci5oXHJcbiAgICBcclxuICAgIHZlYzMuY29weSh0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmRpcmVjdGlvbiwgdnVlVUkucHMuZGlyZWN0aW9uKVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5zcHJlYWQgPSB2dWVVSS5wcy5zcHJlYWRcclxuICAgIHZlYzMuY29weSh0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmdyYXZpdHksIHZ1ZVVJLnBzLmdyYXZpdHkpXHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS5taW4gPSB2dWVVSS5wcy5jb2xvclswXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS5tYXggPSB2dWVVSS5wcy5jb2xvclsxXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSB2dWVVSS5wcy5jb2xvclZhcmlhbnRGdW5jdGlvbi5lbmFibGUgPyB2dWVVSS5wcy5jb2xvclZhcmlhbnRGdW5jdGlvbi5mdW5jIDogbnVsbFxyXG5cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0ubWluID0gdnVlVUkucHMuc2NhbGVbMF1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0ubWF4ID0gdnVlVUkucHMuc2NhbGVbMV1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0udmFyaWFudEZ1bmN0aW9uID0gdnVlVUkucHMuc2NhbGVWYXJpYW50RnVuY3Rpb24uZW5hYmxlID8gdnVlVUkucHMuc2NhbGVWYXJpYW50RnVuY3Rpb24uZnVuYyA6IG51bGxcclxuICAgIFxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5hbmdsZS5wYXJhbS5taW4gPSB2dWVVSS5wcy5hbmdsZVswXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5hbmdsZS5wYXJhbS5tYXggPSB2dWVVSS5wcy5hbmdsZVsxXVxyXG5cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGFtcGluZy5wYXJhbS5taW4gPSB2dWVVSS5wcy5kYW1waW5nWzBdXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmRhbXBpbmcucGFyYW0ubWF4ID0gdnVlVUkucHMuZGFtcGluZ1sxXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5kYW1waW5nLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9IHZ1ZVVJLnBzLmRhbXBpbmdWYXJpYW50RnVuY3Rpb24uZW5hYmxlID8gdnVlVUkucHMuZGFtcGluZ1ZhcmlhbnRGdW5jdGlvbi5mdW5jIDogbnVsbFxyXG5cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGluZWFyVmVsb2NpdHkucGFyYW0ubWluID0gdnVlVUkucHMubGluZWFyVmVsb2NpdHlbMF1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGluZWFyVmVsb2NpdHkucGFyYW0ubWF4ID0gdnVlVUkucHMubGluZWFyVmVsb2NpdHlbMV1cclxuXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmFuZ3VsYXJWZWxvY2l0eS5wYXJhbS5taW4gPSB2dWVVSS5wcy5hbmd1bGFyVmVsb2NpdHlbMF1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uYW5ndWxhclZlbG9jaXR5LnBhcmFtLm1heCA9IHZ1ZVVJLnBzLmFuZ3VsYXJWZWxvY2l0eVsxXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5hbmd1bGFyVmVsb2NpdHkucGFyYW0udmFyaWFudEZ1bmN0aW9uID0gdnVlVUkucHMuYW5ndWxhclZlbG9jaXR5VmFyaWFudEZ1bmN0aW9uLmVuYWJsZSA/IHZ1ZVVJLnBzLmFuZ3VsYXJWZWxvY2l0eVZhcmlhbnRGdW5jdGlvbi5mdW5jIDogbnVsbFxyXG5cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGluZWFyQWNjZWxlcmF0aW9uLnBhcmFtLm1pbiA9IHZ1ZVVJLnBzLmxpbmVhckFjY2VsZXJhdGlvblswXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5saW5lYXJBY2NlbGVyYXRpb24ucGFyYW0ubWF4ID0gdnVlVUkucHMubGluZWFyQWNjZWxlcmF0aW9uWzFdXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmxpbmVhckFjY2VsZXJhdGlvbi5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSB2dWVVSS5wcy5saW5lYXJBY2NlbGVyYXRpb25WYXJpYW50RnVuY3Rpb24uZW5hYmxlID8gdnVlVUkucHMubGluZWFyQWNjZWxlcmF0aW9uVmFyaWFudEZ1bmN0aW9uLmZ1bmMgOiBudWxsXHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5yYWRpYWxBY2NlbGVyYXRpb24ucGFyYW0ubWluID0gdnVlVUkucHMucmFkaWFsQWNjZWxlcmF0aW9uWzBdXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnJhZGlhbEFjY2VsZXJhdGlvbi5wYXJhbS5tYXggPSB2dWVVSS5wcy5yYWRpYWxBY2NlbGVyYXRpb25bMV1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ucmFkaWFsQWNjZWxlcmF0aW9uLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9IHZ1ZVVJLnBzLnJhZGlhbEFjY2VsZXJhdGlvblZhcmlhbnRGdW5jdGlvbi5lbmFibGUgPyB2dWVVSS5wcy5yYWRpYWxBY2NlbGVyYXRpb25WYXJpYW50RnVuY3Rpb24uZnVuYyA6IG51bGxcclxuXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnRhbmdlbnRpYWxBY2NlbGVyYXRpb24ucGFyYW0ubWluID0gdnVlVUkucHMudGFuZ2VudGlhbEFjY2VsZXJhdGlvblswXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS50YW5nZW50aWFsQWNjZWxlcmF0aW9uLnBhcmFtLm1heCA9IHZ1ZVVJLnBzLnRhbmdlbnRpYWxBY2NlbGVyYXRpb25bMV1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0udGFuZ2VudGlhbEFjY2VsZXJhdGlvbi5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSB2dWVVSS5wcy50YW5nZW50aWFsQWNjZWxlcmF0aW9uVmFyaWFudEZ1bmN0aW9uLmVuYWJsZSA/IHZ1ZVVJLnBzLnRhbmdlbnRpYWxBY2NlbGVyYXRpb25WYXJpYW50RnVuY3Rpb24uZnVuYyA6IG51bGxcclxuXHJcbiAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLm9yYml0YWxWZWxvY2l0eS5wYXJhbS5taW4gPSB2dWVVSS5wcy5vcmJpdGFsVmVsb2NpdHlbMF1cclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ub3JiaXRhbFZlbG9jaXR5LnBhcmFtLm1heCA9IHZ1ZVVJLnBzLm9yYml0YWxWZWxvY2l0eVsxXVxyXG4gICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5vcmJpdGFsVmVsb2NpdHkucGFyYW0udmFyaWFudEZ1bmN0aW9uID0gdnVlVUkucHMub3JiaXRhbFZlbG9jaXR5VmFyaWFudEZ1bmN0aW9uLmVuYWJsZSA/IHZ1ZVVJLnBzLm9yYml0YWxWZWxvY2l0eVZhcmlhbnRGdW5jdGlvbi5mdW5jIDogbnVsbFxyXG5cclxuICAgIGlmICh2dWVVSS5wcy5jb3VudCAhPT0gdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFyYW0uY291bnQpIHtcclxuICAgICAgdGhpcy5wYXJ0aWNsZUVtaXR0ZXIucGFyYW0uY291bnQgPSB2dWVVSS5wcy5jb3VudFxyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IFBhcnRpY2xlRW1pdHRlckNvbnRyb2xsZXIxIH0iLCJpbXBvcnQgeyBRdWFkTWVzaCB9IGZyb20gJy4uL3Jlc291cmNlcy9tZXNoLmpzJ1xyXG5pbXBvcnQgeyBTaW1wbGVNZXNoU2hhZGVyIH0gZnJvbSAnLi4vcmVzb3VyY2VzL3NoYWRlci5qcydcclxuaW1wb3J0IHsgUGFydGljbGVNZXNoIH0gZnJvbSAnLi4vcmVzb3VyY2VzL3BhcnRpY2xlX21lc2guanMnXHJcblxyXG5jb25zdCBCTEVORF9NT0RFID0ge1xyXG4gIE1JWDogMCxcclxuICBBREQ6IDEsXHJcbiAgTVVMOiAyLFxyXG59XHJcblxyXG5jbGFzcyBQYXJ0aWNsZVJlbmRlcmVyIHtcclxuXHJcbiAgbWVzaCA9IG51bGxcclxuICBwYXJ0aWNsZU1lc2ggPSBudWxsXHJcblxyXG4gIF9wYXJhbXMgPSB7XHJcbiAgICBibGVuZE1vZGU6IEJMRU5EX01PREUuTUlYLFxyXG4gICAgZW5hYmxlQmlsbGJvYXJkOiBmYWxzZSxcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChtZXNoLCBwYXJhbXMpIHtcclxuXHJcbiAgICBpZiAocGFyYW1zKSB7XHJcbiAgICAgIGZvciAobGV0IGsgaW4gdGhpcy5fcGFyYW1zKSB7XHJcbiAgICAgICAgdGhpcy5fcGFyYW1zW2tdID0gcGFyYW1zW2tdID8/IHRoaXMuX3BhcmFtc1trXVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5tZXNoID0gbWVzaFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyUGFydGljbGVzIChjb3VudCwgaW5zdGFuY2VzRGF0YSwgaW5zdGFuY2VDb3VudCwgdXZTY2FsZSkge1xyXG4gICAgaWYgKHRoaXMubWVzaCA9PT0gbnVsbCkgcmV0dXJuXHJcbiAgICBpZiAodGhpcy5wYXJ0aWNsZU1lc2ggPT09IG51bGwgfHwgdGhpcy5wYXJ0aWNsZU1lc2guYnVmZmVyU2l6ZSAhPT0gY291bnQpIHtcclxuICAgICAgdGhpcy5wYXJ0aWNsZU1lc2ggPSB0aGlzLmVudGl0eS5hcHAuY3JlYXRlUmVzb3VyY2UoUGFydGljbGVNZXNoLCB0aGlzLm1lc2gsIGNvdW50KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1lc2ggPSB0aGlzLm1lc2hcclxuICAgIGNvbnN0IGNhbWVyYSA9IHRoaXMuZW50aXR5LmFwcC5tYWluQ2FtZXJhXHJcbiAgICBjb25zdCBnbCA9IHRoaXMuZW50aXR5LmFwcC5yZW5kZXJTZXJ2ZXIuZ2xcclxuICAgIGlmICghY2FtZXJhKSByZXR1cm5cclxuICAgIGlmICghZ2wpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBnbCEnKVxyXG5cclxuICAgIGlmICh0aGlzLnBhcnRpY2xlTWVzaC5pc1ZhbGlkKCkpIHtcclxuICAgICAgY29uc3Qgc2hhZGVyID0gbWVzaC5zaGFkZXJcclxuXHJcbiAgICAgIGNvbnN0IHBNYXRyaXggPSBjYW1lcmEucE1hdHJpeFxyXG4gICAgICBjb25zdCB2TWF0cml4ID0gY2FtZXJhLnRyYW5zZm9ybS5nbG9iYWxNYXRyaXhcclxuXHJcbiAgICAgIHNoYWRlci51c2UoKVxyXG5cclxuICAgICAgc2hhZGVyLnVwbG9hZFBhcmFtZXRlcigncE1hdHJpeCcsIHBNYXRyaXgpXHJcbiAgICAgIHNoYWRlci51cGxvYWRQYXJhbWV0ZXIoJ3ZNYXRyaXgnLCB2TWF0cml4KVxyXG4gICAgICBzaGFkZXIudXBsb2FkUGFyYW1ldGVyKCdlbmFibGVCaWxsYm9hcmQnLCB0aGlzLl9wYXJhbXMuZW5hYmxlQmlsbGJvYXJkID8gMSA6IDAsIHRydWUpXHJcbiAgICAgIHNoYWRlci51cGxvYWRQYXJhbWV0ZXIoJ2VuYWJsZUluc3RhbmNlRHJhdycsIDEsIHRydWUpXHJcbiAgICAgIHNoYWRlci51cGxvYWRQYXJhbWV0ZXIoJ2VuYWJsZVZlcnRDb2xvcicsIDEsIHRydWUpXHJcbiAgICAgIHNoYWRlci51cGxvYWRQYXJhbWV0ZXIoJ3V2U2NhbGUnLCB1dlNjYWxlKVxyXG5cclxuICAgICAgc2hhZGVyLnNldFBhcmFtZXRlcnNUb0dMKClcclxuICAgICAgXHJcbiAgICAgIGdsLmRlcHRoTWFzayhmYWxzZSlcclxuICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKVxyXG4gICAgICBzd2l0Y2godGhpcy5fcGFyYW1zLmJsZW5kTW9kZSkge1xyXG4gICAgICAgIGNhc2UgQkxFTkRfTU9ERS5NSVg6XHJcbiAgICAgICAgICBnbC5ibGVuZEVxdWF0aW9uU2VwYXJhdGUoZ2wuRlVOQ19BREQsIGdsLkZVTkNfQUREKTtcclxuICAgICAgICAgIGdsLmJsZW5kRnVuY1NlcGFyYXRlKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSwgZ2wuWkVSTywgZ2wuT05FKTtcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSBCTEVORF9NT0RFLkFERDpcclxuICAgICAgICAgIGdsLmJsZW5kRXF1YXRpb25TZXBhcmF0ZShnbC5GVU5DX0FERCwgZ2wuRlVOQ19BREQpXHJcbiAgICAgICAgICBnbC5ibGVuZEZ1bmNTZXBhcmF0ZShnbC5TUkNfQUxQSEEsIGdsLk9ORSwgZ2wuWkVSTywgZ2wuT05FKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIEJMRU5EX01PREUuTVVMOlxyXG4gICAgICAgICAgZ2wuYmxlbmRFcXVhdGlvblNlcGFyYXRlKGdsLkZVTkNfQURELCBnbC5GVU5DX0FERClcclxuICAgICAgICAgIGdsLmJsZW5kRnVuY1NlcGFyYXRlKGdsLkRTVF9DT0xPUiwgZ2wuWkVSTywgZ2wuWkVSTywgZ2wuT05FKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5wYXJ0aWNsZU1lc2gudXBkYXRlSW5zdGFuY2VEYXRhKGluc3RhbmNlc0RhdGEpXHJcbiAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnBhcnRpY2xlTWVzaC5nbFZhbylcclxuICAgICAgZ2wuZHJhd0FycmF5c0luc3RhbmNlZChnbC5UUklBTkdMRVMsIDAsIG1lc2gudmVydGV4Q291bnQsIGluc3RhbmNlQ291bnQpXHJcbiAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKVxyXG4gICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKVxyXG4gICAgICBnbC5kZXB0aE1hc2sodHJ1ZSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5cclxuY2xhc3MgVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIgZXh0ZW5kcyBQYXJ0aWNsZVJlbmRlcmVyIHtcclxuICBjb25zdHJ1Y3RvciAocGFyYW1zKSB7XHJcbiAgICBzdXBlcihudWxsLCBwYXJhbXMpXHJcbiAgICB0aGlzLl9wYXJhbXMudGV4dHVyZSA9IG51bGxcclxuICAgIGlmIChwYXJhbXMpIHtcclxuICAgICAgZm9yIChsZXQgayBpbiB0aGlzLl9wYXJhbXMpIHtcclxuICAgICAgICB0aGlzLl9wYXJhbXNba10gPSBwYXJhbXNba10gPz8gdGhpcy5fcGFyYW1zW2tdXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldCB0ZXh0dXJlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BhcmFtcy50ZXh0dXJlXHJcbiAgfVxyXG5cclxuICBzZXQgdGV4dHVyZSh2KSB7XHJcbiAgICB0aGlzLl9wYXJhbXMudGV4dHVyZSA9IHZcclxuICB9XHJcblxyXG4gIGFzeW5jIGF5c25jQWRkZWQgKCkge1xyXG4gICAgY29uc3QgYXBwID0gdGhpcy5lbnRpdHkuYXBwXHJcbiAgICBjb25zdCByZXNvdXJjZVNlcnZlciA9IGFwcC5yZXNvdXJjZVNlcnZlclxyXG4gICAgY29uc3QgbWVzaCA9IGFwcC5jcmVhdGVSZXNvdXJjZShRdWFkTWVzaClcclxuICAgIG1lc2guc2hhZGVyID0gYXBwLmNyZWF0ZVJlc291cmNlKFNpbXBsZU1lc2hTaGFkZXIsXHJcbiAgICAgIGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvc2hhZGVycy91bmxpdDMudnMnKSxcclxuICAgICAgYXdhaXQgcmVzb3VyY2VTZXJ2ZXIubG9hZChfX1JPT1RfUEFUSF9fICsgJ2Fzc2V0cy9zaGFkZXJzL3VubGl0My5mcycpXHJcbiAgICAgIClcclxuICAgIG1lc2guc2hhZGVyLnBhcmFtZXRlcnMuY3VsbE1vZGUgPSBTaW1wbGVNZXNoU2hhZGVyLkNVTExfTU9ERS5CQUNLXHJcbiAgICB0aGlzLm1lc2ggPSBtZXNoXHJcbiAgfVxyXG5cclxuICBhZGRlZCAoKSB7XHJcbiAgICB0aGlzLmF5c25jQWRkZWQoKS50aGVuKClcclxuICB9XHJcblxyXG4gIHJlbmRlclBhcnRpY2xlcyAoY291bnQsIGluc3RhbmNlc0RhdGEsIGluc3RhbmNlQ291bnQsIHV2U2NhbGUpIHtcclxuICAgIHN1cGVyLnJlbmRlclBhcnRpY2xlcyhjb3VudCwgaW5zdGFuY2VzRGF0YSwgaW5zdGFuY2VDb3VudCwgdXZTY2FsZSlcclxuICAgIGlmICh0aGlzLm1lc2ggPT09IG51bGwpIHJldHVyblxyXG4gICAgY29uc3Qgc2hhZGVyID0gdGhpcy5tZXNoLnNoYWRlclxyXG4gICAgc2hhZGVyLnBhcmFtZXRlcnMudGV4MSA9IHRoaXMuX3BhcmFtcy50ZXh0dXJlXHJcbiAgfVxyXG59XHJcblxyXG5QYXJ0aWNsZVJlbmRlcmVyLkJMRU5EX01PREUgPSBCTEVORF9NT0RFXHJcblxyXG5leHBvcnQgeyBQYXJ0aWNsZVJlbmRlcmVyLCBUZXh0dXJlUGFydGljbGVSZW5kZXJlciB9IiwiaW1wb3J0IHsgbWF0NCwgcXVhdCwgdmVjMywgdmVjNCB9IGZyb20gXCIuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzXCJcclxuXHJcbmNsYXNzIFRyYW5zZm9ybSB7XHJcblxyXG4gIG1hdHJpeFxyXG4gIGV1bGVyRGVncmVlcyA9IHZlYzMuY3JlYXRlKCkgLy8gaW4gZGVncmVlc1xyXG5cclxuICBwYXJlbnQgPSBudWxsXHJcbiAgY2hpbGRyZW4gPSBbXVxyXG5cclxuICAjZGlydHkgPSB7XHJcbiAgICBldWxlckRlZ3JlZXM6IGZhbHNlLFxyXG4gICAgbWF0cml4OiB0cnVlLFxyXG4gIH1cclxuXHJcbiAgI2NoYWNoZSA9IHtcclxuICAgIGdsb2JhbE1hdHJpeDogbWF0NC5jcmVhdGUoKSxcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMubWF0cml4ID0gbWF0NC5jcmVhdGUoKVxyXG4gICAgbWF0NC5pZGVudGl0eSh0aGlzLm1hdHJpeClcclxuICAgIHZlYzMuc2V0KHRoaXMuZXVsZXJEZWdyZWVzLCAwLCAwLCAwKVxyXG4gIH1cclxuXHJcbiAgYWRkQ2hpbGQodHJhbnMpIHtcclxuICAgIGNvbnN0IGNoaWxkR2xvYmFsTWF0cml4ID0gdHJhbnMuZ2xvYmFsTWF0cml4XHJcbiAgICBcclxuICAgIHRoaXMuY2hpbGRyZW4ucHVzaCh0cmFucylcclxuICAgIHRyYW5zLnBhcmVudCA9IHRoaXNcclxuICAgIHRyYW5zLmdsb2JhbE1hdHJpeCA9IGNoaWxkR2xvYmFsTWF0cml4XHJcbiAgfVxyXG5cclxuICByZW1vdmVDaGlsZCh0cmFucykge1xyXG4gICAgY29uc3QgaSA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0cmFucylcclxuICAgIGlmIChpID49IDApIHtcclxuICAgICAgdGhpcy5jaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4uc2xpY2UoaSwgMSlcclxuICAgICAgY29uc3QgY2hpbGRHbG9iYWxNYXRyaXggPSB0cmFucy5nbG9iYWxNYXRyaXhcclxuICAgICAgdHJhbnMucGFyZW50ID0gbnVsbFxyXG4gICAgICB0cmFucy5nbG9iYWxNYXRyaXggPSBjaGlsZEdsb2JhbE1hdHJpeFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGNoaWxkQ291bnQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4ubGVuZ3RoXHJcbiAgfVxyXG5cclxuICBiZWVuUXVldWVEZXN0cm95ICgpIHtcclxuICAgIGZvciAobGV0IGMgb2YgdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICBjLmVudGl0eS5xdWV1ZURlc3Ryb3koKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdHJhbnNsYXRlKHYpIHtcclxuICAgIG1hdDQudHJhbnNsYXRlKHRoaXMubWF0cml4LCB0aGlzLm1hdHJpeCwgdilcclxuICAgIHRoaXMuI2RpcnR5Lm1hdHJpeCA9IHRydWVcclxuICB9XHJcblxyXG4gIHJvdGF0ZSAocmFkLCBheGlzKSB7XHJcbiAgICBtYXQ0LnJvdGF0ZSh0aGlzLm1hdHJpeCwgdGhpcy5tYXRyaXgsIHJhZCwgYXhpcylcclxuICAgIHRoaXMuI2RpcnR5LmV1bGVyRGVncmVlcyA9IHRydWVcclxuICAgIHRoaXMuI2RpcnR5Lm1hdHJpeCA9IHRydWVcclxuICB9XHJcbiAgcm90YXRlWCAocmFkKSB7XHJcbiAgICBtYXQ0LnJvdGF0ZVgodGhpcy5tYXRyaXgsIHRoaXMubWF0cml4LCByYWQpXHJcbiAgICB0aGlzLiNkaXJ0eS5ldWxlckRlZ3JlZXMgPSB0cnVlXHJcbiAgICB0aGlzLiNkaXJ0eS5tYXRyaXggPSB0cnVlXHJcbiAgfVxyXG4gIHJvdGF0ZVkgKHJhZCkge1xyXG4gICAgbWF0NC5yb3RhdGVZKHRoaXMubWF0cml4LCB0aGlzLm1hdHJpeCwgcmFkKVxyXG4gICAgdGhpcy4jZGlydHkuZXVsZXJEZWdyZWVzID0gdHJ1ZVxyXG4gICAgdGhpcy4jZGlydHkubWF0cml4ID0gdHJ1ZVxyXG4gIH1cclxuICByb3RhdGVaIChyYWQpIHtcclxuICAgIG1hdDQucm90YXRlWih0aGlzLm1hdHJpeCwgdGhpcy5tYXRyaXgsIHJhZClcclxuICAgIHRoaXMuI2RpcnR5LmV1bGVyRGVncmVlcyA9IHRydWVcclxuICAgIHRoaXMuI2RpcnR5Lm1hdHJpeCA9IHRydWVcclxuICB9XHJcblxyXG4gIHNjYWxlICh2KSB7XHJcbiAgICBtYXQ0LnNjYWxlKHRoaXMubWF0cml4LCB0aGlzLm1hdHJpeCwgdilcclxuICAgIHRoaXMuI2RpcnR5Lm1hdHJpeCA9IHRydWVcclxuICB9XHJcblxyXG4gIGFzaWduTWF0cml4IChtKSB7XHJcbiAgICBjb25zdCBzYW1lUm90YXRpb24gPSBxdWF0LmVxdWFscyhcclxuICAgICAgbWF0NC5nZXRSb3RhdGlvbihxdWF0LmNyZWF0ZSgpLCB0aGlzLm1hdHJpeCksXHJcbiAgICAgIG1hdDQuZ2V0Um90YXRpb24ocXVhdC5jcmVhdGUoKSwgbSlcclxuICAgICAgKVxyXG4gICAgbWF0NC5jb3B5KHRoaXMubWF0cml4LCBtKVxyXG4gICAgdGhpcy4jZGlydHkuZXVsZXJEZWdyZWVzID0gIXNhbWVSb3RhdGlvblxyXG4gICAgdGhpcy4jZGlydHkubWF0cml4ID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGdsb2JhbE1hdHJpeCAoKSB7XHJcbiAgICBsZXQgZGlydHkgPSB0aGlzLiNkaXJ0eS5tYXRyaXhcclxuICAgIGlmICghZGlydHkpIHtcclxuICAgICAgbGV0IHAgPSB0aGlzLnBhcmVudFxyXG4gICAgICB3aGlsZSAocCE9PW51bGwpIHtcclxuICAgICAgICBpZiAocC4jZGlydHkubWF0cml4KSB7XHJcbiAgICAgICAgICBkaXJ0eSA9IHRydWVcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHAgPSBwLnBhcmVudFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZGlydHkpIHtcclxuICAgICAgaWYgKHRoaXMucGFyZW50ID09PSBudWxsKSByZXR1cm4gbWF0NC5jbG9uZSh0aGlzLm1hdHJpeClcclxuICAgICAgY29uc3QgcCA9IHRoaXMucGFyZW50Lmdsb2JhbE1hdHJpeFxyXG4gICAgICBtYXQ0Lm11bCh0aGlzLiNjaGFjaGUuZ2xvYmFsTWF0cml4LCBwLCB0aGlzLm1hdHJpeClcclxuICAgICAgdGhpcy4jZGlydHkubWF0cml4ID0gZmFsc2VcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLiNjaGFjaGUuZ2xvYmFsTWF0cml4XHJcbiAgfVxyXG4gIHNldCBnbG9iYWxNYXRyaXggKG0pIHtcclxuICAgIGlmICh0aGlzLnBhcmVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aGlzLmFzaWduTWF0cml4KG0pXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3QgcCA9IHRoaXMucGFyZW50Lmdsb2JhbE1hdHJpeFxyXG4gICAgbWF0NC5pbnZlcnQocCwgcClcclxuICAgIG1hdDQubXVsKG0sIHAsIG0pXHJcbiAgICB0aGlzLmFzaWduTWF0cml4KG0pXHJcbiAgfVxyXG5cclxuICBfZ2V0QmFzaXMgKG0pIHtcclxuICAgIGNvbnN0IHggPSB2ZWMzLmNyZWF0ZSgpXHJcbiAgICBjb25zdCB5ID0gdmVjMy5jcmVhdGUoKVxyXG4gICAgY29uc3QgeiA9IHZlYzMuY3JlYXRlKClcclxuICAgIHZlYzMuc2V0KHgsIG1bMF0sIG1bMV0sIG1bMl0pXHJcbiAgICB2ZWMzLnNldCh5LCBtWzRdLCBtWzVdLCBtWzZdKVxyXG4gICAgdmVjMy5zZXQoeiwgbVs4XSwgbVs5XSwgbVsxMF0pXHJcblxyXG4gICAgcmV0dXJuIHt4LCB5LCB6fVxyXG4gIH1cclxuICBfc2V0QmFzaXMgKG91dCwgYikge1xyXG4gICAgY29uc3QgbSA9IG91dFxyXG5cclxuICAgIG1bMF0gPSBiLnhbMF1cclxuICAgIG1bMV0gPSBiLnhbMV1cclxuICAgIG1bMl0gPSBiLnhbMl1cclxuICAgIG1bNF0gPSBiLnlbMF1cclxuICAgIG1bNV0gPSBiLnlbMV1cclxuICAgIG1bNl0gPSBiLnlbMl1cclxuICAgIG1bOF0gPSBiLnpbMF1cclxuICAgIG1bOV0gPSBiLnpbMV1cclxuICAgIG1bMTBdID0gYi56WzJdXHJcbiAgfVxyXG5cclxuICBnZXQgYmFzaXMgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2dldEJhc2lzKHRoaXMubWF0cml4KVxyXG4gIH1cclxuICBzZXQgYmFzaXMgKGIpIHtcclxuICAgIHRoaXMuX3NldEJhc2lzKHRoaXMubWF0cml4KVxyXG4gICAgdGhpcy4jZGlydHkuZXVsZXJEZWdyZWVzID0gdHJ1ZVxyXG4gICAgdGhpcy4jZGlydHkubWF0cml4ID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGdsb2JhbEJhc2lzICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9nZXRCYXNpcyh0aGlzLmdsb2JhbE1hdHJpeClcclxuICB9XHJcbiAgc2V0IGdsb2JhbEJhc2lzIChiKSB7XHJcbiAgICBjb25zdCBtID0gdGhpcy5nbG9iYWxNYXRyaXhcclxuICAgIHRoaXMuX3NldEJhc2lzKG0sIGIpXHJcbiAgICB0aGlzLmdsb2JhbE1hdHJpeCA9IG1cclxuICB9XHJcblxyXG4gIF9nZXRPcmlnaW4gKG0pIHtcclxuICAgIGNvbnN0IHAgPSB2ZWMzLmNyZWF0ZSgpXHJcbiAgICB2ZWMzLnNldChwLCBtWzEyXSwgbVsxM10sIG1bMTRdKVxyXG4gICAgcmV0dXJuIHBcclxuICB9XHJcbiAgX3NldE9yaWdpbiAobSwgcCkge1xyXG4gICAgbVsxMl0gPSBwWzBdXHJcbiAgICBtWzEzXSA9IHBbMV1cclxuICAgIG1bMTRdID0gcFsyXVxyXG4gIH1cclxuXHJcbiAgZ2V0IG9yaWdpbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2V0T3JpZ2luKHRoaXMubWF0cml4KVxyXG4gIH1cclxuICBzZXQgb3JpZ2luIChwKSB7XHJcbiAgICB0aGlzLl9zZXRPcmlnaW4odGhpcy5tYXRyaXgsIHApXHJcbiAgICB0aGlzLiNkaXJ0eS5tYXRyaXggPSB0cnVlXHJcbiAgfVxyXG5cclxuICBnZXQgZ2xvYmFsT3JpZ2luICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9nZXRPcmlnaW4odGhpcy5nbG9iYWxNYXRyaXgpXHJcbiAgfVxyXG4gIHNldCBnbG9iYWxPcmlnaW4gKHApIHtcclxuICAgIGNvbnN0IG0gPSB0aGlzLmdsb2JhbE1hdHJpeFxyXG4gICAgdGhpcy5fc2V0T3JpZ2luKG0sIHApXHJcbiAgICB0aGlzLmdsb2JhbE1hdHJpeCA9IG1cclxuICB9XHJcblxyXG4gIF9nZXRSb3RhdGlvbiAobWF0KSB7XHJcbiAgICByZXR1cm4gbWF0NC5nZXRSb3RhdGlvbihxdWF0LmNyZWF0ZSgpLCBtYXQpXHJcbiAgfVxyXG4gIF9zZXRSb3RhdGlvbiAob3V0LCBxKSB7XHJcbiAgICBjb25zdCBtYXQgPSBvdXRcclxuICAgIGNvbnN0IHNjYWxlID0gdmVjMy5jcmVhdGUoKVxyXG4gICAgbWF0NC5nZXRTY2FsaW5nKHNjYWxlLCBtYXQpXHJcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLm9yaWdpblxyXG4gICAgbWF0NC5pZGVudGl0eShtYXQpXHJcbiAgICBtYXQ0Lm11bChtYXQsIG1hdCwgbWF0NC5mcm9tUXVhdChtYXQ0LmNyZWF0ZSgpLCBxKSlcclxuICAgIG1hdDQuc2NhbGUobWF0LCBtYXQsIHNjYWxlKVxyXG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW5cclxuICB9XHJcblxyXG4gIGdldCByb3RhdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2V0Um90YXRpb24odGhpcy5tYXRyaXgpXHJcbiAgfVxyXG4gIHNldCByb3RhdGlvbiAocSkge1xyXG4gICAgdGhpcy5fc2V0Um90YXRpb24odGhpcy5tYXRyaXgsIHEpXHJcbiAgICB0aGlzLiNkaXJ0eS5ldWxlckRlZ3JlZXMgPSB0cnVlXHJcbiAgICB0aGlzLiNkaXJ0eS5tYXRyaXggPSB0cnVlXHJcbiAgfVxyXG5cclxuICBnZXQgZ2xvYmFsUm90YXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2dldFJvdGF0aW9uKHRoaXMuZ2xvYmFsTWF0cml4KVxyXG4gIH1cclxuICBzZXQgZ2xvYmFsUm90YXRpb24gKHEpIHtcclxuICAgIGNvbnN0IG0gPSB0aGlzLmdsb2JhbE1hdHJpeFxyXG4gICAgdGhpcy5fc2V0Um90YXRpb24obSwgcSlcclxuICAgIHRoaXMuZ2xvYmFsTWF0cml4ID0gbVxyXG4gIH1cclxuXHJcbiAgX2dldFNjYWxpbmcgKG0pIHtcclxuICAgIHJldHVybiBtYXQ0LmdldFNjYWxpbmcodmVjMy5jcmVhdGUoKSwgbSlcclxuICB9XHJcbiAgX3NldFNjYWxpbmcgKG0sIHMpIHtcclxuICAgIGNvbnN0IG9sZFMgPSBtYXQ0LmdldFNjYWxpbmcodmVjMy5jcmVhdGUoKSwgbSlcclxuICAgIHZlYzMuZGl2KHMsIHMsIG9sZFMpXHJcbiAgICBtYXQ0LnNjYWxlKG0sIG0sIHMpXHJcbiAgfVxyXG5cclxuICBnZXQgc2NhbGluZyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2V0U2NhbGluZyh0aGlzLm1hdHJpeClcclxuICB9XHJcbiAgc2V0IHNjYWxpbmcgKHMpIHtcclxuICAgIHRoaXMuX3NldFNjYWxpbmcodGhpcy5tYXRyaXgsIHMpXHJcbiAgICB0aGlzLiNkaXJ0eS5tYXRyaXggPSB0cnVlXHJcbiAgfVxyXG5cclxuICBnZXQgZ2xvYmFsU2NhbGluZyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ2V0U2NhbGluZyh0aGlzLm1hdHJpeClcclxuICB9XHJcbiAgc2V0IGdsb2JhbFNjYWxpbmcgKHMpIHtcclxuICAgIGNvbnN0IG0gPSB0aGlzLmdsb2JhbE1hdHJpeFxyXG4gICAgdGhpcy5fc2V0U2NhbGluZyhtLCBzKVxyXG4gICAgdGhpcy5nbG9iYWxNYXRyaXggPSBtXHJcbiAgfVxyXG5cclxuICBzeW5jRXVsZXJEZWdyZWVzVG9Sb3RhdGlvbiAoKSB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy5ldWxlckRlZ3JlZXNbMF1cclxuICAgIGNvbnN0IHkgPSB0aGlzLmV1bGVyRGVncmVlc1sxXVxyXG4gICAgY29uc3QgeiA9IHRoaXMuZXVsZXJEZWdyZWVzWzJdXHJcblxyXG4gICAgY29uc3QgbWF0ID0gdGhpcy5tYXRyaXhcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IHZlYzMuY3JlYXRlKClcclxuICAgIG1hdDQuZ2V0U2NhbGluZyhzY2FsZSwgbWF0KVxyXG4gICAgY29uc3Qgb3JpZ2luID0gdGhpcy5vcmlnaW5cclxuICAgIGNvbnN0IHJvdGF0aW9uID0gcXVhdC5mcm9tRXVsZXIocXVhdC5jcmVhdGUoKSwgeCwgeSwgeilcclxuXHJcbiAgICBtYXQ0LmlkZW50aXR5KG1hdClcclxuICAgIG1hdDQubXVsKG1hdCwgbWF0LCBtYXQ0LmZyb21RdWF0KG1hdDQuY3JlYXRlKCksIHJvdGF0aW9uKSlcclxuICAgIG1hdDQuc2NhbGUobWF0LCBtYXQsIHNjYWxlKVxyXG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW5cclxuICB9XHJcblxyXG4gIHN5bmNSb3RhdGlvblRvRXVsZXJEZWdyZWVzICgpIHtcclxuICAgIGNvbnN0IG1hdCA9IHRoaXMubWF0cml4XHJcbiAgICBjb25zdCBxID0gbWF0NC5nZXRSb3RhdGlvbihxdWF0LmNyZWF0ZSgpLCBtYXQpXHJcbiAgICBjb25zdCBzcXIgPSB4ID0+IHggKiB4XHJcbiAgICBjb25zdCByZXMgPSB0aGlzLmV1bGVyRGVncmVlc1xyXG4gICAgY29uc3QgZGVncmVlID0gMTgwLjAgLyBNYXRoLlBJXHJcbiAgICBcclxuICAgIGNvbnN0IHMgPSAyKihxWzNdKnFbMV0tcVsyXSpxWzBdKVxyXG4gICAgaWYgKHMgPCAxLjApIHtcclxuICAgICAgaWYgKHMgPiAtMS4wKSB7XHJcbiAgICAgICAgcmVzWzBdID0gTWF0aC5hdGFuMigyKihxWzNdKnFbMF0rcVsxXSpxWzJdKSwgMSAtIDIqKHNxcihxWzBdKSArIHNxcihxWzFdKSkpXHJcbiAgICAgICAgcmVzWzFdID0gTWF0aC5hc2luKHMpXHJcbiAgICAgICAgcmVzWzJdID0gTWF0aC5hdGFuMigyKihxWzNdKnFbMl0rcVswXSpxWzFdKSwgMSAtIDIqKHNxcihxWzFdKSArIHNxcihxWzJdKSkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzWzBdID0gTWF0aC5hdGFuMigyKihxWzNdKnFbMF0rcVsxXSpxWzJdKSwgMSAtIDIqKHNxcihxWzBdKSArIHNxcihxWzFdKSkpXHJcbiAgICAgICAgcmVzWzFdID0gLU1hdGguUEkgLyAyLjBcclxuICAgICAgICByZXNbMl0gPSAwLjBcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzWzBdID0gTWF0aC5hdGFuMigyKihxWzNdKnFbMF0rcVsxXSpxWzJdKSwgMSAtIDIqKHNxcihxWzBdKSArIHNxcihxWzFdKSkpXHJcbiAgICAgIHJlc1sxXSA9IE1hdGguUEkgLyAyLjBcclxuICAgICAgcmVzWzJdID0gMC4wXHJcbiAgICB9XHJcblxyXG4gICAgdmVjMy5zY2FsZShyZXMsIHJlcywgZGVncmVlKVxyXG4gIH1cclxuXHJcbiAgZ2V0IGV1bGVyUm90YXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHZlYzMuc2NhbGUodmVjMy5jcmVhdGUoKSwgdGhpcy5ldWxlclJvdGF0aW9uRGVncmVlLCBNYXRoLlBJIC8gMTgwLjApXHJcbiAgfVxyXG5cclxuICBzZXQgZXVsZXJSb3RhdGlvbiAodikge1xyXG4gICAgY29uc3QgZGVncmVlID0gMTgwLjAgLyBNYXRoLlBJXHJcbiAgICB2WzBdICo9IGRlZ3JlZVxyXG4gICAgdlsxXSAqPSBkZWdyZWVcclxuICAgIHZbMl0gKj0gZGVncmVlXHJcbiAgICB0aGlzLmV1bGVyUm90YXRpb25EZWdyZWUgPSB2XHJcbiAgfSBcclxuXHJcbiAgZ2V0IGV1bGVyUm90YXRpb25EZWdyZWUgKCkge1xyXG4gICAgaWYgKHRoaXMuI2RpcnR5LmV1bGVyRGVncmVlcykge1xyXG4gICAgICB0aGlzLnN5bmNSb3RhdGlvblRvRXVsZXJEZWdyZWVzKClcclxuICAgICAgdGhpcy4jZGlydHkuZXVsZXJEZWdyZWVzID0gZmFsc2VcclxuICAgIH1cclxuICAgIHJldHVybiB2ZWMzLmNvcHkodmVjMy5jcmVhdGUoKSwgdGhpcy5ldWxlckRlZ3JlZXMpXHJcbiAgfVxyXG5cclxuICBzZXQgZXVsZXJSb3RhdGlvbkRlZ3JlZSAodikge1xyXG4gICAgY29uc3QgY2xhbXBEZWdyZWUgPSAoeCkgPT4ge1xyXG4gICAgICBjb25zdCBheCA9IE1hdGguYWJzKHgpXHJcbiAgICAgIHJldHVybiBNYXRoLnNpZ24oeCkgKiAoYXggLSBNYXRoLmZsb29yKGF4IC8gMzYwLjApICogMzYwLjApXHJcbiAgICB9XHJcbiAgICB2ZWMzLnNldCh0aGlzLmV1bGVyRGVncmVlcywgLi4udilcclxuICAgIHRoaXMuZXVsZXJEZWdyZWVzWzBdID0gY2xhbXBEZWdyZWUodGhpcy5ldWxlckRlZ3JlZXNbMF0pXHJcbiAgICB0aGlzLmV1bGVyRGVncmVlc1sxXSA9IGNsYW1wRGVncmVlKHRoaXMuZXVsZXJEZWdyZWVzWzFdKVxyXG4gICAgdGhpcy5ldWxlckRlZ3JlZXNbMl0gPSBjbGFtcERlZ3JlZSh0aGlzLmV1bGVyRGVncmVlc1syXSlcclxuICAgIHRoaXMuc3luY0V1bGVyRGVncmVlc1RvUm90YXRpb24oKVxyXG4gICAgdGhpcy4jZGlydHkubWF0cml4ID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgeGZvcm0gKHApIHtcclxuICAgIGNvbnN0IHJlcyA9IHZlYzMuY3JlYXRlKClcclxuICAgIHZlYzMudHJhbnNmb3JtTWF0NChyZXMsIHAsIHRoaXMubWF0cml4KVxyXG4gICAgcmV0dXJuIHJlc1xyXG4gIH1cclxuXHJcbiAgeGZvcm1JbnZlcnNlIChwKSB7XHJcbiAgICBjb25zdCBtYXQgPSB0aGlzLm1hdHJpeFxyXG4gICAgcmV0dXJuIHZlYzMudHJhbnNmb3JtTWF0NCh2ZWMzLmNyZWF0ZSgpLCBwLCBtYXQ0LmludmVydChtYXQ0LmNyZWF0ZSgpLCBtYXQpKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhbnNmb3JtIiwiY2xhc3MgSW5wdXRNYW5hZ2VyIHtcclxuXHJcbiAgaW5wdXRBY3Rpb25NYXAgPSB7fVxyXG4gIGlucHV0U3RhdGVNYXAgPSB7fVxyXG4gIFxyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgfVxyXG5cclxuICBhZGRJbnB1dEFjdGlvbihhY3Rpb24sIHR5cGUsIGNvZGUpIHtcclxuICAgIGlmICghdGhpcy5pbnB1dEFjdGlvbk1hcFthY3Rpb25dKVxyXG4gICAgICB0aGlzLmlucHV0QWN0aW9uTWFwW2FjdGlvbl0gPSBbXVxyXG4gICAgdGhpcy5pbnB1dEFjdGlvbk1hcFthY3Rpb25dLnB1c2goe1xyXG4gICAgICB0eXBlLCBjb2RlXHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghdGhpcy5pbnB1dFN0YXRlTWFwW2FjdGlvbl0pIHtcclxuICAgICAgdGhpcy5pbnB1dFN0YXRlTWFwW2FjdGlvbl0gPSB7XHJcbiAgICAgICAgcHJlc3NlZDogZmFsc2UsXHJcbiAgICAgICAgbGFzdFByZXNzZWQ6IGZhbHNlLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhZnRlclVwZGF0ZSAoZGVsdGEpIHtcclxuICAgIGZvciAobGV0IGFjdGlvbiBpbiB0aGlzLmlucHV0U3RhdGVNYXApIHtcclxuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmlucHV0U3RhdGVNYXBbYWN0aW9uXVxyXG4gICAgICBzdGF0ZS5sYXN0UHJlc3NlZCA9IHN0YXRlLnByZXNzZWRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlucHV0IChldmVudCkge1xyXG4gICAgZm9yIChsZXQgYWN0aW9uIGluIHRoaXMuaW5wdXRBY3Rpb25NYXApIHtcclxuICAgICAgY29uc3Qgb3MgPSB0aGlzLmlucHV0QWN0aW9uTWFwW2FjdGlvbl1cclxuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmlucHV0U3RhdGVNYXBbYWN0aW9uXVxyXG4gICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlXHJcbiAgICAgIGxldCBwcmVzc2VkID0gZmFsc2VcclxuICAgICAgZm9yIChsZXQgbyBvZiBvcykge1xyXG4gICAgICAgIGlmIChldmVudCBpbnN0YW5jZW9mIG8udHlwZSkge1xyXG4gICAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09IG8uY29kZSkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKSB7XHJcbiAgICAgICAgICAgICAgcHJlc3NlZCA9IHRydWVcclxuICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIHtcclxuICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICAgIHN0YXRlLnByZXNzZWQgPSBwcmVzc2VkXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpc0FjdGlvblByZXNzZWQgKGFjdGlvbikge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmlucHV0U3RhdGVNYXBbYWN0aW9uXVxyXG4gICAgcmV0dXJuIHN0YXRlICYmIHN0YXRlLnByZXNzZWRcclxuICB9XHJcblxyXG4gIGlzQWN0aW9uUmVsZWFzZWQgKGFjdGlvbikge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmlucHV0U3RhdGVNYXBbYWN0aW9uXVxyXG4gICAgcmV0dXJuICFzdGF0ZSB8fCAhc3RhdGUucHJlc3NlZFxyXG4gIH1cclxuXHJcbiAgaXNBY3Rpb25KdXN0UHJlc3NlZCAoYWN0aW9uKSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuaW5wdXRTdGF0ZU1hcFthY3Rpb25dXHJcbiAgICByZXR1cm4gc3RhdGUgJiYgc3RhdGUucHJlc3NlZCAmJiBzdGF0ZS5wcmVzc2VkICE9PSBzdGF0ZS5sYXN0UHJlc3NlZFxyXG4gIH1cclxuXHJcbiAgaXNBY3Rpb25KdXN0UmVsZWFzZWQgKGFjdGlvbikge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmlucHV0U3RhdGVNYXBbYWN0aW9uXVxyXG4gICAgcmV0dXJuIHN0YXRlICYmICFzdGF0ZS5wcmVzc2VkICYmIHN0YXRlLnByZXNzZWQgIT09IHN0YXRlLmxhc3RQcmVzc2VkXHJcbiAgfVxyXG5cclxuICBnZXRBY3Rpb25TdHJlbmd0aCAoYWN0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0FjdGlvblByZXNzZWQoYWN0aW9uKSA/IDEgOiAwXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbnB1dE1hbmFnZXIiLCJcclxuY2xhc3MgUmVuZGVyU2VydmVyIHtcclxuXHJcbiAgZ2wgPSBudWxsXHJcbiAgZWxlbWVudCA9IG51bGxcclxuXHJcbiAgY29uc3RydWN0b3IgKGVsZW1lbnRJZCkge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElkKVxyXG5cclxuICAgIGlmICghdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FudmFzIG5vdCBmb3VuZDogJHtlbGVtZW50SWR9YClcclxuICAgIH1cclxuICAgIGlmICghdGhpcy5lbGVtZW50IGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFbGVtZW50ICR7ZWxlbWVudElkfSBpcyBub3QgYSBDYW52YXMhYClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZldGNoX2dsKClcclxuICB9XHJcblxyXG4gIGZldGNoX2dsKCkge1xyXG4gICAgY29uc3QgbmFtZXMgPSBbXHJcbiAgICAgICd3ZWJnbDInLFxyXG4gICAgXVxyXG4gICAgdmFyIGdsID0gbnVsbFxyXG4gICAgZm9yICh2YXIgaT0wOyBpPG5hbWVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGdsID0gdGhpcy5lbGVtZW50LmdldENvbnRleHQobmFtZXNbaV0pXHJcbiAgICAgIGlmIChnbCkgYnJlYWtcclxuICAgIH1cclxuICAgIGlmIChnbCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFlvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0ICR7bmFtZXN9IWApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gdGhyb3dPbkdMRXJyb3IoZXJyLCBmdW5jTmFtZSwgYXJncykge1xyXG4gICAgLy8gICB0aHJvdyAgYCR7V2ViR0xEZWJ1Z1V0aWxzLmdsRW51bVRvU3RyaW5nKGVycil9IHdhcyBjYXVzZWQgYnkgY2FsbCB0bzogJHtmdW5jTmFtZX0oJHthcmdzfSlgO1xyXG4gICAgLy8gfVxyXG4gICAgLy8gZ2wgPSBXZWJHTERlYnVnVXRpbHMubWFrZURlYnVnQ29udGV4dChnbCwgdGhyb3dPbkdMRXJyb3IpXHJcbiAgICB0aGlzLmdsID0gZ2xcclxuICAgIFxyXG4gICAgdGhpcy5zZXR1cENhbnZhc1NpemVBbmRWaWV3cG9ydCgpXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnNldHVwQ2FudmFzU2l6ZUFuZFZpZXdwb3J0KClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBzZXR1cENhbnZhc1NpemVBbmRWaWV3cG9ydCAoKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuZ2xcclxuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuZWxlbWVudFxyXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodFxyXG4gICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoLCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0KVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlIChkZWx0YSkge1xyXG4gICAgY29uc3QgZ2wgPSB0aGlzLmdsXHJcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMClcclxuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERUFQVEhfQlVGRkVSX0JJVClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IFJlbmRlclNlcnZlciB9IiwiaW1wb3J0IFRleHV0cmUgZnJvbSAnLi4vcmVzb3VyY2VzL3RleHR1cmUuanMnXHJcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzLmpzJ1xyXG5cclxuY2xhc3MgUmVzb3VyY2VMb2FkZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuXHJcbiAgfVxyXG5cclxuICBnZXRSZWNvZ25pemVkRXh0ZW5zaW9uICgpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBsb2FkICh1cmwpIHtcclxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxyXG4gIH1cclxuXHJcblxyXG59XHJcblxyXG5jbGFzcyBUZXh0UmVzb3VyY2VMb2FkZXIgZXh0ZW5kcyBSZXNvdXJjZUxvYWRlciB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG4gIH1cclxuXHJcbiAgZ2V0UmVjb2duaXplZEV4dGVuc2lvbiAoKSB7XHJcbiAgICByZXR1cm4gWydmcycsJ3ZzJywgJ3RleHQnLCAnanMnXVxyXG4gIH1cclxuXHJcbiAgbG9hZCAodXJsKSB7XHJcbiAgICByZXR1cm4gZmV0Y2godXJsKS50aGVuKHJlcz0+cmVzLnRleHQoKSlcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFRleHR1cmVSZXNvdWNlTG9hZGVyIGV4dGVuZHMgUmVzb3VyY2VMb2FkZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICB9XHJcblxyXG4gIGdldFJlY29nbml6ZWRFeHRlbnNpb24gKCkge1xyXG4gICAgcmV0dXJuIFsncG5nJywgJ2pwZycsICdibXAnXVxyXG4gIH1cclxuXHJcbiAgbG9hZCAodXJsKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICBpbWFnZS5zcmMgPSB1cmxcclxuICAgICAgaW1hZ2Uub25sb2FkID0gKGUpID0+IHtcclxuICAgICAgICBjb25zdCByZXMgPSB0aGlzLmFwcC5jcmVhdGVSZXNvdXJjZShUZXh1dHJlLCBpbWFnZSlcclxuICAgICAgICByZXNvbHZlKHJlcylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFJlc291cmNlU2VydmVyIHtcclxuXHJcbiAgYXBwID0gbnVsbFxyXG4gIHJlc291cmNlTG9hZGVyTGlzdCA9IFtdXHJcblxyXG4gIGxvYWRlZFJlc291cmNlTWFwID0ge30gLy8geyB1cmw6IHJlc291cmNlIH1cclxuXHJcbiAgY29uc3RydWN0b3IgKGFwcCwgcmVzb3VyY2VMb2FkZXJzKSB7XHJcbiAgICBpZiAoIXJlc291cmNlTG9hZGVycykgcmV0dXJuXHJcbiAgICB0aGlzLmFwcCA9IGFwcFxyXG4gICAgZm9yIChsZXQgdCBvZiByZXNvdXJjZUxvYWRlcnMpIHtcclxuICAgICAgdGhpcy5yZWdpc3RlclJlc291cmNlTG9hZGVyKHQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZWdpc3RlclJlc291cmNlTG9hZGVyIChyZXNvdXJjZUxvYWRlcikge1xyXG4gICAgY29uc3QgbG9hZGVyID0gbmV3IHJlc291cmNlTG9hZGVyKClcclxuICAgIGxvYWRlci5hcHAgPSB0aGlzLmFwcFxyXG4gICAgdGhpcy5yZXNvdXJjZUxvYWRlckxpc3QucHVzaChsb2FkZXIpXHJcbiAgfVxyXG5cclxuICBsb2FkICh1cmwsIGxvYWRlclR5cGUpIHtcclxuICAgIGlmICh0aGlzLmxvYWRlZFJlc291cmNlTWFwW3VybF0pIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmxvYWRlZFJlc291cmNlTWFwW3VybF0pXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCByZXMgPSBudWxsXHJcbiAgICBmb3IgKGxldCBsb2FkZXIgb2YgdGhpcy5yZXNvdXJjZUxvYWRlckxpc3QpIHtcclxuICAgICAgaWYgKGxvYWRlclR5cGUgJiYgbG9hZGVyIGluc3RhbmNlb2YgbG9hZGVyVHlwZSlcclxuICAgICAge1xyXG4gICAgICAgIHJlcyA9IGxvYWRlci5sb2FkKHVybClcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXh0ID0gdXRpbHMuZ2V0RmlsZUV4dGVuc2lvbih1cmwpXHJcbiAgICBpZiAocmVzID09PSBudWxsKSB7XHJcbiAgICAgIGZvciAobGV0IGxvYWRlciBvZiB0aGlzLnJlc291cmNlTG9hZGVyTGlzdCkge1xyXG4gICAgICAgIGlmIChsb2FkZXIuZ2V0UmVjb2duaXplZEV4dGVuc2lvbigpLmluY2x1ZGVzKGV4dCkpIHtcclxuICAgICAgICAgIHJlcyA9IGxvYWRlci5sb2FkKHVybClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAocmVzID09PSBudWxsKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGxvYWQgcmVzb3VyY2U6IFwiJHt1cmx9XCJgKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcy50aGVuKChyKT0+e1xyXG4gICAgICB0aGlzLmxvYWRlZFJlc291cmNlTWFwW3VybF0gPSByXHJcbiAgICAgIHJldHVybiByXHJcbiAgICB9KVxyXG4gIH1cclxuICBcclxufVxyXG5cclxuZXhwb3J0IHsgUmVzb3VyY2VTZXJ2ZXIsIFJlc291cmNlTG9hZGVyLCBUZXh0UmVzb3VyY2VMb2FkZXIsIFRleHR1cmVSZXNvdWNlTG9hZGVyIH0iLCJcclxuY2xhc3MgTGlzdGVuZXJEYXRhIHtcclxuXHJcbiAgZnVuYyA9IG51bGxcclxuICBiaW5kcyA9IFtdXHJcblxyXG4gIGNvbnN0cnVjdG9yIChmdW5jLCBiaW5kcykge1xyXG4gICAgdGhpcy5mdW5jID0gZnVuY1xyXG4gICAgdGhpcy5iaW5kcyA9IGJpbmRzXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBTaWduYWxTbG90IHtcclxuXHJcbiAgbGlzdGVuZXJzID0ge31cclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG5cclxuICB9XHJcblxyXG4gIGNvbm5lY3QgKGZ1bmMsIC4uLmJpbmRzKSB7XHJcbiAgICBpZiAodGhpcy5saXN0ZW5lcnNbZnVuY10pIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaWduYWwgYWxyZWFkeSBjb25uZWN0ZWQhJylcclxuICAgIH1cclxuICAgIHRoaXMubGlzdGVuZXJzW2Z1bmNdID0gbmV3IExpc3RlbmVyRGF0YShmdW5jLCBiaW5kcylcclxuICB9XHJcblxyXG4gIGRpc2Nvbm5lY3QgKGZ1bmMpIHtcclxuICAgIGlmICh0aGlzLmxpc3RlbmVyc1tmdW5jXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2lnbmFsIG5vdCBjb25uZWN0ZWQhJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGVtaXQgKC4uLmFyZ3MpIHtcclxuICAgIGZvciAobGV0IGsgaW4gdGhpcy5saXN0ZW5lcnMpIHtcclxuICAgICAgY29uc3QgZCA9IHRoaXMubGlzdGVuZXJzW2tdXHJcbiAgICAgIGQuZnVuYyguLi5hcmdzLCAuLi5kLmJpbmRzKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgU2lnbmFsU2xvdCB9IiwiaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDQsIG1hdDMsIHZlYzMgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHJhbmRvbVJhbmdlIChtaW4sIG1heCkge1xyXG4gICAgaWYgKG1heCA9PT0gbWluKSByZXR1cm4gbWluXHJcbiAgICBpZiAobWF4IDwgbWluKSB7XHJcbiAgICAgIGNvbnN0IHQgPSBtYXhcclxuICAgICAgbWF4ID0gbWluXHJcbiAgICAgIG1pbiA9IHRcclxuICAgIH1cclxuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogKG1heC1taW4pICsgbWluXHJcbiAgfSxcclxuXHJcbiAgaHRtbEVuY29kZSAoaHRtbCl7XHJcbiAgICB2YXIgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgKFwiZGl2XCIpO1xyXG4gICAgKHRlbXAudGV4dENvbnRlbnQgIT0gdW5kZWZpbmVkICkgPyAodGVtcC50ZXh0Q29udGVudCA9IGh0bWwpIDogKHRlbXAuaW5uZXJUZXh0ID0gaHRtbCk7XHJcbiAgICB2YXIgb3V0cHV0ID0gdGVtcC5pbm5lckhUTUw7XHJcbiAgICB0ZW1wID0gbnVsbDtcclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgfSxcclxuXHJcbiAgZXF1YWxzIChhLCBiKSB7XHJcbiAgICByZXR1cm4gKGEtYikgPD0gMC4wMDAwMDFcclxuICB9LFxyXG5cclxuICBlcXVhbHMwIChhKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lcXVhbHMoYSwgMClcclxuICB9LFxyXG5cclxuICBtaXggKHgsIHksIHcpIHtcclxuICAgIHJldHVybiB4KigxLXcpICsgeSp3XHJcbiAgfSxcclxuXHJcbiAgbWl4Rmxvb3IgKHgsIHksIHcpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMubWl4KHgsIHksIHcpKVxyXG4gIH0sXHJcblxyXG4gIHdlaWdodGVkUmFuZG9tICh2LCB3KSB7XHJcbiAgICByZXR1cm4gdiAqIHRoaXMubWl4KDEsIE1hdGgucmFuZG9tKCksIHcpXHJcbiAgfSxcclxuXHJcbiAgZGVnMnJhZCAoeCkge1xyXG4gICAgcmV0dXJuIHggLyAxODAgKiBNYXRoLlBJXHJcbiAgfSxcclxuXHJcbiAgcmFkMmRlZyAoeCkge1xyXG4gICAgcmV0dXJuIHggLyBNYXRoLlBJICogMTgwXHJcbiAgfSxcclxuXHJcbiAgbWF0NFNldFNjYWxpbmcob3V0LCBhLCBzKSB7XHJcbiAgICBjb25zdCB4MCA9IGFbMF1cclxuICAgIGNvbnN0IHgxID0gYVsxXVxyXG4gICAgY29uc3QgeDIgPSBhWzJdXHJcblxyXG4gICAgY29uc3QgeTAgPSBhWzRdXHJcbiAgICBjb25zdCB5MSA9IGFbNV1cclxuICAgIGNvbnN0IHkyID0gYVs2XVxyXG5cclxuICAgIGNvbnN0IHowID0gYVs4XVxyXG4gICAgY29uc3QgejEgPSBhWzldXHJcbiAgICBjb25zdCB6MiA9IGFbMTBdXHJcblxyXG4gICAgY29uc3QgeExlbmd0aCA9IE1hdGguc3FydCh4MCp4MCArIHgxKngxICsgeDIqeDIpXHJcbiAgICBjb25zdCB5TGVuZ3RoID0gTWF0aC5zcXJ0KHkwKnkwICsgeTEqeTEgKyB5Mip5MilcclxuICAgIGNvbnN0IHpMZW5ndGggPSBNYXRoLnNxcnQoejAqejAgKyB6MSp6MSArIHoyKnoyKVxyXG5cclxuICAgIGlmICh4TGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgIG91dFswXSA9IHgwL3hMZW5ndGggKiBzWzBdXHJcbiAgICAgIG91dFsxXSA9IHgxL3hMZW5ndGggKiBzWzBdXHJcbiAgICAgIG91dFsyXSA9IHgyL3hMZW5ndGggKiBzWzBdXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvdXRbMF0gPSAwXHJcbiAgICAgIG91dFsxXSA9IDBcclxuICAgICAgb3V0WzJdID0gMFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoeUxlbmd0aCAhPT0gMCkge1xyXG4gICAgICBvdXRbNF0gPSB5MC95TGVuZ3RoICogc1sxXVxyXG4gICAgICBvdXRbNV0gPSB5MS95TGVuZ3RoICogc1sxXVxyXG4gICAgICBvdXRbNl0gPSB5Mi95TGVuZ3RoICogc1sxXVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb3V0WzRdID0gMFxyXG4gICAgICBvdXRbNV0gPSAwXHJcbiAgICAgIG91dFs2XSA9IDBcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHpMZW5ndGggIT09IDApIHtcclxuICAgICAgb3V0WzhdID0gejAvekxlbmd0aCAqIHNbMl1cclxuICAgICAgb3V0WzldID0gejEvekxlbmd0aCAqIHNbMl1cclxuICAgICAgb3V0WzEwXSA9IHoyL3pMZW5ndGggKiBzWzJdXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvdXRbOF0gPSAwXHJcbiAgICAgIG91dFs5XSA9IDBcclxuICAgICAgb3V0WzEwXSA9IDBcclxuICAgIH1cclxuICAgIFxyXG4gIH0sXHJcblxyXG4gIGNvbWJpbmVQYXRoIChhLCBiKSB7XHJcbiAgICByZXR1cm4gYSArICcvJyArIGJcclxuICB9LFxyXG5cclxuICBnZXRGaWxlRXh0ZW5zaW9uIChwYXRoKSB7XHJcbiAgICBjb25zdCBzcyA9IHBhdGguc3BsaXQoJy4nKVxyXG4gICAgcmV0dXJuIHNzW3NzLmxlbmd0aC0xXVxyXG4gIH0sXHJcblxyXG4gIGdldEZpbGVCYXNlTmFtZSAocGF0aCkge1xyXG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZSgnXFxcXCAnLCAnICcpXHJcbiAgICBwYXRoID0gcGF0aC5yZXBsYWNlKCdcXFxcJywgJy8nKVxyXG4gICAgbGV0IHNzID0gcGF0aC5zcGxpdCgnLycpXHJcbiAgICBzcyA9IHNzW3NzLmxlbmd0aC0xXVxyXG4gICAgc3MgPSBzcy5zcGxpdCgnLicpXHJcbiAgICByZXR1cm4gc3NbMF1cclxuICB9XHJcbn0iLCJjbGFzcyBFbnRpdHkge1xyXG4gIGNvbXBvbmVudENvbGxlY3Rpb24gPSB7fVxyXG4gIGlkID0gLTFcclxuICBhY3RpdmF0ZWQgPSB0cnVlXHJcbiAgaGFzQmVlblF1ZXVlZERlc3Ryb3kgPSBmYWxzZVxyXG4gIFxyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuXHJcbiAgfVxyXG5cclxuICBnZXRTY2VuZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zY2VuZVxyXG4gIH1cclxuXHJcbiAgZ2V0IGFwcCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFNjZW5lKCkuYXBwXHJcbiAgfVxyXG5cclxuICBnZXRDb21wb25lbnQobmFtZSkge1xyXG4gICAgaWYgKHR5cGVvZihuYW1lKSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBuYW1lID0gbmFtZS5uYW1lXHJcbiAgICB9XHJcbiAgICBjb25zdCByZXMgPSB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25bbmFtZV1cclxuICAgIGlmICghcmVzKSB0aHJvdyBuZXcgRXJyb3IoYENhblxcJ3QgZmluZCBjb21wb25lbnQ6ICR7bmFtZX1gKVxyXG4gICAgcmV0dXJuIHJlc1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29tcG9uZW50UmF3IChuYW1lKSB7XHJcbiAgICBpZiAodHlwZW9mKG5hbWUpID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIG5hbWUgPSBuYW1lLm5hbWVcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25bbmFtZV1cclxuICB9XHJcblxyXG4gIGFkZENvbXBvbmVudChuYW1lLCBjb21wb25lbnQpIHtcclxuICAgIGlmIChjb21wb25lbnQgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YobmFtZSkgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIGNvbXBvbmVudCA9IG5hbWVcclxuICAgICAgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lXHJcbiAgICB9XHJcbiAgICBpZiAoIW5hbWUgfHwgbmFtZSA9PT0gJycpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCBjb21wb25lbnQgbmFtZTogJyR7bmFtZX0nYClcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5jb21wb25lbnRDb2xsZWN0aW9uW25hbWVdKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihgY29tcG9uZW50IG9mICR7bmFtZX0gYWxyZWFkeSBleGlzdHMhIG92ZXJyaWRpbmcuLi5gKVxyXG4gICAgfVxyXG4gICAgY29tcG9uZW50LmVudGl0eSA9IHRoaXNcclxuICAgIGNvbXBvbmVudC5hY3RpdmF0ZWQgPSB0cnVlXHJcbiAgICB0aGlzLmNvbXBvbmVudENvbGxlY3Rpb25bbmFtZV0gPSBjb21wb25lbnRcclxuICAgIGlmIChjb21wb25lbnQuYWRkZWQpIGNvbXBvbmVudC5hZGRlZCgpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlQ29tcG9uZW50KG5hbWUpIHtcclxuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuZ2V0Q29tcG9uZW50KG5hbWUpXHJcbiAgICBpZiAoIWNvbXBvbmVudCkgcmV0dXJuXHJcbiAgICBpZiAoY29tcG9uZW50LnJlbW92ZWQpIGNvbXBvbmVudC5yZW1vdmVkKClcclxuICAgIHRoaXMuY29tcG9uZW50Q29sbGVjdGlvbltuYW1lXSA9IHVuZGVmaW5lZFxyXG4gIH1cclxuXHJcbiAgaW5wdXQgKGV2ZW50KSB7XHJcbiAgICB0aGlzLmNhbGxDb21wb25lbnRDb2xsZWN0aW9uRnVuY3Rpb24oJ2lucHV0JywgZXZlbnQpXHJcbiAgfVxyXG5cclxuICBwcmVVcGRhdGUgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmNhbGxDb21wb25lbnRDb2xsZWN0aW9uRnVuY3Rpb24oJ3ByZVVwZGF0ZScsIGRlbHRhKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGRlbHRhKSB7XHJcbiAgICB0aGlzLmNhbGxDb21wb25lbnRDb2xsZWN0aW9uRnVuY3Rpb24oJ3VwZGF0ZScsIGRlbHRhKVxyXG4gIH1cclxuXHJcbiAgYWZ0ZXJVcGRhdGUgKGRlbHRhKSB7XHJcbiAgICB0aGlzLmNhbGxDb21wb25lbnRDb2xsZWN0aW9uRnVuY3Rpb24oJ2FmdGVyVXBkYXRlJywgZGVsdGEpXHJcbiAgfVxyXG5cclxuICBjYWxsQ29tcG9uZW50Q29sbGVjdGlvbkZ1bmN0aW9uKGZ1bmNOYW1lLCAuLi5hcmdzKSB7XHJcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuY29tcG9uZW50Q29sbGVjdGlvbikge1xyXG4gICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmdldENvbXBvbmVudChuYW1lKVxyXG4gICAgICBpZiAoIWNvbXBvbmVudC5hY3RpdmF0ZWQpIGNvbnRpbnVlXHJcbiAgICAgIGlmIChjb21wb25lbnRbZnVuY05hbWVdKSBjb21wb25lbnRbZnVuY05hbWVdKC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkZXN0cm95ZWQoKSB7XHJcbiAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuY29tcG9uZW50Q29sbGVjdGlvbikge1xyXG4gICAgICB0aGlzLnJlbW92ZUNvbXBvbmVudChuYW1lKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcXVldWVEZXN0cm95KCkge1xyXG4gICAgdGhpcy5nZXRTY2VuZSgpLmRlc3Ryb3llZEVudGl0eVF1ZXVlLnB1c2godGhpcylcclxuICAgIHRoaXMuaGFzQmVlblF1ZXVlZERlc3Ryb3kgPSB0cnVlXHJcbiAgICB0aGlzLmNhbGxDb21wb25lbnRDb2xsZWN0aW9uRnVuY3Rpb24oJ2JlZW5RdWV1ZURlc3Ryb3knKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRW50aXR5IiwiXHJcblxyXG5cclxuY29uc3QgQ29sb3IgPSB7XHJcbiAgX2RpZ2l0X21hcDoge1xyXG4gICAgJzAnOiAwLFxyXG4gICAgJzEnOiAxLFxyXG4gICAgJzInOiAyLFxyXG4gICAgJzMnOiAzLFxyXG4gICAgJzQnOiA0LFxyXG4gICAgJzUnOiA1LFxyXG4gICAgJzYnOiA2LFxyXG4gICAgJzcnOiA3LFxyXG4gICAgJzgnOiA4LFxyXG4gICAgJzknOiA5LFxyXG4gICAgJ2EnOiAxMCxcclxuICAgICdiJzogMTEsXHJcbiAgICAnYyc6IDEyLFxyXG4gICAgJ2QnOiAxMyxcclxuICAgICdlJzogMTQsXHJcbiAgICAnZic6IDE1LFxyXG4gIH0sXHJcbiAgX3N0cl9tYXA6IHtcclxuICAgIDA6ICcwJyxcclxuICAgIDE6ICcxJyxcclxuICAgIDI6ICcyJyxcclxuICAgIDM6ICczJyxcclxuICAgIDQ6ICc0JyxcclxuICAgIDU6ICc1JyxcclxuICAgIDY6ICc2JyxcclxuICAgIDc6ICc3JyxcclxuICAgIDg6ICc4JyxcclxuICAgIDk6ICc5JyxcclxuICAgIDEwOiAnYScsXHJcbiAgICAxMTogJ2InLFxyXG4gICAgMTI6ICdjJyxcclxuICAgIDEzOiAnZCcsXHJcbiAgICAxNDogJ2UnLFxyXG4gICAgMTU6ICdmJyxcclxuICB9LFxyXG5cclxuICBibGFjazogJzAwMDAwMGZmJyxcclxuICB3aGl0ZTogJ2ZmZmZmZmZmJyxcclxuICByZWQ6ICdmZjAwMDBmZicsXHJcbiAgZ3JlZW46ICcwMGZmMDBmZicsXHJcbiAgYmx1ZTogJzAwMDBmZmZmJyxcclxuXHJcbiAgdG9SR0I6IGZ1bmN0aW9uIChoZXhDb2xvcikge1xyXG4gICAgaGV4Q29sb3IgPSBoZXhDb2xvci50b0xvd2VyQ2FzZSgpXHJcbiAgICBpZiAoaGV4Q29sb3IubGVuZ3RoICE9PSA2KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52bGFpZCBoZXggY29sb3I6ICR7aGV4Q29sb3J9KCR7aGV4Q29sb3IubGVuZ3RofSlgKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCByID0gdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzBdXSAqIDE2ICsgdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzFdXVxyXG4gICAgbGV0IGcgPSB0aGlzLl9kaWdpdF9tYXBbaGV4Q29sb3JbMl1dICogMTYgKyB0aGlzLl9kaWdpdF9tYXBbaGV4Q29sb3JbM11dXHJcbiAgICBsZXQgYiA9IHRoaXMuX2RpZ2l0X21hcFtoZXhDb2xvcls0XV0gKiAxNiArIHRoaXMuX2RpZ2l0X21hcFtoZXhDb2xvcls1XV1cclxuXHJcbiAgICByZXR1cm4gW3IvMjU1LCBnLzI1NSwgYi8yNTVdXHJcbiAgfSxcclxuXHJcbiAgdG9SR0JBOiBmdW5jdGlvbiAoaGV4Q29sb3IpIHtcclxuICAgIGhleENvbG9yID0gaGV4Q29sb3IudG9Mb3dlckNhc2UoKVxyXG4gICAgaWYgKGhleENvbG9yLmxlbmd0aCAhPT0gNiAmJiBoZXhDb2xvci5sZW5ndGggIT09IDgpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZsYWlkIGhleCBjb2xvcjogJHtoZXhDb2xvcn0oJHtoZXhDb2xvci5sZW5ndGh9KWApXHJcbiAgICB9XHJcbiAgICBpZiAoaGV4Q29sb3IubGVuZ3RoID09PSA2KSBoZXhDb2xvciA9IGhleENvbG9yICsgJ2ZmJ1xyXG5cclxuICAgIGxldCByID0gdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzBdXSAqIDE2ICsgdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzFdXVxyXG4gICAgbGV0IGcgPSB0aGlzLl9kaWdpdF9tYXBbaGV4Q29sb3JbMl1dICogMTYgKyB0aGlzLl9kaWdpdF9tYXBbaGV4Q29sb3JbM11dXHJcbiAgICBsZXQgYiA9IHRoaXMuX2RpZ2l0X21hcFtoZXhDb2xvcls0XV0gKiAxNiArIHRoaXMuX2RpZ2l0X21hcFtoZXhDb2xvcls1XV1cclxuICAgIGxldCBhID0gdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzZdXSAqIDE2ICsgdGhpcy5fZGlnaXRfbWFwW2hleENvbG9yWzddXVxyXG5cclxuICAgIHJldHVybiBbci8yNTUsIGcvMjU1LCBiLzI1NSwgYS8yNTVdXHJcbiAgfSxcclxuXHJcbiAgdG9IZXg6IGZ1bmN0aW9uIChjb2xvcikge1xyXG4gICAgaWYgKGNvbG9yLmxlbmd0aCA8IDMpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb2xvcjogJHtjb2xvcn0hYClcclxuICAgIGxldCByID0gY29sb3JbMF0gKiAyNTVcclxuICAgIGxldCBnID0gY29sb3JbMV0gKiAyNTVcclxuICAgIGxldCBiID0gY29sb3JbMl0gKiAyNTVcclxuICAgIGxldCBhID0gMjU1XHJcbiAgICBpZiAoY29sb3IubGVuZ3RoID4gMykgYSA9IGNvbG9yWzNdICogMjU1XHJcbiAgICByZXR1cm4gKHRoaXMuX3N0cl9tYXBbci8xNl0rdGhpcy5fc3RyX21hcFtyJTE2XSkgK1xyXG4gICAgICAgICAgICAodGhpcy5fc3RyX21hcFtnLzE2XSt0aGlzLl9zdHJfbWFwW2clMTZdKSArXHJcbiAgICAgICAgICAgICh0aGlzLl9zdHJfbWFwW2IvMTZdK3RoaXMuX3N0cl9tYXBbYiUxNl0pICtcclxuICAgICAgICAgICAgKHRoaXMuX3N0cl9tYXBbYS8xNl0rdGhpcy5fc3RyX21hcFthJTE2XSlcclxuICB9LFxyXG5cclxuICByZ2JhU3RyaW5nVG9Db2xvcjogZnVuY3Rpb24gKHMpIHtcclxuICAgIHMgPSBzLnNwbGl0KCcoJylbMV1cclxuICAgIHMgPSBzLnNwbGl0KCcsJylcclxuICAgIGxldCByID0gcGFyc2VJbnQoc1swXSlcclxuICAgIGxldCBnID0gcGFyc2VJbnQoc1sxXSlcclxuICAgIGxldCBiID0gcGFyc2VJbnQoc1syXSlcclxuICAgIGxldCBhID0gcGFyc2VGbG9hdChzWzNdKVxyXG4gICAgcmV0dXJuIFtyLzI1NSwgZy8yNTUsIGIvMjU1LCBhXVxyXG4gIH0sXHJcbn1cclxuXHJcblxyXG5cclxuXHJcbmV4cG9ydCB7IENvbG9yIH0iLCIvKipcbiAqIENvbW1vbiB1dGlsaXRpZXNcbiAqIEBtb2R1bGUgZ2xNYXRyaXhcbiAqL1xuLy8gQ29uZmlndXJhdGlvbiBDb25zdGFudHNcbmV4cG9ydCB2YXIgRVBTSUxPTiA9IDAuMDAwMDAxO1xuZXhwb3J0IHZhciBBUlJBWV9UWVBFID0gdHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcbmV4cG9ydCB2YXIgUkFORE9NID0gTWF0aC5yYW5kb207XG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xuICpcbiAqIEBwYXJhbSB7RmxvYXQzMkFycmF5Q29uc3RydWN0b3IgfCBBcnJheUNvbnN0cnVjdG9yfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1hdHJpeEFycmF5VHlwZSh0eXBlKSB7XG4gIEFSUkFZX1RZUEUgPSB0eXBlO1xufVxudmFyIGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG4vKipcbiAqIENvbnZlcnQgRGVncmVlIFRvIFJhZGlhblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIEFuZ2xlIGluIERlZ3JlZXNcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xuICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cbi8qKlxuICogVGVzdHMgd2hldGhlciBvciBub3QgdGhlIGFyZ3VtZW50cyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgdmFsdWUsIHdpdGhpbiBhbiBhYnNvbHV0ZVxuICogb3IgcmVsYXRpdmUgdG9sZXJhbmNlIG9mIGdsTWF0cml4LkVQU0lMT04gKGFuIGFic29sdXRlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciB2YWx1ZXMgbGVzc1xuICogdGhhbiBvciBlcXVhbCB0byAxLjAsIGFuZCBhIHJlbGF0aXZlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciBsYXJnZXIgdmFsdWVzKVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIFRoZSBmaXJzdCBudW1iZXIgdG8gdGVzdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgbnVtYmVyIHRvIHRlc3QuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbnVtYmVycyBhcmUgYXBwcm94aW1hdGVseSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSk7XG59XG5pZiAoIU1hdGguaHlwb3QpIE1hdGguaHlwb3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB5ID0gMCxcbiAgICAgIGkgPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gIHdoaWxlIChpLS0pIHtcbiAgICB5ICs9IGFyZ3VtZW50c1tpXSAqIGFyZ3VtZW50c1tpXTtcbiAgfVxuXG4gIHJldHVybiBNYXRoLnNxcnQoeSk7XG59OyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuaW1wb3J0ICogYXMgbWF0MiBmcm9tIFwiLi9tYXQyLmpzXCI7XG5pbXBvcnQgKiBhcyBtYXQyZCBmcm9tIFwiLi9tYXQyZC5qc1wiO1xuaW1wb3J0ICogYXMgbWF0MyBmcm9tIFwiLi9tYXQzLmpzXCI7XG5pbXBvcnQgKiBhcyBtYXQ0IGZyb20gXCIuL21hdDQuanNcIjtcbmltcG9ydCAqIGFzIHF1YXQgZnJvbSBcIi4vcXVhdC5qc1wiO1xuaW1wb3J0ICogYXMgcXVhdDIgZnJvbSBcIi4vcXVhdDIuanNcIjtcbmltcG9ydCAqIGFzIHZlYzIgZnJvbSBcIi4vdmVjMi5qc1wiO1xuaW1wb3J0ICogYXMgdmVjMyBmcm9tIFwiLi92ZWMzLmpzXCI7XG5pbXBvcnQgKiBhcyB2ZWM0IGZyb20gXCIuL3ZlYzQuanNcIjtcbmV4cG9ydCB7IGdsTWF0cml4LCBtYXQyLCBtYXQyZCwgbWF0MywgbWF0NCwgcXVhdCwgcXVhdDIsIHZlYzIsIHZlYzMsIHZlYzQgfTsiLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcbi8qKlxuICogMngyIE1hdHJpeFxuICogQG1vZHVsZSBtYXQyXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDJcbiAqXG4gKiBAcmV0dXJucyB7bWF0Mn0gYSBuZXcgMngyIG1hdHJpeFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gIH1cblxuICBvdXRbMF0gPSAxO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQyfSBhIG5ldyAyeDIgbWF0cml4XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCBhIG1hdDIgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0MiB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0IEEgbmV3IDJ4MiBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTEwLCBtMTEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTEwO1xuICBvdXRbM10gPSBtMTE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMTAsIG0xMSkge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTEwO1xuICBvdXRbM10gPSBtMTE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGVcbiAgLy8gc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIHZhciBhMSA9IGFbMV07XG4gICAgb3V0WzFdID0gYVsyXTtcbiAgICBvdXRbMl0gPSBhMTtcbiAgfSBlbHNlIHtcbiAgICBvdXRbMF0gPSBhWzBdO1xuICAgIG91dFsxXSA9IGFbMl07XG4gICAgb3V0WzJdID0gYVsxXTtcbiAgICBvdXRbM10gPSBhWzNdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdOyAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG5cbiAgdmFyIGRldCA9IGEwICogYTMgLSBhMiAqIGExO1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkZXQgPSAxLjAgLyBkZXQ7XG4gIG91dFswXSA9IGEzICogZGV0O1xuICBvdXRbMV0gPSAtYTEgKiBkZXQ7XG4gIG91dFsyXSA9IC1hMiAqIGRldDtcbiAgb3V0WzNdID0gYTAgKiBkZXQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xuICAvLyBDYWNoaW5nIHRoaXMgdmFsdWUgaXMgbmVzc2VjYXJ5IGlmIG91dCA9PSBhXG4gIHZhciBhMCA9IGFbMF07XG4gIG91dFswXSA9IGFbM107XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gYTA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgcmV0dXJuIGFbMF0gKiBhWzNdIC0gYVsyXSAqIGFbMV07XG59XG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDInc1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdO1xuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdLFxuICAgICAgYjMgPSBiWzNdO1xuICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcbiAgb3V0WzFdID0gYTEgKiBiMCArIGEzICogYjE7XG4gIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xuICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIG1hdDIgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGEwICogYyArIGEyICogcztcbiAgb3V0WzFdID0gYTEgKiBjICsgYTMgKiBzO1xuICBvdXRbMl0gPSBhMCAqIC1zICsgYTIgKiBjO1xuICBvdXRbM10gPSBhMSAqIC1zICsgYTMgKiBjO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDIgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzJcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgdikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdO1xuICB2YXIgdjAgPSB2WzBdLFxuICAgICAgdjEgPSB2WzFdO1xuICBvdXRbMF0gPSBhMCAqIHYwO1xuICBvdXRbMV0gPSBhMSAqIHYwO1xuICBvdXRbMl0gPSBhMiAqIHYxO1xuICBvdXRbM10gPSBhMyAqIHYxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0Mi5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCBtYXQyIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGM7XG4gIG91dFsxXSA9IHM7XG4gIG91dFsyXSA9IC1zO1xuICBvdXRbM10gPSBjO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDIuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0Mi5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IG1hdDIgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xuICBvdXRbMF0gPSB2WzBdO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSB2WzFdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiBcIm1hdDIoXCIgKyBhWzBdICsgXCIsIFwiICsgYVsxXSArIFwiLCBcIiArIGFbMl0gKyBcIiwgXCIgKyBhWzNdICsgXCIpXCI7XG59XG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQyXG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xuICByZXR1cm4gTWF0aC5oeXBvdChhWzBdLCBhWzFdLCBhWzJdLCBhWzNdKTtcbn1cbi8qKlxuICogUmV0dXJucyBMLCBEIGFuZCBVIG1hdHJpY2VzIChMb3dlciB0cmlhbmd1bGFyLCBEaWFnb25hbCBhbmQgVXBwZXIgdHJpYW5ndWxhcikgYnkgZmFjdG9yaXppbmcgdGhlIGlucHV0IG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IEwgdGhlIGxvd2VyIHRyaWFuZ3VsYXIgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gRCB0aGUgZGlhZ29uYWwgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gVSB0aGUgdXBwZXIgdHJpYW5ndWxhciBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIHRoZSBpbnB1dCBtYXRyaXggdG8gZmFjdG9yaXplXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIExEVShMLCBELCBVLCBhKSB7XG4gIExbMl0gPSBhWzJdIC8gYVswXTtcbiAgVVswXSA9IGFbMF07XG4gIFVbMV0gPSBhWzFdO1xuICBVWzNdID0gYVszXSAtIExbMl0gKiBVWzFdO1xuICByZXR1cm4gW0wsIEQsIFVdO1xufVxuLyoqXG4gKiBBZGRzIHR3byBtYXQyJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0Mn0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKTtcbn1cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQyfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBBZGRzIHR3byBtYXQyJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHttYXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlO1xuICBvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIG11bCA9IG11bHRpcGx5O1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDIuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHN1YiA9IHN1YnRyYWN0OyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuLyoqXG4gKiAyeDMgTWF0cml4XG4gKiBAbW9kdWxlIG1hdDJkXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgbWF0MmQgY29udGFpbnMgc2l4IGVsZW1lbnRzIGRlZmluZWQgYXM6XG4gKiA8cHJlPlxuICogW2EsIGIsXG4gKiAgYywgZCxcbiAqICB0eCwgdHldXG4gKiA8L3ByZT5cbiAqIFRoaXMgaXMgYSBzaG9ydCBmb3JtIGZvciB0aGUgM3gzIG1hdHJpeDpcbiAqIDxwcmU+XG4gKiBbYSwgYiwgMCxcbiAqICBjLCBkLCAwLFxuICogIHR4LCB0eSwgMV1cbiAqIDwvcHJlPlxuICogVGhlIGxhc3QgY29sdW1uIGlzIGlnbm9yZWQgc28gdGhlIGFycmF5IGlzIHNob3J0ZXIgYW5kIG9wZXJhdGlvbnMgYXJlIGZhc3Rlci5cbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0MmRcbiAqXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNik7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMDtcbiAgfVxuXG4gIG91dFswXSA9IDE7XG4gIG91dFszXSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MmQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0MmR9IGEgbmV3IDJ4MyBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNik7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQyZCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCBhIG1hdDJkIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0MmQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQ29tcG9uZW50IEEgKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gYiBDb21wb25lbnQgQiAoaW5kZXggMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjIENvbXBvbmVudCBDIChpbmRleCAyKVxuICogQHBhcmFtIHtOdW1iZXJ9IGQgQ29tcG9uZW50IEQgKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gdHggQ29tcG9uZW50IFRYIChpbmRleCA0KVxuICogQHBhcmFtIHtOdW1iZXJ9IHR5IENvbXBvbmVudCBUWSAoaW5kZXggNSlcbiAqIEByZXR1cm5zIHttYXQyZH0gQSBuZXcgbWF0MmRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhhLCBiLCBjLCBkLCB0eCwgdHkpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDYpO1xuICBvdXRbMF0gPSBhO1xuICBvdXRbMV0gPSBiO1xuICBvdXRbMl0gPSBjO1xuICBvdXRbM10gPSBkO1xuICBvdXRbNF0gPSB0eDtcbiAgb3V0WzVdID0gdHk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDJkIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7TnVtYmVyfSBhIENvbXBvbmVudCBBIChpbmRleCAwKVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgQ29tcG9uZW50IEIgKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gYyBDb21wb25lbnQgQyAoaW5kZXggMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBkIENvbXBvbmVudCBEIChpbmRleCAzKVxuICogQHBhcmFtIHtOdW1iZXJ9IHR4IENvbXBvbmVudCBUWCAoaW5kZXggNClcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eSBDb21wb25lbnQgVFkgKGluZGV4IDUpXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBhLCBiLCBjLCBkLCB0eCwgdHkpIHtcbiAgb3V0WzBdID0gYTtcbiAgb3V0WzFdID0gYjtcbiAgb3V0WzJdID0gYztcbiAgb3V0WzNdID0gZDtcbiAgb3V0WzRdID0gdHg7XG4gIG91dFs1XSA9IHR5O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICB2YXIgYWEgPSBhWzBdLFxuICAgICAgYWIgPSBhWzFdLFxuICAgICAgYWMgPSBhWzJdLFxuICAgICAgYWQgPSBhWzNdO1xuICB2YXIgYXR4ID0gYVs0XSxcbiAgICAgIGF0eSA9IGFbNV07XG4gIHZhciBkZXQgPSBhYSAqIGFkIC0gYWIgKiBhYztcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZGV0ID0gMS4wIC8gZGV0O1xuICBvdXRbMF0gPSBhZCAqIGRldDtcbiAgb3V0WzFdID0gLWFiICogZGV0O1xuICBvdXRbMl0gPSAtYWMgKiBkZXQ7XG4gIG91dFszXSA9IGFhICogZGV0O1xuICBvdXRbNF0gPSAoYWMgKiBhdHkgLSBhZCAqIGF0eCkgKiBkZXQ7XG4gIG91dFs1XSA9IChhYiAqIGF0eCAtIGFhICogYXR5KSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIHJldHVybiBhWzBdICogYVszXSAtIGFbMV0gKiBhWzJdO1xufVxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQyZCdzXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdLFxuICAgICAgYTQgPSBhWzRdLFxuICAgICAgYTUgPSBhWzVdO1xuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdLFxuICAgICAgYjMgPSBiWzNdLFxuICAgICAgYjQgPSBiWzRdLFxuICAgICAgYjUgPSBiWzVdO1xuICBvdXRbMF0gPSBhMCAqIGIwICsgYTIgKiBiMTtcbiAgb3V0WzFdID0gYTEgKiBiMCArIGEzICogYjE7XG4gIG91dFsyXSA9IGEwICogYjIgKyBhMiAqIGIzO1xuICBvdXRbM10gPSBhMSAqIGIyICsgYTMgKiBiMztcbiAgb3V0WzRdID0gYTAgKiBiNCArIGEyICogYjUgKyBhNDtcbiAgb3V0WzVdID0gYTEgKiBiNCArIGEzICogYjUgKyBhNTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIG1hdDJkIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl0sXG4gICAgICBhMyA9IGFbM10sXG4gICAgICBhNCA9IGFbNF0sXG4gICAgICBhNSA9IGFbNV07XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpO1xuICBvdXRbMF0gPSBhMCAqIGMgKyBhMiAqIHM7XG4gIG91dFsxXSA9IGExICogYyArIGEzICogcztcbiAgb3V0WzJdID0gYTAgKiAtcyArIGEyICogYztcbiAgb3V0WzNdID0gYTEgKiAtcyArIGEzICogYztcbiAgb3V0WzRdID0gYTQ7XG4gIG91dFs1XSA9IGE1O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDJkIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXSxcbiAgICAgIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XTtcbiAgdmFyIHYwID0gdlswXSxcbiAgICAgIHYxID0gdlsxXTtcbiAgb3V0WzBdID0gYTAgKiB2MDtcbiAgb3V0WzFdID0gYTEgKiB2MDtcbiAgb3V0WzJdID0gYTIgKiB2MTtcbiAgb3V0WzNdID0gYTMgKiB2MTtcbiAgb3V0WzRdID0gYTQ7XG4gIG91dFs1XSA9IGE1O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2xhdGVzIHRoZSBtYXQyZCBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gdiB0aGUgdmVjMiB0byB0cmFuc2xhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXSxcbiAgICAgIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XTtcbiAgdmFyIHYwID0gdlswXSxcbiAgICAgIHYxID0gdlsxXTtcbiAgb3V0WzBdID0gYTA7XG4gIG91dFsxXSA9IGExO1xuICBvdXRbMl0gPSBhMjtcbiAgb3V0WzNdID0gYTM7XG4gIG91dFs0XSA9IGEwICogdjAgKyBhMiAqIHYxICsgYTQ7XG4gIG91dFs1XSA9IGExICogdjAgKyBhMyAqIHYxICsgYTU7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0MmQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0MmQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCk7XG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IG1hdDJkIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgIGMgPSBNYXRoLmNvcyhyYWQpO1xuICBvdXRbMF0gPSBjO1xuICBvdXRbMV0gPSBzO1xuICBvdXRbMl0gPSAtcztcbiAgb3V0WzNdID0gYztcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQyZC5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCBtYXQyZCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xuICBvdXRbMF0gPSB2WzBdO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSB2WzFdO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQyZC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQyZC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgbWF0MmQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICBvdXRbNF0gPSB2WzBdO1xuICBvdXRbNV0gPSB2WzFdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuIFwibWF0MmQoXCIgKyBhWzBdICsgXCIsIFwiICsgYVsxXSArIFwiLCBcIiArIGFbMl0gKyBcIiwgXCIgKyBhWzNdICsgXCIsIFwiICsgYVs0XSArIFwiLCBcIiArIGFbNV0gKyBcIilcIjtcbn1cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcbiAgcmV0dXJuIE1hdGguaHlwb3QoYVswXSwgYVsxXSwgYVsyXSwgYVszXSwgYVs0XSwgYVs1XSwgMSk7XG59XG4vKipcbiAqIEFkZHMgdHdvIG1hdDJkJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0MmR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0MmR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQyZH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0MmR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDJkfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICBvdXRbNF0gPSBhWzRdICogYjtcbiAgb3V0WzVdID0gYVs1XSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEFkZHMgdHdvIG1hdDJkJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDJkfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYidzIGVsZW1lbnRzIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHttYXQyZH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgb3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQyZH0gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdLFxuICAgICAgYTQgPSBhWzRdLFxuICAgICAgYTUgPSBhWzVdO1xuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdLFxuICAgICAgYjMgPSBiWzNdLFxuICAgICAgYjQgPSBiWzRdLFxuICAgICAgYjUgPSBiWzVdO1xuICByZXR1cm4gTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJiBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiYgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJiBNYXRoLmFicyhhNSAtIGI1KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSk7XG59XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0MmQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIG11bCA9IG11bHRpcGx5O1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDJkLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDsiLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcbi8qKlxuICogM3gzIE1hdHJpeFxuICogQG1vZHVsZSBtYXQzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNV0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgfVxuXG4gIG91dFswXSA9IDE7XG4gIG91dFs0XSA9IDE7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvcGllcyB0aGUgdXBwZXItbGVmdCAzeDMgdmFsdWVzIGludG8gdGhlIGdpdmVuIG1hdDMuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyAzeDMgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVs0XTtcbiAgb3V0WzRdID0gYVs1XTtcbiAgb3V0WzVdID0gYVs2XTtcbiAgb3V0WzZdID0gYVs4XTtcbiAgb3V0WzddID0gYVs5XTtcbiAgb3V0WzhdID0gYVsxMF07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlIGEgbmV3IG1hdDMgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxuICogQHJldHVybnMge21hdDN9IEEgbmV3IG1hdDNcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTEwO1xuICBvdXRbNF0gPSBtMTE7XG4gIG91dFs1XSA9IG0xMjtcbiAgb3V0WzZdID0gbTIwO1xuICBvdXRbN10gPSBtMjE7XG4gIG91dFs4XSA9IG0yMjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0MyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMTA7XG4gIG91dFs0XSA9IG0xMTtcbiAgb3V0WzVdID0gbTEyO1xuICBvdXRbNl0gPSBtMjA7XG4gIG91dFs3XSA9IG0yMTtcbiAgb3V0WzhdID0gbTIyO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTZXQgYSBtYXQzIHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICBpZiAob3V0ID09PSBhKSB7XG4gICAgdmFyIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGExMiA9IGFbNV07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGEwMTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGEwMjtcbiAgICBvdXRbN10gPSBhMTI7XG4gIH0gZWxzZSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzNdO1xuICAgIG91dFsyXSA9IGFbNl07XG4gICAgb3V0WzNdID0gYVsxXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbN107XG4gICAgb3V0WzZdID0gYVsyXTtcbiAgICBvdXRbN10gPSBhWzVdO1xuICAgIG91dFs4XSA9IGFbOF07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl07XG4gIHZhciBhMTAgPSBhWzNdLFxuICAgICAgYTExID0gYVs0XSxcbiAgICAgIGExMiA9IGFbNV07XG4gIHZhciBhMjAgPSBhWzZdLFxuICAgICAgYTIxID0gYVs3XSxcbiAgICAgIGEyMiA9IGFbOF07XG4gIHZhciBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XG4gIHZhciBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwO1xuICB2YXIgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwOyAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG5cbiAgdmFyIGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZGV0ID0gMS4wIC8gZGV0O1xuICBvdXRbMF0gPSBiMDEgKiBkZXQ7XG4gIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gIG91dFszXSA9IGIxMSAqIGRldDtcbiAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgb3V0WzZdID0gYjIxICogZGV0O1xuICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXTtcbiAgdmFyIGExMCA9IGFbM10sXG4gICAgICBhMTEgPSBhWzRdLFxuICAgICAgYTEyID0gYVs1XTtcbiAgdmFyIGEyMCA9IGFbNl0sXG4gICAgICBhMjEgPSBhWzddLFxuICAgICAgYTIyID0gYVs4XTtcbiAgb3V0WzBdID0gYTExICogYTIyIC0gYTEyICogYTIxO1xuICBvdXRbMV0gPSBhMDIgKiBhMjEgLSBhMDEgKiBhMjI7XG4gIG91dFsyXSA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgb3V0WzNdID0gYTEyICogYTIwIC0gYTEwICogYTIyO1xuICBvdXRbNF0gPSBhMDAgKiBhMjIgLSBhMDIgKiBhMjA7XG4gIG91dFs1XSA9IGEwMiAqIGExMCAtIGEwMCAqIGExMjtcbiAgb3V0WzZdID0gYTEwICogYTIxIC0gYTExICogYTIwO1xuICBvdXRbN10gPSBhMDEgKiBhMjAgLSBhMDAgKiBhMjE7XG4gIG91dFs4XSA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdO1xuICB2YXIgYTEwID0gYVszXSxcbiAgICAgIGExMSA9IGFbNF0sXG4gICAgICBhMTIgPSBhWzVdO1xuICB2YXIgYTIwID0gYVs2XSxcbiAgICAgIGEyMSA9IGFbN10sXG4gICAgICBhMjIgPSBhWzhdO1xuICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn1cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl07XG4gIHZhciBhMTAgPSBhWzNdLFxuICAgICAgYTExID0gYVs0XSxcbiAgICAgIGExMiA9IGFbNV07XG4gIHZhciBhMjAgPSBhWzZdLFxuICAgICAgYTIxID0gYVs3XSxcbiAgICAgIGEyMiA9IGFbOF07XG4gIHZhciBiMDAgPSBiWzBdLFxuICAgICAgYjAxID0gYlsxXSxcbiAgICAgIGIwMiA9IGJbMl07XG4gIHZhciBiMTAgPSBiWzNdLFxuICAgICAgYjExID0gYls0XSxcbiAgICAgIGIxMiA9IGJbNV07XG4gIHZhciBiMjAgPSBiWzZdLFxuICAgICAgYjIxID0gYls3XSxcbiAgICAgIGIyMiA9IGJbOF07XG4gIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG4gIG91dFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgb3V0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICBvdXRbOF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDMgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMTAgPSBhWzNdLFxuICAgICAgYTExID0gYVs0XSxcbiAgICAgIGExMiA9IGFbNV0sXG4gICAgICBhMjAgPSBhWzZdLFxuICAgICAgYTIxID0gYVs3XSxcbiAgICAgIGEyMiA9IGFbOF0sXG4gICAgICB4ID0gdlswXSxcbiAgICAgIHkgPSB2WzFdO1xuICBvdXRbMF0gPSBhMDA7XG4gIG91dFsxXSA9IGEwMTtcbiAgb3V0WzJdID0gYTAyO1xuICBvdXRbM10gPSBhMTA7XG4gIG91dFs0XSA9IGExMTtcbiAgb3V0WzVdID0gYTEyO1xuICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0MyBieSB0aGUgZ2l2ZW4gYW5nbGVcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdLFxuICAgICAgYTEwID0gYVszXSxcbiAgICAgIGExMSA9IGFbNF0sXG4gICAgICBhMTIgPSBhWzVdLFxuICAgICAgYTIwID0gYVs2XSxcbiAgICAgIGEyMSA9IGFbN10sXG4gICAgICBhMjIgPSBhWzhdLFxuICAgICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICBjID0gTWF0aC5jb3MocmFkKTtcbiAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcbiAgb3V0WzNdID0gYyAqIGExMCAtIHMgKiBhMDA7XG4gIG91dFs0XSA9IGMgKiBhMTEgLSBzICogYTAxO1xuICBvdXRbNV0gPSBjICogYTEyIC0gcyAqIGEwMjtcbiAgb3V0WzZdID0gYTIwO1xuICBvdXRbN10gPSBhMjE7XG4gIG91dFs4XSA9IGEyMjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgdmFyIHggPSB2WzBdLFxuICAgICAgeSA9IHZbMV07XG4gIG91dFswXSA9IHggKiBhWzBdO1xuICBvdXRbMV0gPSB4ICogYVsxXTtcbiAgb3V0WzJdID0geCAqIGFbMl07XG4gIG91dFszXSA9IHkgKiBhWzNdO1xuICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgb3V0WzVdID0geSAqIGFbNV07XG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAxO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSB2WzBdO1xuICBvdXRbN10gPSB2WzFdO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgYyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGM7XG4gIG91dFsxXSA9IHM7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IC1zO1xuICBvdXRbNF0gPSBjO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My5zY2FsZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xuICBvdXRbMF0gPSB2WzBdO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB2WzFdO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBhIHRoZSBtYXRyaXggdG8gY29weVxuICogQHJldHVybnMge21hdDN9IG91dFxuICoqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSBhWzJdO1xuICBvdXRbNF0gPSBhWzNdO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSBhWzRdO1xuICBvdXRbN10gPSBhWzVdO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIGEgM3gzIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHl4ID0geSAqIHgyO1xuICB2YXIgeXkgPSB5ICogeTI7XG4gIHZhciB6eCA9IHogKiB4MjtcbiAgdmFyIHp5ID0geiAqIHkyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICBvdXRbM10gPSB5eCAtIHd6O1xuICBvdXRbNl0gPSB6eCArIHd5O1xuICBvdXRbMV0gPSB5eCArIHd6O1xuICBvdXRbNF0gPSAxIC0geHggLSB6ejtcbiAgb3V0WzddID0genkgLSB3eDtcbiAgb3V0WzJdID0genggLSB3eTtcbiAgb3V0WzVdID0genkgKyB3eDtcbiAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSBNYXQ0IHRvIGRlcml2ZSB0aGUgbm9ybWFsIG1hdHJpeCBmcm9tXG4gKlxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxGcm9tTWF0NChvdXQsIGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07XG4gIHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7IC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcblxuICB2YXIgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBkZXQgPSAxLjAgLyBkZXQ7XG4gIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gIG91dFs2XSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbN10gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzhdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdGlvbihvdXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAtMiAvIGhlaWdodDtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gLTE7XG4gIG91dFs3XSA9IDE7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuIFwibWF0MyhcIiArIGFbMF0gKyBcIiwgXCIgKyBhWzFdICsgXCIsIFwiICsgYVsyXSArIFwiLCBcIiArIGFbM10gKyBcIiwgXCIgKyBhWzRdICsgXCIsIFwiICsgYVs1XSArIFwiLCBcIiArIGFbNl0gKyBcIiwgXCIgKyBhWzddICsgXCIsIFwiICsgYVs4XSArIFwiKVwiO1xufVxuLyoqXG4gKiBSZXR1cm5zIEZyb2Jlbml1cyBub3JtIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcbiAgcmV0dXJuIE1hdGguaHlwb3QoYVswXSwgYVsxXSwgYVsyXSwgYVszXSwgYVs0XSwgYVs1XSwgYVs2XSwgYVs3XSwgYVs4XSk7XG59XG4vKipcbiAqIEFkZHMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgb3V0WzNdID0gYVszXSArIGJbM107XG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICBvdXRbNF0gPSBhWzRdICogYjtcbiAgb3V0WzVdID0gYVs1XSAqIGI7XG4gIG91dFs2XSA9IGFbNl0gKiBiO1xuICBvdXRbN10gPSBhWzddICogYjtcbiAgb3V0WzhdID0gYVs4XSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEFkZHMgdHdvIG1hdDMncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGU7XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGU7XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGU7XG4gIG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGU7XG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdICogc2NhbGU7XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdICogc2NhbGU7XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdICogc2NhbGU7XG4gIG91dFs3XSA9IGFbN10gKyBiWzddICogc2NhbGU7XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM10gJiYgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XSAmJiBhWzhdID09PSBiWzhdO1xufVxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdLFxuICAgICAgYTQgPSBhWzRdLFxuICAgICAgYTUgPSBhWzVdLFxuICAgICAgYTYgPSBhWzZdLFxuICAgICAgYTcgPSBhWzddLFxuICAgICAgYTggPSBhWzhdO1xuICB2YXIgYjAgPSBiWzBdLFxuICAgICAgYjEgPSBiWzFdLFxuICAgICAgYjIgPSBiWzJdLFxuICAgICAgYjMgPSBiWzNdLFxuICAgICAgYjQgPSBiWzRdLFxuICAgICAgYjUgPSBiWzVdLFxuICAgICAgYjYgPSBiWzZdLFxuICAgICAgYjcgPSBiWzddLFxuICAgICAgYjggPSBiWzhdO1xuICByZXR1cm4gTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJiBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiYgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpICYmIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE0KSwgTWF0aC5hYnMoYjQpKSAmJiBNYXRoLmFicyhhNSAtIGI1KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNSksIE1hdGguYWJzKGI1KSkgJiYgTWF0aC5hYnMoYTYgLSBiNikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTYpLCBNYXRoLmFicyhiNikpICYmIE1hdGguYWJzKGE3IC0gYjcpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE3KSwgTWF0aC5hYnMoYjcpKSAmJiBNYXRoLmFicyhhOCAtIGI4KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOCksIE1hdGguYWJzKGI4KSk7XG59XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3ViID0gc3VidHJhY3Q7IiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG4vKipcbiAqIDR4NCBNYXRyaXg8YnI+Rm9ybWF0OiBjb2x1bW4tbWFqb3IsIHdoZW4gdHlwZWQgb3V0IGl0IGxvb2tzIGxpa2Ugcm93LW1ham9yPGJyPlRoZSBtYXRyaWNlcyBhcmUgYmVpbmcgcG9zdCBtdWx0aXBsaWVkLlxuICogQG1vZHVsZSBtYXQ0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDRcbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICB9XG5cbiAgb3V0WzBdID0gMTtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQ0fSBhIG5ldyA0eDQgbWF0cml4XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgb3V0WzldID0gYVs5XTtcbiAgb3V0WzEwXSA9IGFbMTBdO1xuICBvdXRbMTFdID0gYVsxMV07XG4gIG91dFsxMl0gPSBhWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdO1xuICBvdXRbMTRdID0gYVsxNF07XG4gIG91dFsxNV0gPSBhWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICBvdXRbOV0gPSBhWzldO1xuICBvdXRbMTBdID0gYVsxMF07XG4gIG91dFsxMV0gPSBhWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0NCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gQSBuZXcgbWF0NFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAzIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDMgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEzIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDMgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDkpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDEwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzAgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMTIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMxIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDEgcG9zaXRpb24gKGluZGV4IDEzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzMgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMTUpXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCBhIG1hdDQgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gIGlmIChvdXQgPT09IGEpIHtcbiAgICB2YXIgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXTtcbiAgICB2YXIgYTEyID0gYVs2XSxcbiAgICAgICAgYTEzID0gYVs3XTtcbiAgICB2YXIgYTIzID0gYVsxMV07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGEwMTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGEwMjtcbiAgICBvdXRbOV0gPSBhMTI7XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhMDM7XG4gICAgb3V0WzEzXSA9IGExMztcbiAgICBvdXRbMTRdID0gYTIzO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVs0XTtcbiAgICBvdXRbMl0gPSBhWzhdO1xuICAgIG91dFszXSA9IGFbMTJdO1xuICAgIG91dFs0XSA9IGFbMV07XG4gICAgb3V0WzVdID0gYVs1XTtcbiAgICBvdXRbNl0gPSBhWzldO1xuICAgIG91dFs3XSA9IGFbMTNdO1xuICAgIG91dFs4XSA9IGFbMl07XG4gICAgb3V0WzldID0gYVs2XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTRdO1xuICAgIG91dFsxMl0gPSBhWzNdO1xuICAgIG91dFsxM10gPSBhWzddO1xuICAgIG91dFsxNF0gPSBhWzExXTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XSxcbiAgICAgIGExMSA9IGFbNV0sXG4gICAgICBhMTIgPSBhWzZdLFxuICAgICAgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF0sXG4gICAgICBhMjEgPSBhWzldLFxuICAgICAgYTIyID0gYVsxMF0sXG4gICAgICBhMjMgPSBhWzExXTtcbiAgdmFyIGEzMCA9IGFbMTJdLFxuICAgICAgYTMxID0gYVsxM10sXG4gICAgICBhMzIgPSBhWzE0XSxcbiAgICAgIGEzMyA9IGFbMTVdO1xuICB2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICB2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICB2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICB2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICB2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICB2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICB2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICB2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICB2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICB2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICB2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICB2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyOyAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG5cbiAgdmFyIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZGV0ID0gMS4wIC8gZGV0O1xuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XSxcbiAgICAgIGExMSA9IGFbNV0sXG4gICAgICBhMTIgPSBhWzZdLFxuICAgICAgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF0sXG4gICAgICBhMjEgPSBhWzldLFxuICAgICAgYTIyID0gYVsxMF0sXG4gICAgICBhMjMgPSBhWzExXTtcbiAgdmFyIGEzMCA9IGFbMTJdLFxuICAgICAgYTMxID0gYVsxM10sXG4gICAgICBhMzIgPSBhWzE0XSxcbiAgICAgIGEzMyA9IGFbMTVdO1xuICBvdXRbMF0gPSBhMTEgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpICsgYTMxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMik7XG4gIG91dFsxXSA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgb3V0WzJdID0gYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpO1xuICBvdXRbM10gPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs0XSA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgb3V0WzVdID0gYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpO1xuICBvdXRbNl0gPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gIG91dFs3XSA9IGEwMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTEwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKTtcbiAgb3V0WzhdID0gYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpO1xuICBvdXRbOV0gPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gIG91dFsxMF0gPSBhMDAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSk7XG4gIG91dFsxMV0gPSAtKGEwMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEzIC0gYTAzICogYTExKSk7XG4gIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gIG91dFsxM10gPSBhMDAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSk7XG4gIG91dFsxNF0gPSAtKGEwMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpIC0gYTEwICogKGEwMSAqIGEzMiAtIGEwMiAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gIG91dFsxNV0gPSBhMDAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07XG4gIHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7IC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcblxuICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufVxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0c1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdLFxuICAgICAgYTAzID0gYVszXTtcbiAgdmFyIGExMCA9IGFbNF0sXG4gICAgICBhMTEgPSBhWzVdLFxuICAgICAgYTEyID0gYVs2XSxcbiAgICAgIGExMyA9IGFbN107XG4gIHZhciBhMjAgPSBhWzhdLFxuICAgICAgYTIxID0gYVs5XSxcbiAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgYTIzID0gYVsxMV07XG4gIHZhciBhMzAgPSBhWzEyXSxcbiAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgYTMyID0gYVsxNF0sXG4gICAgICBhMzMgPSBhWzE1XTsgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG5cbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXTtcbiAgb3V0WzBdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gIG91dFsxXSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICBvdXRbMl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgb3V0WzNdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gIGIwID0gYls0XTtcbiAgYjEgPSBiWzVdO1xuICBiMiA9IGJbNl07XG4gIGIzID0gYls3XTtcbiAgb3V0WzRdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gIG91dFs1XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICBvdXRbNl0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgb3V0WzddID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gIGIwID0gYls4XTtcbiAgYjEgPSBiWzldO1xuICBiMiA9IGJbMTBdO1xuICBiMyA9IGJbMTFdO1xuICBvdXRbOF0gPSBiMCAqIGEwMCArIGIxICogYTEwICsgYjIgKiBhMjAgKyBiMyAqIGEzMDtcbiAgb3V0WzldID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gIG91dFsxMF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgb3V0WzExXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuICBiMCA9IGJbMTJdO1xuICBiMSA9IGJbMTNdO1xuICBiMiA9IGJbMTRdO1xuICBiMyA9IGJbMTVdO1xuICBvdXRbMTJdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gIG91dFsxM10gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgb3V0WzE0XSA9IGIwICogYTAyICsgYjEgKiBhMTIgKyBiMiAqIGEyMiArIGIzICogYTMyO1xuICBvdXRbMTVdID0gYjAgKiBhMDMgKyBiMSAqIGExMyArIGIyICogYTIzICsgYjMgKiBhMzM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIHZhciB4ID0gdlswXSxcbiAgICAgIHkgPSB2WzFdLFxuICAgICAgeiA9IHZbMl07XG4gIHZhciBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gIHZhciBhMTAsIGExMSwgYTEyLCBhMTM7XG4gIHZhciBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgaWYgKGEgPT09IG91dCkge1xuICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICB9IGVsc2Uge1xuICAgIGEwMCA9IGFbMF07XG4gICAgYTAxID0gYVsxXTtcbiAgICBhMDIgPSBhWzJdO1xuICAgIGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTtcbiAgICBhMTEgPSBhWzVdO1xuICAgIGExMiA9IGFbNl07XG4gICAgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdO1xuICAgIGEyMSA9IGFbOV07XG4gICAgYTIyID0gYVsxMF07XG4gICAgYTIzID0gYVsxMV07XG4gICAgb3V0WzBdID0gYTAwO1xuICAgIG91dFsxXSA9IGEwMTtcbiAgICBvdXRbMl0gPSBhMDI7XG4gICAgb3V0WzNdID0gYTAzO1xuICAgIG91dFs0XSA9IGExMDtcbiAgICBvdXRbNV0gPSBhMTE7XG4gICAgb3V0WzZdID0gYTEyO1xuICAgIG91dFs3XSA9IGExMztcbiAgICBvdXRbOF0gPSBhMjA7XG4gICAgb3V0WzldID0gYTIxO1xuICAgIG91dFsxMF0gPSBhMjI7XG4gICAgb3V0WzExXSA9IGEyMztcbiAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgb3V0WzEzXSA9IGEwMSAqIHggKyBhMTEgKiB5ICsgYTIxICogeiArIGFbMTNdO1xuICAgIG91dFsxNF0gPSBhMDIgKiB4ICsgYTEyICogeSArIGEyMiAqIHogKyBhWzE0XTtcbiAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzMgbm90IHVzaW5nIHZlY3Rvcml6YXRpb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHYgdGhlIHZlYzMgdG8gc2NhbGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICoqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIHZhciB4ID0gdlswXSxcbiAgICAgIHkgPSB2WzFdLFxuICAgICAgeiA9IHZbMl07XG4gIG91dFswXSA9IGFbMF0gKiB4O1xuICBvdXRbMV0gPSBhWzFdICogeDtcbiAgb3V0WzJdID0gYVsyXSAqIHg7XG4gIG91dFszXSA9IGFbM10gKiB4O1xuICBvdXRbNF0gPSBhWzRdICogeTtcbiAgb3V0WzVdID0gYVs1XSAqIHk7XG4gIG91dFs2XSA9IGFbNl0gKiB5O1xuICBvdXRbN10gPSBhWzddICogeTtcbiAgb3V0WzhdID0gYVs4XSAqIHo7XG4gIG91dFs5XSA9IGFbOV0gKiB6O1xuICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICBvdXRbMTJdID0gYVsxMl07XG4gIG91dFsxM10gPSBhWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdO1xuICBvdXRbMTVdID0gYVsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQ0IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIGdpdmVuIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICB2YXIgeCA9IGF4aXNbMF0sXG4gICAgICB5ID0gYXhpc1sxXSxcbiAgICAgIHogPSBheGlzWzJdO1xuICB2YXIgbGVuID0gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbiAgdmFyIHMsIGMsIHQ7XG4gIHZhciBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gIHZhciBhMTAsIGExMSwgYTEyLCBhMTM7XG4gIHZhciBhMjAsIGEyMSwgYTIyLCBhMjM7XG4gIHZhciBiMDAsIGIwMSwgYjAyO1xuICB2YXIgYjEwLCBiMTEsIGIxMjtcbiAgdmFyIGIyMCwgYjIxLCBiMjI7XG5cbiAgaWYgKGxlbiA8IGdsTWF0cml4LkVQU0lMT04pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxlbiA9IDEgLyBsZW47XG4gIHggKj0gbGVuO1xuICB5ICo9IGxlbjtcbiAgeiAqPSBsZW47XG4gIHMgPSBNYXRoLnNpbihyYWQpO1xuICBjID0gTWF0aC5jb3MocmFkKTtcbiAgdCA9IDEgLSBjO1xuICBhMDAgPSBhWzBdO1xuICBhMDEgPSBhWzFdO1xuICBhMDIgPSBhWzJdO1xuICBhMDMgPSBhWzNdO1xuICBhMTAgPSBhWzRdO1xuICBhMTEgPSBhWzVdO1xuICBhMTIgPSBhWzZdO1xuICBhMTMgPSBhWzddO1xuICBhMjAgPSBhWzhdO1xuICBhMjEgPSBhWzldO1xuICBhMjIgPSBhWzEwXTtcbiAgYTIzID0gYVsxMV07IC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuXG4gIGIwMCA9IHggKiB4ICogdCArIGM7XG4gIGIwMSA9IHkgKiB4ICogdCArIHogKiBzO1xuICBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7XG4gIGIxMSA9IHkgKiB5ICogdCArIGM7XG4gIGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICBiMjAgPSB4ICogeiAqIHQgKyB5ICogcztcbiAgYjIxID0geSAqIHogKiB0IC0geCAqIHM7XG4gIGIyMiA9IHogKiB6ICogdCArIGM7IC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cbiAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gIGlmIChhICE9PSBvdXQpIHtcbiAgICAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpO1xuICB2YXIgYTEwID0gYVs0XTtcbiAgdmFyIGExMSA9IGFbNV07XG4gIHZhciBhMTIgPSBhWzZdO1xuICB2YXIgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF07XG4gIHZhciBhMjEgPSBhWzldO1xuICB2YXIgYTIyID0gYVsxMF07XG4gIHZhciBhMjMgPSBhWzExXTtcblxuICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuXG4gIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcbiAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcbiAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHM7XG4gIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTtcbiAgdmFyIGEwMCA9IGFbMF07XG4gIHZhciBhMDEgPSBhWzFdO1xuICB2YXIgYTAyID0gYVsyXTtcbiAgdmFyIGEwMyA9IGFbM107XG4gIHZhciBhMjAgPSBhWzhdO1xuICB2YXIgYTIxID0gYVs5XTtcbiAgdmFyIGEyMiA9IGFbMTBdO1xuICB2YXIgYTIzID0gYVsxMV07XG5cbiAgaWYgKGEgIT09IG91dCkge1xuICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cblxuICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogcztcbiAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gIG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzO1xuICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogcztcbiAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gIG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjO1xuICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGM7XG4gIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7XG4gIHZhciBhMDAgPSBhWzBdO1xuICB2YXIgYTAxID0gYVsxXTtcbiAgdmFyIGEwMiA9IGFbMl07XG4gIHZhciBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XTtcbiAgdmFyIGExMSA9IGFbNV07XG4gIHZhciBhMTIgPSBhWzZdO1xuICB2YXIgYTEzID0gYVs3XTtcblxuICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH0gLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG5cbiAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICBvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogcztcbiAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogcztcbiAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gdiBTY2FsaW5nIHZlY3RvclxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gdlsxXTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IHZbMl07XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgZ2l2ZW4gYW5nbGUgYXJvdW5kIGEgZ2l2ZW4gYXhpc1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkLCBheGlzKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQsIGF4aXMpIHtcbiAgdmFyIHggPSBheGlzWzBdLFxuICAgICAgeSA9IGF4aXNbMV0sXG4gICAgICB6ID0gYXhpc1syXTtcbiAgdmFyIGxlbiA9IE1hdGguaHlwb3QoeCwgeSwgeik7XG4gIHZhciBzLCBjLCB0O1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZW4gPSAxIC8gbGVuO1xuICB4ICo9IGxlbjtcbiAgeSAqPSBsZW47XG4gIHogKj0gbGVuO1xuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYzsgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuICBvdXRbMF0gPSB4ICogeCAqIHQgKyBjO1xuICBvdXRbMV0gPSB5ICogeCAqIHQgKyB6ICogcztcbiAgb3V0WzJdID0geiAqIHggKiB0IC0geSAqIHM7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHggKiB5ICogdCAtIHogKiBzO1xuICBvdXRbNV0gPSB5ICogeSAqIHQgKyBjO1xuICBvdXRbNl0gPSB6ICogeSAqIHQgKyB4ICogcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geCAqIHogKiB0ICsgeSAqIHM7XG4gIG91dFs5XSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICBvdXRbMTBdID0geiAqIHogKiB0ICsgYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWCBheGlzXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnJvdGF0ZVgoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWFJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpOyAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gYztcbiAgb3V0WzZdID0gcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gLXM7XG4gIG91dFsxMF0gPSBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlWShkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuICBvdXRbMF0gPSBjO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAtcztcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gcztcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IGM7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC5yb3RhdGVaKGRlc3QsIGRlc3QsIHJhZCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVpSb3RhdGlvbihvdXQsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTsgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG4gIG91dFswXSA9IGM7XG4gIG91dFsxXSA9IHM7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IC1zO1xuICBvdXRbNV0gPSBjO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uIGFuZCB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgcSwgdikge1xuICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgdmFyIHggPSBxWzBdLFxuICAgICAgeSA9IHFbMV0sXG4gICAgICB6ID0gcVsyXSxcbiAgICAgIHcgPSBxWzNdO1xuICB2YXIgeDIgPSB4ICsgeDtcbiAgdmFyIHkyID0geSArIHk7XG4gIHZhciB6MiA9IHogKyB6O1xuICB2YXIgeHggPSB4ICogeDI7XG4gIHZhciB4eSA9IHggKiB5MjtcbiAgdmFyIHh6ID0geCAqIHoyO1xuICB2YXIgeXkgPSB5ICogeTI7XG4gIHZhciB5eiA9IHkgKiB6MjtcbiAgdmFyIHp6ID0geiAqIHoyO1xuICB2YXIgd3ggPSB3ICogeDI7XG4gIHZhciB3eSA9IHcgKiB5MjtcbiAgdmFyIHd6ID0gdyAqIHoyO1xuICBvdXRbMF0gPSAxIC0gKHl5ICsgenopO1xuICBvdXRbMV0gPSB4eSArIHd6O1xuICBvdXRbMl0gPSB4eiAtIHd5O1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB4eSAtIHd6O1xuICBvdXRbNV0gPSAxIC0gKHh4ICsgenopO1xuICBvdXRbNl0gPSB5eiArIHd4O1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB4eiArIHd5O1xuICBvdXRbOV0gPSB5eiAtIHd4O1xuICBvdXRbMTBdID0gMSAtICh4eCArIHl5KTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSB2WzBdO1xuICBvdXRbMTNdID0gdlsxXTtcbiAgb3V0WzE0XSA9IHZbMl07XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBNYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHttYXQ0fSBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0MihvdXQsIGEpIHtcbiAgdmFyIHRyYW5zbGF0aW9uID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIHZhciBieCA9IC1hWzBdLFxuICAgICAgYnkgPSAtYVsxXSxcbiAgICAgIGJ6ID0gLWFbMl0sXG4gICAgICBidyA9IGFbM10sXG4gICAgICBheCA9IGFbNF0sXG4gICAgICBheSA9IGFbNV0sXG4gICAgICBheiA9IGFbNl0sXG4gICAgICBhdyA9IGFbN107XG4gIHZhciBtYWduaXR1ZGUgPSBieCAqIGJ4ICsgYnkgKiBieSArIGJ6ICogYnogKyBidyAqIGJ3OyAvL09ubHkgc2NhbGUgaWYgaXQgbWFrZXMgc2Vuc2VcblxuICBpZiAobWFnbml0dWRlID4gMCkge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMiAvIG1hZ25pdHVkZTtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDIgLyBtYWduaXR1ZGU7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyIC8gbWFnbml0dWRlO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMjtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDI7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xuICB9XG5cbiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBhLCB0cmFuc2xhdGlvbik7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcbiAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XG4gKiBAcGFyYW0gIHtSZWFkb25seU1hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb24ob3V0LCBtYXQpIHtcbiAgb3V0WzBdID0gbWF0WzEyXTtcbiAgb3V0WzFdID0gbWF0WzEzXTtcbiAgb3V0WzJdID0gbWF0WzE0XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxuICogIHdpdGggYSBub3JtYWxpemVkIFF1YXRlcm5pb24gcGFyYW10ZXIsIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZVxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50XG4gKiBAcGFyYW0gIHtSZWFkb25seU1hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NhbGluZyhvdXQsIG1hdCkge1xuICB2YXIgbTExID0gbWF0WzBdO1xuICB2YXIgbTEyID0gbWF0WzFdO1xuICB2YXIgbTEzID0gbWF0WzJdO1xuICB2YXIgbTIxID0gbWF0WzRdO1xuICB2YXIgbTIyID0gbWF0WzVdO1xuICB2YXIgbTIzID0gbWF0WzZdO1xuICB2YXIgbTMxID0gbWF0WzhdO1xuICB2YXIgbTMyID0gbWF0WzldO1xuICB2YXIgbTMzID0gbWF0WzEwXTtcbiAgb3V0WzBdID0gTWF0aC5oeXBvdChtMTEsIG0xMiwgbTEzKTtcbiAgb3V0WzFdID0gTWF0aC5oeXBvdChtMjEsIG0yMiwgbTIzKTtcbiAgb3V0WzJdID0gTWF0aC5oeXBvdChtMzEsIG0zMiwgbTMzKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyBhIHF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbmFsIGNvbXBvbmVudFxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXG4gKiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24sIHRoZSByZXR1cm5lZCBxdWF0ZXJuaW9uIHdpbGwgYmUgdGhlXG4gKiAgc2FtZSBhcyB0aGUgcXVhdGVybmlvbiBvcmlnaW5hbGx5IHN1cHBsaWVkLlxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7cXVhdH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvdGF0aW9uKG91dCwgbWF0KSB7XG4gIHZhciBzY2FsaW5nID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIGdldFNjYWxpbmcoc2NhbGluZywgbWF0KTtcbiAgdmFyIGlzMSA9IDEgLyBzY2FsaW5nWzBdO1xuICB2YXIgaXMyID0gMSAvIHNjYWxpbmdbMV07XG4gIHZhciBpczMgPSAxIC8gc2NhbGluZ1syXTtcbiAgdmFyIHNtMTEgPSBtYXRbMF0gKiBpczE7XG4gIHZhciBzbTEyID0gbWF0WzFdICogaXMyO1xuICB2YXIgc20xMyA9IG1hdFsyXSAqIGlzMztcbiAgdmFyIHNtMjEgPSBtYXRbNF0gKiBpczE7XG4gIHZhciBzbTIyID0gbWF0WzVdICogaXMyO1xuICB2YXIgc20yMyA9IG1hdFs2XSAqIGlzMztcbiAgdmFyIHNtMzEgPSBtYXRbOF0gKiBpczE7XG4gIHZhciBzbTMyID0gbWF0WzldICogaXMyO1xuICB2YXIgc20zMyA9IG1hdFsxMF0gKiBpczM7XG4gIHZhciB0cmFjZSA9IHNtMTEgKyBzbTIyICsgc20zMztcbiAgdmFyIFMgPSAwO1xuXG4gIGlmICh0cmFjZSA+IDApIHtcbiAgICBTID0gTWF0aC5zcXJ0KHRyYWNlICsgMS4wKSAqIDI7XG4gICAgb3V0WzNdID0gMC4yNSAqIFM7XG4gICAgb3V0WzBdID0gKHNtMjMgLSBzbTMyKSAvIFM7XG4gICAgb3V0WzFdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgb3V0WzJdID0gKHNtMTIgLSBzbTIxKSAvIFM7XG4gIH0gZWxzZSBpZiAoc20xMSA+IHNtMjIgJiYgc20xMSA+IHNtMzMpIHtcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMTEgLSBzbTIyIC0gc20zMykgKiAyO1xuICAgIG91dFszXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgIG91dFswXSA9IDAuMjUgKiBTO1xuICAgIG91dFsxXSA9IChzbTEyICsgc20yMSkgLyBTO1xuICAgIG91dFsyXSA9IChzbTMxICsgc20xMykgLyBTO1xuICB9IGVsc2UgaWYgKHNtMjIgPiBzbTMzKSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTIyIC0gc20xMSAtIHNtMzMpICogMjtcbiAgICBvdXRbM10gPSAoc20zMSAtIHNtMTMpIC8gUztcbiAgICBvdXRbMF0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICBvdXRbMV0gPSAwLjI1ICogUztcbiAgICBvdXRbMl0gPSAoc20yMyArIHNtMzIpIC8gUztcbiAgfSBlbHNlIHtcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIHNtMzMgLSBzbTExIC0gc20yMikgKiAyO1xuICAgIG91dFszXSA9IChzbTEyIC0gc20yMSkgLyBTO1xuICAgIG91dFswXSA9IChzbTMxICsgc20xMykgLyBTO1xuICAgIG91dFsxXSA9IChzbTIzICsgc20zMikgLyBTO1xuICAgIG91dFsyXSA9IDAuMjUgKiBTO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGVcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XG4gKiAgICAgbGV0IHF1YXRNYXQgPSBtYXQ0LmNyZWF0ZSgpO1xuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgc2NhbGUpXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBzIFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUob3V0LCBxLCB2LCBzKSB7XG4gIC8vIFF1YXRlcm5pb24gbWF0aFxuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHh5ID0geCAqIHkyO1xuICB2YXIgeHogPSB4ICogejI7XG4gIHZhciB5eSA9IHkgKiB5MjtcbiAgdmFyIHl6ID0geSAqIHoyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIHZhciBzeCA9IHNbMF07XG4gIHZhciBzeSA9IHNbMV07XG4gIHZhciBzeiA9IHNbMl07XG4gIG91dFswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICBvdXRbMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgb3V0WzJdID0gKHh6IC0gd3kpICogc3g7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICBvdXRbNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgb3V0WzZdID0gKHl6ICsgd3gpICogc3k7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICBvdXRbOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgb3V0WzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlLCByb3RhdGluZyBhbmQgc2NhbGluZyBhcm91bmQgdGhlIGdpdmVuIG9yaWdpblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBvcmlnaW4pO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGVPcmlnaW4ob3V0LCBxLCB2LCBzLCBvKSB7XG4gIC8vIFF1YXRlcm5pb24gbWF0aFxuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHh5ID0geCAqIHkyO1xuICB2YXIgeHogPSB4ICogejI7XG4gIHZhciB5eSA9IHkgKiB5MjtcbiAgdmFyIHl6ID0geSAqIHoyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIHZhciBzeCA9IHNbMF07XG4gIHZhciBzeSA9IHNbMV07XG4gIHZhciBzeiA9IHNbMl07XG4gIHZhciBveCA9IG9bMF07XG4gIHZhciBveSA9IG9bMV07XG4gIHZhciBveiA9IG9bMl07XG4gIHZhciBvdXQwID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gIHZhciBvdXQxID0gKHh5ICsgd3opICogc3g7XG4gIHZhciBvdXQyID0gKHh6IC0gd3kpICogc3g7XG4gIHZhciBvdXQ0ID0gKHh5IC0gd3opICogc3k7XG4gIHZhciBvdXQ1ID0gKDEgLSAoeHggKyB6eikpICogc3k7XG4gIHZhciBvdXQ2ID0gKHl6ICsgd3gpICogc3k7XG4gIHZhciBvdXQ4ID0gKHh6ICsgd3kpICogc3o7XG4gIHZhciBvdXQ5ID0gKHl6IC0gd3gpICogc3o7XG4gIHZhciBvdXQxMCA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuICBvdXRbMF0gPSBvdXQwO1xuICBvdXRbMV0gPSBvdXQxO1xuICBvdXRbMl0gPSBvdXQyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSBvdXQ0O1xuICBvdXRbNV0gPSBvdXQ1O1xuICBvdXRbNl0gPSBvdXQ2O1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSBvdXQ4O1xuICBvdXRbOV0gPSBvdXQ5O1xuICBvdXRbMTBdID0gb3V0MTA7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXSArIG94IC0gKG91dDAgKiBveCArIG91dDQgKiBveSArIG91dDggKiBveik7XG4gIG91dFsxM10gPSB2WzFdICsgb3kgLSAob3V0MSAqIG94ICsgb3V0NSAqIG95ICsgb3V0OSAqIG96KTtcbiAgb3V0WzE0XSA9IHZbMl0gKyBveiAtIChvdXQyICogb3ggKyBvdXQ2ICogb3kgKyBvdXQxMCAqIG96KTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuICpcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQob3V0LCBxKSB7XG4gIHZhciB4ID0gcVswXSxcbiAgICAgIHkgPSBxWzFdLFxuICAgICAgeiA9IHFbMl0sXG4gICAgICB3ID0gcVszXTtcbiAgdmFyIHgyID0geCArIHg7XG4gIHZhciB5MiA9IHkgKyB5O1xuICB2YXIgejIgPSB6ICsgejtcbiAgdmFyIHh4ID0geCAqIHgyO1xuICB2YXIgeXggPSB5ICogeDI7XG4gIHZhciB5eSA9IHkgKiB5MjtcbiAgdmFyIHp4ID0geiAqIHgyO1xuICB2YXIgenkgPSB6ICogeTI7XG4gIHZhciB6eiA9IHogKiB6MjtcbiAgdmFyIHd4ID0gdyAqIHgyO1xuICB2YXIgd3kgPSB3ICogeTI7XG4gIHZhciB3eiA9IHcgKiB6MjtcbiAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gIG91dFsxXSA9IHl4ICsgd3o7XG4gIG91dFsyXSA9IHp4IC0gd3k7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHl4IC0gd3o7XG4gIG91dFs1XSA9IDEgLSB4eCAtIHp6O1xuICBvdXRbNl0gPSB6eSArIHd4O1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB6eCArIHd5O1xuICBvdXRbOV0gPSB6eSAtIHd4O1xuICBvdXRbMTBdID0gMSAtIHh4IC0geXk7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZydXN0dW0ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICB2YXIgcmwgPSAxIC8gKHJpZ2h0IC0gbGVmdCk7XG4gIHZhciB0YiA9IDEgLyAodG9wIC0gYm90dG9tKTtcbiAgdmFyIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzBdID0gbmVhciAqIDIgKiBybDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gbmVhciAqIDIgKiB0YjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcbiAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICBvdXRbMTFdID0gLTE7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IGZhciAqIG5lYXIgKiAyICogbmY7XG4gIG91dFsxNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHMuXG4gKiBUaGUgbmVhci9mYXIgY2xpcCBwbGFuZXMgY29ycmVzcG9uZCB0byBhIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGUgWiByYW5nZSBvZiBbLTEsIDFdLFxuICogd2hpY2ggbWF0Y2hlcyBXZWJHTC9PcGVuR0wncyBjbGlwIHZvbHVtZS5cbiAqIFBhc3NpbmcgbnVsbC91bmRlZmluZWQvbm8gdmFsdWUgZm9yIGZhciB3aWxsIGdlbmVyYXRlIGluZmluaXRlIHByb2plY3Rpb24gbWF0cml4LlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtLCBjYW4gYmUgbnVsbCBvciBJbmZpbml0eVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZU5PKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICBuZjtcbiAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gZjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNV0gPSAwO1xuXG4gIGlmIChmYXIgIT0gbnVsbCAmJiBmYXIgIT09IEluZmluaXR5KSB7XG4gICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcbiAgfSBlbHNlIHtcbiAgICBvdXRbMTBdID0gLTE7XG4gICAgb3V0WzE0XSA9IC0yICogbmVhcjtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5wZXJzcGVjdGl2ZU5PfVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBwZXJzcGVjdGl2ZSA9IHBlcnNwZWN0aXZlTk87XG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHN1aXRhYmxlIGZvciBXZWJHUFUgd2l0aCB0aGUgZ2l2ZW4gYm91bmRzLlxuICogVGhlIG5lYXIvZmFyIGNsaXAgcGxhbmVzIGNvcnJlc3BvbmQgdG8gYSBub3JtYWxpemVkIGRldmljZSBjb29yZGluYXRlIFogcmFuZ2Ugb2YgWzAsIDFdLFxuICogd2hpY2ggbWF0Y2hlcyBXZWJHUFUvVnVsa2FuL0RpcmVjdFgvTWV0YWwncyBjbGlwIHZvbHVtZS5cbiAqIFBhc3NpbmcgbnVsbC91bmRlZmluZWQvbm8gdmFsdWUgZm9yIGZhciB3aWxsIGdlbmVyYXRlIGluZmluaXRlIHByb2plY3Rpb24gbWF0cml4LlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBmb3Z5IFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcgaW4gcmFkaWFuc1xuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtLCBjYW4gYmUgbnVsbCBvciBJbmZpbml0eVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJzcGVjdGl2ZVpPKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICBuZjtcbiAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gZjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNV0gPSAwO1xuXG4gIGlmIChmYXIgIT0gbnVsbCAmJiBmYXIgIT09IEluZmluaXR5KSB7XG4gICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFsxMF0gPSBmYXIgKiBuZjtcbiAgICBvdXRbMTRdID0gZmFyICogbmVhciAqIG5mO1xuICB9IGVsc2Uge1xuICAgIG91dFsxMF0gPSAtMTtcbiAgICBvdXRbMTRdID0gLW5lYXI7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBmaWVsZCBvZiB2aWV3LlxuICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxuICogd2l0aCB0aGUgc3RpbGwgZXhwZXJpZW1lbnRhbCBXZWJWUiBBUEkuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtPYmplY3R9IGZvdiBPYmplY3QgY29udGFpbmluZyB0aGUgZm9sbG93aW5nIHZhbHVlczogdXBEZWdyZWVzLCBkb3duRGVncmVlcywgbGVmdERlZ3JlZXMsIHJpZ2h0RGVncmVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xuICB2YXIgdXBUYW4gPSBNYXRoLnRhbihmb3YudXBEZWdyZWVzICogTWF0aC5QSSAvIDE4MC4wKTtcbiAgdmFyIGRvd25UYW4gPSBNYXRoLnRhbihmb3YuZG93bkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwLjApO1xuICB2YXIgbGVmdFRhbiA9IE1hdGgudGFuKGZvdi5sZWZ0RGVncmVlcyAqIE1hdGguUEkgLyAxODAuMCk7XG4gIHZhciByaWdodFRhbiA9IE1hdGgudGFuKGZvdi5yaWdodERlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwLjApO1xuICB2YXIgeFNjYWxlID0gMi4wIC8gKGxlZnRUYW4gKyByaWdodFRhbik7XG4gIHZhciB5U2NhbGUgPSAyLjAgLyAodXBUYW4gKyBkb3duVGFuKTtcbiAgb3V0WzBdID0geFNjYWxlO1xuICBvdXRbMV0gPSAwLjA7XG4gIG91dFsyXSA9IDAuMDtcbiAgb3V0WzNdID0gMC4wO1xuICBvdXRbNF0gPSAwLjA7XG4gIG91dFs1XSA9IHlTY2FsZTtcbiAgb3V0WzZdID0gMC4wO1xuICBvdXRbN10gPSAwLjA7XG4gIG91dFs4XSA9IC0oKGxlZnRUYW4gLSByaWdodFRhbikgKiB4U2NhbGUgKiAwLjUpO1xuICBvdXRbOV0gPSAodXBUYW4gLSBkb3duVGFuKSAqIHlTY2FsZSAqIDAuNTtcbiAgb3V0WzEwXSA9IGZhciAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzExXSA9IC0xLjA7XG4gIG91dFsxMl0gPSAwLjA7XG4gIG91dFsxM10gPSAwLjA7XG4gIG91dFsxNF0gPSBmYXIgKiBuZWFyIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMTVdID0gMC4wO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kcy5cbiAqIFRoZSBuZWFyL2ZhciBjbGlwIHBsYW5lcyBjb3JyZXNwb25kIHRvIGEgbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZSBaIHJhbmdlIG9mIFstMSwgMV0sXG4gKiB3aGljaCBtYXRjaGVzIFdlYkdML09wZW5HTCdzIGNsaXAgdm9sdW1lLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBvcnRob05PKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgdmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICB2YXIgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XG4gIHZhciBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gIG91dFswXSA9IC0yICogbHI7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IC0yICogYnQ7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAyICogbmY7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5vcnRob05PfVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBvcnRobyA9IG9ydGhvTk87XG4vKipcbiAqIEdlbmVyYXRlcyBhIG9ydGhvZ29uYWwgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzLlxuICogVGhlIG5lYXIvZmFyIGNsaXAgcGxhbmVzIGNvcnJlc3BvbmQgdG8gYSBub3JtYWxpemVkIGRldmljZSBjb29yZGluYXRlIFogcmFuZ2Ugb2YgWzAsIDFdLFxuICogd2hpY2ggbWF0Y2hlcyBXZWJHUFUvVnVsa2FuL0RpcmVjdFgvTWV0YWwncyBjbGlwIHZvbHVtZS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gb3J0aG9aTyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gIHZhciBsciA9IDEgLyAobGVmdCAtIHJpZ2h0KTtcbiAgdmFyIGJ0ID0gMSAvIChib3R0b20gLSB0b3ApO1xuICB2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSAtMiAqIGxyO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSAtMiAqIGJ0O1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gbmY7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gIG91dFsxNF0gPSBuZWFyICogbmY7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpcy5cbiAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbG9va0F0KG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gIHZhciB4MCwgeDEsIHgyLCB5MCwgeTEsIHkyLCB6MCwgejEsIHoyLCBsZW47XG4gIHZhciBleWV4ID0gZXllWzBdO1xuICB2YXIgZXlleSA9IGV5ZVsxXTtcbiAgdmFyIGV5ZXogPSBleWVbMl07XG4gIHZhciB1cHggPSB1cFswXTtcbiAgdmFyIHVweSA9IHVwWzFdO1xuICB2YXIgdXB6ID0gdXBbMl07XG4gIHZhciBjZW50ZXJ4ID0gY2VudGVyWzBdO1xuICB2YXIgY2VudGVyeSA9IGNlbnRlclsxXTtcbiAgdmFyIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgaWYgKE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IGdsTWF0cml4LkVQU0lMT04gJiYgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJiBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5KG91dCk7XG4gIH1cblxuICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuICBsZW4gPSAxIC8gTWF0aC5oeXBvdCh6MCwgejEsIHoyKTtcbiAgejAgKj0gbGVuO1xuICB6MSAqPSBsZW47XG4gIHoyICo9IGxlbjtcbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0gTWF0aC5oeXBvdCh4MCwgeDEsIHgyKTtcblxuICBpZiAoIWxlbikge1xuICAgIHgwID0gMDtcbiAgICB4MSA9IDA7XG4gICAgeDIgPSAwO1xuICB9IGVsc2Uge1xuICAgIGxlbiA9IDEgLyBsZW47XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG4gIH1cblxuICB5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xuICB5MSA9IHoyICogeDAgLSB6MCAqIHgyO1xuICB5MiA9IHowICogeDEgLSB6MSAqIHgwO1xuICBsZW4gPSBNYXRoLmh5cG90KHkwLCB5MSwgeTIpO1xuXG4gIGlmICghbGVuKSB7XG4gICAgeTAgPSAwO1xuICAgIHkxID0gMDtcbiAgICB5MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB5MCAqPSBsZW47XG4gICAgeTEgKj0gbGVuO1xuICAgIHkyICo9IGxlbjtcbiAgfVxuXG4gIG91dFswXSA9IHgwO1xuICBvdXRbMV0gPSB5MDtcbiAgb3V0WzJdID0gejA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHgxO1xuICBvdXRbNV0gPSB5MTtcbiAgb3V0WzZdID0gejE7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHgyO1xuICBvdXRbOV0gPSB5MjtcbiAgb3V0WzEwXSA9IHoyO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IC0oeDAgKiBleWV4ICsgeDEgKiBleWV5ICsgeDIgKiBleWV6KTtcbiAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgb3V0WzE0XSA9IC0oejAgKiBleWV4ICsgejEgKiBleWV5ICsgejIgKiBleWV6KTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XG4gIHZhciBleWV4ID0gZXllWzBdLFxuICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICB1cHggPSB1cFswXSxcbiAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgdXB6ID0gdXBbMl07XG4gIHZhciB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXG4gICAgICB6MSA9IGV5ZXkgLSB0YXJnZXRbMV0sXG4gICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XG4gIHZhciBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejI7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG4gIH1cblxuICB2YXIgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxuICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxuICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICBsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG4gIH1cblxuICBvdXRbMF0gPSB4MDtcbiAgb3V0WzFdID0geDE7XG4gIG91dFsyXSA9IHgyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XG4gIG91dFs2XSA9IHowICogeDEgLSB6MSAqIHgwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB6MDtcbiAgb3V0WzldID0gejE7XG4gIG91dFsxMF0gPSB6MjtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSBleWV4O1xuICBvdXRbMTNdID0gZXlleTtcbiAgb3V0WzE0XSA9IGV5ZXo7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIG1hdHJpeCB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiBcIm1hdDQoXCIgKyBhWzBdICsgXCIsIFwiICsgYVsxXSArIFwiLCBcIiArIGFbMl0gKyBcIiwgXCIgKyBhWzNdICsgXCIsIFwiICsgYVs0XSArIFwiLCBcIiArIGFbNV0gKyBcIiwgXCIgKyBhWzZdICsgXCIsIFwiICsgYVs3XSArIFwiLCBcIiArIGFbOF0gKyBcIiwgXCIgKyBhWzldICsgXCIsIFwiICsgYVsxMF0gKyBcIiwgXCIgKyBhWzExXSArIFwiLCBcIiArIGFbMTJdICsgXCIsIFwiICsgYVsxM10gKyBcIiwgXCIgKyBhWzE0XSArIFwiLCBcIiArIGFbMTVdICsgXCIpXCI7XG59XG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xuICByZXR1cm4gTWF0aC5oeXBvdChhWzBdLCBhWzFdLCBhWzJdLCBhWzNdLCBhWzRdLCBhWzVdLCBhWzZdLCBhWzddLCBhWzhdLCBhWzldLCBhWzEwXSwgYVsxMV0sIGFbMTJdLCBhWzEzXSwgYVsxNF0sIGFbMTVdKTtcbn1cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICBvdXRbM10gPSBhWzNdICsgYlszXTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gKyBiWzVdO1xuICBvdXRbNl0gPSBhWzZdICsgYls2XTtcbiAgb3V0WzddID0gYVs3XSArIGJbN107XG4gIG91dFs4XSA9IGFbOF0gKyBiWzhdO1xuICBvdXRbOV0gPSBhWzldICsgYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSArIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSArIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtSZWFkb25seU1hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgb3V0WzldID0gYVs5XSAtIGJbOV07XG4gIG91dFsxMF0gPSBhWzEwXSAtIGJbMTBdO1xuICBvdXRbMTFdID0gYVsxMV0gLSBiWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdIC0gYlsxMl07XG4gIG91dFsxM10gPSBhWzEzXSAtIGJbMTNdO1xuICBvdXRbMTRdID0gYVsxNF0gLSBiWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdIC0gYlsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgb3V0WzRdID0gYVs0XSAqIGI7XG4gIG91dFs1XSA9IGFbNV0gKiBiO1xuICBvdXRbNl0gPSBhWzZdICogYjtcbiAgb3V0WzddID0gYVs3XSAqIGI7XG4gIG91dFs4XSA9IGFbOF0gKiBiO1xuICBvdXRbOV0gPSBhWzldICogYjtcbiAgb3V0WzEwXSA9IGFbMTBdICogYjtcbiAgb3V0WzExXSA9IGFbMTFdICogYjtcbiAgb3V0WzEyXSA9IGFbMTJdICogYjtcbiAgb3V0WzEzXSA9IGFbMTNdICogYjtcbiAgb3V0WzE0XSA9IGFbMTRdICogYjtcbiAgb3V0WzE1XSA9IGFbMTVdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQWRkcyB0d28gbWF0NCdzIGFmdGVyIG11bHRpcGx5aW5nIGVhY2ggZWxlbWVudCBvZiB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWUuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgb3V0WzNdID0gYVszXSArIGJbM10gKiBzY2FsZTtcbiAgb3V0WzRdID0gYVs0XSArIGJbNF0gKiBzY2FsZTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV0gKiBzY2FsZTtcbiAgb3V0WzZdID0gYVs2XSArIGJbNl0gKiBzY2FsZTtcbiAgb3V0WzddID0gYVs3XSArIGJbN10gKiBzY2FsZTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF0gKiBzY2FsZTtcbiAgb3V0WzldID0gYVs5XSArIGJbOV0gKiBzY2FsZTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgYlsxMF0gKiBzY2FsZTtcbiAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV0gKiBzY2FsZTtcbiAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl0gKiBzY2FsZTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgYlsxM10gKiBzY2FsZTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF0gKiBzY2FsZTtcbiAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV0gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXSAmJiBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiYgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF0gJiYgYVs5XSA9PT0gYls5XSAmJiBhWzEwXSA9PT0gYlsxMF0gJiYgYVsxMV0gPT09IGJbMTFdICYmIGFbMTJdID09PSBiWzEyXSAmJiBhWzEzXSA9PT0gYlsxM10gJiYgYVsxNF0gPT09IGJbMTRdICYmIGFbMTVdID09PSBiWzE1XTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XSxcbiAgICAgIGE2ID0gYVs2XSxcbiAgICAgIGE3ID0gYVs3XTtcbiAgdmFyIGE4ID0gYVs4XSxcbiAgICAgIGE5ID0gYVs5XSxcbiAgICAgIGExMCA9IGFbMTBdLFxuICAgICAgYTExID0gYVsxMV07XG4gIHZhciBhMTIgPSBhWzEyXSxcbiAgICAgIGExMyA9IGFbMTNdLFxuICAgICAgYTE0ID0gYVsxNF0sXG4gICAgICBhMTUgPSBhWzE1XTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXTtcbiAgdmFyIGI0ID0gYls0XSxcbiAgICAgIGI1ID0gYls1XSxcbiAgICAgIGI2ID0gYls2XSxcbiAgICAgIGI3ID0gYls3XTtcbiAgdmFyIGI4ID0gYls4XSxcbiAgICAgIGI5ID0gYls5XSxcbiAgICAgIGIxMCA9IGJbMTBdLFxuICAgICAgYjExID0gYlsxMV07XG4gIHZhciBiMTIgPSBiWzEyXSxcbiAgICAgIGIxMyA9IGJbMTNdLFxuICAgICAgYjE0ID0gYlsxNF0sXG4gICAgICBiMTUgPSBiWzE1XTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJiBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiYgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJiBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiYgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpICYmIE1hdGguYWJzKGE5IC0gYjkpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE5KSwgTWF0aC5hYnMoYjkpKSAmJiBNYXRoLmFicyhhMTAgLSBiMTApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMCksIE1hdGguYWJzKGIxMCkpICYmIE1hdGguYWJzKGExMSAtIGIxMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTExKSwgTWF0aC5hYnMoYjExKSkgJiYgTWF0aC5hYnMoYTEyIC0gYjEyKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTIpLCBNYXRoLmFicyhiMTIpKSAmJiBNYXRoLmFicyhhMTMgLSBiMTMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMyksIE1hdGguYWJzKGIxMykpICYmIE1hdGguYWJzKGExNCAtIGIxNCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE0KSwgTWF0aC5hYnMoYjE0KSkgJiYgTWF0aC5hYnMoYTE1IC0gYjE1KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTUpLCBNYXRoLmFicyhiMTUpKTtcbn1cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0LnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDsiLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcbmltcG9ydCAqIGFzIG1hdDMgZnJvbSBcIi4vbWF0My5qc1wiO1xuaW1wb3J0ICogYXMgdmVjMyBmcm9tIFwiLi92ZWMzLmpzXCI7XG5pbXBvcnQgKiBhcyB2ZWM0IGZyb20gXCIuL3ZlYzQuanNcIjtcbi8qKlxuICogUXVhdGVybmlvblxuICogQG1vZHVsZSBxdWF0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgfVxuXG4gIG91dFszXSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCBhIHF1YXQgdG8gdGhlIGlkZW50aXR5IHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldHMgYSBxdWF0IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFuZCByb3RhdGlvbiBheGlzLFxuICogdGhlbiByZXR1cm5zIGl0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0QXhpc0FuZ2xlKG91dCwgYXhpcywgcmFkKSB7XG4gIHJhZCA9IHJhZCAqIDAuNTtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZXRzIHRoZSByb3RhdGlvbiBheGlzIGFuZCBhbmdsZSBmb3IgYSBnaXZlblxuICogIHF1YXRlcm5pb24uIElmIGEgcXVhdGVybmlvbiBpcyBjcmVhdGVkIHdpdGhcbiAqICBzZXRBeGlzQW5nbGUsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBzYW1lXG4gKiAgdmFsdWVzIGFzIHByb3ZpZGllZCBpbiB0aGUgb3JpZ2luYWwgcGFyYW1ldGVyIGxpc3RcbiAqICBPUiBmdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB2YWx1ZXMuXG4gKiBFeGFtcGxlOiBUaGUgcXVhdGVybmlvbiBmb3JtZWQgYnkgYXhpcyBbMCwgMCwgMV0gYW5kXG4gKiAgYW5nbGUgLTkwIGlzIHRoZSBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieVxuICogIFswLCAwLCAxXSBhbmQgMjcwLiBUaGlzIG1ldGhvZCBmYXZvcnMgdGhlIGxhdHRlci5cbiAqIEBwYXJhbSAge3ZlYzN9IG91dF9heGlzICBWZWN0b3IgcmVjZWl2aW5nIHRoZSBheGlzIG9mIHJvdGF0aW9uXG4gKiBAcGFyYW0gIHtSZWFkb25seVF1YXR9IHEgICAgIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxuICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIG9mIHRoZSByb3RhdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBeGlzQW5nbGUob3V0X2F4aXMsIHEpIHtcbiAgdmFyIHJhZCA9IE1hdGguYWNvcyhxWzNdKSAqIDIuMDtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQgLyAyLjApO1xuXG4gIGlmIChzID4gZ2xNYXRyaXguRVBTSUxPTikge1xuICAgIG91dF9heGlzWzBdID0gcVswXSAvIHM7XG4gICAgb3V0X2F4aXNbMV0gPSBxWzFdIC8gcztcbiAgICBvdXRfYXhpc1syXSA9IHFbMl0gLyBzO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIHMgaXMgemVybywgcmV0dXJuIGFueSBheGlzIChubyByb3RhdGlvbiAtIGF4aXMgZG9lcyBub3QgbWF0dGVyKVxuICAgIG91dF9heGlzWzBdID0gMTtcbiAgICBvdXRfYXhpc1sxXSA9IDA7XG4gICAgb3V0X2F4aXNbMl0gPSAwO1xuICB9XG5cbiAgcmV0dXJuIHJhZDtcbn1cbi8qKlxuICogR2V0cyB0aGUgYW5ndWxhciBkaXN0YW5jZSBiZXR3ZWVuIHR3byB1bml0IHF1YXRlcm5pb25zXG4gKlxuICogQHBhcmFtICB7UmVhZG9ubHlRdWF0fSBhICAgICBPcmlnaW4gdW5pdCBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0gIHtSZWFkb25seVF1YXR9IGIgICAgIERlc3RpbmF0aW9uIHVuaXQgcXVhdGVybmlvblxuICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIGJldHdlZW4gdGhlIHR3byBxdWF0ZXJuaW9uc1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmdsZShhLCBiKSB7XG4gIHZhciBkb3Rwcm9kdWN0ID0gZG90KGEsIGIpO1xuICByZXR1cm4gTWF0aC5hY29zKDIgKiBkb3Rwcm9kdWN0ICogZG90cHJvZHVjdCAtIDEpO1xufVxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl0sXG4gICAgICBhdyA9IGFbM107XG4gIHZhciBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICBieiA9IGJbMl0sXG4gICAgICBidyA9IGJbM107XG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWCBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl0sXG4gICAgICBhdyA9IGFbM107XG4gIHZhciBieCA9IE1hdGguc2luKHJhZCksXG4gICAgICBidyA9IE1hdGguY29zKHJhZCk7XG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYXogPSBhWzJdLFxuICAgICAgYXcgPSBhWzNdO1xuICB2YXIgYnkgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgYncgPSBNYXRoLmNvcyhyYWQpO1xuICBvdXRbMF0gPSBheCAqIGJ3IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnk7XG4gIG91dFsyXSA9IGF6ICogYncgKyBheCAqIGJ5O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXkgKiBieTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGF6ID0gYVsyXSxcbiAgICAgIGF3ID0gYVszXTtcbiAgdmFyIGJ6ID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgIGJ3ID0gTWF0aC5jb3MocmFkKTtcbiAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIFcgY29tcG9uZW50IG9mIGEgcXVhdCBmcm9tIHRoZSBYLCBZLCBhbmQgWiBjb21wb25lbnRzLlxuICogQXNzdW1lcyB0aGF0IHF1YXRlcm5pb24gaXMgMSB1bml0IGluIGxlbmd0aC5cbiAqIEFueSBleGlzdGluZyBXIGNvbXBvbmVudCB3aWxsIGJlIGlnbm9yZWQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVXKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICBvdXRbM10gPSBNYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgZXhwb25lbnRpYWwgb2YgYSB1bml0IHF1YXRlcm5pb24uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSB0aGUgZXhwb25lbnRpYWwgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhwKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdLFxuICAgICAgdyA9IGFbM107XG4gIHZhciByID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIHZhciBldCA9IE1hdGguZXhwKHcpO1xuICB2YXIgcyA9IHIgPiAwID8gZXQgKiBNYXRoLnNpbihyKSAvIHIgOiAwO1xuICBvdXRbMF0gPSB4ICogcztcbiAgb3V0WzFdID0geSAqIHM7XG4gIG91dFsyXSA9IHogKiBzO1xuICBvdXRbM10gPSBldCAqIE1hdGguY29zKHIpO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIG5hdHVyYWwgbG9nYXJpdGhtIG9mIGEgdW5pdCBxdWF0ZXJuaW9uLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgdGhlIGV4cG9uZW50aWFsIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxuKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdLFxuICAgICAgdyA9IGFbM107XG4gIHZhciByID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIHZhciB0ID0gciA+IDAgPyBNYXRoLmF0YW4yKHIsIHcpIC8gciA6IDA7XG4gIG91dFswXSA9IHggKiB0O1xuICBvdXRbMV0gPSB5ICogdDtcbiAgb3V0WzJdID0geiAqIHQ7XG4gIG91dFszXSA9IDAuNSAqIE1hdGgubG9nKHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3KTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBzY2FsYXIgcG93ZXIgb2YgYSB1bml0IHF1YXRlcm5pb24uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSB0aGUgZXhwb25lbnRpYWwgb2ZcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgcXVhdGVybmlvbiBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBwb3cob3V0LCBhLCBiKSB7XG4gIGxuKG91dCwgYSk7XG4gIHNjYWxlKG91dCwgb3V0LCBiKTtcbiAgZXhwKG91dCwgb3V0KTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgLy8gYmVuY2htYXJrczpcbiAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGF6ID0gYVsyXSxcbiAgICAgIGF3ID0gYVszXTtcbiAgdmFyIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIGJ6ID0gYlsyXSxcbiAgICAgIGJ3ID0gYlszXTtcbiAgdmFyIG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxOyAvLyBjYWxjIGNvc2luZVxuXG4gIGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidzsgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXG5cbiAgaWYgKGNvc29tIDwgMC4wKSB7XG4gICAgY29zb20gPSAtY29zb207XG4gICAgYnggPSAtYng7XG4gICAgYnkgPSAtYnk7XG4gICAgYnogPSAtYno7XG4gICAgYncgPSAtYnc7XG4gIH0gLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xuXG5cbiAgaWYgKDEuMCAtIGNvc29tID4gZ2xNYXRyaXguRVBTSUxPTikge1xuICAgIC8vIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgIG9tZWdhID0gTWF0aC5hY29zKGNvc29tKTtcbiAgICBzaW5vbSA9IE1hdGguc2luKG9tZWdhKTtcbiAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XG4gIH0gZWxzZSB7XG4gICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxuICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cbiAgICBzY2FsZTAgPSAxLjAgLSB0O1xuICAgIHNjYWxlMSA9IHQ7XG4gIH0gLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xuXG5cbiAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcbiAgb3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieTtcbiAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcbiAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHVuaXQgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0KSB7XG4gIC8vIEltcGxlbWVudGF0aW9uIG9mIGh0dHA6Ly9wbGFubmluZy5jcy51aXVjLmVkdS9ub2RlMTk4Lmh0bWxcbiAgLy8gVE9ETzogQ2FsbGluZyByYW5kb20gMyB0aW1lcyBpcyBwcm9iYWJseSBub3QgdGhlIGZhc3Rlc3Qgc29sdXRpb25cbiAgdmFyIHUxID0gZ2xNYXRyaXguUkFORE9NKCk7XG4gIHZhciB1MiA9IGdsTWF0cml4LlJBTkRPTSgpO1xuICB2YXIgdTMgPSBnbE1hdHJpeC5SQU5ET00oKTtcbiAgdmFyIHNxcnQxTWludXNVMSA9IE1hdGguc3FydCgxIC0gdTEpO1xuICB2YXIgc3FydFUxID0gTWF0aC5zcXJ0KHUxKTtcbiAgb3V0WzBdID0gc3FydDFNaW51c1UxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUyKTtcbiAgb3V0WzFdID0gc3FydDFNaW51c1UxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUyKTtcbiAgb3V0WzJdID0gc3FydFUxICogTWF0aC5zaW4oMi4wICogTWF0aC5QSSAqIHUzKTtcbiAgb3V0WzNdID0gc3FydFUxICogTWF0aC5jb3MoMi4wICogTWF0aC5QSSAqIHUzKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGludmVyc2Ugb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICB2YXIgYTAgPSBhWzBdLFxuICAgICAgYTEgPSBhWzFdLFxuICAgICAgYTIgPSBhWzJdLFxuICAgICAgYTMgPSBhWzNdO1xuICB2YXIgZG90ID0gYTAgKiBhMCArIGExICogYTEgKyBhMiAqIGEyICsgYTMgKiBhMztcbiAgdmFyIGludkRvdCA9IGRvdCA/IDEuMCAvIGRvdCA6IDA7IC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgb3V0WzBdID0gLWEwICogaW52RG90O1xuICBvdXRbMV0gPSAtYTEgKiBpbnZEb3Q7XG4gIG91dFsyXSA9IC1hMiAqIGludkRvdDtcbiAgb3V0WzNdID0gYTMgKiBpbnZEb3Q7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY29uanVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiAzeDMgcm90YXRpb24gbWF0cml4LlxuICpcbiAqIE5PVEU6IFRoZSByZXN1bHRhbnQgcXVhdGVybmlvbiBpcyBub3Qgbm9ybWFsaXplZCwgc28geW91IHNob3VsZCBiZSBzdXJlXG4gKiB0byByZW5vcm1hbGl6ZSB0aGUgcXVhdGVybmlvbiB5b3Vyc2VsZiB3aGVyZSBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MyhvdXQsIG0pIHtcbiAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcbiAgLy8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXG4gIHZhciBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gIHZhciBmUm9vdDtcblxuICBpZiAoZlRyYWNlID4gMC4wKSB7XG4gICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgIGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCk7IC8vIDJ3XG5cbiAgICBvdXRbM10gPSAwLjUgKiBmUm9vdDtcbiAgICBmUm9vdCA9IDAuNSAvIGZSb290OyAvLyAxLyg0dylcblxuICAgIG91dFswXSA9IChtWzVdIC0gbVs3XSkgKiBmUm9vdDtcbiAgICBvdXRbMV0gPSAobVs2XSAtIG1bMl0pICogZlJvb3Q7XG4gICAgb3V0WzJdID0gKG1bMV0gLSBtWzNdKSAqIGZSb290O1xuICB9IGVsc2Uge1xuICAgIC8vIHx3fCA8PSAxLzJcbiAgICB2YXIgaSA9IDA7XG4gICAgaWYgKG1bNF0gPiBtWzBdKSBpID0gMTtcbiAgICBpZiAobVs4XSA+IG1baSAqIDMgKyBpXSkgaSA9IDI7XG4gICAgdmFyIGogPSAoaSArIDEpICUgMztcbiAgICB2YXIgayA9IChpICsgMikgJSAzO1xuICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSAqIDMgKyBpXSAtIG1baiAqIDMgKyBqXSAtIG1bayAqIDMgKyBrXSArIDEuMCk7XG4gICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICBvdXRbM10gPSAobVtqICogMyArIGtdIC0gbVtrICogMyArIGpdKSAqIGZSb290O1xuICAgIG91dFtqXSA9IChtW2ogKiAzICsgaV0gKyBtW2kgKiAzICsgal0pICogZlJvb3Q7XG4gICAgb3V0W2tdID0gKG1bayAqIDMgKyBpXSArIG1baSAqIDMgKyBrXSkgKiBmUm9vdDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIGV1bGVyIGFuZ2xlIHgsIHksIHouXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3h9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWCBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3l9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWSBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge3p9IEFuZ2xlIHRvIHJvdGF0ZSBhcm91bmQgWiBheGlzIGluIGRlZ3JlZXMuXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbUV1bGVyKG91dCwgeCwgeSwgeikge1xuICB2YXIgaGFsZlRvUmFkID0gMC41ICogTWF0aC5QSSAvIDE4MC4wO1xuICB4ICo9IGhhbGZUb1JhZDtcbiAgeSAqPSBoYWxmVG9SYWQ7XG4gIHogKj0gaGFsZlRvUmFkO1xuICB2YXIgc3ggPSBNYXRoLnNpbih4KTtcbiAgdmFyIGN4ID0gTWF0aC5jb3MoeCk7XG4gIHZhciBzeSA9IE1hdGguc2luKHkpO1xuICB2YXIgY3kgPSBNYXRoLmNvcyh5KTtcbiAgdmFyIHN6ID0gTWF0aC5zaW4oeik7XG4gIHZhciBjeiA9IE1hdGguY29zKHopO1xuICBvdXRbMF0gPSBzeCAqIGN5ICogY3ogLSBjeCAqIHN5ICogc3o7XG4gIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICBvdXRbM10gPSBjeCAqIGN5ICogY3ogKyBzeCAqIHN5ICogc3o7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBxdWF0ZW5pb25cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gXCJxdWF0KFwiICsgYVswXSArIFwiLCBcIiArIGFbMV0gKyBcIiwgXCIgKyBhWzJdICsgXCIsIFwiICsgYVszXSArIFwiKVwiO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgY2xvbmUgPSB2ZWM0LmNsb25lO1xuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHF1YXQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGZyb21WYWx1ZXMgPSB2ZWM0LmZyb21WYWx1ZXM7XG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHRoZSBzb3VyY2UgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBjb3B5ID0gdmVjNC5jb3B5O1xuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHNldCA9IHZlYzQuc2V0O1xuLyoqXG4gKiBBZGRzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgYWRkID0gdmVjNC5hZGQ7XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHNjYWxlID0gdmVjNC5zY2FsZTtcbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgZG90ID0gdmVjNC5kb3Q7XG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGxlcnAgPSB2ZWM0LmxlcnA7XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuXG5leHBvcnQgdmFyIGxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBsZW4gPSBsZW5ndGg7XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3F1YXJlZExlbmd0aCA9IHZlYzQuc3F1YXJlZExlbmd0aDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIG5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgVGhlIGZpcnN0IHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYiBUaGUgc2Vjb25kIHF1YXRlcm5pb24uXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgdmFyIGV4YWN0RXF1YWxzID0gdmVjNC5leGFjdEVxdWFscztcbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCB2YXIgZXF1YWxzID0gdmVjNC5lcXVhbHM7XG4vKipcbiAqIFNldHMgYSBxdWF0ZXJuaW9uIHRvIHJlcHJlc2VudCB0aGUgc2hvcnRlc3Qgcm90YXRpb24gZnJvbSBvbmVcbiAqIHZlY3RvciB0byBhbm90aGVyLlxuICpcbiAqIEJvdGggdmVjdG9ycyBhcmUgYXNzdW1lZCB0byBiZSB1bml0IGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuXG5leHBvcnQgdmFyIHJvdGF0aW9uVG8gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0bXB2ZWMzID0gdmVjMy5jcmVhdGUoKTtcbiAgdmFyIHhVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygxLCAwLCAwKTtcbiAgdmFyIHlVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvdXQsIGEsIGIpIHtcbiAgICB2YXIgZG90ID0gdmVjMy5kb3QoYSwgYik7XG5cbiAgICBpZiAoZG90IDwgLTAuOTk5OTk5KSB7XG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHhVbml0VmVjMywgYSk7XG4gICAgICBpZiAodmVjMy5sZW4odG1wdmVjMykgPCAwLjAwMDAwMSkgdmVjMy5jcm9zcyh0bXB2ZWMzLCB5VW5pdFZlYzMsIGEpO1xuICAgICAgdmVjMy5ub3JtYWxpemUodG1wdmVjMywgdG1wdmVjMyk7XG4gICAgICBzZXRBeGlzQW5nbGUob3V0LCB0bXB2ZWMzLCBNYXRoLlBJKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIGlmIChkb3QgPiAwLjk5OTk5OSkge1xuICAgICAgb3V0WzBdID0gMDtcbiAgICAgIG91dFsxXSA9IDA7XG4gICAgICBvdXRbMl0gPSAwO1xuICAgICAgb3V0WzNdID0gMTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgYSwgYik7XG4gICAgICBvdXRbMF0gPSB0bXB2ZWMzWzBdO1xuICAgICAgb3V0WzFdID0gdG1wdmVjM1sxXTtcbiAgICAgIG91dFsyXSA9IHRtcHZlYzNbMl07XG4gICAgICBvdXRbM10gPSAxICsgZG90O1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dCk7XG4gICAgfVxuICB9O1xufSgpO1xuLyoqXG4gKiBQZXJmb3JtcyBhIHNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCB2YXIgc3FsZXJwID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdGVtcDEgPSBjcmVhdGUoKTtcbiAgdmFyIHRlbXAyID0gY3JlYXRlKCk7XG4gIHJldHVybiBmdW5jdGlvbiAob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gICAgc2xlcnAodGVtcDEsIGEsIGQsIHQpO1xuICAgIHNsZXJwKHRlbXAyLCBiLCBjLCB0KTtcbiAgICBzbGVycChvdXQsIHRlbXAxLCB0ZW1wMiwgMiAqIHQgKiAoMSAtIHQpKTtcbiAgICByZXR1cm4gb3V0O1xuICB9O1xufSgpO1xuLyoqXG4gKiBTZXRzIHRoZSBzcGVjaWZpZWQgcXVhdGVybmlvbiB3aXRoIHZhbHVlcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlblxuICogYXhlcy4gRWFjaCBheGlzIGlzIGEgdmVjMyBhbmQgaXMgZXhwZWN0ZWQgdG8gYmUgdW5pdCBsZW5ndGggYW5kXG4gKiBwZXJwZW5kaWN1bGFyIHRvIGFsbCBvdGhlciBzcGVjaWZpZWQgYXhlcy5cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gcmlnaHQgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwicmlnaHRcIiBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSB1cCAgICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgbG9jYWwgXCJ1cFwiIGRpcmVjdGlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5cbmV4cG9ydCB2YXIgc2V0QXhlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1hdHIgPSBtYXQzLmNyZWF0ZSgpO1xuICByZXR1cm4gZnVuY3Rpb24gKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XG4gICAgbWF0clswXSA9IHJpZ2h0WzBdO1xuICAgIG1hdHJbM10gPSByaWdodFsxXTtcbiAgICBtYXRyWzZdID0gcmlnaHRbMl07XG4gICAgbWF0clsxXSA9IHVwWzBdO1xuICAgIG1hdHJbNF0gPSB1cFsxXTtcbiAgICBtYXRyWzddID0gdXBbMl07XG4gICAgbWF0clsyXSA9IC12aWV3WzBdO1xuICAgIG1hdHJbNV0gPSAtdmlld1sxXTtcbiAgICBtYXRyWzhdID0gLXZpZXdbMl07XG4gICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIGZyb21NYXQzKG91dCwgbWF0cikpO1xuICB9O1xufSgpOyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuaW1wb3J0ICogYXMgcXVhdCBmcm9tIFwiLi9xdWF0LmpzXCI7XG5pbXBvcnQgKiBhcyBtYXQ0IGZyb20gXCIuL21hdDQuanNcIjtcbi8qKlxuICogRHVhbCBRdWF0ZXJuaW9uPGJyPlxuICogRm9ybWF0OiBbcmVhbCwgZHVhbF08YnI+XG4gKiBRdWF0ZXJuaW9uIGZvcm1hdDogWFlaVzxicj5cbiAqIE1ha2Ugc3VyZSB0byBoYXZlIG5vcm1hbGl6ZWQgZHVhbCBxdWF0ZXJuaW9ucywgb3RoZXJ3aXNlIHRoZSBmdW5jdGlvbnMgbWF5IG5vdCB3b3JrIGFzIGludGVuZGVkLjxicj5cbiAqIEBtb2R1bGUgcXVhdDJcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgZHVhbCBxdWF0XG4gKlxuICogQHJldHVybnMge3F1YXQyfSBhIG5ldyBkdWFsIHF1YXRlcm5pb24gW3JlYWwgLT4gcm90YXRpb24sIGR1YWwgLT4gdHJhbnNsYXRpb25dXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgdmFyIGRxID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOCk7XG5cbiAgaWYgKGdsTWF0cml4LkFSUkFZX1RZUEUgIT0gRmxvYXQzMkFycmF5KSB7XG4gICAgZHFbMF0gPSAwO1xuICAgIGRxWzFdID0gMDtcbiAgICBkcVsyXSA9IDA7XG4gICAgZHFbNF0gPSAwO1xuICAgIGRxWzVdID0gMDtcbiAgICBkcVs2XSA9IDA7XG4gICAgZHFbN10gPSAwO1xuICB9XG5cbiAgZHFbM10gPSAxO1xuICByZXR1cm4gZHE7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGEgZHVhbCBxdWF0ZXJuaW9uIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG5ldyBkdWFsIHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBkcSA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDgpO1xuICBkcVswXSA9IGFbMF07XG4gIGRxWzFdID0gYVsxXTtcbiAgZHFbMl0gPSBhWzJdO1xuICBkcVszXSA9IGFbM107XG4gIGRxWzRdID0gYVs0XTtcbiAgZHFbNV0gPSBhWzVdO1xuICBkcVs2XSA9IGFbNl07XG4gIGRxWzddID0gYVs3XTtcbiAgcmV0dXJuIGRxO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGR1YWwgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkyIFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gejIgWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3MiBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXQyfSBuZXcgZHVhbCBxdWF0ZXJuaW9uXG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4MSwgeTEsIHoxLCB3MSwgeDIsIHkyLCB6MiwgdzIpIHtcbiAgdmFyIGRxID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOCk7XG4gIGRxWzBdID0geDE7XG4gIGRxWzFdID0geTE7XG4gIGRxWzJdID0gejE7XG4gIGRxWzNdID0gdzE7XG4gIGRxWzRdID0geDI7XG4gIGRxWzVdID0geTI7XG4gIGRxWzZdID0gejI7XG4gIGRxWzddID0gdzI7XG4gIHJldHVybiBkcTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gdmFsdWVzIChxdWF0IGFuZCB0cmFuc2xhdGlvbilcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geDEgWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHoxIFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdzEgVyBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB4MiBYIGNvbXBvbmVudCAodHJhbnNsYXRpb24pXG4gKiBAcGFyYW0ge051bWJlcn0geTIgWSBjb21wb25lbnQgKHRyYW5zbGF0aW9uKVxuICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50ICh0cmFuc2xhdGlvbilcbiAqIEByZXR1cm5zIHtxdWF0Mn0gbmV3IGR1YWwgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uVmFsdWVzKHgxLCB5MSwgejEsIHcxLCB4MiwgeTIsIHoyKSB7XG4gIHZhciBkcSA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDgpO1xuICBkcVswXSA9IHgxO1xuICBkcVsxXSA9IHkxO1xuICBkcVsyXSA9IHoxO1xuICBkcVszXSA9IHcxO1xuICB2YXIgYXggPSB4MiAqIDAuNSxcbiAgICAgIGF5ID0geTIgKiAwLjUsXG4gICAgICBheiA9IHoyICogMC41O1xuICBkcVs0XSA9IGF4ICogdzEgKyBheSAqIHoxIC0gYXogKiB5MTtcbiAgZHFbNV0gPSBheSAqIHcxICsgYXogKiB4MSAtIGF4ICogejE7XG4gIGRxWzZdID0gYXogKiB3MSArIGF4ICogeTEgLSBheSAqIHgxO1xuICBkcVs3XSA9IC1heCAqIHgxIC0gYXkgKiB5MSAtIGF6ICogejE7XG4gIHJldHVybiBkcTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIGR1YWwgcXVhdCBmcm9tIGEgcXVhdGVybmlvbiBhbmQgYSB0cmFuc2xhdGlvblxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gcSBhIG5vcm1hbGl6ZWQgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHQgdHJhbmxhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBxLCB0KSB7XG4gIHZhciBheCA9IHRbMF0gKiAwLjUsXG4gICAgICBheSA9IHRbMV0gKiAwLjUsXG4gICAgICBheiA9IHRbMl0gKiAwLjUsXG4gICAgICBieCA9IHFbMF0sXG4gICAgICBieSA9IHFbMV0sXG4gICAgICBieiA9IHFbMl0sXG4gICAgICBidyA9IHFbM107XG4gIG91dFswXSA9IGJ4O1xuICBvdXRbMV0gPSBieTtcbiAgb3V0WzJdID0gYno7XG4gIG91dFszXSA9IGJ3O1xuICBvdXRbNF0gPSBheCAqIGJ3ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFs1XSA9IGF5ICogYncgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzZdID0gYXogKiBidyArIGF4ICogYnkgLSBheSAqIGJ4O1xuICBvdXRbN10gPSAtYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgZHVhbCBxdWF0IGZyb20gYSB0cmFuc2xhdGlvblxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gdCB0cmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHtxdWF0Mn0gZHVhbCBxdWF0ZXJuaW9uIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdCkge1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAxO1xuICBvdXRbNF0gPSB0WzBdICogMC41O1xuICBvdXRbNV0gPSB0WzFdICogMC41O1xuICBvdXRbNl0gPSB0WzJdICogMC41O1xuICBvdXRbN10gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgZHVhbCBxdWF0IGZyb20gYSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBkdWFsIHF1YXRlcm5pb24gcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBxIHRoZSBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdGVybmlvbiByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHEpIHtcbiAgb3V0WzBdID0gcVswXTtcbiAgb3V0WzFdID0gcVsxXTtcbiAgb3V0WzJdID0gcVsyXTtcbiAgb3V0WzNdID0gcVszXTtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBkdWFsIHF1YXQgZnJvbSBhIG1hdHJpeCAoNHg0KVxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgZHVhbCBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gYSB0aGUgbWF0cml4XG4gKiBAcmV0dXJucyB7cXVhdDJ9IGR1YWwgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21NYXQ0KG91dCwgYSkge1xuICAvL1RPRE8gT3B0aW1pemUgdGhpc1xuICB2YXIgb3V0ZXIgPSBxdWF0LmNyZWF0ZSgpO1xuICBtYXQ0LmdldFJvdGF0aW9uKG91dGVyLCBhKTtcbiAgdmFyIHQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgbWF0NC5nZXRUcmFuc2xhdGlvbih0LCBhKTtcbiAgZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24ob3V0LCBvdXRlciwgdCk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBkdWFsIHF1YXQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIHRoZSBzb3VyY2UgZHVhbCBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCBhIGR1YWwgcXVhdCB0byB0aGUgaWRlbnRpdHkgZHVhbCBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDE7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHgxIFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geTEgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6MSBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcxIFcgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geDIgWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5MiBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHoyIFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdzIgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeDEsIHkxLCB6MSwgdzEsIHgyLCB5MiwgejIsIHcyKSB7XG4gIG91dFswXSA9IHgxO1xuICBvdXRbMV0gPSB5MTtcbiAgb3V0WzJdID0gejE7XG4gIG91dFszXSA9IHcxO1xuICBvdXRbNF0gPSB4MjtcbiAgb3V0WzVdID0geTI7XG4gIG91dFs2XSA9IHoyO1xuICBvdXRbN10gPSB3MjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogR2V0cyB0aGUgcmVhbCBwYXJ0IG9mIGEgZHVhbCBxdWF0XG4gKiBAcGFyYW0gIHtxdWF0fSBvdXQgcmVhbCBwYXJ0XG4gKiBAcGFyYW0gIHtSZWFkb25seVF1YXQyfSBhIER1YWwgUXVhdGVybmlvblxuICogQHJldHVybiB7cXVhdH0gcmVhbCBwYXJ0XG4gKi9cblxuZXhwb3J0IHZhciBnZXRSZWFsID0gcXVhdC5jb3B5O1xuLyoqXG4gKiBHZXRzIHRoZSBkdWFsIHBhcnQgb2YgYSBkdWFsIHF1YXRcbiAqIEBwYXJhbSAge3F1YXR9IG91dCBkdWFsIHBhcnRcbiAqIEBwYXJhbSAge1JlYWRvbmx5UXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXG4gKiBAcmV0dXJuIHtxdWF0fSBkdWFsIHBhcnRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RHVhbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVs0XTtcbiAgb3V0WzFdID0gYVs1XTtcbiAgb3V0WzJdID0gYVs2XTtcbiAgb3V0WzNdID0gYVs3XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU2V0IHRoZSByZWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBxIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJlYWwgcGFydFxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc2V0UmVhbCA9IHF1YXQuY29weTtcbi8qKlxuICogU2V0IHRoZSBkdWFsIGNvbXBvbmVudCBvZiBhIGR1YWwgcXVhdCB0byB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBxIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIGR1YWwgcGFydFxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREdWFsKG91dCwgcSkge1xuICBvdXRbNF0gPSBxWzBdO1xuICBvdXRbNV0gPSBxWzFdO1xuICBvdXRbNl0gPSBxWzJdO1xuICBvdXRbN10gPSBxWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZXRzIHRoZSB0cmFuc2xhdGlvbiBvZiBhIG5vcm1hbGl6ZWQgZHVhbCBxdWF0XG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgdHJhbnNsYXRpb25cbiAqIEBwYXJhbSAge1JlYWRvbmx5UXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcbiAqIEByZXR1cm4ge3ZlYzN9IHRyYW5zbGF0aW9uXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgYSkge1xuICB2YXIgYXggPSBhWzRdLFxuICAgICAgYXkgPSBhWzVdLFxuICAgICAgYXogPSBhWzZdLFxuICAgICAgYXcgPSBhWzddLFxuICAgICAgYnggPSAtYVswXSxcbiAgICAgIGJ5ID0gLWFbMV0sXG4gICAgICBieiA9IC1hWzJdLFxuICAgICAgYncgPSBhWzNdO1xuICBvdXRbMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyO1xuICBvdXRbMV0gPSAoYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieikgKiAyO1xuICBvdXRbMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2xhdGVzIGEgZHVhbCBxdWF0IGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICB2YXIgYXgxID0gYVswXSxcbiAgICAgIGF5MSA9IGFbMV0sXG4gICAgICBhejEgPSBhWzJdLFxuICAgICAgYXcxID0gYVszXSxcbiAgICAgIGJ4MSA9IHZbMF0gKiAwLjUsXG4gICAgICBieTEgPSB2WzFdICogMC41LFxuICAgICAgYnoxID0gdlsyXSAqIDAuNSxcbiAgICAgIGF4MiA9IGFbNF0sXG4gICAgICBheTIgPSBhWzVdLFxuICAgICAgYXoyID0gYVs2XSxcbiAgICAgIGF3MiA9IGFbN107XG4gIG91dFswXSA9IGF4MTtcbiAgb3V0WzFdID0gYXkxO1xuICBvdXRbMl0gPSBhejE7XG4gIG91dFszXSA9IGF3MTtcbiAgb3V0WzRdID0gYXcxICogYngxICsgYXkxICogYnoxIC0gYXoxICogYnkxICsgYXgyO1xuICBvdXRbNV0gPSBhdzEgKiBieTEgKyBhejEgKiBieDEgLSBheDEgKiBiejEgKyBheTI7XG4gIG91dFs2XSA9IGF3MSAqIGJ6MSArIGF4MSAqIGJ5MSAtIGF5MSAqIGJ4MSArIGF6MjtcbiAgb3V0WzddID0gLWF4MSAqIGJ4MSAtIGF5MSAqIGJ5MSAtIGF6MSAqIGJ6MSArIGF3MjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGhvdyBmYXIgc2hvdWxkIHRoZSByb3RhdGlvbiBiZVxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICB2YXIgYnggPSAtYVswXSxcbiAgICAgIGJ5ID0gLWFbMV0sXG4gICAgICBieiA9IC1hWzJdLFxuICAgICAgYncgPSBhWzNdLFxuICAgICAgYXggPSBhWzRdLFxuICAgICAgYXkgPSBhWzVdLFxuICAgICAgYXogPSBhWzZdLFxuICAgICAgYXcgPSBhWzddLFxuICAgICAgYXgxID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSxcbiAgICAgIGF5MSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnosXG4gICAgICBhejEgPSBheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4LFxuICAgICAgYXcxID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgcXVhdC5yb3RhdGVYKG91dCwgYSwgcmFkKTtcbiAgYnggPSBvdXRbMF07XG4gIGJ5ID0gb3V0WzFdO1xuICBieiA9IG91dFsyXTtcbiAgYncgPSBvdXRbM107XG4gIG91dFs0XSA9IGF4MSAqIGJ3ICsgYXcxICogYnggKyBheTEgKiBieiAtIGF6MSAqIGJ5O1xuICBvdXRbNV0gPSBheTEgKiBidyArIGF3MSAqIGJ5ICsgYXoxICogYnggLSBheDEgKiBiejtcbiAgb3V0WzZdID0gYXoxICogYncgKyBhdzEgKiBieiArIGF4MSAqIGJ5IC0gYXkxICogYng7XG4gIG91dFs3XSA9IGF3MSAqIGJ3IC0gYXgxICogYnggLSBheTEgKiBieSAtIGF6MSAqIGJ6O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSb3RhdGVzIGEgZHVhbCBxdWF0IGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0Mn0gb3V0IHRoZSByZWNlaXZpbmcgZHVhbCBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgaG93IGZhciBzaG91bGQgdGhlIHJvdGF0aW9uIGJlXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gIHZhciBieCA9IC1hWzBdLFxuICAgICAgYnkgPSAtYVsxXSxcbiAgICAgIGJ6ID0gLWFbMl0sXG4gICAgICBidyA9IGFbM10sXG4gICAgICBheCA9IGFbNF0sXG4gICAgICBheSA9IGFbNV0sXG4gICAgICBheiA9IGFbNl0sXG4gICAgICBhdyA9IGFbN10sXG4gICAgICBheDEgPSBheCAqIGJ3ICsgYXcgKiBieCArIGF5ICogYnogLSBheiAqIGJ5LFxuICAgICAgYXkxID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBieixcbiAgICAgIGF6MSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYngsXG4gICAgICBhdzEgPSBhdyAqIGJ3IC0gYXggKiBieCAtIGF5ICogYnkgLSBheiAqIGJ6O1xuICBxdWF0LnJvdGF0ZVkob3V0LCBhLCByYWQpO1xuICBieCA9IG91dFswXTtcbiAgYnkgPSBvdXRbMV07XG4gIGJ6ID0gb3V0WzJdO1xuICBidyA9IG91dFszXTtcbiAgb3V0WzRdID0gYXgxICogYncgKyBhdzEgKiBieCArIGF5MSAqIGJ6IC0gYXoxICogYnk7XG4gIG91dFs1XSA9IGF5MSAqIGJ3ICsgYXcxICogYnkgKyBhejEgKiBieCAtIGF4MSAqIGJ6O1xuICBvdXRbNl0gPSBhejEgKiBidyArIGF3MSAqIGJ6ICsgYXgxICogYnkgLSBheTEgKiBieDtcbiAgb3V0WzddID0gYXcxICogYncgLSBheDEgKiBieCAtIGF5MSAqIGJ5IC0gYXoxICogYno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYXJvdW5kIHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBob3cgZmFyIHNob3VsZCB0aGUgcm90YXRpb24gYmVcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgdmFyIGJ4ID0gLWFbMF0sXG4gICAgICBieSA9IC1hWzFdLFxuICAgICAgYnogPSAtYVsyXSxcbiAgICAgIGJ3ID0gYVszXSxcbiAgICAgIGF4ID0gYVs0XSxcbiAgICAgIGF5ID0gYVs1XSxcbiAgICAgIGF6ID0gYVs2XSxcbiAgICAgIGF3ID0gYVs3XSxcbiAgICAgIGF4MSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnksXG4gICAgICBheTEgPSBheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6LFxuICAgICAgYXoxID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCxcbiAgICAgIGF3MSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gIHF1YXQucm90YXRlWihvdXQsIGEsIHJhZCk7XG4gIGJ4ID0gb3V0WzBdO1xuICBieSA9IG91dFsxXTtcbiAgYnogPSBvdXRbMl07XG4gIGJ3ID0gb3V0WzNdO1xuICBvdXRbNF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieTtcbiAgb3V0WzVdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYno7XG4gIG91dFs2XSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4O1xuICBvdXRbN10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBiejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBieSBhIGdpdmVuIHF1YXRlcm5pb24gKGEgKiBxKVxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIHRoZSBkdWFsIHF1YXRlcm5pb24gdG8gcm90YXRlXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHJvdGF0ZSBieVxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlQnlRdWF0QXBwZW5kKG91dCwgYSwgcSkge1xuICB2YXIgcXggPSBxWzBdLFxuICAgICAgcXkgPSBxWzFdLFxuICAgICAgcXogPSBxWzJdLFxuICAgICAgcXcgPSBxWzNdLFxuICAgICAgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYXogPSBhWzJdLFxuICAgICAgYXcgPSBhWzNdO1xuICBvdXRbMF0gPSBheCAqIHF3ICsgYXcgKiBxeCArIGF5ICogcXogLSBheiAqIHF5O1xuICBvdXRbMV0gPSBheSAqIHF3ICsgYXcgKiBxeSArIGF6ICogcXggLSBheCAqIHF6O1xuICBvdXRbMl0gPSBheiAqIHF3ICsgYXcgKiBxeiArIGF4ICogcXkgLSBheSAqIHF4O1xuICBvdXRbM10gPSBhdyAqIHF3IC0gYXggKiBxeCAtIGF5ICogcXkgLSBheiAqIHF6O1xuICBheCA9IGFbNF07XG4gIGF5ID0gYVs1XTtcbiAgYXogPSBhWzZdO1xuICBhdyA9IGFbN107XG4gIG91dFs0XSA9IGF4ICogcXcgKyBhdyAqIHF4ICsgYXkgKiBxeiAtIGF6ICogcXk7XG4gIG91dFs1XSA9IGF5ICogcXcgKyBhdyAqIHF5ICsgYXogKiBxeCAtIGF4ICogcXo7XG4gIG91dFs2XSA9IGF6ICogcXcgKyBhdyAqIHF6ICsgYXggKiBxeSAtIGF5ICogcXg7XG4gIG91dFs3XSA9IGF3ICogcXcgLSBheCAqIHF4IC0gYXkgKiBxeSAtIGF6ICogcXo7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZXMgYSBkdWFsIHF1YXQgYnkgYSBnaXZlbiBxdWF0ZXJuaW9uIChxICogYSlcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0fSBxIHF1YXRlcm5pb24gdG8gcm90YXRlIGJ5XG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGEgdGhlIGR1YWwgcXVhdGVybmlvbiB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZUJ5UXVhdFByZXBlbmQob3V0LCBxLCBhKSB7XG4gIHZhciBxeCA9IHFbMF0sXG4gICAgICBxeSA9IHFbMV0sXG4gICAgICBxeiA9IHFbMl0sXG4gICAgICBxdyA9IHFbM10sXG4gICAgICBieCA9IGFbMF0sXG4gICAgICBieSA9IGFbMV0sXG4gICAgICBieiA9IGFbMl0sXG4gICAgICBidyA9IGFbM107XG4gIG91dFswXSA9IHF4ICogYncgKyBxdyAqIGJ4ICsgcXkgKiBieiAtIHF6ICogYnk7XG4gIG91dFsxXSA9IHF5ICogYncgKyBxdyAqIGJ5ICsgcXogKiBieCAtIHF4ICogYno7XG4gIG91dFsyXSA9IHF6ICogYncgKyBxdyAqIGJ6ICsgcXggKiBieSAtIHF5ICogYng7XG4gIG91dFszXSA9IHF3ICogYncgLSBxeCAqIGJ4IC0gcXkgKiBieSAtIHF6ICogYno7XG4gIGJ4ID0gYVs0XTtcbiAgYnkgPSBhWzVdO1xuICBieiA9IGFbNl07XG4gIGJ3ID0gYVs3XTtcbiAgb3V0WzRdID0gcXggKiBidyArIHF3ICogYnggKyBxeSAqIGJ6IC0gcXogKiBieTtcbiAgb3V0WzVdID0gcXkgKiBidyArIHF3ICogYnkgKyBxeiAqIGJ4IC0gcXggKiBiejtcbiAgb3V0WzZdID0gcXogKiBidyArIHF3ICogYnogKyBxeCAqIGJ5IC0gcXkgKiBieDtcbiAgb3V0WzddID0gcXcgKiBidyAtIHF4ICogYnggLSBxeSAqIGJ5IC0gcXogKiBiejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlcyBhIGR1YWwgcXVhdCBhcm91bmQgYSBnaXZlbiBheGlzLiBEb2VzIHRoZSBub3JtYWxpc2F0aW9uIGF1dG9tYXRpY2FsbHlcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZHVhbCBxdWF0ZXJuaW9uIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCBob3cgZmFyIHRoZSByb3RhdGlvbiBzaG91bGQgYmVcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZUFyb3VuZEF4aXMob3V0LCBhLCBheGlzLCByYWQpIHtcbiAgLy9TcGVjaWFsIGNhc2UgZm9yIHJhZCA9IDBcbiAgaWYgKE1hdGguYWJzKHJhZCkgPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIGNvcHkob3V0LCBhKTtcbiAgfVxuXG4gIHZhciBheGlzTGVuZ3RoID0gTWF0aC5oeXBvdChheGlzWzBdLCBheGlzWzFdLCBheGlzWzJdKTtcbiAgcmFkID0gcmFkICogMC41O1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBieCA9IHMgKiBheGlzWzBdIC8gYXhpc0xlbmd0aDtcbiAgdmFyIGJ5ID0gcyAqIGF4aXNbMV0gLyBheGlzTGVuZ3RoO1xuICB2YXIgYnogPSBzICogYXhpc1syXSAvIGF4aXNMZW5ndGg7XG4gIHZhciBidyA9IE1hdGguY29zKHJhZCk7XG4gIHZhciBheDEgPSBhWzBdLFxuICAgICAgYXkxID0gYVsxXSxcbiAgICAgIGF6MSA9IGFbMl0sXG4gICAgICBhdzEgPSBhWzNdO1xuICBvdXRbMF0gPSBheDEgKiBidyArIGF3MSAqIGJ4ICsgYXkxICogYnogLSBhejEgKiBieTtcbiAgb3V0WzFdID0gYXkxICogYncgKyBhdzEgKiBieSArIGF6MSAqIGJ4IC0gYXgxICogYno7XG4gIG91dFsyXSA9IGF6MSAqIGJ3ICsgYXcxICogYnogKyBheDEgKiBieSAtIGF5MSAqIGJ4O1xuICBvdXRbM10gPSBhdzEgKiBidyAtIGF4MSAqIGJ4IC0gYXkxICogYnkgLSBhejEgKiBiejtcbiAgdmFyIGF4ID0gYVs0XSxcbiAgICAgIGF5ID0gYVs1XSxcbiAgICAgIGF6ID0gYVs2XSxcbiAgICAgIGF3ID0gYVs3XTtcbiAgb3V0WzRdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgb3V0WzVdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzZdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgb3V0WzddID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQWRkcyB0d28gZHVhbCBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTXVsdGlwbGllcyB0d28gZHVhbCBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIHZhciBheDAgPSBhWzBdLFxuICAgICAgYXkwID0gYVsxXSxcbiAgICAgIGF6MCA9IGFbMl0sXG4gICAgICBhdzAgPSBhWzNdLFxuICAgICAgYngxID0gYls0XSxcbiAgICAgIGJ5MSA9IGJbNV0sXG4gICAgICBiejEgPSBiWzZdLFxuICAgICAgYncxID0gYls3XSxcbiAgICAgIGF4MSA9IGFbNF0sXG4gICAgICBheTEgPSBhWzVdLFxuICAgICAgYXoxID0gYVs2XSxcbiAgICAgIGF3MSA9IGFbN10sXG4gICAgICBieDAgPSBiWzBdLFxuICAgICAgYnkwID0gYlsxXSxcbiAgICAgIGJ6MCA9IGJbMl0sXG4gICAgICBidzAgPSBiWzNdO1xuICBvdXRbMF0gPSBheDAgKiBidzAgKyBhdzAgKiBieDAgKyBheTAgKiBiejAgLSBhejAgKiBieTA7XG4gIG91dFsxXSA9IGF5MCAqIGJ3MCArIGF3MCAqIGJ5MCArIGF6MCAqIGJ4MCAtIGF4MCAqIGJ6MDtcbiAgb3V0WzJdID0gYXowICogYncwICsgYXcwICogYnowICsgYXgwICogYnkwIC0gYXkwICogYngwO1xuICBvdXRbM10gPSBhdzAgKiBidzAgLSBheDAgKiBieDAgLSBheTAgKiBieTAgLSBhejAgKiBiejA7XG4gIG91dFs0XSA9IGF4MCAqIGJ3MSArIGF3MCAqIGJ4MSArIGF5MCAqIGJ6MSAtIGF6MCAqIGJ5MSArIGF4MSAqIGJ3MCArIGF3MSAqIGJ4MCArIGF5MSAqIGJ6MCAtIGF6MSAqIGJ5MDtcbiAgb3V0WzVdID0gYXkwICogYncxICsgYXcwICogYnkxICsgYXowICogYngxIC0gYXgwICogYnoxICsgYXkxICogYncwICsgYXcxICogYnkwICsgYXoxICogYngwIC0gYXgxICogYnowO1xuICBvdXRbNl0gPSBhejAgKiBidzEgKyBhdzAgKiBiejEgKyBheDAgKiBieTEgLSBheTAgKiBieDEgKyBhejEgKiBidzAgKyBhdzEgKiBiejAgKyBheDEgKiBieTAgLSBheTEgKiBieDA7XG4gIG91dFs3XSA9IGF3MCAqIGJ3MSAtIGF4MCAqIGJ4MSAtIGF5MCAqIGJ5MSAtIGF6MCAqIGJ6MSArIGF3MSAqIGJ3MCAtIGF4MSAqIGJ4MCAtIGF5MSAqIGJ5MCAtIGF6MSAqIGJ6MDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgbXVsID0gbXVsdGlwbHk7XG4vKipcbiAqIFNjYWxlcyBhIGR1YWwgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXQyfSBvdXQgdGhlIHJlY2VpdmluZyBkdWFsIHF1YXRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZHVhbCBxdWF0IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIGR1YWwgcXVhdCBieVxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgb3V0WzNdID0gYVszXSAqIGI7XG4gIG91dFs0XSA9IGFbNF0gKiBiO1xuICBvdXRbNV0gPSBhWzVdICogYjtcbiAgb3V0WzZdID0gYVs2XSAqIGI7XG4gIG91dFs3XSA9IGFbN10gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gZHVhbCBxdWF0J3MgKFRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgcmVhbCBwYXJ0cylcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgZG90ID0gcXVhdC5kb3Q7XG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gZHVhbCBxdWF0cydzXG4gKiBOT1RFOiBUaGUgcmVzdWx0aW5nIGR1YWwgcXVhdGVybmlvbnMgd29uJ3QgYWx3YXlzIGJlIG5vcm1hbGl6ZWQgKFRoZSBlcnJvciBpcyBtb3N0IG5vdGljZWFibGUgd2hlbiB0ID0gMC41KVxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdFxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdDJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgbXQgPSAxIC0gdDtcbiAgaWYgKGRvdChhLCBiKSA8IDApIHQgPSAtdDtcbiAgb3V0WzBdID0gYVswXSAqIG10ICsgYlswXSAqIHQ7XG4gIG91dFsxXSA9IGFbMV0gKiBtdCArIGJbMV0gKiB0O1xuICBvdXRbMl0gPSBhWzJdICogbXQgKyBiWzJdICogdDtcbiAgb3V0WzNdID0gYVszXSAqIG10ICsgYlszXSAqIHQ7XG4gIG91dFs0XSA9IGFbNF0gKiBtdCArIGJbNF0gKiB0O1xuICBvdXRbNV0gPSBhWzVdICogbXQgKyBiWzVdICogdDtcbiAgb3V0WzZdID0gYVs2XSAqIG10ICsgYls2XSAqIHQ7XG4gIG91dFs3XSA9IGFbN10gKiBtdCArIGJbN10gKiB0O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBpbnZlcnNlIG9mIGEgZHVhbCBxdWF0LiBJZiB0aGV5IGFyZSBub3JtYWxpemVkLCBjb25qdWdhdGUgaXMgY2hlYXBlclxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXQyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICB2YXIgc3FsZW4gPSBzcXVhcmVkTGVuZ3RoKGEpO1xuICBvdXRbMF0gPSAtYVswXSAvIHNxbGVuO1xuICBvdXRbMV0gPSAtYVsxXSAvIHNxbGVuO1xuICBvdXRbMl0gPSAtYVsyXSAvIHNxbGVuO1xuICBvdXRbM10gPSBhWzNdIC8gc3FsZW47XG4gIG91dFs0XSA9IC1hWzRdIC8gc3FsZW47XG4gIG91dFs1XSA9IC1hWzVdIC8gc3FsZW47XG4gIG91dFs2XSA9IC1hWzZdIC8gc3FsZW47XG4gIG91dFs3XSA9IGFbN10gLyBzcWxlbjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgY29uanVnYXRlIG9mIGEgZHVhbCBxdWF0XG4gKiBJZiB0aGUgZHVhbCBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdDIuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBjb25qdWdhdGUgb2ZcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmp1Z2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gLWFbNF07XG4gIG91dFs1XSA9IC1hWzVdO1xuICBvdXRbNl0gPSAtYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgZHVhbCBxdWF0XG4gKlxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIGR1YWwgcXVhdCB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBsZW5ndGggPSBxdWF0Lmxlbmd0aDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Mi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGxlbiA9IGxlbmd0aDtcbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSBkdWFsIHF1YXRcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGEgZHVhbCBxdWF0IHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzcXVhcmVkTGVuZ3RoID0gcXVhdC5zcXVhcmVkTGVuZ3RoO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG4vKipcbiAqIE5vcm1hbGl6ZSBhIGR1YWwgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdDJ9IG91dCB0aGUgcmVjZWl2aW5nIGR1YWwgcXVhdGVybmlvblxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIGR1YWwgcXVhdGVybmlvbiB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHtxdWF0Mn0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICB2YXIgbWFnbml0dWRlID0gc3F1YXJlZExlbmd0aChhKTtcblxuICBpZiAobWFnbml0dWRlID4gMCkge1xuICAgIG1hZ25pdHVkZSA9IE1hdGguc3FydChtYWduaXR1ZGUpO1xuICAgIHZhciBhMCA9IGFbMF0gLyBtYWduaXR1ZGU7XG4gICAgdmFyIGExID0gYVsxXSAvIG1hZ25pdHVkZTtcbiAgICB2YXIgYTIgPSBhWzJdIC8gbWFnbml0dWRlO1xuICAgIHZhciBhMyA9IGFbM10gLyBtYWduaXR1ZGU7XG4gICAgdmFyIGIwID0gYVs0XTtcbiAgICB2YXIgYjEgPSBhWzVdO1xuICAgIHZhciBiMiA9IGFbNl07XG4gICAgdmFyIGIzID0gYVs3XTtcbiAgICB2YXIgYV9kb3RfYiA9IGEwICogYjAgKyBhMSAqIGIxICsgYTIgKiBiMiArIGEzICogYjM7XG4gICAgb3V0WzBdID0gYTA7XG4gICAgb3V0WzFdID0gYTE7XG4gICAgb3V0WzJdID0gYTI7XG4gICAgb3V0WzNdID0gYTM7XG4gICAgb3V0WzRdID0gKGIwIC0gYTAgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZTtcbiAgICBvdXRbNV0gPSAoYjEgLSBhMSAqIGFfZG90X2IpIC8gbWFnbml0dWRlO1xuICAgIG91dFs2XSA9IChiMiAtIGEyICogYV9kb3RfYikgLyBtYWduaXR1ZGU7XG4gICAgb3V0WzddID0gKGIzIC0gYTMgKiBhX2RvdF9iKSAvIG1hZ25pdHVkZTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBkdWFsIHF1YXRlbmlvblxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSBkdWFsIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGR1YWwgcXVhdFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gXCJxdWF0MihcIiArIGFbMF0gKyBcIiwgXCIgKyBhWzFdICsgXCIsIFwiICsgYVsyXSArIFwiLCBcIiArIGFbM10gKyBcIiwgXCIgKyBhWzRdICsgXCIsIFwiICsgYVs1XSArIFwiLCBcIiArIGFbNl0gKyBcIiwgXCIgKyBhWzddICsgXCIpXCI7XG59XG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIGR1YWwgcXVhdGVybmlvbnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlRdWF0Mn0gYSB0aGUgZmlyc3QgZHVhbCBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBiIHRoZSBzZWNvbmQgZHVhbCBxdWF0ZXJuaW9uLlxuICogQHJldHVybnMge0Jvb2xlYW59IHRydWUgaWYgdGhlIGR1YWwgcXVhdGVybmlvbnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM10gJiYgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHVhbCBxdWF0ZXJuaW9ucyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVF1YXQyfSBhIHRoZSBmaXJzdCBkdWFsIHF1YXQuXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdDJ9IGIgdGhlIHNlY29uZCBkdWFsIHF1YXQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gdHJ1ZSBpZiB0aGUgZHVhbCBxdWF0cyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXSxcbiAgICAgIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XSxcbiAgICAgIGE2ID0gYVs2XSxcbiAgICAgIGE3ID0gYVs3XTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXSxcbiAgICAgIGI0ID0gYls0XSxcbiAgICAgIGI1ID0gYls1XSxcbiAgICAgIGI2ID0gYls2XSxcbiAgICAgIGI3ID0gYls3XTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJiBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiYgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJiBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSk7XG59IiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG4vKipcbiAqIDIgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbW9kdWxlIHZlYzJcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzJcbiAqXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xuXG4gIGlmIChnbE1hdHJpeC5BUlJBWV9UWVBFICE9IEZsb2F0MzJBcnJheSkge1xuICAgIG91dFswXSA9IDA7XG4gICAgb3V0WzFdID0gMDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMyIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IGEgbmV3IDJEIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHkpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMiB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSkge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHZlY3RvciB0byByb3VuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQWRkcyB0d28gdmVjMidzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGU7XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgeSA9IGJbMV0gLSBhWzFdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5KTtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV07XG4gIHJldHVybiBNYXRoLmh5cG90KHgsIHkpO1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV07XG4gIHZhciBsZW4gPSB4ICogeCArIHkgKiB5O1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gIH1cblxuICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcbn1cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IG11c3QgYnkgZGVmaW5pdGlvbiBwcm9kdWNlIGEgM0QgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gIHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbiAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuICB2YXIgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgb3V0WzBdID0gTWF0aC5jb3MocikgKiBzY2FsZTtcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtSZWFkb25seU1hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDIob3V0LCBhLCBtKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICAgIHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5O1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyZFxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtSZWFkb25seU1hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyZChvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0M1xuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQ0XG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcwJ1xuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bMTJdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVsxM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZSBhIDJEIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMyXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSBUaGUgdmVjMiBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIFRoZSBhbmdsZSBvZiByb3RhdGlvbiBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIGIsIHJhZCkge1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIHZhciBwMCA9IGFbMF0gLSBiWzBdLFxuICAgICAgcDEgPSBhWzFdIC0gYlsxXSxcbiAgICAgIHNpbkMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgY29zQyA9IE1hdGguY29zKHJhZCk7IC8vcGVyZm9ybSByb3RhdGlvbiBhbmQgdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblxuICBvdXRbMF0gPSBwMCAqIGNvc0MgLSBwMSAqIHNpbkMgKyBiWzBdO1xuICBvdXRbMV0gPSBwMCAqIHNpbkMgKyBwMSAqIGNvc0MgKyBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDJEIHZlY3RvcnNcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIFRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYiBUaGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcbiAgdmFyIHgxID0gYVswXSxcbiAgICAgIHkxID0gYVsxXSxcbiAgICAgIHgyID0gYlswXSxcbiAgICAgIHkyID0gYlsxXSxcbiAgICAgIC8vIG1hZyBpcyB0aGUgcHJvZHVjdCBvZiB0aGUgbWFnbml0dWRlcyBvZiBhIGFuZCBiXG4gIG1hZyA9IE1hdGguc3FydCh4MSAqIHgxICsgeTEgKiB5MSkgKiBNYXRoLnNxcnQoeDIgKiB4MiArIHkyICogeTIpLFxuICAgICAgLy8gbWFnICYmLi4gc2hvcnQgY2lyY3VpdHMgaWYgbWFnID09IDBcbiAgY29zaW5lID0gbWFnICYmICh4MSAqIHgyICsgeTEgKiB5MikgLyBtYWc7IC8vIE1hdGgubWluKE1hdGgubWF4KGNvc2luZSwgLTEpLCAxKSBjbGFtcHMgdGhlIGNvc2luZSBiZXR3ZWVuIC0xIGFuZCAxXG5cbiAgcmV0dXJuIE1hdGguYWNvcyhNYXRoLm1pbihNYXRoLm1heChjb3NpbmUsIC0xKSwgMSkpO1xufVxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyIHRvIHplcm9cbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB6ZXJvKG91dCkge1xuICBvdXRbMF0gPSAwLjA7XG4gIG91dFsxXSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMyfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiBcInZlYzIoXCIgKyBhWzBdICsgXCIsIFwiICsgYVsxXSArIFwiKVwiO1xufVxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGV4YWN0bHkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdO1xufVxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHtSZWFkb25seVZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSk7XG59XG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGxlbiA9IGxlbmd0aDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgZGl2ID0gZGl2aWRlO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGRpc3QgPSBkaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBmb3JFYWNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdmVjID0gY3JlYXRlKCk7XG4gIHJldHVybiBmdW5jdGlvbiAoYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgdmFyIGksIGw7XG5cbiAgICBpZiAoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMjtcbiAgICB9XG5cbiAgICBpZiAoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07XG4gICAgICB2ZWNbMV0gPSBhW2kgKyAxXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTtcbiAgICAgIGFbaSArIDFdID0gdmVjWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSgpOyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuLyoqXG4gKiAzIERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWMzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXG4gKlxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEFkZHMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWF4KGFbMl0sIGJbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF0gKiBzY2FsZTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV0gKiBzY2FsZTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl0gKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gYlswXSAtIGFbMF07XG4gIHZhciB5ID0gYlsxXSAtIGFbMV07XG4gIHZhciB6ID0gYlsyXSAtIGFbMl07XG4gIHJldHVybiBNYXRoLmh5cG90KHgsIHksIHopO1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF07XG4gIHZhciB5ID0gYVsxXTtcbiAgdmFyIHogPSBhWzJdO1xuICB2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6O1xuXG4gIGlmIChsZW4gPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gIH1cblxuICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgICBheSA9IGFbMV0sXG4gICAgICBheiA9IGFbMl07XG4gIHZhciBieCA9IGJbMF0sXG4gICAgICBieSA9IGJbMV0sXG4gICAgICBieiA9IGJbMl07XG4gIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgdmFyIGF4ID0gYVswXTtcbiAgdmFyIGF5ID0gYVsxXTtcbiAgdmFyIGF6ID0gYVsyXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUGVyZm9ybXMgYSBoZXJtaXRlIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICB2YXIgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIHZhciBmYWN0b3IxID0gZmFjdG9yVGltZXMyICogKDIgKiB0IC0gMykgKyAxO1xuICB2YXIgZmFjdG9yMiA9IGZhY3RvclRpbWVzMiAqICh0IC0gMikgKyB0O1xuICB2YXIgZmFjdG9yMyA9IGZhY3RvclRpbWVzMiAqICh0IC0gMSk7XG4gIHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogKDMgLSAyICogdCk7XG4gIG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0O1xuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcbiAgb3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjQ7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFBlcmZvcm1zIGEgYmV6aWVyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIHZhciBpbnZlcnNlRmFjdG9yID0gMSAtIHQ7XG4gIHZhciBpbnZlcnNlRmFjdG9yVGltZXNUd28gPSBpbnZlcnNlRmFjdG9yICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvclRpbWVzMiA9IHQgKiB0O1xuICB2YXIgZmFjdG9yMSA9IGludmVyc2VGYWN0b3JUaW1lc1R3byAqIGludmVyc2VGYWN0b3I7XG4gIHZhciBmYWN0b3IyID0gMyAqIHQgKiBpbnZlcnNlRmFjdG9yVGltZXNUd287XG4gIHZhciBmYWN0b3IzID0gMyAqIGZhY3RvclRpbWVzMiAqIGludmVyc2VGYWN0b3I7XG4gIHZhciBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogdDtcbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG4gIHZhciByID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICB2YXIgeiA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wIC0gMS4wO1xuICB2YXIgelNjYWxlID0gTWF0aC5zcXJ0KDEuMCAtIHogKiB6KSAqIHNjYWxlO1xuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZTtcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XG4gIG91dFsyXSA9IHogKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC5cbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTtcbiAgdmFyIHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gIHcgPSB3IHx8IDEuMDtcbiAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XG4gIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xuICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge1JlYWRvbmx5TWF0M30gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBxdWF0XG4gKiBDYW4gYWxzbyBiZSB1c2VkIGZvciBkdWFsIHF1YXRlcm5pb25zLiAoTXVsdGlwbHkgaXQgd2l0aCB0aGUgcmVhbCBwYXJ0KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtSZWFkb25seVF1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcbiAgdmFyIHF4ID0gcVswXSxcbiAgICAgIHF5ID0gcVsxXSxcbiAgICAgIHF6ID0gcVsyXSxcbiAgICAgIHF3ID0gcVszXTtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTsgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XG4gIC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xuXG4gIHZhciB1dnggPSBxeSAqIHogLSBxeiAqIHksXG4gICAgICB1dnkgPSBxeiAqIHggLSBxeCAqIHosXG4gICAgICB1dnogPSBxeCAqIHkgLSBxeSAqIHg7IC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XG5cbiAgdmFyIHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5LFxuICAgICAgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXG4gICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDsgLy8gdmVjMy5zY2FsZSh1diwgdXYsIDIgKiB3KTtcblxuICB2YXIgdzIgPSBxdyAqIDI7XG4gIHV2eCAqPSB3MjtcbiAgdXZ5ICo9IHcyO1xuICB1dnogKj0gdzI7IC8vIHZlYzMuc2NhbGUodXV2LCB1dXYsIDIpO1xuXG4gIHV1dnggKj0gMjtcbiAgdXV2eSAqPSAyO1xuICB1dXZ6ICo9IDI7IC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xuXG4gIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHgtYXhpc1xuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIFRoZSBhbmdsZSBvZiByb3RhdGlvbiBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCBiLCByYWQpIHtcbiAgdmFyIHAgPSBbXSxcbiAgICAgIHIgPSBbXTsgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBwWzJdID0gYVsyXSAtIGJbMl07IC8vcGVyZm9ybSByb3RhdGlvblxuXG4gIHJbMF0gPSBwWzBdO1xuICByWzFdID0gcFsxXSAqIE1hdGguY29zKHJhZCkgLSBwWzJdICogTWF0aC5zaW4ocmFkKTtcbiAgclsyXSA9IHBbMV0gKiBNYXRoLnNpbihyYWQpICsgcFsyXSAqIE1hdGguY29zKHJhZCk7IC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXNcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCBUaGUgYW5nbGUgb2Ygcm90YXRpb24gaW4gcmFkaWFuc1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgYiwgcmFkKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFsyXSAqIE1hdGguc2luKHJhZCkgKyBwWzBdICogTWF0aC5jb3MocmFkKTtcbiAgclsxXSA9IHBbMV07XG4gIHJbMl0gPSBwWzJdICogTWF0aC5jb3MocmFkKSAtIHBbMF0gKiBNYXRoLnNpbihyYWQpOyAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG5cbiAgb3V0WzBdID0gclswXSArIGJbMF07XG4gIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uIGluIHJhZGlhbnNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIGIsIHJhZCkge1xuICB2YXIgcCA9IFtdLFxuICAgICAgciA9IFtdOyAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTsgLy9wZXJmb3JtIHJvdGF0aW9uXG5cbiAgclswXSA9IHBbMF0gKiBNYXRoLmNvcyhyYWQpIC0gcFsxXSAqIE1hdGguc2luKHJhZCk7XG4gIHJbMV0gPSBwWzBdICogTWF0aC5zaW4ocmFkKSArIHBbMV0gKiBNYXRoLmNvcyhyYWQpO1xuICByWzJdID0gcFsyXTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9yc1xuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICB2YXIgYXggPSBhWzBdLFxuICAgICAgYXkgPSBhWzFdLFxuICAgICAgYXogPSBhWzJdLFxuICAgICAgYnggPSBiWzBdLFxuICAgICAgYnkgPSBiWzFdLFxuICAgICAgYnogPSBiWzJdLFxuICAgICAgbWFnMSA9IE1hdGguc3FydChheCAqIGF4ICsgYXkgKiBheSArIGF6ICogYXopLFxuICAgICAgbWFnMiA9IE1hdGguc3FydChieCAqIGJ4ICsgYnkgKiBieSArIGJ6ICogYnopLFxuICAgICAgbWFnID0gbWFnMSAqIG1hZzIsXG4gICAgICBjb3NpbmUgPSBtYWcgJiYgZG90KGEsIGIpIC8gbWFnO1xuICByZXR1cm4gTWF0aC5hY29zKE1hdGgubWluKE1hdGgubWF4KGNvc2luZSwgLTEpLCAxKSk7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gemVyb1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm8ob3V0KSB7XG4gIG91dFswXSA9IDAuMDtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gXCJ2ZWMzKFwiICsgYVswXSArIFwiLCBcIiArIGFbMV0gKyBcIiwgXCIgKyBhWzJdICsgXCIpXCI7XG59XG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXTtcbn1cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl07XG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl07XG4gIHJldHVybiBNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKTtcbn1cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgZGl2ID0gZGl2aWRlO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGRpc3QgPSBkaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgbGVuID0gbGVuZ3RoO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGZvckVhY2ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB2ZWMgPSBjcmVhdGUoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICB2YXIgaSwgbDtcblxuICAgIGlmICghc3RyaWRlKSB7XG4gICAgICBzdHJpZGUgPSAzO1xuICAgIH1cblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmIChjb3VudCkge1xuICAgICAgbCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTtcbiAgICAgIHZlY1sxXSA9IGFbaSArIDFdO1xuICAgICAgdmVjWzJdID0gYVtpICsgMl07XG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgIGFbaV0gPSB2ZWNbMF07XG4gICAgICBhW2kgKyAxXSA9IHZlY1sxXTtcbiAgICAgIGFbaSArIDJdID0gdmVjWzJdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSgpOyIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuLyoqXG4gKiA0IERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWM0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XG4gKlxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzQgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6LCB3KSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgb3V0WzNdID0gdztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzQgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeiwgdykge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICBvdXRbM10gPSB3O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gIG91dFszXSA9IGFbM10gKiBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gIG91dFszXSA9IGFbM10gLyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHZlY3RvciB0byBjZWlsXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XG4gIG91dFszXSA9IE1hdGguY2VpbChhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLmZsb29yKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIG91dFszXSA9IE1hdGgubWluKGFbM10sIGJbM10pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gIG91dFszXSA9IE1hdGgubWF4KGFbM10sIGJbM10pO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XG4gIG91dFszXSA9IE1hdGgucm91bmQoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdICogc2NhbGU7XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdICogc2NhbGU7XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdICogc2NhbGU7XG4gIG91dFszXSA9IGFbM10gKyBiWzNdICogc2NhbGU7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICB2YXIgdyA9IGJbM10gLSBhWzNdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5LCB6LCB3KTtcbn1cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXTtcbiAgdmFyIHkgPSBiWzFdIC0gYVsxXTtcbiAgdmFyIHogPSBiWzJdIC0gYVsyXTtcbiAgdmFyIHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHZhciB3ID0gYVszXTtcbiAgcmV0dXJuIE1hdGguaHlwb3QoeCwgeSwgeiwgdyk7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHZhciB3ID0gYVszXTtcbiAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xufVxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgb3V0WzNdID0gLWFbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgb3V0WzNdID0gMS4wIC8gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgdmFyIHggPSBhWzBdO1xuICB2YXIgeSA9IGFbMV07XG4gIHZhciB6ID0gYVsyXTtcbiAgdmFyIHcgPSBhWzNdO1xuICB2YXIgbGVuID0geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHc7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gIH1cblxuICBvdXRbMF0gPSB4ICogbGVuO1xuICBvdXRbMV0gPSB5ICogbGVuO1xuICBvdXRbMl0gPSB6ICogbGVuO1xuICBvdXRbM10gPSB3ICogbGVuO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdICsgYVszXSAqIGJbM107XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGNyb3NzLXByb2R1Y3Qgb2YgdGhyZWUgdmVjdG9ycyBpbiBhIDQtZGltZW5zaW9uYWwgc3BhY2VcbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gcmVzdWx0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gVSB0aGUgZmlyc3QgdmVjdG9yXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gViB0aGUgc2Vjb25kIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IFcgdGhlIHRoaXJkIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IHJlc3VsdFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIHUsIHYsIHcpIHtcbiAgdmFyIEEgPSB2WzBdICogd1sxXSAtIHZbMV0gKiB3WzBdLFxuICAgICAgQiA9IHZbMF0gKiB3WzJdIC0gdlsyXSAqIHdbMF0sXG4gICAgICBDID0gdlswXSAqIHdbM10gLSB2WzNdICogd1swXSxcbiAgICAgIEQgPSB2WzFdICogd1syXSAtIHZbMl0gKiB3WzFdLFxuICAgICAgRSA9IHZbMV0gKiB3WzNdIC0gdlszXSAqIHdbMV0sXG4gICAgICBGID0gdlsyXSAqIHdbM10gLSB2WzNdICogd1syXTtcbiAgdmFyIEcgPSB1WzBdO1xuICB2YXIgSCA9IHVbMV07XG4gIHZhciBJID0gdVsyXTtcbiAgdmFyIEogPSB1WzNdO1xuICBvdXRbMF0gPSBIICogRiAtIEkgKiBFICsgSiAqIEQ7XG4gIG91dFsxXSA9IC0oRyAqIEYpICsgSSAqIEMgLSBKICogQjtcbiAgb3V0WzJdID0gRyAqIEUgLSBIICogQyArIEogKiBBO1xuICBvdXRbM10gPSAtKEcgKiBEKSArIEggKiBCIC0gSSAqIEE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgdmFyIGF4ID0gYVswXTtcbiAgdmFyIGF5ID0gYVsxXTtcbiAgdmFyIGF6ID0gYVsyXTtcbiAgdmFyIGF3ID0gYVszXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgb3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdyk7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wOyAvLyBNYXJzYWdsaWEsIEdlb3JnZS4gQ2hvb3NpbmcgYSBQb2ludCBmcm9tIHRoZSBTdXJmYWNlIG9mIGFcbiAgLy8gU3BoZXJlLiBBbm4uIE1hdGguIFN0YXRpc3QuIDQzICgxOTcyKSwgbm8uIDIsIDY0NS0tNjQ2LlxuICAvLyBodHRwOi8vcHJvamVjdGV1Y2xpZC5vcmcvZXVjbGlkLmFvbXMvMTE3NzY5MjY0NDtcblxuICB2YXIgdjEsIHYyLCB2MywgdjQ7XG4gIHZhciBzMSwgczI7XG5cbiAgZG8ge1xuICAgIHYxID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICB2MiA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgczEgPSB2MSAqIHYxICsgdjIgKiB2MjtcbiAgfSB3aGlsZSAoczEgPj0gMSk7XG5cbiAgZG8ge1xuICAgIHYzID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICB2NCA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgczIgPSB2MyAqIHYzICsgdjQgKiB2NDtcbiAgfSB3aGlsZSAoczIgPj0gMSk7XG5cbiAgdmFyIGQgPSBNYXRoLnNxcnQoKDEgLSBzMSkgLyBzMik7XG4gIG91dFswXSA9IHNjYWxlICogdjE7XG4gIG91dFsxXSA9IHNjYWxlICogdjI7XG4gIG91dFsyXSA9IHNjYWxlICogdjMgKiBkO1xuICBvdXRbM10gPSBzY2FsZSAqIHY0ICogZDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgbWF0NC5cbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7UmVhZG9ubHlNYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdLFxuICAgICAgdyA9IGFbM107XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdICogdztcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bOV0gKiB6ICsgbVsxM10gKiB3O1xuICBvdXRbMl0gPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0gKiB3O1xuICBvdXRbM10gPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV0gKiB3O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge1JlYWRvbmx5UXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICAgIHkgPSBhWzFdLFxuICAgICAgeiA9IGFbMl07XG4gIHZhciBxeCA9IHFbMF0sXG4gICAgICBxeSA9IHFbMV0sXG4gICAgICBxeiA9IHFbMl0sXG4gICAgICBxdyA9IHFbM107IC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG5cbiAgdmFyIGl4ID0gcXcgKiB4ICsgcXkgKiB6IC0gcXogKiB5O1xuICB2YXIgaXkgPSBxdyAqIHkgKyBxeiAqIHggLSBxeCAqIHo7XG4gIHZhciBpeiA9IHF3ICogeiArIHF4ICogeSAtIHF5ICogeDtcbiAgdmFyIGl3ID0gLXF4ICogeCAtIHF5ICogeSAtIHF6ICogejsgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuXG4gIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7XG4gIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7XG4gIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gemVyb1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHplcm8ob3V0KSB7XG4gIG91dFswXSA9IDAuMDtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIG91dFszXSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiBcInZlYzQoXCIgKyBhWzBdICsgXCIsIFwiICsgYVsxXSArIFwiLCBcIiArIGFbMl0gKyBcIiwgXCIgKyBhWzNdICsgXCIpXCI7XG59XG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7UmVhZG9ubHlWZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdO1xufVxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlYWRvbmx5VmVjNH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHtSZWFkb25seVZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKTtcbn1cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgZGl2ID0gZGl2aWRlO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGRpc3QgPSBkaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgbGVuID0gbGVuZ3RoO1xuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5cbmV4cG9ydCB2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcbi8qKlxuICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzRzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzQuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBOdW1iZXIgb2YgZWxlbWVudHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheVxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWM0cyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheVxuICogQHBhcmFtIHtPYmplY3R9IFthcmddIGFkZGl0aW9uYWwgYXJndW1lbnQgdG8gcGFzcyB0byBmblxuICogQHJldHVybnMge0FycmF5fSBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuXG5leHBvcnQgdmFyIGZvckVhY2ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB2ZWMgPSBjcmVhdGUoKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICB2YXIgaSwgbDtcblxuICAgIGlmICghc3RyaWRlKSB7XG4gICAgICBzdHJpZGUgPSA0O1xuICAgIH1cblxuICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIGlmIChjb3VudCkge1xuICAgICAgbCA9IE1hdGgubWluKGNvdW50ICogc3RyaWRlICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkge1xuICAgICAgdmVjWzBdID0gYVtpXTtcbiAgICAgIHZlY1sxXSA9IGFbaSArIDFdO1xuICAgICAgdmVjWzJdID0gYVtpICsgMl07XG4gICAgICB2ZWNbM10gPSBhW2kgKyAzXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTtcbiAgICAgIGFbaSArIDFdID0gdmVjWzFdO1xuICAgICAgYVtpICsgMl0gPSB2ZWNbMl07XG4gICAgICBhW2kgKyAzXSA9IHZlY1szXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0oKTsiLCJpbXBvcnQgeyBDb2xvciB9IGZyb20gXCIuLi9saWIvY29sb3IvY29sb3IuanNcIlxyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSBcIi4uL2xpYi9nbC1tYXRyaXgvaW5kZXguanNcIlxyXG5cclxuY2xhc3MgTWVzaCB7XHJcbiAgdmVydGljZXMgPSBbXVxyXG4gIGluZGljZXMgPSBbXVxyXG4gIHV2cyA9IFtdXHJcbiAgY29sb3JzID0gW11cclxuICBub3JtYWxzID0gW11cclxuXHJcbiAgZ2xWYW8gPSBudWxsXHJcbiAgZ2xWYm8gPSB7XHJcbiAgICBwb3M6IG51bGwsXHJcbiAgICB1djogbnVsbCxcclxuICAgIG5vcm1hbDogbnVsbCxcclxuICB9XHJcblxyXG4gIHNoYWRlciA9IG51bGxcclxuXHJcbiAgI3ZhbGlkID0gZmFsc2VcclxuXHJcbiAgZ2V0IHZhbGlkICgpIHtcclxuICAgIHJldHVybiB0aGlzLiN2YWxpZCAmJiB0aGlzLnNoYWRlclxyXG4gIH1cclxuXHJcbiAgZ2V0IHZlcnRleENvdW50ICgpIHtcclxuICAgIHJldHVybiB0aGlzLnZlcnRpY2VzLmxlbmd0aCAvIDNcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChhcHApIHtcclxuICAgIHRoaXMuYXBwID0gYXBwXHJcbiAgfVxyXG5cclxuICBkZWxldGVSZXNvdXJjZUZyb21HTCAoKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgaWYgKCFnbCkgcmV0dXJuXHJcblxyXG4gICAgZm9yIChsZXQgbiBpbiB0aGlzLmdsVmJvKSB7XHJcbiAgICAgIGNvbnN0IHZibyA9IHRoaXMuZ2xWYm9bbl1cclxuICAgICAgaWYgKGdsLmlzQnVmZmVyKHZibykpIHtcclxuICAgICAgICBnbC5kZWxldGVCdWZmZXIodmJvKVxyXG4gICAgICAgIHRoaXMuZ2xWYm9bbl0gPSBudWxsXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihnbC5pc1ZlcnRleEFycmF5KHRoaXMuZ2xWYW8pKSB7XHJcbiAgICAgIGdsLmRlbGV0ZVZlcnRleEFycmF5KHRoaXMuZ2xWYW8pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjcmVhdGVSZXNvdXJjZUZyb21HTCAoKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgaWYgKCFnbCkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5nbFZiby5wb3MgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZ2xWYm8ucG9zKVxyXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodGhpcy52ZXJ0aWNlcyksIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuICAgIHRoaXMuZ2xWYm8udXYgPSBnbC5jcmVhdGVCdWZmZXIoKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZ2xWYm8udXYpXHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh0aGlzLnV2cyksIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuICAgIHRoaXMuZ2xWYm8ubm9ybWFsID0gZ2wuY3JlYXRlQnVmZmVyKClcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmdsVmJvLm5vcm1hbClcclxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHRoaXMubm9ybWFscyksIGdsLlNUQVRJQ19EUkFXKVxyXG5cclxuICAgIHRoaXMuZ2xWYW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpXHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy5nbFZhbylcclxuXHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgwKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuZ2xWYm8ucG9zKVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigwLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMSlcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmdsVmJvLnV2KVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigxLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMilcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmdsVmJvLm5vcm1hbClcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoMiwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKVxyXG5cclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKVxyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpXHJcbiAgfVxyXG5cclxuICBzeW5jV2l0aEdMICgpIHtcclxuICAgIHRoaXMuI3ZhbGlkID0gZmFsc2VcclxuICAgIHRoaXMuZGVsZXRlUmVzb3VyY2VGcm9tR0woKVxyXG4gICAgdGhpcy5jcmVhdGVSZXNvdXJjZUZyb21HTCgpXHJcbiAgICB0aGlzLiN2YWxpZCA9IHRydWVcclxuICB9XHJcblxyXG4gIHJlbGVhc2UgKCkge1xyXG4gICAgdGhpcy5kZWxldGVSZXNvdXJjZUZyb21HTCgpXHJcbiAgfVxyXG5cclxuICBjYWxjTm9ybWFscyAoKSB7XHJcbiAgICBjb25zdCB2ZXJ0Q291bnQgPSB0aGlzLnZlcnRpY2VzLmxlbmd0aCAvIDMuMFxyXG4gICAgZm9yIChsZXQgaT0wOyBpPHZlcnRDb3VudDsgaSs9Mykge1xyXG4gICAgICBjb25zdCBpMSA9IChpKSozXHJcbiAgICAgIGNvbnN0IGkyID0gKGkrMSkqM1xyXG4gICAgICBjb25zdCBpMyA9IChpKzIpKjNcclxuICAgICAgY29uc3QgYSA9IFtcclxuICAgICAgICB0aGlzLnZlcnRpY2VzW2kyXS10aGlzLnZlcnRpY2VzW2kxXSxcclxuICAgICAgICB0aGlzLnZlcnRpY2VzW2kyKzFdLXRoaXMudmVydGljZXNbaTErMV0sXHJcbiAgICAgICAgdGhpcy52ZXJ0aWNlc1tpMisyXS10aGlzLnZlcnRpY2VzW2kxKzJdLFxyXG4gICAgICBdXHJcbiAgICAgIGNvbnN0IGIgPSBbXHJcbiAgICAgICAgdGhpcy52ZXJ0aWNlc1tpM10tdGhpcy52ZXJ0aWNlc1tpMV0sXHJcbiAgICAgICAgdGhpcy52ZXJ0aWNlc1tpMysxXS10aGlzLnZlcnRpY2VzW2kxKzFdLFxyXG4gICAgICAgIHRoaXMudmVydGljZXNbaTMrMl0tdGhpcy52ZXJ0aWNlc1tpMSsyXSxcclxuICAgICAgXVxyXG4gICAgICBjb25zdCBjcm9zcyA9IHZlYzMuY3Jvc3ModmVjMy5jcmVhdGUoKSwgYSwgYilcclxuICAgICAgdmVjMy5ub3JtYWxpemUoY3Jvc3MsIGNyb3NzKVxyXG4gICAgICB0aGlzLm5vcm1hbHMucHVzaCguLi5jcm9zcylcclxuICAgICAgdGhpcy5ub3JtYWxzLnB1c2goLi4uY3Jvc3MpXHJcbiAgICAgIHRoaXMubm9ybWFscy5wdXNoKC4uLmNyb3NzKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgVHJpYW5nbGUzRE1lc2ggZXh0ZW5kcyBNZXNoIHtcclxuICBvcmlnaW5WZXJ0aWNlcyA9IFtcclxuICAgIDAuMCwgMC4wLCAwLjAsXHJcbiAgICAxLjAsIDAuMCwgMC4wLFxyXG4gICAgMi4wLCAwLjAsIDAuMCxcclxuICAgIDAuNSwgMS4wLCAwLjAsXHJcbiAgICAxLjUsIDEuMCwgMC4wLFxyXG4gICAgMS4wLCAyLjAsIDAuMCxcclxuXHJcbiAgICAwLjAsIDAuMCwgLTIuMCxcclxuICAgIDEuMCwgMC4wLCAtMi4wLFxyXG4gICAgMi4wLCAwLjAsIC0yLjAsXHJcbiAgICAwLjUsIDEuMCwgLTIuMCxcclxuICAgIDEuNSwgMS4wLCAtMi4wLFxyXG4gICAgMS4wLCAyLjAsIC0yLjAsXHJcbiAgXVxyXG5cclxuICBjb25zdHJ1Y3RvciAoYXBwKSB7XHJcbiAgICBzdXBlcihhcHApXHJcblxyXG4gICAgdGhpcy5pbmRpY2VzID0gW1xyXG4gICAgICAwLCAxLCAzLFxyXG4gICAgICAxLCA0LCAzLFxyXG4gICAgICAxLCAyLCA0LFxyXG4gICAgICAzLCA0LCA1LFxyXG4gIFxyXG4gICAgICA2LCA5LCA3LFxyXG4gICAgICA3LCA5LCAxMCxcclxuICAgICAgNywgMTAsIDgsXHJcbiAgICAgIDksIDExLCAxMCxcclxuICBcclxuICAgICAgMCwgMywgNixcclxuICAgICAgMywgOSwgNixcclxuICAgICAgMywgNSwgOSxcclxuICAgICAgNSwgMTEsIDksXHJcbiAgXHJcbiAgICAgIDIsIDgsIDQsXHJcbiAgICAgIDQsIDgsIDEwLFxyXG4gICAgICA0LCAxMCwgNSxcclxuICAgICAgNSwgMTAsIDExLFxyXG4gIFxyXG4gICAgICAwLCA2LCA4LFxyXG4gICAgICA4LCAyLCAwLFxyXG4gICAgXVxyXG5cclxuICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLmluZGljZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgY29uc3QgYSA9IHRoaXMuaW5kaWNlc1tpXVxyXG4gICAgICB0aGlzLnZlcnRpY2VzLnB1c2godGhpcy5vcmlnaW5WZXJ0aWNlc1thKjNdLCB0aGlzLm9yaWdpblZlcnRpY2VzW2EqMysxXSwgdGhpcy5vcmlnaW5WZXJ0aWNlc1thKjMrMl0pXHJcblxyXG4gICAgICBpZiAoaSA+PSAyNCkge1xyXG4gICAgICAgIHRoaXMudXZzLnB1c2godGhpcy5vcmlnaW5WZXJ0aWNlc1thKjMrMl0sIHRoaXMub3JpZ2luVmVydGljZXNbYSozKzFdKVxyXG4gICAgICAgIHRoaXMuY29sb3JzLnB1c2godGhpcy5vcmlnaW5WZXJ0aWNlc1thKjMrMl0sIHRoaXMub3JpZ2luVmVydGljZXNbYSozKzFdKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudXZzLnB1c2godGhpcy5vcmlnaW5WZXJ0aWNlc1thKjNdLCB0aGlzLm9yaWdpblZlcnRpY2VzW2EqMysxXSlcclxuICAgICAgICB0aGlzLmNvbG9ycy5wdXNoKHRoaXMub3JpZ2luVmVydGljZXNbYSozXSwgdGhpcy5vcmlnaW5WZXJ0aWNlc1thKjMrMV0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpPTA7IGk8dGhpcy5pbmRpY2VzLmxlbmd0aDsgaSs9Mykge1xyXG4gICAgICBjb25zdCBhID0gdGhpcy5pbmRpY2VzW2ldXHJcbiAgICAgIGNvbnN0IGIgPSB0aGlzLmluZGljZXNbaSsxXVxyXG4gICAgICBjb25zdCBjID0gdGhpcy5pbmRpY2VzW2krMl1cclxuXHJcbiAgICAgIGNvbnN0IHYxID0gW1xyXG4gICAgICAgIHRoaXMub3JpZ2luVmVydGljZXNbYSozXSAtIHRoaXMub3JpZ2luVmVydGljZXNbYiozXSxcclxuICAgICAgICB0aGlzLm9yaWdpblZlcnRpY2VzW2EqMysxXSAtIHRoaXMub3JpZ2luVmVydGljZXNbYiozKzFdLFxyXG4gICAgICAgIHRoaXMub3JpZ2luVmVydGljZXNbYSozKzJdIC0gdGhpcy5vcmlnaW5WZXJ0aWNlc1tiKjMrMl0sXHJcbiAgICAgIF1cclxuICAgICAgY29uc3QgdjIgPSBbXHJcbiAgICAgICAgdGhpcy5vcmlnaW5WZXJ0aWNlc1thKjNdIC0gdGhpcy5vcmlnaW5WZXJ0aWNlc1tjKjNdLFxyXG4gICAgICAgIHRoaXMub3JpZ2luVmVydGljZXNbYSozKzFdIC0gdGhpcy5vcmlnaW5WZXJ0aWNlc1tjKjMrMV0sXHJcbiAgICAgICAgdGhpcy5vcmlnaW5WZXJ0aWNlc1thKjMrMl0gLSB0aGlzLm9yaWdpblZlcnRpY2VzW2MqMysyXSxcclxuICAgICAgXVxyXG4gICAgICBjb25zdCBjcm9zcyA9IFtcclxuICAgICAgICB2MVsxXSp2MlsyXSAtIHYxWzJdKnYyWzFdLFxyXG4gICAgICAgIHYxWzJdKnYyWzBdIC0gdjFbMF0qdjJbMl0sXHJcbiAgICAgICAgdjFbMF0qdjJbMV0gLSB2MVsxXSp2MlswXSxcclxuICAgICAgXVxyXG5cclxuICAgICAgdGhpcy5ub3JtYWxzLnB1c2goLi4uY3Jvc3MpXHJcbiAgICAgIHRoaXMubm9ybWFscy5wdXNoKC4uLmNyb3NzKVxyXG4gICAgICB0aGlzLm5vcm1hbHMucHVzaCguLi5jcm9zcylcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN5bmNXaXRoR0woKVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGxhbmVNZXNoIGV4dGVuZHMgTWVzaCB7XHJcblxyXG4gICNzaXplID0gWzEsIDFdXHJcbiAgI3VuaXRTaXplID0gWzEwLCAxMF1cclxuICAjY29sb3IgPSBbMC41LCAwLjUsIDEuMF1cclxuXHJcbiAgY29uc3RydWN0b3IgKGFwcCkge1xyXG4gICAgc3VwZXIoYXBwKVxyXG4gICAgdGhpcy51cGRhdGVWZXJ0RGF0YSgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVWZXJ0RGF0YSAoKSB7XHJcbiAgICB0aGlzLmNsZWFyVmVydERhdGEoKVxyXG4gICAgdGhpcy5nZW5lcmF0ZVZlcnREYXRhKClcclxuICAgIHRoaXMuc3luY1dpdGhHTCgpXHJcbiAgfVxyXG5cclxuICBjbGVhclZlcnREYXRhICgpIHtcclxuICAgIHRoaXMudmVydGljZXMgPSBbXVxyXG4gICAgdGhpcy5pbmRpY2VzID0gW11cclxuICAgIHRoaXMudXZzID0gW11cclxuICAgIHRoaXMuY29sb3JzID0gW11cclxuICAgIHRoaXMubm9ybWFscyA9IFtdXHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZVZlcnREYXRhICgpIHtcclxuICAgIGNvbnN0IG9yaWdpbiA9IFstdGhpcy4jdW5pdFNpemVbMF0qdGhpcy4jc2l6ZVswXS8yLjAsIC10aGlzLiN1bml0U2l6ZVsxXSp0aGlzLiNzaXplWzBdLzIuMF1cclxuICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLiNzaXplWzBdOyArK2kpIHtcclxuICAgICAgZm9yIChsZXQgaj0wOyBqPHRoaXMuI3NpemVbMV07ICsraikge1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IFtcclxuICAgICAgICAgIG9yaWdpblswXSArIGkgKiB0aGlzLiN1bml0U2l6ZVswXSxcclxuICAgICAgICAgIG9yaWdpblsxXSArIGogKiB0aGlzLiN1bml0U2l6ZVsxXSxcclxuICAgICAgICBdXHJcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVNxdWFyZShvZmZzZXQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY2FsY05vcm1hbHMoKVxyXG4gIH1cclxuXHJcbiAgZ2VuZXJhdGVTcXVhcmUgKG9mZnNldCkge1xyXG4gICAgY29uc3QgeCA9IG9mZnNldFswXVxyXG4gICAgY29uc3QgeiA9IG9mZnNldFsxXVxyXG4gICAgY29uc3QgdyA9IHRoaXMuI3VuaXRTaXplWzBdXHJcbiAgICBjb25zdCBoID0gdGhpcy4jdW5pdFNpemVbMV1cclxuICAgIGNvbnN0IHN3ID0gdyAqIHRoaXMuI3NpemVbMF1cclxuICAgIGNvbnN0IHNoID0gdyAqIHRoaXMuI3NpemVbMV1cclxuICAgIGNvbnN0IHV2T2Zmc2V0ID0gWzAuNSwgMC41XVxyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHgsIDAuMCwgeilcclxuICAgIHRoaXMudXZzLnB1c2goeCAvIHN3ICsgdXZPZmZzZXRbMF0sIHogLyBzaCArIHV2T2Zmc2V0WzFdKVxyXG4gICAgdGhpcy5jb2xvcnMucHVzaCguLi50aGlzLiNjb2xvcilcclxuICAgIHRoaXMudmVydGljZXMucHVzaCh4ICsgdywgMC4wLCB6KVxyXG4gICAgdGhpcy51dnMucHVzaCgoeCArIHcpIC8gc3cgKyB1dk9mZnNldFswXSwgeiAvIHNoICsgdXZPZmZzZXRbMV0pXHJcbiAgICB0aGlzLmNvbG9ycy5wdXNoKC4uLnRoaXMuI2NvbG9yKVxyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHgsIDAuMCwgeiArIGgpXHJcbiAgICB0aGlzLnV2cy5wdXNoKHggLyBzdyArIHV2T2Zmc2V0WzBdLCAoeiArIGgpIC8gc2ggKyB1dk9mZnNldFsxXSlcclxuICAgIHRoaXMuY29sb3JzLnB1c2goLi4udGhpcy4jY29sb3IpXHJcblxyXG4gICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHggKyB3LCAwLjAsIHopXHJcbiAgICB0aGlzLnV2cy5wdXNoKCh4ICsgdykgLyBzdyArIHV2T2Zmc2V0WzBdLCB6IC8gc2ggKyB1dk9mZnNldFsxXSlcclxuICAgIHRoaXMuY29sb3JzLnB1c2goLi4udGhpcy4jY29sb3IpXHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2goeCArIHcsIDAuMCwgeiArIGgpXHJcbiAgICB0aGlzLnV2cy5wdXNoKCh4ICsgdykgLyBzdyArIHV2T2Zmc2V0WzBdLCAoeiArIGgpIC8gc2ggKyB1dk9mZnNldFsxXSlcclxuICAgIHRoaXMuY29sb3JzLnB1c2goLi4udGhpcy4jY29sb3IpXHJcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2goeCwgMC4wLCB6ICsgaClcclxuICAgIHRoaXMudXZzLnB1c2goeCAvIHN3ICsgdXZPZmZzZXRbMF0sICh6ICsgaCkgLyBzaCArIHV2T2Zmc2V0WzFdKVxyXG4gICAgdGhpcy5jb2xvcnMucHVzaCguLi50aGlzLiNjb2xvcilcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFNwaGVyZU1lc2ggZXh0ZW5kcyBNZXNoIHtcclxuXHJcbiAgI2RpdmlzaW9ucyA9IDEwXHJcbiAgI2NvbG9yID0gWzAuNSwgMC41LCAxLjBdXHJcbiAgI2ZsYXQgPSBmYWxzZVxyXG5cclxuICBjb25zdHJ1Y3RvciAoYXBwLCBvcHRpb25zKSB7XHJcbiAgICBzdXBlcihhcHApXHJcbiAgICBpZiAob3B0aW9ucykge1xyXG4gICAgICB0aGlzLiNkaXZpc2lvbnMgPSBvcHRpb25zLmRpdmlzaW9ucyA/PyB0aGlzLiNkaXZpc2lvbnNcclxuICAgICAgdGhpcy4jY29sb3IgPSBvcHRpb25zLmNvbG9yID8/IHRoaXMuI2NvbG9yXHJcbiAgICAgIHRoaXMuI2ZsYXQgPSBvcHRpb25zLmZsYXQgPz8gdGhpcy4jZmxhdFxyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVWZXJ0RGF0YSgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVWZXJ0RGF0YSAoKSB7XHJcbiAgICB0aGlzLmNsZWFyVmVydERhdGEoKVxyXG4gICAgdGhpcy5nZW5lcmF0ZVZlcnREYXRhKClcclxuICAgIHRoaXMuc3luY1dpdGhHTCgpXHJcbiAgfVxyXG5cclxuICBjbGVhclZlcnREYXRhICgpIHtcclxuICAgIHRoaXMudmVydGljZXMgPSBbXVxyXG4gICAgdGhpcy5pbmRpY2VzID0gW11cclxuICAgIHRoaXMudXZzID0gW11cclxuICAgIHRoaXMuY29sb3JzID0gW11cclxuICAgIHRoaXMubm9ybWFscyA9IFtdXHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZVZlcnREYXRhICgpIHtcclxuICAgIGNvbnN0IGxhdGl0dWRlQmFuZHMgPSB0aGlzLiNkaXZpc2lvbnNcclxuICAgIGNvbnN0IGxvbmdpdHVkZUJhbmRzID0gdGhpcy4jZGl2aXNpb25zXHJcblxyXG4gICAgY29uc3QgcmF3VmVydGljZXMgPSBbXVxyXG4gICAgY29uc3QgcmF3VVZzID0gW11cclxuICAgIGNvbnN0IHJhd0NvbG9ycyA9IFtdXHJcbiAgICBjb25zdCByYXdOb3JhbWxzID0gW11cclxuXHJcbiAgICBmb3IgKGxldCBsYXROdW1iZXI9MDsgbGF0TnVtYmVyIDw9IGxhdGl0dWRlQmFuZHM7ICsrbGF0TnVtYmVyKSB7XHJcbiAgICAgIGNvbnN0IHRoZXRhID0gbGF0TnVtYmVyICogTWF0aC5QSSAvIGxhdGl0dWRlQmFuZHNcclxuICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSlcclxuICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSlcclxuICAgICAgZm9yIChsZXQgbG9uZ051bWJlcj0wOyBsb25nTnVtYmVyIDw9IGxvbmdpdHVkZUJhbmRzOyArK2xvbmdOdW1iZXIpIHtcclxuICAgICAgICBjb25zdCBwaGkgPSBsb25nTnVtYmVyICogMiAqIE1hdGguUEkgLyBsb25naXR1ZGVCYW5kc1xyXG4gICAgICAgIGNvbnN0IHNpblBoaSA9IE1hdGguc2luKHBoaSlcclxuICAgICAgICBjb25zdCBjb3NQaGkgPSBNYXRoLmNvcyhwaGkpXHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBjb3NQaGkgKiBzaW5UaGV0YVxyXG4gICAgICAgIGNvbnN0IHkgPSBjb3NUaGV0YVxyXG4gICAgICAgIGNvbnN0IHogPSBzaW5QaGkgKiBzaW5UaGV0YVxyXG4gICAgICAgIGNvbnN0IHUgPSAxIC0gKGxvbmdOdW1iZXIgLyBsb25naXR1ZGVCYW5kcylcclxuICAgICAgICBjb25zdCB2ID0gbGF0TnVtYmVyIC8gbGF0aXR1ZGVCYW5kc1xyXG5cclxuICAgICAgICAvLyByYXdVVnMucHVzaCgoeCsxLjApKjAuNSwgKHkrMS4wKSowLjUpXHJcbiAgICAgICAgcmF3VVZzLnB1c2godSwgdilcclxuICAgICAgICByYXdOb3JhbWxzLnB1c2goeCwgeSwgeilcclxuICAgICAgICByYXdDb2xvcnMucHVzaCguLi50aGlzLiNjb2xvcilcclxuICAgICAgICByYXdWZXJ0aWNlcy5wdXNoKHgsIHksIHopXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBsYXROdW1iZXI9MDsgbGF0TnVtYmVyIDwgbGF0aXR1ZGVCYW5kczsgKytsYXROdW1iZXIpIHtcclxuICAgICAgZm9yIChsZXQgbG9uZ051bWJlcj0wOyBsb25nTnVtYmVyIDwgbG9uZ2l0dWRlQmFuZHM7ICsrbG9uZ051bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGZpcnN0ID0gKGxhdE51bWJlcioobG9uZ2l0dWRlQmFuZHMrMSkpICsgbG9uZ051bWJlclxyXG4gICAgICAgIGNvbnN0IHNlY29uZCA9IGZpcnN0ICsgbG9uZ2l0dWRlQmFuZHMgKyAxXHJcbiAgICAgICAgdGhpcy5pbmRpY2VzLnB1c2goZmlyc3QsIHNlY29uZCwgZmlyc3QrMSlcclxuICAgICAgICB0aGlzLmluZGljZXMucHVzaChzZWNvbmQsIHNlY29uZCsxLCBmaXJzdCsxKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuaW5kaWNlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICBjb25zdCBpZCA9IHRoaXMuaW5kaWNlc1tpXVxyXG5cclxuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHJhd1ZlcnRpY2VzW2lkKjNdLCByYXdWZXJ0aWNlc1tpZCozKzFdLCByYXdWZXJ0aWNlc1tpZCozKzJdKVxyXG4gICAgICB0aGlzLnV2cy5wdXNoKHJhd1VWc1tpZCoyXSwgcmF3VVZzW2lkKjIrMV0pXHJcbiAgICAgIHRoaXMuY29sb3JzLnB1c2gocmF3Q29sb3JzW2lkKjNdLCByYXdDb2xvcnNbaWQqMysxXSwgcmF3Q29sb3JzW2lkKjMrMl0pXHJcbiAgICAgIGlmICghdGhpcy4jZmxhdCkge1xyXG4gICAgICAgIHRoaXMubm9ybWFscy5wdXNoKHJhd05vcmFtbHNbaWQqM10sIHJhd05vcmFtbHNbaWQqMysxXSwgcmF3Tm9yYW1sc1tpZCozKzJdKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuI2ZsYXQpIHtcclxuICAgICAgZm9yIChsZXQgaT0wOyBpPHRoaXMuaW5kaWNlcy5sZW5ndGg7IGkrPTMpIHtcclxuICAgICAgICBjb25zdCBhID0gdGhpcy5pbmRpY2VzW2ldKjNcclxuICAgICAgICBjb25zdCBiID0gdGhpcy5pbmRpY2VzW2krMV0qM1xyXG4gICAgICAgIGNvbnN0IGMgPSB0aGlzLmluZGljZXNbaSsyXSozXHJcbiAgXHJcbiAgICAgICAgY29uc3QgbjEgPSBbcmF3Tm9yYW1sc1thXSwgcmF3Tm9yYW1sc1thKzFdLCByYXdOb3JhbWxzW2ErMl1dXHJcbiAgICAgICAgY29uc3QgbjIgPSBbcmF3Tm9yYW1sc1tiXSwgcmF3Tm9yYW1sc1tiKzFdLCByYXdOb3JhbWxzW2IrMl1dXHJcbiAgICAgICAgY29uc3QgbjMgPSBbcmF3Tm9yYW1sc1tjXSwgcmF3Tm9yYW1sc1tjKzFdLCByYXdOb3JhbWxzW2MrMl1dXHJcbiAgXHJcbiAgICAgICAgY29uc3QgbiA9IFtcclxuICAgICAgICAgIChuMVswXStuMlswXStuM1swXSkvMyxcclxuICAgICAgICAgIChuMVsxXStuMlsxXStuM1sxXSkvMyxcclxuICAgICAgICAgIChuMVsyXStuMlsyXStuM1syXSkvMyxcclxuICAgICAgICBdXHJcbiAgXHJcbiAgICAgICAgdGhpcy5ub3JtYWxzLnB1c2goLi4ubilcclxuICAgICAgICB0aGlzLm5vcm1hbHMucHVzaCguLi5uKVxyXG4gICAgICAgIHRoaXMubm9ybWFscy5wdXNoKC4uLm4pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG5jbGFzcyBRdWFkTWVzaCBleHRlbmRzIE1lc2gge1xyXG5cclxuICAjYXhpcyA9ICd6J1xyXG5cclxuICBjb25zdHJ1Y3RvciAoYXBwLCBvcHRpb25zKSB7XHJcbiAgICBzdXBlcihhcHApXHJcblxyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgdGhpcy4jYXhpcyA9IG9wdGlvbnMuYXhpcyA/PyB0aGlzLiNheGlzXHJcbiAgICAgIGlmICh0aGlzLiNheGlzICE9PSAneicgJiYgdGhpcy4jYXhpcyAhPSAneCcgJiYgdGhpcy4jYXhpcyAhPSAneScpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdVbnJlY29uaXplZCBheGlzICVzJywgdGhpcy4jYXhpcylcclxuICAgICAgICB0aGlzLiNheGlzID0gJ3onXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVwZGF0ZVZlcnREYXRhKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVZlcnREYXRhICgpIHtcclxuICAgIHRoaXMuY2xlYXJWZXJ0RGF0YSgpXHJcbiAgICB0aGlzLmdlbmVyYXRlVmVydERhdGEoKVxyXG4gICAgdGhpcy5zeW5jV2l0aEdMKClcclxuICB9XHJcblxyXG4gIGNsZWFyVmVydERhdGEgKCkge1xyXG4gICAgdGhpcy52ZXJ0aWNlcyA9IFtdXHJcbiAgICB0aGlzLmluZGljZXMgPSBbXVxyXG4gICAgdGhpcy51dnMgPSBbXVxyXG4gICAgdGhpcy5jb2xvcnMgPSBbXVxyXG4gICAgdGhpcy5ub3JtYWxzID0gW11cclxuICB9XHJcblxyXG4gIGdlbmVyYXRlVmVydERhdGEgKCkge1xyXG4gICAgY29uc3Qgb3JpZ2luVmVydGljZSA9IFtdXHJcbiAgICBjb25zdCBub3IgPSBbXVxyXG4gICAgaWYgKHRoaXMuI2F4aXMgPT09ICd4Jykge1xyXG4gICAgICBvcmlnaW5WZXJ0aWNlLnB1c2goMCwgMC41LCAwLjUpXHJcbiAgICAgIG9yaWdpblZlcnRpY2UucHVzaCgwLCAwLjUsIC0wLjUpXHJcbiAgICAgIG9yaWdpblZlcnRpY2UucHVzaCgwLCAtMC41LCAtMC41KVxyXG4gICAgICBvcmlnaW5WZXJ0aWNlLnB1c2goMCwgLTAuNSwgMC41KVxyXG4gICAgICBub3IucHVzaCgxLCAwLCAwKVxyXG4gICAgfSBlbHNlIGlmICh0aGlzLiNheGlzID09PSAneScpIHtcclxuICAgICAgb3JpZ2luVmVydGljZS5wdXNoKC0wLjUsIDAsIC0wLjUpXHJcbiAgICAgIG9yaWdpblZlcnRpY2UucHVzaCgwLjUsIDAsIC0wLjUpXHJcbiAgICAgIG9yaWdpblZlcnRpY2UucHVzaCgwLjUsIDAsIDAuNSlcclxuICAgICAgb3JpZ2luVmVydGljZS5wdXNoKC0wLjUsIDAsIDAuNSlcclxuICAgICAgbm9yLnB1c2goMCwgMSwgMClcclxuICAgIH0gZWxzZSBpZiAodGhpcy4jYXhpcyA9PSAneicpIHtcclxuICAgICAgb3JpZ2luVmVydGljZS5wdXNoKC0wLjUsIDAuNSwgMClcclxuICAgICAgb3JpZ2luVmVydGljZS5wdXNoKDAuNSwgMC41LCAwKVxyXG4gICAgICBvcmlnaW5WZXJ0aWNlLnB1c2goMC41LCAtMC41LCAwKVxyXG4gICAgICBvcmlnaW5WZXJ0aWNlLnB1c2goLTAuNSwgLTAuNSwgMClcclxuICAgICAgbm9yLnB1c2goMCwgMCwgMSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvcmlnaW5VVnMgPSBbXHJcbiAgICAgIDAsIDEsXHJcbiAgICAgIDEsIDEsXHJcbiAgICAgIDEsIDAsXHJcbiAgICAgIDAsIDAsXHJcbiAgICBdXHJcblxyXG4gICAgdGhpcy5pbmRpY2VzID0gW1xyXG4gICAgICAyLCAxLCAwLFxyXG4gICAgICAzLCAyLCAwLFxyXG4gICAgXVxyXG5cclxuICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLmluZGljZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgY29uc3QgeCA9IG9yaWdpblZlcnRpY2VbdGhpcy5pbmRpY2VzW2ldKjMrMF1cclxuICAgICAgY29uc3QgeSA9IG9yaWdpblZlcnRpY2VbdGhpcy5pbmRpY2VzW2ldKjMrMV1cclxuICAgICAgY29uc3QgeiA9IG9yaWdpblZlcnRpY2VbdGhpcy5pbmRpY2VzW2ldKjMrMl1cclxuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKHgsIHksIHopXHJcblxyXG4gICAgICBjb25zdCB1ID0gb3JpZ2luVVZzW3RoaXMuaW5kaWNlc1tpXSoyKzBdXHJcbiAgICAgIGNvbnN0IHYgPSBvcmlnaW5VVnNbdGhpcy5pbmRpY2VzW2ldKjIrMV1cclxuICAgICAgdGhpcy51dnMucHVzaCh1LCB2KVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGk9MDsgaTx0aGlzLmluZGljZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdGhpcy5ub3JtYWxzLnB1c2goLi4ubm9yKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgTWVzaCwgUGxhbmVNZXNoLCBTcGhlcmVNZXNoLCBRdWFkTWVzaCwgVHJpYW5nbGUzRE1lc2ggfSIsIlxyXG5jbGFzcyBQYXJ0aWNsZU1lc2gge1xyXG5cclxuICBtZXNoID0gbnVsbFxyXG4gIGluc3RhbmNlR2xWYm8gPSBudWxsXHJcbiAgZ2xWYW8gPSBudWxsXHJcbiAgI3ZhbGlkID0gZmFsc2VcclxuICBidWZmZXJTaXplID0gMFxyXG5cclxuICBjb25zdHJ1Y3RvciAoYXBwLCBtZXNoLCBidWZmZXJTaXplKSB7XHJcbiAgICB0aGlzLmFwcCA9IGFwcFxyXG4gICAgdGhpcy5tZXNoID0gbWVzaFxyXG4gICAgdGhpcy5idWZmZXJTaXplID0gYnVmZmVyU2l6ZVxyXG4gICAgdGhpcy5zeW5jV2l0aEdMKClcclxuXHJcbiAgICBpZiAodGhpcy5nbFZhbylcclxuICAgICAgdGhpcy4jdmFsaWQgPSB0cnVlXHJcbiAgfVxyXG5cclxuICBpc1ZhbGlkICgpIHtcclxuICAgIHJldHVybiB0aGlzLiN2YWxpZFxyXG4gIH1cclxuXHJcbiAgZGVsZXRlUmVzb3VyY2VGcm9tR0wgKCkge1xyXG4gICAgY29uc3QgZ2wgPSB0aGlzLmFwcC5yZW5kZXJTZXJ2ZXIuZ2xcclxuICAgIGlmICghZ2wpIHJldHVyblxyXG5cclxuICAgIGlmKGdsLmlzVmVydGV4QXJyYXkodGhpcy5nbFZhbykpIHtcclxuICAgICAgZ2wuZGVsZXRlVmVydGV4QXJyYXkodGhpcy5nbFZhbylcclxuICAgICAgdGhpcy5nbFZhbyA9IG51bGxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNyZWF0ZVJlc291cmNlRnJvbUdMICgpIHtcclxuICAgIGNvbnN0IGdsID0gdGhpcy5hcHAucmVuZGVyU2VydmVyLmdsXHJcbiAgICBpZiAoIWdsKSByZXR1cm5cclxuICAgIGlmICh0aGlzLm1lc2ggPT09IG51bGwpIHJldHVyblxyXG4gICAgaWYgKHRoaXMuYnVmZmVyU2l6ZSA8PSAwKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCB0cmFuc2Zvcm1MZW4gPSA0KjQqNCAvLyA0KjQgaW4gYnl0ZXNcclxuICAgIGNvbnN0IHRyYXNuZm9ybU9mZnNldCA9IDBcclxuICAgIGNvbnN0IGNvbG9yTGVuID0gNCo0IC8vIHJnYmEgaW4gYnl0ZXNcclxuICAgIGNvbnN0IGNvbG9yT2Zmc2V0ID0gdHJhbnNmb3JtTGVuXHJcbiAgICBjb25zdCB1dk9mZnNldExlbiA9IDIqNCAvLyB1diBpbiBieXRlc1xyXG4gICAgY29uc3QgdXZPZmZzZXRPZmZzZXQgPSBjb2xvck9mZnNldCArIGNvbG9yTGVuXHJcbiAgICBjb25zdCBzdHJpZGUgPSB0cmFuc2Zvcm1MZW4gKyBjb2xvckxlbiArIHV2T2Zmc2V0TGVuXHJcblxyXG4gICAgdGhpcy5pbnN0YW5jZUdsVmJvID0gZ2wuY3JlYXRlQnVmZmVyKClcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmluc3RhbmNlR2xWYm8pXHJcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJTaXplICogc3RyaWRlLCBnbC5EWU5BTUlDX0RSQVcpXHJcblxyXG4gICAgdGhpcy5nbFZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KClcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLmdsVmFvKVxyXG5cclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDApXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5tZXNoLmdsVmJvLnBvcylcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoMCwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKVxyXG5cclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDEpXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5tZXNoLmdsVmJvLnV2KVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigxLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMilcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLm1lc2guZ2xWYm8ubm9ybWFsKVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigyLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMykgLy8gdHJhbnNmb3JtWzBdXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5pbnN0YW5jZUdsVmJvKVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigzLCA0LCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgdHJhc25mb3JtT2Zmc2V0KzAqNCo0KVxyXG4gICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcigzLCAxKVxyXG5cclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDQpIC8vIHRyYW5zZm9ybVsxXVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuaW5zdGFuY2VHbFZibylcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoNCwgNCwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIHRyYXNuZm9ybU9mZnNldCsxKjQqNClcclxuICAgIGdsLnZlcnRleEF0dHJpYkRpdmlzb3IoNCwgMSlcclxuXHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSg1KSAvLyB0cmFuc2Zvcm1bMl1cclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmluc3RhbmNlR2xWYm8pXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDUsIDQsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCB0cmFzbmZvcm1PZmZzZXQrMio0KjQpXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKDUsIDEpXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoNikgLy8gdHJhbnNmb3JtWzNdXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5pbnN0YW5jZUdsVmJvKVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcig2LCA0LCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgdHJhc25mb3JtT2Zmc2V0KzMqNCo0KVxyXG4gICAgZ2wudmVydGV4QXR0cmliRGl2aXNvcig2LCAxKVxyXG5cclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDcpIC8vIGNvbG9yXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5pbnN0YW5jZUdsVmJvKVxyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcig3LCA0LCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgY29sb3JPZmZzZXQpXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJEaXZpc29yKDcsIDEpXHJcblxyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoOCkgLy8gdXZPZmZzZXRcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmluc3RhbmNlR2xWYm8pXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDgsIDIsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCB1dk9mZnNldE9mZnNldClcclxuICAgIGdsLnZlcnRleEF0dHJpYkRpdmlzb3IoOCwgMSlcclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbClcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKVxyXG4gIH1cclxuXHJcbiAgc3luY1dpdGhHTCAoKSB7XHJcbiAgICB0aGlzLmRlbGV0ZVJlc291cmNlRnJvbUdMKClcclxuICAgIHRoaXMuY3JlYXRlUmVzb3VyY2VGcm9tR0woKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlSW5zdGFuY2VEYXRhIChkYXRhKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuaW5zdGFuY2VHbFZibylcclxuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCAwLCBuZXcgRmxvYXQzMkFycmF5KGRhdGEpKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IHsgUGFydGljbGVNZXNoIH0iLCJjbGFzcyBTaGFkZXIge1xyXG5cclxuICBnbFByb2dyYW0gPSBudWxsXHJcbiAgcGFyYW1ldGVycyA9IHt9XHJcblxyXG4gIGNvbnN0cnVjdG9yIChhcHApIHtcclxuICAgIHRoaXMuYXBwID0gYXBwXHJcbiAgfVxyXG5cclxuICBzZXRQYXJhbWV0ZXJzVG9HTCAoKSB7XHJcblxyXG4gIH1cclxufVxyXG5cclxuY29uc3QgQ1VMTF9NT0RFID0ge1xyXG4gIE5PTkU6IDAsXHJcbiAgQkFDSzogMSxcclxuICBGUk9OVDogMixcclxufVxyXG5cclxuY2xhc3MgU2ltcGxlTWVzaFNoYWRlciBleHRlbmRzIFNoYWRlciB7XHJcblxyXG4gIHBhcmFtZXRlcnMgPSB7XHJcbiAgICB0ZXgxOiBudWxsLFxyXG4gICAgdGV4MjogbnVsbCxcclxuICAgIGN1bGxNb2RlOiBDVUxMX01PREUuQkFDSyxcclxuICAgIGNvbG9yOiBbMSwgMSwgMSwgMV0sXHJcbiAgfVxyXG5cclxuICAjY2FjaGUgPSB7XHJcbiAgICBwYXJhbUxvY2F0aW9uczoge30sXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAoYXBwLCB2c1RleHQsIGZzVGV4dCkge1xyXG4gICAgc3VwZXIoYXBwKVxyXG5cclxuICAgIGNvbnN0IGdsID0gdGhpcy5hcHAucmVuZGVyU2VydmVyLmdsXHJcbiAgICBpZiAoIWdsKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZ2whJylcclxuXHJcbiAgICBjb25zdCB2ZXJ0U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xyXG4gICAgY29uc3QgZnJhZ1NoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRTaGFkZXIsIHZzVGV4dClcclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnU2hhZGVyLCBmc1RleHQpXHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRTaGFkZXIpXHJcbiAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdTaGFkZXIpXHJcbiAgICBjb25zdCB2ZXJ0SW5mbyA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydFNoYWRlcilcclxuICAgIGNvbnN0IGZyYWdJbmZvID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnU2hhZGVyKVxyXG5cclxuICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKClcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0U2hhZGVyKVxyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdTaGFkZXIpXHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKVxyXG4gICAgY29uc3QgbGlua19zdGF0dXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKVxyXG4gICAgaWYgKCFsaW5rX3N0YXR1cykge1xyXG4gICAgICB2YXIgZXJyb3JUZXh0ID0gJ0NhblxcJ3QgbGluayBnbCBwcm9ncmFtIVxcbicgKyB2ZXJ0SW5mbyArICdcXG4nICsgZnJhZ0luZm8gKyAnXFxuJyArIGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvclRleHQpXHJcbiAgICB9XHJcbiAgICB0aGlzLmdsUHJvZ3JhbSA9IHByb2dyYW1cclxuICB9XHJcblxyXG4gIHVzZSAoKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgZ2wudXNlUHJvZ3JhbSh0aGlzLmdsUHJvZ3JhbSlcclxuICB9XHJcblxyXG4gIHVwbG9hZFBhcmFtZXRlciAocGFyYW0sIHZhbHVlLCBpbnRlZ2VyPWZhbHNlKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG5cclxuICAgIGxldCBsb2NhdGlvbiA9IHRoaXMuI2NhY2hlLnBhcmFtTG9jYXRpb25zW3BhcmFtXVxyXG4gICAgaWYgKGxvY2F0aW9uID09PSBudWxsKSByZXR1cm5cclxuICAgIGlmIChsb2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHRoaXMuZ2xQcm9ncmFtLCBwYXJhbSlcclxuICAgICAgdGhpcy4jY2FjaGUucGFyYW1Mb2NhdGlvbnNbcGFyYW1dID0gbG9jYXRpb25cclxuICAgICAgaWYgKGxvY2F0aW9uID09PSBudWxsKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKGB0cnkgdG8gdXBsb2FkIHRvIGEgbnVsbCBzaGFkZXIgcGFyYW06ICR7cGFyYW19YClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgSW50MzJBcnJheSkge1xyXG4gICAgICBjb25zdCBsZW4gPSB2YWx1ZS5sZW5ndGhcclxuICAgICAgc3dpdGNoIChsZW4pIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICBpZiAoaW50ZWdlcikgZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdmFsdWUpXHJcbiAgICAgICAgICBlbHNlIGdsLnVuaWZvcm0xZnYobG9jYXRpb24sIHZhbHVlKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICBpZiAoaW50ZWdlcikgZ2wudW5pZm9ybTJpdihsb2NhdGlvbiwgdmFsdWUpXHJcbiAgICAgICAgICBlbHNlIGdsLnVuaWZvcm0yZnYobG9jYXRpb24sIHZhbHVlKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICBpZiAoaW50ZWdlcikgZ2wudW5pZm9ybTNpdihsb2NhdGlvbiwgdmFsdWUpXHJcbiAgICAgICAgICBlbHNlIGdsLnVuaWZvcm0zZnYobG9jYXRpb24sIHZhbHVlKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICBpZiAoaW50ZWdlcikgZ2wudW5pZm9ybTRpdihsb2NhdGlvbiwgdmFsdWUpXHJcbiAgICAgICAgICBlbHNlIGdsLnVuaWZvcm00ZnYobG9jYXRpb24sIHZhbHVlKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgMTY6XHJcbiAgICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KGxvY2F0aW9uLCBmYWxzZSwgdmFsdWUpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoaW50ZWdlcikgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2YWx1ZSlcclxuICAgICAgZWxzZSBnbC51bmlmb3JtMWYobG9jYXRpb24sIHZhbHVlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYmluZFRleHR1cmUgKGluZGV4LCB0ZXh0dXJlKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgZ2wuYWN0aXZlVGV4dHVyZShnbFtgVEVYVFVSRSR7aW5kZXh9YF0pXHJcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlLmdsVGV4KVxyXG4gICAgdGhpcy51cGxvYWRQYXJhbWV0ZXIoYHRleCR7aW5kZXh9YCwgaW5kZXgsIHRydWUpXHJcbiAgfVxyXG5cclxuICBzZXRQYXJhbWV0ZXJzVG9HTCAoKSB7XHJcbiAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLnRleDEpIHtcclxuICAgICAgdGhpcy5iaW5kVGV4dHVyZSgwLCB0aGlzLnBhcmFtZXRlcnMudGV4MSlcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHRoaXMucGFyYW1ldGVycy50ZXgyKSB7XHJcbiAgICAgIHRoaXMuYmluZFRleHR1cmUoMSwgdGhpcy5wYXJhbWV0ZXJzLnRleDIpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGxvYWRQYXJhbWV0ZXIoJ2N1bGxNb2RlJywgdGhpcy5wYXJhbWV0ZXJzLmN1bGxNb2RlLCB0cnVlKVxyXG4gICAgdGhpcy51cGxvYWRQYXJhbWV0ZXIoJ2NvbG9yJywgdGhpcy5wYXJhbWV0ZXJzLmNvbG9yKVxyXG4gIH1cclxufVxyXG5cclxuU2hhZGVyLkNVTExfTU9ERSA9IENVTExfTU9ERVxyXG5cclxuZXhwb3J0IHsgU2hhZGVyLCBTaW1wbGVNZXNoU2hhZGVyIH0iLCJjbGFzcyBUZXh1dHJlIHtcclxuXHJcbiAgZ2xUZXggPSBudWxsXHJcbiAgaW1hZ2UgPSBudWxsXHJcblxyXG4gIGNvbnN0cnVjdG9yIChhcHAsIGltYWdlKSB7XHJcbiAgICB0aGlzLmFwcCA9IGFwcFxyXG4gICAgdGhpcy5pbWFnZSA9IGltYWdlXHJcbiAgICBjb25zdCBnbCA9IHRoaXMuYXBwLnJlbmRlclNlcnZlci5nbFxyXG4gICAgdGhpcy5nbFRleCA9IGdsLmNyZWF0ZVRleHR1cmUoKVxyXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy5nbFRleClcclxuICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpXHJcbiAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlKVxyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVClcclxuICAgIGlmICghZ2wuaXNUZXh0dXJlKHRoaXMuZ2xUZXgpKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoaW1hZ2UpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRleHR1cmUgaXMgaW52YWxpZCEnKVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBnZXQgd2lkdGggKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1hZ2Uud2lkdGhcclxuICB9XHJcblxyXG4gIGdldCBoZWlnaHQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW1hZ2UuaGVpZ2h0XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh1dHJlIiwiaW1wb3J0IFRyYW5zZm9ybSBmcm9tIFwiLi9jb21wb25lbnQvdHJhbnNmb3JtLmpzXCJcclxuaW1wb3J0IEVudGl0eSBmcm9tIFwiLi9lbnRpdHkuanNcIlxyXG5cclxuY2xhc3MgU2NlbmUge1xyXG4gIGlkQ291bnQgPSAwXHJcblxyXG4gIGVudGl0eUNvbGxlY3Rpb24gPSBbXVxyXG4gIGRlc3Ryb3llZEVudGl0eVF1ZXVlID0gW11cclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgZ2V0TmV3SWQgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaWRDb3VudCsrXHJcbiAgfVxyXG5cclxuICBlbnRlciAoKSB7XHJcblxyXG4gIH1cclxuICBcclxuICBleGl0ICgpIHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGRlbHRhKSB7XHJcbiAgICB0aGlzLmNhbGxFbnRpdHlDb2xsZWN0aW9uRnVuY3Rpb24oJ3ByZVVwZGF0ZScsIGRlbHRhKVxyXG4gICAgdGhpcy5jYWxsRW50aXR5Q29sbGVjdGlvbkZ1bmN0aW9uKCd1cGRhdGUnLCBkZWx0YSlcclxuICAgIHRoaXMuY2FsbEVudGl0eUNvbGxlY3Rpb25GdW5jdGlvbignYWZ0ZXJVcGRhdGUnLCBkZWx0YSlcclxuXHJcbiAgICBpZiAodGhpcy5kZXN0cm95ZWRFbnRpdHlRdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnN0IG1hcmtlZCA9IHt9XHJcbiAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmRlc3Ryb3llZEVudGl0eVF1ZXVlKSB7XHJcbiAgICAgICAgaWYgKCFtYXJrZWRbZW50aXR5LmlkXSkge1xyXG4gICAgICAgICAgbWFya2VkW2VudGl0eS5pZF0gPSB0cnVlXHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdHkoZW50aXR5KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICB0aGlzLmRlc3Ryb3llZEVudGl0eVF1ZXVlID0gW11cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNhbGxFbnRpdHlDb2xsZWN0aW9uRnVuY3Rpb24oZnVuY05hbWUsIC4uLmFyZ3MpIHtcclxuICAgIGNvbnN0IGNhbGxJdCA9IChlbnRpdHkpID0+IHtcclxuICAgICAgaWYgKGVudGl0eS5hY3RpdmF0ZWQgJiYgZW50aXR5W2Z1bmNOYW1lXSkgZW50aXR5W2Z1bmNOYW1lXSguLi5hcmdzKVxyXG4gICAgfVxyXG4gICAgY29uc3QgdHJldmFsVHJhbnNUcmVlID0gKHJvb3QpID0+IHtcclxuICAgICAgZm9yIChsZXQgYyBvZiByb290LmNoaWxkcmVuKSB7XHJcbiAgICAgICAgaWYgKGMuZW50aXR5LmFjdGl2YXRlZCAmJiBjLmNoaWxkQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICB0cmV2YWxUcmFuc1RyZWUoYylcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FsbEl0KGMuZW50aXR5KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXR5Q29sbGVjdGlvbikge1xyXG4gICAgICBjb25zdCB0cmFuc2Zvcm0gPSBlbnRpdHkuZ2V0Q29tcG9uZW50UmF3KFRyYW5zZm9ybSlcclxuICAgICAgaWYgKGVudGl0eS5hY3RpdmF0ZWQgJiYgdHJhbnNmb3JtICYmIHRyYW5zZm9ybS5wYXJlbnQgPT0gbnVsbCAmJiB0cmFuc2Zvcm0uY2hpbGRDb3VudCA+IDApIHtcclxuICAgICAgICB0cmV2YWxUcmFuc1RyZWUodHJhbnNmb3JtKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghdHJhbnNmb3JtIHx8IHRyYW5zZm9ybS5wYXJlbnQgPT0gbnVsbCkge1xyXG4gICAgICAgIGNhbGxJdChlbnRpdHkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNyZWF0ZUVudGl0eSgpIHtcclxuICAgIGNvbnN0IGUgPSBuZXcgRW50aXR5KClcclxuICAgIGUuaWQgPSB0aGlzLmdldE5ld0lkKClcclxuICAgIGUuc2NlbmUgPSB0aGlzXHJcbiAgICB0aGlzLmVudGl0eUNvbGxlY3Rpb24ucHVzaChlKVxyXG4gICAgcmV0dXJuIGVcclxuICB9XHJcblxyXG4gIGRlc3Ryb3lFbnRpdHkoZSkge1xyXG4gICAgY29uc3QgcG9zID0gdGhpcy5lbnRpdHlDb2xsZWN0aW9uLmluZGV4T2YoZSlcclxuICAgIFxyXG4gICAgaWYgKHBvcyA+PSAwKSB7XHJcbiAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IGUuZ2V0Q29tcG9uZW50UmF3KFRyYW5zZm9ybSlcclxuICAgICAgaWYgKHRyYW5zZm9ybSkge1xyXG4gICAgICAgIGZvciAobGV0IGMgb2YgdHJhbnNmb3JtLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdHkoYy5lbnRpdHkpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBvbGQgPSB0aGlzLmVudGl0eUNvbGxlY3Rpb25cclxuICAgICAgdGhpcy5lbnRpdHlDb2xsZWN0aW9uID0gW11cclxuICAgICAgZm9yIChsZXQgaT0wOyBpPG9sZC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGlmIChpICE9PSBwb3MpIHtcclxuICAgICAgICAgIHRoaXMuZW50aXR5Q29sbGVjdGlvbi5wdXNoKG9sZFtpXSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGUuZGVzdHJveWVkKClcclxuICB9XHJcblxyXG4gIGlucHV0IChldmVudCkge1xyXG4gICAgdGhpcy5jYWxsRW50aXR5Q29sbGVjdGlvbkZ1bmN0aW9uKCdpbnB1dCcsIGV2ZW50KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2NlbmUiLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi4vc2NlbmUuanMnXHJcbmltcG9ydCB7IENvbnRyb2xUcmlnZ2VyLCBGaXJzdFBlcnNvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9jb21wb25lbnQvZmlyc3RfcGVyc29uX2NvbnRyb2xsZXIuanMnXHJcbmltcG9ydCB7IFBsYW5lTWVzaCwgU3BoZXJlTWVzaCwgVHJpYW5nbGUzRE1lc2ggfSBmcm9tICcuLi9yZXNvdXJjZXMvbWVzaC5qcydcclxuaW1wb3J0IHsgUGFydGljbGVFbWl0dGVyIH0gZnJvbSAnLi4vY29tcG9uZW50L3BhcnRpY2xlX2VtaXR0ZXIuanMnXHJcbmltcG9ydCB7IFBhcnRpY2xlUmVuZGVyZXIsIFRleHR1cmVQYXJ0aWNsZVJlbmRlcmVyIH0gZnJvbSAnLi4vY29tcG9uZW50L3BhcnRpY2xlX3JlbmRlcmVyLmpzJ1xyXG5pbXBvcnQgeyBQYXJ0aWNsZUVtaXR0ZXJDb250cm9sbGVyMSB9IGZyb20gJy4uL2NvbXBvbmVudC9wYXJ0aWNsZV9lbWl0dGVyX2NvbnRyb2xsZXIuanMnXHJcbmltcG9ydCB7IFNpbXBsZU1lc2hTaGFkZXIgfSBmcm9tICcuLi9yZXNvdXJjZXMvc2hhZGVyLmpzJ1xyXG5pbXBvcnQgeyBQZXJzcGVjdGl2ZUNhbWVyYSB9IGZyb20gJy4uL2NvbXBvbmVudC9jYW1lcmEuanMnXHJcbmltcG9ydCB7IEN1c3RvbUFuaW1hdGUxIH0gZnJvbSAnLi4vY29tcG9uZW50L2N1c3RvbV9hbmltYXRlXzEuanMnXHJcbmltcG9ydCBNZXNoUmVuZGVyZXIgZnJvbSAnLi4vY29tcG9uZW50L21lc2hfcmVuZGVyZXIuanMnXHJcbmltcG9ydCBUcmFuc2Zvcm0gZnJvbSAnLi4vY29tcG9uZW50L3RyYW5zZm9ybS5qcydcclxuaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDMsIG1hdDQsIHZlYzMgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5pbXBvcnQgeyBGUFNDYW1lcmEgfSBmcm9tICcuL3ByZWZhYnMvZnBzX2NhbWVyYS9mcHNfY2FtZXJhLmpzJ1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vY29yZS91dGlscy5qcydcclxuaW1wb3J0IHsgRmlyZSB9IGZyb20gJy4vcHJlZmFicy9maXJlL2ZpcmUuanMnXHJcblxyXG5jbGFzcyBGaXJlU2NlbmUxIGV4dGVuZHMgU2NlbmUge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICB9XHJcblxyXG4gIGFzeW5jIHNldFVwU2NlbmUgKCkge1xyXG4gICAgY29uc3QgYXBwID0gdGhpcy5hcHBcclxuICAgIGNvbnN0IHJlc291cmNlU2VydmVyID0gYXBwLnJlc291cmNlU2VydmVyXHJcbiAgICBjb25zdCB0ZXh0dXJlID0gYXdhaXQgcmVzb3VyY2VTZXJ2ZXIubG9hZChfX1JPT1RfUEFUSF9fICsgJ2Fzc2V0cy9pbWFnZXMvZmxhbWVzLnBuZycpXHJcblxyXG4gICAgRlBTQ2FtZXJhKGFwcCwgWzAuMDUsIDEuNTQsIDUuMTJdKVxyXG4gICAgRmlyZShhcHAsIHRleHR1cmUsIFswLCAwLCAwXSlcclxuICB9XHJcblxyXG4gIGVudGVyICgpIHtcclxuICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2xlZnQnLCBLZXlib2FyZEV2ZW50LCAnS2V5QScpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX3JpZ2h0JywgS2V5Ym9hcmRFdmVudCwgJ0tleUQnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV91cCcsIEtleWJvYXJkRXZlbnQsICdLZXlXJylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfZG93bicsIEtleWJvYXJkRXZlbnQsICdLZXlTJylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ2ludGVyYWN0JywgS2V5Ym9hcmRFdmVudCwgJ0tleUUnKVxyXG5cclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfbGVmdCcsIEtleWJvYXJkRXZlbnQsICdBcnJvd0xlZnQnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV9yaWdodCcsIEtleWJvYXJkRXZlbnQsICdBcnJvd1JpZ2h0JylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfdXAnLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dVcCcpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2Rvd24nLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dEb3duJylcclxuXHJcbiAgICB0aGlzLnNldFVwU2NlbmUoKS50aGVuKClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IEZpcmVTY2VuZTEgfSIsImltcG9ydCBTY2VuZSBmcm9tICcuLi9zY2VuZS5qcydcclxuaW1wb3J0IHsgQ29udHJvbFRyaWdnZXIsIEZpcnN0UGVyc29uQ29udHJvbGxlciB9IGZyb20gJy4uL2NvbXBvbmVudC9maXJzdF9wZXJzb25fY29udHJvbGxlci5qcydcclxuaW1wb3J0IHsgUGxhbmVNZXNoLCBTcGhlcmVNZXNoLCBUcmlhbmdsZTNETWVzaCB9IGZyb20gJy4uL3Jlc291cmNlcy9tZXNoLmpzJ1xyXG5pbXBvcnQgeyBQYXJ0aWNsZUVtaXR0ZXIgfSBmcm9tICcuLi9jb21wb25lbnQvcGFydGljbGVfZW1pdHRlci5qcydcclxuaW1wb3J0IHsgUGFydGljbGVSZW5kZXJlciwgVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIgfSBmcm9tICcuLi9jb21wb25lbnQvcGFydGljbGVfcmVuZGVyZXIuanMnXHJcbmltcG9ydCB7IFBhcnRpY2xlRW1pdHRlckNvbnRyb2xsZXIxIH0gZnJvbSAnLi4vY29tcG9uZW50L3BhcnRpY2xlX2VtaXR0ZXJfY29udHJvbGxlci5qcydcclxuaW1wb3J0IHsgU2ltcGxlTWVzaFNoYWRlciB9IGZyb20gJy4uL3Jlc291cmNlcy9zaGFkZXIuanMnXHJcbmltcG9ydCB7IFBlcnNwZWN0aXZlQ2FtZXJhIH0gZnJvbSAnLi4vY29tcG9uZW50L2NhbWVyYS5qcydcclxuaW1wb3J0IHsgQ3VzdG9tQW5pbWF0ZTEgfSBmcm9tICcuLi9jb21wb25lbnQvY3VzdG9tX2FuaW1hdGVfMS5qcydcclxuaW1wb3J0IE1lc2hSZW5kZXJlciBmcm9tICcuLi9jb21wb25lbnQvbWVzaF9yZW5kZXJlci5qcydcclxuaW1wb3J0IFRyYW5zZm9ybSBmcm9tICcuLi9jb21wb25lbnQvdHJhbnNmb3JtLmpzJ1xyXG5pbXBvcnQgeyBnbE1hdHJpeCwgbWF0MywgbWF0NCwgdmVjMyB9IGZyb20gJy4uL2xpYi9nbC1tYXRyaXgvaW5kZXguanMnXHJcbmltcG9ydCB7IEZQU0NhbWVyYSB9IGZyb20gJy4vcHJlZmFicy9mcHNfY2FtZXJhL2Zwc19jYW1lcmEuanMnXHJcbmltcG9ydCB7IFJvY2tldCB9IGZyb20gJy4vcHJlZmFicy9yb2NrZXQvcm9ja2V0LmpzJ1xyXG5pbXBvcnQgeyBFeHBsb3Npb24gfSBmcm9tICcuL3ByZWZhYnMvZXhwbG9zaW9uL2V4cGxvc2lvbi5qcydcclxuaW1wb3J0IHsgR2VuZXJhdG9yIH0gZnJvbSAnLi9wcmVmYWJzL2dlbmVyYXRvci9nZW5lcmF0b3IuanMnXHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi9jb3JlL3V0aWxzLmpzJ1xyXG5cclxuY2xhc3MgRmlyZXdvcmtTY2VuZTEgZXh0ZW5kcyBTY2VuZSB7XHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgc3VwZXIoKVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2V0VXBTY2VuZSAoKSB7XHJcbiAgICBjb25zdCBhcHAgPSB0aGlzLmFwcFxyXG4gICAgY29uc3QgcmVzb3VyY2VTZXJ2ZXIgPSBhcHAucmVzb3VyY2VTZXJ2ZXJcclxuICAgIGNvbnN0IHRleHR1cmUgPSBhd2FpdCByZXNvdXJjZVNlcnZlci5sb2FkKF9fUk9PVF9QQVRIX18gKyAnYXNzZXRzL2ltYWdlcy9wYXJ0aWNsZS5wbmcnKVxyXG5cclxuICAgIEZQU0NhbWVyYShhcHApXHJcbiAgICBHZW5lcmF0b3IoYXBwLCBbMCwgMCwgMF0sIChvcmlnaW4pPT57XHJcbiAgICAgIGNvbnN0IHcgPSAxMFxyXG4gICAgICBjb25zdCBoID0gMTBcclxuICAgICAgY29uc3Qgb2Zmc2V0ID0gdmVjMy5mcm9tVmFsdWVzKHV0aWxzLnJhbmRvbVJhbmdlKC13LCB3KSwgMCwgdXRpbHMucmFuZG9tUmFuZ2UoLWgsIGgpKVxyXG4gICAgICBjb25zdCBwb3MgPSB2ZWMzLmFkZChvcmlnaW4sIG9yaWdpbiwgb2Zmc2V0KVxyXG4gICAgICBSb2NrZXQoYXBwLCB0ZXh0dXJlLCBwb3MpXHJcbiAgICB9LCAxMDAsIDIwMDApXHJcbiAgfVxyXG5cclxuICBlbnRlciAoKSB7XHJcbiAgICBjb25zdCBhcHAgPSB0aGlzLmFwcFxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV9sZWZ0JywgS2V5Ym9hcmRFdmVudCwgJ0tleUEnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV9yaWdodCcsIEtleWJvYXJkRXZlbnQsICdLZXlEJylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfdXAnLCBLZXlib2FyZEV2ZW50LCAnS2V5VycpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2Rvd24nLCBLZXlib2FyZEV2ZW50LCAnS2V5UycpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdpbnRlcmFjdCcsIEtleWJvYXJkRXZlbnQsICdLZXlFJylcclxuXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2xlZnQnLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dMZWZ0JylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfcmlnaHQnLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dSaWdodCcpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX3VwJywgS2V5Ym9hcmRFdmVudCwgJ0Fycm93VXAnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV9kb3duJywgS2V5Ym9hcmRFdmVudCwgJ0Fycm93RG93bicpXHJcblxyXG4gICAgdGhpcy5zZXRVcFNjZW5lKCkudGhlbigpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgeyBGaXJld29ya1NjZW5lMSB9IiwiaW1wb3J0IHsgUGFydGljbGVFbWl0U2hhcGVDeWxpbmRlciwgUGFydGljbGVFbWl0dGVyLCBQYXJ0aWNsZUVtaXRTaGFwZVBvaW50IH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L3BhcnRpY2xlX2VtaXR0ZXIuanMnXHJcbmltcG9ydCB7IFBhcnRpY2xlUmVuZGVyZXIsIFRleHR1cmVQYXJ0aWNsZVJlbmRlcmVyIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L3BhcnRpY2xlX3JlbmRlcmVyLmpzJ1xyXG5pbXBvcnQgVHJhbnNmb3JtIGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC90cmFuc2Zvcm0uanMnXHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vbGliL2NvbG9yL2NvbG9yLmpzJ1xyXG5cclxuZnVuY3Rpb24gRXhwbG9zaW9uIChhcHAsIHRleHR1cmUsIHBvcywgY29sb3IpIHtcclxuICBjb25zdCBzY2VuZSA9IGFwcC5zY2VuZVxyXG4gIGNvbnN0IGUgPSBzY2VuZS5jcmVhdGVFbnRpdHkoKVxyXG5cclxuICBlLmFkZENvbXBvbmVudChuZXcgVHJhbnNmb3JtKCkpXHJcbiAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS50cmFuc2xhdGUocG9zKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBUZXh0dXJlUGFydGljbGVSZW5kZXJlcih7XHJcbiAgICB0ZXh0dXJlOiB0ZXh0dXJlLFxyXG4gICAgYmxlbmRNb2RlOiBQYXJ0aWNsZVJlbmRlcmVyLkJMRU5EX01PREUuQURELFxyXG4gICAgZW5hYmxlQmlsbGJvYXJkOiB0cnVlLFxyXG4gIH0pKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBQYXJ0aWNsZUVtaXR0ZXIoKSlcclxuXHJcbiAgY29uc3QgcGFydGljbGVFbWl0dGVyID0gZS5nZXRDb21wb25lbnQoUGFydGljbGVFbWl0dGVyKVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVJlbmRlcmVyID0gZS5nZXRDb21wb25lbnQoVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIpXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmNvdW50ID0gMTAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmxpZmUgPSAyMDAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmV4cGxvc2l2ZSA9IDFcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFyYW0ubG9jYWxDb29yZHMgPSBmYWxzZVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJhbS5vbmVTaG90ID0gdHJ1ZVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmVtaXRTaGFwZSA9IG5ldyBQYXJ0aWNsZUVtaXRTaGFwZVBvaW50KClcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5kaXJlY3Rpb25bMV0gPSAxXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc3ByZWFkID0gMTgwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0ubWluID0gMC4zXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0ubWF4ID0gMS4zXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0udmFyaWFudEZ1bmN0aW9uID0gKHQpID0+ICgxLXQpXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uY29sb3IucGFyYW0ubWluID0gY29sb3JcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS5tYXggPSBjb2xvclxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmNvbG9yLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9ICh0KSA9PiBbMSwgMSwgMSwgMS10XVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmxpbmVhclZlbG9jaXR5LnBhcmFtLm1pbiA9IDAuNVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmxpbmVhclZlbG9jaXR5LnBhcmFtLm1heCA9IDEzLjlcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5yYWRpYWxBY2NlbGVyYXRpb24ucGFyYW0ubWluID0gMFxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnJhZGlhbEFjY2VsZXJhdGlvbi5wYXJhbS5tYXggPSAxMS45XHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ucmFkaWFsQWNjZWxlcmF0aW9uLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9ICh0KSA9PiAoMS10KVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmRhbXBpbmcucGFyYW0ubWluID0gMC4wMVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmRhbXBpbmcucGFyYW0ubWF4ID0gMC4xXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGFtcGluZy5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSAodCkgPT4gKHQpXHJcbiAgcGFydGljbGVFbWl0dGVyLnNpZ25hbHMuZW1pc3Npb25FbmQuY29ubmVjdCgoKSA9PiB7ZS5xdWV1ZURlc3Ryb3koKX0pXHJcblxyXG4gIHBhcnRpY2xlRW1pdHRlci5zdGFydEVtaXNzaW9uKClcclxuXHJcbiAgcmV0dXJuIGVcclxufVxyXG5cclxuZXhwb3J0IHsgRXhwbG9zaW9uIH0iLCJpbXBvcnQgeyBQYXJ0aWNsZUVtaXRTaGFwZUN5bGluZGVyLCBQYXJ0aWNsZUVtaXR0ZXIsIFBhcnRpY2xlRW1pdFNoYXBlUG9pbnQgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvcGFydGljbGVfZW1pdHRlci5qcydcclxuaW1wb3J0IHsgUGFydGljbGVSZW5kZXJlciwgVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvcGFydGljbGVfcmVuZGVyZXIuanMnXHJcbmltcG9ydCBUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L3RyYW5zZm9ybS5qcydcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi9saWIvY29sb3IvY29sb3IuanMnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi8uLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5cclxuZnVuY3Rpb24gRmlyZSAoYXBwLCB0ZXh0dXJlLCBwb3MpIHtcclxuICBjb25zdCBzY2VuZSA9IGFwcC5zY2VuZVxyXG4gIGNvbnN0IGUgPSBzY2VuZS5jcmVhdGVFbnRpdHkoKVxyXG5cclxuICBlLmFkZENvbXBvbmVudChuZXcgVHJhbnNmb3JtKCkpXHJcbiAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS50cmFuc2xhdGUocG9zKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBUZXh0dXJlUGFydGljbGVSZW5kZXJlcih7XHJcbiAgICB0ZXh0dXJlOiB0ZXh0dXJlLFxyXG4gICAgYmxlbmRNb2RlOiBQYXJ0aWNsZVJlbmRlcmVyLkJMRU5EX01PREUuQURELFxyXG4gICAgZW5hYmxlQmlsbGJvYXJkOiB0cnVlLFxyXG4gIH0pKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBQYXJ0aWNsZUVtaXR0ZXIoKSlcclxuXHJcbiAgY29uc3QgcGFydGljbGVFbWl0dGVyID0gZS5nZXRDb21wb25lbnQoUGFydGljbGVFbWl0dGVyKVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVJlbmRlcmVyID0gZS5nZXRDb21wb25lbnQoVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIpXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmNvdW50ID0gMTAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmxpZmUgPSAxMDAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmV4cGxvc2l2ZSA9IDAuMVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJhbS5sb2NhbENvb3JkcyA9IGZhbHNlXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLm9uZVNob3QgPSBmYWxzZVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmVtaXRTaGFwZSA9IG5ldyBQYXJ0aWNsZUVtaXRTaGFwZVBvaW50KClcclxuICB2ZWMzLmNvcHkocGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGlyZWN0aW9uLCBbMCwgMSwgMF0pXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc3ByZWFkID0gMFxyXG4gIHZlYzMuY29weShwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5ncmF2aXR5LCBbMCwgMCwgMF0pXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uc2NhbGUucGFyYW0ubWluID0gMVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnNjYWxlLnBhcmFtLm1heCA9IDEuOFxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnNjYWxlLnBhcmFtLnZhcmlhbnRGdW5jdGlvbiA9ICh0KSA9PiAoNCp0LTQqdCp0KVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmNvbG9yLnBhcmFtLm1pbiA9IENvbG9yLnJnYmFTdHJpbmdUb0NvbG9yKCdyZ2JhKDIyNSwgMjAzLCAzNiwgMSknKVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmNvbG9yLnBhcmFtLm1heCA9IENvbG9yLnJnYmFTdHJpbmdUb0NvbG9yKCdyZ2JhKDIxNywgNjksIDUsIDEpJylcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSAodCkgPT4gWzEsIDEsIDEsIDQqdC00KnQqdF1cclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5saW5lYXJWZWxvY2l0eS5wYXJhbS5taW4gPSAxLjNcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5saW5lYXJWZWxvY2l0eS5wYXJhbS5tYXggPSA1LjJcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5yYWRpYWxBY2NlbGVyYXRpb24ucGFyYW0ubWluID0gMFxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnJhZGlhbEFjY2VsZXJhdGlvbi5wYXJhbS5tYXggPSAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGFtcGluZy5wYXJhbS5taW4gPSAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGFtcGluZy5wYXJhbS5tYXggPSAwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uYW5pbWF0aW9uSEZyYW1lcyA9IDJcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5hbmltYXRpb25WRnJhbWVzID0gMlxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnJhbmRvbUFuaW1hdGlvbkZyYW1lLnBhcmFtLm1pbiA9IDBcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5yYW5kb21BbmltYXRpb25GcmFtZS5wYXJhbS5tYXggPSAzXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZW5hYmxlUmFuZG9tQW5pbWF0aW9uRnJhbWUgPSB0cnVlXHJcblxyXG5cclxuICBwYXJ0aWNsZUVtaXR0ZXIuc3RhcnRFbWlzc2lvbigpXHJcblxyXG4gIHJldHVybiBlXHJcbn1cclxuXHJcbmV4cG9ydCB7IEZpcmUgfSIsImltcG9ydCB7IFBlcnNwZWN0aXZlQ2FtZXJhIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2NhbWVyYS5qcydcclxuaW1wb3J0IHsgQ29udHJvbFRyaWdnZXIsIEZpcnN0UGVyc29uQ29udHJvbGxlciB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9maXJzdF9wZXJzb25fY29udHJvbGxlci5qcydcclxuaW1wb3J0IFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvdHJhbnNmb3JtLmpzJ1xyXG5cclxuXHJcbmZ1bmN0aW9uIEZQU0NhbWVyYSAoYXBwLCBwb3MpIHtcclxuICBjb25zdCBzY2VuZSA9IGFwcC5zY2VuZVxyXG4gIGNvbnN0IGUgPSBzY2VuZS5jcmVhdGVFbnRpdHkoKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBUcmFuc2Zvcm0oKSlcclxuICBlLmdldENvbXBvbmVudChUcmFuc2Zvcm0pLnRyYW5zbGF0ZShwb3MgPz8gWy0yLjQyLCA3LjI0LCAzNS40MV0pXHJcbiAgZS5hZGRDb21wb25lbnQobmV3IFBlcnNwZWN0aXZlQ2FtZXJhKCkpXHJcbiAgZS5hZGRDb21wb25lbnQobmV3IEZpcnN0UGVyc29uQ29udHJvbGxlcigpKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBDb250cm9sVHJpZ2dlcigpKVxyXG4gIGUuZ2V0Q29tcG9uZW50KENvbnRyb2xUcmlnZ2VyKS5jb250cm9sbGVyID0gZS5nZXRDb21wb25lbnQoJ0ZpcnN0UGVyc29uQ29udHJvbGxlcicpXHJcbiAgcmV0dXJuIGVcclxufVxyXG5cclxuZXhwb3J0IHsgRlBTQ2FtZXJhIH0iLCJpbXBvcnQgVHJhbnNmb3JtIGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC90cmFuc2Zvcm0uanMnXHJcbmltcG9ydCB1dGlscyBmcm9tICcuLi8uLi8uLi9jb3JlL3V0aWxzLmpzJ1xyXG5cclxuY2xhc3MgR2VuZXJhdG9yQ29tcG9uZW50IHtcclxuXHJcbiAgc3RhcnRlZCA9IGZhbHNlXHJcblxyXG4gIHBhcmFtID0ge1xyXG4gICAgbWluOiAwLFxyXG4gICAgbWF4OiAxMDAwLFxyXG4gICAgY2FsbGJhY2s6IG51bGwsXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAoY2FsbGJhY2ssIG1pblRpbWUsIG1heFRpbWUpIHtcclxuICAgIHRoaXMucGFyYW0ubWluID0gbWluVGltZSA/PyB0aGlzLnBhcmFtLm1pblxyXG4gICAgdGhpcy5wYXJhbS5tYXggPSBtYXhUaW1lID8/IHRoaXMucGFyYW0ubWF4XHJcbiAgICB0aGlzLnBhcmFtLmNhbGxiYWNrID0gY2FsbGJhY2tcclxuICB9XHJcblxyXG4gIG9uVGltZW91dCAoKSB7XHJcbiAgICBpZiAodGhpcy5wYXJhbS5jYWxsYmFjaykge1xyXG4gICAgICB0aGlzLnBhcmFtLmNhbGxiYWNrKHRoaXMudHJhbnNmb3JtLmdsb2JhbE9yaWdpbilcclxuICAgICAgc2V0VGltZW91dCgoKT0+e3RoaXMub25UaW1lb3V0KCl9LCB1dGlscy5yYW5kb21SYW5nZSh0aGlzLnBhcmFtLm1pbiwgdGhpcy5wYXJhbS5tYXgpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWRkZWQgKCkge1xyXG4gICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlIChkZWx0YSkge1xyXG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcclxuICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZVxyXG4gICAgICBzZXRUaW1lb3V0KCgpPT57dGhpcy5vblRpbWVvdXQoKX0sIHV0aWxzLnJhbmRvbVJhbmdlKHRoaXMucGFyYW0ubWluLCB0aGlzLnBhcmFtLm1heCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIEdlbmVyYXRvciAoYXBwLCBvcmlnaW4sIGdlbmVyYXRlQ2FsbGJhY2ssIG1pblRpbWUsIG1heFRpbWUpIHtcclxuICBjb25zdCBzY2VuZSA9IGFwcC5zY2VuZVxyXG4gIGNvbnN0IGUgPSBzY2VuZS5jcmVhdGVFbnRpdHkoKVxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBUcmFuc2Zvcm0oKSlcclxuICBlLmdldENvbXBvbmVudChUcmFuc2Zvcm0pLnRyYW5zbGF0ZShvcmlnaW4pXHJcbiAgZS5hZGRDb21wb25lbnQobmV3IEdlbmVyYXRvckNvbXBvbmVudChnZW5lcmF0ZUNhbGxiYWNrLCBtaW5UaW1lLCBtYXhUaW1lKSlcclxuICByZXR1cm4gZVxyXG59XHJcblxyXG5leHBvcnQgeyBHZW5lcmF0b3IgfSIsImltcG9ydCB7IFBhcnRpY2xlRW1pdFNoYXBlQ3lsaW5kZXIsIFBhcnRpY2xlRW1pdHRlciB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9wYXJ0aWNsZV9lbWl0dGVyLmpzJ1xyXG5pbXBvcnQgeyBQYXJ0aWNsZVJlbmRlcmVyLCBUZXh0dXJlUGFydGljbGVSZW5kZXJlciB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9wYXJ0aWNsZV9yZW5kZXJlci5qcydcclxuaW1wb3J0IFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvdHJhbnNmb3JtLmpzJ1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vY29yZS91dGlscy5qcydcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi9saWIvY29sb3IvY29sb3IuanMnXHJcbmltcG9ydCB7IEV4cGxvc2lvbiB9IGZyb20gJy4uL2V4cGxvc2lvbi9leHBsb3Npb24uanMnXHJcblxyXG5jbGFzcyBSb2NrZXRDb21wb25lbnQge1xyXG5cclxuICBhZ2UgPSAyMDAwXHJcbiAgd2FpdFRpbWUgPSAyMDAwXHJcbiAgbW92ZVNwZWVkID0gMTBcclxuXHJcbiAgY29uc3RydWN0b3IgKCkge1xyXG5cclxuICB9XHJcblxyXG4gIGFkZGVkICgpIHtcclxuICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSlcclxuICAgIHRoaXMucGFydGljbGVFbWl0dGVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KFBhcnRpY2xlRW1pdHRlcilcclxuICAgIHRoaXMucGFydGljbGVSZW5kZXJlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChUZXh0dXJlUGFydGljbGVSZW5kZXJlcilcclxuICB9XHJcblxyXG4gIHVwZGF0ZSAoZGVsdGEpIHtcclxuICAgIHRoaXMuYWdlIC09IGRlbHRhXHJcblxyXG4gICAgaWYgKHRoaXMuYWdlID4gMCkge1xyXG4gICAgICBjb25zdCBvcmlnaW4gPSB0aGlzLnRyYW5zZm9ybS5nbG9iYWxPcmlnaW5cclxuICAgICAgb3JpZ2luWzFdICs9IHRoaXMubW92ZVNwZWVkICogZGVsdGEgLyAxMDAwXHJcbiAgICAgIHRoaXMudHJhbnNmb3JtLmdsb2JhbE9yaWdpbiA9IG9yaWdpblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMucGFydGljbGVFbWl0dGVyLnJ1bnRpbWUuZW1pdHRpbmcpIHtcclxuICAgICAgICB0aGlzLnBhcnRpY2xlRW1pdHRlci5zdG9wRW1pc3Npb24oKVxyXG4gICAgICAgIEV4cGxvc2lvbih0aGlzLmVudGl0eS5hcHAsIHRoaXMucGFydGljbGVSZW5kZXJlci50ZXh0dXJlLCB0aGlzLnRyYW5zZm9ybS5nbG9iYWxPcmlnaW4sIHRoaXMucGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uY29sb3IucGFyYW0ubWluKVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMud2FpdFRpbWUgLT0gZGVsdGFcclxuICAgIH1cclxuICAgIGlmICh0aGlzLndhaXRUaW1lIDwgMCkge1xyXG4gICAgICB0aGlzLmVudGl0eS5xdWV1ZURlc3Ryb3koKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmNvbnN0IEVYUExPU0lPTl9DT0xPUiA9IFtcclxuICBDb2xvci50b1JHQkEoJzAwMDBGRicpLFxyXG4gIENvbG9yLnRvUkdCQSgnRkYwMEZGJyksXHJcbiAgQ29sb3IudG9SR0JBKCdEQzE0M0MnKSxcclxuICBDb2xvci50b1JHQkEoJzAwRkZGRicpLFxyXG4gIENvbG9yLnRvUkdCQSgnMDBGRjdGJyksXHJcbiAgQ29sb3IudG9SR0JBKCdGRkZGMDAnKSxcclxuICBDb2xvci50b1JHQkEoJ0Y0QTQ2MCcpLFxyXG5dXHJcblxyXG5mdW5jdGlvbiBnZXRFeHBsb3Npb25Db2xvciAoKSB7XHJcbiAgcmV0dXJuIEVYUExPU0lPTl9DT0xPUltNYXRoLmZsb29yKHV0aWxzLnJhbmRvbVJhbmdlKDAsIEVYUExPU0lPTl9DT0xPUi5sZW5ndGgpKV1cclxufVxyXG5cclxuZnVuY3Rpb24gUm9ja2V0IChhcHAsIHRleHR1cmUsIHBvcykge1xyXG4gIGNvbnN0IHNjZW5lID0gYXBwLnNjZW5lXHJcbiAgY29uc3QgZSA9IHNjZW5lLmNyZWF0ZUVudGl0eSgpXHJcbiAgZS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gIGUuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSkudHJhbnNsYXRlKHBvcylcclxuICBlLmFkZENvbXBvbmVudChuZXcgVGV4dHVyZVBhcnRpY2xlUmVuZGVyZXIoe1xyXG4gICAgdGV4dHVyZTogdGV4dHVyZSxcclxuICAgIGJsZW5kTW9kZTogUGFydGljbGVSZW5kZXJlci5CTEVORF9NT0RFLkFERCxcclxuICAgIGVuYWJsZUJpbGxib2FyZDogdHJ1ZSxcclxuICB9KSlcclxuICBlLmFkZENvbXBvbmVudChuZXcgUGFydGljbGVFbWl0dGVyKCkpXHJcblxyXG4gIGNvbnN0IHBhcnRpY2xlRW1pdHRlciA9IGUuZ2V0Q29tcG9uZW50KFBhcnRpY2xlRW1pdHRlcilcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVSZW5kZXJlciA9IGUuZ2V0Q29tcG9uZW50KFRleHR1cmVQYXJ0aWNsZVJlbmRlcmVyKVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJhbS5jb3VudCA9IDIwXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcmFtLmV4cGxvc2l2ZSA9IDBcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFyYW0ubG9jYWxDb29yZHMgPSBmYWxzZVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJhbS5vbmVTaG90ID0gZmFsc2VcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5lbWl0U2hhcGUgPSBuZXcgUGFydGljbGVFbWl0U2hhcGVDeWxpbmRlcigwLCAwLCAwLjIpXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0uZGlyZWN0aW9uWzFdID0gLTFcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5zcHJlYWQgPSAxNVxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnNjYWxlLnBhcmFtLm1pbiA9IDAuM1xyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLnNjYWxlLnBhcmFtLm1heCA9IDFcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5zY2FsZS5wYXJhbS52YXJpYW50RnVuY3Rpb24gPSAodCkgPT4gKDEtdClcclxuICBjb25zdCBjb2xvciA9IGdldEV4cGxvc2lvbkNvbG9yKClcclxuICBwYXJ0aWNsZUVtaXR0ZXIucGFydGljbGVQYXJhbS5jb2xvci5wYXJhbS5taW4gPSBjb2xvclxyXG4gIHBhcnRpY2xlRW1pdHRlci5wYXJ0aWNsZVBhcmFtLmNvbG9yLnBhcmFtLm1heCA9IGNvbG9yXHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGluZWFyVmVsb2NpdHkucGFyYW0ubWluID0gNC41XHJcbiAgcGFydGljbGVFbWl0dGVyLnBhcnRpY2xlUGFyYW0ubGluZWFyVmVsb2NpdHkucGFyYW0ubWF4ID0gMTkuNVxyXG5cclxuICBwYXJ0aWNsZUVtaXR0ZXIuc3RhcnRFbWlzc2lvbigpXHJcblxyXG4gIGUuYWRkQ29tcG9uZW50KG5ldyBSb2NrZXRDb21wb25lbnQoKSlcclxuXHJcbiAgcmV0dXJuIGVcclxufVxyXG5cclxuZXhwb3J0IHsgUm9ja2V0IH0iLCJpbXBvcnQgU2NlbmUgZnJvbSAnLi4vc2NlbmUuanMnXHJcbmltcG9ydCB7IENvbnRyb2xUcmlnZ2VyLCBGaXJzdFBlcnNvbkNvbnRyb2xsZXIgfSBmcm9tICcuLi9jb21wb25lbnQvZmlyc3RfcGVyc29uX2NvbnRyb2xsZXIuanMnXHJcbmltcG9ydCB7IFBsYW5lTWVzaCwgU3BoZXJlTWVzaCwgVHJpYW5nbGUzRE1lc2ggfSBmcm9tICcuLi9yZXNvdXJjZXMvbWVzaC5qcydcclxuaW1wb3J0IHsgUGFydGljbGVFbWl0dGVyIH0gZnJvbSAnLi4vY29tcG9uZW50L3BhcnRpY2xlX2VtaXR0ZXIuanMnXHJcbmltcG9ydCB7IFBhcnRpY2xlUmVuZGVyZXIsIFRleHR1cmVQYXJ0aWNsZVJlbmRlcmVyIH0gZnJvbSAnLi4vY29tcG9uZW50L3BhcnRpY2xlX3JlbmRlcmVyLmpzJ1xyXG5pbXBvcnQgeyBQYXJ0aWNsZUVtaXR0ZXJDb250cm9sbGVyMSB9IGZyb20gJy4uL2NvbXBvbmVudC9wYXJ0aWNsZV9lbWl0dGVyX2NvbnRyb2xsZXIuanMnXHJcbmltcG9ydCB7IFNpbXBsZU1lc2hTaGFkZXIgfSBmcm9tICcuLi9yZXNvdXJjZXMvc2hhZGVyLmpzJ1xyXG5pbXBvcnQgeyBQZXJzcGVjdGl2ZUNhbWVyYSB9IGZyb20gJy4uL2NvbXBvbmVudC9jYW1lcmEuanMnXHJcbmltcG9ydCB7IEN1c3RvbUFuaW1hdGUxIH0gZnJvbSAnLi4vY29tcG9uZW50L2N1c3RvbV9hbmltYXRlXzEuanMnXHJcbmltcG9ydCBNZXNoUmVuZGVyZXIgZnJvbSAnLi4vY29tcG9uZW50L21lc2hfcmVuZGVyZXIuanMnXHJcbmltcG9ydCBUcmFuc2Zvcm0gZnJvbSAnLi4vY29tcG9uZW50L3RyYW5zZm9ybS5qcydcclxuaW1wb3J0IHsgZ2xNYXRyaXgsIG1hdDMsIG1hdDQgfSBmcm9tICcuLi9saWIvZ2wtbWF0cml4L2luZGV4LmpzJ1xyXG5cclxuY2xhc3MgVGVzdFNjZW5lMSBleHRlbmRzIFNjZW5lIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgfVxyXG5cclxuICBhc3luYyBzZXRVcFNjZW5lICgpIHtcclxuICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwXHJcbiAgICBjb25zdCByZXNvdXJjZVNlcnZlciA9IGFwcC5yZXNvdXJjZVNlcnZlclxyXG4gICAgXHJcbiAgICBjb25zdCBtZXNoID0gYXBwLmNyZWF0ZVJlc291cmNlKFRyaWFuZ2xlM0RNZXNoKVxyXG4gICAgY29uc3Qgc2hhZGVyID0gYXBwLmNyZWF0ZVJlc291cmNlKFNpbXBsZU1lc2hTaGFkZXIsXHJcbiAgICAgIGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvc2hhZGVycy91bmxpdDMudnMnKSxcclxuICAgICAgYXdhaXQgcmVzb3VyY2VTZXJ2ZXIubG9hZChfX1JPT1RfUEFUSF9fICsgJ2Fzc2V0cy9zaGFkZXJzL3VubGl0My5mcycpKVxyXG4gICAgc2hhZGVyLnBhcmFtZXRlcnMudGV4MSA9IGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvaW1hZ2VzL2NoaWNrZW4ucG5nJylcclxuICAgIHNoYWRlci5wYXJhbWV0ZXJzLnRleDIgPSBhd2FpdCByZXNvdXJjZVNlcnZlci5sb2FkKF9fUk9PVF9QQVRIX18gKyAnYXNzZXRzL2ltYWdlcy9oaS5wbmcnKVxyXG4gICAgXHJcbiAgICBtZXNoLnNoYWRlciA9IHNoYWRlclxyXG5cclxuICAgIC8vIGNyZWF0ZSBtZXNoIG9iamVjdHNcclxuICAgIHZhciBlID0gdGhpcy5jcmVhdGVFbnRpdHkoKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IEN1c3RvbUFuaW1hdGUxKCkpXHJcbiAgICBlLmdldENvbXBvbmVudChUcmFuc2Zvcm0pLnRyYW5zbGF0ZShbMCwgMCwgLTUuMF0pXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgTWVzaFJlbmRlcmVyKCkpXHJcbiAgICBlLmdldENvbXBvbmVudChNZXNoUmVuZGVyZXIpLm1lc2ggPSBtZXNoXHJcblxyXG4gICAgZSA9IHRoaXMuY3JlYXRlRW50aXR5KClcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBUcmFuc2Zvcm0oKSlcclxuICAgIGUuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSkudHJhbnNsYXRlKFs1LjAsIDUuNSwgLTUuMF0pXHJcbiAgICAvLyBlLmFkZENvbXBvbmVudChuZXcgQ3VzdG9tQW5pbWF0ZTEoKSlcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBNZXNoUmVuZGVyZXIoKSlcclxuICAgIGUuZ2V0Q29tcG9uZW50KE1lc2hSZW5kZXJlcikubWVzaCA9IG1lc2hcclxuXHJcbiAgICBlID0gdGhpcy5jcmVhdGVFbnRpdHkoKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gICAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS50cmFuc2xhdGUoWy01LjAsIDAsIC01LjBdKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IEN1c3RvbUFuaW1hdGUxKCkpXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgTWVzaFJlbmRlcmVyKCkpXHJcbiAgICBlLmdldENvbXBvbmVudChNZXNoUmVuZGVyZXIpLm1lc2ggPSBtZXNoXHJcblxyXG4gICAgY29uc3QgZTEgPSB0aGlzLmNyZWF0ZUVudGl0eSgpXHJcbiAgICBlMS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gICAgZTEuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSkudHJhbnNsYXRlKFstNS4wLCAtMTAuMCwgMC4wXSlcclxuICAgIGUxLmFkZENvbXBvbmVudChuZXcgQ3VzdG9tQW5pbWF0ZTEoKSlcclxuICAgIGUxLmFkZENvbXBvbmVudChuZXcgTWVzaFJlbmRlcmVyKCkpXHJcbiAgICBlMS5nZXRDb21wb25lbnQoTWVzaFJlbmRlcmVyKS5tZXNoID0gbWVzaFxyXG4gICAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS5hZGRDaGlsZChlMS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKSlcclxuXHJcbiAgICBlID0gdGhpcy5jcmVhdGVFbnRpdHkoKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gICAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS50cmFuc2xhdGUoWzAsIDUsIDBdKVxyXG4gICAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS5zY2FsZShbMiwgMiwgMl0pXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgTWVzaFJlbmRlcmVyKCkpXHJcbiAgICBjb25zdCBzcGhlcmVNZXNoID0gYXBwLmNyZWF0ZVJlc291cmNlKFNwaGVyZU1lc2gpXHJcbiAgICBzcGhlcmVNZXNoLnNoYWRlciA9IGFwcC5jcmVhdGVSZXNvdXJjZShTaW1wbGVNZXNoU2hhZGVyLFxyXG4gICAgICBhd2FpdCByZXNvdXJjZVNlcnZlci5sb2FkKF9fUk9PVF9QQVRIX18gKyAnYXNzZXRzL3NoYWRlcnMvdW5saXQzLnZzJyksXHJcbiAgICAgIGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvc2hhZGVycy91bmxpdDMuZnMnKSlcclxuICAgIHNwaGVyZU1lc2guc2hhZGVyLnBhcmFtZXRlcnMudGV4MSA9IGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvaW1hZ2VzL2NoaWNrZW4ucG5nJylcclxuICAgIHNwaGVyZU1lc2guc2hhZGVyLnBhcmFtZXRlcnMudGV4MiA9IGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvaW1hZ2VzL2hpLnBuZycpXHJcbiAgICBzcGhlcmVNZXNoLnNoYWRlci5wYXJhbWV0ZXJzLmN1bGxNb2RlID0gU2ltcGxlTWVzaFNoYWRlci5DVUxMX01PREUuTk9ORVxyXG4gICAgZS5nZXRDb21wb25lbnQoTWVzaFJlbmRlcmVyKS5tZXNoICA9IHNwaGVyZU1lc2hcclxuXHJcbiAgICAvLyBjcmVhdGUgY2FtZXJhXHJcbiAgICAvLyBwb2ludGluZyB0byAteiBkZWZ1YWx0XHJcbiAgICBlID0gdGhpcy5jcmVhdGVFbnRpdHkoKVxyXG4gICAgZS5hZGRDb21wb25lbnQobmV3IFRyYW5zZm9ybSgpKVxyXG4gICAgZS5nZXRDb21wb25lbnQoVHJhbnNmb3JtKS50cmFuc2xhdGUoWy0yLjQyLCA3LjI0LCAzNS40MV0pXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgUGVyc3BlY3RpdmVDYW1lcmEoKSlcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBGaXJzdFBlcnNvbkNvbnRyb2xsZXIoKSlcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBDb250cm9sVHJpZ2dlcigpKVxyXG4gICAgZS5nZXRDb21wb25lbnQoQ29udHJvbFRyaWdnZXIpLmNvbnRyb2xsZXIgPSBlLmdldENvbXBvbmVudCgnRmlyc3RQZXJzb25Db250cm9sbGVyJylcclxuXHJcbiAgICAvLyBjcmVhdGUgcGFydGljbGUgZW1pdHRlclxyXG4gICAgZSA9IHRoaXMuY3JlYXRlRW50aXR5KClcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBUcmFuc2Zvcm0oKSlcclxuICAgIGUuZ2V0Q29tcG9uZW50KFRyYW5zZm9ybSkudHJhbnNsYXRlKFstMTAsIDUsIDEwXSlcclxuICAgIGUuYWRkQ29tcG9uZW50KG5ldyBUZXh0dXJlUGFydGljbGVSZW5kZXJlcih7XHJcbiAgICAgIHRleHR1cmU6IGF3YWl0IHJlc291cmNlU2VydmVyLmxvYWQoX19ST09UX1BBVEhfXyArICdhc3NldHMvaW1hZ2VzL3BhcnRpY2xlLnBuZycpLFxyXG4gICAgICAvLyB0ZXh0dXJlOiBhd2FpdCByZXNvdXJjZVNlcnZlci5sb2FkKF9fUk9PVF9QQVRIX18gKyAnYXNzZXRzL2ltYWdlcy9mbGFtZXMucG5nJyksXHJcbiAgICAgIGJsZW5kTW9kZTogUGFydGljbGVSZW5kZXJlci5CTEVORF9NT0RFLkFERCxcclxuICAgICAgZW5hYmxlQmlsbGJvYXJkOiB0cnVlLFxyXG4gICAgfSkpXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgUGFydGljbGVFbWl0dGVyKCkpXHJcbiAgICBlLmdldENvbXBvbmVudChQYXJ0aWNsZUVtaXR0ZXIpLnBhcnRpY2xlUmVuZGVyZXIgPSBlLmdldENvbXBvbmVudChUZXh0dXJlUGFydGljbGVSZW5kZXJlcilcclxuICAgIGUuZ2V0Q29tcG9uZW50KFBhcnRpY2xlRW1pdHRlcikucGFyYW0uZXhwbG9zaXZlID0gMFxyXG4gICAgZS5nZXRDb21wb25lbnQoUGFydGljbGVFbWl0dGVyKS5wYXJhbS5vbmVTaG90ID0gZmFsc2VcclxuICAgIGNvbnN0IGVlZSA9IGVcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge2VlZS5nZXRDb21wb25lbnQoUGFydGljbGVFbWl0dGVyKS5zdGFydEVtaXNzaW9uKCl9LCAxMDApXHJcbiAgICBlLmFkZENvbXBvbmVudChuZXcgUGFydGljbGVFbWl0dGVyQ29udHJvbGxlcjEoKSlcclxuICB9XHJcblxyXG4gIGVudGVyICgpIHtcclxuICAgIGNvbnN0IGFwcCA9IHRoaXMuYXBwXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2xlZnQnLCBLZXlib2FyZEV2ZW50LCAnS2V5QScpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX3JpZ2h0JywgS2V5Ym9hcmRFdmVudCwgJ0tleUQnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV91cCcsIEtleWJvYXJkRXZlbnQsICdLZXlXJylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfZG93bicsIEtleWJvYXJkRXZlbnQsICdLZXlTJylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ2ludGVyYWN0JywgS2V5Ym9hcmRFdmVudCwgJ0tleUUnKVxyXG5cclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfbGVmdCcsIEtleWJvYXJkRXZlbnQsICdBcnJvd0xlZnQnKVxyXG4gICAgYXBwLmlucHV0TWFuYWdlci5hZGRJbnB1dEFjdGlvbignbW92ZV9yaWdodCcsIEtleWJvYXJkRXZlbnQsICdBcnJvd1JpZ2h0JylcclxuICAgIGFwcC5pbnB1dE1hbmFnZXIuYWRkSW5wdXRBY3Rpb24oJ21vdmVfdXAnLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dVcCcpXHJcbiAgICBhcHAuaW5wdXRNYW5hZ2VyLmFkZElucHV0QWN0aW9uKCdtb3ZlX2Rvd24nLCBLZXlib2FyZEV2ZW50LCAnQXJyb3dEb3duJylcclxuXHJcbiAgICB0aGlzLnNldFVwU2NlbmUoKS50aGVuKClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7IFRlc3RTY2VuZTEgfSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IEFwcCBmcm9tICcuL2FwcC5qcydcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuL2xpYi9jb2xvci9jb2xvci5qcydcclxuaW1wb3J0IHsgRmlyZXdvcmtTY2VuZTEgfSBmcm9tICcuL3Rlc3QxL2ZpcmV3b3JrX3NjZW5lMS5qcydcclxuaW1wb3J0IHsgRmlyZVNjZW5lMSB9IGZyb20gJy4vdGVzdDEvZmlyZV9zY2VuZTEuanMnXHJcbmltcG9ydCB7IFRlc3RTY2VuZTEgfSBmcm9tICcuL3Rlc3QxL3Rlc3Rfc2NlbmUxLmpzJ1xyXG5cclxuVnVlLmNvbXBvbmVudCgndmVjdG9yLTMtZWRpdG9yJywge1xyXG4gIHByb3BzOiBbJ3ZhbHVlJ10sXHJcbiAgZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgIH1cclxuICB9LFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgPGRpdiBjbGFzcz1cInZlY3Rvci0zLWVkaXRvclwiPlxyXG4gICAgPGVsLWlucHV0LW51bWJlclxyXG4gICAgICA6Y29udHJvbHM9XCJmYWxzZVwiXHJcbiAgICAgIHNpemU9XCJzbWFsbFwiXHJcbiAgICAgIHBsYWNlaG9sZGVyPVwieFwiXHJcbiAgICAgIHYtbW9kZWw9XCJ2YWx1ZVswXVwiPlxyXG4gICAgPC9lbC1pbnB1dC1udW1iZXI+XHJcbiAgICA8ZWwtaW5wdXQtbnVtYmVyXHJcbiAgICAgIDpjb250cm9scz1cImZhbHNlXCJcclxuICAgICAgc2l6ZT1cInNtYWxsXCJcclxuICAgICAgcGxhY2Vob2xkZXI9XCJ5XCJcclxuICAgICAgdi1tb2RlbD1cInZhbHVlWzFdXCI+XHJcbiAgICA8L2VsLWlucHV0LW51bWJlcj5cclxuICAgIDxlbC1pbnB1dC1udW1iZXJcclxuICAgICAgOmNvbnRyb2xzPVwiZmFsc2VcIlxyXG4gICAgICBzaXplPVwic21hbGxcIlxyXG4gICAgICBwbGFjZWhvbGRlcj1cInpcIlxyXG4gICAgICB2LW1vZGVsPVwidmFsdWVbMl1cIj5cclxuICAgIDwvZWwtaW5wdXQtbnVtYmVyPlxyXG4gIDwvZGl2PlxyXG4gIGAsXHJcbn0pXHJcblxyXG5WdWUuY29tcG9uZW50KCdjb2xvci1lZGl0b3InLCB7XHJcbiAgcHJvcHM6IFsndmFsdWUnXSxcclxuICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtaW5Db2xvcjogJyNmZmZmZmZmZicsXHJcbiAgICAgIG1heENvbG9yOiAnI2ZmZmZmZmZmJyxcclxuICAgIH1cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIG9uTWluQ29sb3JDaGFuZ2VkICh2KSB7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gQ29sb3IucmdiYVN0cmluZ1RvQ29sb3IodilcclxuICAgICAgdGhpcy52YWx1ZVswXVswXSA9IGNvbG9yWzBdXHJcbiAgICAgIHRoaXMudmFsdWVbMF1bMV0gPSBjb2xvclsxXVxyXG4gICAgICB0aGlzLnZhbHVlWzBdWzJdID0gY29sb3JbMl1cclxuICAgICAgdGhpcy52YWx1ZVswXVszXSA9IGNvbG9yWzNdXHJcbiAgICB9LFxyXG4gICAgb25NYXhDb2xvckNoYW5nZWQgKHYpIHtcclxuICAgICAgY29uc3QgY29sb3IgPSBDb2xvci5yZ2JhU3RyaW5nVG9Db2xvcih2KVxyXG4gICAgICB0aGlzLnZhbHVlWzFdWzBdID0gY29sb3JbMF1cclxuICAgICAgdGhpcy52YWx1ZVsxXVsxXSA9IGNvbG9yWzFdXHJcbiAgICAgIHRoaXMudmFsdWVbMV1bMl0gPSBjb2xvclsyXVxyXG4gICAgICB0aGlzLnZhbHVlWzFdWzNdID0gY29sb3JbM11cclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZW1wbGF0ZTogYFxyXG4gIDxkaXYgY2xhc3M9XCJjb2xvci1lZGl0b3JcIj5cclxuICAgIE1pbjpcclxuICAgIDxlbC1jb2xvci1waWNrZXIgdi1tb2RlbD1cIm1pbkNvbG9yXCIgc2l6ZT1cIm1pbmlcIiA6c2hvdy1hbHBoYT1cInRydWVcIiBjb2xvci1mb3JtYXQ9XCJoZXhcIiBAY2hhbmdlPVwib25NaW5Db2xvckNoYW5nZWRcIj48L2VsLWNvbG9yLXBpY2tlcj5cclxuICAgIE1heDpcclxuICAgIDxlbC1jb2xvci1waWNrZXIgdi1tb2RlbD1cIm1heENvbG9yXCIgc2l6ZT1cIm1pbmlcIiA6c2hvdy1hbHBoYT1cInRydWVcIiBjb2xvci1mb3JtYXQ9XCJoZXhcIiBAY2hhbmdlPVwib25NYXhDb2xvckNoYW5nZWRcIj48L2VsLWNvbG9yLXBpY2tlcj5cclxuICA8L2Rpdj5cclxuICBgLFxyXG59KVxyXG5cclxuVnVlLmNvbXBvbmVudCgndmFyaWFudC1mdW5jdGlvbi1lZGl0b3InLCB7XHJcbiAgcHJvcHM6IFsndmFsdWUnXSxcclxuICBkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByYXc6ICcnLFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgb25SYXdDaGFuZ2VkICh2KSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZiA9IChuZXcgRnVuY3Rpb24oYHJldHVybiAke3Z9YCkpLmNhbGwoKVxyXG4gICAgICAgIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdFxcJ3Mgbm90IGEgZnVuY3Rpb24hJylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52YWx1ZS5mdW5jID0gZlxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZS5mdW5jID0gbnVsbFxyXG4gICAgICAgIHRoaXMuJG1lc3NhZ2UuZXJyb3IoYEludmFsaWQgSmF2YVNjcmlwdCBGdW5jdGlvbjogXCIke3Z9XCIuICR7ZX1gKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9LFxyXG4gIHRlbXBsYXRlOiBgXHJcbiAgPGRpdiBjbGFzcz1cInZhcmlhbnQtZnVuY3Rpb24tZWRpdG9yXCI+XHJcbiAgICA8ZWwtaW5wdXQgdi1tb2RlbD1cInJhd1wiIHBsYWNlaG9sZGVyPVwiVmFyaWFudCBGdW5jdGlvblwiIEBjaGFuZ2U9XCJvblJhd0NoYW5nZWRcIj48L2VsLWlucHV0PlxyXG4gIDwvZGl2PlxyXG4gIGAsXHJcbn0pXHJcblxyXG5jb25zdCB2dWVVSSA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI3Z1ZS11aScsXHJcbiAgZGF0YToge1xyXG4gICAgbXNnOiAn6byg5qCH5Y+z6ZSu6L+b5YWlZnBz5qih5byPJyxcclxuICAgIGZwczogMCxcclxuICAgIHBhcnRpY2FsZVN5c3RlbU1lc3NhZ2U6ICcnLFxyXG4gICAgcHM6IHtcclxuICAgICAgY291bnQ6IDIwLFxyXG4gICAgICBsaWZlOiAxLFxyXG4gICAgICBsaWZlUmFuZG9tbmVzczogMCxcclxuICAgICAgZXhwbG9zaXZlOiAwLFxyXG4gICAgICBzcHJlYWQ6IDAsXHJcbiAgICAgIGRpcmVjdGlvbjogWzAsIDAsIDBdLFxyXG4gICAgICBncmF2aXR5OiBbMCwgLTkuOCwgMF0sXHJcblxyXG4gICAgICBzY2FsZTogWzEsIDFdLFxyXG4gICAgICBzY2FsZVZhcmlhbnRGdW5jdGlvbjoge1xyXG4gICAgICAgIGVuYWxlOiBmYWxzZSxcclxuICAgICAgICBmdW5jOiBudWxsLFxyXG4gICAgICB9LFxyXG4gICAgICBhbmdsZTogWzAsIDBdLFxyXG4gICAgICBkYW1waW5nOiBbMCwgMF0sXHJcbiAgICAgIGRhbXBpbmdWYXJpYW50RnVuY3Rpb246IHtcclxuICAgICAgICBlbmFsZTogZmFsc2UsXHJcbiAgICAgICAgZnVuYzogbnVsbCxcclxuICAgICAgfSxcclxuICAgICAgXHJcbiAgICAgIGxpbmVhclZlbG9jaXR5OiBbMTAsIDQwXSxcclxuICAgICAgYW5ndWxhclZlbG9jaXR5OiBbMCwgMF0sXHJcbiAgICAgIGFuZ3VsYXJWZWxvY2l0eVZhcmlhbnRGdW5jdGlvbjoge1xyXG4gICAgICAgIGVuYWxlOiBmYWxzZSxcclxuICAgICAgICBmdW5jOiBudWxsLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5lYXJBY2NlbGVyYXRpb246IFswLCAwXSxcclxuICAgICAgbGluZWFyQWNjZWxlcmF0aW9uVmFyaWFudEZ1bmN0aW9uOiB7XHJcbiAgICAgICAgZW5hbGU6IGZhbHNlLFxyXG4gICAgICAgIGZ1bmM6IG51bGwsXHJcbiAgICAgIH0sXHJcbiAgICAgIHJhZGlhbEFjY2VsZXJhdGlvbjogWzAsIDBdLFxyXG4gICAgICByYWRpYWxBY2NlbGVyYXRpb25WYXJpYW50RnVuY3Rpb246IHtcclxuICAgICAgICBlbmFsZTogZmFsc2UsXHJcbiAgICAgICAgZnVuYzogbnVsbCxcclxuICAgICAgfSxcclxuICAgICAgdGFuZ2VudGlhbEFjY2VsZXJhdGlvbjogWzAsIDBdLFxyXG4gICAgICB0YW5nZW50aWFsQWNjZWxlcmF0aW9uVmFyaWFudEZ1bmN0aW9uOiB7XHJcbiAgICAgICAgZW5hbGU6IGZhbHNlLFxyXG4gICAgICAgIGZ1bmM6IG51bGwsXHJcbiAgICAgIH0sXHJcbiAgICAgIG9yYml0YWxWZWxvY2l0eTogWzAsIDBdLFxyXG4gICAgICBvcmJpdGFsVmVsb2NpdHlWYXJpYW50RnVuY3Rpb246IHtcclxuICAgICAgICBlbmFsZTogZmFsc2UsXHJcbiAgICAgICAgZnVuYzogbnVsbCxcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGNvbG9yOiBbQ29sb3IudG9SR0JBKENvbG9yLndoaXRlKSwgQ29sb3IudG9SR0JBKENvbG9yLndoaXRlKV0sXHJcbiAgICAgIGNvbG9yVmFyaWFudEZ1bmN0aW9uOiB7XHJcbiAgICAgICAgZW5hbGU6IGZhbHNlLFxyXG4gICAgICAgIGZ1bmM6IG51bGwsXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBlbWl0U2hhcGU6IHtcclxuICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICBvcHRpb25zOiBbXHJcbiAgICAgICAgICB7bGFiZWw6ICdQb2ludCcsIHZhbHVlOiAwfSxcclxuICAgICAgICAgIHtsYWJlbDogJ1NwaGVyZScsIHZhbHVlOiAxfSxcclxuICAgICAgICAgIHtsYWJlbDogJ0JveCcsIHZhbHVlOiAyfSxcclxuICAgICAgICAgIHtsYWJlbDogJ0N5bGluZGVyJywgdmFsdWU6IDN9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc3BoZXJlOiBbMCwgMF0sXHJcbiAgICAgICAgYm94OiB7XHJcbiAgICAgICAgICB3OiAwLFxyXG4gICAgICAgICAgaDogMCxcclxuICAgICAgICAgIGw6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjeWxpbmRlcjoge1xyXG4gICAgICAgICAgcjogWzAsIDBdLFxyXG4gICAgICAgICAgaDogMCxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgY29sbGFwc2VQYW5lbHM6IFtdLFxyXG4gICAgfSxcclxuICAgIFxyXG4gIH1cclxufSlcclxuXHJcbmNvbnN0IGFwcCA9IG5ldyBBcHAoJ3ZpZXdlcicpXHJcbmFwcC52dWVVSSA9IHZ1ZVVJXHJcbndpbmRvdy5fX2FwcCA9IGFwcFxyXG5cclxuY29uc3QgcSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcclxuY29uc3Qgc2NlbmUgPSBxLmdldCgnc2NlbmUnKVxyXG5zd2l0Y2ggKHNjZW5lKSB7XHJcbiAgY2FzZSAnZmlyZSc6XHJcbiAgICBhcHAucnVuKG5ldyBGaXJlU2NlbmUxKCkpXHJcbiAgICBicmVha1xyXG4gIGNhc2UgJ2ZpcmV3b3JrJzpcclxuICAgIGFwcC5ydW4obmV3IEZpcmV3b3JrU2NlbmUxKCkpXHJcbiAgICBicmVha1xyXG4gIGRlZmF1bHQ6XHJcbiAgICBhcHAucnVuKG5ldyBUZXN0U2NlbmUxKCkpXHJcbiAgICBicmVha1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9