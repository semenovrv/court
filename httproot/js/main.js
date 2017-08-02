function id$(id){return document.getElementById(id)}
function q$(ss,el){return (el||document).querySelectorAll(ss)}
function q$$(ss,fn,el){return [].forEach.call(q$(ss,el),fn)}
function q$i(ss,ff,el){return [].indexOf.call(q$(ss,el),ff)}
function child$(pp,fn){return [].forEach.call(pp.children,fn)}

//function _2json(res){try{res=res.json()}catch{}finally{return res}}
((crt,_2json,PP)=>Object.assign(crt,{
 'params':		ppp=>Object.keys(ppp).map(pp=>encodeURIComponent(pp)+'='+encodeURIComponent(ppp[pp])).join('&')
,'fetchTEXT':	(meth,err)=>		fetch(meth,{'credentials':'same-origin'})
	.then(res=>((err=!res.ok),res)).then(function(res){var ret;try{ret=res.text().catch(err=>res)}catch(e){ret=res}finally{return ret}})
	.then(res=>PP(err,res))
,'fetchJSON':	(ppp,meth,err)=>	fetch((meth||'sqlite3all')+'?'+crt.params(ppp),{'credentials':'same-origin'})
	.then(res=>((err=!res.ok),res)).then(_2json)
	.then(res=>PP(err,res))
,'postJSON':	(body,err)=>		fetch('sqlite3insert',{
	 'headers':		{'Accept':'application/json','Content-Type':'application/json'}
	,'credentials':	'same-origin'
	,'method':		'POST'
	,'body':JSON.stringify(body)
}).then(res=>((err=!res.ok),res)).then(_2json).then(res=>PP(err,res))
,'postText':	(meth,body,err)=>	fetch(meth+'?'+crt.params(body),{
	 'headers':		{'Accept':'application/json','Content-Type':'application/json'}
	,'credentials':	'same-origin'
}).then(res=>((err=!res.ok),res)).then(_2json).then(res=>PP(err,res))
	
//,'getPIN':	_=>(pin=>(pin&&pin.length)?pin:(localStorage.setItem('PIN',pin=prompt('Введите PIN')),pin))(localStorage.getItem('PIN'))
//,'rmPIN':	_=>{localStorage.removeItem('PIN')}
}))(window.crt||(window.crt={})
	,function(res){var ret;try{ret=res.json().catch(err=>res)}catch(e){ret=res}finally{return ret}}
	,(err,res)=>Promise[err?'reject':'resolve'](res));

function ld(d){return('0'+d).slice(-2)}
function Narray(nn,ff){
var		ll=nn.length,res=new Array(ll);
		if(ff)if(ff.length)res.fill(ff);else for(var ii=0;ii<ll;ii++)res[ii]=ff[nn[ii]]
return	res
}

function Day(){const HS=60*24*1000,MS=60*HS;Object.assign(this,{
 'WeekDays':['понедельник','вторник','среда','четверг','пятница','суббота','воскресенье']
,'ONEHOUR':HS
,'ONEDAY':MS
,'ONEWEEK':MS*7
,'time':tm=>tm%MS
,'day':from=>Math.floor(from/MS)
,'period':(p0,p1)=>({'from':p0,'to':p1||(p0+MS)})
,'timeString':(dt,offset)=>((dt=new Date(dt.valueOf()+offset)),ld(dt.getHours())+':'+ld(dt.getMinutes()))
,'from':(dd,hh,mm)=>new Date(MS*dd).setUTCHours(hh,mm||0,0,0)
,'shortDate':	 dt=>(dt=new Date(dt))&&(dt.getDate()+' '+['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][dt.getMonth()])
,'localDayString':	dt=>dt.getFullYear()+"-"+ld(dt.getMonth()+1)+"-"+ld(dt.getDate())
,'localDayStart':	(...args)=>new Date(...args).setHours(0,0,0,0)//msec up to local beginning of the day
})};
(proto=>Object.assign(proto,{
 'dayDate':		(dt,day)		=>new Date(new Date(dt).setDate(dt.getDate()+(day||0)))
,'timeDate':	(dt,day,time)	=>new Date(proto.dayDate(new Date(dt),day).toDateString()+' '+time)-dt
}))(Day.prototype);

function newDay(dd){return new Date(this.setDate(this.getDate()+(dd||0)))}
function localDayStart(){return new Date(...arguments).setHours(0,0,0,0)}//msec up to local beginning of the day
function newMonday(){var dd=new Date(...arguments),day=dd.getDay();return newDay.call(dd,-day+(day==0?-6:1))}


function localDayString(now){return	now.getFullYear()+"-"+ld(now.getMonth()+1)+"-"+ld(now.getDate())}
function getQueryParameters(str){return(str||location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0]}
window.onload=function(){var forget=document.getElementById('forget');if(forget)forget.addEventListener('click',window.crt.rmPIN)};
