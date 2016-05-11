(function ($) {
	
    $.fn.distractful = function (options) {

		//Get window Dimensions
		var windowW = parseFloat($(window).innerWidth());
		var windowH = $(window).outerHeight();	
		var halfHeight = ( windowH / 2 );
		
		var el = this;
		var $slider = el;

		var pagers = '',
			controls = ''	
		
		// set up default options 
		var defaults = { 
			parallax:  false,
			controls: 'moving',		
			scrollSpeed: 1000,
			auto:false,
			pauseTime: 5000,
			showPagers: true,
			easing: 'easeInCubic',
			hoverPause: false, 
			touch: true,
			//Callbacks
			imageLoaded : '',
			slideComplete : '',
			slideRight : '',
			slideLeft : '',
			beforeSlide: ''
		};	

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
			controls = '<div class="distractful-controls left"></div><div class="distractful-controls right"></div>';
		}	

		if(options.parallax === true){
			this.addClass('isParallax');
			this.after('<div class="distractfulParallaxPlaceholder" style="height:'+windowH+'px">'+controls+pagers+'</div>')

			var next_content = $('.distractfulParallaxPlaceholder').next();

			$(next_content[0]).css({position:'absolute'})
		}
		else{
			$('body').addClass('distractful-body')
			this.after(controls+pagers)
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

		var pos = 0;
		var pager_pos = 0;
		var last_pager = 0;

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
			$('.distractful-pagers').append('<div class="distractful-pager"><a href="#"></a></div>')
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

		this.css({'height':windowH, 'left':-1*windowW, 'width':item_start + ( windowW * 2 )})		

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
					moveLeft()
					return
				}
				if (diff >= 50) {
					moveRight()
					return
				}    

	        })

    	} 
		
		function moveLeft(){
			var evt ={
				delta: -1,
				dir: 'left'
			}
			move(evt)			
		}
		function moveRight(){
			var evt ={
				delta: 1,
				dir: 'right'
			}
			move(evt)			
		}

		/*******************************
		 *
		 * The main movement function
		 * 
		 *//////////////////////////////    	

		function move(evt) {

			if(typeof options.beforeSlide === 'function'){
				options.beforeSlide();
			}

			$('.distractful-controls').prop('disabled', true)
			$('.distractful-item').removeClass('active')
			$('.distractful-pager').removeClass('active').prop('disabled', true)

	        var $items = el.children(),
		        $pagers = $('.distractful-pagers').children(),
		        max = $items.length,
		        pager_max = $pagers.length,
		        newMoveAmount = '',
		        moveAmount = $(window).innerWidth();

		    var transform = el.css('transform').split(/[()]/)[1]

		    if(transform){
			    newMoveAmount = transform.split(',')[4]
			    moveAmount = moveAmount - Math.abs(newMoveAmount)
			}

		    pos = (pos + evt.delta) % max; // update the position

	        if(evt.paged === true){
		    	pager_pos = evt.index;
		    	moveAmount = (  Math.abs( evt.delta * moveAmount ) )
	        }
	        else{		    	
		    	pager_pos = (pager_pos + evt.delta) % pager_max;
	        }

	        

        	if(evt.dir === 'right'){

				el.animate({'left':'-='+moveAmount+'px'}, {duration:options.scrollSpeed, easing: options.easing, complete: function() {

					//If we make it to the last slide, reset back to the first cloned duplicate so we can slide infinite amounts
					if(pos == (max - 2) || pager_pos === 0 ){
						pos = 0;
						pager_pos = 0;
						el.css({'left':-1*moveAmount})
					}

					//If we used a touch event, we need to remove the transform (drag) attribute, then reset the left spacing
					if(newMoveAmount){

						el.css({'transform': '', 'left': parseInt(el.css('left')) - Math.abs(newMoveAmount)  })  

					} 

	        		//Fire the slideRight function
					if(typeof options.slideRight === 'function'){
						options.slideRight()
					}

					//Fire the slideComplete function
					if(typeof options.slideComplete === 'function'){
						options.slideComplete()
					}

					$('.distractful-pager, .distractful-controls').prop('disabled', false)

		        	$items.eq(pos+1).addClass('active')

		        	last_pager = pager_pos

		        	$pagers.eq(pager_pos).addClass('active')

				}});
        	}
        	else{
        		el.animate({'left':'+='+moveAmount+'px'}, {duration:options.scrollSpeed, easing: options.easing, complete: function() {

        			//If we make it to the first slide, reset back to the last cloned duplicate so we can slide infinite amounts
	        		if(pos == -1 || pager_pos == pager_max || pos == 0){
	        			pos = (max - 2)
						pager_pos = pager_max - 1
	        			el.css({'left':-Math.abs((max - 2)*moveAmount)})

	        		}        			

					//If we used a touch event, we need to remove the transform (drag) attribute, then reset the left spacing
					if(newMoveAmount){

						if(pos == (max - 2)){
							el.css({'transform': '', 'left': -Math.abs(windowW * (max - 2))})  
						}
						else{
							el.css({'transform': '', 'left': parseInt(el.css('left')) + Math.abs(newMoveAmount)  }) 
						}

					}         			

        			//Fire the slideRight function
	        		if(typeof options.slideLeft=== 'function'){
						options.slideLeft()
					}

					//Fire the slideComplete function
					if(typeof options.slideComplete === 'function'){
						options.slideComplete()
						
					}				

					$('.distractful-pager, .distractful-controls').prop('disabled', false)

		        	$items.eq(pos+1).addClass('active');

		        	last_pager = pager_pos;

		        	$pagers.eq(pager_pos).addClass('active')
				}});
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
	    	    newitem_start = 0;

	    	if($(window).width() != width){

		    	el.css({'height':newwindowH, 'left':-1*newwindowW, 'width':newitem_start + ( newwindowW * 2 )})	

		    	$('.distractfulParallaxPlaceholder').height(newwindowH)

		    	var $newitem_data = $('.distractful-item');

				$newitem_data.each(function(){

					$(this).css({'height':newwindowH, 'width':newwindowW})
					$(this).css({'left':newitem_start});			
					
					newitem_start = (newitem_start + newwindowW);

				});	

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
		.on('click', '.distractful-controls.left', moveLeft)
        .on('click', '.distractful-controls.right', moveRight)
        

		/*******************************
		 *
		 * Distractful Pagers
		 * 
		 *//////////////////////////////

		$('body').on('click', '.distractful-pager',  function(){

			if(!$(this).hasClass('active')){
				var index = $('.distractful-pager').index( this );
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
		}) 	    

	}
}(jQuery));