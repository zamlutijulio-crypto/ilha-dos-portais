import * as THREE from
  'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const cena = new THREE.Scene();
cena.background = new THREE.Color(0x87ceeb);
cena.fog = new THREE.Fog(0x87ceeb, 30, 120);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);

const renderizador = new THREE.WebGLRenderer({
  antialias: true
});

renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderizador.shadowMap.enabled = true;
document.body.appendChild(renderizador.domElement);

// Iluminação
const luzAmbiente = new THREE.HemisphereLight(
  0xffffff,
  0x336633,
  2
);

cena.add(luzAmbiente);

const sol = new THREE.DirectionalLight(0xffffff, 2);
sol.position.set(20, 40, 10);
sol.castShadow = true;
cena.add(sol);

// Ilha
const ilha = new THREE.Mesh(
  new THREE.CircleGeometry(55, 64),
  new THREE.MeshStandardMaterial({
    color: 0x3d963d
  })
);

ilha.rotation.x = -Math.PI / 2;
ilha.receiveShadow = true;
cena.add(ilha);

// Água
const agua = new THREE.Mesh(
  new THREE.CircleGeometry(90, 64),
  new THREE.MeshStandardMaterial({
    color: 0x1681c4,
    transparent: true,
    opacity: 0.85
  })
);

agua.rotation.x = -Math.PI / 2;
agua.position.y = -0.4;
cena.add(agua);

// Jogador
const jogador = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.6, 1.2, 4, 8),
  new THREE.MeshStandardMaterial({
    color: 0x2255dd
  })
);

jogador.position.set(0, 1.2, 12);
jogador.castShadow = true;
cena.add(jogador);

// Árvores
function criarArvore(x, z) {
  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 2, 8),
    new THREE.MeshStandardMaterial({
      color: 0x704019
    })
  );

  tronco.position.set(x, 1, z);
  tronco.castShadow = true;
  cena.add(tronco);

  const copa = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3, 8),
    new THREE.MeshStandardMaterial({
      color: 0x176b2c
    })
  );

  copa.position.set(x, 3.2, z);
  copa.castShadow = true;
  cena.add(copa);
}

[
  [-10, -8],
  [10, -12],
  [-16, 8],
  [17, 10],
  [-20, -20],
  [22, -5],
  [-8, 22],
  [8, 25]
].forEach(([x, z]) => criarArvore(x, z));

// Pedras
function criarPedra(x, z, tamanho) {
  const pedra = new THREE.Mesh(
    new THREE.DodecahedronGeometry(tamanho, 0),
    new THREE.MeshStandardMaterial({
      color: 0x777777
    })
  );

  pedra.position.set(x, tamanho, z);
  pedra.castShadow = true;
  cena.add(pedra);
}

criarPedra(-5, -5, 1);
criarPedra(7, -3, 0.8);
criarPedra(-12, 3, 1.2);
criarPedra(15, 3, 0.7);
criarPedra(3, 20, 1);

// Cristais
const listaCristais = [];

function criarCristal(x, z) {
  const cristal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7),
    new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x006666,
      emissiveIntensity: 1.5
    })
  );

  cristal.position.set(x, 1, z);
  cristal.castShadow = true;
  cena.add(cristal);
  listaCristais.push(cristal);
}

criarCristal(-8, -4);
criarCristal(10, 5);
criarCristal(-3, 18);

// Portal
const portal = new THREE.Mesh(
  new THREE.TorusGeometry(2.5, 0.35, 16, 48),
  new THREE.MeshStandardMaterial({
    color: 0x9933ff,
    emissive: 0x440088,
    emissiveIntensity: 2
  })
);

portal.position.set(0, 3, -18);
portal.rotation.x = Math.PI / 2;
cena.add(portal);

// Controles
const teclas = {};

window.addEventListener('keydown', (evento) => {
  teclas[evento.key.toLowerCase()] = true;

  if (evento.key.toLowerCase() === 'e') {
    coletarCristal();
  }
});

window.addEventListener('keyup', (evento) => {
  teclas[evento.key.toLowerCase()] = false;
});

function coletarCristal() {
  for (let i = listaCristais.length - 1; i >= 0; i--) {
    const cristal = listaCristais[i];
    const distancia = jogador.position.distanceTo(cristal.position);

    if (distancia < 3) {
      cena.remove(cristal);
      listaCristais.splice(i, 1);

      const quantidade = 3 - listaCristais.length;
      document.querySelector('#cristais').textContent = quantidade;

      if (quantidade === 3) {
        document.querySelector('#mensagem').textContent =
          '✨ Portal ativado! Vá até o portal roxo.';

        portal.material.color.set(0xffd700);
        portal.material.emissive.set(0xaa6600);
      } else {
        document.querySelector('#mensagem').textContent =
          `Cristal coletado! Faltam ${3 - quantidade}.`;
      }

      return;
    }
  }

  document.querySelector('#mensagem').textContent =
    'Nenhum cristal está perto de você.';
}

// Movimento do personagem
const relogio = new THREE.Clock();

function atualizarJogador(delta) {
  const velocidade = 8;
  const movimento = velocidade * delta;

  if (teclas.w) jogador.position.z -= movimento;
  if (teclas.s) jogador.position.z += movimento;
  if (teclas.a) jogador.position.x -= movimento;
  if (teclas.d) jogador.position.x += movimento;
}

// Câmera
function atualizarCamera() {
  const posicaoCamera = new THREE.Vector3(
    jogador.position.x,
    jogador.position.y + 7,
    jogador.position.z + 10
  );

  camera.position.lerp(posicaoCamera, 0.08);

  camera.lookAt(
    jogador.position.x,
    jogador.position.y + 1,
    jogador.position.z
  );
}

// Loop do jogo
function animar() {
  requestAnimationFrame(animar);

  const delta = relogio.getDelta();

  atualizarJogador(delta);
  atualizarCamera();

  listaCristais.forEach((cristal) => {
    cristal.rotation.y += delta * 2;
    cristal.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.15;
  });

  portal.rotation.z += delta;

  renderizador.render(cena, camera);
}

camera.position.set(0, 8, 20);
animar();

// Ajustar a tela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderizador.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
