var config = {
    type: Phaser.AUTO,
    width: 160,
    height: 160,
    pixelArt: true,
    backgroundColor: '#2d2d2d',
    scene: {
        preload: preload,
        create: create,
    }
};

var game = new Phaser.Game(config);
var map;
var player;
var cursor;
var layer;

function preload(){
    this.load.image('Tileset', 'assets/TileMap/Tileset.png');
    this.load.tilemapTiledJSON('map','assets/TileMap/Map1.json');
    this.load.image('cursor','assets/images/Sprites/Cursor.png')
}

function create(){
    map = this.make.tilemap({key: 'map'})
    var tileset = map.addTilesetImage('Tileset');
    layer = map.createStaticLayer('Tile Layer 1',tileset,0,0);
    cursor = this.add.image(0+8,0+8,'cursor');
    this.input.keyboard.on('keydown_LEFT', function (event) {
        cursor.x = Math.max(0+8,cursor.x-16);
    });

    this.input.keyboard.on('keydown_RIGHT', function (event) {
        cursor.x = Math.min(160-8,cursor.x + 16);
    });

    this.input.keyboard.on('keydown_UP', function (event) {
        cursor.y = Math.max(0+8,cursor.y-16);
    });

    this.input.keyboard.on('keydown_DOWN', function (event) {
        cursor.y = Math.min(160-8,cursor.y + 16);
    });
}
