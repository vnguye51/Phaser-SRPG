var attackMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function AttackMenu(){
        Phaser.Scene.call(this, {key:'attackMenu'});
    },

    preload: function(){
        this.load.image('AttackMenu','assets/images/Menus/AttackMenu.png')
        
    },

    create: function(){
        // this.scene.pause('attackMenu')//Load scene and then immediately pause it
        // this.scene.moveDown('attackMenu')
        var possibleAttacks = Object.keys(charTarget.validattacks).map(function(key){
            return charTarget.validattacks[key]
        })
        console.log(possibleAttacks)
        var image = this.add.image(204,56,'AttackMenu')
        var _this = this;
        

    
        var wait = this.add.text(186,32,'Wait',{fontFamily: 'Arial',fontSize: '8px',color: '#ffffff' })
        wait.id = 1
        var attack = this.add.text(186,16,'Attack',{fontFamily: 'Arial',fontSize: '8px',color: '#00ff00' })
        attack.id = 0
        console.log(wait)
        // var shelter = this.add.text(186,48,'Rescue',{fontFamily: 'Arial',fontSize: '8px', color: '#ffffff'})
        // var item = this.add.text(186,64,'Item',{fontFamily: 'Arial',fontSize: '8px', color: '#ffffff'})
        var choiceArray = []
        var pointer = 0
        if(possibleAttacks.length){
            choiceArray = [attack,wait]
        } 
        else{
            attack.setColor('#cccccc')
            choiceArray = [wait]
        }
        choiceArray[0].setColor('#00ff00')
        this.input.keyboard.on('keydown_DOWN', function(event){
            console.log(pointer)
            pointer++;
            if (pointer > choiceArray.length-1){pointer = 0};
            for(var i = 0;i<choiceArray.length;i++){
                choiceArray[i].setColor('#ffffff')
            };
            choiceArray[pointer].setColor('#00ff00')
        })

        this.input.keyboard.on('keydown_UP',function(event){
            pointer--;
            if(pointer<0){pointer = choiceArray.length-1};
            for(var i = 0;i<choiceArray.length;i++){
                choiceArray[i].setColor('#ffffff')
            };
            choiceArray[pointer].setColor('#00ff00')
        })
        
        this.input.keyboard.on('keydown_Z', function(event){
            delete activeQueue[charTarget.name]
            _this.scene.stop('attackMenu')//looks like stop doesn't trigger until the end of create
            if (choiceArray[pointer].id == 0){//Attack
                console.log('attackstats')
                
                _this.scene.run('attackStats')
            }
            else if (choiceArray[pointer].id == 1){//Wait
                delete activeQueue[charTarget.name]
                charTarget.img.setTexture(charTarget.name + 'Grayed')
                colorBlue.clear(true,true)
                colorRed.clear(true,true)
                setTimeout(function(){
                    if (Object.keys(activeQueue).length == 0){
                        phase = 'enemy'
                        enemyTurn()

                    }
                    else{
                        phase = 'choose'
                    }
               },100)
            }

        })

    }
})

