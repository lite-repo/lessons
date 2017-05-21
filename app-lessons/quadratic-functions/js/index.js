// self executing function here
(function() {
// your page initialization code here
// the DOM will be available here
	MathJax.Hub.Register.StartupHook("End",function () {

		$( "#play" ).click(function() {

			move('.f-of')
				.set('color','white')
				.add('margin-left', 150)
				.add('margin-bottom', 75)
				.duration('1s')
				.end(function(){
					move('.co-a')
						.set('color','white')
						.add('margin-left', 250)
						.add('margin-bottom', 75)
						.duration('1s')
						.end(function(){
							move('.co-b')
							.set('color','white')
							.add('margin-left', 350)
							.add('margin-bottom', 75)
							.duration('1s')
							.end(function(){
								move('.co-c')
								.set('color','white')
								.add('margin-left', 450)
								.add('margin-bottom', 75)
								.duration('1s')
								.end();
							});
						});
				});
		});

	});
})();
