# PIXISlider
Slider element for PIXI. It supports sliding on either y or x axis. It handles both touch and mouse events perfectly.

It is dependant on http://greensock.com/tweenmax for the slight animation, https://millermedeiros.github.io/js-signals/ for event dispatching and ofcourse http://www.pixijs.com/ version3

##Properties
  1. ``` event ``` requestAtnimationFrame equivalent
  2. ``` slideAxis ``` the axis to slide. Y by default
  3. ``` center ``` the x or y coordinate to snap the neerest child on toucEnd / mouseUp. Center of the parent width or height by default
  4. ``` margin ``` the distance between sequential children of the slider. 0 by default
  
##Methods

  1. ``` addBackgrounds ``` - add background to every child of the slider
  
  ```js
    settings.color || 0xd8d7c2
    settings.x ||  this.visual.children[i].getLocalBounds().x
    settings.y || this.visual.children[i].getLocalBounds().y
    settings.width ||  window.innerWidth / this.visual.children[i].scale.x) - this.visual.children[i].getLocalBounds().x * 2 
    settings.height || this.visual.children[i].getLocalBounds().height
  ```
  2. ``` addElement ``` -adds child to the slider and positions it accordingly to the slideAxis and the other children
  3. ``` findClosestChild ``` - returns the closest child to the center ( childindex and distance )
  4. ``` getDistanceToChild( index ) ``` - returns the distance to the child at the given index
  
```js  
Example Usage
  var slider = new Slider( { 
  	event: this.stage.events.requestAnimFrame, 
  	slideAxis: 'y', 
  	center: window.innerHeight / 2,
  	margin: 10
  } );
  for (var i = 0; i < 100; i++) {
  	var text = new PIXI.Text( 'test' + i, {fill: "#d8d7c2", font: 'bold 40px Arial'} );
  	text.anchor = { x: 0, y: 0.5 };		
  	slider.addElement( text );		
  }
```  

