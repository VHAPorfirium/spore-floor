# Roteiro de playtest (dia 4)

## Antes
O modo playtest liga com `?playtest` no fim do endereço do jogo. Ele mostra "PLAYTEST [L] save log" no canto e deixa o jogador baixar o log com a tecla L.

Como mandar o link para os amigos (escolha um):
- **Página de rascunho no itch.io:** suba o zip da release como rascunho (Draft), abra o jogo, clique com o botão direito fora do canvas e escolha "Abrir quadro em nova guia" (o endereço começa com `html-classic.itch.zone`). Acrescente `?playtest` no fim desse endereço e mande esse link.
- **GitHub Pages** (se o repositório for público): Settings > Pages > branch `main`. O link fica `https://vhaporfirium.github.io/spore-floor/?playtest`.
- **Na sua máquina:** `npm start` e abra `http://localhost:8080/?playtest`.

O `?playtest` colocado no endereço da página normal do itch não funciona, porque o jogo roda dentro de um iframe com outro endereço.

- Peça para jogar de fone, com som.
- Não explique nada além do que está na tela de título.

## Durante
- Observe sem ajudar. Anote onde a pessoa hesita, o que ela aponta, quando ri ou se assusta.
- Não responda "isso é uma anomalia?". Anote a pergunta.

## Depois
1. Peça para apertar **L** e te mandar o arquivo `.json` que baixou.
2. Quatro perguntas:
   - O que te assustou?
   - O que pareceu injusto?
   - O que você não entendeu?
   - Jogaria de novo? Por quê?

## Analisando
Coloque os `.json` numa pasta (ex.: `playtest-logs/`, que o git ignora) e rode:

```
npm run playtest:summary -- playtest-logs
```

Regra de ajuste (a mesma do script):
- acerto **abaixo de 30%** (com pelo menos 3 aparições): deixar a anomalia mais visível;
- acerto **acima de 90%** e tempo médio no andar **abaixo de 8 s**: deixar mais sutil;
- `no-anomaly` com acerto baixo: os jogadores estão vendo anomalia onde não tem (o corredor normal está confuso);
- muitas voltas ao andar 10: considerar baixar `chanceOfFloorHavingAnomaly` (hoje 0,5).

Anote cada ajuste e o motivo: isso vai para o relatório da AED.
