var enemyAttackStats = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function enemyAttackStats(){
        Phaser.Scene.call(this, {key:'enemyAttackStats'});
    },


    preload: function(){
        this.load.image('HealthNode','assets/images/Menus/HealthBarNode.png')
        this.load.image('AttackStats','assets/images/Menus/AttackStats.png')
    },

    create: function(){
        var _this = this;
        var healthNodes = {}
        var enemyNodes = {}


        function updateStats(){
            ally.setText('HP ' + currentEnemyTarget.hp + '\t\tAtk ' + currentEnemyTarget.atk+ '\nHit ' + currentEnemyTarget.acc + '\t\t\t\tCrt ' + charTarget.crt)
            enemy.setText('HP ' + currentEnemy.hp + '\t\tAtk ' + currentEnemy.atk+ '\nHit ' + currentEnemy.acc + '\t\t\t\tCrt ' + currentEnemy.crt)
            
        }

        function updateHealth(){
            for( key in enemyNodes){
                enemyNodes[key].destroy()
                delete enemyNodes[key]
            }

            for( key in healthNodes){
                healthNodes[key].destroy()
                delete healthNodes[key]
            }

            for (var i = 1; i<=currentEnemyTarget.hp;i++){
                healthNodes[i] = _this.add.image(16+3*i-3,118,'HealthNode').setDepth(1)
            }
            for (var i = 1; i<=currentEnemy.hp;i++){
                enemyNodes[i] = _this.add.image(128+3*i-3,118,'HealthNode').setDepth(1)
            }
            console.log(enemyNodes)
        }



        var image = this.add.image(120,128,'AttackStats')
        
        var anim = false
       
        var ally = this.add.text(14,127,'',{fontFamily: 'Arial',fontSize: '10px',color: '#f4f6f7'})
        var enemy = this.add.text(126,127,'',{fontFamily: 'Arial',fontSize: '10px',color: '#f4f6f7' })
        
        updateStats()
        updateHealth()
        
        if (anim == false){
            anim = true
            function attack(self,target){
                var selfInitHP = self.hp
                var targetInitHP = target.hp

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
                    if(targetHitSuccess){
                        console.log('hi')
                        function removeTick(currentHP){
                            if (currentHP >= self.hp){
                                enemyNodes[currentHP].destroy()
                                delete enemyNodes[currentHP]
                                setTimeout(function(){
                                    removeTick(currentHP-1)
                                },20)
                            }
                        }    
                    removeTick(selfInitHP);
                    updateStats();
                    }
                    if (!selfAlive){
                        self.img.destroy()
                    }
                }
            
                function checkTargetAlive(){
                    if(hitSuccess){
                        function removeTick(currentHP){
                            if (currentHP > target.hp){
                                healthNodes[currentHP].destroy()
                                delete healthNodes[currentHP]
                                setTimeout(function(){
                                    removeTick(currentHP-1)
                                },20)
                            }
                        }    
                        removeTick(targetInitHP);
                        updateStats();
                    }

                    if (!targetAlive){
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
                        if(allies.every((ally)=>{return ally.hp <= 0})){
                            base.add.text(80,80,'DEFEAT',{fontFamily: 'Arial',fontSize: '24px',color: '#f4f6f7'})
                            return
                        }
                        if(targetAlive){
                            setTimeout(function(){
                                targetTimeline.play()
                            },600)
                        }
                        else{
                            setTimeout(function(){
                                _this.scene.stop('enemyAttackStats')
                                removeChar(target)
                                queueNextEnemy()
                                // self.img.setTexture(self.name + 'Grayed')
                                // colorRed.clear(true,true)
                                // phase = 'choose'
                            },600)
                        }
                    }})
            
                var targetTimeline = base.tweens.timeline({
                    paused: true,
                    targets: target.img,
                    tweens: targettweens,
                    onComplete: function(){
                        setTimeout(function(){
                            // delete activeQueue[target.name]
                            // phase = 'choose'
                            // colorRed.clear(true,true)
                            if (selfAlive){
                                // self.img.setTexture(self.name + 'Grayed')
                            }
                            else{
                                removeChar(self)
                            }
                            _this.scene.stop('enemyAttackStats')
                            if(enemies.every((enemy)=>{return enemy.hp <= 0})){
                                base.add.text(80,80,'VICTORY',{fontFamily: 'Arial',fontSize: '24px',color: '#f4f6f7'})
                                return
                            }

                            queueNextEnemy()
                        },600)
                        
                    }})
            
            };
            attack(currentEnemy,currentEnemyTarget)
        }

    }
})

function PostoTilePos(pos){
    return [Math.floor((pos[0]-8)/16),Math.floor((pos[1]-8)/16)]
}
function TilePostoPos(tilepos){
    return [tilepos[0]*16 + 8,tilepos[1]*16 + 8]
}

