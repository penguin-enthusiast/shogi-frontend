# Real time shogi proof of concept

This is an implementation of "real time" shogi. The game is played like a regular game of shogi but without turns; any piece can be moved at any time as long as it hasn't been moved recently (see [Kung-Fu Chess](https://en.wikipedia.org/wiki/Kung-Fu_Chess)).

The front end for the application, written in React and TypeScript, uses a [custom fork](https://github.com/penguin-enthusiast/shogiground) of [shogiground](https://github.com/WandererXII/shogiground) to render the board. All the game logic is performed in the [backend](https://github.com/penguin-enthusiast/shogi-backend). A demo can be found [here](http://www.rtshogi.com) featuring online multiplayer through the use of websockets, and a simple engine that responds to the player's move with a random move.
