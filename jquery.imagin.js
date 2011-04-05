/**
 * Imagin' jQuery plugin
 * http://github.com/eltiare/imagin
 *
 * Copyright (c) 2011 Jeremy Nicoll
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/** Arguments for Imagin'
 *  Init:
 *    $('#img_container').imagin({
 *      verticalAlign : 'top|middle|bottom',   // Alignment of image in container, optional
 *      horizontalAlign: 'left|center|right',  // Alignment of image in container, optional
 *      defaultSize: 'large',
 *      sizes : {                              // Max sizes for each label
 *         largest : [2000,2000],
 *         large   : [1000,1000],
 *         medium  : [500,500],
 *         small   : [200,200]
 *      },
 *      images : {
 *         largest : 'images/guitar.jpg',
 *         large   : 'images/guitar-1000.jpg',
 *         medium  : 'images/guitar-500.jpg',
 *         small   : 'images/guitar-200.jpg'
 *      },
 *      imageAspect : [2000,1333],  // Optional
 *      loadingImage : 'path/to/image.gif',  // optional
 *      loadingText  : 'Loading...'          // optional
 *    });
 *    
 *  Load new image:
 *    $('img_container').imagin(
 *      'load',
 *      {
 *         images : {
 *           largest : 'images/charge.jpg',
 *           large   : 'images/charge-1000.jpg',
 *           medium  : 'images/charge-500.jpg',
 *           small   : 'images/charge-200.jpg'
 *         },
 *         imageAspect : [2000,1333]  // Optional
 *      }
 *    );
 *
 **/

(function($) {
    

    var defaults = {
        verticalAlign    : 'top',
        horizontalAlign  : 'left',
        imageAspect      : null,
        sizes            : [],
        images           : null,
        allowLarger      : false,
        loadingImage     : null
    };
    
    
    $.fn.imagin = function( method ) {
        if(methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method `'+ method +'` does not exist on jQuery.imagin');
        }
        return this;
    };
    
    var imageCache = {};
    
    var privateMethods = {
        
        getImageCache : function(src) {
            if (!imageCache[src]) {
                imageCache[src] = new Image();
                imageCache[src].src = src;
            }
            return imageCache[src];
        },
        
        loadImage : function($img, src) {
            if ($img.attr('src') == src) {
                //do nothing
            } else if (privateMethods.getImageCache(src).complete) {
                $img.attr('src', src);
                $img.trigger('loaded.imagin');
            } else {
                setTimeout(function() { privateMethods.loadImage($img,src); }, 300);
            }
        },
        
        getImageDims : function(src) {
            
            var imgC = privateMethods.getImageCache(src);
                
            if (!imgC.complete) { return false; }
            
            width = imgC.width;
            height = imgC.height;
            return [width,height];
        }
    };
    
    var bindMethods = {
        
        finishNewImage : function() {
            var $this = $(this);
            var $p = $this.parent();
            var data = $p.data('imagin');
            var dims = privateMethods.getImageDims($this.attr('src'));
            data.options.imageAspect = dims;
            if (data.loader) { data.loader.hide(); }
            $p.trigger('resize.imagin');
        },
        
        resize : function() {
            
            var $this = $(this);
            var data = $this.data('imagin');
            var $img = $this.children('img.imagin_img');
            
            // Compute the new size of the image
            var maxWidth = $this.width();
            var maxHeight = $this.height();
            var width, height, xScale, yScale, scale, dims, src, key, sizes,
                newHeight, newWidth;
            
            if (data.options.imageAspect) {
                width = data.options.imageAspect[0];
                height = data.options.imageAspect[1];
            } else {
                // Try to get the width & height of the image
                src = $img.attr('src');
                if (src) { dims = privateMethods.getImageDims(src); }
                if ( !(src && dims) ) {
                    setTimeout(function() { $this.trigger('resize.imagin'); }, 50);
                    return true;
                }
                data.options.imageAspect = dims;
                width = dims[0];
                height = dims[1];
            }
            
            xScale = maxWidth / width;
            yScale = maxHeight / height;
            
            scale = xScale < yScale ? xScale : yScale;
            
            newHeight = height * scale;
            newWidth  = width * scale;
            
            // Get new size for the image
            var sizes = data.options.sizes, key, currentDims = [10000000,10000000], w,h, newLabel;
            
            for (key in sizes) {
                w = sizes[key][0]; h = sizes[key][1];
                if (w >= newWidth && h >= newHeight && w < currentDims[0] && h < currentDims[1]) {
                    currentDims = [w,h];
                    newLabel = key;
                }
            }
            
            data.currentLabel = newLabel;
            privateMethods.loadImage($img, data.options.images[newLabel]);
            $img.attr({
                height : newHeight,
                width  : newWidth
            });
            
            // Compute the position
            var opts = { position : 'absolute', zIndex : '15' };
            
            switch ((data.options.verticalAlign || '').toLowerCase()) {
                case 'bottom': opts.bottom = $this.css('padding-bottom'); break;
                case 'middle': opts.top = (($this.innerHeight() - newHeight) / 2) + 'px'; break;
                default: case 'top':    opts.top = $this.css('padding-top'); break;
            }
            
            switch((data.options.horizontalAlign || '').toLowerCase()) {
                case 'right': opts.right = $this.css('padding-right'); break;
                case 'center': opts.left = (($this.innerWidth() - newWidth) / 2) + 'px'; break;
                default: case 'left': opts.left = $this.css('padding-left'); break;
            }
            
            $img.css(opts);
            
            return true;
        }
    }
    
    var methods = {
        
        init : function(options) {
            var img;
            options = $.extend(defaults, options || {});
            
            this.each(function(i,t) {
                var $this = $(this);
                var $img, $loader;
                
                if ($this.css('position') == 'static') { $this.css('position', 'relative'); }
                
                if (options.loadingImage) {
                    $loader = $('<img/>', {
                        src : options.loadingImage
                    });
                } else if (options.loadingText) {
                    $loader = $('<div/>', {
                        text : options.loadingText,
                        className : 'imagin_textbox'
                    });
                }
                
                $loader.css({ position : 'absolute', zIndex: 1000 });
                
                $this.data('imagin', {
                   target : $this,
                   loader : $loader,
                   options : options
                });
                
                $img = $('<img/>', { className : 'imagin_img' });
                $img.css({'-ms-interpolation-mode': 'bicubic'});
                $img.bind( 'loaded.imagin', bindMethods.finishNewImage );
                $this.html('');
                $this.append($img);
                privateMethods.loadImage($img, options.images[options.defaultSize]);
            });
            
            this.bind('resize.imagin', bindMethods.resize).trigger('resize.imagin');
            
            return this;
        },
        
        load : function(options) {
            this.each(function(i,obj) {
                var $this = $(obj);
                var data = $this.data('imagin');
                var $img = $this.children('img');
                data.options = $.extend(data.options, options);
                if (data.loader) {
                    $this.append(data.loader);
                    data.loader.css({
                        left : ($this.innerWidth() - data.loader.outerWidth()) / 2 + 'px',
                        top  : ($this.innerHeight() - data.loader.outerHeight()) / 2 + 'px'
                    }).show();
                }
                privateMethods.loadImage($img, options.images[options.size] || options.images[data.currentLabel]);
            });
            return this;
        }
        
    };
    
})(jQuery);