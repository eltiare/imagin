# Imagin' jQuery Plugin #

This is a plugin to assist in resizing images and loading files that are
appropriate to the size of the image. Sometimes you want to load one image and
as the image is resized to replace it with an image that is of higher quality so
that initial load times are not affected as much and users of your site can
still be treated to high quality images.

## Imagin' requirements ##

I have yet to fully test Imagin', but it seems to be working on jQuery 1.5.2 on
the latest version of Chrome on OS X as of this writing (10.0.648.204). I'll be
completing the tests here in a few days.

This plugin requires the ba-resize plugin which is included in this repository.

## Using Imagin' ##

You pass the container to jQuery and then call the `imagin` function. Any argument
not marked optional or that have a default are required.

    <div id="image_container">Loading your image...</div>
    <script type="text/javascript">
        $("#image_container).imagin({
            verticalAlign : 'top|middle|bottom',   // Alignment of image in container, defaults to top
            horizontalAlign: 'left|center|right',  // Alignment of image in container, defaults to left
            defaultSize: 'medium',
            sizes : {                              // Max sizes for each label
                largest : [2000,2000],
                large   : [1000,1000],
                medium  : [500,500],
                small   : [200,200]
            },   
            images : {
               largest : 'images/guitar.jpg',
               large   : 'images/guitar-1000.jpg',
               medium  : 'images/guitar-500.jpg',
               small   : 'images/guitar-200.jpg'
            },
            imageAspect : [2000,1333],              // Optional
            loadingImage : '/path/to/image.jpg',    // Optional: use either this one
            loadingText  : 'Loading...'             // *or* this one.
        });
    </script>
    
The loaded images are kept in aspect ratio. The `verticalAlign` and `horizontalAlign`
attributes control where the image is positioned in the container. `defaultSize`
is what is loaded first, and the sizes and images options must coincide with each other.
The imageAspect is for convenience and speed of execution - if you already know
the image dimensions you can put them in here. The `loadingImage` and `loadingText`
options are for when loading a new image. The `loadingImage` option overides `loadingText`.
`loadingText` will create a block with a class of `imagin_textbox` and you can
style that however you wish. The loading image (if present) will be visible and
vertically+horizontally centered in the container.

To load another image, call the function with the `load` argument.
    
    $('#image_container').imagin('load', {
        images : {
            largest : 'images/charge.jpg',
            large   : 'images/charge-1000.jpg',
            medium  : 'images/charge-500.jpg',
            small   : 'images/charge-200.jpg'
        },
        imageAspect : [2000,1333]                   // Optional
    });
    
The two options in use are identical to the ones in the initializer function. If
you want the imageAspect to stay in effect you have to pass it every time you
load a new image. Otherwise the script will attempt to get the dimensions from
the image itself.

The images included in the repo are for testing purposes only. If you wish to
use them in your own projects, please contact the author for permission. The
JavaScript code is licensed under the MIT license, details in the file.

If you need any help you can file a bug at https://github.com/eltiare/imagin/issues
or find me on Twitter: @eltiare