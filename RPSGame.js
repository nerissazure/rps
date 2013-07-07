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
			"total_games"	:	"total_games"
		},
		"div"	:	{
			"result"	:	"result",
			"cpu"		:	"cpu_result",
			"info"		:	"info"
		}
	},
	keypress_map	:	{
		"80"	:	"paper",
		"82"	:	"rock",
		"83"	:	"scissors"
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
		"-1"	:	"lose",
		"0"		:	"tie",
		"1"		:	"win"
	},
	events	:	{
		show_last_5			:	function(self){
			var info_container = self.get_el("info", true, self);
			var game_collection = [];
			var played_games = self.played_games.list;
			var ending_offset = 5;
			var game_container = document.createElement("ol");
			if(played_games.length < 5){
				if(played_games.length == 0){
					info_container.innerHTML = "You have not played any games this session.";
					return false;
				}
				ending_offset = played_games.length;
			}
			
			for(var i = 0; i < ending_offset; i++){
				var game_el = document.createElement("li");
				var time_el = document.createElement("p");
				var human_play_el = document.createElement("p");
				var cpu_play_el = document.createElement("p");
				var result_el = document.createElement("p");
				
				time_el.innerHTML = played_games[i].time;
				human_play_el.innerHTML = played_games[i].human_play;
				cpu_play_el.innerHTML = played_games[i].cpu_play;
				result_el.innerHTML = self.outcome_map[played_games[i].result];
				
				game_el.appendChild(time_el);
				game_el.appendChild(human_play_el);
				game_el.appendChild(cpu_play_el);
				game_el.appendChild(result_el);
				game_container.appendChild(game_el);
			}
			game_container.classList.add("last_5");
			
			info_container.innerHTML = "";
			info_container.appendChild(game_container);
			
			return false;
		},
		show_first_5		:	function(){
			console.log("showing first 5 games");
			return null;
		},
		show_won_games		:	function(){
			console.log("showing winning games");
			return null;
		},
		show_total_games	:	function(){
			console.log("showing total games");
			return null;
		},
		select_play_option	:	function(play_type, self){
			var game = self.game_factory();
			var cpu_play = self.get_random_play();
			game.result = self.get_outcome( play_type, cpu_play, self );
			game.human_play = play_type;
			game.cpu_play	= cpu_play;
			self.played_games.add(self, game);
			self.display_results(self, game);
		},
		switch_mode	:	function(self, e){
			console.log("switching");
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
				var id = this.el[el_type][el_id];
				var dom_el = document.createElement(el_type);
				var title = "";
				var words = id.split("_");
				
				for(var word in words){
					if(title !== ""){
						title += " ";
					}
					title += words[word];
				}
				
				dom_el.setAttribute("id", id);
				dom_el.setAttribute("title", title);
				dom_el.innerHTML = title;
				document.getElementById(this.config.container_el).appendChild(dom_el);
			}
		}
		
		this.init_events();
	},
	init_events	:	function(){
		for(var id in this.el.button){
			this.attach_event(this.el.button[id]);
		}
		this.attach_keypress_event();
		//this.attach_event(this.get_el("accessibility_mode", false));
	},
	attach_event	:	function(id){
		var element = document.getElementById(id);
		var that = this;
		if(element.addEventListener){
			element.addEventListener("click", function(e){ return that.dispatch_event(e, that); }, true);
			element.addEventListener("dblclick", function(e){ return that.dispatch_event(e, that); }, true);
		}else if(element.attachEvent){
			element.attachEvent("onclick", function(e){ return that.dispatch_event(e, that); });
			element.attachEvent("ondblclick", function(e){ return that.dispatch_event(e, that); });
		}else{
			element.onclick	= function(e){ return that.dispatch_event(e, that); };
			element.dblclick = function(e){ return that.dispatch_event(e, that); };
		}
	},
	attach_keypress_event	:	function(){
		var that = this;
		var element = document.getElementsByTagName("body")[0];
		if(element.addEventListener){
			element.addEventListener("keydown", function(e){ return that.dispatch_event(e, that); }, true);
		}else if(element.attachEvent){
			element.attachEvent("onkeypress", function(e){ return that.dispatch_event(e, that); });
		}else{
			element.onkeypress = function(e){ return that.dispatch_event(e, that); };
		}
	},
	dispatch_event	:	function(event, self){
		//prevent single click events when accessible mode is off.
		if( event.type === "click" && self.config.is_accessible === false ){
			return false;
		}
		
		//otherwise we'll go through the other event possibilities
		switch(event.target.getAttribute("id")){
			case "accessibility_mode":
				self.events.switch_mode(self, event);
				return false;
				
			case "last_5":
				self.events.show_last_5(self, event);
				return false;
			
			case "first_5":
				self.events.show_first_5(self, event);
				return false;
				
			case "won_games":
				self.events.show_won_games(self, event);
				return false;
				
			case "total_games":
				self.events.show_total_games(self, event);
				return false;
		}
		
		var play_option = "";
		try{
			play_option = self.option_map[event.target.getAttribute("id")];
		}catch(e){ 
			//do nothing
		}
		
		//check if event was triggered by playing the game
		if( typeof(event.keyCode) !== "undefined" && event.keyCode !== 0 && self.config.is_accessible === true){
			self.events.select_play_option(self.keypress_map[event.keyCode], self);
			return null;
		}else if( typeof(play_option) !== "undefined"){
			self.events.select_play_option(event.target.getAttribute("id"), self);
			return null;
		}
		
		return false;
	},
	get_el	:	function(selector, return_el, self){
		if(typeof(return_el) === "undefined")
			return_el = false;
		if(typeof(self) === "undefined")
			self = this;
		for(var type in self.el){
			for(var el in self.el[type]){
				if(selector === el){
					if(return_el){
						return document.getElementById( self.el[type][el] );
						}
					else{
						return self.el[type][el];
					}
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
	
		//build the markup and text for displaying the game's result
		var result_text = document.createElement("p");
		var outcome_prefix = document.createElement("span")
		outcome_prefix.innerHTML = "You ";
		var outcome = document.createElement("span");
		outcome.innerHTML = self.outcome_map[game.result];
		outcome.classList.add("outcome_" + self.outcome_map[game.result]);
		var result_el = self.get_el("result", true, self);
		result_el.innerHTML = "";
		result_el.appendChild(outcome_prefix);
		result_el.appendChild(outcome);
		
		//show the cpu's play
		self.get_el("cpu", true, self).innerHTML = "CPU Played: " + game.cpu_play;
		return true;
	},
	get_random_play	:	function(){
		var increment = 0;
		var index = Math.round(Math.random() * 1000) % 3;
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
	get_outcome	:	function(human_play, cpu_play, self){
		try{
			return self.option_map[human_play][cpu_play];
		}catch(e){
			//don't need to do anything, just caught a bad keypress
		}
	},
	game_factory	:	function(){
		return {
			result		:	null,
			time		:	Date(),
			human_play	:	null,
			cpu_play	:	null
		};
	}
};

RPSGame.init();