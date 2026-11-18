import * as THREE from 'three';

const mat = (color, roughness = .78, metalness = 0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
const vector = (x, y, z) => new THREE.Vector3(x, y, z);
const {lerp} = THREE.MathUtils;

function createRainScene(host) {
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151d30);
  scene.fog = new THREE.FogExp2(0x202d43, .061);
  const camera = new THREE.PerspectiveCamera(40, 1, .04, 38);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  scene.add(new THREE.HemisphereLight(0xb6cbff, 0x675145, 2.2));
  const key = new THREE.DirectionalLight(0xffd4ab, 1.76);
  key.position.set(2.5, 6, -1.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -.001;
  key.shadow.normalBias = .02;
  Object.assign(key.shadow.camera, {left:-6, right:6, top:6, bottom:-6, near:.3, far:17});
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x90afe7, 1.57);
  fill.position.set(-3, 4, 6);
  scene.add(fill);

  const sphere = new THREE.SphereGeometry(1, 22, 15);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const faces = {
    navy: mat(0x253a58), navyLight: mat(0x3d5473), cloth: mat(0xe8ded1), skin: mat(0xd49e7a), hair: mat(0x29201c),
    sole: mat(0xbeb1a5), shoes: mat(0x41516a), pack: mat(0x435979), canvas: mat(0x6d6359), seam: mat(0x7f705f),
    base: mat(0x292d3b), ground: mat(0x4a5662, .5), cement: mat(0x889094), metal: mat(0x838d98, .32, .55),
    trunk: mat(0x5d4b46), pole: mat(0x424b52, .44, .5), wet: mat(0x8c7f7e, .39),
    trim: mat(0xc8a775, .48), glass: mat(0x475970, .27, .3)
  };
  function mesh(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const box = (parent, material, x, y, z, sx, sy, sz) => mesh(parent, cube, material, x, y, z, sx, sy, sz);
  const oval = (parent, material, x, y, z, sx, sy, sz) => mesh(parent, sphere, material, x, y, z, sx, sy, sz);
  function rod(parent, material, a, b, width) {
    const middle = a.clone().lerp(b, .5);
    const segment = mesh(parent, cylinder, material, middle.x, middle.y, middle.z, width, a.distanceTo(b), width);
    segment.quaternion.setFromUnitVectors(vector(0, 1, 0), b.clone().sub(a).normalize());
    return segment;
  }

  const ground = box(scene, faces.ground, 0, -.11, 0, 10.5, .22, 7.2);
  box(scene, faces.base, 0, -.32, 0, 10.65, .29, 7.34);
  box(scene, faces.trim, 0, -.464, 0, 10.3, .023, 7.04);
  box(scene, mat(0x262e3c, 1), 0, -.54, 0, 200, .05, 200);
  ground.receiveShadow = true;

  let seed = 2541;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const schoolWall = mat(0x343c4e);
  const schoolFrame = mat(0x293649);
  const schoolGlow = new THREE.MeshBasicMaterial({color:0xa68565});
  box(scene, schoolWall, -.7,1.52,-5.6,7.9,3.1,1.06);
  for(let floor=0;floor<3;floor+=1) {
    const top=.64+floor*.99;
    box(scene,schoolFrame,-.7,top+.45,-5.03,8,.055,.14);
    for(let bay=0;bay<9;bay+=1) {
      const x= -4.04+bay*.83;
      box(scene,schoolFrame,x,top,-5.045,.56,.52,.05);
      if(random()>.53) {
        for(const offset of [-.125,.125]) box(scene,schoolGlow,x+offset,top,-5.012,.225,.45,.008);
      }
    }
  }
  const joints = mat(0x596674, .74);
  for (let x = -5; x < 5.1; x += .8) box(scene, joints, x, .002, 0, .013, .009, 7.13);
  for (let z = -3.2; z < 3.35; z += .74) box(scene, joints, 0, .002, z, 10.43, .009, .014);
  const puddle = new THREE.MeshStandardMaterial({color:0x627991, metalness:.34, roughness:.23, transparent:true, opacity:.56});
  for (let i = 0; i < 17; i += 1) {
    const pool = oval(scene, puddle, (random() - .5) * 9.5, .01, (random() - .5) * 6.4, .32 + random() * .6, .006, .1 + random() * .24);
    pool.rotation.y = random() * 6.28;
  }
  const amberPaint = new THREE.MeshBasicMaterial({color:0xe6ac78, transparent:true, opacity:.22});
  for (let i = 0; i < 23; i += 1) {
    const glint = box(scene, amberPaint, 2.5 + (random() - .5) * .84, .021, -1.05 + i * .16, .08 + random() * .53, .003, .02 + random() * .065);
    glint.castShadow = false;
  }

  for (const x of [-4.48, 2.13]) {
    box(scene, faces.cement, x, .89, -2.57, .45, 1.78, .48);
    box(scene, faces.metal, x, 1.82, -2.57, .55, .1, .56);
    for (let y = .18; y < 1.75; y += .2) box(scene, joints, x, y, -2.32, .44, .009, .01);
  }
  for (const y of [.31, 1.24]) rod(scene, faces.metal, vector(-4.2,y,-2.56),vector(1.64,y,-2.56),.034);
  for (let x = -4.15; x < 1.65; x += .43) {
    rod(scene, faces.metal, vector(x,.3,-2.55), vector(x,.31 + 1.05,-2.55), .023);
    rod(scene, faces.metal, vector(x,.34,-2.55), vector(x+.42,1.22,-2.55), .014);
    rod(scene, faces.metal, vector(x,1.22,-2.53), vector(x+.42,.34,-2.53), .014);
  }
  box(scene, faces.cement, 3.77,.87,-2.48, 2.2,1.74,1.45);
  box(scene, faces.base, 3.77,1.8,-2.48, 2.43,.14,1.65);
  box(scene, faces.glass, 3.76,1.12,-1.746, 1.82,.81,.025);
  const windowLight = new THREE.MeshBasicMaterial({color:0xffd295});
  for (const x of [3.17,3.76,4.35]) box(scene, windowLight, x,1.13,-1.731, .5,.68,.011);
  box(scene, faces.metal, 3.76,.705,-1.69, 1.94,.08,.18);
  for (let y = .11; y < .55; y += .14) box(scene, joints,3.77,y,-1.748,2.2,.009,.012);
  rod(scene, faces.pole, vector(2.53,0,-1.84), vector(2.53,3.47,-1.84), .052);
  rod(scene, faces.pole, vector(2.53,3.47,-1.84), vector(2.09,3.47,-1.73), .034);
  oval(scene, faces.pole, 2.08,3.47,-1.73,.17,.054,.13);
  oval(scene, windowLight,2.08,3.435,-1.73,.13,.028,.103);
  const lamp = new THREE.PointLight(0xffbf75, 22, 9, 2);
  lamp.position.set(2.08,3.36,-1.73);
  scene.add(lamp);
  const gateLight = new THREE.PointLight(0xffd09b, 5.4, 6, 2);
  gateLight.position.set(3.8,1.18,-1.52);
  scene.add(gateLight);
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d');
  const glowGradient = glowContext.createRadialGradient(64,64,0,64,64,64);
  glowGradient.addColorStop(0,'#ffe4accc');
  glowGradient.addColorStop(.23,'#ffbc764a');
  glowGradient.addColorStop(.57,'#f3a26919');
  glowGradient.addColorStop(1,'#f3a26900');
  glowContext.fillStyle=glowGradient;
  glowContext.fillRect(0,0,128,128);
  const glow = new THREE.CanvasTexture(glowCanvas);
  glow.colorSpace=THREE.SRGBColorSpace;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.position.set(2.075,3.398,-1.68);
  halo.scale.set(1.55,1.55,1);
  scene.add(halo);
  const reflectedLight = mesh(scene,new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial({map:glow,transparent:true,opacity:.51,depthWrite:false,blending:THREE.AdditiveBlending}),2.17,.02,-.51,1.64,4.75);
  reflectedLight.rotation.x=-Math.PI/2;
  reflectedLight.castShadow=false;

  rod(scene, faces.trunk, vector(-4.4,0,-1.65), vector(-4.69,3.35,-1.84), .15);
  const leafMats = [0xab6a42,0xb98254,0x825744,0xd79a5c,0x85654f].map(color=>mat(color));
  for (const [x,y,z] of [[-4.93,3.56,-1.82],[-4.06,3.48,-1.76],[-3.65,3.26,-1.98],[-4.66,3.9,-2.26],[-5.22,3.28,-1.37]]) {
    rod(scene, faces.trunk, vector(-4.56,2.01,-1.77), vector(x,y,z), .06);
    for (let i=0;i<8;i+=1) {
      const leaf=oval(scene,leafMats[i%leafMats.length], x+(random()-.5)*1.1,y+(random()-.5)*.63,z+(random()-.5)*1.04,.28+random()*.25,.09+random()*.17,.22+random()*.29);
      leaf.rotation.z = (random() - .5) * .6;
    }
  }
  for (let i=0;i<38;i+=1) {
    const leaf=oval(scene,leafMats[i%leafMats.length],(random()-.5)*9.8,.027,(random()-.5)*6.8,.035+random()*.036,.009,.023+random()*.03);
    leaf.rotation.y=random()*6.28;
  }

  function student(taller, packMat) {
    const person = new THREE.Group();
    scene.add(person);
    const height = taller ? 1.08 : .96;
    person.scale.setScalar(height);
    oval(person,faces.navy,0,1.12,0,.31,.39,.185);
    oval(person,faces.cloth,0,1.37,.008,.305,.197,.178);
    for(const side of [-1,1]) {
      const offset = side * .135;
      rod(person,faces.navy,vector(offset,.91,0),vector(offset*1.12,.48,side*.05),.113);
      rod(person,faces.navy,vector(offset*1.12,.52,side*.05),vector(offset*1.08,.14,side*.071),.087);
      rod(person,faces.navyLight,vector(offset*1.76,.81,.05),vector(offset*1.69,.22,side*.07+.047),.013);
      oval(person,faces.sole,offset*1.08,.081,side*.071-.04,.113,.04,.193);
      oval(person,faces.shoes,offset*1.08,.109,side*.071-.048,.108,.063,.173);
      oval(person,faces.cloth,side*.285,1.335,.005,.108,.175,.112).rotation.z=side*.23;
      const raised = taller && side === -1;
      const elbow = vector(side*.37,raised?1.12:1.11,raised?-.12:0);
      const wrist = vector(raised?-.48:side*.368,raised?1.48:.9,raised?-.23:.02);
      rod(person,faces.navy,vector(side*.303,1.29,0),elbow,.082);
      rod(person,faces.navy,elbow,wrist,.063);
      oval(person,faces.skin,wrist.x,wrist.y,wrist.z,.055,.07,.052);
    }
    oval(person,faces.skin,0,1.555,0,.096,.13,.092);
    oval(person,faces.skin,0,1.746,0,.214,.267,.206);
    oval(person,faces.hair,0,1.82,.028,.226,.232,.208);
    for (const side of [-1,1]) {
      oval(person,faces.skin,side*.209,1.736,.011,.044,.073,.049);
      const eye = oval(person,faces.hair,side*.077,1.744,-.196,.018,.023,.008);
      eye.castShadow = false;
    }
    for(let i=0;i<9;i+=1) {
      const x=(i-4)*.047;
      const lock=oval(person,faces.hair,x,1.947-Math.abs(x)*.24,.012,.054,.096,.139);
      lock.rotation.z=-.22;
    }
    for(const side of [-1,1]) rod(person,faces.seam,vector(side*.2,1.41,.126),vector(side*.154,1.04,.21),.026);
    oval(person,packMat,0,1.12,.197,.27,.34,.145);
    oval(person,packMat,0,1.03,.305,.208,.177,.083);
    rod(person,faces.seam,vector(-.15,1.12,.36),vector(.15,1.12,.36),.009);
    rod(person,faces.metal,vector(.105,1.117,.374),vector(.109,1.069,.372),.01);
    if(taller) oval(person,faces.wet,.282,1.373,.079,.096,.118,.041).rotation.z=.44;
    return person;
  }
  const leftStudent=student(false,faces.pack);
  const rightStudent=student(true,faces.canvas);

  const umbrella = new THREE.Group();
  scene.add(umbrella);
  const rim = 1.19;
  const sections = 64;
  const rings = 11;
  const positions = [];
  const triangles = [];
  const clothColors = [];
  const red = new THREE.Color(0xbc4031);
  function canopyPoint(t, angle) {
    const radius = t * (rim - .035 * Math.sin(4 * angle)**2 * t);
    return vector(Math.cos(angle)*radius, .438*(1-t*t) - .026*Math.sin(4*angle)**2*t*t, Math.sin(angle)*radius);
  }
  for(let row=0; row<=rings; row+=1) {
    for(let col=0; col<=sections; col+=1) {
      const point=canopyPoint(row/rings,col/sections*Math.PI*2);
      positions.push(point.x,point.y,point.z);
      const color=red.clone().multiplyScalar(.84 + .13*Math.cos(col*Math.PI/8)**2 + .07*row/rings);
      clothColors.push(color.r,color.g,color.b);
      if(row<rings && col<sections) {
        const i=row*(sections+1)+col;
        triangles.push(i,i+1,i+sections+1,i+1,i+sections+2,i+sections+1);
      }
    }
  }
  const canopyGeometry=new THREE.BufferGeometry();
  canopyGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  canopyGeometry.setAttribute('color',new THREE.Float32BufferAttribute(clothColors,3));
  canopyGeometry.setIndex(triangles);
  canopyGeometry.computeVertexNormals();
  const canopyMaterial=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.42,metalness:.06});
  const canopy=mesh(umbrella,canopyGeometry,canopyMaterial,0,0,0);
  const stitch=mat(0x9a392b,.58);
  for(let section=0;section<8;section+=1) {
    const angle=section*Math.PI/4;
    const seam = new THREE.CatmullRomCurve3(Array.from({length:10},(_,i)=>canopyPoint(i/9,angle).add(vector(0,.009,0))));
    mesh(umbrella,new THREE.TubeGeometry(seam,14,.009,5,false),stitch,0,0,0);
    const edge=canopyPoint(1,angle);
    oval(umbrella,faces.metal,edge.x,edge.y,edge.z,.026,.023,.026);
  }
  oval(umbrella,faces.pole,0,.473,0,.029,.073,.029);
  const shaft = rod(scene,faces.pole,vector(0,0,0),vector(0,1,0),.021);
  const shaftTop = new THREE.Vector3();
  function placePair(closer, balance = 0) {
    leftStudent.position.set(lerp(-.58,-.33,closer),0,0);
    rightStudent.position.set(lerp(.59,.42,closer),0,-.10);
    umbrella.position.set(lerp(-.72,-.075,closer)+balance*.62,2.15,-.08);
    umbrella.rotation.z=lerp(.21,.015,closer)-balance*.19;
    umbrella.updateMatrixWorld(true);
    shaftTop.set(0,.41,0).applyMatrix4(umbrella.matrixWorld);
    const grip = vector(rightStudent.position.x-.48*1.08,1.48*1.08,-.35);
    const delta = shaftTop.clone().sub(grip);
    shaft.position.copy(grip).lerp(shaftTop,.5);
    shaft.scale.y=delta.length();
    shaft.quaternion.setFromUnitVectors(vector(0,1,0),delta.normalize());
  }

  const rain = Array.from({length:440},()=>({x:(random()-.5)*10.4,y:random()*5,z:(random()-.5)*7.04,s:3.2+random()*3.8}));
  const rainPositions=new Float32Array(rain.length*6);
  const rainGeo=new THREE.BufferGeometry();
  rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3).setUsage(THREE.DynamicDrawUsage));
  const shower=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb9d1e7,transparent:true,opacity:.47,depthWrite:false}));
  shower.frustumCulled=false;
  scene.add(shower);
  const ray = new THREE.Raycaster();
  function covered(x,z) {
    ray.set(vector(x,4,z),vector(0,-1,0));
    return ray.intersectObject(canopy,false).length>0;
  }
  function coverage() {
    return {
      left:covered(leftStudent.position.x-.34,.008) && covered(leftStudent.position.x+.33,.008),
      right:covered(rightStudent.position.x-.38,-.10) && covered(rightStudent.position.x+.38,-.10)
    };
  }
  let angle=0, closeness=0, zoom=0, balance=0, angleGoal=0, closenessGoal=0, zoomGoal=0, balanceGoal=0;
  let enabled=false, paused=false, frame=0, lastTime=0, width=0, height=0;
  const target = vector(0,1.18,-.45);
  function resize() {
    width=host.clientWidth;
    height=host.clientHeight;
    if(!width||!height) return;
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function draw(time) {
    frame=0;
    if(!enabled) return;
    const elapsed=lastTime ? Math.min(.035,(time-lastTime)/1000) : .016;
    lastTime=time;
    const ease=motion.matches ? 1 : 1-Math.exp(-elapsed*8);
    angle=lerp(angle,angleGoal,ease);
    closeness=lerp(closeness,closenessGoal,ease);
    zoom=lerp(zoom,zoomGoal,ease);
    balance=lerp(balance,balanceGoal,ease);
    placePair(closeness,balance);
    const theta=lerp(-1.14,.15,angle);
    const radius=lerp(5.9,6.65,angle)-zoom*2.75;
    camera.position.set(Math.sin(theta)*radius,lerp(2.31,3.38,angle)+zoom*.12,Math.cos(theta)*radius);
    target.set(lerp(-.26,.15,angle)+zoom*.31,1.22+zoom*.56,-.37);
    camera.lookAt(target);
    for(let i=0;i<rain.length;i+=1) {
      const drop=rain[i];
      if(!paused&&!motion.matches) drop.y-=drop.s*elapsed;
      if(drop.y<.02) drop.y+=5;
      const nx=(drop.x-umbrella.position.x)/1.14;
      const nz=(drop.z-umbrella.position.z)/1.18;
      const visible=drop.y>2.57 || nx*nx+nz*nz>1;
      const length=visible?.14+drop.s*.025:0;
      rainPositions.set([drop.x,drop.y,drop.z,drop.x+length*.09,drop.y+length,drop.z],i*6);
    }
    rainGeo.attributes.position.needsUpdate=true;
    if(width&&height) renderer.render(scene,camera);
    if(!motion.matches||angle!==angleGoal||closeness!==closenessGoal||zoom!==zoomGoal) frame=requestAnimationFrame(draw);
  }
  function wake() { if(!frame && enabled) frame=requestAnimationFrame(draw); }
  return {
    show(isVisible) { enabled=isVisible; host.hidden=!isVisible; lastTime=0; if(isVisible) { resize(); wake(); } },
    pose(view, step=0, detail=0, offset=0) { angleGoal=view; closenessGoal=step; zoomGoal=detail; balanceGoal=offset; wake(); },
    pause(value) { paused=value; },
    previewCoverage(step, offset) {
      placePair(step,offset);
      const result=coverage();
      placePair(closeness,balance);
      return result;
    },
    findShelter(step, offset) {
      let best=null;
      for(let s=0;s<=10;s+=1) {
        for(let b=-10;b<=10;b+=1) {
          const next={step:s/10,offset:b/10};
          placePair(next.step,next.offset);
          const {left,right}=coverage();
          if(!left||!right) continue;
          const cost=Math.abs(next.step-step)*1.1+Math.abs(next.offset-offset);
          if(!best||cost<best.cost) best={...next,cost};
        }
      }
      placePair(closeness,balance);
      return best;
    }
  };
}

window.createRainScene = createRainScene;
