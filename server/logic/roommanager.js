function socketServer(io) {
    console.log(`socket server ${io}`);
    io.on( "connection", function( socket ) {
        console.log( "A user connected" );
    });
}

module.exports.socketServer = socketServer;