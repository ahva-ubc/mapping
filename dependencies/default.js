/*
    SFU AJAX Controller
    Purpose: handles AJAX Requestst
    Dependencies: none
*/

var clfAjaxCtrl = (function($) {

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            ajaxCtrl : {               
            } 
        }); 
    } // /function _bindElements();

    function  _bindListeners() {

    } // /function _bindListeners();


	function _defaultSuccess(data) { return data; }
	function _defaultError(xhr) { console.error("err:"); console.error(xhr); }
	function _defaultComplete(data) { return; }



    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

  function invoke(url, params) {
		var options = $.extend({
			method: "GET",
			dataType : "JSON",
            data : {},
			beforeSend : "",
			onSuccess : _defaultSuccess,
			onError : _defaultError,
			onComplete : _defaultComplete
        }, params);
		
		$.ajax({
			url: url,
			type: options.method,
			dataType: options.dataType,
			beforeSend : options.beforeSend,
			data: options.data,                                               
			success : options.onSuccess,
			error : options.onError,
			complete : options.onComplete,
		});                          
	} // end invoke()


    function spinner(container,action) {
        if (action == "on") {
            $(container).append("<div class='sfu-global-spinner-container'></div>");
        } else {
            $(container).find(".sfu-global-spinner-container").remove();
        }
        $(".sfu-global-spinner-container").css({
            "background-image" : "url('" + $.trim(clfSettings.ajaxSettings.ajaxLoader) + "')",
            "width" : "32px",
            "height" : "32px"
        });
    }

    function init() {
        _bindElements();
        _bindListeners();
    }  // /init(); 

    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init,
        invoke : invoke,
        spinner : spinner
    } 

})(jQuery);
/*
    SFU BACK TO TOP Controller
    Purpose: Handles the showing/hiding of the back to top button
    Dependencies: sfuScreenCtrl, font-awesome .fa-angle-up

    Notes:
    Style the back to top button as you wish, here is the suggested styles:
    
        #back-to-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: .8;
            width: 50px;
            height: 50px;
            color: #fff;
            background: #a6192e;
            text-align: center;
            line-height: 50px;
            font-size: 40px;
            border-radius: 50px;
            cursor: pointer;
            display: none; // this is manditory, hide it by default
        }
        
        // this is manditory, as the script will add a class of "show" when the link needs to be displayed
        #back-to-top.show { 
            display: block;
        }
        
*/


var clfBackToTopCtrl = (function($) {

    /*  
    ------------------------------------------------------------    
    Global Variables for sfuBackToTopCtrl
    ------------------------------------------------------------
    */

    var _backToTopCtrl = {};
    
    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            backToTopCtrl : {
                backToTop : $("#back-to-top")
            } 
        }); 
    } // /function _bindElements();

    function _setGlobalVars() {
        $.extend(_backToTopCtrl, {
            scrollPos : 0,
            scrollPosShow : null,
            timeoutMS : 3000,
            scrollSpeed : 500
        }); 

    } // /function _setGlobalVars();

    function  _bindListeners() {
        $el.window.on("scroll.backToTop",function() {
            _renderBackToTop();
        });

        $el.backToTopCtrl.backToTop.on("click",function() {           
            //scroll both HTML and BODY to top (browser compatability)
            $el.html.animate({
                scrollTop: 0
            },_backToTopCtrl.scrollSpeed);

            $el.body.animate({
                scrollTop: 0
            },_backToTopCtrl.scrollSpeed);
        });
    
        $el.backToTopCtrl.backToTop.on("mouseover",function() {
            _cancelBackToTopTimer();
        });

        $el.backToTopCtrl.backToTop.on("mouseout",function() {
            _setBackToTopTimer();
        });
        
        $el.window.on("resize.backToTop",function() {
            $el.backToTopCtrl.backToTop.removeClass("show");
        });

    } // /function _bindListeners();

    function _renderBackToTop() {
        _cancelBackToTopTimer();
        var currentScroll = $el.window.scrollTop();
        if (currentScroll < _backToTopCtrl.scrollPos) {
            $("#main-navigation-container.fixable").addClass("fixed show");
            $el.backToTopCtrl.backToTop.addClass("show")
            _setBackToTopTimer();
        } else {
            $("#main-navigation-container.fixable").removeClass("show");
            $el.backToTopCtrl.backToTop.removeClass("show");
        }
        
        _backToTopCtrl.scrollPos = currentScroll;
        
        if (_backToTopCtrl.scrollPos == 0) {
            $el.backToTopCtrl.backToTop.removeClass("show");
        }
    } // /function _renderBackToTop()

    function _setBackToTopTimer() {
        _backToTopCtrl.scrollPosShow = setTimeout(function() {
            $el.backToTopCtrl.backToTop.removeClass("show");
        },_backToTopCtrl.timeoutMS);
    } // /function _setBackToTopTimer()

    function _cancelBackToTopTimer() {
        clearTimeout(_backToTopCtrl.scrollPosShow);
    } // /function _cancelBackToTopTimer()

    function _attachBackToTopLink() {
       var btt = $('<div id="back-to-top"><i class="icon icon-angle-up"></i></div>');
        $(btt).appendTo("body");
        return true;
    } // /function _attachBackToTopLink()

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

    function init() {
        _attachBackToTopLink();
        _bindElements();
        _setGlobalVars();
        _bindListeners();        
    }  // /init();

    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init
    } 

})(jQuery);
/*
    SFU Swipe Controller
    Purpose: detect left/right/up/down touch swipe
    from http://www.javascriptkit.com/javatutors/touchevents2.shtml
*/

var clfSwipeCtrl = (function() {
    
    function _swipedetect(el, callback){
    
        var touchsurface = el,
        swipedir,
        startX,
        startY,
        distX,
        distY,
        threshold = 150, //required min distance traveled to be considered swipe
        restraint = 100, // maximum distance allowed at the same time in perpendicular direction
        allowedTime = 300, // maximum time allowed to travel that distance
        elapsedTime,
        startTime,
        handleswipe = callback || function(swipedir){}
    
        touchsurface.addEventListener('touchstart', function(e){
            var touchobj = e.changedTouches[0];
            swipedir = 'none';
            dist = 0;
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime(); // record time when finger first makes contact with surface

        }, false)
    
        touchsurface.addEventListener('touchmove', function(e){
            e.preventDefault() // prevent scrolling when inside DIV
        }, false)
    
        touchsurface.addEventListener('touchend', function(e){
            var touchobj = e.changedTouches[0]
            distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
            distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
            elapsedTime = new Date().getTime() - startTime // get time elapsed
            if (elapsedTime <= allowedTime){ // first condition for awipe met
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                    swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
                }
                else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                    swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                }
            }
            handleswipe(swipedir)

        }, false)
    }


    function addSwipe(el, callback) {
     
        var el = document.getElementById(el)    
        _swipedetect(el, function(swipedir){
            callback(swipedir);
        });
    
    }


    return {
        addSwipe : addSwipe
    }

})();


var clfCustomPlugins = (function($) {
    
    function init() {
        (function ( $ ) {
            // toggle elements to display:inline
            // usage $(selector).ishow();
            $.fn.ishow = function() {
                this.css( "display", "inline" );
                return this;
            };
            
            // toggle elements to display:inline-block
            // usage $(selector).ibshow();
            $.fn.ibshow = function() {
                this.css( "display", "inline-block" );
                return this;
            };

            // toggle elements to visibility: hidden
            // usage $(selector).vhide();
            $.fn.vhide = function() {
                this.css( "visibility", "hidden" );
                return this;
            };

            // toggle elements to visibility: visibile
            // usage $(selector).vshow();
            $.fn.vshow = function() {
                this.css( "visibility", "visible" );
                return this;
            };

            // adds a "fixed" class to an element
            // usage $(selector).fixit();
            $.fn.fixit = function() {
                this.addClass("fixed");
                return this;
            };

            // removes a "fixed" class to an element
            // usage $(selector).unfixit();
            $.fn.unfixit = function() {
                this.removeClass("fixed" );
                return this;
            };

        }( jQuery ));
    }
    return {
        init : init
    }

})(jQuery);

/*
    SFU ExtnernalFeed CTRL
    Purpose: handles external feed component
    Dependencies: none
*/

var clfExternalFeedCtrl = (function($) {

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */
   var $elc = {};

    function _bindElements() {
    } // /function _bindElements();

    function _bindListeners() {
    }

    function _removeEmptyPTags() {
        $('li.rssRow p').each(function() {
            var _self = $(this);
            if(_self.html().replace(/\s|&nbsp;/g, '').length == 0)
                _self.remove();
        });
    }


    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

    function init() {            
        _bindElements();
        _bindListeners();
        _removeEmptyPTags();
    } // end init()
    
    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */
    return {
        init : init
    }

})(jQuery);
/*
    SFU Font Awesome Controller
    Purpose: Converts text to Font Awesome Fonts for legacy systems
    Dependencies: none

    To add new fonts and allow legacy system usage, add them _faCtrl controller in _setGlobalVars(), a full list of available fonts is available 
    on the font awesome website at http://fontawesome.io/icons/
*/

var clfFontIconCtrl = (function($) {
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _faCtrl = {};

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            faCtrl : {               
                icon : $("span.icon,i.icon,a.icon")
            } 
        }); 
    } // /function _bindElements();


    function  _bindListeners() {
        $el.faCtrl.icon.each(function() {
            var _self = $(this);
            if (_self.attr("class").indexOf("icon-") < 0 && !_isDownloadComponent(_self)) { 
                var icon = _self.text();                 
                _self.html("").addClass("icon icon-" + _faCtrl[icon]);
            }
            // If any font awesome icons do not have an aria-label attribute, 
            // set an aria-hidden attribute to it to ensure screen readers ignore it.
            if (_self.attr("aria-label") === undefined) {
                _self.attr("aria-hidden","true");
                $("<span class='sr-only'>" + _faCtrl[icon] + "</span>").appendTo(_self);
                _self.parent("a").attr("aria-label",_faCtrl[icon]);
            }
        });        
    } // /function _bindListeners(); 

    function _isDownloadComponent(obj) {
        return obj.attr("class").indexOf("type_") > -1;
    } // /function _isDownloadComponent();
    
    function _setGlobalVars() {
        $.extend(_faCtrl, {
            "F" : "facebook",
            "I" : "instagram",
            "YT" : "youtube",
            "T" : "twitter",
            "H" : "home",
            "*" : "star",
            "y" : "check",
            "x" : "times",
            "z" : "search-plus",
            "Z" : "search-minus",
            "u" : "cog",
            "d" : "trash-o",
            "f" : "file-o",
            "p" : "print",
            "m" : "map-marker",
            "S" : "caret-right",
            "<" : "chevron-left",
            ">" : "chevron-right",
            "+" : "plus-circle",
            "-" : "minus-circle",
            "Y" : "check-circle",
            "i" : "info-circle",
            "?" : "question-circle",
            "o" : "external-link",
            "}" : "arrow-circle-right",
            "{" : "arrow-circle-left",
            "c" : "comment-o",
            "C" : "comment",
            "e" : "envelope",
            "P" : "pinterest",
            "G" : "google-plus",
            ":" : "quote-left",
            ";" : "quote-right",
            "sc" : "snapchat-ghost",
            "L" : "linkedin",
            "PDF" : "file-pdf"
        }); 
    } // /function _setGlobalVars()

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
   
    function fontList() {
        // returns a full list of fonts available as an object
        return _faCtrl;
    } // /function fontList

    function init() {
        _setGlobalVars();
        _bindElements();
        _bindListeners();
    }  // /init();


    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init,
        fontList : fontList
    } 

})(jQuery);
/*
    SFU Footer Controller
    Purpose: Conrols js functionality for footer
    Dependencies: none
*/

var clfFooterCtrl = (function($) {
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _footerCtrl = {
        // mt
    };

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            footerCtrl : {               
                // .header-left p is for AEM, ul is for stand alone
                socialIcons : $(".ribbon__content--social-icons .header-left p, .ribbon__content--social-icons ul:nth-child(2)"),
                footerContactSection : $(".sfu-global--footer-social-links"),
                mobilNavSocialIcons : $(".mobile-nav__content--social-links")
            } 
        }); 
    } // /function _bindElements();


    function  _bindListeners() {
        // no listeners
    } // /function _bindListeners(); 

    function _duplicateSocialIconsInFooter() {
        var socialIconLinks = $el.footerCtrl.socialIcons.clone();
        var sil = $(socialIconLinks);
        if (sil.find("a").length < 2) {
            $el.footerCtrl.footerContactSection.remove();
        } else {
            sil.find(".social-icons__home-link").remove();
            if (sil.find("li").length > 0) {
                $el.footerCtrl.footerContactSection.append("<ul>" + socialIconLinks.html() + "</ul>");
                $el.footerCtrl.mobilNavSocialIcons.append("<ul>" + socialIconLinks.html() + "</ul>");
            } else {

                $el.footerCtrl.footerContactSection.append(socialIconLinks.html());
                $el.footerCtrl.mobilNavSocialIcons.append(socialIconLinks.html());
            }
        }
    }

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
   
    function init() {
        _bindElements();
        _bindListeners();
        _duplicateSocialIconsInFooter();
    }  // /init();


    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init
    } 

})(jQuery);
/*
    SFU Image Gallery CTRL
    Purpose: handles scripts related to image gallery component
    Dependencies: none
*/

var clfImageGalleryCtrl = (function($) {

    /* ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _imageGalleryCtrl = {
        totalImages : 0,
        maxheight : 0,
        scrollSize : 0,
        thumbnailOffsetLeft : 0,
        thumbnailOffsetRight : 0,
        isSlideShow : false,
        startSlideShow : null
    };
    
    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */
    function _bindElements() {
        $.extend($el, {
            "imageGalleryCtrl" : {
                "mainContainer" : $(".sfu-image-gallery"),
                "slideshow" : {
                    "container" : $(".sfu-image-gallery[data-gallery-type=slideshow]"),
                    "playbutton" : $(".start-slideshow"),
                    "pausebutton" : $(".pause-slideshow")
                },
                "counter" : {
                    "currentImage" : $(".current-image"),
                    "prev" : $(".sfu-image-gallery__feature-below--counter .prev-image"),
                    "next" : $(".sfu-image-gallery__feature-below--counter .next-image")
                },  
                "navigationContainter" : function() { return $(".sfu-image-gallery__navigation"); },
                "thumbnailContainer" : {
                    "nextArrow" : $(".sfu-image-gallery__navigation--next-page"),
                    "prevArrow" : $(".sfu-image-gallery__navigation--prev-page"),
                    "container" : function() { return $(".sfu-image-gallery__navigation--thumbs"); },
                    "imageContainer" : function() { return $(".sfu-image-gallery__thumbnails"); },
                    "thumbnails" : {
                        "all" : function() { return $("[data-thumbnail]"); },
                        "single" : function(x) { return $("[data-thumbnail=" + x + "]") },
                        "active" : function () { return $("[data-thumbnail].active") },
                        "first" : function() { return $("[data-thumbnail]:first"); },
                        "last" : function() { return $("[data-thumbnail]:last"); },
                        "visible" : {
                            "first" : function() { return $("div.js-visible-thumb:first") },
                            "last" : function() { return $("div.js-visible-thumb:last"); },
                            }
                    }
                },
                "featureImageContainer" : {
                    "container" : $(".sfu-image-gallery__feature-image"),
                    "images" : {
                        "all" : $(".sfu-image-gallery__feature-images--image"),
                        "single" : function(x) { return $("[data-feature-image=" + x + "]");  }
                    }
                },
                "captions" : {
                    "container" : $(".sfu-image-gallery__feature-below--caption"),
                    "single" : function(x) { return $("[data-feature-image=" + x +"] p"); }
                }
            }
        });
    } // /function _bindElements();

    function _bindListeners() {

        $(window).on("resize.image-gallery",function() {
            _setFeatureImageContainerHeight();
            if (_imageGalleryCtrl.isSlideShow == false) {
                _setScrollSize();
                _applyThumbnailOffset();
                _showHideThumbnailArrows();
                _updateVisibleThumbnails();
            }
        });


        clfSwipeCtrl.addSwipe('sfu-image-gallery__feature-images',function(dir) { 
            if (dir.toLowerCase() == "left") {
                _updateFeatureImage("next");
            } else if (dir.toLowerCase() == "right") {
                _updateFeatureImage("prev");
            } else {
                // if not left or right, return "true" to register a "click" event
                return true;
            }            
         });

        if (_imageGalleryCtrl.isSlideShow == true) {
            _bindSlideShowListeners();
        } else {
             _bindThumbnailListeners();
        }

    }
    function _convertSmallThumbnailToSlideshow() {
        lessThan50PercentColumns = [
            $("[data-col-layout='33-67'] div.c1"),
            $("[data-col-layout='67-33'] div.c2"),
            $("[data-col-layout='33-33-33'] div"),
            $("[data-col-layout='25-25-50'] div.c1, [data-col-layout='25-25-50'] div.c2"),
            $("[data-col-layout='50-25-25'] div.c2, [data-col-layout='50-25-25'] div.c3"),
            $("[data-col-layout='25-25-25-25'] div")
        ];

        $(lessThan50PercentColumns).each(function() {
            var _self = $(this);
            _self.find(".sfu-image-gallery[data-gallery-type='thumbnails']").attr("data-gallery-type","slideshow");
        });
    }

    function _bindThumbnailListeners() {
        $el.imageGalleryCtrl.thumbnailContainer.thumbnails.all().on("click",function() {
            var _self = $(this);
            _showFeatureImage(_self.attr("data-thumbnail"));
        });

        clfSwipeCtrl.addSwipe('sfu-image-gallery__thumbnails',function(dir) { 
            if (dir.toLowerCase() == "left") {
                _slideThumbnails("next");
            } else if (dir.toLowerCase() == "right") {
                _slideThumbnails("prev");
            } else {
                // if not left or right, return "true" to register a "click" event
                return true;
            }
         });

        $el.imageGalleryCtrl.counter.prev.on("click.prev-image",function() {
            _updateFeatureImage("prev");
        });

        $el.imageGalleryCtrl.counter.next.on("click.next-image",function() {
            _updateFeatureImage("next");
        });

         _toggleElementInteraction("on");
    }

    function _bindSlideShowListeners() {
        $el.imageGalleryCtrl.slideshow.playbutton.on("click", function() {
            if (!$el.imageGalleryCtrl.slideshow.container.hasClass("js-slideshow-started")) {
                // if it's not already started, start it
                var _self = $(this);
                _self.addClass("active");
                $el.imageGalleryCtrl.slideshow.pausebutton.removeClass("active");
                _toggleWindowScrollAutoPlay("on");
                _play();
                _startSlideShow();
            }
        });
        $el.imageGalleryCtrl.slideshow.pausebutton.on("click", function() {
            var _self = $(this);
            _self.addClass("active");
            $el.imageGalleryCtrl.slideshow.playbutton.removeClass("active");
            _toggleWindowScrollAutoPlay("off");
            _stop();
        });

        $el.imageGalleryCtrl.featureImageContainer.images.all.on("click", function() {
            var $pauseButton = $el.imageGalleryCtrl.slideshow.pausebutton;
            var $playButton = $el.imageGalleryCtrl.slideshow.playbutton;                

            if ($el.imageGalleryCtrl.mainContainer.hasClass("js-slideshow-started")) {                    
                $pauseButton.addClass("active");
                $playButton.removeClass("active");
                _toggleWindowScrollAutoPlay("off");
                _stop();
            } else {
                $pauseButton.removeClass("active");
                $playButton.addClass("active");
                _toggleWindowScrollAutoPlay("on");
                _play();
                _startSlideShow();
            }
        });
        
        _toggleWindowScrollAutoPlay("on");
      

    }

    function _toggleElementInteraction(tgl) {
        _toggleThumbnailClick(tgl);
    }

    function _toggleWindowScrollAutoPlay(tgl) {
        if (tgl == "on") {
            $(window).on("scroll.in-view,resize.in-view",function() {
                _checkSlideShowInView(true);
            });
        } else {
            $(window).off("scroll.in-view,resize.in-view");
        }
    }


    function _checkSlideShowInView(isScroll) {
        if (_slideShowStarted() && !clfInViewCtrl.isInView50('sfu-image-gallery__feature-images')) {
            _stop();
        } else if (!_slideShowStarted() && clfInViewCtrl.isInView50('sfu-image-gallery__feature-images')) {            
            _startSlideShow();
        }
    }

    function _slideShowStarted() {
        return $el.imageGalleryCtrl.mainContainer.hasClass("js-slideshow-started");
    }

    function _updateFeatureImage(dir) {
        var activeThumb = parseInt($el.imageGalleryCtrl.thumbnailContainer.thumbnails.active().attr("data-thumbnail"));
        var nextThumb;
        if (dir.toLowerCase() == "next") {
            if (activeThumb == _imageGalleryCtrl.totalImages) {
                return false;
            } else {
                nextThumb = activeThumb + 1 ;
            }
        } else if (dir.toLowerCase() == "prev") {
            if (activeThumb == 1) {
                return false;
            } else {
                nextThumb = activeThumb - 1 ;
            }
        } else {
            // if not left or right, return "true" to register a "click" event
            return true;
        }            

        $el.imageGalleryCtrl.thumbnailContainer.thumbnails.single(nextThumb).trigger("click");    
        var visibleThumbs = _getVisibleThumbs();
        if (visibleThumbs[0] > nextThumb) {
            _slideThumbnails("prev");
        } 
        if (visibleThumbs[1] < nextThumb) {
            _slideThumbnails("next");
        }             
        _showHideCounterArrows();


    }

    // turns on/off a click event on the thumb nail arrows to prevent double clicking
    function _toggleThumbnailClick(tgl) {
        
        var $nextArrow = $el.imageGalleryCtrl.thumbnailContainer.nextArrow;
        var $prevArrow = $el.imageGalleryCtrl.thumbnailContainer.prevArrow;

        if (tgl == "on") {
            $nextArrow.on("click.next-page",function() {
                _slideThumbnails("next");
            });
    
            $prevArrow.on("click.prev-page",function() {
                _slideThumbnails("prev");
            });
        } else if (tgl == "off") {
            $nextArrow.off("click.next-page");
            $prevArrow.off("click.prev-page");
        }
        
    }
    
    // calculate the scroll size based on 5 images showing at a time in the 
    // thumbnail list - the 100 is to account for 20px between each.
    // they are all the same width, so just get the first one and calulate 
    // the scroll size based on it.

    function _setScrollSize() {
        var $firstThumbnail = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.single(1);
        // set global var for use when scrolling
        _imageGalleryCtrl.scrollSize = $firstThumbnail.width() * 5 + 100;
    }

    // find the largest image (height) and set the container fixed to this height
    function _setFeatureImageContainerHeight() {

        var $feautureImages = $el.imageGalleryCtrl.featureImageContainer.images.all;
        var $featureImageContainer = $el.imageGalleryCtrl.featureImageContainer.container;

        _imageGalleryCtrl.maxheight = Math.max.apply(Math, $feautureImages.map(function() { 
            return $(this).height(); 
        }));
        
        $featureImageContainer.css("height", _imageGalleryCtrl.maxheight);
    
    }
    

    function _generateThumbnails() {
        thumbnailContainer = _generateThumbNailContainer();
        _generateThumbnailImages(thumbnailContainer);        
        _setThumbnailGrid();    
        _applyThumbnailOffset();
        _setScrollSize(); 
        _updateVisibleThumbnails("");
    }
    
    function _generateThumbnailImages(thumbnailContainer) {
        var $feautureImages = $el.imageGalleryCtrl.featureImageContainer.images.all;
        $feautureImages.each(function(ndx) {
            var _self = $(this);
            var count = ndx+=1; // start counter at 1
            var thumbnail = _self.attr("data-thumb"); // get thumbnail attribute
            _self.attr("data-feature-image",count); // add a counter
            // add a counter (same as on feature image), create the image and append to thumbnail container
            $("<div />")
                    .attr("data-thumbnail", count) 
                    .html($("<img alt='' />").attr("src", thumbnail))
                    .appendTo(thumbnailContainer);
                    
            // update the count - get this from vm file later
            _imageGalleryCtrl.totalImages = count;
        });
    }

    function _setThumbnailGrid() {
        // must be done using vanilla JS as jquery css does not support this type of a style on the fly
        document.getElementById("sfu-image-gallery__thumbnails").style.gridTemplateColumns = "repeat(" + _imageGalleryCtrl.totalImages + ",calc(20% - 15px))";        
    }

    // determine the viewable area for thumbnails
    function _applyThumbnailOffset() {
        $tnContainer = $el.imageGalleryCtrl.thumbnailContainer.container();
        _imageGalleryCtrl.thumbnailOffsetLeft = $tnContainer.offset().left;
        _imageGalleryCtrl.thumbnailOffsetRight = _imageGalleryCtrl.thumbnailOffsetLeft + $tnContainer.width();
    }

    function _generateThumbNailContainer() {
        var thumbsContainer 
                = $("<div>")
                    .addClass("sfu-image-gallery__thumbnails")
                    .attr("id","sfu-image-gallery__thumbnails")
                    .appendTo(".sfu-image-gallery__navigation--thumbs");
        return thumbsContainer;
    }
    
    function _setCaption(img) {
        var caption = $el.imageGalleryCtrl.captions.single(img).clone();
        $el.imageGalleryCtrl.captions.container.html(caption.html());
    }

    function _updateCounter(img) {
        $el.imageGalleryCtrl.counter.currentImage.html(img);        
    }


    function _showFeatureImage(img) {        
        $el.imageGalleryCtrl.featureImageContainer.images.single(img)
            .addClass("active").siblings().removeClass("active");
            _setCaption(img);
            _updateCounter(img);
        $el.imageGalleryCtrl.thumbnailContainer.thumbnails.single(img)
            .addClass("active").siblings().removeClass("active");        
    }

    function _updateVisibleThumbnails(dir) {

        $el.imageGalleryCtrl.thumbnailContainer.thumbnails.all().each(function() {
            var _self = $(this);
            if (_self.offset().left < _imageGalleryCtrl.thumbnailOffsetLeft 
                    || _self.offset().left + _self.innerWidth() < _imageGalleryCtrl.thumbnailOffsetLeft 
                    || _self.offset().left > _imageGalleryCtrl.thumbnailOffsetRight
                )  {
                    _self.removeClass("js-visible-thumb").addClass("js-hidden-thumb");
            } else {
                _self.addClass("js-visible-thumb").removeClass("js-hidden-thumb");
            }                
        });        

        if ($el.imageGalleryCtrl.thumbnailContainer.thumbnails.active().hasClass("js-hidden-thumb")) {
            var visibleThumbs = _getVisibleThumbs();            
            var firstVisible = visibleThumbs[0];
            var lastVisible = visibleThumbs[1];
            if (dir == "prev") {
                _showFeatureImage(lastVisible);
            } else {
                _showFeatureImage(firstVisible);
            }
        }
    }

    function _getVisibleThumbs() {
        var firstVisible = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.visible.first().attr("data-thumbnail");
        var lastVisible = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.visible.last().attr("data-thumbnail");
        return [firstVisible,lastVisible];
    }

    function _slideThumbnails(dir) {
        _toggleElementInteraction("off");        
        var scrollSize;
        if (dir == "next") { // move forward
            scrollSize = _imageGalleryCtrl.scrollSize;
        } else if (dir == "prev") { // move backwards (make scroll amount negative)
            scrollSize = -Math.abs(_imageGalleryCtrl.scrollSize);
        }
        var $tnImageContainer = $el.imageGalleryCtrl.thumbnailContainer.imageContainer();
        $tnImageContainer.animate({ 
            "scrollLeft" : $tnImageContainer.scrollLeft() + scrollSize 
        },1000,"linear",function() {
            _updateVisibleThumbnails(dir);
            _showHideThumbnailArrows();           
            _showHideCounterArrows();
            _toggleElementInteraction("on");
        });

    }

    function _showHideCounterArrows() {
        var $activeThumb = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.active().attr("data-thumbnail");
        var prevArrow = "visible";
        var nextArrow = "visible";
        console.log($activeThumb);
        if ($activeThumb == 1) {
            prevArrow = "hidden";                
        } else if ($activeThumb == _imageGalleryCtrl.totalImages) {
            nextArrow = "hidden";
        }
        $el.imageGalleryCtrl.counter.next.css("visibility",nextArrow);
        $el.imageGalleryCtrl.counter.prev.css("visibility",prevArrow);
    }
    

    function _showHideThumbnailArrows() {
        // hide both arrows if exactly 5 thumbnails
        // by default, next/prev arrows are hidden

        if (_imageGalleryCtrl.totalImages == 5) {
            return;
        }

        var prevArrow = "hidden";
        var nextArrow = "hidden";        
        if ($el.imageGalleryCtrl.thumbnailContainer.thumbnails.last().hasClass("js-hidden-thumb")) {
            nextArrow = "visible";
        }

        if ($el.imageGalleryCtrl.thumbnailContainer.thumbnails.first().hasClass("js-hidden-thumb")) {
            prevArrow = "visible";
        }

        $el.imageGalleryCtrl.thumbnailContainer.nextArrow.css("visibility",nextArrow); 
        $el.imageGalleryCtrl.thumbnailContainer.prevArrow.css("visibility",prevArrow);
    }
    function _setIsSlideShow() {
        if ($el.imageGalleryCtrl.slideshow.container.length > 0) {
            _imageGalleryCtrl.isSlideShow = true;
        }
    }

    function _startSlideShow() {    
        $el.imageGalleryCtrl.slideshow.container.addClass("js-slideshow-started");
        _imageGalleryCtrl.startSlideShow = setInterval(function() { _play(); },5000);
        $el.imageGalleryCtrl.slideshow.playbutton.addClass("active");
        $el.imageGalleryCtrl.slideshow.pausebutton.removeClass("active");

    }

    function _play() {
        var cimg = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.active().attr("data-thumbnail");
        var limg = $el.imageGalleryCtrl.thumbnailContainer.thumbnails.last().attr("data-thumbnail");
        var nimg;
        if (cimg == limg) {
            nimg = 1;
        } else {
            nimg = parseInt(cimg) + 1; 
        }
        _showFeatureImage(nimg);
    }

    function _stop() {
        $el.imageGalleryCtrl.slideshow.container.removeClass("js-slideshow-started");
        $el.imageGalleryCtrl.slideshow.playbutton.removeClass("active");
        $el.imageGalleryCtrl.slideshow.pausebutton.addClass("active");

        clearInterval(_imageGalleryCtrl.startSlideShow);
    }

    

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

    function init() {            
        // convert all thumbnail galleries into slideshows in columns less than 50%
        _convertSmallThumbnailToSlideshow();
        _bindElements();
        _setIsSlideShow();
        _setFeatureImageContainerHeight();
        _generateThumbnails();
        _showFeatureImage(1);
        _bindListeners();
        if (_imageGalleryCtrl.isSlideShow && clfInViewCtrl.isInView50('sfu-image-gallery__feature-images')) {
            _startSlideShow(); 
        } else {
            _showHideThumbnailArrows();
            _showHideCounterArrows();
 
        }
    } // end init()
    
    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */
    return {
        init : init
    }

})(jQuery);
/*
    In View Controller
    Purpose: detect when element gets into view on vertical scroll

*/

var clfInViewCtrl = (function() {
    
    // 50% of image
    function isInView50(el) {
        var rect = document.getElementById(el).getBoundingClientRect();
    
        return (
            rect.top + (rect.height/2) > 0 && // top
            rect.left + (rect.width/2) > 0 && // left
            rect.top + (rect.height/2) < (window.innerHeight || document.documentElement.clientHeight) && // bottom
            rect.left + (rect.width/2) < (window.innerWidth || document.documentElement.clientWidth) // right
        );
    }
    
    
    return {
    
        isInView50 : isInView50
    } 

})();
  
// init all js once jQuery is loaded
var waitForJQuery = function () { 
    if (typeof jQuery != "undefined") {      
        window.clearTimeout(waitInterval);
        initMain();
    } 
    return; 
};

var checkDocReadyState = function () {
    if (document.readyState === "complete") {
        window.clearTimeout(docReadyInterval);
        initDocReadyFunctions();
    } 
    return;
}

var $el = {};
var waitInterval = window.setInterval(waitForJQuery, 1); 
var docReadyInterval = window.setInterval(checkDocReadyState, 1);


// controllers can be initiated as soon as jQuery is ready.
function initMain() {
    $.extend($el, {
        window : $(window),
        document : $(document),
        html : $("html"),
        body : $("body"),
        footer : $("footer")
    });
    clfFontIconCtrl.init();
    clfMenuCtrl.init();
    clfCustomPlugins.init();
    clfScreenCtrl.init();
    clfSearchCtrl.init();
    clfFooterCtrl.init();
    clfToggleCtrl.init();
    clfTextImageCtrl.init();
    clfBackToTopCtrl.init();
    sfuSideMenuCtrl.init();
    clfTextCtrl.init();
    clfAjaxCtrl.init();
}


// specific functions that can only be executed once the full document is ready.
function initDocReadyFunctions() {
    clfMenuCtrl.setMainNavSecondLevelWidths();
    clfPopUpCtrl.init();
    clfExternalFeedCtrl.init();
    // run this a bit later to ensure the side menu is fully loaded
    setTimeout(function() { sfuSideMenuCtrl.initSideBarTransition()},100);
    
}


/*
    SFU Menu Controller
    Purpose: Conrols the main menu functionality
    Dependencies: none
*/

var clfMenuCtrl = (function($) {
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _menuCtrl = {
        thirdLevelNavClosed : false,
        currentScrollPos : 0,
        previousScrollPos : 0,
        navigationPosition : 0,
        ignoreMobileSiteNameTemplate : "sfu-ca"
    };

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            menuCtrl : {   
                header : $("header"),
                mainNavigation : $("nav"),            
                mobileMenuLink : $(".ribbon__content--mobile-nav-icons .icon-menu"),
                mobileNav : $(".mobile-nav__content"),
                mobileSearchLink : $(".ribbon__content--mobile-nav-icons .icon-search"),
                mobileSearch : $(".mobile-search__content"),
                titleCloseLink : $(".close-mobile-nav"),
                searchCloseLink :  $(".close-mobile-search"),
                firstLevelActive : $(".mobile-nav__main-nav > ul > li.active"),
                audienceNav : {
                    desktop : $(".ribbon__content--audience-nav"),
                    mobile : $(".mobile-nav__audience-nav")
                },
                mobileSocialIcons : $(".mobile-nav__content--social-icons"),
                mobileNavTriggers : {
                    levelTwo : $(".mobile-nav__main-nav a.has-sub-nav"),
                    levelThree : $(".mobile-nav__main-nav a.has-third-level")
                },
                thirdLevel : {
                    container : $(".mobile-nav__third-level-container"),
                    name : $(".mobile-nav__third-level-container--nav-name span"),
                    items : $(".mobile-nav__third-level-container--nav-items"),
                    activeListItem : $(".has-third-level+ul li.active")
                },
                siteTitle : {
                    main : $(".header__content--site-title"),
                    mobileNav : $(".mobile-nav__content--site-title"),
                    mobileSearch : $(".mobile-search__content--site-title")
                },
                mainNavLevel2List : $(".nav__content--main-navigation a + ul")
            } 
        }); 
    } // /function _bindElements();


    function  _bindListeners() {

        $el.window.on("scroll",function() {
            _fixedMainNavChecker();
        });

        $el.menuCtrl.mobileMenuLink.on("click", function() {
            var _self = $(this);
            $el.menuCtrl.mobileSearch.removeClass("open");
            if ($el.menuCtrl.thirdLevel.container.hasClass("open")) {
                $el.menuCtrl.thirdLevel.container.addClass("was-open");
            }
            $el.menuCtrl.mobileNav.toggleClass("open").promise().done(function() {
                if (!_menuCtrl.thirdLevelNavClosed && $el.menuCtrl.thirdLevel.activeListItem.length > 0 && $el.menuCtrl.mobileNav.hasClass("open")) {
                    $el.menuCtrl.thirdLevel.activeListItem.parents("ul").prev("a.has-third-level").trigger("click");                    
                }
                if ($el.menuCtrl.thirdLevel.container.hasClass("was-open")) {
                    $el.menuCtrl.thirdLevel.container.addClass("open")
                };
            });
            _self.toggleClass("icon-close");
            _adjustHTMLClass();
        });          

        $el.menuCtrl.titleCloseLink.on("click",function() {
            $el.menuCtrl.mobileMenuLink.removeClass("icon-close");
            $el.menuCtrl.mobileNav.removeClass("open");
            _adjustHTMLClass();
            
        });


        $el.menuCtrl.searchCloseLink.on("click",function() {
            $el.menuCtrl.mobileSearch.removeClass("open");
            _adjustHTMLClass();
            
        });

        $el.menuCtrl.mobileSearchLink.on("click", function() {
            $el.menuCtrl.mobileNav.removeClass("open");
            $el.menuCtrl.mobileMenuLink.removeClass("icon-close");
            $el.menuCtrl.mobileSearch.toggleClass("open");
            _adjustHTMLClass();
        });          

        $el.menuCtrl.mobileNavTriggers.levelTwo.on("click", function() {
            var _self = $(this);
            if (_self.hasClass("open")) {
                _self.removeClass("open").next("ul").slideUp();
            } else {
                $el.menuCtrl.mobileNavTriggers.levelTwo.removeClass("open").next("ul").slideUp("fast").promise().done(function() {
                    _self.addClass("open").next("ul").slideDown();
                });            
            }
            return false;
        });


        $el.menuCtrl.mobileNavTriggers.levelThree.on("click", function() {
            var _self = $(this);
            var navName = _self.html();
            var navItems = _self.next("ul").clone();
            $el.menuCtrl.thirdLevel.items.html("");
            $el.menuCtrl.thirdLevel.name.html(navName);
            navItems.appendTo($el.menuCtrl.thirdLevel.items);
            $el.menuCtrl.thirdLevel.container.addClass("open");
            return false;
        });

        $el.menuCtrl.thirdLevel.name.on("click",function() {
            $el.menuCtrl.thirdLevel.container.removeClass("open");
            $el.menuCtrl.thirdLevel.container.removeClass("was-open");
            _menuCtrl.thirdLevelNavClosed = true;
        });

    } // /function _bindListeners(); 

    function _adjustHTMLClass() {
        if ($el.menuCtrl.mobileNav.hasClass("open") || $el.menuCtrl.mobileSearch.hasClass("open")) {
            $el.html.addClass("menu-open");
            $el.menuCtrl.mobileSocialIcons.addClass('open');
            if (navigator.userAgent.toLowerCase().match('iphone') !== null) {
                var h = window.innerHeight - 100;
                if ($el.menuCtrl.mobileNav.hasClass("open")) {
                    $el.menuCtrl.mobileNav.css("height",h + "px");
                    $el.menuCtrl.mobileSearch.css("height","0");
                } else {
                    $el.menuCtrl.mobileSearch.css("height",h + "px");
                    $el.menuCtrl.mobileNav.css("height","0");
                }
            }
        } else {
            $el.html.removeClass("menu-open");
            $el.menuCtrl.mobileSocialIcons.removeClass('open');
            $el.menuCtrl.thirdLevel.container.removeClass("open");
            if (navigator.userAgent.toLowerCase().match('iphone') !== null) {
                $el.menuCtrl.mobileNav.css("height","0");
            }
        }
    }

    function _fixedMainNavChecker() {
        var hh = $el.menuCtrl.header.height();
        var nh = $el.menuCtrl.mainNavigation.height();
        var th = hh + nh;
        _menuCtrl.previousScrollPos = _menuCtrl.currentScrollPos;
        _menuCtrl.currentScrollPos = $el.window.scrollTop();
        
        if (th < $el.window.scrollTop()) {
            $el.menuCtrl.mainNavigation.addClass("fixable");
        } else {
            $el.menuCtrl.mainNavigation.removeClass("fixable").removeAttr("style");
        }
        
        if (_menuCtrl.currentScrollPos < _menuCtrl.previousScrollPos && $el.menuCtrl.mainNavigation.hasClass("fixable")) {
            $el.menuCtrl.mainNavigation.addClass("fixed");
        } else {
            $el.menuCtrl.mainNavigation.removeClass("fixed");
        }
        
    }

    function _populateMobileAudienceNav() {
        var audience_nav = $el.menuCtrl.audienceNav.desktop.clone();
        $el.menuCtrl.audienceNav.mobile.append(audience_nav.html());
    }

    function _populateSiteTitlesForMobile() {      
        if ($el.html.attr("data-custom-template") && $el.html.attr("data-custom-template").indexOf(_menuCtrl.ignoreMobileSiteNameTemplate) > -1) {        
            return;
        }
        var msn = $el.menuCtrl.siteTitle.main.find(".main-site-name").html();
        $el.menuCtrl.siteTitle.mobileNav.find(".main-site-name").prepend(msn);

    }

    function _checkForFirstLevelActiveLink() {
        if ($el.menuCtrl.firstLevelActive.length > 0) {
            $el.menuCtrl.firstLevelActive.find("a.has-sub-nav").addClass("open");
        }
    }

    function _setFixedNavPositions() {
        _menuCtrl.currentScrollPos = $el.window.scrollTop();
        _menuCtrl.previousScrollPos = $el.window.scrollTop();
        _menuCtrl.navigationPosition = $("header").outerHeight();
        
    }

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
   
    function setMainNavSecondLevelWidths() {
        $el.menuCtrl.mainNavLevel2List.each(function() {
            var _self = $(this);
            _self.css("min-width",_self.parent().innerWidth());            
        });
    }

    function init() {
        _bindElements();
        _bindListeners();
        _populateMobileAudienceNav();
        _populateSiteTitlesForMobile();
        _checkForFirstLevelActiveLink();
        _setFixedNavPositions();
        _fixedMainNavChecker();           
    }  // /init();


    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init,
        setMainNavSecondLevelWidths : setMainNavSecondLevelWidths        
    }

     

})(jQuery);
/*
    SFU PopUp Ctrl
    Purpose: Handles models
    Dependencies: sfuAxaxCtrl
*/

var clfPopUpCtrl = (function($) {

    /*  
        ------------------------------------------------------------    
        Global Variables for sfuMenuCtrl
        ------------------------------------------------------------
        */
        var _popUpCtrl = {};
    
        /*  
        ------------------------------------------------------------    
        Private
        ------------------------------------------------------------
        */
    
    
        function _setGlobalVars() {
        $.extend(_popUpCtrl, {
            currentPopUp : -1, // the current pop up that is open
            isNew : false, // is a new pop up open?
            popUpTriggerLink : null // the link that triggered the pop up
        });             
        } // /function _setGlobalVars()
    
        function _bindElements() {
            $.extend($el, {
                popUpCtrl : {
                    alert : $(".sfu-popup.alert"),
                    popUpTrigger : $(".sfu-popup"),
                    popUpContainer : $("div.popup__container--wrapper"),
                    popUpContentContainer : $("div.popup__container--content"),
                    popUpClose : $(".popup-close-button, .popup__container--mobile-close"),
                    popUpTitle : function() { return $(".popup__container--wrapper h1") },
                    currentTabIndexes : function() { return $("[tabindex]"); },
                    resetTabIndexes : function() { return $("[data-hold-index]"); }
                } 
            }); 
            
            // assign each popup link a unique id via custom attribute
            $el.popUpCtrl.popUpTrigger.each(function(i) {
                var _self = $(this);
                _self.attr("popup-id",i);
            });
    
        } // /function _bindElements();
    
        function  _bindListeners() {        
    
            // on a click of a popup, compare it to the last popup that was opened.
            // if it's the same one, simply re-open the modal, if not then do an ajax
            // call to get the contents, populate the modal containers and open the modal.

            $el.popUpCtrl.popUpTrigger.on("click", function() {
                var _self = $(this);
                _popUpCtrl.popUpTriggerLink = _self;
                if (_self.hasClass("alert")) {
                    $el.popUpCtrl.popUpContainer.addClass("alert");
                } else  {
                    $el.popUpCtrl.popUpContainer.removeClass("alert");
                }

                var popupurl = _self.attr("href");
                var thisPopup = _self.attr("popup-id");
                if (_popUpCtrl.currentPopUp != thisPopup) {
                    _popUpCtrl.currentPopUp = thisPopup; 
                    _popUpCtrl.isNew = true;  
                    $el.popUpCtrl.popUpContentContainer.html("");                                               
                    clfAjaxCtrl.invoke(popupurl,{
                        method : "GET",
                        dataType: "HTML",
                        beforeSend: _activateSpinner,
                        onSuccess: _gotPopUpContent
                    });
                } else {
                    _openModal();
                    _setTabIndexes();
                    _enableModalCloseOptions();    
                    _enableModalTabOptions();      
                    $el.popUpCtrl.popUpTitle().focus();
                }
                return false;
            });
    
            $el.popUpCtrl.popUpClose.on("click",function() {
                _closeModal();
                return false;            
            });
     
            // make sure clicking on the modal container does not force it close
            // due to the click event attached to the document to close it once open
            $el.popUpCtrl.popUpContainer.on("click",function(event) {
                event.stopPropagation();
            });
    
        } // /function _bindListeners();
    
        function _activateSpinner() {
            clfAjaxCtrl.spinner($el.popUpCtrl.popUpContentContainer,"on");
            _openModal();
        } // /function _activateSpinner();
    
        function _gotPopUpContent(data) {
            var popUpHtml = $(data);           
            var popUpContent = popUpHtml.find("section.main").html();           
            $el.popUpCtrl.popUpContentContainer.html(popUpContent).promise().done(function() {
                _setTabIndexes();
                _enableModalCloseOptions();    
                _enableModalTabOptions();      
                $el.popUpCtrl.popUpTitle().focus();
                // run picture fill after popup is loaded to show any images that may be in the popup
                picturefill();
            });  
        } // /function _gotPopUpContent()

        function _openModal(doScroll) {
            $el.html.attr("model-open","true");
            if (_popUpCtrl.isNew) {
                $el.popUpCtrl.popUpContentContainer.scrollTop(0);
                _popUpCtrl.isNew = false;
            }
        } // /function _openModal()
    
        function _closeModal() {
            $el.html.removeAttr("model-open");     
            _resetTabIndexes();
            _resetModalTabOptions();
            _popUpCtrl.popUpTriggerLink.focus();
            return false;
        } // /function _closeModal()
    
        // enables the modal to close on document click or esc key 
        // once the modal is closed, stop listening for the events.
        function _enableModalCloseOptions() {
            $el.document.on("click.modalclose",function() {
                _closeModal();
                $el.document.off("click.modalclose");
            });
    
            $el.document.on("keyup.modalclose",function(e) {
                if (e.keyCode==27) {
                    _closeModal();
                    $el.document.off("keyup.modalclose");
                }
            });
        } // /function _enableModalCloseOptions()
    
        // keeps tab events to within the modal for accessibility
        function _enableModalTabOptions() {
            $el.popUpCtrl.popUpClose.on("keydown.tabClose",function(e) {
                if (e.keyCode == 9) {
                    if (!e.shiftKey) {
                        e.preventDefault();
                        $el.popUpCtrl.popUpTitle().focus();       
                    } 
                }
                if (e.keyCode == 32 || e.keyCode == 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    _closeModal();
                }
            });
            $el.popUpCtrl.popUpTitle().on("keydown.tabTitle",function(e) {
                if (e.keyCode == 9) {
                    if (e.shiftKey) {
                        e.preventDefault();
                        $el.popUpCtrl.popUpClose.focus();                 
                    }
                }          
            });        
        } // /function _enableModalTabOptions()
    
        function _resetModalTabOptions() {
            $el.popUpCtrl.popUpTitle().off("keydown.tabClose");
            $el.popUpCtrl.popUpTitle().off("keydown.tabTitle");
        } // /function _resetModalTabOptions()
    
        function _setTabIndexes() {
            $el.popUpCtrl.currentTabIndexes().each(function() {
                var _self = $(this);
                var ndx = _self.attr("tabindex");
                _self.attr("data-hold-index", ndx);
                _self.removeAttr("tabindex");
            });
            $(".popup__container--content h1").attr("tabindex",1);
            var popUpIndexes = 3;
            $(".popup__container--content a").each(function() {
                $(this).attr("tabindex",popUpIndexes)
                popUpIndexes++;
            });
            $el.popUpCtrl.popUpClose.attr("tabindex",popUpIndexes);
            // once tab indexes are set, wait a ms and focus on the title in the modal
            setTimeout(function() { $(".popup__container--content h1") },1);
        } // /function _setTabIndexes()
    
        function _resetTabIndexes() {
            $el.popUpCtrl.popUpTitle().removeAttr("tabindex");
            $el.popUpCtrl.popUpContentContainer.removeAttr("tabindex");
            $el.popUpCtrl.popUpClose.removeAttr("tabindex");
            $(".popup__container a").removeAttr("tabindex");
            $el.popUpCtrl.resetTabIndexes().each(function() {
                var _self = $(this);
                var ndx = _self.attr("data-hold-index");
                _self.attr("tabindex", ndx);
                _self.removeAttr("data-hold-index");
            });        
        } // /function _resetTabIndexes)()

        function _checkForAlert() {
            if ($el.popUpCtrl.alert.length > 0) {                
                $el.popUpCtrl.alert.trigger("click");
            }
        }
    
        /* 
        ------------------------------------------------------------    
        Public
        ------------------------------------------------------------
        */
    
        function init() {
            _bindElements();
            _setGlobalVars();
            _bindListeners();
            _checkForAlert();
        }  // /init();
    
        /*   
        ------------------------------------------------------------    
        Expose
        ------------------------------------------------------------
        */
    
        return {
            init : init        
        } 
       
    })(jQuery);
/*
    SFU SCREEN Controller
    Purpose: Handles scroll behaviours, returns current screen size
    Dependencies: none
*/

var clfScreenCtrl = (function($) {
   
    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */
 
    function _bindElements() {
         $.extend($el, {
             screenCtrl : {
                 header : $("header"),
                 footer : $("footer"),
                 main : $("main"),
             } 
         }); 
        
    } // /_bindElements();

    function  _bindListeners() {     

    } // /_bindListeners()
        
    function _getScreenSize() {
        return window.getComputedStyle(
	        document.querySelector('body'), ':after'
        ).getPropertyValue('content').replace(/\"/g,"");
    } // /_getScreenSize()


    function _setConsoleMsg() {        
        console.log("Simon Fraser University\n8888 University Drive\nBurnaby, B.C. Canada V5A 1S6\nhttp://www.sfu.ca");
    } // /_setConsoleMsg()

    function _matchMedia(mediaQuery) {
        return window.matchMedia(mediaQuery).matches;
    } // /_matchMedia()

    function _setMac() {
        if(navigator.platform.toLowerCase().match('mac') !== null) {
            $el.html.addClass("mac-os");
        }
    }

    function _setFF() {
        if(navigator.userAgent.toLowerCase().match('firefox') !== null) {
            $el.html.addClass("ff-browser");
        }
    }

    function _setiPhoneSafari() {
        if(navigator.userAgent.toLowerCase().match('iphone') !== null) {
            $el.html.addClass("iphone");
        }
    }

    function _setIE11() {
        if (!!window.MSInputMethodContext && !!document.documentMode) {
            $el.html.addClass("ie11-browser");
        }
    }
    
    function _setPlatformBrowsers() {
        _setMac();
        _setFF();
        _setIE11();
       // _setiPhoneSafari();
    }

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
    
    function getSize() {
        return _getScreenSize();
    } // /getSize()

    function isSmall() {
        return (_getScreenSize() == "sm-screen");
    } // /isSmall()

    function isMedium() {
        return (_getScreenSize() == "md-screen");
    } // /isMedium()


    function isMediumDown() {
        return (_getScreenSize() == "md-screen" || _getScreenSize() == "sm-screen");
    } // /isMedium()

    function isSmallerMedium() {
        return (_getScreenSize() == "md-screen" && _matchMedia('(max-width: 755px)'));
    } // /isSmallerMedium()

    function isLarge() {
        return (_getScreenSize() == "lg-screen");
    } // /isLarge()
    
    function isSmallerLarge() {
        return (_getScreenSize() == "lg-screen" && _matchMedia('(max-width: 1150px)'));
    } // /isSmallerLarge()

    function isLargeUp() {
        return (_getScreenSize() == "lg-screen" || _getScreenSize() == "xl-screen" || _getScreenSize() == "xxl-screen");
    } // /isLarge()
    
    function isXLarge() {
        return (_getScreenSize() == "xl-screen");
    } // /isXLarge();

    function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;
        
        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top >= window.pageYOffset &&
            left >= window.pageXOffset &&
            (top + height) <= (window.pageYOffset + window.innerHeight) &&
            (left + width) <= (window.pageXOffset + window.innerWidth)
        );
    } // /end function elementInViewport()


    function init() {
        _bindElements();
        _bindListeners();
        _setPlatformBrowsers();
        _setConsoleMsg();
    } // /end function init()

    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */
    return {
        getSize : getSize,
        isSmall : isSmall,
        isMedium : isMedium,
        isMediumDown : isMediumDown,
        isLarge : isLarge,
        isLargeUp : isLargeUp,
        isXLarge : isXLarge,
        isSmallerLarge : isSmallerLarge,
        isSmallerMedium : isSmallerMedium,
        isInView : elementInViewport,
        init : init
    } 

})(jQuery);
/*
    SFU Search Box Controller
    Purpose: Handles the behaviour of the search box
    Dependencies: none
*/

var clfSearchCtrl = (function($) {
   
    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */
 
    function _bindElements() {
         $.extend($el, {
             searchCtrl : {
                searchBoxIcon : $("#search-box-container .icon-search, #mobile-search-box-container .icon-search"),

                desktop : {
                    searchForm : $("#search-form"),
                    searchBox : $("#search-box"),
                    searchScope : {
                        thisSite: $("#this-site"),
                        sfuCa : $("#sfu-ca"),
                        hiddenInput : $("input[name='p']")
                    }
                 },
                 mobile : {
                    searchBox : $("#mobile-search-box"),
                    searchScope : {
                        thisSite: $("#mobile-this-site"),
                        sfuCa : $("#mobile-sfu-ca")
                    }

                 }
             } 
         }); 
        
    } // /_bindElements();

    function  _bindListeners() {     
        $el.searchCtrl.desktop.searchBox.on("focus",function() {
            $el.searchCtrl.searchBoxIcon.addClass("in-focus");
        });
        $el.searchCtrl.mobile.searchBox.on("focus",function() {
            $el.searchCtrl.searchBoxIcon.addClass("in-focus");
        });
        $el.searchCtrl.desktop.searchBox.on("blur",function() {
            var _self = $(this);
            $el.searchCtrl.searchBoxIcon.removeClass("in-focus");   
            _checkForContent();        
        });
        $el.searchCtrl.mobile.searchBox.on("blur",function() {
            var _self = $(this);
            $el.searchCtrl.searchBoxIcon.removeClass("in-focus");   
            _checkForContent();        
        });

        $el.searchCtrl.searchBoxIcon.on("click",function() {
            $el.searchCtrl.desktop.searchForm.submit();
        });

        $el.searchCtrl.desktop.searchScope.thisSite.on("click",function() {
            var _self = $(this);
            $el.searchCtrl.mobile.searchScope.thisSite.prop("checked", true);
            _setHiddenInput(_self);         
        });

        $el.searchCtrl.desktop.searchScope.sfuCa.on("click",function() {
            var _self = $(this);
            $el.searchCtrl.mobile.searchScope.sfuCa.prop("checked", true);
            _setHiddenInput(_self);                        
        });

        $el.searchCtrl.mobile.searchScope.thisSite.on("click",function() {
            var _self = $(this);
            $el.searchCtrl.desktop.searchScope.thisSite.prop("checked", true);
            _setHiddenInput(_self);                        
        });

        $el.searchCtrl.mobile.searchScope.sfuCa.on("click",function() {
            var _self = $(this);
            $el.searchCtrl.desktop.searchScope.sfuCa.prop("checked", true);
            _setHiddenInput(_self);            
        });
/*
        $el.searchCtrl.desktop.searchBox.on("keyup",function() {
            var _self = $(this);
            $el.searchCtrl.mobile.searchBox.val(_self.val());
        });

        $el.searchCtrl.mobile.searchBox.on("keyup",function() {
            var _self = $(this);
            $el.searchCtrl.desktop.searchBox.val(_self.val());
            _checkForContent();
        });
*/
        

    } // /_bindListeners()
    
    function _setHiddenInput(obj) {
        var searchScope = obj.val();
        if (searchScope == "site") {
            var thisSite = $el.searchCtrl.desktop.searchScope.hiddenInput.attr("data-value");
            $el.searchCtrl.desktop.searchScope.hiddenInput.val(thisSite);
        } else {
            $el.searchCtrl.desktop.searchScope.hiddenInput.val("");
        }
        
    }

    function _checkForContent() {
        if ($el.searchCtrl.desktop.searchBox.val().length > 0) {
            $el.searchCtrl.searchBoxIcon.addClass("has-content");
            $el.searchCtrl.searchBoxIcon.addClass("has-content");
        } else {
            $el.searchCtrl.searchBoxIcon.removeClass("has-content");
            $el.searchCtrl.searchBoxIcon.removeClass("has-content");

        }
    }

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

        function submitSearchForm() {
            $el.searchCtrl.desktop.searchForm.submit();
        }
    
      function init() {
       _bindElements();
       _bindListeners();     
      } // /end function init()

    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */
    return {
        init : init,
        searchSubmit : submitSearchForm
    } 

})(jQuery);
/*
    SFU MENU Controller
    Purpose: Handles side navigation plus mobile navigation drop downs
    Dependencies: sfuScreenCtrl, sfuGlobalCtrl
*/

var _sideMenuCtrl = {};

var sfuSideMenuCtrl = (function($) { 
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfusideMenuCtrl
    ------------------------------------------------------------
    */
  

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {

        $.extend($el, {
            sideMenuCtrl : {
                sideBarContainer : $(".page-content__side-nav"), 
                sideBar : $(".page-content__side-nav--container"),
                sideBarContent : $(".page-content__side-nav--container"),
                sideBarLogo : $("#side-bar-logo"),
                sideBarLogoContainer : $("#side-bar-logo-container"),                
                contentContainer : $(".page-content__main"),
                activeLinks : $(".page-content.side-nav li.active")
            } 
        }); 
        
    } // /function _bindElements();

    function _setGlobalVars() {
        if ($el.sideMenuCtrl.sideBarLogoContainer.height >= 0) {          
            $.extend(_sideMenuCtrl, {
                sideBarHeight : $el.sideMenuCtrl.sideBar.outerHeight()
            });             
        } else {
            $.extend(_sideMenuCtrl, {
                sideBarHeight : $el.sideMenuCtrl.sideBar.outerHeight() + $el.sideMenuCtrl.sideBarLogoContainer.outerHeight()
            }); 
        }
        $.extend(_sideMenuCtrl, {
            contentContainerHeight : $el.sideMenuCtrl.contentContainer.outerHeight()
        })
    } // /function _setGlobalVars()

    function  _bindListeners() {

        $el.window.on("scroll.sidebar",function() {      
            _setSideBarFixable();
        });
        
        $el.window.on("resize.scrollbar",function() {      
            _setSideBarWidth();
        });
        
        
    } // /function _bindListeners();


    function _setSideBarFixable() {                

        if (
            $el.sideMenuCtrl.sideBarContainer.length < 1 
            || _sideMenuCtrl.contentContainerHeight < _sideMenuCtrl.sideBarHeight 
            || _sideMenuCtrl.sideBarHeight  >= window.innerHeight

        ) {
            $el.sideMenuCtrl.sideBar.unfixit().css("width","auto");
            $el.sideMenuCtrl.sideBarLogoContainer.css("height","0");
            return;
        }
        
        if ($("nav").hasClass("fixable")) {
            
            $el.sideMenuCtrl.sideBarLogoContainer.css("height", $el.sideMenuCtrl.sideBarLogo.height() + "px");
            $el.sideMenuCtrl.sideBar.fixit();
            _setSideBarWidth();
        } else {
            $el.sideMenuCtrl.sideBar.unfixit().css("width","auto");
            $el.sideMenuCtrl.sideBarLogoContainer.css("height","0");
        }

        var footerDiff = $el.footer.offset().top - $el.window.scrollTop() - $el.sideMenuCtrl.sideBar.outerHeight() - 50;
        
        if (footerDiff <= 0) { 
            $el.sideMenuCtrl.sideBar.css("top", parseInt(footerDiff) + "px");
        } else {
            $el.sideMenuCtrl.sideBar.css("top","");
        }

        return;        

    } // /function _setSideBarFixable();

    function _setSideBarWidth() {
        $el.sideMenuCtrl.sideBar.css("width",$el.sideMenuCtrl.sideBarContainer.width() - 5);
        $el.sideMenuCtrl.sideBarLogo.css("width",$el.sideMenuCtrl.sideBarContainer.width() - 5);
    } // /function _setSideBarWidth();

    function _setSideNavMainLinkArrow() {
        var numActiveLinks = $el.sideMenuCtrl.activeLinks.length;
        if (numActiveLinks > 1) {
            $el.sideMenuCtrl.activeLinks.first().find("a").addClass("show");
        }

    }




   /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */


    function initSideBarTransition() {
        $el.sideMenuCtrl.sideBarLogoContainer.addClass("transition");
    }

    function init() {
        _bindElements();
        _bindListeners();
        _setGlobalVars();
        _setSideBarFixable();
        _setSideNavMainLinkArrow();
        
    }  // /init();

    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init,
        initSideBarTransition : initSideBarTransition
    } 

})(jQuery);
/*
    SFU Text Controller
    Purpose: Conrols js functionality for text blocks
    Dependencies: none
*/

var clfTextCtrl = (function($) {
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _textCtrl = {
        // mt
    };

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            textCtrl : {               
                buttons : $(".button, .button-full"),
                fireFoxQuotes : $("html.ff-browser div.quote p")
            } 
        }); 
    } // /function _bindElements();


    function  _bindListeners() {
        // no listeners
    } // /function _bindListeners(); 

    function _wrapFFQuotes() {
        $el.textCtrl.fireFoxQuotes.each(function() {
            var _self = $(this);
            _self.wrap("<div class='js-quote-wrapper'>");
        });
    }

    function _setSingleButtonTextComponents() {
        $el.textCtrl.buttons.each(function() {
            var _self = $(this);
            if (_self.find("a").length == 1) {
                _self.addClass("js-single-button");
            }
        });
    }
    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
   
    function init() {
        _bindElements();
        _bindListeners();
        _setSingleButtonTextComponents();
        _wrapFFQuotes();
    }  // /init();


    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init
    } 

})(jQuery);
/*
    SFU Text Image Controller
    Purpose: Conrols js functionality for text image
    Dependencies: none
*/

var clfTextImageCtrl = (function($) {
    
    /*  
    ------------------------------------------------------------    
    Global Variables for sfuMenuCtrl
    ------------------------------------------------------------
    */
    var _textImageCtrl = {
        // mt
    };

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            textImageCtrl : {               
                overlays : $("div.textimage > div.overlay, div.textimage > div.overlay-bottom, div.textimage > div.overlay-full, div.textimage > div.overlay-banner"),
                overlayBannerHeading : $("div.textimage > div.overlay-banner div.text h1, div.textimage > div.overlay-banner div.text h2, div.textimage > div.overlay-banner div.text h3, div.textimage > div.overlay-banner div.text h4, div.textimage > div.overlay-banner div.text h5"),
                overlayBottom : $(".overlay-bottom"),
                textImageHeading1 : $("div.textimage > div:not([class*=overlay]) > div.text h1, div.textimage > div:not([class*=overlay]) > div.floatRight div.text h1"),                    
                textImageHeading2 : $("div.textimage > div:not([class*=overlay]) > div.text h2, div.textimage > div:not([class*=overlay]) > div.floatRight div.text h2"),                    
                textImageHeading3 : $("div.textimage > div:not([class*=overlay]) > div.text h3, div.textimage > div:not([class*=overlay]) > div.floatRight div.text h3"),                    
                textImageHeading4 : $("div.textimage > div:not([class*=overlay]) > div.text h4, div.textimage > div:not([class*=overlay]) > div.floatRight div.text h4"),                    
                textImageHeading5 : $("div.textimage > div:not([class*=overlay]) > div.text h5, div.textimage > div:not([class*=overlay]) > div.floatRight div.text h5")                    
            }                
        }); 
    } // /function _bindElements();


    function  _bindListeners() {
    } // /function _bindListeners(); 



    function _doWrap(obj,heading) {
        if (obj.find("a").length == 1) {
            obj.wrap("<div class='js-textimage-heading-container " + heading + " linked'>");
        } else {
            obj.wrap("<div class='js-textimage-heading-container " + heading + "'>");
        }
        if (heading == "h1" && obj.find("a").length == 1) {
            var link = obj.find('a').wrapInner("<" + heading + ">");
            $(link).insertAfter(obj);
            obj.remove();
        }

    }

    function _wrapHeadings() {        
        $el.textImageCtrl.textImageHeading1.each(function() {
            var _self = $(this);    
            _doWrap(_self,"h1");
        });
        $el.textImageCtrl.textImageHeading2.each(function() {
            var _self = $(this);    
            _doWrap(_self,"h2");
        });
        $el.textImageCtrl.textImageHeading3.each(function() {
            var _self = $(this);    
            _doWrap(_self,"h3");
        });
        $el.textImageCtrl.textImageHeading4.each(function() {
            var _self = $(this);    
            _doWrap(_self,"h4");
        });
        $el.textImageCtrl.textImageHeading5.each(function() {
            var _self = $(this);    
            _doWrap(_self,"h5");
        });        
    }

    function _wrapLinks() {
        $el.textImageCtrl.overlays.each(function() { 
            var _self = $(this); 
            var url = _self.find("a").attr("href"); 
            if (url != undefined) {
                _self.parent().wrap("<a class=\"js-overlay-wrapper-link\" href=\"" + url + "\"></a>"); 
            }
        }); 
    }

    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */
   
    function init() {
        _bindElements();
        _bindListeners();
        _wrapLinks();       
        _wrapHeadings();
    }  // /init();


    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */

    return {
        init : init        
    } 

})(jQuery);
/*
    SFU TOGGLE CTRL
    Purpose: handles the toggle of elements
    Dependencies: none
*/

var clfToggleCtrl = (function($) {

    /*  
    ------------------------------------------------------------    
    Private
    ------------------------------------------------------------
    */

    function _bindElements() {
        $.extend($el, {
            toggleCtrl : {
                toggleTrigger : {
                    selector : ".toggle",
                    jsLink : ".js-toggle-link"
                },
                toggleContent : {
                    selector : ".toggleContent",
                    trigger : function(x) { return $($el.toggleCtrl.toggleContent.selector + "." + x); }
                }
                
            } 
        }); 
    } // /function _bindElements();

    function  _bindListeners() {
        // grandfathered in, don't know exactly why this is needed
        $el.document.on("click", $el.toggleCtrl.toggleContent.selector, function(e) {
            e.stopPropagation();
        });  



        // attach click event to triggers
        $el.document.on("click", $el.toggleCtrl.toggleTrigger.selector, function() {
            var trigger = $(this),
            classes = this.className,
            targetclass = classes.match(/item\d+/)[0],
            content = $el.toggleCtrl.toggleContent.trigger(targetclass);                
            content.slideToggle();
            trigger.toggleClass("open").promise().done(function() {
                var ptext = trigger.find("p").html();                
                if (trigger.hasClass("open")) {
                    trigger.find(".js-toggle-link").attr("aria-label", ptext + " - click to close toggled content");
                } else {
                    trigger.find(".js-toggle-link").attr("aria-label", ptext + " - click to open toggled content");
                }
            });
        }); 
        return null;
    } // /function _bindListeners(); 

    function _wrapToggleTriggers() {
        $($el.toggleCtrl.toggleTrigger.selector).each(function() {
            var _self = $(this);
            var ariaLabel;
            if (_self.hasClass("open")) {
                ariaLabel = _self.find("p").html() + " - click to close toggled content";
            } else {
                ariaLabel = _self.find("p").html() + " - click to open toggled content"
            }
            _self.wrapInner("<a href=\"#\" class=\"js-toggle-link\" aria-label=\"" + ariaLabel + "\"></a>");            
        }).promise().done(function() {
            _setJsToggleLinks();
        });    
    }

    function _setJsToggleLinks() {
        $($el.toggleCtrl.toggleContent.jsLink).click(function() {
            return false;
        });
    }

    function _moveToHashAnchor() {
        function between(x, min, max) {
            return x >= min && x <= max;
        }

        if(window.location.hash == "") {
            return;
        }

        if(window.location.hash.charAt(1) == '!') {
            return;
        }
        
        var anchorSelector = window.location.hash + ", [name='" + window.location.hash.substring(1) + "']";
        var $anchor = $(anchorSelector).first();

        if($anchor.length == 0) {
            return;
        }

        var anchorTop = $anchor.offset().top;
        var scrollTop = $(window).scrollTop();

        if(!between(anchorTop, scrollTop-5, scrollTop+5)) {
            $(window).scrollTop(anchorTop);
        }
    } // end _moveToHashAnchor()


    /* 
    ------------------------------------------------------------    
    Public
    ------------------------------------------------------------
    */

    function init() {            
        _bindElements(); 
        _bindListeners();       
        //_wrapToggleTriggers();
        if(navigator.appCodeName.toLowerCase() == "mozilla") {
            _moveToHashAnchor();
        }        
    } // end init()
    
    /* 
    ------------------------------------------------------------    
    Expose
    ------------------------------------------------------------
    */
    return {
        init : init
    }

})(jQuery);
