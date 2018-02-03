const SUITES = {
    c: 'clubs', d: 'diamonds', h: 'hearts', s: 'spades'
};
const SUITE_CODES = ['c', 'd', 'h', 's'];

const PLAYER_ID1 = '1';
const PLAYER_ID2 = 'bot';

const connection = new WebSocket('wss://kise-simulator.zinchuk.com');
const state = {};

function init() {
    state.opponentName = document.getElementById('opponent-name');
    state.playerName = document.getElementById('player-name');
    state.opponentStack = document.getElementById('opponent_stack');
    state.playerStack = document.getElementById('player_stack');
    state.pot = document.getElementById('pot');
    state.opponentBet = document.getElementById('opponent_bet');
    state.playerBet = document.getElementById('player_bet');
    state.opponentCards = Array.from(document.querySelectorAll('.opponent .card'));
    state.playerCards = Array.from(document.querySelectorAll('.player .card'));
    state.flop = Array.from(document.querySelectorAll('.dealer .card'));
    state.buttons = Array.from(document.querySelectorAll('.buttons button'));
    state.inputAmount = document.getElementById('input');
    state.betButton = document.getElementById('bet');
    state.raiseButton = document.getElementById('raise');
    state.winner = document.getElementById('winner');
    state.playerAction = document.getElementById('popup1');
    state.opponentAction = document.getElementById('popup2');

    connection.addEventListener('open', () => {
        console.log('WS Ready!');
    });

    nonDisplay();

    state.buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            eventMaker(event);
        });
    });

    state.inputAmount.addEventListener('change', updateButtonAmounts);
    state.inputAmount.addEventListener('mousemove', updateButtonAmounts);
}

function nonDisplay() {
    const demoGame = document.getElementById('demo-game');
    demoGame.addEventListener('click', () => {
        startView.parentNode.style.display = 'none';
        connection.send(JSON.stringify({
            type: 'observe',
            data: {
                name: 'Hero'
            }
        }));
    });

    const startView = document.getElementById('start-game');
    startView.addEventListener('click', () => {
        startView.parentNode.style.display = 'none';
        connection.send(JSON.stringify({
            type: 'start',
            data: {
                name: 'Hero'
            }
        }));
    });

    const newGame = document.getElementById('start-new-game');
    newGame.addEventListener('click', () => {
        state.winner.style.display = 'none';
        connection.send(JSON.stringify({
            type: 'start',
            data: {
                name: 'Hero'
            }
        }));
    });
}


function updateButtonAmounts() {
    state.betButton.innerHTML = `Bet: ${state.inputAmount.value}`;
    state.raiseButton.innerHTML = `Raise: ${state.inputAmount.value}`;
}

function eventMaker(event) {
    const data = {};
    data.action = event.target.value;

    if (data.action === 'bet' || data.action === 'raise') {
        data.amount = state.inputAmount.value;
    }

    connection.send(JSON.stringify({
        type: 'turn',
        data
    }));

    state.buttons.forEach((button) => {
        button.classList.add('displayed-buttons');
    });
    document.querySelector('input').classList.add('displayed-buttons');
}

function handleLevel(data) {
    if (data.data.name === 'preflop') {
        for (let i = 0; i < 2; i++) {
            const preFlopSuites = SUITES[data.data.cards[i][1]];

            state.playerCards[i].firstElementChild.classList.add(`${preFlopSuites}`);
            state.playerCards[i].lastElementChild.innerHTML = data.data.cards[i][0];
            state.playerCards[i].classList.remove('hidden');
        }
    } else if (data.data.name === 'flop') {
        for (let i = 0; i < 3; i++) {
            const flopSuites = SUITES[data.data.cards[i][1]];
            state.flop[i].firstElementChild.classList.add(`${flopSuites}`);
            state.flop[i].lastElementChild.innerHTML = data.data.cards[i][0];
            state.flop[i].style.visibility = 'visible';
        }
    } else if (data.data.name === 'turn') {
        const turnSuite = SUITES[data.data.cards[0][1]];
        state.flop[3].firstElementChild.classList.add(`${turnSuite}`);
        state.flop[3].lastElementChild.innerHTML = data.data.cards[0][0];
        state.flop[3].style.visibility = 'visible';
    } else if (data.data.name === 'river') {
        const riverSuite = SUITES[data.data.cards[0][1]];
        state.flop[4].firstElementChild.classList.add(`${riverSuite}`);
        state.flop[4].lastElementChild.innerHTML = data.data.cards[0][0];
        state.flop[4].style.visibility = 'visible';
    }
}

function typeCheck(event) {
    console.log(event.data);
    const type = JSON.parse(event.data).type;
    const data = JSON.parse(event.data);

    if (type === 'start') {
        if (String(data.data.players[0].playerId) === PLAYER_ID1) {
            state.playerName.innerHTML = data.data.players[0].name;
            state.opponentName.innerHTML = data.data.players[1].name;
        } else {
            state.playerName.innerHTML = data.data.players[1].name;
            state.opponentName.innerHTML = data.data.players[0].name;
        }
        state.opponentStack.innerHTML = data.data.initialStack;
        state.playerStack.innerText = data.data.initialStack;
        state.pot.innerHTML = 'POT: 0';
    } else if (type === 'gamestart') {
        state.playerName.classList.remove('blink');
        state.opponentName.classList.remove('blink');

        state.inputAmount.setAttribute('step', data.data.smallBlind);
        updateButtonAmounts();

        state.playerCards.forEach((card) => {
            card.classList.add('hidden');
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        });

        state.flop.forEach((card) => {
            card.style.visibility = 'hidden';
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        });

        state.opponentCards.forEach(((card) => {
            card.classList.add('hidden');
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        }));

        state.buttons.forEach((button) => {
            button.classList.add('displayed-buttons');
        });

        document.querySelector('input').classList.add('displayed-buttons');

        state.playerStack.innerHTML = data.data.stacks[PLAYER_ID1];
        state.opponentStack.innerHTML = data.data.stacks[PLAYER_ID2];
        state.playerBet.firstElementChild.innerHTML = data.data.bets[PLAYER_ID1];
        state.opponentBet.firstElementChild.innerHTML = data.data.bets[PLAYER_ID2];
    } else if (type === 'round') {
        Array.from(document.querySelectorAll('.popup')).forEach(((popup) => {
            popup.style.display = 'none';
        }));

        if (data.data.name !== 'preflop') {
            state.pot.innerHTML = `POT: ${data.data.pot}`;
            state.playerBet.firstElementChild.innerHTML = 0;
            state.opponentBet.firstElementChild.innerHTML = 0;
        }
        handleLevel(data);
    } else if (type === 'turnrequest') {
        const actions = Object.keys(data.data.allowedTurns);

        document.querySelector('input').classList.remove('displayed-buttons');
        for (let i = 0; i < actions.length; i++) {
            document.getElementById(actions[i]).classList.remove('displayed-buttons');

            if (actions[i] === 'bet' || actions[i] === 'raise') {
                const { min, max } = data.data.allowedTurns[actions[i]];
                state.inputAmount.setAttribute('min', min);
                state.inputAmount.setAttribute('max', max);
                state.inputAmount.value = min;
                updateButtonAmounts();
            }
        }
    } else if (type === 'turn') {
        if (String(data.data.playerId) === PLAYER_ID1) {
            state.playerStack.innerHTML = data.data.stack;
            state.playerBet.firstElementChild.innerHTML = data.data.bet;
            state.playerAction.firstElementChild.innerHTML = data.data.action;
            state.playerAction.style.display = 'inline';
            state.opponentAction.style.display = 'none';
        } else if (String(data.data.playerId) === PLAYER_ID2) {
            state.opponentStack.innerHTML = data.data.stack;
            state.opponentBet.firstElementChild.innerHTML = data.data.bet;
            state.opponentAction.firstElementChild.innerHTML = data.data.action;
            state.opponentAction.style.display = 'inline';
            state.playerAction.style.display = 'none';
        }
    } else if (type === 'showdown') {
        for (let i = 0; i < state.opponentCards.length; i++) {
            const opponentSuites = SUITES[data.data.playersCards.bot[i][1]];
            state.opponentCards[i].firstElementChild.classList.add(`${opponentSuites}`);
            state.opponentCards[i].lastElementChild.innerHTML = data.data.playersCards.bot[i][0];
            state.opponentCards[i].classList.remove('hidden');
        }

        state.pot.innerHTML = `POT: ${data.data.pot}`;
        state.opponentBet.firstElementChild.innerHTML = 0;
        state.playerBet.firstElementChild.innerHTML = 0;
    } else if (type === 'cheat') {
        for (let i = 0; i < state.opponentCards.length; i++) {
            const opponentSuites = SUITES[data.data.playersCards.bot[i][1]];
            state.opponentCards[i].firstElementChild.classList.add(`${opponentSuites}`);
            state.opponentCards[i].lastElementChild.innerHTML = data.data.playersCards.bot[i][0];
            state.opponentCards[i].classList.remove('hidden');
        }
    } else if (type === 'gameend') {
        if (String(data.data.winnerId) === PLAYER_ID1) {
            state.playerName.classList.add('blink');
        } else {
            state.opponentName.classList.add('blink');
        }

        state.playerAction.style.display = 'none';
        state.opponentAction.style.display = 'none';

        state.playerStack.innerHTML = data.data.stacks[PLAYER_ID1];
        state.opponentStack.innerHTML = data.data.stacks[PLAYER_ID2];
        state.playerBet.firstElementChild.innerHTML = 0;
        state.opponentBet.firstElementChild.innerHTML = 0;
        state.pot.innerHTML = 0;
    } else if (type === 'end') {
        if (String(data.data.winnerId) === PLAYER_ID1) {
            state.winner.lastElementChild.innerHTML = state.playerName.innerHTML;
        } else {
            state.winner.lastElementChild.innerHTML = state.opponentName.innerHTML;
        }
        state.winner.style.display = 'inline';
    }
}

connection.addEventListener('message', typeCheck);
connection.addEventListener('error', (event) => {
    console.log(event);
});
connection.addEventListener('close', (event) => {
    console.log(`Код закрытия соединения ${event.code}`);
});

document.addEventListener('DOMContentLoaded', init);

