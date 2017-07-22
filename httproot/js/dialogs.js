(crt=>{
function Dialogs(opts){opts=opts||{}
var  dcid={}
	,dc=this
	,el=id=>document.getElementById(id)
	,sel=(el,sel)=>el.querySelector(sel)
	,dcet=name=>((dcid[name]=opts[name]||name),dcet)
	,promise=(id,init)=>(dc.on(id),new Promise(init).then(vv=>(dc.off(id),vv),(...err)=>(dc.off(id),Promise.reject(...err))))
	,message=(el,msg,mname,param)=>msg?msg(sel(el,'[name="'+(mname||'message')+'"]'),param):undefined;

dcet('error')('message');
Object.assign(dc,{
 'timeout':opts.timeout||3000
,'show':id=>promise(id,rs=>setTimeout(rs,dc.timeout))
,'on':	st=>(document.body.classList.add(st),dc)
,'off':	st=>{document.body.classList.remove(st)}

// id == body.classname //
,'error':	(err,...msg)=>	(id=>(message(el(id),msg[0]||((el,msg)=>el.textContent=msg),msg[1],err.message||JSON.stringify(err)),dc.show(id)))	(dcid['error'])
,'message':	(...msg)=>		(id=>(message(el(id),...msg),dc.show(id)))											(dcid['message'])
,'ask':		(id,...msg)=>	(el=>(message(el,msg[0],msg[1],el),promise(id,(resolve,reject)=>{
			var  act=(aa,fn)=>((el,fn)=>el?(el.addEventListener('click',fn),_=>el.removeEventListener('click',fn)):_=>_)(sel(el,'.button.'+aa),_=>click(fn))
				,click=((rs,rj)=>next=>(rj(),rs(),next()))(act('resolve',resolve),act('reject',reject))
			})))(el(id))
,'fetch':(id,field,fetch)=>{var resolve,tt=field.target,trigger=tt.label,opts=field.options
	,setvalue=field.setvalue||(vv=>(vv?{'id':tt.value.value=vv[opts['id']],'text':trigger.textContent=vv[opts['text']]}:vv))
	,setrow=field.setrow||(row=>row)
//	,fillRow=(row,dd)=>{for(var nn in dd)(ff=>{if(ff)ff.textContent=dd[nn]})(row.querySelector('[name="'+nn+'"]'));setrow(row,dd).addEventListener('click',_=>{value=dd});return row}
	,fillRow=(row,dd)=>((row=dc.fillFetchRow(row,dd,setrow)).addEventListener('click',_=>resolve(dd)),row)

	function fn(){
		dc.on('loading');
		trigger.removeEventListener('click',fn);
		fetch()
		.then(list=>(el=>{var rows=sel(el,'.list');list.forEach(ll=>rows.appendChild(fillRow(dc.cloneFetchRow(el),ll)))})(el(id)))
		.catch(err=>dc.error(err))
		.then(_=>{
			trigger.addEventListener('click',_=>promise(id,(rs,rj)=>{resolve=rs;dc.ask(id).then(_=>rs(),rj)}).then(setvalue,aa=>aa))
			trigger.click();
			dc.off('loading')
	})}
	trigger.addEventListener('click',fn);
}
,'cloneFetchRow':el=>sel(el,'.clonetemplate>div:first-child').cloneNode(true)
,'fillFetchRow':(row,dd,setrow)=>{for(var nn in dd)(ff=>{if(ff)ff.textContent=dd[nn]})(row.querySelector('[name="'+nn+'"]'));return (setrow||(row=>row))(row,dd)}

		
})}
	

Object.assign(crt||(window.crt={}),{'initDialogs':(...opts)=>new Dialogs(...opts)})
})(window.crt)

