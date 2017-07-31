$(document).ready(function () {
    $(document).foundation();
    var loader = $('body').loadingIndicator({
                    useImage: false,
                }).data("loadingIndicator");
    MathJax.Hub.Register.StartupHook("End",function () {
        loader.hide();

        var plot = "#plot";
        var $eqInput = $(plot).parent().find(".eq");

        //Draw function-plot
    	slider.draw(plot, $eqInput);

        //TODO: CREATE MAPPING OBJECT
        //#sliderhandle1 (create class)
        //#sliderhandle2 (create class)
        //#sliderhandle3 (create class)
        //#eq (create class)
        //number of sliders
        /*
        var graph = {
            "num-of-sliders" : slider-num,
            "start-num" : start-num,
            "end-num" : end-num,
            "increment" : increment,
            "eq" : equation
        };
        */

        /*
        slider.currentCoefficients = {
          "x2": "1",
          "x": "1",
          "c": "1"
        };
        */

        //Assign co-efficients
        slider.currentCoefficients = {
          "x2": "1",
          "x" : "1",
          "c" : "1"
        };

    	// Attach Event listeners
        $('.slider1').on('moved.zf.slider', slider.slider1(plot,$eqInput));
        $('.slider2').on('moved.zf.slider', slider.slider2);
        $('.slider3').on('moved.zf.slider', slider.slider3);

    });
});

var slider = {

    currentCoefficients: {},

    //plot: is the element id of the graph to draw
    draw: function(plot, eq) {
        try {
            functionPlot({
                target: plot,
                grid: true,
                xAxis: {
                    label: 'X-AXIS'
                },
                xLine: true,
                tip: {
                    xLine: true,    // dashed line parallel to y = 0
                    yLine: true,    // dashed line parallel to x = 0
                    renderer: function (x, y, index) {
                        // the returning value will be shown in the tip
                    }
                },
                data: [{
                    fn: eq.val(),
                    sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
                    graphType: 'polyline'
                }]
            });
        }
        catch (err) {
            console.log(err);
            alert(err);
        }
    },

    slider1: function(plot, $eq) {
        return function (event) {
            console.log(event.target);
            var valueOfSlider1 = $(event.target).children('.slider-handle1').attr('aria-valuenow');
            console.log('valueOfSlider1 = ' + valueOfSlider1);

            slider.currentCoefficients.x2 = valueOfSlider1;

            var eqVar = $eq.val();
            console.log('the value of #eq is: ' + eqVar);
            console.log('The value of currentCoefficients is: ', slider.currentCoefficients);

            var newEquation = slider.currentCoefficients.x2 + 'x^2 + ' + slider.currentCoefficients.x + 'x + ' + slider.currentCoefficients.c;
            console.log('newEquation is: ' + newEquation);

            $eq.text(newEquation).attr(newEquation);

            if (valueOfSlider1 > 1){
                $eq.val();
            } else {
                newEquation = 'x^2 + ' + slider.currentCoefficients.x + 'x + ' + slider.currentCoefficients.c;
            }

            var valueOfEq = $eq.val();
            console.log(valueOfEq);

            setTimeout(function(){
                $eq.val(newEquation);
                slider.draw(plot, $eq);
            }, 1);
        }
    },

    slider2: function() {
        return function (event) {
            var valueOfSlider2 = $(this).children('#slider-handle2').attr('aria-valuenow');
            console.log('valueOfSlider2 = ' + valueOfSlider2);

            var newEquation2 = 'x^2 + ' + valueOfSlider2 + 'x + 1';

            currentCoefficients.x = valueOfSlider2;

            var eqVar2 = $('#eq').val();
            console.log('the value of #eq is: ' + eqVar2);
            console.log('The value of currentCoefficients is: ' + currentCoefficients);

            var newEquation2 = currentCoefficients.x2 + 'x^2 + ' + currentCoefficients.x + 'x + ' + currentCoefficients.c;
            console.log('newEquation is: ' + newEquation2);

            $('#eq').text(newEquation2).attr(newEquation2);

            if (valueOfSlider2 > 1){
                $('#eq').val();
            } else {
                newEquation2 = currentCoefficients.x2 + 'x^2 + ' + 'x + ' + currentCoefficients.c;
            }

            setTimeout(function(){
                $('#eq').val(newEquation2);
                draw();
            }, 1);
        }
    },

    slider3: function() {
        return function (event) {
            var valueOfSlider3 = $(this).children('#slider-handle3').attr('aria-valuenow');
            console.log('valueOfSlider3 = ' + valueOfSlider3);
            var newEquation3 = currentCoefficients.x2 + 'x^2 + ' + currentCoefficients.x + 'x + ' + valueOfSlider3 + ' ' ;

            currentCoefficients.c = valueOfSlider3;

            setTimeout(function(){
                $('#eq').val(newEquation3);
                draw();
            }, 1);
        }
    }
};
