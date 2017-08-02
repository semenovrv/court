var	 sstatic	=	require('serve-static')
	,parseurl	=	require('parseurl')
	,qs			=	require('qs')
	,jsonParser	=	require('body-parser').json()
	,mime		=	require('mime')
	,connect	=	require('connect')
	,path		=	require('path')
	,fs			=	require('fs')
	,url		=	require('url')
	,send		=	require('send')
	,sqlite3	=	require('sqlite3').verbose()
	,google		=	require('googleapis')
	,cookieLn	=	require('cookie').serialize
	,Session	=	require('express-session')
	,SQLiteStore=	require('connect-sqlite3')(Session)
	,debug=process.argv[2]
,WWW=((root,sroot,name,port)=>{
function UserGroup(uuu){var self=Object.assign(this,{
 'uids':uuu||[]
,'methods':{'guest':()=>self}
,'includes':uid=>self.uids.some(id=>uid===id)
})}
return{
 'name':	name
,'port':	port
,'sqlite':	{'time_table':'/time.table.sqlite'}
,'maxage':	20*60*1000//20 mins
,'root':	(root={'path':'/','dir':path.join(__dirname,root)})
,'sroot':	{'path':sroot,'dir':path.join(root.dir,sroot)}
,'login':	'/login.html'
,'gmail':	(gg=>Object.assign(gg,{'obj':{'pathname':path.join(sroot,gg.login)},'callback':'/auth/google/callback'}))({'login':'/auth/google/login'})
,'url':		Object.assign(debug&&(name==='localhost')?{'port':port,'protocol':'http'}:{'protocol':'https'},{'slashes':true,'hostname':name})//{'slashes':true,'protocol':'http','hostname':name,'port':port}
//,'UserGroup':UserGroup
,'groups':	{
	 'admin':		new UserGroup(['semenovrv@gmail.com'])
	,'timetable':	new UserGroup(['semenovrv@gmail.com','khrushcheva.tandem@gmail.com','anscha1978@gmail.com'])
	,'trust':		new UserGroup(['nkholin.kmt@gmail.com','vs@chemical-block.com.com'])
	,'guest':		new UserGroup()
}
}})('/httproot','/sroot',debug||'court-174506.appspot.com',8080)
,GOOGLE={
'qauth':{
 'response_type':	'code'
,'redirect_uri':	'https://'+path.join(WWW.name,WWW.sroot.path,WWW.gmail.callback)
,'scope':			'email'
,'client_id':	'184030743485-b8e0hqtg8culn3ogpu525tcmmq5ig7ts.apps.googleusercontent.com'
}
,'web':{
	 'client_secret':				'cHocm4gFIade_ubTXGx4K96q'
	,'project_id':					'court-174506'
	,'auth_uri':					'https://accounts.google.com/o/oauth2/auth'
	,'token_uri':					'https://accounts.google.com/o/oauth2/token'
	,'auth_provider_x509_cert_url':	'https://www.googleapis.com/oauth2/v1/certs'
}}
	,session	=	Session({'store':new SQLiteStore()
				,'secret':	GOOGLE.web.client_secret
				,'cookie':{'maxAge': WWW.maxage,'path':WWW.sroot.path}
			   ,'rolling':true,'resave':true,'saveUninitialized':true})
	,oauth2Client = new google.auth.OAuth2(GOOGLE.qauth.client_id,GOOGLE.web.client_secret,GOOGLE.qauth.redirect_uri)
	,http		=	require('http').Server(connect()
	.use(WWW.sroot.path,connect()
	.use((req,res,next)=>{
		req.query=~req.url.indexOf('?')?qs.parse(parseurl(req).query):{};
		res.court={	 'writeHead':	function(){res.writeHead('200',{'Content-Type':mime.lookup('json')});return res;}
					,'end':			data=>{data?res.end(JSON.stringify(data)):res.end();}
					,'send':		function(err,data){if(err)console.log('ERROR',err);res.court.writeHead().court.end(data);}
					,'serr':		err=>{res.writeHead('500',{'Content-Type':mime.lookup('json')});res.court.end(err=err.message||err);process.stderr.write(err.message||JSON.stringify(err));}
					,'redirect':	(uuu,opts)=>{
										uuu=uuu.pathname?url.format(Object.assign(WWW.url,uuu)):uuu
										res.statusCode=opts?opts.status||302:302;
										res.setHeader('Location',uuu);console.log('redirected['+res.statusCode+'] to: ',uuu);
										res.setHeader('Content-Length','0');
										res.end();
										return res;}
					,'newState':	(state,nodef)=>{return{'state':state||req.query.state||!nodef&&req.originalUrl};}
					};
		next();
		})
	.use(WWW.gmail.login,(req,res)=>console.log('googlogin')||res.court.redirect(
		 url.format({'slashes':true,'protocol':'https','hostname':'accounts.google.com','pathname':'/o/oauth2/auth','query':Object.assign({},GOOGLE.qauth,res.court.newState())})))
	.use(session)
	.use('/logout',(req,res)=>req.session.destroy(()=>{res.writeHead(304);res.end();}))
	.use(WWW.gmail.callback,(req,res,next)=>oauth2Client.getToken(req.query.code,(err,tokens)=>// GOOGLE reply is redirected always//
		(Object.assign(res.court,res.court.newState(null,true)).error=err)
			?next()
			:google.plus('v1').people.get({'userId':'me','auth':(oauth2Client.setCredentials(tokens),oauth2Client)},(err,usr)=>
			(res.court.error=err)
				?next()
				:(Object.assign(req.session,{'user':usr={'email':usr.emails[0].value}})
					,userAccess(req,res,()=>res.court.redirect({'pathname':req.query.state})))
	 )))
	.use('/auth',sstatic(path.join(WWW.sroot.dir,'auth')))
	.use(userAccess)
	.use('/sqlite3all',(req,res)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).all(query.statement,res.court.send);
	})
	.use('/sqlite3get',(req,res)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).get(query.statement,res.court.send);
	})
	.use('/meters',(req,res)=>{try{send(req,'meter.csv',{'root':__dirname}).pipe(res);}catch(err){res.court.serr(err);}})
	.use(...GroupMethod('meter'))
	.use(...GroupMethod('sqlite3insert'))
	//.use(...SQLite('court')).use(...SQLite('time.table'))
	.use('/data',(...args)=>WWW.groups.admin.includes(args[0].session.user.email)?connect().use(sstatic(__dirname))(...args):(args[1].writeHead(404),args[1].end()))
	.use(sstatic(WWW.sroot.dir))
	.use((req,res,next)=>console.log('not served!',req.url,WWW.sroot.dir)||next())
)
	.use('/_ah/health',(req,res)=>{res.writeHead(200);res.end()})//gcloud VM health check requests//
	.use(sstatic(WWW.root.dir,{'index':'home.html'}))
);
function userAccess(req,res,next){if(debug&&(WWW.name==='localhost')){req.session.user={'email':WWW.groups.admin.uids[0]};res.court.error=true}
var  obj,sess=req.session
	,usr=sess&&sess.user;
	//,opts=sess?{'path':sess.cookie.path,'expires':sess.cookie.expires}:{'path':WWW.sroot.path,'maxAge':0};
console.log(sess,res.court.error);
if(!res.court.error&&(usr||{}).email&&GroupMethod('guest')[1](req,0,()=>console.log('not allowed!')||false)){
		res.setHeader('Set-Cookie',[cookieLn('courtuser',usr.email,{'path':sess.cookie.path,'expires':sess.cookie.expires})]);
		next();
}else{	if(usr)delete req.session.user;
		//obj=Object.assign({},WWW.gmail.obj);
		//Object.assign(obj.query||(obj.query={}),res.court.newState(res.court.state));
		//res.court.redirect(obj);
		res.court.redirect({'pathname':path.join(WWW.sroot.path,'/auth',WWW.login),'query':Object.assign(res.court.newState(res.court.state),{'login':path.join(WWW.sroot.path,WWW.gmail.login)})});
}}

function GroupMethod(mm){var GG;return['/'+mm,(...aaa)=>
	Object.keys(WWW.groups).some(gg=>(GG=WWW.groups[gg]).methods[mm]&&GG.includes(aaa[0].session.user.email))?GG.methods[mm](...aaa):aaa[2]()
];}
/*
function SQLite(db){return[
	 '/data/'+(db=path.basename(parseurl(req).pathname))//(db=db+'.sqlite')
	,(req,res)=>WWW.groups.admin.includes(req.session.user.email)?send(req,db,{'root':__dirname}).pipe(res):(res.writeHead(404),res.end())
];}
*/

(sql=>{
Object.assign(WWW.groups.admin.methods,{
 'meter':(req,res)=>{try{
		(dd=>console.log(new Date(Number(dd[0])),dd.slice(1)))(req.query.val.split(','));
		fs.appendFileSync(path.join(__dirname,'meter.csv'),req.query.val+'\n');
		res.court.send();
	}catch(err){res.court.serr(err);}}
,'sqlite3insert':sql(q=>q)
});
Object.assign(WWW.groups.timetable.methods,{
 'sqlite3insert':sql(query=>query.db!=='accounts')
});
})(allow=>connect().use(jsonParser).use((req,res,next)=>req.method==='POST'
?(query=>{console.log('sqlite3insert',req.session.user);if(allow(query)){
var	 cc=query.values.length
	,db = new sqlite3.Database(query.db+'.sqlite',sqlite3.OPEN_READWRITE)
	,st = db.prepare(query.statement);
	console.log('sqlite3insert',query);
	query.values.forEach(vv=>st.run(vv,end));
function end(){if(!--cc)query.refresh?db[query.refresh.method](query.refresh.statement,res.court.send):res.court.send();}
}})(req.body)
:next())

);

http.listen(WWW.port);
console.log(new Date(),'court running...',WWW.name,GOOGLE);
