/* VIEW.co — sculpture filaire du hero (WebGL natif, sans dépendance) */
(function () {
  "use strict";

  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });

  /* Repli silencieux : sans WebGL, le logo reste seul en place. */
  if (!gl) {
    canvas.remove();
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Géométrie : sphère géodésique (icosaèdre subdivisé) ---------- */
  const t = (1 + Math.sqrt(5)) / 2;
  const base = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map((v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  });

  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const verts = base.slice();
  const index = new Map();
  const key = (v) => v.map((c) => c.toFixed(4)).join(",");
  verts.forEach((v, i) => index.set(key(v), i));

  const midpoint = (a, b) => {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const l = Math.hypot(m[0], m[1], m[2]);
    return [m[0] / l, m[1] / l, m[2] / l];
  };

  const addVert = (v) => {
    const k = key(v);
    if (index.has(k)) return index.get(k);
    verts.push(v);
    index.set(k, verts.length - 1);
    return verts.length - 1;
  };

  const triangles = [];
  faces.forEach(([a, b, c]) => {
    const ab = addVert(midpoint(verts[a], verts[b]));
    const bc = addVert(midpoint(verts[b], verts[c]));
    const ca = addVert(midpoint(verts[c], verts[a]));
    triangles.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
  });

  const seen = new Set();
  const edges = [];
  triangles.forEach(([a, b, c]) => {
    [[a, b], [b, c], [c, a]].forEach(([i, j]) => {
      const k = i < j ? i + ":" + j : j + ":" + i;
      if (!seen.has(k)) {
        seen.add(k);
        edges.push(i, j);
      }
    });
  });

  const positions = new Float32Array(edges.length * 3);
  edges.forEach((vi, n) => {
    positions[n * 3] = verts[vi][0];
    positions[n * 3 + 1] = verts[vi][1];
    positions[n * 3 + 2] = verts[vi][2];
  });

  /* ---------- Shaders ---------- */
  const vsSource = [
    "attribute vec3 aPos;",
    "uniform mat4 uProjection;",
    "uniform mat4 uView;",
    "uniform mat4 uModel;",
    "varying float vDepth;",
    "void main() {",
    "  vec4 mv = uView * uModel * vec4(aPos, 1.0);",
    "  vDepth = -mv.z;",
    "  gl_Position = uProjection * mv;",
    "}",
  ].join("\n");

  const fsSource = [
    "precision mediump float;",
    "uniform vec3 uColor;",
    "uniform float uAlpha;",
    "varying float vDepth;",
    "void main() {",
    "  float fade = clamp((4.5 - vDepth) / 2.2, 0.0, 1.0);",
    "  gl_FragColor = vec4(uColor * fade, uAlpha * (0.35 + 0.65 * fade));",
    "  gl_FragColor.rgb *= gl_FragColor.a;",
    "}",
  ].join("\n");

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

  const uProjection = gl.getUniformLocation(program, "uProjection");
  const uView = gl.getUniformLocation(program, "uView");
  const uModel = gl.getUniformLocation(program, "uModel");
  const uColor = gl.getUniformLocation(program, "uColor");
  const uAlpha = gl.getUniformLocation(program, "uAlpha");

  gl.uniform3f(uColor, 0.04, 0.04, 0.04);
  gl.uniform1f(uAlpha, 0.42);

  /* ---------- Matrices ---------- */
  const mat4 = () => new Float32Array(16);

  const perspective = (out, fovy, aspect, near, far) => {
    const f = 1 / Math.tan(fovy / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  };

  const projection = mat4();
  const view = mat4();
  const model = mat4();
  const cameraDistance = 3.9;

  /* Vue fixe : caméra sur l'axe Z, légère plongée. */
  const setView = () => {
    view.fill(0);
    view[0] = 1;
    view[5] = 0.94;
    view[6] = -0.34;
    view[9] = 0.34;
    view[10] = 0.94;
    view[14] = -cameraDistance;
    view[15] = 1;
  };
  setView();

  const setModel = (angleY, angleX, scale) => {
    const cy = Math.cos(angleY);
    const sy = Math.sin(angleY);
    const cx = Math.cos(angleX);
    const sx = Math.sin(angleX);
    /* Rotation Y puis X, avec mise à l'échelle. */
    model[0] = cy * scale;
    model[1] = 0;
    model[2] = -sy * scale;
    model[3] = 0;
    model[4] = sy * sx * scale;
    model[5] = cx * scale;
    model[6] = cy * sx * scale;
    model[7] = 0;
    model[8] = sy * cx * scale;
    model[9] = -sx * scale;
    model[10] = cy * cx * scale;
    model[11] = 0;
    model[12] = 0;
    model[13] = 0;
    model[14] = 0;
    model[15] = 1;
  };

  /* ---------- Redimensionnement (DPR plafonné) ---------- */
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    perspective(projection, (46 * Math.PI) / 180, w / h, 0.1, 20);
  };

  /* ---------- Rendu ---------- */
  const draw = (elapsed) => {
    resize();
    const angleY = elapsed * 0.00016;
    const angleX = -0.32 + Math.sin(elapsed * 0.00012) * 0.14;
    setModel(angleY, angleX, 1);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(uProjection, false, projection);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.drawArrays(gl.LINES, 0, positions.length / 3);
  };

  /* ---------- Cycle de vie ---------- */
  let raf = 0;
  let running = false;
  let started = 0;
  let visible = true;

  const loop = (now) => {
    if (!started) started = now;
    draw(now - started);
    raf = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    /* Première image immédiate : la scène apparaît même si
       requestAnimationFrame est différé (onglet masqué). */
    started = performance.now();
    draw(0);
    if (reduceMotion.matches) return;
    running = true;
    raf = window.requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  };

  const sync = () => {
    if (running) return;
    start();
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      });
    }, { threshold: 0.01 }).observe(canvas);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
  });

  canvas.addEventListener("webglcontextrestored", () => {
    draw(0);
    sync();
  });

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", () => {
      stop();
      draw(0);
      if (!reduceMotion.matches) start();
    });
  }

  window.addEventListener("resize", () => {
    if (!running) draw(0);
  });

  start();
})();
