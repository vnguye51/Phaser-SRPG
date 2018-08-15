var characterMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function CharacterMenu(){
        Phaser.Scene.call(this, {key:'characterMenu'});
    },

    preload: function(){
        this.load.image('CharacterMenu','assets/images/Menus/CharacterMenu.png')
        
    },

    create: function(){
        console.log('characterMenu')
        var background = this.add.image(120,80,'CharacterMenu')
    }

})