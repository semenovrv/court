(court=>{
	
function Period(p0,p1){
	this.from=p0
	this.to=p1||p0+60*60*24*1000
}

//function from2day(cc){return Math.floor(cc.from/(60*60*24*1000))}


function Lesson(cid,sid){if(arguments.length<2)Object.assign(this,cid);else{	
	this.cust_id=+cid;
	this.subj_id=+sid;
}}
Object.defineProperty(Lesson.prototype,'new',{'get':function(){return!('less_id'in this)}});
Lesson.prototype.names=['cust_id','subj_id'];
Lesson.cmp=(l1,l2)=>!Lesson.prototype.names.find(nn=>l1[nn]!=l2[nn]);
Lesson.htmlTitles=[,,,,,,,,,,'<img src="./pic/tennis.svg"/>','<img src="./pic/football.svg"/>'];
Object.defineProperty(Lesson.prototype,'htmlTitle',{'get':function(){return this.iconTitle||('<span class="cellsubj">'+this.title+'</span>')}});
Object.defineProperty(Lesson.prototype,'iconTitle',{'get':function(){return Lesson.htmlTitles[this.subj_id]}});

function Lessons(hall,lessons){
var  info=ll=>ll?Object.assign(new court.Lesson(ll),hall.customers.data.find(cc=>cc.cust_id==ll.cust_id),hall.subjects.data.find(ss=>ss.subj_id==ll.subj_id)):ll
	,self=Object.assign(this,{
 'find':(lesson,simple)=>((lesson=lessons.find(lesson instanceof Lesson?(ll=>Lesson.cmp(ll,lesson)):(ll=>ll.less_id==lesson))),simple?lesson:info(lesson))
,'push':(ll,ret)=>(lessons.push(ll),ret?info(ll):undefined)
,'forEach':fn=>lessons.forEach(fn)//{for(var ll,ii=0;ll=lessons[ii];ii++)fn(ll)}
})}
Object.assign(Lessons.prototype,{
 'names':		['cust_id','subj_id']
,'statement':	'select*from lessons'
});


function HallData(statement,val){
var self=Object.assign(this,{
 'statement':	statement
,'fetch':		list=>court.fetchJSON({'statement':self.statement}).then(data=>Object.assign(self,{
	 'update':	data=>{
					list.innerHTML='';
					data.forEach(dd=>list.appendChild((el=>(val(dd.option=el,dd),el))(document.createElement('option'))))
					return self.data=data}
	,'findData':text=>(opt=>self.data.find(oo=>oo.option===opt))
							((VV=>[].find.call(list.children,opt=>opt.value.toUpperCase()==VV))
								(text.toUpperCase()))
	}).update(data))
})}


function Hall(lessons,opts){
var timetable,hall=this;
//Object.defineProperty(hall,'lessons',	{'get':_=>lessons,	'set':json=>lessons=new Lessons(hall,json)})
//Object.defineProperty(hall,'timetable',	{'get':_=>timetable,'set':json=>timetable=new TimeTable({'lessons':lessons})})
Object.defineProperty(hall,'lessons',	{'get':_=>lessons})
Object.defineProperty(hall,'timetable',	{'get':_=>timetable})
Object.assign(hall,{
 'subjects': new HallData('select*from subjects order by title COLLATE NOCASE',(el,dd)=>el.value=dd.title)
//					.then(subj=>(el&&subj.forEach(oo=>el.appendChild(new Option(oo.title,oo.subj_id))),hall.subjects=subj))
,'customers':new HallData('select*from customers order by lastname COLLATE NOCASE, name COLLATE NOCASE',(el,dd)=>el.value=hall.customerValue(dd))
//					.then(cust=>(el&&cust.forEach(oo=>el.appendChild(new Option(oo.lastname+' '+oo.name,oo.cust_id))),hall.customers=cust))
,'fetchLessons':	()=>court.fetchJSON({'statement':Lessons.prototype.statement})
						.then(less=>lessons=new Lessons(hall,less))
,'fetchTable':		(hname,pp)=>court.fetchJSON({
							 'db':'time.table'
							,'statement':'select*from '+hname+' where start<='+opts.monday+' and end>='+opts.monday+(pp?(' and "from">='+pp.from+' and "from"<='+pp.to):'')})
,'fetchJSON':		(hname,elel,opts)=>Promise.all([
							 hall.fetchLessons()
							,hall.fetchTable(hname)
							,hall.customers.fetch(id$('idcustomer'))
							,hall.subjects.fetch(id$('idsubject'))
					]).then(aa=>timetable=new court.TimeTable(Object.assign({},opts,{'lessons':aa[0]})).append(aa[1],hname).expandCells())
})}
Object.assign(Hall.prototype,{
 'customerValue':oo=>((oo.lastname||'')+' '+(oo.name||'')).replace(/\s+/,' ').trim()
});

function DataCell(cell,data,cl){var self=Object.assign(this,{
 'data':data||{}
,'unmark':_=>{cell.classList.remove(cl)}
,'updateCell':(html,...opts)=>(cell.innerHTML=html)&&opts&&cell.classList.add(...opts)
});
Object.defineProperty(self,'occupied',{'get':_=>cell.classList.contains('occupied')});
cell.classList.add(cl=cl||'empty');
self.init()
}
(proto=>{
Object.assign(proto,{
 '_timeCell':dd=>'to'in(dd||{})
//,'html':	(header,cust,title)=>'<img src="./pic/delete-red.svg" class="hoverbutton"/>'+'<span class="celltime">'+header+'</span>'+(title||'')+'<span class="cellcust">'+cust+'<span/>'
,'html':	(header,cust,title)=>//'<span class="hoverbutton" title="освободить время"></span>'+
	'<span class="celltime">'+header+'</span>'+(title||'')+'<span class="cellcust">'+cust+'<span/>'
,'init':	function(){this.updateCell(this.html('A','A'))}
,'busy':	_=>false
})
Object.defineProperty(proto,'isTimeCell',	{'get':function(){return this._timeCell(this.data)}})
Object.defineProperty(proto,'from',			{'get':function(){return this.data.from}})
})(DataCell.prototype);

function TimeCell(cell,data,opts,isnew){
var	 self=Object.assign(this,{
	//,fields=['start','from','to','end','less_id']
	//,ll=opts.lesson
	//,args=(mon=>[mon.valueOf(),self.relTime(mon,opts.from),self.relTime(mon,opts.to),new Date().setFullYear(mon.getFullYear()+10).valueOf(),ll.less_id||ll])(self.monday);
	//fields.reduce((rec,nn,ii)=>((rec[nn]=args[ii]),rec),isnew?{'new':true}:{})
 'init':	_=>self.update(opts)
,'busy':	tm=>(data.from<=tm)&&(tm<=data.to)
});

DataCell.call(self,cell,data,'timeCell');
};
Object.assign(TimeCell.prototype=Object.create(DataCell.prototype),{
'today':	function(mon){return ((mon,day)=>newDay.call(new Date(mon),day))(mon,this.day)}//getToday(mon,self.day)
,'relTime':	function(mon,time){return new Date(this.today(mon).toDateString()+' '+time)-mon}
,'update':	function(opts){
			var	 ll=opts.lesson
				,llname=(ll.name||'').match(/^\s*([^\s])[^\s]*(?:\s+|$)(?:([^\s])|$)/)
			this.updateCell(this.html(opts.from+' - '+opts.to+' '+(ll.iconTitle||''),ll.lastname+(llname?(' '+llname.slice(1).join('.')+'.'):''),ll.iconTitle?'':ll.htmlTitle),'occupied');
			}
});




function LineRecord(ii,opts){
var  ln=opts.lines[ii]
	,line=opts.table.children[ii]
	,cell=id=>line.children[id]
	,self=Object.assign(this,{
// 'line':	ln	// array of TimeCells
 'push':(id,data,...opts)=>opts.length
			?((cc=>cc&&cc.unmark())(ln[id]),(ln[id]=new court.TimeCell(cell(id),data,{'from':opts[0],'to':opts[1],'lesson':opts[2]})))
			:self.firstCell||				(ln[id]=new DataCell(cell(id),{'from':data}))
,'remove':		_=>{opts.lines.splice(ii,1);line.remove()}
,'forCell':		fn=>[].forEach.call(line.children,(cc,id)=>fn(cc,id,ln[id]))
,'occupied': 	id=>LineRecord.prototype.occupied(cell(id))
,'find':		fn=>line&&[].find.call(line.children,fn)
,'select':		id=>LineRecord.prototype.select(cell(id))

//,'timeCell':id=>[].find.call(opts.table.children[id],cc=>cc.classList.contains('timeCell'))
});
Object.defineProperty(self,'time',{'get':_=>LineRecord.prototype.time(ln)});
//Object.defineProperty(this,'data',{'get':_=>self._data(self.line)})
//Object.defineProperty(this,'from',{'get':_=>self.data.from})
Object.defineProperty(self,'firstCell',{'get':_=>LineRecord.prototype.firstCell(ln)})
}
//LineRecord.prototype.firstTimeCell=	ln=>ln.find(cc=>cc&&cc.isTimeCell&&cc)
(proto=>{
Object.assign(proto,{
 'firstCell':	ln=>ln.find(cc=>cc)
,'time': 		ln=>+proto.firstCell(ln).from  // Array.isArray(ln)?ln:oo.lines[ln])||[])
,'occupied':	cc=>cc.classList.contains('occupied')
//,'timeCell':	cc=>cc.classList.contains('timeCell')
,'select':		cell=>cell.classList.add('nowCell')
,'selectoff':	_=>q$$('.nowCell',cc=>cc.classList.remove('nowCell'))
});
})(LineRecord.prototype)



/*
function TimeLine(ii,opts){var self=this;Object.assign(self,{
 'time':	opts.time
,'newLineRecord':_=>(tl=>(opts.lines.splice(ii,0,new Array(tl.length)),tl.insert(tl.table.children[ii]),new LineRecord(ii,opts)))(opts.cloneTimeLine())
})}
*/

function TableLine(table,ln,length){
Object.assign(this,{
 'htmlElement':ln
,'table':	table
,'insert':	next=>(next?table.insertBefore(ln,next):table.appendChild(ln),ln)
})
Object.defineProperty(this,'length',{'get':_=>length||ln.children.length})
}

function TimeTable(opts){
var  oo=Object.assign({'lines':[]},opts)
	,DD=new Day()
	,self=Object.assign(this,{
 'options':oo
,'appendCell':(cc,col,time)=>((mon,from,to)=>{var id=col(from)
	self.lineRecord(from,time).push(id,cc,DD.timeString(mon,from),DD.timeString(mon,to),oo.lessons.find(cc.less_id));
	self.lineRecord(to,time).push(id,to);
})(oo.dates.monday,cc.from,cc.to)
,'appendCells':(data,col,time)=>data&&data.forEach(cc=>self.appendCell(cc,col,time))
,'forLine':fn=>(id=>(id>=0)&&new court.LineRecord(id,oo))(oo.lines.findIndex(fn))
,'expandCells':_=>{for(var lr,ln,l1,ll=0,xln=[0,0,0,0,0,0,0];lr=new court.LineRecord(ll,oo),ln=oo.table.children[ll];ll++){
	if(!ln.querySelector('.timeCell')&&!(l1=new court.LineRecord(ll+1,oo)).find((cc,ii)=>
		ll&&LineRecord.prototype.occupied(oo.table.children[ll-1].children[ii])&&l1.occupied(ii)&&(xln[ii]!=DD.time(l1.time))
	)){lr.remove();ll--;continue};
	(tm=>
		lr.forCell((cc,ii,tc)=>tc&&tc.isTimeCell?xln[ii]=DD.time(tc.data.to):cc.classList.add(xln[ii]>tm?'occupied':'free'))
	)(DD.time(lr.time))
};return self}
//,'find':fn=>oo.lines.find((ln,ll)=>DataCell.prototype._timeCell(LineRecord.prototype._data(ln))('to'in ln[0])?ln.find((cc,cl)=>fn(cc,cl,ln,ll)?cc:undefined):undefined)
})
//this.forEach=function(fn){for(var ln,ll=0;ln=oo.lines[ll];ll++)for(var cc,cl=0;cc=ln[cl];cl++)if(fn(cc,cl,ln,ll))return cc}
//this.forEach=this.find;
}
Object.assign(TimeTable.prototype,{
 'lineConstructor':function(ii){var oo=this.options;return(_=>(tl=>(oo.lines.splice(ii,0,new Array(tl.length)),tl.insert(tl.table.children[ii]),new court.LineRecord(ii,oo)))(oo.cloneTimeLine()))}
,'lineRecord':function(tm,time){var self=this,newLineRecord=this.lineConstructor(0);tm=time(tm);
	return this.forLine((ln,ll,ltm)=>(tm>=(ltm=time(LineRecord.prototype.time(ln))))&&((tm==ltm)?ln:!(newLineRecord=self.lineConstructor(ll+1))))||newLineRecord()
}

});

function TimeSelector(mon,elel,DD){DD=DD||new Day();
Object.defineProperty(this,'tmalways',	{'get':_=>new Date().setFullYear(new Date(mon).getFullYear()+10).valueOf()});
Object.defineProperty(this,'tmcount',	{'get':_=>mon+DD.ONEWEEK*(elel['number'].value-1)})
Object.defineProperty(this,'tmday',		{'get':_=>DD.localDayStart(newMonday(new Date(elel['day'].value)))})
}

Object.assign(court,{
 'Hall':			Hall
,'Lesson':			Lesson
,'TimeCell':		TimeCell
,'LineRecord':		LineRecord
,'TableLine':		TableLine
,'TimeTable':		TimeTable
,'TimeSelector':	TimeSelector
,'postSQL':(oo,table,args,sql)=>{var dialogs=court.dialogs.on('loading');return court.postJSON(Object.assign(oo,
			(sql||((nnn,vvv)=>{return{'statement':'insert into "'+table+'"('+nnn+')values('+new Array(nnn.length).fill('?')+')','values':vvv}}))
				(...args)))
			.then(dd=>dialogs.off('loading')||dd
				,err=>dialogs.off('loading')||court.rmPIN()||dialogs.error(err,(el,msg)=>el.innerHTML=msg+'<br/>'+'Попробуйте еще раз!').then(_=>Promise.reject(err)))}
,'setSideMenu':		function(opts){function sw(m,q,v){m.style.display=q?(v||'flex'):'none'};
(function(mm,fn){if(mm)document.body.addEventListener('mousemove',evt=>{fn(evt,mm)});return arguments.callee})
	(opts.left,	(evt,mm)=>(dw=>sw(mm,evt.clientX*15<dw))		(document.documentElement.clientWidth))
	(opts.right,(evt,mm)=>(dw=>sw(mm,(dw-evt.clientX)*15<dw))	(document.documentElement.clientWidth))
	(opts.top,	(evt,mm)=>(dh=>sw(mm,evt.clientY*15<dh,'table'))(document.documentElement.clientHeight))
	
	if(opts.top)(el=>el.addEventListener('keypress',evt=>{if(evt.key=="Enter"){
		sw(opts.top);
		document.body.style.zoom=el.value+'%';
		print();
		return false;
	}}))(id$('print'));
}
});
})(window.crt||(window.crt={}));
