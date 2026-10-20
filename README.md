# Spore Floor

Jogo de terror feito para a **Horror Hatch #5** (tema: *Spore Infection*).

Você sai do elevador no andar 10 e o corredor se repete. Se algo estiver errado no andar, volte para o elevador. Se estiver tudo normal, siga pela porta da escada. Acertou, desce um andar. Errou, volta para o 10. Chegue ao térreo para escapar.

## Controles

| Tecla | Ação |
|---|---|
| `←` `→` ou `A` `D` | Andar |
| `E`, `Espaço` ou `Enter` | Usar o elevador / a porta |

## Como rodar

O jogo usa módulos JavaScript (`import`/`export`), e o navegador **bloqueia módulos abertos direto do arquivo** (dando dois cliques no `index.html`). Por isso é preciso rodar com um servidor local. Escolha uma das opções:

**Opção 1: Node.js (recomendado)**

Precisa do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
npm start
```

O navegador abre sozinho em `http://localhost:8080`.

**Opção 2: Python**

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080` no navegador.

**Opção 3: VS Code**

Instale a extensão **Live Server**, clique com o botão direito no `index.html` e escolha *Open with Live Server*.

## Modo debug

Abra `http://localhost:8080/?debug` para ver no canto da tela qual anomalia está ativa no andar. Útil para testar.

Para ver uma anomalia específica sem precisar jogar até ela aparecer:

```
http://localhost:8080/anomaly-preview.html?anomaly=mold-patch-on-wall&cameraPositionX=1570
```

## Testes

As regras do jogo têm testes automatizados (não precisa instalar nada além do Node):

```bash
npm test
```

## Estrutura do projeto

```
src/
  domain/              Regras puras do jogo, sem Canvas e sem navegador
    anomalies/         Uma classe por anomalia
    FloorGenerator.js  Sorteia se o andar terá anomalia e qual
    LoopRules.js       Decide se o jogador acertou e qual o próximo andar
    Player.js          Posição e movimento do jogador
  application/
    GameSession.js     Orquestra o jogo: andar, decidir, trocar de andar
  infrastructure/      Detalhes técnicos do navegador
    CanvasHallwayRenderer.js
    KeyboardInputReader.js
  main.js              Monta as peças e inicia o loop do jogo
tests/                 Testes das regras
```

A camada `domain` não conhece o navegador, por isso dá para testar com `node --test`.

## Como adicionar uma anomalia nova

1. Crie um arquivo em `src/domain/anomalies/`, estendendo a classe `Anomaly`:

```js
import { Anomaly } from "./Anomaly.js";

export class MissingDoorAnomaly extends Anomaly {
  constructor() {
    super("missing-door", "One of the doors is gone");
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.doors.splice(2, 1);
  }
}
```

2. Registre em `src/domain/anomalies/anomalyCatalog.js`.
3. Se a anomalia precisar de algo novo na tela, desenhe no `CanvasHallwayRenderer.js`.

O teste `every anomaly actually changes the hallway` garante que toda anomalia registrada realmente muda alguma coisa no corredor.

## Publicando no itch.io

1. Compacte o **conteúdo** da pasta (o `index.html` precisa ficar na raiz do .zip, não dentro de uma subpasta).
2. No itch.io, crie o projeto como **HTML** e marque *This file will be played in the browser*.
3. Tamanho da tela sugerido: 960 × 540.
