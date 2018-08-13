var attackStats = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function AttackStats(){
        Phaser.Scene.call(this, {key:'attackStats'});
    },


    preload: function(){
        this.load.image('HealthNode','assets/images/Menus/HealthBarNode.png')
        this.load.image('AttackStats','assets/images/Menus/AttackStats.png')
    },

    create: function(){
        var _this = this;

        function updateCursorPos(){
            cursorPos = choiceArray[pointer].pos
            var cursorPosAbs = TilePostoPos(cursorPos)
            cursor.x = cursorPosAbs[0]
            cursor.y = cursorPosAbs[1]
        }
        function updateText(){
            ally.setText('HP ' + charTarget.hp + '\t\tAtk ' + charTarget.atk+ '\nHit ' + charTarget.acc + '\t\t\t\tCrt ' + charTarget.crt)
            enemy.setText('HP ' + choiceArray[pointer].hp + '\t\tAtk ' + choiceArray[pointer].atk+ '\nHit ' + choiceArray[pointer].acc + '\t\t\t\tCrt ' + choiceArray[pointer].crt)
        }
        var healthNodes = {}
        for (var i = 0; i<33;i++){
            healthNodes[i] = this.add.image(16+3*i,118,'HealthNode').setDepth(1)
        }
        var enemyNodes = {}
        for (var i = 0; i<33;i++){
            enemyNodes[i] = this.add.image(128+3*i,118,'HealthNode').setDepth(1)
        }



        var image = this.add.image(120,128,'AttackStats')
        
        var anim = false
       

        var pointer = 0
        var choiceArray = Object.keys(charTarget.validattacks).map(function(key){
            return charTarget.validattacks[key]
        })

        var ally = this.add.text(14,127,'',{fontFamily: 'Arial',fontSize: '8px',color: '#f4f6f7'})
        var enemy = this.add.text(126,127,'',{fontFamily: 'Arial',fontSize: '8px',color: '#f4f6f7' })
        
        updateCursorPos()
        updateText()

        this.input.keyboard.on('keydown_LEFT', function(event){
            if (anim == false){
                pointer--;
                if (pointer < 0){pointer = choiceArray.length - 1};
                updateCursorPos()
                updateText()
            }
        })
        this.input.keyboard.on('keydown_RIGHT',function(event){
            if (anim == false){
                pointer++;
                if(pointer >= choiceArray.length){pointer = 0};
                updateCursorPos()
                updateText()
            }
        })
        
        this.input.keyboard.on('keydown_Z', function(event){
            if (anim == false){
                anim = true
                function attack(self,target){
                    var selfAlive = true;
                    var targetAlive = true;
                
                    var hitSuccess = false;
                    var targetHitSuccess = false;
                
                    var damageToTarget = self.atk - target.def
                    var damageToSelf = target.atk - self.def
                
                    var hitChanceToTarget = self.acc - target.avo
                    var hitChanceToSelf = target.acc - self.avo
                
                    var selfRollToHit = Math.floor(Math.random()*100)
                    var targetRollToHit = Math.floor(Math.random()*100)
                    if (hitChanceToTarget > selfRollToHit){
                        hitSuccess = true;
                    }
                
                    if (hitChanceToSelf > targetRollToHit){
                        targetHitSuccess = true;
                    }
                
                    if (hitSuccess){
                        target.hp = Math.max(0,target.hp-damageToTarget)
                        if (target.hp == 0){
                            targetAlive = false;
                        }
                    }
                
                    if (targetHitSuccess && targetAlive){
                        self.hp = Math.max(0,self.hp-damageToSelf)
                        if (self.hp == 0){
                            selfAlive = false;
                        }
                    }
                
                    //Attack logic
                    //Initial attack animations(can probably turn this into a function)
                    function checkSelfAlive(){
                        updateText()
                        if (!selfAlive){
                            self.img.destroy()
                        }
                    }
                
                    function checkTargetAlive(){
                        if (!targetAlive){
                            updateText();
                            target.img.destroy();
                        }
                    }
                
                    var tweens = []
                    var targettweens = []
                    if(target.pos[0] == self.pos[0] - 1){
                        tweens.push({x: '-=16',duration:200,ease:'linear',onComplete: checkTargetAlive})
                        tweens.push({x: '+=16',duration:200,ease:'linear'})
                
                        targettweens.push({x: '+=16',duration:200,ease:'linear',onComplete: checkSelfAlive})
                        targettweens.push({x: '-=16',duration:200,ease:'linear'})
                    }
                    else if (target.pos[0] == self.pos[0] + 1){
                        tweens.push({x: '+=16',duration:200,ease:'linear',onComplete: checkTargetAlive})
                        tweens.push({x: '-=16',duration:200,ease:'linear'})
                
                        targettweens.push({x: '-=16',duration:200,ease:'linear',onComplete: checkSelfAlive})
                        targettweens.push({x: '+=16',duration:200,ease:'linear'})
                    }
                    else if (target.pos[1] == self.pos[1] + 1){
                        tweens.push({y: '+=16',duration:200,ease:'linear',onComplete: checkTargetAlive})
                        tweens.push({y: '-=16',duration:200,ease:'linear'})
                
                        targettweens.push({y: '-=16',duration:200,ease:'linear',onComplete: checkSelfAlive})
                        targettweens.push({y: '+=16',duration:200,ease:'linear'})
                    }
                    else if (target.pos[1] == self.pos[1] - 1){
                        tweens.push({y: '-=16',duration:200,ease:'linear',onComplete: checkTargetAlive})
                        tweens.push({y: '+=16',duration:200,ease:'linear'})
                
                        targettweens.push({y: '+=16',duration:200,ease:'linear',onComplete: checkSelfAlive})
                        targettweens.push({y: '-=16',duration:200,ease:'linear'})
                    }
                
                    var timeline = base.tweens.timeline({
                        targets: self.img,
                        tweens: tweens,
                        onComplete: function(){
                            if(targetAlive){
                                setTimeout(function(){
                                    targetTimeline.play()
                                },300)
                            }
                            else{
                                setTimeout(function(){
                                    _this.scene.stop('attackStats')
                                    removeChar(target)
                                    charTarget.img.setTexture(charTarget.name + 'Grayed')
                                    colorRed.clear(true,true)
                                    phase = 'choose'
                                },300)
                            }
                        }})
                
                    var targetTimeline = base.tweens.timeline({
                        paused: true,
                        targets: target.img,
                        tweens: targettweens,
                        onComplete: function(){
                            setTimeout(function(){
                                _this.scene.stop('attackStats')
                                phase = 'choose'
                                colorRed.clear(true,true)
                                if (Object.keys(activeQueue).length == 0){
                                    phase = 'enemy'
                                }
                                if (selfAlive){
                                    charTarget.img.setTexture(charTarget.name + 'Grayed')
                                }
                                else{
                                    removeChar(self)
                                }
                            },300)
                           
                        }})
                
                };
                attack(charTarget,choiceArray[pointer])
            }
        })

    }
})

function PostoTilePos(pos){
    return [Math.floor((pos[0]-8)/16),Math.floor((pos[1]-8)/16)]
}
function TilePostoPos(tilepos){
    return [tilepos[0]*16 + 8,tilepos[1]*16 + 8]
}

