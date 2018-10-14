function shortestPath(start,target){
    //This function used in enemy turn
    function reconstructPath(cameFrom,current,path){
        if (current in cameFrom){
            path.splice(0,0,cameFrom[current])
            return reconstructPath(cameFrom,cameFrom[current],path)
        }
        return path
    }

    function estimate(start,target){
        return (target[1]-start[1]) + (target[0]-start[0])
    }

    function findMinKey(keys){
        //Find the key that corresponds to the smallest value
        var min = 999
        var minKey = null
        for (var i = 0; i<keys.length; i++){
            if (estimatedCost[keys[i]] < min){
                min = estimatedCost[keys[i]]
                minKey = keys[i]
            }
        }
        return minKey
    }

    

    var closedSet = []
    var openSet = [start]

    var cameFrom = {} //Best Path to that tile
    var startToPos = {} //Amount of steps taken to reach tile
    startToPos[start] = 0
    var estimatedCost = {}
    estimatedCost[start] = estimate(start,target)

    var n = 0
    while ((openSet.length > 0) ){
        n += 1
        // set current to the key in openSet that corresponds to the lowest value in estimatedCost

        var current = findMinKey(openSet)

        if (indexOfa2Ina1([current],[target]) != -1){
            return reconstructPath(cameFrom,current,[current],startToPos)
        }

        openSet.splice(openSet.indexOf(current),1)
        closedSet.push(current)

        var neighbors = [[current[0] + 1,current[1]],[current[0],current[1]+1],[current[0]-1,current[1]],[current[0],current[1]-1] ]

        
        neighbors.forEach(function(neighbor){
            //This tile is in the closed set so ignore it
            if (indexOfa2Ina1(closedSet,neighbor) != -1){
                return
            }

            //This is a new tile so queue the neighbors 
            var score = startToPos[current] + enemymovemap[neighbor]
            if (indexOfa2Ina1(openSet,neighbor) == -1){
                openSet.push(neighbor)
            }
            // Path is suboptimal so ignore it
            else if (score >= startToPos[neighbor]){
                return
            }

            //This is currently the optimal path so replace it in the map  
            cameFrom[neighbor] = current
            startToPos[neighbor] = score
            estimatedCost[neighbor] = startToPos[neighbor] + estimate(neighbor,target)   
        })
    }
}




function bestMove(enemy){
    var minDistance = 999
    var bestTile = enemy.pos
    var bestPath = null
    var bestPathIndex = 0
    var tempIndex = -1
    var canAttack = false
    for(var i = 0;i<allies.length;i++){
        if(allies[i].hp > 0){
            var targetPos = allies[i].pos
            var path = shortestPath(enemy.pos,targetPos)
            var stepsTaken = 0
            var lastTile = enemy.pos
            for (var j = 0; j < path.length; j++){
                stepsTaken += enemymovemap[path[j]]
                // console.log(path[j],enemymovemap[path[j]])
                if (stepsTaken <= enemy.mspd){
                    // console.log(stepsTaken)
                    if(enemies.every(function(enemy){return indexOfa2Ina1([enemy.pos],[path[j]]) == -1})){
                        lastTile = path[j]
                        tempIndex = j
    
                    }
                }
            }
            if (stepsTaken < minDistance){
                minDistance = stepsTaken
                bestTile = lastTile
                bestPathIndex = tempIndex
                tempIndex = -1
                bestPath = path.slice(0,bestPathIndex+1)
                if ((Math.abs(targetPos[0] - bestTile[0])+Math.abs(targetPos[1] - bestTile[1])) <= 1){
                    currentEnemyTarget = allies[i]
                    canAttack = true
                }
            }
        }
    }
    
    // animateMove(enemy,bestPath)
    moveTo(enemy,canAttack,bestPath,currentEnemyIndex)
    // $(enemy.ref).promise().done(function(){
    //     enemy.moveto(bestTile[0],bestTile[1])
    //     if (bestTarget != null){
    //         enemy.attack(bestTarget.data())
    //         updateEnemyTileWeights()
    //         updateAllyTileWeights()
    //     }
    // })
   
}


function moveTo(enemy,canAttack,path){
    currentEnemy=enemy
    if(path.length){
        delete charPosKeys[enemy.pos]
        var tweens = []
        var prev = enemy.pos
        
        for(var i = 0;i<path.length;i++){
            if(prev[0]-1 == path[i][0]){
                tweens.push({x: '-=16',duration:200,ease:'linear'})
            }
            else if (prev[0]+1 == path[i][0]){
                tweens.push({x: '+=16',duration:200,ease:'linear'})
            }
            else if (prev[1]+1 == path[i][1]){
                tweens.push({y: '+=16',duration:200,ease:'linear'})
            }
            else if (prev[1]-1 == path[i][1]){
                tweens.push({y: '-=16',duration:200,ease:'linear'})
            }
            prev = path[i]
        }
    
        enemy.pos = [path[path.length-1][0],path[path.length-1][1]]
        charPosKeys[enemy.pos] = enemy // Store a reference to this object on that tile
        var timeline = base.tweens.timeline({
            targets: enemy.img,
            tweens: tweens,
            onComplete: function(){
                if(canAttack){
                    base.scene.run('enemyAttackStats')
                }
            }
        })  
    } 
    else{
        base.scene.run('enemyAttackStats')
    }
}

function queueNextEnemy(){
    if(enemies.length-1 <= currentEnemyIndex){
        updateAllyTileWeights()
        setTimeout(function(){
            phase = 'choose'
        },500) 
        return               
    }
    while(enemies.length-1 > currentEnemyIndex){
        currentEnemyIndex += 1
        if (enemies[currentEnemyIndex] && enemies[currentEnemyIndex].hp<=0){
            currentEnemyIndex += 1
        }
    }
    bestMove(enemies[currentEnemyIndex],currentEnemyIndex)
}

function enemyTurn(){
    //ENEMY TURN
    // printLabel('ENEMY PHASE')
    currentEnemyIndex = 0
    updateEnemyTileWeights()
    rebuildActiveQueue()
    bestMove(enemies[currentEnemyIndex],currentEnemyIndex)

    // function moveNext(i){
    //     //Wait for each enemy to finish moving before moving onto the next enemy
    //     //Recursive promises
    //     if (i < enemies.length){
    //         bestMove(enemies[i].data())
    //         $('.character').promise().done(function(){
    //             moveNext(i)
    //         })
    //         i ++
    //     }
    //     else{
    //         setTimeout(function(){allyTurn()},1200)
    //     }
        
    // }
    

}

function indexOfa2Ina1(a1,a2){
    return (a1.findIndex(function(N){
        return N.toString() == a2.toString()
    }))
}