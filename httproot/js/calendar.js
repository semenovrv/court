(main=>{
function Calendar(parent,dt){dt=dt||new Date();console.log('setting calendar',dt);var self=Object.assign(this,{
 'parent':		parent
,'DaysOfWeek':	['пн','вт','ср','чт','пт','сб','вс']
,'Months':		['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
,'CurrentMonth':	dt.getMonth()
,'CurrentYear':	dt.getFullYear()
})};

Object.assign(Calendar.prototype,{
 'nextMonth':		function(){return Object.assign(this,this.CurrentMonth==11?{'CurrentMonth':0,'CurrentYear':this.CurrentYear+1}:{'CurrentMonth':this.CurrentMonth+1}).showCurrent()}
,'previousMonth':	function(){return Object.assign(this,this.CurrentMonth==0?{'CurrentMonth':11,'CurrentYear':this.CurrentYear-1}:{'CurrentMonth':this.CurrentMonth-1}).showCurrent()}
,'showCurrent':		function(){return this.showMonth(this.CurrentYear,this.CurrentMonth)}
,'showMonth':		function(yy,mm){
					var	 self=this
						,day=dd=>(new Date(yy,mm,dd).getDay()||7)-1
						,last=mm=>new Date(yy,mm+1,0).getDate()
						,cell=(text,cl)=>'<span'+(cl?(' class="'+cl+'"'):'')+'>'+text+'</span>'
						,html = '<div class="header">'+cell('<<','calprev')+cell(self.Months[mm]+' - '+yy,'mtitle')+cell('>>','calnext')+'</div>'
								+'<div class="cal">'
								+'<div><div>'+this.DaysOfWeek.reduce((ln,nn)=>ln+=cell(nn),'')+'</div></div><div class="days">';
					(day=>{if(day){
									html+='<div class="week">';
					(ii=>{	for(var dow=0;dow<day;dow++)
									html+=cell(ii++,'not-current')})(last(mm-1)-day+1)}})(day(1));// First day of month
							for(var ii=1;ii<=last(mm);ii++)switch(day(ii)){
							case 6:	html+=cell(ii)+'</div>';break;
							case 0: html+='<div class="week">';
							default:html+=cell(ii)}
					(dow=>{if(dow){
							for(var ii=1;dow<=6;dow++)
									html+=cell(ii++,'not-current');
									html+='</div>';}})(day(ii));
									html+='</div>';
					self.parent.innerHTML = html;
					[].forEach.call(document.querySelectorAll('.cal>.days>*>*'),cc=>cc.addEventListener('click',_=>cc.classList.toggle('selected')));
					(function(sel,fn){document.querySelector(sel).addEventListener('click',fn);return arguments.callee})
						('.calnext',_=>self.nextMonth())
						('.calprev',_=>self.previousMonth())
					return self;
					}
});main.Calendar=Calendar})(window.crt||(window.crt={}));
