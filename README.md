# Spore Floor

Jogo de terror feito para a **Horror Hatch #5** (tema: *Spore Infection*).

Você sai do elevador no andar 10 e o corredor se repete. Se algo estiver errado no andar, volte para o elevador. Se estiver tudo normal, siga pela porta da escada. Acertou, desce um andar. Errou, volta para o 10. Chegue ao térreo para escapar.

## Controles

| Tecla | Ação |
|---|---|
| `←` `→` ou `A` `D` | Andar |
| `E`, `Espaço` ou `Enter` | Usar o elevador / a porta / ler a nota |
| Clique | Na tela de título e na tela final, vale como `E` (e dá foco ao jogo dentro do iframe do itch.io) |
| `M` | Liga e desliga o som |
| `L` | Salva o log de playtest (só com `?playtest`) |

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

Abra `http://localhost:8080/?debug` (só na versão de desenvolvimento; na release o debug é desligado) para ver no canto da tela qual anomalia está ativa no andar. Útil para testar.

Para ver uma anomalia específica sem precisar jogar até ela aparecer (a câmera centraliza sozinha nela):

```
http://localhost:8080/anomaly-preview.html?anomaly=mold-patch-on-wall
```

Para forçar outra posição de câmera, acrescente `&cameraPositionX=1570`. Para ver outro andar (e o nível de infecção dele), acrescente `&floor=3` (o padrão é o 7). Sem o parâmetro `anomaly`, a página mostra o corredor normal e lista no console os identificadores disponíveis.

## O corredor fica doente

Quanto mais o jogador desce, mais infectado o corredor fica: mais esporos no ar, manchas de fungo no alto da parede, tela mais verde e mais escura, e um ruído grave mais forte. O andar 10 é limpo e o andar 1 é o mais doente.

A doença é sempre a mesma para o mesmo andar (vem de `src/domain/FloorInfection.js`), então o jogador consegue aprender o "normal" de cada andar. As manchas da doença ficam sempre no alto da parede; a anomalia de mofo fica perto do rodapé, para as duas nunca se confundirem.

## Áudio

Todos os sons são gerados na hora com a Web Audio API (`src/infrastructure/audio/`), sem arquivos de áudio: zumbido das lâmpadas, passos, sino do elevador, porta da escada, ruído do prédio e o som de erro. O `HallwayAudioDirector` observa a `GameSession` a cada frame e toca os sons quando algo muda; a `GameSession` não sabe que o áudio existe. O navegador só libera o som depois da primeira tecla.

## Notas de manutenção

Cada andar tem uma nota presa na parede (`src/domain/maintenanceLogs.js`). Lidas do 10 ao 1, elas contam a história da infecção e dão dicas sobre algumas anomalias.

## Anomalias

| Identificador | O que muda |
|---|---|
| `swapped-door-numbers` | Dois números de porta trocam de lugar |
| `upside-down-painting` | Um quadro está de cabeça para baixo |
| `changed-exit-sign-text` | A placa diz STAY em vez de EXIT |
| `elevator-indicator-glows-green` | O número do painel do elevador fica verde em vez de laranja |
| `missing-apartment-door` | Uma das portas sumiu |
| `painting-sun-missing` | O sol sumiu de um quadro |
| `mold-patch-on-wall` | Mancha pequena de mofo perto do rodapé |
| `fungus-covering-door-number` | Fungo cobrindo o número de uma porta |
| `lamp-flickering-out-of-rhythm` | Uma lâmpada pisca fora do ritmo das outras |
| `spores-drifting-upward` | Os esporos no ar sobem em vez de cair |
| `footsteps-behind-player` | Uma segunda sombra segue o jogador e dá para ouvir passos atrás dele |
| `infected-figure-at-hallway-end` | Uma figura infectada parada perto da escada |
| `elevator-chime-out-of-tune` | Só de áudio: o sino de chegada toca desafinado |

## Playtest

Abra o jogo com `?playtest` no fim do endereço. Cada decisão do jogador é registrada (andar, anomalia, escolha, acerto e tempo no andar); a tecla `L` baixa o log em JSON e o resumo aparece no console. Para juntar os logs de várias pessoas:

```bash
npm run playtest:summary -- playtest-logs
```

O roteiro completo está em `docs/PLAYTEST.md`.

## Release para o itch.io

```bash
npm run release
```

Cria a pasta `release/` só com `index.html` e `src/` (sem o preview de anomalias, testes e scripts), com o modo debug desligado e a versão do `package.json`. Depois, no PowerShell:

```powershell
Compress-Archive -Path release\* -DestinationPath spore-floor-1.0.0.zip -Force
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
    CanvasHallwayRenderer.js   Ordem das camadas e câmera
    drawers/                   Um desenhista por elemento (porta, quadro, lâmpada, esporos...)
    ceilingLampBrightness.js   Brilho de cada lâmpada ao longo do tempo
    audio/                     Sons procedurais e o diretor de áudio
    KeyboardInputReader.js
  main.js              Monta as peças e inicia o loop do jogo
tests/                 Testes das regras
```

A camada `domain` não conhece o navegador, por isso dá para testar com `node --test`.

## Como adicionar uma anomalia nova

1. Crie um arquivo em `src/domain/anomalies/`, estendendo a classe `Anomaly`:

```js
import { Anomaly } from "./Anomaly.js";
import { apartmentDoorPositionsX } from "../HallwayLayout.js";

const missingDoorIndex = 2;

export class MissingApartmentDoorAnomaly extends Anomaly {
  constructor() {
    super("missing-apartment-door", "One of the apartment doors is gone", apartmentDoorPositionsX[missingDoorIndex]);
  }

  applyToHallwayLayout(hallwayLayout) {
    hallwayLayout.doors = hallwayLayout.doors.filter((door, doorIndex) => doorIndex !== missingDoorIndex);
  }
}
```

O terceiro parâmetro (`focusPositionX`) é onde a anomalia aparece no corredor; o preview usa para centralizar a câmera.

2. Registre em `src/domain/anomalies/anomalyCatalog.js`.
3. Se a anomalia precisar de algo novo na tela, adicione o dado em `HallwayLayout.js` e desenhe no desenhista correspondente em `src/infrastructure/drawers/`. Anomalias animadas (como a lâmpada piscando) só marcam um dado; quem anima com o tempo é o desenhista.

O teste `every anomaly actually changes the hallway` garante que toda anomalia registrada realmente muda alguma coisa no corredor.

## Publicando no itch.io

1. Rode `npm run release` e compacte o **conteúdo** da pasta `release/` (o `index.html` precisa ficar na raiz do .zip, não dentro de uma subpasta). O comando do PowerShell acima já faz isso.
2. No itch.io, crie o projeto como **HTML** e marque *This file will be played in the browser*.
3. Tamanho da tela sugerido: 960 × 540.
