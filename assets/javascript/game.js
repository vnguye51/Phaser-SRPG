var config = {
    type: Phaser.AUTO,
    width: 160,
    height: 160,
    pixelArt: true,
    backgroundColor: '#2d2d2d',
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update,
    }
};

function Character(name,hp,ap,acc,dodge,mspd,exp,giveexp,ally,active,pos) {
    this.name = name;
    this.hp = hp;
    this.ap = ap;
    this.acc = acc;
    this.dodge = dodge;//unused so far
    this.mspd = mspd;
    this.moves = null;

    this.validattacks = null;
    this.exp = exp;
    this.giveexp = giveexp;
    this.ally = ally;

    
    this.active = active;
    this.pos = pos;

    this.levelup = function(){
        //Increases stats, called after the player reaches 100 exp
        setTimeout(function(){
            levelUpSound.play();
            printLabel("LEVEL UP")
        },1000)
        
        printMessage(this.name + " leveled up!" )
        this.acc += 10
        this.dodge += 10
        this.mspd += 1
        this.ap += 10
        this.exp -= 100
    }

    this.attack = function(target){
        //Attack logic
        //Initial attack animations(can probably turn this into a function)
        if(target.pos[0] == this.pos[0] - 1){
            $(this.ref).animate({bottom:'50px'},250)
            $(this.ref).animate({bottom:'0px'},250)
        }
        else if (target.pos[0] == this.pos[0] + 1){
            $(this.ref).animate({top:'50px'},250)
            $(this.ref).animate({top:'0px'},250)
        }
        else if (target.pos[1] == this.pos[1] + 1){
            $(this.ref).animate({left:'50px'},250)
            $(this.ref).animate({left:'0px'},250)
        }
        else if (target.pos[1] == this.pos[1] - 1){
            $(this.ref).animate({right:'50px'},250)
            $(this.ref).animate({right:'0px'},250)
        }

        var hitroll = Math.floor(Math.random()*100) 
        var enemyroll = Math.floor(Math.random()*100)

        if (this.acc > hitroll){
            //If you hit
            printMessage(this.name + ' attacks '+  target.name + ' dealing ' + this.ap + ' damage.')
            hitSound.play()
            target.hp = Math.max(target.hp-this.ap,0)
            if (target.hp <= 0) { 
                printMessage(this.name + ' deals a lethal blow to ' + target.name)
                removeChar(target)
                this.exp += target.giveexp
                if (this.exp >= 100){
                    this.levelup()
                } 
                
                if (target.ally == false){ //Ally  killed enemy
                    if (enemies.length == 0){
                        //All enemies defeated //Should make a victory() function
                        phase = 'Victory'
                        printLabel('VICTORY')
                        printMessage("You have defeated all enemies!")
                    }
                }
                else{
                    if (allies.length == 0){
                        //All allies defeated //Should make a defeat() function
                        phase = 'GameOver'
                        printLabel('DEFEAT')
                        printMessage("All allies have been slain.")      
                    }
                }
            }
        }

        else {
            //attack misses
            missSound.play()
            printMessage(this.name + ' attacks but ' + target.name + ' parries!')
        }

        $(this.ref).promise().done(function(){
            //promise waits until the initial attack animation is done
            //Counterattack animation
            if(this.data().pos[0] == target.pos[0] - 1){
                $(target.ref).animate({bottom:'50px'},250)
                $(target.ref).animate({bottom:'0px'},250)
            }
            else if (this.data().pos[0] == target.pos[0] + 1){
                $(target.ref).animate({top:'50px'},250)
                $(target.ref).animate({top:'0px'},250)
            }
            else if (this.data().pos[1] == target.pos[1] + 1){
                $(target.ref).animate({left:'50px'},250)
                $(target.ref).animate({left:'0px'},250)
            }
            else if (this.data().pos[1] == target.pos[1] - 1){
                $(target.ref).animate({right:'50px'},250)
                $(target.ref).animate({right:'0px'},250)
            }

            if ((target.acc > enemyroll) && (target.hp > 0)) {
                //counterattack lands
                hitSound.play()
                this.data().hp = Math.max(this.data().hp-target.ap,0)
                printMessage(target.name + ' lands the riposte dealing ' + target.ap + ' damage.')
                if (this.data().hp <= 0) {
                    printMessage(target.name + ' deals a lethal blow to ' +this.data().name )
                    target.exp += this.data().giveexp
                    removeChar(this.data())

                    if (target.exp >= 100){
                        target.levelup()
                    }
                    if (this.data().ally == false){ //Ally  killed enemy
                        if (enemies.length == 0){
                            phase = 'Victory'
                            printLabel('VICTORY')
                            printMessage("You have defeated all enemies!")
                        }
                    }
                    else{
                        if (allies.length == 0){
                            phase = 'GameOver'
                            printLabel('DEFEAT')
                            printMessage("All allies have been slain.")
                        }
                    }
                }
            }
        
            else if (target.hp > 0){
                //counterattack misses
                missSound.play()
                printMessage(target.name + ' misses the riposte!')
            }
            statupdate(target)
            statupdate(this.data())
        })
    };

    this.moveto = function(target){ 
        // this.pos = [targetrow,targetcol]
        var absPos = TilePostoPos(this.pos)


    };
}


var Chamomile = new Character('Chamomile',100,40,90,20,4,0,0,true, true, [0,0])
var Earl = new Character('Earl',120,30,80,20,4,0,0,true, true, [9,7])
var Ceylon = new Character('Ceylon',200,70,50,20,4,0,0,true, true, [7,9])


var game = new Phaser.Game(config);
var allies = [Chamomile,Earl,Ceylon]
var player;
var cursor;
var layer;
var colorBlue;
var colorRed;
var base;
var tweenRef;


function preload(){
    this.load.image('Tileset', 'assets/TileMap/Tileset.png');
    this.load.tilemapTiledJSON('map','assets/TileMap/Map1.json');
    this.load.image('cursor','assets/images/Sprites/Cursor.png')
    this.load.image('Chamomile','assets/images/Sprites/Chamomile.png')
    this.load.image('Earl','assets/images/Sprites/Earl.png')
    this.load.image('colorBlue','assets/images/Tiles/colorBlue.png')
    this.load.image('colorRed','assets/images/Tiles/colorRed.png')
}

function create(){
    base = this
///TWEENDATA


    colorRed = this.add.group()
    colorBlue = this.add.group();
    map = this.make.tilemap({key: 'map'})
    var tileset = map.addTilesetImage('Tileset');
    
    layer = map.createStaticLayer('Tile Layer 1',tileset,0,0);
    layer.setDepth(-2)
    cursor = this.add.image(0+8,0+8,'cursor');

    Chamomile.img = this.add.image(0+8,0+8,'Chamomile');
    ///Initialize TWEENS///
    tweenRef = this.tweens

    var tweenRight = ({
        targets: Chamomile.img,
        x: '+=16',
        duration: 250,
    })

    var tweenLeft = ({
        targets: Chamomile.img,
        x: '-=16',
        duration: 250,
    })

    var tweenUp = ({
        targets: Chamomile.img,
        y: '-=16',
        duration: 250,
    })

    var tweenDown = ({
        targets: Chamomile.img,
        y: '+=16',
        duration: 250,
    })

////////////
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

    this.input.keyboard.on('keydown_ENTER', function(event){

        // Chamomile.img.x = cursor.x
        // Chamomile.img.y = cursor.y
        
        Chamomile.pos = PostoTilePos([cursor.x,cursor.y])
        // Chamomile.moveto(Chamomile.pos)
        tweenRef.add(tweenDown)
    });
    text = this.add.text(30, 20, '0', { font: '16px Courier', fill: '#00ff00' });

}


function update (){
}



////UTILITY FUNCTIONS////////
function PostoTilePos(pos){
    return [Math.floor((pos[0]-8)/16),Math.floor((pos[1]-8)/16)]
}
function TilePostoPos(tilepos){
    return [tilepos[0]*16 + 8,tilepos[1]*16 + 8]
}

function getTileWeight(gridPos){
    var absPos = TilePostoPos(gridPos)
    if (layer.getTileAtWorldXY(absPos[0],absPos[1]) == null){
        return 99
    }
    return layer.getTileAtWorldXY(absPos[0],absPos[1]).properties.weight
}

function parseKey(key,delimiter){ //Parse through our custom ID tag to determine location of target box
    var row = ''
    var col = ''
    var toggle = 0
    for (var i = 0;i<key.length;i++){
        if (key[i] == delimiter){
            toggle = 1
        }
        else if(toggle == 0){
            row += key[i]
        }
        else{
            col += key[i]
        }
    }
    return [+row,+col]
    
}

function showMoves(character){
    var possibleAttacks = {}
    function findPath(start,mspd){ 
        //Flood fill algorithm to determine valid moves
        // updateAllyTileWeights() 
        //Create object Path that will eventually store the stepsLeft and a pathTaken to a tile
        function Path(stepsLeft,pathTaken){
            this.stepsLeft = stepsLeft;
            this.pathTaken = pathTaken;
        }
        //Initialize a map that will store the Path to each tile
        var travelmap = {}
        travelmap[start] = new Path(mspd,[])
    
        //Openset contains the queue of tiles to be looped through
        var openset = []
        openset.push(start)
        var closedset = []
        var n = 0
        
        while ((openset.length) > 0 && (n < 1000)){
            //n < 1000 is just to make sure the loop doesn't go infinite, it is probably safe to remove
            n += 1
    
            //set curr as the first element in the openset and put it in the closed set
            var curr = openset[0]
            openset.splice(0,1)
            closedset.push(curr)
            
            //Populate the neighboring tiles
            var neighbors = [[curr[0] + 1,curr[1]],[curr[0],curr[1]+1],[curr[0]-1,curr[1]],[curr[0],curr[1]-1] ]
            
            //For every neighbor
            neighbors.forEach(function(neighbor){
                possibleAttacks[neighbor] = 1
                //Calculate how many steps are left if the neighbor is moved into
                tentativeStepsLeft = travelmap[curr].stepsLeft - getTileWeight(neighbor)
                //If we've already calculated this tile, only replace it in the travel map if it requires less steps
                if (neighbor in travelmap){
                    if (tentativeStepsLeft > travelmap[neighbor].stepsLeft){
                        travelmap[neighbor].stepsLeft = tentativeStepsLeft
                    }
                }
                //Otherwise if you do not have enough steps to move into neighbor do nothing
                else if (travelmap[curr].stepsLeft - getTileWeight(neighbor) < 0){
                }
                //If you have exactly enough steps push it to the closedset
                else if (travelmap[curr].stepsLeft - getTileWeight(neighbor) == 0){
                    travelmap[neighbor] = new Path(travelmap[curr].stepsLeft - getTileWeight(neighbor), travelmap[curr].pathTaken.concat([neighbor]))
                    closedset.push(neighbor)
                }
                else{
                //If the tile has not been previously calculated and it is possible to move into it with steps remaining
                //Put that tile in the Open Set and log its Path in the map.
                    openset.push(neighbor)
                    travelmap[neighbor] = new Path(travelmap[curr].stepsLeft - getTileWeight(neighbor), travelmap[curr].pathTaken.concat([neighbor]))
                }
            })
        }
        ///Determine where valid attacks are
        closedset.forEach(function(curr){
            var neighbors = [[curr[0] + 1,curr[1]],[curr[0],curr[1]+1],[curr[0]-1,curr[1]],[curr[0],curr[1]-1] ]
            neighbors.forEach(function(neighbor){
                possibleAttacks[neighbor] = 1
            })
        })
    
        return travelmap
    }

    if (character.ally){
        var possiblemoves = (findPath(character.pos,character.mspd))
    }
    else{
        var possiblemoves = (findPath(character.pos,character.mspd,enemymovemap))
    }
    //Style all tiles that are part of the possible moves
    colorBlue.clear(true,true)
    colorRed.clear(true,true)
    for (var key in possiblemoves){
        var correctedKey = key.slice(0,key.indexOf(',')) + '\\' + key.slice(key.indexOf(','))
        if (character.ally == false){
            $('#'+correctedKey).addClass('enemyMovement')
        }
        else{
            var tile = TilePostoPos(parseKey(key,','))
            colorBlue.create(tile[0],tile[1],'colorBlue')
        }
    }
    for (var key in possibleAttacks){
        if (!(key in possiblemoves)){
            var tile = TilePostoPos(parseKey(key,','))
            colorRed.create(tile[0],tile[1],'colorRed')
        }

    }

    character.moves = possiblemoves
    colorBlue.setDepth(-1)
    colorRed.setDepth(-1)
}
