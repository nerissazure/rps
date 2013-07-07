var RPSGame	=	{
	config	:	{
		is_accessible	:	false,
		container_el		:	"game_container"
	},
	el	:	{
		"button"	:	{
			"rock"		:	"rock",
			"paper"		:	"paper",
			"scissors"	:	"scissors",
			"accessibility_mode"	:	"accessibility_mode",
			"last_5"	:	"last_5",
			"first_5"	:	"first_5",
			"won_games"	:	"won_games",
			"total_results"	:	"total_results"
		},
		"div"	:	{
			"result"	:	"result",
			"cpu"		:	"cpu_result",
			"info"		:	"info"
		}
	},
	keypress_map	:	{
		"p"	:	"paper",
		"r"	:	"rock",
		"s"	:	"scissors"
	},
	option_map	:	{
		"rock"	:	{
			"rock"		:	0,
			"paper"		:	-1,
			"scissors"	:	1
		},
		"paper"	:	{
			"rock"		:	1,
			"paper"		:	0,
			"scissors"	:	-1
		},
		"scissors"	:	{
			"rock"		:	-1,
			"paper"		:	1,
			"scissors"	:	0
		}
	},
	outcome_map	:	{
		"-1"	:	"loss",
		"0"		:	"tie",
		"1"		:	"win"
	},
	events	:	{
		show_last_5			:	function(){
			return null;
		},
		show_first_5		:	function(){
			return null;
		},
		show_won_games		:	function(){
			return null;
		},
		show_total_games	:	function(){
			return null;
		},
		select_play_option	:	function(play_type, self){
			var game = self.game_factory();
			var cpu_play = self.get_random_play();
			game.result = self.get_outcome( play_type, cpu_play );
			self.played_games.add(self, game);
			self.display_results(self, game);
		},
		switch_mode	:	function(self, e){
			var elem = e.target;
			if( elem.classList.contains("enabled") ){
				elem.classList.remove("enabled");
				self.config.is_accessible = false;
			}else{
				elem.classList.add("enabled");
				self.config.is_accessible = true;
			}
		}
	},
	init	:	function(){
		for(var el_type in this.el){
			for(var el_id in this.el[el_type]){
				var dom_el = document.createElement(el_type);
				var title = "";
				var words = el_id.split("_");
				for(var word in words){
					if(title !== ""){
						title += " ";
					}
					title += words[word];
				}
				
				dom_el.setAttribute("id", el_id);
				dom_el.setAttribute("title", title);
				dom_el.innerHTML = title;
				document.getElementById(this.config.container_el).appendChild(dom_el);
			}
		}
		
		this.init_events();
	},
	init_events	:	function(){
		for(var id in this.keypress_map){
			this.attach_event(this.keypress_map[id]);
		}
		this.attach_event(this.get_el("accessibility_mode", false));
	},
	attach_event	:	function(id){
		console.log("attaching event for: " + id);
		var element = document.getElementById(id);
		var that = this;
		if(element.addEventListener){
			element.addEventListener("keypress", function(e){ return that.dispatch_event(e, that); }, true);
			element.addEventListener("click", function(e){ return that.dispatch_event(e, that); }, true);
			element.addEventListener("dblclick", function(e){ return that.dispatch_event(e, that); }, true);
		}else if(element.attachEvent){
			element.attachEvent("onkeypress", function(e){ return that.dispatch_event(e, that); });
			element.attachEvent("onclick", function(e){ return that.dispatch_event(e, that); });
			element.attachEvent("ondblclick", function(e){ return that.dispatch_event(e, that); });
		}else{
			element.onkeypress = function(e){ return that.dispatch_event(e, that); };
			element.onclick	= function(e){ return that.dispatch_event(e, that); };
			element.dblclick = function(e){ return that.dispatch_event(e, that); };
		}
	},
	dispatch_event	:	function(event, self){
		//prevent single click events when accessible mode is off.
		if( event.type === "click" && self.config.is_accessible === false ){
			return false;
		}
		
		var play_option = "";
		try{
			play_option = self.option_map[event.target.getAttribute("id")];
		}catch(e){ 
			//do nothing
		}
		
		//check if event was triggered by playing the game
		if(typeof(event.keycode) !== "undefined" && self.config.is_accessible === true){
			self.events.select_play_option(self.keypress_map[event.keycode], self);
			return null;
		}else if( typeof(play_option) !== "undefined"){
			self.events.select_play_option(event.target.getAttribute("id"), self);
			return null;
		}
		
		
		
		//otherwise we'll go through the other event possibilities
		switch(event.target.getAttribute("id")){
			case "accessibility_mode":
				self.events.switch_mode(self, event);
				
			case "last_5":
				self.events.show_last_5(self, event);
			
			case "first_5":
				self.events.show_first_5(self, event);
				
			case "won_games":
				self.events.show_won_games(self, event);
				
			case "total_games":
				self.events.show_total_games(self, event);
				
			default:
				return null;
		}
		
		return null;
	},
	get_el	:	function(s, return_el){
		if(typeof(return_el) === "undefined")
			return_el = false;
		for(var type in this.el){
			for(var el in this.el[type]){
				if(s === el){
					if(return_el)
						document.getElementById( this.el[type][el] );
					else
						return this.el[type][el];
				}
			}
		}
	},
	played_games	:	{
		add	:	function(self, game){
			if(typeof(game) !== "object"){
				throw("Unable to add game to played list.");
			}
			self.played_games.list.push(game);
		},
		get	:	function(self, offset, size){
			var game_list = [];
			try{
				for(var i = 0; i < size; i++){
					game_list.push(self.played_games.list[offset + i]);
				}
			}catch(e){ }
			return game_list;
		},
		list	:	[]
	},
	display_results	:	function(self, game){
		console.log(game);
	},
	get_random_play	:	function(){
		var increment = 0;
		var index = Math.round(Math.random() * 999) % 3;
		for(var play_type in this.option_map){
			if(typeof(this.option_map[play_type]) === "object"){
				if(index == increment){
					return play_type;
				}
			}
			increment++;
		}
		throw("Unable to get a random play for CPU.");
	},
	get_outcome	:	function(human_play, cpu_play){
		return this.option_map[human_play][cpu_play];
	},
	game_factory	:	function(){
		return {
			result	:	null,
			time	:	Date()
		};
	}
};

RPSGame.init();