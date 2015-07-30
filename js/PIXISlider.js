var Slider = function( settings ){
	this.slideAxis = (settings && settings.slideAxis) || 'y';
	this.center = (settings && settings.center) || ( this.slideAxis == 'y' ? this.parent.getBounds().height / 2 : this.parent.getBounds().width / 2);
	this.margin = (settings && settings.margin ) || 0;
	this.visual = new PIXI.Container();
	this.originalSpeed = 0.5;
	this.timeLineHolder = [];
	this.delta = { x: 0, y: 0, t: 0 };
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

Slider.prototype.clearTimelines = function(){
	for (var i = 0; i < this.timeLineHolder.length; i++) {
            this.timeLineHolder[i].eventCallback('onComplete', null );
            this.timeLineHolder[i].clear();
        }
        this.timeLineHolder.length = 0;
	this.dragging = false;
	this.data = false;
	this.speed = this.originalSpeed;
}

Slider.prototype.reset = function(){
	this.clearTimelines();
};
Slider.prototype.select = function( index, dur, callback ){
        var duration = dur != undefined ? dur : this.originalSpeed;
	if( this.slideAxis == 'x' ){
	        var t = new TimelineMax().to(this.visual, duration, { x : Math.round(this.visual.x + this.getDistanceToChild( index ).distance), force3D:true, onComplete: function(){
                    if( callback )
                        callback();
                }});
	} else {
	        var t = new TimelineMax().to(this.visual, duration, { y : Math.round(this.visual.y + this.getDistanceToChild( index ).distance), force3D:true, onComplete: function(){
                    if( callback )
                        callback();
                }});
	}
        this.timeLineHolder.push(t);
        for( var i = 0; i < this.visual.children.length; i++ ){
            if( i != index ){
                
            } else {
                
            }
        }
};

Slider.prototype.addListeners = function(){
	this.visual.interactive = true;

	var that = this;		
	this.visual.mousedown = this.visual.touchstart = function(data){
		this.reset();
		this.visual.updateTransform();
		this.dragging = true;
		this.delta.t = data.data.originalEvent.timeStamp;
	        this.delta.x = data.data.global.x
	        this.delta.y = data.data.global.y
		that.events.mousedown.dispatch( data );		
	}.bind(this);

	this.visual.mouseup = this.visual.mouseupoutside = this.visual.touchend = this.visual.touchendoutside = function(data){
		if( !this.dragging )
		        return;

	        this.dragging = false;
                this.data = null;

		this.delta.t = data.data.originalEvent.timeStamp - this.delta.t;
	        this.delta.x = data.data.global.x - this.delta.x;
	        this.delta.y = data.data.global.y - this.delta.y;

		if( Math.abs( this.delta[this.slideAxis] ) < this.visual.children[ this.visual.children.length - 1 ].getBounds()[ this.slideAxis == 'x' ? 'width' : 'height' ] * 1.2  ){
		    this.index = this.findClosestChild().index + ( data.data.global[ this.slideAxis ] - this.center > 0 ? -1 : 1);
		} else if( this.delta.t > 200){
		    this.index = this.findClosestChild().index + (this.delta[ this.slideAxis ] > 0 ? -1 : 1);			
	        } else if( this.delta.t < 200 ){
		    this.index = this.findClosestChild().index - Math.round( this.delta[that.slideAxis] / this.delta.t );
    	        }

		if( this.index < 0 ){
		    this.index = 0;
		} else if( this.index > this.visual.children.length - 1 ){
		    this.index = this.visual.children.length - 1;
		}

		
		this.select( this.index );
		that.events.mouseup.dispatch( data );
	}.bind(this);

	// set the callbacks for when the mouse or a touch moves
	this.visual.mousemove = this.visual.touchmove = function(data){
		if(this.dragging && this.data ){
			this.visual[ that.slideAxis ] = this.visual[ that.slideAxis ] - ( this.data - data.data.global[ that.slideAxis ]);
		}

		this.data = data.data.global[ that.slideAxis ];
		that.events.mousemove.dispatch( data );
	}.bind(this);
};

Slider.prototype.findClosestChild = function(){		
	var animTarget = { distance : false, index: 0};
	var animTarget = { distance : 100000, index: 0};
        this.visual.updateTransform();
        for( var i = 0; i < this.visual.children.length; i++ ){
	    if( Math.abs( this.center - ( this.visual.children[i].getBounds()[this.slideAxis] + this.visual.children[i].getBounds()[this.slideAxis == 'x' ? 'width' : 'height'] / 2 ) ) < animTarget.distance ){
	        animTarget.distance = this.center - (this.visual.children[i].getBounds()[this.slideAxis] + this.visual.children[i].getBounds()[this.slideAxis == 'x' ? 'width' : 'height'] / 2);
	        animTarget.index = i;
	    }
		
        }

        return animTarget;
};

Slider.prototype.getDistanceToChild = function( index ){    
    var animTarget = {};
    this.visual.updateTransform();
    this.visual.children[index].updateTransform();

    animTarget.distance = this.center - (this.visual.children[index].getBounds()[this.slideAxis] + this.visual.children[index].getBounds()[this.slideAxis == 'x' ? 'width' : 'height'] / 2);
    animTarget.index = index;

    return animTarget;
};
