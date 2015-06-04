window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function( callback ){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();

var config = {
	width: window.innerWidth,
	height: window.innerHeight
}

var Example = function(){	
	this.stage = new PIXI.Stage(0x66FF99);

	this.stage.events = {
		requestAnimFrame: new Signal(),
	};

    this.renderer = PIXI.autoDetectRenderer( config.width, config.height );

    document.body.appendChild(this.renderer.view);

	var slider = new Slider( { 
		event: this.stage.events.requestAnimFrame, 
		slideAxis: 'y', 
		center: config.height / 2
	} );
	for (var i = 0; i < 100; i++) {
		var text = new PIXI.Text( 'test' + i, {fill: "#d8d7c2", font: 'bold 40px Arial'} );
		text.anchor = { x: 0, y: 0.5 };		
		slider.addElement( text );		
	}

	this.stage.addChild( slider.visual );
	slider.addBackgrounds();
	
	requestAnimFrame( animate.bind(this) );

    function animate() {
        requestAnimFrame( animate.bind(this) );

        this.renderer.render(this.stage);

        if( this.score ){
        	this.score.update( this.getScore(), this.getDuration() );
        }

        this.stage.events.requestAnimFrame.dispatch();
    }
}

window.onload = function(){	
	example = new Example();
}