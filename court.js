var	 sstatic =	require('serve-static')
	,parseurl =	require('parseurl')
	,qs	=		require('qs')
	,jsonParser=require('body-parser').json()
	,mime =		require('mime')
	,connect =	require('connect')
	,path =		require('path')
	,fs =		require('fs')
	,send =		require('send')
	,sqlite3 =	require('sqlite3').verbose()
	,http =		require('http').Server(connect()//.use((req,res,next)=>{console.log(parseurl(req));next()})
	.use((req,res,next)=>{next()})
	.use(sstatic(path.join(__dirname,'httproot')))
	.use((req,res,next)=>{
		req.query=~req.url.indexOf('?')?qs.parse(parseurl(req).query):{};
		res.court={	 'writeHead':	function(){res.writeHead('200',{'Content-Type':mime.lookup('json')});return res}
					,'end':			data=>{data?res.end(JSON.stringify(data)):res.end()}
					,'send':		function(err,data){if(err)console.log('ERROR',err);res.court.writeHead().court.end(data)}
					,'serr':		err=>{res.writeHead('500',{'Content-Type':mime.lookup('json')});res.court.end(err=err.message||err);process.stderr.write(err.message||JSON.stringify(err))}
					}
		next()
		})
	.use('/sqlite3all',(req,res,next)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).all(query.statement,res.court.send)
	})
	.use('/sqlite3get',(req,res,next)=>{var query=req.query;
		new sqlite3.Database((query.db||'court')+'.sqlite',sqlite3.OPEN_READONLY).get(query.statement,res.court.send)
	})
	.use('/meters',(req,res,next)=>{try{send(req,'meter.csv',{'root':__dirname}).pipe(res)}catch(err){res.court.serr(err)}})
	.use('/meter',(req,res,next)=>{try{
			if(req.query.PIN!=='6318')throw(new Error('Wrong PIN'));
			(dd=>console.log(new Date(+dd[0]),dd.slice(1)))(req.query.val.split(','));
			fs.appendFileSync(path.join(__dirname,'meter.csv'),req.query.val+'\n')
			res.court.send();
		}catch(err){res.court.serr(err)}})
	.use('/sqlite3insert',connect()
		.use(jsonParser)
		.use((req,res,next)=>{if(req.method == 'POST'){var  query=req.body
			if(query.PIN!=='6318')return res.court.serr('Wrong PIN')
			var	 cc=query.values.length
				,db = new sqlite3.Database(query.db+'.sqlite',sqlite3.OPEN_READWRITE)
				,st = db.prepare(query.statement);
				console.log(query);
				 query.values.forEach(vv=>st.run(vv,end))
			function end(){if(!--cc)query.refresh?db[query.refresh.method](query.refresh.statement,res.court.send):res.court.send()}
			}else next()})
		)

);




http.listen(1080);
console.log(new Date(),'court running...')
/*
new require('ws').Server({'server':http}).on('connection',ws=>{
ws  .on('ct_init',	data=>ws.send(JSON.stringify({'type':'ct_init',		'data':data})))
	.on('message',	msg=>{var data=JSON.parse(msg)})
})
*/
