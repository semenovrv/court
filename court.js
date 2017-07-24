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
,WWW=((root,name,port)=>{return{
 'name':	name
,'port':	port
,'sqlite':	{'time_table':'/time.table.sqlite'}
,'maxage':	20*60*1000//20 mins
,'root':	{'path':root,'dir':path.join(__dirname,root)}
,'url':		{'slashes':true,'protocol':'https','hostname':name}//{'slashes':true,'protocol':'http','hostname':name,'port':port}
,'gmail':	{'login':'/auth/google/ask','callback':'/auth/google/callback'}
}})('httproot/',process.argv[2]||'court-174506.appspot.com',8080)
,GOOGLE={
'qauth':{
 'response_type':	'code'
,'redirect_uri':	'https://'+path.join(WWW.name,WWW.gmail.callback)
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
				,'cookie':{'maxAge': WWW.maxage,'path':'/'}
			   ,'rolling':true,'resave':true,'saveUninitialized':true})
	,oauth2Client = new google.auth.OAuth2(GOOGLE.qauth.client_id,GOOGLE.web.client_secret,GOOGLE.qauth.redirect_uri)
	,http		=	require('http').Server(connect().use('/_ah/health',(req,res)=>{res.writeHead(200);res.end()})//gcloud VM health check requests//
//	.use(sstatic(WWW.root.dir))
	.use('/js/',sstatic(path.join(WWW.root.dir,'/js')))
	.use('/css/',sstatic(path.join(WWW.root.dir,'/css')))
	.use('/pic/',sstatic(path.join(WWW.root.dir,'/pic')))
	.use((req,res,next)=>{
		req.query=~req.url.indexOf('?')?qs.parse(parseurl(req).query):{};
		res.court={	 'writeHead':	function(){res.writeHead('200',{'Content-Type':mime.lookup('json')});return res}
					,'end':			data=>{data?res.end(JSON.stringify(data)):res.end()}
					,'send':		function(err,data){if(err)console.log('ERROR',err);res.court.writeHead().court.end(data)}
					,'serr':		err=>{res.writeHead('500',{'Content-Type':mime.lookup('json')});res.court.end(err=err.message||err);process.stderr.write(err.message||JSON.stringify(err))}
					,'redirect':	(uuu,opts)=>{
										uuu=uuu.pathname?url.format(Object.assign(WWW.url,uuu)):uuu
										res.statusCode=opts?(opts.status||301):301;
										res.setHeader('Location',uuu);console.log('redirected['+res.statusCode+'] to: ',uuu);
										res.setHeader('Content-Length','0');
										res.end();
										return res}
					,'permit':sess=>{//khrushcheva.tandem@gmail.com
								var usr=sess&&sess.user||{},opts=sess?{'path':sess.cookie.path,'expires':sess.cookie.expires}:{'path':'/','maxAge':0}; 
									res.setHeader('Set-Cookie',[cookieLn('courtuser',usr.email||'guest',opts)]);
									switch(usr.email){
										case"semenovrv@gmail.com":;
										case"khrushcheva.tandem@gmail.com":;
										case"nkholin.kmt@gmail.com":;
										case"anscha1978@gmail.com":;
										case"vs@chemical-block.com.com":return true;
									}
								}


					}
		next()
		})
	.use(WWW.gmail.login,(req,res)=>res.court.redirect(
		 url.format({'slashes':true,'protocol':'https','hostname':'accounts.google.com','pathname':'/o/oauth2/auth','query':Object.assign({},GOOGLE.qauth,{'state':req.query.state||req.url})})
		,{'status':301}))
	.use(session).use((req,res,next)=>next())
	.use('/logout',(req,res)=>req.session.destroy(err=>{res.writeHead(304);res.end()}))
	.use(WWW.gmail.callback,(req,res)=>oauth2Client.getToken(req.query.code,(err,tokens)=>{// GOOGLE reply is redirected always//
			if(err)return res.court.redirect({'pathname':WWW.gmail.login});
			oauth2Client.setCredentials(tokens);
		google.plus('v1').people.get({'userId':'me','auth':oauth2Client},(err,gres)=>{
			if(err)return res.court.redirect({'pathname':WWW.gmail.login});
			(usr=>{res.court.redirect(res.court.permit(Object.assign(req.session,{'user':usr}))
				?{'pathname':req.query.state}
				:{'pathname':WWW.gmail.login},{'status':302});	console.log('GOOGLE USER',usr)
			})({'email':gres.emails[0].value});
	 })}))
	.use((req,res,next)=>res.court.permit(req.session)?next():res.court.redirect({'pathname':WWW.gmail.login},{'status':302}))
	.use('/',sstatic(WWW.root.dir,{'index':'home.html'}))
	.use('/sqlite3all',(req,res,next)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).all(query.statement,res.court.send)
	})
	.use('/sqlite3get',(req,res,next)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).get(query.statement,res.court.send)
	})
	.use('/meters',(req,res,next)=>{try{send(req,'meter.csv',{'root':__dirname}).pipe(res)}catch(err){res.court.serr(err)}})
	.use('/meter',(req,res,next)=>{try{
			if(WWW.PINMODE&&(req.query.PIN!=='6318'))throw(new Error('Wrong PIN'));
			(dd=>console.log(new Date(+dd[0]),dd.slice(1)))(req.query.val.split(','));
			fs.appendFileSync(path.join(__dirname,'meter.csv'),req.query.val+'\n')
			res.court.send();
		}catch(err){res.court.serr(err)}})
	.use('/sqlite3insert',connect()
		.use(jsonParser)
		.use((req,res,next)=>{if(req.method == 'POST'){var  query=req.body;if(allowEditTime(req)){
			console.log('sqlite3insert',query)
			if(WWW.PINMODE&&(query.PIN!=='6318'))return res.court.serr('Wrong PIN')
			var	 cc=query.values.length
				,db = new sqlite3.Database(query.db+'.sqlite',sqlite3.OPEN_READWRITE)
				,st = db.prepare(query.statement);
				console.log(query);
				 query.values.forEach(vv=>st.run(vv,end))
			function end(){if(!--cc)query.refresh?db[query.refresh.method](query.refresh.statement,res.court.send):res.court.send()}
			}}else next()})
		)
	.use(...sqlite('court'))
	.use(...sqlite('time.table'))

);
function allowEditTime(req){switch(req.session.user.email){
	case"semenovrv@gmail.com":;
	case"khrushcheva.tandem@gmail.com":return true;
}}
function sqlite(db){return[
	 '/'+(db=db+'.sqlite')
	,(req,res)=>(req.session.user.email=='semenovrv@gmail.com')?send(req,db,{'root':__dirname}).pipe(res):(res.writeHead(404),res.end())
]}



http.listen(WWW.port);
console.log(new Date(),'court running...',WWW.name,GOOGLE)

