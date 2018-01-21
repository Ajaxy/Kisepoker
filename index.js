const connection = new WebSocket('ws://192.168.0.157:8080');

function init() {
    connection.addEventListener('open', event => {
        isConnected = true;
        console.log('WS Ready!')
    });

    nonDisplay(event);

}

function nonDisplay(event) {
    const startView = document.getElementById('start-game');
    startView.addEventListener('click', () => {
        startView.parentNode.style.display = 'none';
        connection.send(JSON.stringify({
            type: 'start',
            data: {
                name: 'Name'
            }
        }))
    });
}
function typeCheck() {
    
}

connection.addEventListener('message', typeCheck)

    // connection.addEventListener('message', event => {
    //     console.log(JSON.parse(event.data));
    // } )

    connection.addEventListener('error', event => {
        console.log(error);
    })

    connection.addEventListener('close', event => {
        isConnected = false;
        console.log(event)
        console.log(`Код закрытия соединения ${event.code}`);
    });


function makeEvent(e) {
    console.log(e.target.value);
}

document.addEventListener('click', makeEvent);

document.addEventListener('DOMContentLoaded', init);

