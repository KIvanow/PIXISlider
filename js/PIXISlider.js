var Slider = function( settings ){
	this.slideAxis = (settings && settings.slideAxis) || 'y';
	this.center = (settings && settings.center) || ( this.slideAxis == 'y' ? this.parent.getBounds().height / 2 : this.parent.getBounds().width / 2);
	this.margin = (settings && settings.margin ) || 0;
	this.visual = new PIXI.Container();
	this.events = {
		mousedown: new Signal(),
		mouseup: new Signal(),
		mousemove: new Signal()
	};

	this.topOffset = 0;

	settings.event.addOnce( function(){
		this.visual.hitArea = new PIXI.Rectangle( this.visual.getBounds().x, this.visual.getBounds().y,
			this.visual.getBounds().width, this.visual.getBounds().height );
	}.bind(this));

	this.addListeners();

	return this;
};

Slider.prototype.addBackgrounds = function(settings){
	for (var i = this.visual.children.length - 1; i >= 0; i--) {
		var background = new PIXI.Graphics();
		background.beginFill( (settings && settings.color) || 0xd8d7c2);
		// for reasons beyond me getBounds returns wrong value and getLocalBounds returns the correct value.
		background.drawRoundedRect(
			( settings && settings.x != undefined ) || this.visual.children[i].getLocalBounds().x,
			( settings && settings.y != undefined ) || this.visual.children[i].getLocalBounds().y,
			(( settings && settings.width != undefined ) || config.width / this.visual.children[i].scale.x) - this.visual.children[i].getLocalBounds().x * 2 ,
			( settings && settings.height != undefined ) || this.visual.children[i].getLocalBounds().height,
			15
		);
		background.alpha = 0.2
		this.visual.children[i].addChild( background );
	};
};

Slider.prototype.addElement = function( element ){
	this.visual.addChild( element );
	this.visual.children[ this.visual.children.length - 1 ][ this.slideAxis ] = this.topOffset;
	if( this.slideAxis == 'y' ){
		this.topOffset += this.visual.children[ this.visual.children.length - 1 ].getBounds().height + this.margin;
	} else if( this.slideAxis == 'x' ){
		this.topOffset += this.visual.children[ this.visual.children.length - 1 ].getBounds().width + this.margin;
	}		
};

Slider.prototype.addListeners = function(){
	this.visual.interactive = true;

	var that = this;		
	this.visual.mousedown = this.visual.touchstart = function(data){
		this.updateTransform();
		this.dragging = true;
		that.events.mousedown.dispatch( data );
	};

	this.visual.mouseup = this.visual.mouseupoutside = this.visual.touchend = this.visual.touchendoutside = function(data){
		this.dragging = false;
		this.data = null;
		if( that.slideAxis == 'y' ){		
			new TimelineMax().to( that.visual, 0.5, { y: Math.round( that.visual[ that.slideAxis ] + that.findClosestChild().distance), force3D:true });
		} else if ( that.slideAxis == 'x' ){
			new TimelineMax().to( that.visual, 0.5, { x: Math.round( that.visual[ that.slideAxis ] + that.findClosestChild().distance), force3D:true });
		}
		
		that.events.mouseup.dispatch( data );
	};

	// set the callbacks for when the mouse or a touch moves
	this.visual.mousemove = this.visual.touchmove = function(data){
		if(this.dragging && this.data ){
			this[ that.slideAxis ] = this[ that.slideAxis ] - ( this.data - data.data.global[ that.slideAxis ]);
		}

		this.data = data.data.global[ that.slideAxis ];
		that.events.mousemove.dispatch( data );
	}
};

Slider.prototype.findClosestChild = function(){		
	var animTarget = { distance : false, index: 0};
	for( var i = 0; i < this.visual.children.length; i++ ){
		if( animTarget.distance === false || Math.abs( this.center - (this.visual.children[i].getBounds()[ this.slideAxis ] + this.visual.children[i].getBounds().height / 2) ) < animTarget.distance ){
			animTarget.distance = this.center - (this.visual.children[i].getBounds()[ this.slideAxis ] + this.visual.children[i].getBounds().height / 2);
			animTarget.index = i;
		}
	}

	return animTarget;
};

Slider.prototype.getDistanceToChild = function( index ){
    var center = this.renderer.view.width / 2;
    var animTarget = {};
    this.visual.updateTransform();
    this.visual.children[index].updateTransform();
    animTarget.distance = center - (this.visual.children[index].getBounds().x + this.visual.children[index].getBounds().width / 2);
    animTarget.index = index;

    return animTarget;
};
