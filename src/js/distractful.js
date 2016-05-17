(function ($) {
	
    $.fn.distractful = function (options) {

		var el = this;
		var $slider = el;

		var pagers = '',
			controls = '',
			parallax = false,
			windowW = parseFloat($(window).innerWidth()),
			windowH = $(window).outerHeight(),
			halfHeight = ( windowH / 2 )
			pager_pos = 0,
			last_pager = 0

		
		// set up default options 
		var defaults = { 
			parallax:  false,
			controls: 'moving',
			controlRight: false,
			controlLeft: false,
			scrollSpeed: 1000,
			auto:false,
			pauseTime: 5000,
			showPagers: true,
			easing: 'easeInCubic',
			hoverPause: false, 
			touch: true,
			keyPress: false,
			//Callbacks
			imageLoaded : '',
			slideComplete : '',
			slideRight : '',
			slideLeft : '',
			beforeSlide: ''
		};	

		if ($(el).data('Distractful')) { return; }

		var init = function(options){

			if ($(el).data('Distractful')) { return; }

			//Override with user defined
			var options = $.extend({}, defaults, options);

			var checkEasing = options.easing
			if( options.easing !== false && !$.isFunction($.easing[checkEasing]) ){ // do something 

				console.log('Easing Function is either invalid, or the easing plugin is not loaded')
				console.log('To use easing, please load "//cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js", immediately after the jquery script')

				return false;
			}

			if(options.showPagers === true){pagers = '<div class="distractful-pagers"></div>';}

			if(options.controls !== false){

				if(options.controlRight){
					controls += '<div class="distractful-controls right">'+options.controlRight+'</div>'
				}
				else{
					controls += '<div class="default-controls distractful-controls right"></div>'
				}
				if(options.controlLeft){
					controls += '<div class="distractful-controls left">'+options.controlLeft+'</div>'
				}
				else{
					controls += '<div class="default-controls distractful-controls left"></div>'
				}

			}	

			if(options.keyPress === true){
				$(document).keydown(keyPress);
			}

			if(options.parallax === true){
				isParallax = true
				el.addClass('isParallax');
				el.after('<div class="distractfulParallaxPlaceholder" style="height:'+windowH+'px">'+controls+pagers+'</div>')

				var next_content = $('.distractfulParallaxPlaceholder').next();

				$(next_content[0]).css({position:'absolute'})
			}
			else{
				isParallax = false
				el.addClass('isNotParallax');
				$('body').addClass('distractful-body')
				el.after(controls+pagers)
			}


			if(options.controls !== false){

			}		  		

			var controlsHeight = $('.distractful-controls').outerHeight();

			var constrolsPosition = halfHeight - ( controlsHeight  );
			$('.distractful-controls').css({'top':constrolsPosition})	

			//Get item list
			var item_data = []
			var $item_data = $('.distractful-item');
			var item_data_max = $item_data.length;
			var item_count = 0;
			var item_start = windowW;
			var images = [];
			if(options.parallax === true){
				$(window).scroll(function (event) {
				    var scroll = $(window).scrollTop();
					if(options.controls === 'sticky'){
						$('.distractful-controls').css({'position':'fixed'})
					    if(scroll >= (constrolsPosition - 50)){
					    	$('.distractful-controls').fadeOut(100)
					    }
					    else{
					    	$('.distractful-controls').fadeIn(100)
					    }
					}
					if(options.parallaxScroll >= 1){
						$('.distractful').css({'top':(0-(scroll / options.parallaxScroll)*100)});
					}
				});		
			}

			$item_data.each(function(){

				$item_data.eq(0).addClass('first active');
				$item_data.eq(item_data_max - 1).addClass('last');			

				$(this).css({'height':windowH, 'width':windowW})
				$(this).css({'left':item_start});			
				item_count = (item_count + 1);
				item_start = (item_start + windowW);


				var obj = {}	

				$(this).children().each(function(){
					
					item_data[item_count] = []

					if($(this).is('img')){
						images.push($(this).attr('src'))
						obj = {'bg':$(this).attr('src')}
					}
					
				})
				$(this).css('background-image', 'url(' + obj.bg + ')');			

			});

			for (var i = item_count - 1; i >= 0; i--) {
				$('.distractful-pagers').append('<div class="distractful-pager"><a></a></div>')
			}
			$('.distractful-item').wrapInner( "<div class='distractful-content'></div>");

			if(item_count >= 2){

				$('.distractful-item.first').clone().addClass('clone').appendTo(el).css({'left':(item_start)});
				$('.distractful-item.last').clone().addClass('clone').prependTo(el).css({'left':'0'});
				$('.distractful-item').removeClass('first last');
				$('.distractful-pager:first-child').addClass('active')

			}
			else{
				$('.distractful-item').eq(0).css({left:0})

			}

			el.css({'height':windowH, 'left':-1*windowW, 'width':item_start + ( windowW * 2 )})		

			var promises = [];

			for (var p = 0; p < images.length; p++) {
			    (function(url, promise) {
			        var img = new Image();
			        img.onload = function() {
			          promise.resolve();
			        };
			        img.src = url;
			    })(images[p], promises[p] = $.Deferred());
			}
			$.when.apply($, promises).done(function() {

				if(typeof options.imageLoaded === 'function'){
					options.imageLoaded();
				}

			});

			el.data({
				Distractful: true,
				num_slides: item_count,
				element: el.selector,
				options: options

			})


		}	

		if(options.auto === true){

			var timer =	setInterval(function (){
					$('.distractful-controls.'+options.autoDirection).click();
				}, options.pauseTime);


			if(options.hoverPause === true){

				$('.distractfulParallaxPlaceholder').hover(function(ev){
				    clearInterval(timer);
				    console.log('hover para')
				}, function(ev){
					timer =	setInterval(function (){
						$('.distractful-controls.'+options.autoDirection).click();
					}, options.pauseTime);
				});				

				el.hover(function(ev){
					console.log('hover el')
				    clearInterval(timer);
				}, function(ev){
					timer =	setInterval(function (){
						$('.distractful-controls.'+options.autoDirection).click();
					}, options.pauseTime);
				});		

			}			
				

		}

		if(options.touch === true){

			var scroll = false

			$(window).scroll(function(){
			    scroll = true
			    var stopListener = $(window).on("mouseup touchend",function(){ // listen to mouse up
			        scroll = false

			    });
			});

	        $(".distractful").on("mousedown touchstart", function(e) {     	

	        	if(scroll === true){return}

	        	$(this).css({'cursor':'grab'})

	            var startX = e.pageX || e.originalEvent.touches[0].pageX,
	                winW = $(window).width();
	            	diff = 0;

	            $(".distractful").on("mousemove touchmove", function(e) {

	            	this.movex = this.index*this.slideWidth + (this.touchstartx - this.touchmovex);

	                var x = e.pageX || e.originalEvent.touches[0].pageX;
	                diff = (startX - x);
	                if(scroll !== true){
		                $slider.css("transform", "translate3d("+ (-diff/2) +"px,0,0)");
		            }
	            });
	        });

	        $(".distractful").on("mouseup touchend", function(e) {
	        	if(scroll === true){return}
	            $(".distractful").off("mousemove touchmove");

				if(typeof diff == 'undefined'){return}

				if (diff <= -50) {
					el.slideLeft()
					return
				}
				if (diff >= 50) {
					el.slideRight()
					return
				}    

	        })

    	}

		/*******************************
		 *
		 * The main movement function
		 * 
		 *//////////////////////////////    	

		var move = function(evt) {

			if(typeof options.beforeSlide === 'function'){
				options.beforeSlide();
			}

			$('.distractful-controls').prop('disabled', true)
			$('.distractful-item').removeClass('active')
			$('.distractful-pager').removeClass('active').prop('disabled', true)

			var $items = el.children(),				
				$pagers = $('.distractful-pagers').children(),
				pager_max = $pagers.length
				item_max = $items.length,
				moveAmount = $(window).outerWidth(),
				newMoveAmount = ''

		    var transform = el.css('transform').split(/[()]/)[1]

		    if(transform){
			    newMoveAmount = transform.split(',')[4]
			    moveAmount = moveAmount - Math.abs(newMoveAmount)
			}

	        if(evt.paged === true){
		    	pager_pos = evt.index;
		    	moveAmount = (  Math.abs( evt.delta * moveAmount ) )
	        }
	        else{		    	
		    	pager_pos = (pager_pos + evt.delta) % pager_max;
	        }

	        var slideData = {
	        	item_max: item_max,
	        	pager_pos: pager_pos,
	        	pager_max: pager_max,
	        	newMoveAmount: newMoveAmount,
	        	moveAmount: moveAmount,
	        	items: $items
	        	
	        }   	        

    		if(isParallax === false){
    			//moveEl = $('.distractful-item')
    			slideData.parallax = false
    		}
    		else{        	
    			//moveEl = el
    			slideData.parallax = true
	        }

        	if(evt.dir === 'right'){
        		moveDirMath = '-='
        	}
        	else{
        		moveDirMath = '+='
        	}     	

        	notParallaxCount = 0        	

    		el.animate({'left': moveDirMath+slideData.moveAmount+'px'}, {duration:options.scrollSpeed, easing: options.easing})
    		.promise().then(function(){

    			if(slideData.newMoveAmount != ''){
    				el.css({'transform': ''})
    			}

    			switch(evt.dir){

    				case 'right':

		    			if(slideData.pager_pos === 0){
		    				el.css({'left':-1*slideData.moveAmount})
		    			}

		    			if(slideData.newMoveAmount != ''){
		    				el.css({'left': parseInt(el.css('left')) - Math.abs(slideData.newMoveAmount)  })  
		    			}

			    		//Fire the slideRight function
						if(typeof options.slideRight === 'function'){
							options.slideRight()
						}

    				break;

    				case 'left' :

		    			if(slideData.pager_pos === -1){

		    				pager_pos = ( slideData.pager_max - 1 )

		    				if(slideData.newMoveAmount != ''){
		    					el.css({'left': -Math.abs(windowW * (slideData.item_max - 2))}) 
		    				}
		    				else{
		    					el.css({'left':-Math.abs((slideData.item_max - 2)*slideData.moveAmount)})
		    				}
		    			}
		    			else{

			    			if(slideData.newMoveAmount != ''){
			    				el.css({'left': parseInt(el.css('left')) + Math.abs(slideData.newMoveAmount)  })  
			    			}	
		    			}	    			

						//Fire the slideLeft function
			    		if(typeof options.slideLeft=== 'function'){
							options.slideLeft()
						}

    				break;
    			}

				$('.distractful-controls').prop('disabled', false)
				$('.distractful-item')
				$('.distractful-pager').prop('disabled', false)

				

				$items.eq(pager_pos+1).addClass('active')
				$pagers.eq(pager_pos).addClass('active')
				last_pager = pager_pos	

				//Fire the slideComplete function
				if(typeof options.slideComplete === 'function'){
					options.slideComplete()
					
				}
    		});		        

	    }

		/*******************************
		 *
		 * Handle Keyboard usage
		 * 
		 *//////////////////////////////	    

		var keyPress = function(e){

			var activeElementTag = document.activeElement.tagName.toLowerCase(),
				tagFilters = 'input|textarea',
				p = new RegExp(activeElementTag,['i']),
				result = p.exec(tagFilters);

			if (result == null && el.isVisible()) {
				if (e.keyCode === 39) {
					el.slideRight()
					return false;
				} else if (e.keyCode === 37) {
					el.slideLeft()
					return false;
				}
			}

		}

		/*******************************
		 *
		 * Adjust Distractful items on window resize
		 * 
		 *//////////////////////////////

		var width = $(window).width()	

	    $( window ).resize(function() {

	    	var newwindowH = $(window).outerHeight(),
	    	    newwindowW = parseFloat($(window).innerWidth()),
	    	    newitem_start = 0,
	    	    newHalfHeight = ( newwindowH / 2 )

	    	if($(window).width() != width){

		    	el.css({'height':newwindowH, 'left':-1*newwindowW, 'width':newitem_start + ( newwindowW * 2 )})	

		    	$('.distractfulParallaxPlaceholder').height(newwindowH)

		    	var $newitem_data = $('.distractful-item');

				$newitem_data.each(function(){

					$(this).css({'height':newwindowH, 'width':newwindowW})
					$(this).css({'left':newitem_start});			
					
					newitem_start = (newitem_start + newwindowW);

				});	

			var newControlsHeight = $('.distractful-controls').outerHeight();

			var newConstrolsPosition = newHalfHeight - ( newControlsHeight  );
			$('.distractful-controls').css({'top':newConstrolsPosition})				

				width = $(window).width()	

				el.css({'width':$newitem_data.length * newwindowW})
			}

			
	    });  

		/*******************************
		 *
		 * Handle the click events on Controls
		 * 
		 *//////////////////////////////    	    

		$('body')
		.on('click', '.distractful-controls.left', function(){el.slideLeft()})
        .on('click', '.distractful-controls.right', function(){el.slideRight()})

		/*******************************
		 *
		 * Distractful Pagers
		 * 
		 *//////////////////////////////

		$('body').on('click', '.distractful-pager',  function(){

			if(!$(this).hasClass('active')){
				var index = $('.distractful-pager').index( this );
				dist.goToSlide(index)
			}
		})

		el.slideLeft = function(){
			var evt ={
				delta: -1,
				dir: 'left'
			}
			move(evt)			
		}

		el.slideRight = function(){
			var evt ={
				delta: 1,
				dir: 'right'
			}
			move(evt)			
		}

		el.getSlidePosition = function(){
			return pager_pos;
		}

		el.getSlideCount = function(){
			return el.children().length - 2;
		}

		el.getSlideElement = function(index){
			return el.children().eq(index + 1);
		}

		el.goToSlide = function(slideNum){

			var index = slideNum

			var evt = {index:index, paged: true}

			if(last_pager > index){
				evt.dir = 'left';
			}
			else{
				evt.dir = 'right';
			}

			var newDelta = (index - last_pager)
			evt.delta = newDelta
			last_pager = index	

			move(evt)

		}

		el.isVisible = function(){
			var win = $(window),
				viewport = {
					top: win.scrollTop(),
					left: win.scrollLeft()
				},
				bounds = el.offset();

			viewport.right = viewport.left + win.width();
			viewport.bottom = viewport.top + win.height();
			bounds.right = bounds.left + el.outerWidth();
			bounds.bottom = bounds.top + el.outerHeight();

			return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
   

		}


		init(options)

		return this;    

	}
}(jQuery));