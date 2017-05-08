// self executing function here
(function() {
// your page initialization code here
// the DOM will be available here
MathJax.Hub.Register.StartupHook("End",function () {


var head = $("h1"),
	  content = $("#content"),
    subhead = $("h2"),
    feature = $("#feature"),
    equation = $("#equation"),
    description = $("#description"),
    terms = $("#terms-wrapper i");

TweenLite.set(content, {visibility:"visible"})
TweenLite.to(equation, 2, {color: "white", backgroundColor:"black", borderBottomColor:"#90e500"});
TweenLite.to(terms, 2, {color: "white", backgroundColor:"transparent"});

//instantiate a TimelineLite
var tl = new TimelineLite();

//add a from() tween at the beginning of the timline
tl.from(head, 0.5, {left:100, opacity:0})
  .from(subhead, 0.9, {x:-30, opacity:0}, "+=1")
  .from(description, 0.6, {x:30, opacity:0}, "+=1")
  .from("i.f-of", 0.5, {x:-50, opacity:0}, "+=0.5")
  .from("i.co-a", 0.5, {y:50, opacity:0}, "+=0.5")
  .from("i.co-b", 0.5, {y:50, opacity:0}, "+=0.5")
  .from("i.plus", 0.5, {y:-50, opacity:0}, "+=0.5")
  .from("i.co-c", 0.5, {x:50, opacity:0}, "+=0.5");

//test

//use position parameter "-=0.5" to schedule next tween 0.25 seconds before previous tweens end.
//great for overlapping
//.from(description, 0.5, {left:100, autoAlpha:0}, "-=0.25")

//TweenLite.to(terms, 2, {color: "transparent", backgroundColor:"transparent", borderBottomColor:"#90e500"});
//.from("i.f-of", 0.5, {top:100, color:"white"}, "+=0.25");

/*
//add a label 0.5 seconds later to mark the placement of the next tween
tl.add("stagger", "+=0.5");
//to jump to this label use: tl.play("stagger");

//stagger the animation of all icons with 0.1s between each tween's start time
//this tween is added
tl.staggerFrom(terms, 2, {scale:0, autoAlpha:0}, 0.1, "stagger");
//tl.staggerFrom($("#nav img"), 0.2, {scale:0, autoAlpha:0}, 0.1, "stagger");
*/

/* --- Control playback methods --- */
$("#play").click(function() {
		tl.play();
});

$("#pause").click(function() {
		tl.pause();
});

$("#reverse").click(function() {
		tl.reverse();
});

$("#resume").click(function() {
		tl.resume();
});

$("#stagger").click(function() {
		tl.play("stagger");
});

$("#restart").click(function() {
		tl.restart();
});

//when the timeline updates, call the updateSlider function
tl.eventCallback("onUpdate", updateSlider);

$("#slider").slider({
  range: false,
  min: 0,
  max: 100,
  step:.1,
  slide: function ( event, ui ) {
    tl.pause();
    //adjust the timeline's progress() based on slider value
    tl.progress( ui.value/100 );
    }
});

function updateSlider() {
  $("#slider").slider("value", tl.progress() *100);
}

tl.progress(1)

});
})();
