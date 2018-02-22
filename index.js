const SUITES = {
    c: 'clubs', d: 'diamonds', h: 'hearts', s: 'spades'
};
const SUITE_CODES = ['c', 'd', 'h', 's'];

const connection = new WebSocket('wss://kise-simulator.zinchuk.com');
const elems = {};
const state = {};

function init() {
    elems.enteredName = document.getElementById('name');
    elems.opponentName = document.getElementById('opponent-name');
    elems.playerName = document.getElementById('player-name');
    elems.opponentStack = document.getElementById('opponent_stack');
    elems.playerStack = document.getElementById('player_stack');
    elems.pot = document.getElementById('pot');
    elems.opponentBet = document.getElementById('opponent_bet');
    elems.playerBet = document.getElementById('player_bet');
    elems.opponentCards = Array.from(document.querySelectorAll('.opponent .card'));
    elems.playerCards = Array.from(document.querySelectorAll('.player .card'));
    elems.flop = Array.from(document.querySelectorAll('.dealer .card'));
    elems.buttons = Array.from(document.querySelectorAll('.buttons button'));
    elems.inputAmount = document.getElementById('input');
    elems.betButton = document.getElementById('bet');
    elems.raiseButton = document.getElementById('raise');
    elems.winner = document.getElementById('winner');
    elems.playerAction = document.getElementById('popup1');
    elems.opponentAction = document.getElementById('popup2');

    connection.addEventListener('open', () => {
        console.log('WS Ready!');
    });

    nonDisplay();

    elems.buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
            eventMaker(event);
        });
    });

    elems.inputAmount.addEventListener('change', updateButtonAmounts);
    elems.inputAmount.addEventListener('mousemove', updateButtonAmounts);
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
        if (elems.enteredName.value.length !== 0) {
            startView.parentNode.style.display = 'none';
            connection.send(JSON.stringify({
                type: 'start',
                data: {
                    name: elems.enteredName.value
                }
            }));
        } else {
            alert('Please, enter your name!');
        }
    });

    const newGame = document.getElementById('start-new-game');
    newGame.addEventListener('click', () => {
        elems.winner.style.display = 'none';
        connection.send(JSON.stringify({
            type: 'start',
            data: {
                name: 'Hero'
            }
        }));
    });
}


function updateButtonAmounts() {
    elems.betButton.innerHTML = `Bet: ${elems.inputAmount.value}`;
    elems.raiseButton.innerHTML = `Raise: ${elems.inputAmount.value}`;
}

function eventMaker(event) {
    const data = {};
    data.action = event.target.value;

    if (data.action === 'bet' || data.action === 'raise') {
        data.amount = elems.inputAmount.value;
    }

    connection.send(JSON.stringify({
        type: 'turn',
        data
    }));

    elems.buttons.forEach((button) => {
        button.classList.add('displayed-buttons');
    });
    document.getElementById('input').classList.add('displayed-buttons');
}

function handleLevel(data) {
    if (data.name === 'preflop') {
        for (let i = 0; i < 2; i++) {
            const preFlopSuites = SUITES[data.cards[i][1]];

            elems.playerCards[i].firstElementChild.classList.add(`${preFlopSuites}`);
            elems.playerCards[i].lastElementChild.innerHTML = data.cards[i][0];
            elems.playerCards[i].classList.remove('hidden');
        }
    } else if (data.name === 'flop') {
        for (let i = 0; i < 3; i++) {
            const flopSuites = SUITES[data.cards[i][1]];
            elems.flop[i].firstElementChild.classList.add(`${flopSuites}`);
            elems.flop[i].lastElementChild.innerHTML = data.cards[i][0];
            elems.flop[i].style.visibility = 'visible';
        }
    } else if (data.name === 'turn') {
        const turnSuite = SUITES[data.cards[0][1]];
        elems.flop[3].firstElementChild.classList.add(`${turnSuite}`);
        elems.flop[3].lastElementChild.innerHTML = data.cards[0][0];
        elems.flop[3].style.visibility = 'visible';
    } else if (data.name === 'river') {
        const riverSuite = SUITES[data.cards[0][1]];
        elems.flop[4].firstElementChild.classList.add(`${riverSuite}`);
        elems.flop[4].lastElementChild.innerHTML = data.cards[0][0];
        elems.flop[4].style.visibility = 'visible';
    }
}

function typeCheck(event) {
    console.log(event.data);
    const { type, data } = JSON.parse(event.data);

    if (type === 'start') {
        state.playerId1 = data.players[0].playerId;
        state.playerId2 = data.players[1].playerId;

        if (data.players[0].playerId === state.playerId1) {
            elems.playerName.innerHTML = data.players[0].name;
            elems.opponentName.innerHTML = data.players[1].name;
        } else {
            elems.playerName.innerHTML = data.players[1].name;
            elems.opponentName.innerHTML = data.players[0].name;
        }
        elems.opponentStack.innerHTML = data.initialStack;
        elems.playerStack.innerText = data.initialStack;
        elems.pot.innerHTML = 'POT: 0';
    } else if (type === 'gamestart') {
        elems.playerName.classList.remove('blink');
        elems.opponentName.classList.remove('blink');

        elems.inputAmount.setAttribute('step', data.smallBlind);
        updateButtonAmounts();

        elems.playerCards.forEach((card) => {
            card.classList.add('hidden');
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        });

        elems.flop.forEach((card) => {
            card.style.visibility = 'hidden';
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        });

        elems.opponentCards.forEach(((card) => {
            card.classList.add('hidden');
            for (let i = 0; i < SUITE_CODES.length; i++) {
                card.firstElementChild.classList.remove(SUITES[SUITE_CODES[i]]);
            }
        }));

        elems.buttons.forEach((button) => {
            button.classList.add('displayed-buttons');
        });

        document.getElementById('input').classList.add('displayed-buttons');

        elems.playerStack.innerHTML = data.stacks[state.playerId1];
        elems.opponentStack.innerHTML = data.stacks[state.playerId2];
        elems.playerBet.firstElementChild.innerHTML = data.bets[state.playerId1];
        elems.opponentBet.firstElementChild.innerHTML = data.bets[state.playerId2];
    } else if (type === 'round') {
        Array.from(document.querySelectorAll('.popup')).forEach(((popup) => {
            popup.style.display = 'none';
        }));

        if (data.name !== 'preflop') {
            elems.pot.innerHTML = `POT: ${data.pot}`;
            elems.playerBet.firstElementChild.innerHTML = 0;
            elems.opponentBet.firstElementChild.innerHTML = 0;
        }
        handleLevel(data);
    } else if (type === 'turnrequest') {
        const actions = Object.keys(data.allowedTurns);
        document.getElementById('input').classList.remove('displayed-buttons');
        for (let i = 0; i < actions.length; i++) {
            document.getElementById(actions[i]).classList.remove('displayed-buttons');

            if (actions[i] === 'bet' || actions[i] === 'raise') {
                const { min, max } = data.allowedTurns[actions[i]];
                elems.inputAmount.setAttribute('min', min);
                elems.inputAmount.setAttribute('max', max);
                elems.inputAmount.value = min;
                updateButtonAmounts();
            }
        }
    } else if (type === 'turn') {
        if (data.playerId === state.playerId1) {
            elems.playerStack.innerHTML = data.stack;
            elems.playerBet.firstElementChild.innerHTML = data.bet;
            elems.playerAction.firstElementChild.innerHTML = data.action;
            elems.playerAction.style.display = 'inline';
            elems.opponentAction.style.display = 'none';
        } else if (data.playerId === state.playerId2) {
            elems.opponentStack.innerHTML = data.stack;
            elems.opponentBet.firstElementChild.innerHTML = data.bet;
            elems.opponentAction.firstElementChild.innerHTML = data.action;
            elems.opponentAction.style.display = 'inline';
            elems.playerAction.style.display = 'none';
        }
    } else if (type === 'showdown') {
        for (let i = 0; i < elems.opponentCards.length; i++) {
            const opponentSuites = SUITES[data.playersCards[state.playerId2][i][1]];
            elems.opponentCards[i].firstElementChild.classList.add(`${opponentSuites}`);
            elems.opponentCards[i].lastElementChild.innerHTML = data.playersCards[state.playerId2][i][0];
            elems.opponentCards[i].classList.remove('hidden');
        }

        elems.pot.innerHTML = `POT: ${data.pot}`;
        elems.opponentBet.firstElementChild.innerHTML = 0;
        elems.playerBet.firstElementChild.innerHTML = 0;
    } else if (type === 'cheat') {
        for (let i = 0; i < elems.opponentCards.length; i++) {
            const opponentSuites = SUITES[data.playersCards[state.playerId2][i][1]];
            elems.opponentCards[i].firstElementChild.classList.add(`${opponentSuites}`);
            elems.opponentCards[i].lastElementChild.innerHTML = data.playersCards[state.playerId2][i][0];
            elems.opponentCards[i].classList.remove('hidden');
        }
        for (let i = 0; i < elems.playerCards.length; i++) {
            const playerSuites = SUITES[data.playersCards[state.playerId1][i][1]];
            elems.playerCards[i].firstElementChild.classList.add(`${playerSuites}`);
            elems.playerCards[i].lastElementChild.innerHTML = data.playersCards[state.playerId1][i][0];
            elems.playerCards[i].classList.remove('hidden');
        }
    } else if (type === 'gameend') {
        if (data.winnerId === state.playerId1) {
            elems.playerName.classList.add('blink');
        } else {
            elems.opponentName.classList.add('blink');
        }

        elems.playerAction.style.display = 'none';
        elems.opponentAction.style.display = 'none';

        elems.playerStack.innerHTML = data.stacks[state.playerId1];
        elems.opponentStack.innerHTML = data.stacks[state.playerId2];
        elems.playerBet.firstElementChild.innerHTML = 0;
        elems.opponentBet.firstElementChild.innerHTML = 0;
        elems.pot.innerHTML = 0;
    } else if (type === 'end') {
        if (data.winnerId === state.playerId1) {
            elems.winner.lastElementChild.innerHTML = elems.playerName.innerHTML;
        } else {
            elems.winner.lastElementChild.innerHTML = elems.opponentName.innerHTML;
        }
        elems.winner.style.display = 'inline';
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

